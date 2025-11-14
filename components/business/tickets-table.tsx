'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Mail, Eye, RefreshCcw, Search } from 'lucide-react'

interface Order {
  id: string
  order_number: string
  event_id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  total: number
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  created_at: string
  event_title: string
  event_date: string
}

interface TicketsTableProps {
  orders: Order[]
  businessId: string
}

export function TicketsTable({ orders, businessId }: TicketsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'refunded':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase()
    return (
      order.order_number.toLowerCase().includes(query) ||
      order.customer_name.toLowerCase().includes(query) ||
      order.customer_email.toLowerCase().includes(query) ||
      order.event_title.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order #, customer, email, event, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
          >
            Clear
          </Button>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? `No orders found matching "${searchQuery}"`
              : 'No tickets sold yet. Sales will appear here once customers purchase tickets.'}
          </p>
          {!searchQuery && (
            <p className="text-xs text-muted-foreground mt-2">
              Note: Order tracking was just enabled. New purchases will appear here automatically.
            </p>
          )}
        </div>
      ) : (
        <>
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.event_title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.event_date).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell className="text-sm">{order.customer_email}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${order.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(order.status)} className="capitalize">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="View Details"
                      >
                        <Link href={`/business/${businessId}/tickets/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Send Tickets (Coming Soon)"
                        disabled
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Refund (Coming Soon)"
                        disabled
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  )
}
