'use client'

import { Info } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface EventInfoTooltipProps {
  description?: string | null
  location?: string | null
}

export function EventInfoTooltip({ description, location }: EventInfoTooltipProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isHovered && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 8,
        left: rect.left
      })
    }
  }, [isHovered])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
            <div className="bg-popover border border-border rounded-lg p-3 shadow-lg min-w-[200px]">
              {description && (
                <div className="mb-2">
                  <p className="text-xs font-medium mb-1">Description</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              )}
              {location && (
                <div className={description ? 'border-t pt-2' : ''}>
                  <p className="text-xs font-medium mb-1">Location</p>
                  <p className="text-xs text-muted-foreground">{location}</p>
                </div>
              )}
            </div>
          </div>,
          document.body
        )
      }
    </>
  )
}
