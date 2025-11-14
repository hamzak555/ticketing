import { NextRequest, NextResponse } from 'next/server'
import { getTicketTypes } from '@/lib/db/ticket-types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const ticketTypes = await getTicketTypes(eventId)

    return NextResponse.json(ticketTypes)
  } catch (error) {
    console.error('Error fetching ticket types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticket types' },
      { status: 500 }
    )
  }
}
