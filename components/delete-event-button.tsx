'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface DeleteEventButtonProps {
  eventId: string
  eventTitle: string
  businessId: string
  businessSlug: string
  canDelete: boolean
  reasonCannotDelete?: string
}

export function DeleteEventButton({
  eventId,
  eventTitle,
  businessId,
  businessSlug,
  canDelete,
  reasonCannotDelete,
}: DeleteEventButtonProps) {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/businesses/${businessId}/events/${eventId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete event')
      }

      // Redirect to events list
      router.push(`/${businessSlug}/dashboard/events`)
      router.refresh()
    } catch (error) {
      console.error('Error deleting event:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete event')
      setIsDeleting(false)
    }
  }

  const button = (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setShowDialog(true)}
      disabled={!canDelete || isDeleting}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Delete Event
    </Button>
  )

  return (
    <>
      {!canDelete && reasonCannotDelete ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="inline-block">
              {button}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            {reasonCannotDelete}
          </TooltipContent>
        </Tooltip>
      ) : (
        button
      )}

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event <strong>&quot;{eventTitle}&quot;</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
