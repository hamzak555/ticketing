import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTicketTypes } from '@/lib/db/ticket-types'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ businessSlug: string; eventId: string }> }
) {
  try {
    const { businessSlug, eventId } = await context.params
    const supabase = await createClient()

    // Get business by slug
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', businessSlug)
      .single()

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Get event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('business_id', business.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Get ticket types for this event
    const ticketTypes = await getTicketTypes(eventId)

    return NextResponse.json({
      event,
      business,
      ticketTypes: ticketTypes.filter(tt => tt.is_active),
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}
