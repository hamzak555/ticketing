import { getEventsByBusinessId } from '@/lib/db/events'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ReportsPageProps {
  params: Promise<{
    businessId: string
  }>
}

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { businessId } = await params
  const events = await getEventsByBusinessId(businessId)

  // Calculate overall stats
  const totalRevenue = events.reduce((sum, e) => {
    const sold = e.total_tickets - e.available_tickets
    return sum + (sold * e.ticket_price)
  }, 0)

  const totalTicketsSold = events.reduce((sum, e) => {
    return sum + (e.total_tickets - e.available_tickets)
  }, 0)

  const totalTicketsAvailable = events.reduce((sum, e) => sum + e.available_tickets, 0)

  const publishedEvents = events.filter(e => e.status === 'published')
  const upcomingEvents = events.filter(e => new Date(e.event_date) > new Date())

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          View performance metrics and sales data for your events
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From all events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTicketsSold}</div>
            <p className="text-xs text-muted-foreground">
              {totalTicketsAvailable} still available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              of {events.length} total events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Future events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Event Performance</CardTitle>
          <CardDescription>
            Detailed breakdown of each event's sales and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No events to report on yet
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Sell Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const sold = event.total_tickets - event.available_tickets
                  const revenue = sold * event.ticket_price
                  const sellRate = event.total_tickets > 0
                    ? ((sold / event.total_tickets) * 100).toFixed(1)
                    : '0.0'

                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            event.status === 'published'
                              ? 'success'
                              : event.status === 'cancelled'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="capitalize"
                        >
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(event.event_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right">{sold}</TableCell>
                      <TableCell className="text-right">{event.available_tickets}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${revenue.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={sellRate === '100.0' ? 'text-green-600' : ''}>
                          {sellRate}%
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
