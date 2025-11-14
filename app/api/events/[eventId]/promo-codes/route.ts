import { NextRequest, NextResponse } from 'next/server'
import { createPromoCode, getPromoCodesByEventId, type PromoCodeInsert } from '@/lib/db/promo-codes'

interface RouteContext {
  params: Promise<{
    eventId: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { eventId } = await context.params
    const promoCodes = await getPromoCodesByEventId(eventId)

    return NextResponse.json(promoCodes)
  } catch (error) {
    console.error('Error fetching promo codes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promo codes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { eventId } = await context.params
    const body = await request.json()

    const promoCodeData: PromoCodeInsert = {
      event_id: eventId,
      code: body.code,
      discount_type: body.discount_type,
      discount_value: body.discount_value,
      max_uses: body.max_uses || null,
      valid_from: body.valid_from || null,
      valid_until: body.valid_until || null,
      is_active: body.is_active ?? true,
      ticket_type_ids: body.ticket_type_ids || null,
    }

    const promoCode = await createPromoCode(promoCodeData)

    return NextResponse.json(promoCode, { status: 201 })
  } catch (error) {
    console.error('Error creating promo code:', error)
    return NextResponse.json(
      { error: 'Failed to create promo code' },
      { status: 500 }
    )
  }
}
