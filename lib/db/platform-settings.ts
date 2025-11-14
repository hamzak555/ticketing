import { createClient } from '@/lib/supabase/server'
import type { PlatformSettings, Database } from '@/lib/types'

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('platform_settings')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    throw new Error(`Failed to fetch platform settings: ${error.message}`)
  }

  return data
}

export async function updatePlatformSettings(
  updates: Database['public']['Tables']['platform_settings']['Update']
): Promise<PlatformSettings> {
  const supabase = await createClient()

  // Get the current settings to get the ID
  const current = await getPlatformSettings()

  const { data, error } = await supabase
    .from('platform_settings')
    .update(updates)
    .eq('id', current.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update platform settings: ${error.message}`)
  }

  return data
}

export function calculatePlatformFee(
  ticketPrice: number,
  quantity: number,
  settings: PlatformSettings
): number {
  const subtotal = ticketPrice * quantity * 100 // Convert to cents

  switch (settings.platform_fee_type) {
    case 'flat':
      return Math.round(settings.flat_fee_amount * 100) // Convert to cents

    case 'percentage':
      return Math.round(subtotal * (settings.percentage_fee / 100))

    case 'higher_of_both': {
      const flatFee = Math.round(settings.flat_fee_amount * 100)
      const percentageFee = Math.round(subtotal * (settings.percentage_fee / 100))
      return Math.max(flatFee, percentageFee)
    }

    default:
      return 0
  }
}
