import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getBusinessBySlug } from '@/lib/db/businesses'
import { getPublishedEventsByBusinessId, getEventPriceDisplay, getEventAvailableTickets, getEventTotalTickets } from '@/lib/db/events'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Force dynamic rendering to always show current ticket availability
export const dynamic = 'force-dynamic'

interface BusinessPageProps {
  params: Promise<{
    businessSlug: string
  }>
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { businessSlug } = await params

  // Fetch business data
  let business
  try {
    business = await getBusinessBySlug(businessSlug)
  } catch (error) {
    notFound()
  }

  // Fetch published events
  let events: Awaited<ReturnType<typeof getPublishedEventsByBusinessId>> = []
  try {
    events = await getPublishedEventsByBusinessId(business.id)
  } catch (error) {
    console.error('Error fetching events:', error)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Business Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{business.name}</h1>
          {business.description && (
            <p className="text-muted-foreground text-lg">
              {business.description}
            </p>
          )}
        </div>

        {/* Business Information */}
        {(business.contact_email || business.contact_phone || business.website) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {business.contact_email && (
                <p className="text-sm">
                  <span className="font-medium">Email:</span>{' '}
                  <a href={`mailto:${business.contact_email}`} className="text-primary hover:underline">
                    {business.contact_email}
                  </a>
                </p>
              )}
              {business.contact_phone && (
                <p className="text-sm">
                  <span className="font-medium">Phone:</span>{' '}
                  <a href={`tel:${business.contact_phone}`} className="text-primary hover:underline">
                    {business.contact_phone}
                  </a>
                </p>
              )}
              {business.website && (
                <p className="text-sm">
                  <span className="font-medium">Website:</span>{' '}
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {business.website}
                  </a>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Events Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
          {events.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No upcoming events at this time. Check back soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => {
                const availableTickets = getEventAvailableTickets(event)
                const totalTickets = getEventTotalTickets(event)

                return (
                  <Card key={event.id} className="flex flex-col">
                    <CardHeader className="space-y-4">
                      {event.image_url && (
                        <div className="flex justify-center -mt-2">
                          <div className="relative w-32 h-32 rounded-lg overflow-hidden shadow-md">
                            <Image
                              src={event.image_url}
                              alt={event.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={availableTickets > 0 ? 'success' : 'destructive'}>
                            {availableTickets > 0 ? 'Available' : 'Sold Out'}
                          </Badge>
                          <span className="text-sm font-semibold">
                            {getEventPriceDisplay(event)}
                          </span>
                        </div>
                        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                        <CardDescription>
                          {new Date(event.event_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          {event.event_time && ` at ${event.event_time}`}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                      <div className="space-y-3 flex-1">
                        {event.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {event.description}
                          </p>
                        )}
                        {event.location && (
                          <p className="text-sm">
                            <span className="font-medium">Location:</span> {event.location}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Badge variant="outline">
                          {availableTickets} / {totalTickets} available
                        </Badge>
                        <Button size="sm" asChild disabled={availableTickets === 0}>
                          <Link href={`/${businessSlug}/events/${event.id}/checkout`}>
                            {availableTickets > 0 ? 'Buy Tickets' : 'Sold Out'}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
