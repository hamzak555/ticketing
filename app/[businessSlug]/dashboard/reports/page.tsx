import { getEventsByBusinessId } from '@/lib/db/events'
import { getBusinessBySlug } from '@/lib/db/businesses'
import { getBusinessAnalytics } from '@/lib/db/analytics'
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
import { formatCurrency } from '@/lib/utils/currency'
import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering to always show current data
export const dynamic = 'force-dynamic'

interface ReportsPageProps {
  params: Promise<{
    businessSlug: string
  }>
}

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { businessSlug } = await params
  const business = await getBusinessBySlug(businessSlug)
  const events = await getEventsByBusinessId(business.id)
  const analytics = await getBusinessAnalytics(business.id)

  // Get ticket types for all events to calculate available tickets
  const supabase = await createClient()
  const { data: allTicketTypes } = await supabase
    .from('ticket_types')
    .select('event_id, total_quantity, available_quantity')
    .in('event_id', events.map(e => e.id))

  // Create a map of event_id to total available tickets
  const availableTicketsMap = new Map<string, number>()
  if (allTicketTypes) {
    for (const tt of allTicketTypes) {
      const current = availableTicketsMap.get(tt.event_id) || 0
      availableTicketsMap.set(tt.event_id, current + tt.available_quantity)
    }
  }

  const totalTicketsAvailable = Array.from(availableTicketsMap.values()).reduce((sum, n) => sum + n, 0)
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="py-4">
          <CardContent className="pb-0">
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <div className="text-2xl font-bold">{formatCurrency(analytics.total_revenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {analytics.total_orders} orders
            </p>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent className="pb-0">
            <p className="text-sm font-medium text-muted-foreground">Tax Collected</p>
            <div className="text-2xl font-bold">{formatCurrency(analytics.total_tax_collected)}</div>
            <p className="text-xs text-muted-foreground">
              Included in total revenue
            </p>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent className="pb-0">
            <p className="text-sm font-medium text-muted-foreground">Post-Tax Revenue</p>
            <div className="text-2xl font-bold">{formatCurrency(analytics.total_revenue - analytics.total_tax_collected)}</div>
            <p className="text-xs text-muted-foreground">
              Revenue minus tax
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="py-4">
          <CardContent className="pb-0">
            <p className="text-sm font-medium text-muted-foreground">Tickets Sold</p>
            <div className="text-2xl font-bold">{analytics.total_tickets_sold}</div>
            <p className="text-xs text-muted-foreground">
              {totalTicketsAvailable} still available
            </p>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent className="pb-0">
            <p className="text-sm font-medium text-muted-foreground">Published Events</p>
            <div className="text-2xl font-bold">{publishedEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              of {events.length} total events
            </p>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent className="pb-0">
            <p className="text-sm font-medium text-muted-foreground">Upcoming Events</p>
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
                  // Find analytics for this event
                  const eventAnalytics = analytics.events.find(a => a.event_id === event.id)
                  const sold = eventAnalytics?.total_tickets_sold || 0
                  const revenue = eventAnalytics?.total_revenue || 0
                  const available = availableTicketsMap.get(event.id) || event.available_tickets
                  const total = sold + available
                  const sellRate = total > 0
                    ? ((sold / total) * 100).toFixed(1)
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
                      <TableCell className="text-right">{available}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(revenue)}
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
