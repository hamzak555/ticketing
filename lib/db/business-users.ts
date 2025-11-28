import { createClient as createServerClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types'
import bcrypt from 'bcryptjs'

export type BusinessUser = Database['public']['Tables']['business_users']['Row']
export type BusinessUserInsert = Database['public']['Tables']['business_users']['Insert']
export type BusinessUserUpdate = Database['public']['Tables']['business_users']['Update']

/**
 * Get all users for a business
 */
export async function getBusinessUsers(businessId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('business_users')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get a business user by ID
 */
export async function getBusinessUserById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('business_users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Get a business user by email and business ID
 */
export async function getBusinessUserByEmail(businessId: string, email: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('business_users')
    .select('*')
    .eq('business_id', businessId)
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return data
}

/**
 * Create a new business user
 */
export async function createBusinessUser(user: Omit<BusinessUserInsert, 'password_hash'> & { password: string }) {
  const supabase = await createServerClient()

  // Hash the password
  const password_hash = await bcrypt.hash(user.password, 10)

  const { password, ...userData } = user

  const { data, error } = await supabase
    .from('business_users')
    .insert({
      ...userData,
      password_hash,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a business user
 */
export async function updateBusinessUser(
  id: string,
  updates: Partial<Omit<BusinessUserInsert, 'password_hash'> & { password?: string }>
) {
  const supabase = await createServerClient()

  let updateData: any = { ...updates }

  // If password is being updated, hash it
  if (updates.password) {
    updateData.password_hash = await bcrypt.hash(updates.password, 10)
    delete updateData.password
  }

  const { data, error } = await supabase
    .from('business_users')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a business user
 */
export async function deleteBusinessUser(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('business_users')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Verify a business user's password
 */
export async function verifyBusinessUserPassword(businessId: string, email: string, password: string) {
  const user = await getBusinessUserByEmail(businessId, email)

  if (!user || !user.is_active) {
    return null
  }

  const isValid = await bcrypt.compare(password, user.password_hash)

  if (!isValid) {
    return null
  }

  return user
}
