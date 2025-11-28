import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{
    eventId: string
    artistId: string
  }>
}

// PATCH update an artist
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { eventId, artistId } = await context.params
    const body = await request.json()
    const supabase = await createClient()

    const { name, photo_url, display_order } = body

    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (photo_url !== undefined) updateData.photo_url = photo_url
    if (display_order !== undefined) updateData.display_order = display_order

    const { data: artist, error } = await supabase
      .from('event_artists')
      .update(updateData)
      .eq('id', artistId)
      .eq('event_id', eventId)
      .select()
      .single()

    if (error) {
      console.error('Error updating artist:', error)
      return NextResponse.json(
        { error: 'Failed to update artist' },
        { status: 500 }
      )
    }

    return NextResponse.json(artist)
  } catch (error) {
    console.error('Error updating artist:', error)
    return NextResponse.json(
      { error: 'Failed to update artist' },
      { status: 500 }
    )
  }
}

// DELETE an artist
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { eventId, artistId } = await context.params
    const supabase = await createClient()

    const { error } = await supabase
      .from('event_artists')
      .delete()
      .eq('id', artistId)
      .eq('event_id', eventId)

    if (error) {
      console.error('Error deleting artist:', error)
      return NextResponse.json(
        { error: 'Failed to delete artist' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting artist:', error)
    return NextResponse.json(
      { error: 'Failed to delete artist' },
      { status: 500 }
    )
  }
}
