import { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Admin Dashboard',
    default: 'Admin Dashboard',
  },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Just render children - auth will be handled by individual pages
  return <>{children}</>
}
