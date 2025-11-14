import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventById } from '@/lib/db/events'
import { getTicketTypes } from '@/lib/db/ticket-types'
import { getPromoCodeById } from '@/lib/db/promo-codes'
import { Button } from '@/components/ui/button'
import { PromoCodeForm } from '@/components/business/promo-code-form'

export const dynamic = 'force-dynamic'

interface EditPromoCodePageProps {
  params: Promise<{
    businessId: string
    eventId: string
    promoCodeId: string
  }>
}

export default async function EditPromoCodePage({ params }: EditPromoCodePageProps) {
  const { businessId, eventId, promoCodeId } = await params

  const [event, ticketTypes, promoCode] = await Promise.all([
    getEventById(eventId),
    getTicketTypes(eventId),
    getPromoCodeById(promoCodeId),
  ])

  if (!promoCode) {
    notFound()
  }

  // Verify the promo code belongs to this event
  if (promoCode.event_id !== eventId) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/business/${businessId}/events/${eventId}?tab=promo`}>
            ← Back to Promo Codes
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Promo Code</h1>
        <p className="text-muted-foreground mt-2">
          Update the promo code for {event.title}
        </p>
      </div>

      <PromoCodeForm
        eventId={eventId}
        businessId={businessId}
        ticketTypes={ticketTypes}
        initialData={{
          id: promoCode.id,
          code: promoCode.code,
          discount_type: promoCode.discount_type,
          discount_value: promoCode.discount_value,
          max_uses: promoCode.max_uses,
          valid_from: promoCode.valid_from,
          valid_until: promoCode.valid_until,
          is_active: promoCode.is_active,
          ticket_type_ids: promoCode.ticket_type_ids,
        }}
      />
    </div>
  )
}
