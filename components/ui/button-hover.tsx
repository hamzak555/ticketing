'use client'

import { useState, ReactNode } from 'react'

interface ButtonHoverProps {
  children: ReactNode
  className?: string
}

export function ButtonHover({ children, className = '' }: ButtonHoverProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      className={`relative overflow-hidden group ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Animated gradient that follows cursor */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.1), transparent 60%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
