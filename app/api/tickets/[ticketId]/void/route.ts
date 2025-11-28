import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await context.params
    const supabase = await createClient()

    // Get the ticket to verify it exists
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, status, ticket_number')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Check if ticket is already invalid
    if (ticket.status === 'invalid') {
      return NextResponse.json(
        { error: 'Ticket is already marked as invalid' },
        { status: 400 }
      )
    }

    // Update ticket status to invalid
    const { data: updatedTicket, error: updateError } = await supabase
      .from('tickets')
      .update({ status: 'invalid' })
      .eq('id', ticketId)
      .select()
      .single()

    if (updateError) {
      console.error('Error voiding ticket:', updateError)
      return NextResponse.json(
        { error: 'Failed to void ticket' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
    })
  } catch (error) {
    console.error('Error voiding ticket:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to void ticket' },
      { status: 500 }
    )
  }
}
