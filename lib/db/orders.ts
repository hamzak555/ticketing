import { createClient } from '@/lib/supabase/server'

export interface Order {
  id: string
  order_number: string
  event_id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  total: number
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  created_at: string
  event_title: string
  event_date: string
  payment_intent_id?: string
}

export async function getOrdersByBusinessId(businessId: string): Promise<Order[]> {
  const supabase = await createClient()

  // Get all orders for events belonging to this business
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      events!inner (
        id,
        title,
        event_date,
        business_id
      )
    `)
    .eq('events.business_id', businessId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return [] // Return empty array instead of throwing
  }

  if (!data) {
    return []
  }

  return data.map((order: any) => ({
    id: order.id,
    order_number: order.order_number,
    event_id: order.event_id,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    total: order.total,
    status: order.status,
    created_at: order.created_at,
    event_title: order.events.title,
    event_date: order.events.event_date,
  }))
}

export async function getOrderById(orderId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      events (
        id,
        title,
        event_date,
        event_time,
        location,
        business_id
      )
    `)
    .eq('id', orderId)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    throw new Error('Failed to fetch order')
  }

  return data
}

export async function hasEventBeenSold(eventId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('id')
    .eq('event_id', eventId)
    .limit(1)

  if (error) {
    console.error('Error checking event sales:', error)
    return false
  }

  return data && data.length > 0
}
