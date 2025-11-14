import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EventForm } from '@/components/business/event-form'

interface NewEventPageProps {
  params: Promise<{
    businessId: string
  }>
}

export default async function NewEventPage({ params }: NewEventPageProps) {
  const { businessId } = await params

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/business/${businessId}/events`}>← Back to Events</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
        <p className="text-muted-foreground">
          Set up a new event and start selling tickets
        </p>
      </div>

      <EventForm businessId={businessId} />
    </div>
  )
}
