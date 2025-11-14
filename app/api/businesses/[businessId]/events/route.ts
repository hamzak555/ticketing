import { NextRequest, NextResponse } from 'next/server'
import { createEvent } from '@/lib/db/events'

interface RouteContext {
  params: Promise<{
    businessId: string
  }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { businessId } = await context.params
    const body = await request.json()

    const {
      title,
      description,
      event_date,
      event_time,
      location,
      image_url,
      ticket_price,
      total_tickets,
      available_tickets,
      status,
    } = body

    // Validate required fields
    if (!title || !event_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the event
    const event = await createEvent({
      business_id: businessId,
      title,
      description: description || null,
      event_date,
      event_time: event_time || null,
      location: location || null,
      image_url: image_url || null,
      ticket_price: ticket_price || null,
      total_tickets: total_tickets || null,
      available_tickets: available_tickets || total_tickets || null,
      status: status || 'draft',
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
