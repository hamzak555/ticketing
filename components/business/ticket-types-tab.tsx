'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import TicketTypeForm from './ticket-type-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface TicketType {
  id: string
  name: string
  description: string | null
  price: number
  total_quantity: number
  available_quantity: number
  is_active: boolean
  sale_start_date: string | null
  sale_end_date: string | null
}

interface TicketTypesTabProps {
  eventId: string
}

export default function TicketTypesTab({ eventId }: TicketTypesTabProps) {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTicketType, setEditingTicketType] = useState<TicketType | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchTicketTypes()
  }, [eventId])

  const fetchTicketTypes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/events/${eventId}/ticket-types`)
      if (response.ok) {
        const data = await response.json()
        setTicketTypes(data)
      }
    } catch (error) {
      console.error('Error fetching ticket types:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) {
      return
    }

    try {
      setDeletingId(id)
      const response = await fetch(`/api/ticket-types/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTicketTypes()
      } else {
        alert('Failed to delete ticket')
      }
    } catch (error) {
      console.error('Error deleting ticket type:', error)
      alert('Failed to delete ticket')
    } finally {
      setDeletingId(null)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingTicketType(null)
    fetchTicketTypes()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTicketType(null)
  }

  const openCreateForm = () => {
    setEditingTicketType(null)
    setShowForm(true)
  }

  const openEditForm = (ticketType: TicketType) => {
    setEditingTicketType(ticketType)
    setShowForm(true)
  }

  const soldTickets = (ticketType: TicketType) => {
    return ticketType.total_quantity - ticketType.available_quantity
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>
                Create multiple ticket options with different prices and availability
              </CardDescription>
            </div>
            <Button onClick={openCreateForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Ticket
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {ticketTypes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground mb-4">
                No tickets created yet. Add different ticket options like VIP, General Admission, or Early Bird.
              </p>
              <Button onClick={openCreateForm}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Ticket
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketTypes.map((ticketType) => (
                  <TableRow key={ticketType.id}>
                    <TableCell className="font-medium">
                      {ticketType.name}
                      {ticketType.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {ticketType.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      ${ticketType.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {soldTickets(ticketType)}
                    </TableCell>
                    <TableCell className="text-right">
                      {ticketType.available_quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {ticketType.total_quantity}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ticketType.is_active ? 'default' : 'secondary'}>
                        {ticketType.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditForm(ticketType)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(ticketType.id)}
                          disabled={deletingId === ticketType.id}
                        >
                          {deletingId === ticketType.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTicketType ? 'Edit Ticket' : 'Create Ticket'}
            </DialogTitle>
            <DialogDescription>
              {editingTicketType
                ? 'Update the details of this ticket'
                : 'Add a new ticket option for this event'}
            </DialogDescription>
          </DialogHeader>
          <TicketTypeForm
            eventId={eventId}
            ticketType={editingTicketType || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
