import { NextRequest, NextResponse } from 'next/server'
import { createEventItem } from '@/lib/db/event-items'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ businessId: string; eventId: string }> }
) {
  try {
    const { eventId } = await context.params
    const body = await request.json()

    const { name, description, category, price, total_quantity, available_quantity } = body

    if (!name || !category || price === undefined || !total_quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (price < 0 || total_quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid price or quantity values' },
        { status: 400 }
      )
    }

    const item = await createEventItem({
      event_id: eventId,
      name,
      description: description || null,
      category,
      price,
      total_quantity,
      available_quantity: available_quantity || total_quantity,
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating event item:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create item' },
      { status: 500 }
    )
  }
}
