'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { CheckCircle2, XCircle, Ban, Loader2 } from 'lucide-react'
import QRCode from 'qrcode'
import Image from 'next/image'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Ticket {
  id: string
  ticket_number: string
  ticket_type_id: string | null
  price: number
  qr_code_data: string
  status: string
  checked_in_at: string | null
  ticket_type?: {
    name: string
  } | null
}

interface OrderTicketsDisplayProps {
  tickets: Ticket[]
}

export function OrderTicketsDisplay({ tickets }: OrderTicketsDisplayProps) {
  const router = useRouter()
  const [qrCodes, setQrCodes] = useState<Map<string, string>>(new Map())
  const [voidingTicket, setVoidingTicket] = useState<string | null>(null)
  const [showVoidDialog, setShowVoidDialog] = useState(false)
  const [ticketToVoid, setTicketToVoid] = useState<{ id: string; number: string } | null>(null)

  useEffect(() => {
    const generateQRCodes = async () => {
      const codes = new Map<string, string>()

      for (const ticket of tickets) {
        try {
          const qrCodeDataUrl = await QRCode.toDataURL(ticket.qr_code_data, {
            width: 200,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          })
          codes.set(ticket.id, qrCodeDataUrl)
        } catch (error) {
          console.error('Error generating QR code:', error)
        }
      }

      setQrCodes(codes)
    }

    generateQRCodes()
  }, [tickets])

  const handleVoidTicket = async () => {
    if (!ticketToVoid) return

    setShowVoidDialog(false)
    setVoidingTicket(ticketToVoid.id)

    try {
      const response = await fetch(`/api/tickets/${ticketToVoid.id}/void`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to void ticket')
      }

      toast.success('Ticket marked as void successfully')
      router.refresh()
    } catch (error) {
      console.error('Error voiding ticket:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to void ticket')
    } finally {
      setVoidingTicket(null)
      setTicketToVoid(null)
    }
  }

  const openVoidDialog = (ticketId: string, ticketNumber: string) => {
    setTicketToVoid({ id: ticketId, number: ticketNumber })
    setShowVoidDialog(true)
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Individual Tickets</CardTitle>
        <CardDescription>
          {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'} in this order
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket, index) => {
            const isScanned = ticket.checked_in_at !== null
            const isInvalid = ticket.status === 'invalid'
            const ticketName = ticket.ticket_type?.name || `Ticket #${index + 1}`

            return (
              <div
                key={ticket.id}
                className={`border rounded-lg p-4 ${
                  isInvalid
                    ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 opacity-75'
                    : isScanned
                    ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                    : 'bg-card'
                }`}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{ticketName}</h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        {ticket.ticket_number}
                      </p>
                    </div>
                    <Badge
                      variant={isInvalid ? 'destructive' : isScanned ? 'success' : 'secondary'}
                      className="ml-2"
                    >
                      {isInvalid ? (
                        <span className="flex items-center gap-1">
                          <Ban className="h-3 w-3" />
                          Invalid
                        </span>
                      ) : isScanned ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Scanned
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Not Scanned
                        </span>
                      )}
                    </Badge>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    {qrCodes.get(ticket.id) ? (
                      <div className={`relative bg-white p-2 rounded-lg border ${isInvalid ? 'opacity-30' : ''}`}>
                        <Image
                          src={qrCodes.get(ticket.id)!}
                          alt={`QR Code for ${ticketName}`}
                          width={150}
                          height={150}
                          className="block"
                        />
                        {isInvalid && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Ban className="h-12 w-12 text-destructive" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-[150px] h-[150px] bg-muted animate-pulse rounded-lg" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-2 border-t pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-medium">${ticket.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge
                        variant={
                          ticket.status === 'valid'
                            ? 'success'
                            : ticket.status === 'invalid'
                            ? 'destructive'
                            : 'warning'
                        }
                        className="capitalize"
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                    {isScanned && ticket.checked_in_at && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Scanned At</span>
                        <span className="font-medium text-xs">
                          {new Date(ticket.checked_in_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {!isInvalid && !isScanned && (
                    <div className="border-t pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openVoidDialog(ticket.id, ticket.ticket_number)}
                        disabled={voidingTicket === ticket.id}
                        className="w-full text-destructive hover:text-destructive"
                      >
                        {voidingTicket === ticket.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Voiding...
                          </>
                        ) : (
                          <>
                            <Ban className="mr-2 h-4 w-4" />
                            Mark as Void
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>

    {/* Void Confirmation Dialog */}
    <AlertDialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark Ticket as Void</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to mark ticket {ticketToVoid?.number} as void?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3">
            <ul className="text-sm space-y-1 text-destructive">
              <li>• This ticket will be marked as Invalid</li>
              <li>• The ticket will become unscannable</li>
              <li>• This action cannot be undone</li>
            </ul>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleVoidTicket}
            className="bg-destructive hover:bg-destructive/90"
          >
            Mark as Void
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  )
}
