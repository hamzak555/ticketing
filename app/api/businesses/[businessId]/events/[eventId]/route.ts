import { NextRequest, NextResponse } from 'next/server'
import { updateEvent, getEventById, deleteEvent } from '@/lib/db/events'
import { hasEventBeenSold } from '@/lib/db/orders'

interface RouteContext {
  params: Promise<{
    businessId: string
    eventId: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { eventId } = await context.params
    const event = await getEventById(eventId)

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { businessId, eventId } = await context.params
    const body = await request.json()

    const {
      title,
      description,
      event_date,
      event_time,
      location,
      location_latitude,
      location_longitude,
      google_place_id,
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

    // Update the event
    const event = await updateEvent(eventId, {
      title,
      description: description !== undefined ? description : undefined,
      event_date,
      event_time: event_time !== undefined ? event_time : undefined,
      location: location !== undefined ? location : undefined,
      location_latitude: location_latitude !== undefined ? location_latitude : undefined,
      location_longitude: location_longitude !== undefined ? location_longitude : undefined,
      google_place_id: google_place_id !== undefined ? google_place_id : undefined,
      image_url: image_url !== undefined ? image_url : undefined,
      ticket_price: ticket_price !== undefined ? ticket_price : undefined,
      total_tickets: total_tickets !== undefined ? total_tickets : undefined,
      available_tickets: available_tickets !== undefined ? available_tickets : undefined,
      status: status !== undefined ? status : undefined,
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { eventId } = await context.params

    // Check if event exists
    const event = await getEventById(eventId)
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if any tickets have been sold
    const hasSales = await hasEventBeenSold(eventId)
    if (hasSales) {
      return NextResponse.json(
        { error: 'Cannot delete event with sold tickets' },
        { status: 400 }
      )
    }

    // Delete the event
    await deleteEvent(eventId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
