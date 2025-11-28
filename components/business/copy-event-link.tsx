'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Link2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface CopyEventLinkProps {
  businessSlug: string
  eventId: string
}

export function CopyEventLink({ businessSlug, eventId }: CopyEventLinkProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = `${window.location.origin}/${businessSlug}/events/${eventId}/checkout`

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Checkout link copied to clipboard!')

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-8 w-8 p-0"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Link2 className="h-4 w-4" />
      )}
    </Button>
  )
}
