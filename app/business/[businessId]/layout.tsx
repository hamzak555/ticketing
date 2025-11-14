import { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBusinessById } from '@/lib/db/businesses'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Metadata } from 'next'

interface BusinessLayoutProps {
  children: ReactNode
  params: Promise<{
    businessId: string
  }>
}

export async function generateMetadata({ params }: BusinessLayoutProps): Promise<Metadata> {
  const { businessId } = await params

  try {
    const business = await getBusinessById(businessId)
    return {
      title: {
        template: `%s | ${business.name} Dashboard`,
        default: `${business.name} Dashboard`,
      },
    }
  } catch (error) {
    return {
      title: 'Business Dashboard',
    }
  }
}

export default async function BusinessLayout({ children, params }: BusinessLayoutProps) {
  const { businessId } = await params

  let business
  try {
    business = await getBusinessById(businessId)
  } catch (error) {
    notFound()
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6">
          <Link href={`/business/${businessId}`} className="text-xl font-bold hover:text-primary">
            {business.name}
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Business Dashboard</p>
        </div>
        <Separator />
        <nav className="flex-1 p-4 space-y-1">
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href={`/business/${businessId}`}>
              <span className="ml-2">Overview</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href={`/business/${businessId}/events`}>
              <span className="ml-2">Events</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href={`/business/${businessId}/tickets`}>
              <span className="ml-2">Sold Tickets</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href={`/business/${businessId}/reports`}>
              <span className="ml-2">Reports</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href={`/business/${businessId}/settings/stripe`}>
              <span className="ml-2">Payment Settings</span>
            </Link>
          </Button>
        </nav>
        <Separator />
        <div className="p-4 space-y-2">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/${business.slug}`} target="_blank">
              View Public Page
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="w-full">
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
