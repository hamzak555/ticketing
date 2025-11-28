import Link from 'next/link'
import { getBusinesses } from '@/lib/db/businesses'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BusinessDashboardLink } from '@/components/admin/business-dashboard-link'
import { AdminDashboardLayout } from '@/components/admin/admin-dashboard-layout'
import { createClient } from '@/lib/supabase/server'

export default async function BusinessesListPage() {
  let businesses: Awaited<ReturnType<typeof getBusinesses>> = []
  let error: string | null = null
  let globalSettings: any = null

  try {
    businesses = await getBusinesses()

    // Fetch global platform settings
    const supabase = await createClient()
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('*')
      .single()
    globalSettings = settings
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load businesses'
  }

  // Helper function to get fee configuration display
  const getFeeConfig = (business: typeof businesses[0]) => {
    if (business.use_custom_fee_settings && business.platform_fee_type) {
      return {
        type: business.platform_fee_type,
        flat: business.flat_fee_amount,
        percentage: business.percentage_fee,
        isCustom: true
      }
    }
    return {
      type: globalSettings?.platform_fee_type || 'higher_of_both',
      flat: globalSettings?.flat_fee_amount || 0,
      percentage: globalSettings?.percentage_fee || 0,
      isCustom: false
    }
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Businesses</h1>
          <p className="text-muted-foreground">
            Manage business accounts and their settings
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/businesses/new">Create Business</Link>
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Make sure you have run the database schema and configured your Supabase credentials.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Businesses</CardTitle>
          <CardDescription>
            {businesses.length} business{businesses.length !== 1 ? 'es' : ''} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {businesses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No businesses created yet
              </p>
              <Button asChild>
                <Link href="/admin/businesses/new">Create Your First Business</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug (URL)</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Fee Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.map((business) => {
                    const feeConfig = getFeeConfig(business)
                    return (
                      <TableRow key={business.id}>
                        <TableCell className="font-medium">{business.name}</TableCell>
                        <TableCell>
                          <Link
                            href={`/${business.slug}`}
                            target="_blank"
                            className="text-primary hover:underline"
                          >
                            /{business.slug}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">
                          {business.contact_email || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col gap-1">
                            <span className="capitalize">
                              {feeConfig.type?.replace(/_/g, ' ') || 'N/A'}
                            </span>
                            {feeConfig.isCustom && (
                              <Badge variant="outline" className="w-fit text-xs">
                                Custom
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {feeConfig.type === 'flat' && (
                            <span>${feeConfig.flat?.toFixed(2)}</span>
                          )}
                          {feeConfig.type === 'percentage' && (
                            <span>{feeConfig.percentage}%</span>
                          )}
                          {feeConfig.type === 'higher_of_both' && (
                            <div className="flex flex-col">
                              <span>${feeConfig.flat?.toFixed(2)} / {feeConfig.percentage}%</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={business.is_active ? 'success' : 'secondary'}>
                            {business.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(business.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <BusinessDashboardLink businessId={business.id} businessSlug={business.slug} />
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/businesses/${business.id}`}>
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </AdminDashboardLayout>
  )
}
