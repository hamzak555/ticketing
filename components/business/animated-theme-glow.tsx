'use client'

interface AnimatedThemeGlowProps {
  themeColor: string
}

export function AnimatedThemeGlow({ themeColor }: AnimatedThemeGlowProps) {
  // Convert hex to rgba for opacity control
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
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

      <svg className="fixed inset-0 pointer-events-none" style={{ filter: 'url(#goo) blur(40px)' }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ filter: 'url(#goo) blur(40px)' }}>
        {/* Bubble 1 - Top Right */}
        <div
          className="bubble1 absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${hexToRgba(themeColor, 0.4)} 0%, ${hexToRgba(themeColor, 0.2)} 40%, transparent 70%)`,
            mixBlendMode: 'hard-light',
          }}
        />

        {/* Bubble 2 - Top Left */}
        <div
          className="bubble2 absolute top-[100px] left-[-150px] w-[400px] h-[400px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${hexToRgba(themeColor, 0.3)} 0%, ${hexToRgba(themeColor, 0.15)} 40%, transparent 70%)`,
            mixBlendMode: 'hard-light',
          }}
        />

        {/* Bubble 3 - Center */}
        <div
          className="bubble3 absolute top-[50px] right-[200px] w-[350px] h-[350px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${hexToRgba(themeColor, 0.35)} 0%, ${hexToRgba(themeColor, 0.18)} 40%, transparent 70%)`,
            mixBlendMode: 'hard-light',
          }}
        />
      </div>
    </>
  )
}
