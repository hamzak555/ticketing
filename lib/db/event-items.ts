import { createClient } from '@/lib/supabase/server'
import type { EventItem, Database } from '@/lib/types'

export async function getEventItems(eventId: string): Promise<EventItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event_items')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch event items: ${error.message}`)
  }

  return data || []
}

export async function getEventItemById(itemId: string): Promise<EventItem> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event_items')
    .select('*')
    .eq('id', itemId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch event item: ${error.message}`)
  }

  return data
}

export async function createEventItem(
  item: Database['public']['Tables']['event_items']['Insert']
): Promise<EventItem> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event_items')
    .insert(item)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create event item: ${error.message}`)
  }

  return data
}

export async function updateEventItem(
  itemId: string,
  updates: Database['public']['Tables']['event_items']['Update']
): Promise<EventItem> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update event item: ${error.message}`)
  }

  return data
}

export async function deleteEventItem(itemId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('event_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    throw new Error(`Failed to delete event item: ${error.message}`)
  }
}

export async function updateItemStock(itemId: string, quantityChange: number): Promise<EventItem> {
  const supabase = await createClient()

  // Get current stock
  const { data: item } = await supabase
    .from('event_items')
    .select('available_quantity')
    .eq('id', itemId)
    .single()

  if (!item) {
    throw new Error('Event item not found')
  }

  const newQuantity = item.available_quantity + quantityChange

  if (newQuantity < 0) {
    throw new Error('Insufficient stock')
  }

  const { data, error } = await supabase
    .from('event_items')
    .update({ available_quantity: newQuantity })
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update item stock: ${error.message}`)
  }

  return data
}
