import { notFound } from 'next/navigation'
import { getBusinessById } from '@/lib/db/businesses'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccountSettingsForm } from '@/components/business/account-settings-form'

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic'

interface AccountSettingsPageProps {
  params: Promise<{
    businessId: string
  }>
}

export default async function AccountSettingsPage({ params }: AccountSettingsPageProps) {
  const { businessId } = await params

  let business
  try {
    business = await getBusinessById(businessId)
  } catch (error) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your business information and contact details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Update your business details, contact information, and social media links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountSettingsForm businessId={businessId} business={business} />
        </CardContent>
      </Card>
    </div>
  )
}
