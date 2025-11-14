import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEventById } from '@/lib/db/events'
import { Button } from '@/components/ui/button'
import { EventItemForm } from '@/components/business/event-item-form'

interface NewItemPageProps {
  params: Promise<{
    businessId: string
    eventId: string
  }>
}

export default async function NewItemPage({ params }: NewItemPageProps) {
  const { businessId, eventId } = await params

  let event
  try {
    event = await getEventById(eventId)
  } catch (error) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/business/${businessId}/events/${eventId}`}>
            ← Back to {event.title}
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Event Item</h1>
        <p className="text-muted-foreground">
          Create merchandise, food, drinks, or other items for this event
        </p>
      </div>

      <EventItemForm businessId={businessId} eventId={eventId} />
    </div>
  )
}
