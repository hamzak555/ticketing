import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getBusinessBySlug } from '@/lib/db/businesses'
import type { Metadata } from 'next'

interface CustomerLayoutProps {
  children: ReactNode
  params: Promise<{
    businessSlug: string
  }>
}

export async function generateMetadata({ params }: CustomerLayoutProps): Promise<Metadata> {
  const { businessSlug } = await params

  try {
    const business = await getBusinessBySlug(businessSlug)
    if (!business) {
      return {
        title: 'Business Not Found',
      }
    }
    return {
      title: {
        template: `%s | ${business.name}`,
        default: business.name,
      },
    }
  } catch (error) {
    return {
      title: 'Business',
    }
  }
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return <>{children}</>
}
