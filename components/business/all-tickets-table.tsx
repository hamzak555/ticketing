'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { TicketWithDetails } from '@/lib/db/tickets'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Search, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Check, Ban } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { toast } from 'sonner'

interface AllTicketsTableProps {
  tickets: TicketWithDetails[]
  businessSlug: string
}

type SortColumn = 'ticket_number' | 'customer_name' | 'event' | 'date' | 'status'
type SortDirection = 'asc' | 'desc'

export function AllTicketsTable({ tickets, businessSlug }: AllTicketsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [scanningTickets, setScanningTickets] = useState<Set<string>>(new Set())
  const [scannedTickets, setScannedTickets] = useState<Set<string>>(new Set())
  const [showScanDialog, setShowScanDialog] = useState(false)
  const [ticketToScan, setTicketToScan] = useState<{ id: string; number: string } | null>(null)

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedTickets = useMemo(() => {
    let filtered = tickets

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = tickets.filter(
        ticket =>
          ticket.ticket_number.toLowerCase().includes(query) ||
          ticket.order.customer_name.toLowerCase().includes(query) ||
          ticket.order.customer_email.toLowerCase().includes(query) ||
          ticket.order.order_number.toLowerCase().includes(query) ||
          ticket.event.title.toLowerCase().includes(query) ||
          (ticket.ticket_type?.name || '').toLowerCase().includes(query)
      )
    }

    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortColumn) {
        case 'ticket_number':
          aValue = a.ticket_number
          bValue = b.ticket_number
          break
        case 'customer_name':
          aValue = a.order.customer_name
          bValue = b.order.customer_name
          break
        case 'event':
          aValue = a.event.title
          bValue = b.event.title
          break
        case 'date':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'status':
          aValue = a.checked_in_at ? '1' : '0'
          bValue = b.checked_in_at ? '1' : '0'
          break
        default:
          aValue = a.created_at
          bValue = b.created_at
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [tickets, searchQuery, sortColumn, sortDirection])

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedTickets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTickets = filteredAndSortedTickets.slice(startIndex, endIndex)

  // Reset to page 1 when search query or items per page changes
  useMemo(() => {
    setCurrentPage(1)
  }, [searchQuery, itemsPerPage])

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleMarkAsScanned = async () => {
    if (!ticketToScan) return

    setShowScanDialog(false)
    setScanningTickets(prev => new Set(prev).add(ticketToScan.id))

    try {
      const response = await fetch(`/api/tickets/${ticketToScan.id}/scan`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to mark ticket as scanned')
      }

      setScannedTickets(prev => new Set(prev).add(ticketToScan.id))

      // Show success toast
      toast.success('Ticket marked as scanned successfully!')

      // Refresh the page after a short delay to show the updated status
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Error marking ticket as scanned:', error)
      toast.error('Failed to mark ticket as scanned. Please try again.')
      setScanningTickets(prev => {
        const newSet = new Set(prev)
        newSet.delete(ticketToScan.id)
        return newSet
      })
    }
  }

  const openScanDialog = (ticketId: string, ticketNumber: string) => {
    setTicketToScan({ id: ticketId, number: ticketNumber })
    setShowScanDialog(true)
  }

  const SortIndicator = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ticket number, customer, event, or order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">per page</span>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('ticket_number')}
              >
                Ticket Number <SortIndicator column="ticket_number" />
              </TableHead>
              <TableHead>Ticket Type</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('customer_name')}
              >
                Customer <SortIndicator column="customer_name" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('event')}
              >
                Event <SortIndicator column="event" />
              </TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('status')}
              >
                Scan Status <SortIndicator column="status" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('date')}
              >
                Purchase Date <SortIndicator column="date" />
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No tickets found matching your search' : 'No tickets found'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedTickets.map((ticket) => {
                const isScanned = ticket.checked_in_at !== null
                const isInvalid = ticket.status === 'invalid'
                const ticketTypeName = ticket.ticket_type?.name || 'General Admission'

                return (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-xs">
                      {ticket.ticket_number}
                    </TableCell>
                    <TableCell className="font-medium">
                      {ticketTypeName}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ticket.order.customer_email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(ticket.event.event_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/${businessSlug}/dashboard/tickets/${ticket.order_id}`}
                        className="font-mono text-xs underline underline-offset-2 text-foreground hover:text-primary transition-colors"
                      >
                        {ticket.order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(ticket.price)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isInvalid ? 'destructive' : isScanned ? 'success' : 'secondary'}
                        className="gap-1"
                      >
                        {isInvalid ? (
                          <>
                            <Ban className="h-3 w-3" />
                            Invalid
                          </>
                        ) : isScanned ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Scanned
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Not Scanned
                          </>
                        )}
                      </Badge>
                      {isScanned && ticket.checked_in_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(ticket.checked_in_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      {!isScanned && !scannedTickets.has(ticket.id) && !isInvalid && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openScanDialog(ticket.id, ticket.ticket_number)}
                          disabled={scanningTickets.has(ticket.id)}
                          className="h-8"
                        >
                          {scanningTickets.has(ticket.id) ? (
                            <>
                              <div className="animate-spin mr-2 h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                              Scanning...
                            </>
                          ) : (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Mark Scanned
                            </>
                          )}
                        </Button>
                      )}
                      {isInvalid && (
                        <span className="text-xs text-muted-foreground">Voided</span>
                      )}
                      {(isScanned || scannedTickets.has(ticket.id)) && !isInvalid && (
                        <span className="text-xs text-muted-foreground">Already scanned</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedTickets.length)} of{' '}
          {filteredAndSortedTickets.length} tickets
          {searchQuery && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="ml-2 h-auto p-0"
            >
              Clear search
            </Button>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)

                if (!showPage) {
                  // Show ellipsis
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    )
                  }
                  return null
                }

                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Scan Confirmation Dialog */}
      <AlertDialog open={showScanDialog} onOpenChange={setShowScanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Ticket as Scanned</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark ticket {ticketToScan?.number} as scanned?
              This will update the ticket status to "used" and record the check-in time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsScanned}>
              Mark as Scanned
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
