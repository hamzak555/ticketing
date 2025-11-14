import { NextResponse } from 'next/server'
import { getPlatformSettings } from '@/lib/db/platform-settings'

export async function GET() {
  try {
    const settings = await getPlatformSettings()

    // Only return the fee-related settings, not sensitive data
    return NextResponse.json({
      platform_fee_type: settings.platform_fee_type,
      flat_fee_amount: settings.flat_fee_amount,
      percentage_fee: settings.percentage_fee,
    })
  } catch (error) {
    console.error('Error fetching platform settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch platform settings' },
      { status: 500 }
    )
  }
}
