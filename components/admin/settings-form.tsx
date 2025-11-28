'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface PlatformSettings {
  id: string
  platform_fee_type: 'flat' | 'percentage' | 'higher_of_both'
  flat_fee_amount: number
  percentage_fee: number
  platform_stripe_account_id: string | null
}

export default function AdminSettingsForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [formData, setFormData] = useState({
    platform_fee_type: 'higher_of_both' as 'flat' | 'percentage' | 'higher_of_both',
    flat_fee_amount: '',
    percentage_fee: '',
    platform_stripe_account_id: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      const data = await response.json()
      setSettings(data)
      setFormData({
        platform_fee_type: data.platform_fee_type,
        flat_fee_amount: data.flat_fee_amount.toString(),
        percentage_fee: data.percentage_fee.toString(),
        platform_stripe_account_id: data.platform_stripe_account_id || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform_fee_type: formData.platform_fee_type,
          flat_fee_amount: parseFloat(formData.flat_fee_amount),
          percentage_fee: parseFloat(formData.percentage_fee),
          platform_stripe_account_id: formData.platform_stripe_account_id || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update settings')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      await fetchSettings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Calculate example fees for preview
  const exampleTicketPrice = 50
  const exampleQuantity = 2
  const exampleSubtotal = exampleTicketPrice * exampleQuantity

  let exampleFlatFee = 0
  let examplePercentageFee = 0
  let exampleFinalFee = 0

  if (formData.flat_fee_amount && formData.percentage_fee) {
    exampleFlatFee = parseFloat(formData.flat_fee_amount) || 0
    examplePercentageFee = (exampleSubtotal * (parseFloat(formData.percentage_fee) / 100)) || 0

    switch (formData.platform_fee_type) {
      case 'flat':
        exampleFinalFee = exampleFlatFee
        break
      case 'percentage':
        exampleFinalFee = examplePercentageFee
        break
      case 'higher_of_both':
        exampleFinalFee = Math.max(exampleFlatFee, examplePercentageFee)
        break
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground">
          Configure platform fees and payment settings
        </p>
      </div>

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500 rounded-md">
          <p className="text-sm text-green-600 dark:text-green-400">
            Settings updated successfully!
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Fee Configuration</CardTitle>
            <CardDescription>
              Set how platform fees are calculated for each ticket sale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platform_fee_type">Fee Calculation Method</Label>
              <Select
                value={formData.platform_fee_type}
                onValueChange={(value: typeof formData.platform_fee_type) =>
                  setFormData({ ...formData, platform_fee_type: value })
                }
              >
                <SelectTrigger id="platform_fee_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat Fee Only</SelectItem>
                  <SelectItem value="percentage">Percentage Only</SelectItem>
                  <SelectItem value="higher_of_both">Higher of Flat or Percentage</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.platform_fee_type === 'flat' && 'Apply a fixed fee per transaction'}
                {formData.platform_fee_type === 'percentage' && 'Apply a percentage of the ticket price'}
                {formData.platform_fee_type === 'higher_of_both' && 'Apply whichever is higher: flat fee or percentage'}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="flat_fee_amount">Flat Fee Amount ($)</Label>
                <Input
                  id="flat_fee_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.flat_fee_amount}
                  onChange={(e) => setFormData({ ...formData, flat_fee_amount: e.target.value })}
                  placeholder="2.00"
                  required
                  disabled={formData.platform_fee_type === 'percentage'}
                />
                <p className="text-xs text-muted-foreground">
                  Fixed fee per transaction
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentage_fee">Percentage Fee (%)</Label>
                <Input
                  id="percentage_fee"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.percentage_fee}
                  onChange={(e) => setFormData({ ...formData, percentage_fee: e.target.value })}
                  placeholder="3.00"
                  required
                  disabled={formData.platform_fee_type === 'flat'}
                />
                <p className="text-xs text-muted-foreground">
                  Percentage of ticket price
                </p>
              </div>
            </div>

            {/* Fee Preview */}
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-sm">Example Calculation</h3>
              <p className="text-xs text-muted-foreground">
                For {exampleQuantity} tickets at ${exampleTicketPrice} each (${exampleSubtotal} total):
              </p>
              <div className="space-y-1 text-sm">
                {formData.platform_fee_type !== 'percentage' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flat fee:</span>
                    <span>${exampleFlatFee.toFixed(2)}</span>
                  </div>
                )}
                {formData.platform_fee_type !== 'flat' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Percentage fee ({formData.percentage_fee}%):</span>
                    <span>${examplePercentageFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Platform fee collected:</span>
                  <span className="text-primary">${exampleFinalFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Business receives:</span>
                  <span>${(exampleSubtotal - exampleFinalFee).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Stripe Account</CardTitle>
            <CardDescription>
              Your platform's Stripe account ID for collecting fees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform_stripe_account_id">
                Platform Stripe Account ID (Optional)
              </Label>
              <Input
                id="platform_stripe_account_id"
                value={formData.platform_stripe_account_id}
                onChange={(e) =>
                  setFormData({ ...formData, platform_stripe_account_id: e.target.value })
                }
                placeholder="acct_..."
              />
              <p className="text-xs text-muted-foreground">
                If not provided, fees will be collected by your main Stripe account.
                This should be your Stripe Connect account ID if using separate accounts.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin')}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
