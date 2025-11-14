'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface StripeStatus {
  connected: boolean
  onboarding_complete: boolean
  charges_enabled?: boolean
  payouts_enabled?: boolean
  fee_payer?: 'customer' | 'business'
}

export default function StripeSettingsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const businessId = params.businessId as string

  const [status, setStatus] = useState<StripeStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isUpdatingFees, setIsUpdatingFees] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feeUpdateSuccess, setFeeUpdateSuccess] = useState(false)

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

  const handleUpdateFeePayer = async (feePayer: 'customer' | 'business') => {
    setIsUpdatingFees(true)
    setError(null)
    setFeeUpdateSuccess(false)

    try {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fee_payer: feePayer }),
      })

      if (!response.ok) {
        throw new Error('Failed to update fee settings')
      }

      setStatus(prev => prev ? { ...prev, fee_payer: feePayer } : null)
      setFeeUpdateSuccess(true)
      setTimeout(() => setFeeUpdateSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsUpdatingFees(false)
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

      <Card>
        <CardHeader>
          <CardTitle>Processing Fee Settings</CardTitle>
          <CardDescription>
            Choose who pays the Stripe and platform processing fees
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {feeUpdateSuccess && (
            <div className="p-4 bg-green-500/10 border border-green-500 rounded-md">
              <p className="text-sm text-green-600 dark:text-green-400">
                Fee settings updated successfully!
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Label className="text-base">Who pays the processing fees?</Label>
            <div className="space-y-3">
              <button
                onClick={() => handleUpdateFeePayer('customer')}
                disabled={isUpdatingFees}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  status?.fee_payer === 'customer'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${isUpdatingFees ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    status?.fee_payer === 'customer' ? 'border-primary' : 'border-muted-foreground'
                  }`}>
                    {status?.fee_payer === 'customer' && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Customer Pays Fees (Recommended)</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Processing fees are added to the ticket price during checkout. You receive the full ticket amount minus only your net cost.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Example: $100 ticket → Customer pays $103.20 → You receive ~$100
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleUpdateFeePayer('business')}
                disabled={isUpdatingFees}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  status?.fee_payer === 'business'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${isUpdatingFees ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    status?.fee_payer === 'business' ? 'border-primary' : 'border-muted-foreground'
                  }`}>
                    {status?.fee_payer === 'business' && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Business Pays Fees</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Customer pays only the ticket price. Processing fees are deducted from your revenue.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Example: $100 ticket → Customer pays $100 → You receive ~$96.80
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Fee Breakdown</h4>
            <ul className="text-sm space-y-1">
              <li className="text-muted-foreground">• Stripe processing: 2.9% + $0.30 per transaction</li>
              <li className="text-muted-foreground">• Platform fee: Set by platform admin</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
