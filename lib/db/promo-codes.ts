import { createClient as createServerClient } from '@/lib/supabase/server'

export interface PromoCode {
  id: string
  event_id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses: number | null
  current_uses: number
  valid_from: string | null
  valid_until: string | null
  is_active: boolean
  created_at: string
  ticket_type_ids: string[] | null // Array of ticket type IDs this promo applies to
}

export interface PromoCodeInsert {
  event_id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses?: number | null
  valid_from?: string | null
  valid_until?: string | null
  is_active?: boolean
  ticket_type_ids?: string[] | null
}

/**
 * Get all promo codes for an event
 */
export async function getPromoCodesByEventId(eventId: string): Promise<PromoCode[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching promo codes:', error)
    throw new Error('Failed to fetch promo codes')
  }

  return data || []
}

/**
 * Get a promo code by ID
 */
export async function getPromoCodeById(id: string): Promise<PromoCode | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // No matching promo code found
    }
    console.error('Error fetching promo code:', error)
    throw new Error('Failed to fetch promo code')
  }

  return data
}

/**
 * Get a promo code by code and event ID
 */
export async function getPromoCodeByCode(code: string, eventId: string): Promise<PromoCode | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('event_id', eventId)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // No matching promo code found
    }
    console.error('Error fetching promo code:', error)
    throw new Error('Failed to fetch promo code')
  }

  return data
}

/**
 * Validate a promo code
 */
export async function validatePromoCode(
  code: string,
  eventId: string,
  ticketTypeId?: string
): Promise<{ valid: boolean; message?: string; promoCode?: PromoCode }> {
  const promoCode = await getPromoCodeByCode(code, eventId)

  if (!promoCode) {
    return { valid: false, message: 'Invalid promo code' }
  }

  // Check if promo code is active
  if (!promoCode.is_active) {
    return { valid: false, message: 'This promo code is no longer active' }
  }

  // Check max uses
  if (promoCode.max_uses !== null && promoCode.current_uses >= promoCode.max_uses) {
    return { valid: false, message: 'This promo code has reached its usage limit' }
  }

  // Check valid_from date
  if (promoCode.valid_from) {
    const validFrom = new Date(promoCode.valid_from)
    if (new Date() < validFrom) {
      return { valid: false, message: 'This promo code is not yet valid' }
    }
  }

  // Check valid_until date
  if (promoCode.valid_until) {
    const validUntil = new Date(promoCode.valid_until)
    if (new Date() > validUntil) {
      return { valid: false, message: 'This promo code has expired' }
    }
  }

  // Check if promo code applies to the selected ticket type
  if (ticketTypeId && promoCode.ticket_type_ids && promoCode.ticket_type_ids.length > 0) {
    if (!promoCode.ticket_type_ids.includes(ticketTypeId)) {
      return { valid: false, message: 'This promo code is not valid for the selected ticket type' }
    }
  }

  return { valid: true, promoCode }
}

/**
 * Create a new promo code
 */
export async function createPromoCode(promoCode: PromoCodeInsert): Promise<PromoCode> {
  const supabase = await createServerClient()

  // Convert code to uppercase
  const codeData = {
    ...promoCode,
    code: promoCode.code.toUpperCase(),
  }

  const { data, error } = await supabase
    .from('promo_codes')
    .insert(codeData)
    .select()
    .single()

  if (error) {
    console.error('Error creating promo code:', error)
    throw new Error('Failed to create promo code')
  }

  return data
}

/**
 * Update a promo code
 */
export async function updatePromoCode(
  id: string,
  updates: Partial<PromoCodeInsert>
): Promise<PromoCode> {
  const supabase = await createServerClient()

  // Convert code to uppercase if it's being updated
  const updateData = updates.code
    ? { ...updates, code: updates.code.toUpperCase() }
    : updates

  const { data, error } = await supabase
    .from('promo_codes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating promo code:', error)
    throw new Error('Failed to update promo code')
  }

  return data
}

/**
 * Delete a promo code
 */
export async function deletePromoCode(id: string): Promise<void> {
  const supabase = await createServerClient()
  const { error } = await supabase.from('promo_codes').delete().eq('id', id)

  if (error) {
    console.error('Error deleting promo code:', error)
    throw new Error('Failed to delete promo code')
  }
}

/**
 * Increment promo code usage
 */
export async function incrementPromoCodeUsage(id: string): Promise<void> {
  const supabase = await createServerClient()
  const { error } = await supabase.rpc('increment_promo_code_usage', { promo_code_id: id })

  if (error) {
    console.error('Error incrementing promo code usage:', error)
    throw new Error('Failed to increment promo code usage')
  }
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(
  promoCode: PromoCode,
  ticketPrice: number,
  quantity: number
): number {
  const subtotal = ticketPrice * quantity

  if (promoCode.discount_type === 'percentage') {
    return (subtotal * promoCode.discount_value) / 100
  } else {
    // Fixed discount
    return Math.min(promoCode.discount_value, subtotal)
  }
}
