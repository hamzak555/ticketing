import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PromoCodeForm } from '@/components/business/promo-code-form'
import { getEventById } from '@/lib/db/events'
import { getTicketTypes } from '@/lib/db/ticket-types'

export const dynamic = 'force-dynamic'

interface NewPromoCodePageProps {
  params: Promise<{
    businessId: string
    eventId: string
  }>
}

export default async function NewPromoCodePage({ params }: NewPromoCodePageProps) {
  const { businessId, eventId } = await params

  let event
  try {
    event = await getEventById(eventId)
  } catch (error) {
    notFound()
  }

  const ticketTypes = await getTicketTypes(eventId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/business/${businessId}/events/${eventId}?tab=promo`}>
            ← Back to Event
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Promo Code</h1>
        <p className="text-muted-foreground">
          Create a discount code for {event.title}
        </p>
      </div>

      <PromoCodeForm eventId={eventId} businessId={businessId} ticketTypes={ticketTypes} />
    </div>
  )
}
