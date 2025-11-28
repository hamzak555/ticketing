import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params
    const supabase = await createClient()

    console.log('[Scan API] Attempting to scan ticket:', ticketId)

    // First, get the current ticket state
    const { data: beforeTicket, error: fetchError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single()

    if (fetchError || !beforeTicket) {
      console.error('[Scan API] Ticket not found:', fetchError)
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    console.log('[Scan API] Ticket before update:', beforeTicket)

    // Check if ticket is invalid (voided)
    if (beforeTicket.status === 'invalid') {
      console.log('[Scan API] Ticket is invalid/voided')
      return NextResponse.json(
        { error: 'This ticket has been voided and cannot be scanned' },
        { status: 400 }
      )
    }

    // Check if ticket is already used
    if (beforeTicket.status === 'used' || beforeTicket.checked_in_at) {
      console.log('[Scan API] Ticket already scanned')
      return NextResponse.json(
        { error: 'This ticket has already been scanned' },
        { status: 400 }
      )
    }

    // Update the ticket to mark it as scanned
    const updateData = {
      checked_in_at: new Date().toISOString(),
      status: 'used'
    }

    console.log('[Scan API] Update data:', updateData)

    const { data: ticket, error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single()

    if (error) {
      console.error('[Scan API] Error marking ticket as scanned:', error)
      return NextResponse.json(
        { error: 'Failed to mark ticket as scanned', details: error },
        { status: 500 }
      )
    }

    console.log('[Scan API] Ticket after update:', ticket)

    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error('[Scan API] Error in scan route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
