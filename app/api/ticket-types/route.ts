import { NextRequest, NextResponse } from 'next/server'
import { createTicketType } from '@/lib/db/ticket-types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const ticketType = await createTicketType(body)

    return NextResponse.json(ticketType, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket type:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create ticket type' },
      { status: 500 }
    )
  }
}
