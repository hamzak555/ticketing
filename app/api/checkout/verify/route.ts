import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if order already exists
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', session.id)
      .single()

    if (existingOrder) {
      // Order already processed, return details
      return NextResponse.json({
        orderNumber: existingOrder.order_number,
        eventTitle: session.metadata?.eventTitle || 'Event',
        quantity: existingOrder.order_items?.[0]?.quantity || parseInt(session.metadata?.quantity || '1'),
        total: session.amount_total,
        customerEmail: session.customer_email || session.metadata?.customerEmail,
      })
    }

    // If order doesn't exist, it means webhook hasn't processed yet
    // Return basic info from session
    return NextResponse.json({
      orderNumber: session.id,
      eventTitle: session.metadata?.eventTitle || 'Event',
      quantity: parseInt(session.metadata?.quantity || '1'),
      total: session.amount_total,
      customerEmail: session.customer_email || session.metadata?.customerEmail,
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
