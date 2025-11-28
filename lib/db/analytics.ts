import { createClient } from '@/lib/supabase/server'

export interface EventAnalytics {
  event_id: string
  event_title: string
  event_date: string
  event_status: string
  total_orders: number
  total_tickets_sold: number
  total_revenue: number
}

export interface BusinessAnalytics {
  total_revenue: number
  total_tax_collected: number
  total_tickets_sold: number
  total_orders: number
  events: EventAnalytics[]
}

export async function getBusinessAnalytics(businessId: string): Promise<BusinessAnalytics> {
  const supabase = await createClient()

  // Get all completed orders for this business's events
  // Include fee fields to calculate net revenue (what business actually receives)
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      event_id,
      quantity,
      total,
      tax_amount,
      platform_fee,
      stripe_fee,
      status,
      event:events!inner (
        id,
        title,
        event_date,
        status,
        business_id
      )
    `)
    .eq('event.business_id', businessId)
    .eq('status', 'completed')

  if (error) {
    console.error('Error fetching analytics:', error)
    throw new Error('Failed to fetch analytics data')
  }

  if (!orders || orders.length === 0) {
    return {
      total_revenue: 0,
      total_tax_collected: 0,
      total_tickets_sold: 0,
      total_orders: 0,
      events: []
    }
  }

  // Aggregate by event
  const eventMap = new Map<string, EventAnalytics>()
  let total_tax_collected = 0

  for (const order of orders) {
    const event = Array.isArray(order.event) ? order.event[0] : order.event

    if (!event) continue

    const eventId = event.id

    if (!eventMap.has(eventId)) {
      eventMap.set(eventId, {
        event_id: eventId,
        event_title: event.title,
        event_date: event.event_date,
        event_status: event.status,
        total_orders: 0,
        total_tickets_sold: 0,
        total_revenue: 0,
      })
    }

    // Calculate net revenue for the business (what they actually receive)
    // Business receives: total charged - platform_fee - stripe_fee
    // This is what gets transferred to the business's Stripe account
    const total = parseFloat(order.total?.toString() || '0')
    const taxAmount = parseFloat(order.tax_amount?.toString() || '0')
    const platformFee = parseFloat(order.platform_fee?.toString() || '0')
    const stripeFee = parseFloat(order.stripe_fee?.toString() || '0')

    // Net revenue = total charged minus all fees kept by platform/Stripe
    const netRevenue = total - platformFee - stripeFee

    // Track tax collected
    total_tax_collected += taxAmount

    const analytics = eventMap.get(eventId)!
    analytics.total_orders += 1
    analytics.total_tickets_sold += order.quantity
    analytics.total_revenue += netRevenue
  }

  // Calculate totals
  const eventAnalytics = Array.from(eventMap.values())
  const total_revenue = eventAnalytics.reduce((sum, e) => sum + e.total_revenue, 0)
  const total_tickets_sold = eventAnalytics.reduce((sum, e) => sum + e.total_tickets_sold, 0)
  const total_orders = eventAnalytics.reduce((sum, e) => sum + e.total_orders, 0)

  return {
    total_revenue,
    total_tax_collected,
    total_tickets_sold,
    total_orders,
    events: eventAnalytics.sort((a, b) => b.total_revenue - a.total_revenue), // Sort by revenue
  }
}
