import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { getBusinessFeeSettings, calculatePlatformFee } from '@/lib/db/platform-settings'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, quantity, customerName, customerEmail, customerPhone } = body

    if (!eventId || !quantity || !customerName || !customerEmail) {
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

    // Check ticket availability
    if (event.available_tickets < quantity) {
      return NextResponse.json(
        { error: 'Not enough tickets available' },
        { status: 400 }
      )
    }

    const unitAmount = Math.round(event.ticket_price * 100) // Convert to cents
    const totalAmount = unitAmount * quantity

    // Calculate tax
    const taxPercentage = event.businesses.tax_percentage || 0
    const taxInCents = Math.round((totalAmount * taxPercentage) / 100)

    // Get business-specific fee settings (custom or global) and calculate application fee
    // Platform fee should be calculated on the amount INCLUDING tax
    const feeSettings = await getBusinessFeeSettings(event.businesses)
    const taxableAmountWithTaxInCents = totalAmount + taxInCents
    const applicationFee = calculatePlatformFee(
      event.ticket_price,
      quantity,
      feeSettings,
      taxableAmountWithTaxInCents
    )

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: event.title,
              description: event.description || `Ticket for ${event.title}`,
              images: event.image_url ? [event.image_url] : [],
            },
            unit_amount: unitAmount,
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${event.businesses.slug}/events/${eventId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${event.businesses.slug}/events/${eventId}/checkout`,
      customer_email: customerEmail,
      metadata: {
        eventId: event.id,
        businessId: event.business_id,
        quantity: quantity.toString(),
        customerName,
        customerEmail,
        customerPhone: customerPhone || '',
      },
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: event.businesses.stripe_account_id,
        },
        metadata: {
          eventId: event.id,
          businessId: event.business_id,
          quantity: quantity.toString(),
          customerName,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout session error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
