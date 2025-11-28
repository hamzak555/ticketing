import { createClient } from '@/lib/supabase/server'

export interface Customer {
  id: string // Using email or phone as unique identifier
  name: string
  email: string | null
  phone: string | null
  total_orders: number
  total_spent: number
  first_purchase: string
  last_purchase: string
}

export async function getCustomersByBusinessId(businessId: string): Promise<Customer[]> {
  const supabase = await createClient()

  // Get all orders for this business's events
  // Include fee fields to calculate net revenue (what business actually receives)
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      customer_name,
      customer_email,
      customer_phone,
      total,
      platform_fee,
      stripe_fee,
      created_at,
      event:events!inner (
        business_id
      )
    `)
    .eq('event.business_id', businessId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders for customers:', error)
    throw new Error('Failed to fetch customer data')
  }

  if (!orders || orders.length === 0) {
    return []
  }

  // Deduplicate and aggregate customers by email or phone
  const customerMap = new Map<string, Customer>()

  for (const order of orders) {
    // Create a unique key based on email or phone (prioritize email)
    const uniqueKey = order.customer_email?.toLowerCase() || order.customer_phone || `unique-${order.id}`

    // Calculate net revenue (what business receives: total - fees)
    const total = parseFloat(order.total?.toString() || '0')
    const platformFee = parseFloat(order.platform_fee?.toString() || '0')
    const stripeFee = parseFloat(order.stripe_fee?.toString() || '0')
    const netRevenue = total - platformFee - stripeFee

    if (customerMap.has(uniqueKey)) {
      // Update existing customer
      const customer = customerMap.get(uniqueKey)!
      customer.total_orders += 1
      customer.total_spent += netRevenue

      // Update to most recent name if this order is newer
      if (new Date(order.created_at) > new Date(customer.last_purchase)) {
        customer.name = order.customer_name
        customer.last_purchase = order.created_at
      }

      // Update first purchase if this order is older
      if (new Date(order.created_at) < new Date(customer.first_purchase)) {
        customer.first_purchase = order.created_at
      }

      // Merge email and phone if one was missing
      if (!customer.email && order.customer_email) {
        customer.email = order.customer_email
      }
      if (!customer.phone && order.customer_phone) {
        customer.phone = order.customer_phone
      }
    } else {
      // Create new customer entry
      customerMap.set(uniqueKey, {
        id: uniqueKey,
        name: order.customer_name,
        email: order.customer_email || null,
        phone: order.customer_phone || null,
        total_orders: 1,
        total_spent: netRevenue,
        first_purchase: order.created_at,
        last_purchase: order.created_at,
      })
    }
  }

  // Convert map to array and sort by total spent (descending)
  return Array.from(customerMap.values()).sort((a, b) => b.total_spent - a.total_spent)
}
