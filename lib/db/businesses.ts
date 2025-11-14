import { createClient as createServerClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types'

export type Business = Database['public']['Tables']['businesses']['Row']
export type BusinessInsert = Database['public']['Tables']['businesses']['Insert']
export type BusinessUpdate = Database['public']['Tables']['businesses']['Update']

/**
 * Get all businesses
 */
export async function getBusinesses() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get a business by slug
 */
export async function getBusinessBySlug(slug: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

/**
 * Get a business by ID
 */
export async function getBusinessById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new business
 */
export async function createBusiness(business: BusinessInsert) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('businesses')
    .insert(business)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a business
 */
export async function updateBusiness(id: string, updates: BusinessUpdate) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a business
 */
export async function deleteBusiness(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Check if a slug is available
 */
export async function isSlugAvailable(slug: string, excludeId?: string) {
  const supabase = await createServerClient()
  let query = supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query.maybeSingle()

  if (error) throw error
  return data === null
}
