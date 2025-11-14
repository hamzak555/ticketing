import { NextRequest, NextResponse } from 'next/server'
import { getTicketType, updateTicketType, deleteTicketType } from '@/lib/db/ticket-types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ticketType = await getTicketType(id)

    if (!ticketType) {
      return NextResponse.json(
        { error: 'Ticket type not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(ticketType)
  } catch (error) {
    console.error('Error fetching ticket type:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticket type' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const ticketType = await updateTicketType(id, body)

    return NextResponse.json(ticketType)
  } catch (error) {
    console.error('Error updating ticket type:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update ticket type' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteTicketType(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ticket type:', error)
    return NextResponse.json(
      { error: 'Failed to delete ticket type' },
      { status: 500 }
    )
  }
}
