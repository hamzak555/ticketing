import { NextRequest, NextResponse } from 'next/server'
import { getPromoCodeById, updatePromoCode, type PromoCodeInsert } from '@/lib/db/promo-codes'

interface RouteContext {
  params: Promise<{
    eventId: string
    promoCodeId: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { promoCodeId } = await context.params
    const promoCode = await getPromoCodeById(promoCodeId)

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(promoCode)
  } catch (error) {
    console.error('Error fetching promo code:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promo code' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { promoCodeId } = await context.params
    const body = await request.json()

    const updates: Partial<PromoCodeInsert> = {
      code: body.code,
      discount_type: body.discount_type,
      discount_value: body.discount_value,
      max_uses: body.max_uses || null,
      valid_from: body.valid_from || null,
      valid_until: body.valid_until || null,
      is_active: body.is_active,
      ticket_type_ids: body.ticket_type_ids || null,
    }

    const promoCode = await updatePromoCode(promoCodeId, updates)

    return NextResponse.json(promoCode)
  } catch (error) {
    console.error('Error updating promo code:', error)
    return NextResponse.json(
      { error: 'Failed to update promo code' },
      { status: 500 }
    )
  }
}
