import Link from 'next/link'
import { getBusinessById } from '@/lib/db/businesses'
import { getEventsByBusinessId } from '@/lib/db/events'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EventCardHover } from '@/components/business/event-card-hover'

interface BusinessDashboardProps {
  params: Promise<{
    businessId: string
  }>
}

export default async function BusinessDashboard({ params }: BusinessDashboardProps) {
  const { businessId } = await params

  const business = await getBusinessById(businessId)
  const events = await getEventsByBusinessId(businessId)

  // Calculate stats
  const totalEvents = events.length
  const publishedEvents = events.filter(e => e.status === 'published').length
  const draftEvents = events.filter(e => e.status === 'draft').length
  const totalTickets = events.reduce((sum, e) => sum + e.total_tickets, 0)
  const availableTickets = events.reduce((sum, e) => sum + e.available_tickets, 0)
  const soldTickets = totalTickets - availableTickets

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your events.
          </p>
        </div>
        <Button asChild>
          <Link href={`/business/${businessId}/events/new`}>Create Event</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {publishedEvents} published, {draftEvents} draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soldTickets}</div>
            <p className="text-xs text-muted-foreground">
              of {totalTickets} total tickets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableTickets}</div>
            <p className="text-xs text-muted-foreground">
              Ready to sell
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${events.reduce((sum, e) => sum + ((e.total_tickets - e.available_tickets) * e.ticket_price), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total ticket sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Your latest event listings</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/business/${businessId}/events`}>View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No events created yet
              </p>
              <Button asChild>
                <Link href={`/business/${businessId}/events/new`}>Create Your First Event</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 5).map((event) => (
                <EventCardHover key={event.id} event={event} businessId={businessId} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>Manage your event listings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href={`/business/${businessId}/events/new`}>
                Create New Event
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href={`/business/${businessId}/events`}>
                View All Events
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sold Tickets</CardTitle>
            <CardDescription>View and manage sales</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href={`/business/${businessId}/tickets`}>
                View Sold Tickets
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>View sales and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href={`/business/${businessId}/reports`}>
                View Reports
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Public Page</CardTitle>
            <CardDescription>Your customer-facing page</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href={`/${business.slug}`} target="_blank">
                View Public Page
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
