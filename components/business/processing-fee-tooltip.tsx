'use client'

import { Info } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { formatCurrency } from '@/lib/utils/currency'

interface ProcessingFeeTooltipProps {
  platformFee: number
  stripeFee: number
}

export function ProcessingFeeTooltip({ platformFee, stripeFee }: ProcessingFeeTooltipProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isHovered && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 8,
        left: rect.left - 100 // Offset to the left to center it better
      })
    }
  }, [isHovered])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="inline-flex items-center ml-1"
      >
        <Info className="h-4 w-4 text-muted-foreground cursor-help flex-shrink-0" />
      </div>

      {/* Tooltip Portal */}
      {isHovered && typeof window !== 'undefined' &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: `${position.top}px`,
              left: `${position.left}px`,
              zIndex: 9999
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="bg-popover border border-border rounded-lg p-3 shadow-lg min-w-[220px]">
              <p className="text-xs font-semibold mb-2">Processing Fee Breakdown</p>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Platform Fee:</span>
                  <span className="font-medium">{formatCurrency(platformFee)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Stripe Fee:</span>
                  <span className="font-medium">{formatCurrency(stripeFee)}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t mt-1">
                  <span className="font-medium">Total:</span>
                  <span className="font-semibold">{formatCurrency(platformFee + stripeFee)}</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </>
  )
}
