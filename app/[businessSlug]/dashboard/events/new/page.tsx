import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EventForm } from '@/components/business/event-form'
import { getBusinessBySlug } from '@/lib/db/businesses'

interface NewEventPageProps {
  params: Promise<{
    businessSlug: string
  }>
}

export default async function NewEventPage({ params }: NewEventPageProps) {
  const { businessSlug } = await params
  const business = await getBusinessBySlug(businessSlug)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${businessSlug}/dashboard/events`}>← Back to Events</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
        <p className="text-muted-foreground">
          Set up a new event and start selling tickets
        </p>
      </div>

      <EventForm businessId={business.id} businessSlug={businessSlug} />
    </div>
  )
}
