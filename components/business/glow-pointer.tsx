'use client'

import { useEffect } from 'react'

export function GlowPointer() {
  useEffect(() => {
    const UPDATE = (e: PointerEvent) => {
      document.documentElement.style.setProperty('--x', e.clientX.toFixed(2))
      document.documentElement.style.setProperty(
        '--xp',
        (e.clientX / window.innerWidth).toFixed(2)
      )
      document.documentElement.style.setProperty('--y', e.clientY.toFixed(2))
      document.documentElement.style.setProperty(
        '--yp',
        (e.clientY / window.innerHeight).toFixed(2)
      )
    }

    document.body.addEventListener('pointermove', UPDATE)
    return () => {
      document.body.removeEventListener('pointermove', UPDATE)
    }
  }, [])

  return null
}
