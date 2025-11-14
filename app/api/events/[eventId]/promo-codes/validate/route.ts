import { NextRequest, NextResponse } from 'next/server'
import { validatePromoCode } from '@/lib/db/promo-codes'

interface RouteContext {
  params: Promise<{
    eventId: string
  }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { eventId } = await context.params
    const body = await request.json()
    const { code, ticketTypeId } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Promo code is required' },
        { status: 400 }
      )
    }

    const result = await validatePromoCode(code, eventId, ticketTypeId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error validating promo code:', error)
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    )
  }
}
