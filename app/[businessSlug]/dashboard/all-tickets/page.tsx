import { getBusinessBySlug } from '@/lib/db/businesses'
import { getTicketsByBusinessId } from '@/lib/db/tickets'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AllTicketsTable } from '@/components/business/all-tickets-table'
import { Ticket } from 'lucide-react'

// Force dynamic rendering to always show current data
export const dynamic = 'force-dynamic'

interface AllTicketsPageProps {
  params: Promise<{
    businessSlug: string
  }>
}

export default async function AllTicketsPage({ params }: AllTicketsPageProps) {
  const { businessSlug } = await params

  const business = await getBusinessBySlug(businessSlug)
  const tickets = await getTicketsByBusinessId(business.id)

  // Calculate stats
  const totalTickets = tickets.length
  const scannedTickets = tickets.filter(t => t.checked_in_at !== null).length
  const unscannedTickets = totalTickets - scannedTickets
  const scanRate = totalTickets > 0 ? ((scannedTickets / totalTickets) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Tickets</h1>
        <p className="text-muted-foreground">
          View and manage all individual tickets sold across all events
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              All tickets sold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scanned Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scannedTickets}</div>
            <p className="text-xs text-muted-foreground">
              Checked in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unscanned Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unscannedTickets}</div>
            <p className="text-xs text-muted-foreground">
              Not yet checked in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scan Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scanRate}%</div>
            <p className="text-xs text-muted-foreground">
              Tickets checked in
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>
            Complete list of all tickets with search and filtering
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                No tickets sold yet
              </p>
              <p className="text-sm text-muted-foreground">
                Tickets will appear here once customers make purchases
              </p>
            </div>
          ) : (
            <AllTicketsTable tickets={tickets} businessSlug={businessSlug} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
