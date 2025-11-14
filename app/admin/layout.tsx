import { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Admin Dashboard',
    default: 'Admin Dashboard',
  },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6">
          <Link href="/admin" className="text-xl font-bold">
            Admin Dashboard
          </Link>
        </div>
        <Separator />
        <nav className="flex-1 p-4 space-y-1">
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/admin">
              <span className="ml-2">Overview</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/admin/businesses">
              <span className="ml-2">Businesses</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/admin/settings">
              <span className="ml-2">Settings</span>
            </Link>
          </Button>
        </nav>
        <Separator />
        <div className="p-4">
          <Button variant="outline" size="sm" className="w-full">
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
