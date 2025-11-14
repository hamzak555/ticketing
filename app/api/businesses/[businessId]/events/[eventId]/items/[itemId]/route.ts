import { NextRequest, NextResponse } from 'next/server'
import { updateEventItem, deleteEventItem } from '@/lib/db/event-items'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ businessId: string; eventId: string; itemId: string }> }
) {
  try {
    const { itemId } = await context.params
    const body = await request.json()

    const updates: Record<string, unknown> = {}

    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.category !== undefined) updates.category = body.category
    if (body.price !== undefined) {
      if (body.price < 0) {
        return NextResponse.json({ error: 'Price cannot be negative' }, { status: 400 })
      }
      updates.price = body.price
    }
    if (body.total_quantity !== undefined) {
      if (body.total_quantity < 1) {
        return NextResponse.json({ error: 'Total quantity must be at least 1' }, { status: 400 })
      }
      updates.total_quantity = body.total_quantity
    }
    if (body.available_quantity !== undefined) {
      if (body.available_quantity < 0) {
        return NextResponse.json({ error: 'Available quantity cannot be negative' }, { status: 400 })
      }
      updates.available_quantity = body.available_quantity
    }

    const item = await updateEventItem(itemId, updates)

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating event item:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ businessId: string; eventId: string; itemId: string }> }
) {
  try {
    const { itemId } = await context.params

    await deleteEventItem(itemId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event item:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete item' },
      { status: 500 }
    )
  }
}
