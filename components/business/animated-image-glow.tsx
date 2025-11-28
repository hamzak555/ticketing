'use client'

import { useState, useEffect } from 'react'

interface AnimatedImageGlowProps {
  imageUrl: string | null
}

export function AnimatedImageGlow({ imageUrl }: AnimatedImageGlowProps) {
  const [glowColors, setGlowColors] = useState<string[]>([
    'rgba(100, 100, 100, 0.3)',
    'rgba(120, 120, 120, 0.25)',
    'rgba(80, 80, 80, 0.2)'
  ])

  // Extract dominant colors from the image
  useEffect(() => {
    if (!imageUrl) return

    const img = document.createElement('img')
    img.crossOrigin = 'Anonymous'
    img.src = imageUrl

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const sampleSize = 60
        const colors: string[] = []

        // Sample from different areas of the image
        const samplePoints = [
          { x: img.width / 2, y: img.height / 2 },      // center
          { x: img.width / 4, y: img.height / 4 },      // top-left
          { x: (3 * img.width) / 4, y: img.height / 4 }, // top-right
        ]

        for (const point of samplePoints) {
          const imageData = ctx.getImageData(
            Math.max(0, point.x - sampleSize / 2),
            Math.max(0, point.y - sampleSize / 2),
            sampleSize,
            sampleSize
          )

          let r = 0, g = 0, b = 0
          const pixels = imageData.data.length / 4

          for (let i = 0; i < imageData.data.length; i += 4) {
            r += imageData.data[i]
            g += imageData.data[i + 1]
            b += imageData.data[i + 2]
          }

          r = Math.floor(r / pixels)
          g = Math.floor(g / pixels)
          b = Math.floor(b / pixels)

          colors.push(`${r}, ${g}, ${b}`)
        }

        setGlowColors(colors)
      } catch (error) {
        console.error('Error extracting image colors:', error)
      }
    }
  }, [imageUrl])

  if (!imageUrl) return null

  // Helper to create rgba from extracted color
  const rgba = (colorIndex: number, alpha: number) => {
    return `rgba(${glowColors[colorIndex] || glowColors[0]}, ${alpha})`
  }

  return (
    <>
      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(80px, -60px) scale(1.3); }
          66% { transform: translate(-50px, 40px) scale(0.85); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(60px, 80px) scale(1.4); }
          50% { transform: translate(-80px, 60px) scale(1.1); }
          75% { transform: translate(40px, -40px) scale(0.9); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-70px, 50px) scale(0.9); }
          66% { transform: translate(60px, -70px) scale(1.25); }
        }
        .bubble1 { animation: float1 20s ease-in-out infinite; }
        .bubble2 { animation: float2 25s ease-in-out infinite; }
        .bubble3 { animation: float3 22s ease-in-out infinite; }
      `}</style>

      <svg className="fixed inset-0 pointer-events-none" style={{ filter: 'url(#goo-image) blur(40px)' }}>
        <defs>
          <filter id="goo-image">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ filter: 'url(#goo-image) blur(40px)' }}>
        {/* Bubble 1 - Top Right - using first extracted color */}
        <div
          className="bubble1 absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${rgba(0, 0.4)} 0%, ${rgba(0, 0.2)} 40%, transparent 70%)`,
            mixBlendMode: 'hard-light',
          }}
        />

        {/* Bubble 2 - Top Left - using second extracted color */}
        <div
          className="bubble2 absolute top-[100px] left-[-150px] w-[400px] h-[400px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${rgba(1, 0.35)} 0%, ${rgba(1, 0.18)} 40%, transparent 70%)`,
            mixBlendMode: 'hard-light',
          }}
        />

        {/* Bubble 3 - Center - using third extracted color */}
        <div
          className="bubble3 absolute top-[50px] right-[200px] w-[350px] h-[350px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${rgba(2, 0.38)} 0%, ${rgba(2, 0.2)} 40%, transparent 70%)`,
            mixBlendMode: 'hard-light',
          }}
        />
      </div>
    </>
  )
}
