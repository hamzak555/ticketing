import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrderById } from '@/lib/db/orders'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Mail, RefreshCcw, ExternalLink } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface OrderDetailPageProps {
  params: Promise<{
    businessId: string
    orderId: string
  }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { businessId, orderId } = await params

  let order
  try {
    order = await getOrderById(orderId)
  } catch (error) {
    notFound()
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/business/${businessId}/tickets`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tickets
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order {order.order_number}</h1>
          <p className="text-muted-foreground">
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Badge variant={getStatusColor(order.status)} className="text-sm capitalize">
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Event</p>
              <p className="text-lg font-semibold">{order.events.title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(order.events.event_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {order.events.event_time && ` at ${order.events.event_time}`}
              </p>
              {order.events.location && (
                <p className="text-sm text-muted-foreground mt-1">
                  {order.events.location}
                </p>
              )}
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
            </div>

            {order.discount_amount > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Discount Applied</p>
                <p className="text-lg font-semibold text-green-600">
                  -${order.discount_amount.toFixed(2)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg">{order.customer_name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{order.customer_email}</p>
            </div>

            {order.customer_phone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-lg">{order.customer_phone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Manage this order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" disabled>
              <Mail className="mr-2 h-4 w-4" />
              Resend Tickets
            </Button>
            <Button variant="outline" disabled>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Process Refund
            </Button>
            <Button variant="outline" asChild>
              <Link href={`mailto:${order.customer_email}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Contact Customer
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Note: Resend tickets and refund functionality coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
