import { createClient as createServerClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types'

export type Ticket = Database['public']['Tables']['tickets']['Row']
export type TicketInsert = Database['public']['Tables']['tickets']['Insert']
export type TicketUpdate = Database['public']['Tables']['tickets']['Update']

/**
 * Generate a unique ticket number
 */
export function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `TKT-${timestamp}-${random}`
}

/**
 * Get all tickets for an event
 */
export async function getTicketsByEventId(eventId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('event_id', eventId)
    .order('purchase_date', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get a ticket by ID
 */
export async function getTicketById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Get a ticket by ticket number
 */
export async function getTicketByNumber(ticketNumber: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('ticket_number', ticketNumber)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new ticket
 */
export async function createTicket(ticket: Omit<TicketInsert, 'ticket_number'>) {
  const supabase = await createServerClient()

  const ticketWithNumber = {
    ...ticket,
    ticket_number: generateTicketNumber(),
  }

  const { data, error } = await supabase
    .from('tickets')
    .insert(ticketWithNumber)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Create multiple tickets (bulk purchase)
 */
export async function createTickets(
  eventId: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string | null,
  quantity: number
) {
  const supabase = await createServerClient()

  const tickets: TicketInsert[] = Array.from({ length: quantity }, () => ({
    event_id: eventId,
    ticket_number: generateTicketNumber(),
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
  }))

  const { data, error } = await supabase
    .from('tickets')
    .insert(tickets)
    .select()

  if (error) throw error
  return data
}

/**
 * Update a ticket
 */
export async function updateTicket(id: string, updates: TicketUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Mark ticket as used
 */
export async function markTicketAsUsed(ticketNumber: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('tickets')
    .update({ status: 'used' })
    .eq('ticket_number', ticketNumber)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Cancel a ticket
 */
export async function cancelTicket(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('tickets')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get ticket statistics for an event
 */
export async function getTicketStats(eventId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('tickets')
    .select('status')
    .eq('event_id', eventId)

  if (error) throw error

  const stats = {
    total: data.length,
    valid: data.filter((t) => t.status === 'valid').length,
    used: data.filter((t) => t.status === 'used').length,
    cancelled: data.filter((t) => t.status === 'cancelled').length,
  }

  return stats
}
