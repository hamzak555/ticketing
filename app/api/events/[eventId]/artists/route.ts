import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{
    eventId: string
  }>
}

// GET all artists for an event
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { eventId } = await context.params
    const supabase = await createClient()

    const { data: artists, error } = await supabase
      .from('event_artists')
      .select('*')
      .eq('event_id', eventId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching artists:', error)
      return NextResponse.json(
        { error: 'Failed to fetch artists' },
        { status: 500 }
      )
    }

    return NextResponse.json(artists || [])
  } catch (error) {
    console.error('Error fetching artists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artists' },
      { status: 500 }
    )
  }
}

// POST create a new artist
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { eventId } = await context.params
    const body = await request.json()
    const supabase = await createClient()

    const { name, photo_url } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Artist name is required' },
        { status: 400 }
      )
    }

    // Get the current max display_order
    const { data: existingArtists } = await supabase
      .from('event_artists')
      .select('display_order')
      .eq('event_id', eventId)
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = existingArtists && existingArtists.length > 0
      ? (existingArtists[0].display_order || 0) + 1
      : 0

    const { data: artist, error } = await supabase
      .from('event_artists')
      .insert({
        event_id: eventId,
        name,
        photo_url: photo_url || null,
        display_order: nextOrder,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating artist:', error)
      return NextResponse.json(
        { error: 'Failed to create artist' },
        { status: 500 }
      )
    }

    return NextResponse.json(artist)
  } catch (error) {
    console.error('Error creating artist:', error)
    return NextResponse.json(
      { error: 'Failed to create artist' },
      { status: 500 }
    )
  }
}
