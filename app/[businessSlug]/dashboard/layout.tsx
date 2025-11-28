import { ReactNode } from 'react'
import { DashboardLayout } from '@/components/business/dashboard-layout'

interface DashboardRouteLayoutProps {
  children: ReactNode
  params: Promise<{
    businessSlug: string
  }>
}

export default async function DashboardRouteLayout({ children, params }: DashboardRouteLayoutProps) {
  const { businessSlug } = await params

  return (
    <DashboardLayout businessSlug={businessSlug}>
      {children}
    </DashboardLayout>
  )
}
