'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface StripeStatus {
  connected: boolean
  onboarding_complete: boolean
  charges_enabled?: boolean
  payouts_enabled?: boolean
}

export default function StripeSettingsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const businessId = params.businessId as string

  const [status, setStatus] = useState<StripeStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const success = searchParams.get('success')
  const refresh = searchParams.get('refresh')

  useEffect(() => {
    fetchStripeStatus()
  }, [])

  const fetchStripeStatus = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessId}/stripe/connect`)
      if (!response.ok) {
        throw new Error('Failed to fetch Stripe status')
      }
      const data = await response.json()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const response = await fetch(`/api/businesses/${businessId}/stripe/connect`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create Stripe Connect link')
      }

      const data = await response.json()
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsConnecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Settings</h1>
        <p className="text-muted-foreground">
          Connect your Stripe account to receive payments
        </p>
      </div>

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500 rounded-md">
          <p className="text-sm text-green-600 dark:text-green-400">
            Stripe account connected successfully! You can now accept payments.
          </p>
        </div>
      )}

      {refresh && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500 rounded-md">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Stripe onboarding was not completed. Please try again.
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stripe Connect</CardTitle>
          <CardDescription>
            Connect your Stripe account to receive ticket sales payments directly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {status?.connected ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Account Status</p>
                <p className="text-sm text-muted-foreground">
                  {status?.connected ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>

            {status?.connected && (
              <>
                <div className="flex items-center gap-3">
                  {status.onboarding_complete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  <div>
                    <p className="font-medium">Onboarding Status</p>
                    <p className="text-sm text-muted-foreground">
                      {status.onboarding_complete ? 'Complete' : 'Incomplete'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {status.charges_enabled ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">Accept Payments</p>
                    <p className="text-sm text-muted-foreground">
                      {status.charges_enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {status.payouts_enabled ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">Receive Payouts</p>
                    <p className="text-sm text-muted-foreground">
                      {status.payouts_enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="pt-4">
            {!status?.connected || !status?.onboarding_complete ? (
              <Button onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : status?.connected ? (
                  'Complete Stripe Onboarding'
                ) : (
                  'Connect Stripe Account'
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your Stripe account is connected and ready to accept payments.
                </p>
                <Button variant="outline" onClick={handleConnect}>
                  Update Stripe Settings
                </Button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">About Stripe Connect</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Receive payments directly to your bank account</li>
              <li>• Stripe handles all payment processing and security</li>
              <li>• Standard Stripe fees apply (2.9% + $0.30 per transaction)</li>
              <li>• View detailed transaction history in your Stripe dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
