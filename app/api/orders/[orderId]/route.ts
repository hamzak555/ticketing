import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const supabase = await createClient()

    // Get order with event details
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        events (
          id,
          title,
          event_date,
          event_time,
          location,
          image_url
        )
      `)
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Format response to match the structure expected by success page
    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      eventTitle: order.events.title,
      eventDate: order.events.event_date,
      eventTime: order.events.event_time,
      eventLocation: order.events.location,
      eventImageUrl: order.events.image_url,
      quantity: order.quantity,
      amount: order.total,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    )
  }
}
