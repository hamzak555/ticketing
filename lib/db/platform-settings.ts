import { createClient } from '@/lib/supabase/server'
import type { PlatformSettings, Database, Business } from '@/lib/types'

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

/**
 * Get the effective fee settings for a business
 * Returns custom settings if enabled, otherwise returns global settings
 */
export async function getBusinessFeeSettings(business: Business): Promise<{
  platform_fee_type: 'flat' | 'percentage' | 'higher_of_both'
  flat_fee_amount: number
  percentage_fee: number
}> {
  if (business.use_custom_fee_settings && business.platform_fee_type) {
    return {
      platform_fee_type: business.platform_fee_type,
      flat_fee_amount: business.flat_fee_amount || 0,
      percentage_fee: business.percentage_fee || 0,
    }
  }

  // Use global settings
  const globalSettings = await getPlatformSettings()
  return {
    platform_fee_type: globalSettings.platform_fee_type,
    flat_fee_amount: globalSettings.flat_fee_amount,
    percentage_fee: globalSettings.percentage_fee,
  }
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
  settings: PlatformSettings | { platform_fee_type: string; flat_fee_amount: number; percentage_fee: number },
  taxableAmountInCents?: number
): number {
  // Use taxable amount (subtotal + tax) if provided for percentage calculations
  // Otherwise fall back to subtotal for backwards compatibility
  const baseAmountForPercentage = taxableAmountInCents || (ticketPrice * quantity * 100)

  switch (settings.platform_fee_type) {
    case 'flat':
      return Math.round(settings.flat_fee_amount * 100) // Convert to cents

    case 'percentage':
      return Math.round(baseAmountForPercentage * (settings.percentage_fee / 100))

    case 'higher_of_both': {
      const flatFee = Math.round(settings.flat_fee_amount * 100)
      const percentageFee = Math.round(baseAmountForPercentage * (settings.percentage_fee / 100))
      return Math.max(flatFee, percentageFee)
    }

    default:
      return 0
  }
}
