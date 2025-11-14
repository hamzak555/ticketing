import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { getPlatformSettings, calculatePlatformFee } from '@/lib/db/platform-settings'
import { getTicketType } from '@/lib/db/ticket-types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      eventId,
      quantity, // For legacy single-price tickets
      ticketSelections, // For multiple ticket types: [{ticketTypeId, quantity}]
      customerName,
      customerEmail,
      customerPhone
    } = body

    if (!eventId || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*, businesses(*)')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if business has Stripe connected
    if (!event.businesses.stripe_account_id || !event.businesses.stripe_onboarding_complete) {
      return NextResponse.json(
        { error: 'Payment processing not available for this event' },
        { status: 400 }
      )
    }

    let totalAmount = 0
    let totalTickets = 0
    let description = ''
    let ticketTypeMetadata: any = {}

    // Handle multiple ticket types
    if (ticketSelections && Array.isArray(ticketSelections)) {
      for (const selection of ticketSelections) {
        const ticketType = await getTicketType(selection.ticketTypeId)

        if (!ticketType) {
          return NextResponse.json(
            { error: `Ticket type not found: ${selection.ticketTypeId}` },
            { status: 404 }
          )
        }

        if (!ticketType.is_active) {
          return NextResponse.json(
            { error: `Ticket type "${ticketType.name}" is not available` },
            { status: 400 }
          )
        }

        if (ticketType.available_quantity < selection.quantity) {
          return NextResponse.json(
            { error: `Not enough "${ticketType.name}" tickets available` },
            { status: 400 }
          )
        }

        const ticketTotal = Math.round(ticketType.price * 100) * selection.quantity
        totalAmount += ticketTotal
        totalTickets += selection.quantity

        // Store ticket type selections in metadata
        ticketTypeMetadata[ticketType.id] = {
          name: ticketType.name,
          price: ticketType.price,
          quantity: selection.quantity
        }
      }

      description = `${totalTickets} ticket${totalTickets > 1 ? 's' : ''} for ${event.title}`
    }
    // Handle legacy single-price tickets
    else if (quantity) {
      if (event.available_tickets < quantity) {
        return NextResponse.json(
          { error: 'Not enough tickets available' },
          { status: 400 }
        )
      }

      const unitAmount = Math.round(event.ticket_price * 100)
      totalAmount = unitAmount * quantity
      totalTickets = quantity
      description = `${quantity}x ${event.title}`
    } else {
      return NextResponse.json(
        { error: 'No tickets selected' },
        { status: 400 }
      )
    }

    // Get platform settings and calculate application fee
    const platformSettings = await getPlatformSettings()
    const subtotalInDollars = totalAmount / 100
    const applicationFee = Math.round(
      calculatePlatformFee(subtotalInDollars / totalTickets, totalTickets, platformSettings)
    )

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: event.businesses.stripe_account_id,
      },
      metadata: {
        eventId: event.id,
        businessId: event.business_id,
        totalTickets: totalTickets.toString(),
        customerName,
        customerEmail,
        customerPhone: customerPhone || '',
        // Store ticket type information if applicable
        ...(ticketSelections ? {
          ticketTypes: JSON.stringify(ticketTypeMetadata),
          hasTicketTypes: 'true'
        } : {
          quantity: quantity.toString(),
          hasTicketTypes: 'false'
        })
      },
      description,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    })
  } catch (error) {
    console.error('Payment intent error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
