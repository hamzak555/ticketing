'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Ticket } from 'lucide-react'

interface DownloadTicketsButtonProps {
  orderId: string
  orderNumber: string
}

export function DownloadTicketsButton({ orderId, orderNumber }: DownloadTicketsButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch('/api/tickets/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')

      // Clean up after a delay to allow the PDF to load
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)
    } catch (error) {
      console.error('Error opening PDF:', error)
      alert('Failed to open tickets. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      disabled={isDownloading}
    >
      <Ticket className="mr-2 h-4 w-4" />
      {isDownloading ? 'Generating...' : 'View Tickets PDF'}
    </Button>
  )
}
