import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function BusinessPortalPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Business Portal</CardTitle>
          <CardDescription>
            Sign in to manage your events and tickets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground border rounded-lg p-6">
            <p className="mb-4">Business authentication coming soon!</p>
            <p className="text-xs">
              This portal will allow business owners to log in and manage their events,
              tickets, and view analytics.
            </p>
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">← Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
