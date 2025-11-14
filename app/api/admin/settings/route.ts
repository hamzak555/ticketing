import { NextRequest, NextResponse } from 'next/server'
import { getPlatformSettings, updatePlatformSettings } from '@/lib/db/platform-settings'

export async function GET() {
  try {
    const settings = await getPlatformSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching platform settings:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform_fee_type, flat_fee_amount, percentage_fee, platform_stripe_account_id } = body

    if (!platform_fee_type) {
      return NextResponse.json(
        { error: 'Platform fee type is required' },
        { status: 400 }
      )
    }

    if (flat_fee_amount === undefined || percentage_fee === undefined) {
      return NextResponse.json(
        { error: 'Fee amounts are required' },
        { status: 400 }
      )
    }

    const settings = await updatePlatformSettings({
      platform_fee_type,
      flat_fee_amount,
      percentage_fee,
      platform_stripe_account_id,
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating platform settings:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update settings' },
      { status: 500 }
    )
  }
}
