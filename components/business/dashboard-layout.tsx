import { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getBusinessBySlug } from '@/lib/db/businesses'
import { verifyBusinessAccess } from '@/lib/auth/business-session'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LogoutButton } from '@/components/business/logout-button'
import { LayoutDashboard, Calendar, Receipt, BarChart3, CreditCard, Settings, Users, ScanLine, UserCircle, Ticket } from 'lucide-react'

interface DashboardLayoutProps {
  businessSlug: string
  children: ReactNode
}

export async function DashboardLayout({ businessSlug, children }: DashboardLayoutProps) {
  const business = await getBusinessBySlug(businessSlug)

  // Check authentication
  const session = await verifyBusinessAccess(business.id)

  if (!session) {
    redirect(`/${businessSlug}/login`)
  }
  const isAdmin = session.role === 'admin'

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col h-screen sticky top-0">
        <div className="p-6 flex-shrink-0">
          <Link href={`/${businessSlug}/dashboard`} className="text-xl font-bold hover:text-primary">
            {business.name}
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Business Dashboard</p>
          {session.adminBypass && (
            <Button variant="outline" size="sm" asChild className="mt-2 h-6 text-xs">
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
          )}
        </div>
        <Separator className="flex-shrink-0" />
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href={`/${businessSlug}/dashboard`}>
              <LayoutDashboard className="h-4 w-4" />
              <span className="ml-2">Overview</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href={`/${businessSlug}/dashboard/events`}>
              <Calendar className="h-4 w-4" />
              <span className="ml-2">Events</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href={`/${businessSlug}/dashboard/tickets`}>
              <Receipt className="h-4 w-4" />
              <span className="ml-2">Sales</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href={`/${businessSlug}/dashboard/all-tickets`}>
              <Ticket className="h-4 w-4" />
              <span className="ml-2">Tickets</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href={`/${businessSlug}/dashboard/customers`}>
              <UserCircle className="h-4 w-4" />
              <span className="ml-2">Customers</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href={`/${businessSlug}/dashboard/scanner`}>
              <ScanLine className="h-4 w-4" />
              <span className="ml-2">Scanner</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href={`/${businessSlug}/dashboard/reports`}>
              <BarChart3 className="h-4 w-4" />
              <span className="ml-2">Reports</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href={`/${businessSlug}/dashboard/settings/stripe`}>
              <CreditCard className="h-4 w-4" />
              <span className="ml-2">Payment Settings</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href={`/${businessSlug}/dashboard/settings/account`}>
              <Settings className="h-4 w-4" />
              <span className="ml-2">Account Settings</span>
            </Link>
          </Button>
          {isAdmin && (
            <Button variant="ghost" asChild className="w-full justify-start">
              <Link href={`/${businessSlug}/dashboard/users`}>
                <Users className="h-4 w-4" />
                <span className="ml-2">Users</span>
              </Link>
            </Button>
          )}
        </nav>
        <Separator className="flex-shrink-0" />
        <div className="p-4 space-y-2 flex-shrink-0">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/${business.slug}`} target="_blank">
              View Public Page
            </Link>
          </Button>
          {!session.adminBypass && <LogoutButton />}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
