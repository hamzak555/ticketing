'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface EventItemFormProps {
  businessId: string
  eventId: string
  initialData?: {
    id: string
    name: string
    description: string
    category: 'merchandise' | 'food' | 'beverage' | 'addon' | 'other'
    price: number
    total_quantity: number
    available_quantity: number
  }
}

export function EventItemForm({ businessId, eventId, initialData }: EventItemFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'merchandise' as const,
    price: initialData?.price?.toString() || '',
    total_quantity: initialData?.total_quantity?.toString() || '',
    available_quantity: initialData?.available_quantity?.toString() || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const payload = {
        event_id: eventId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        total_quantity: parseInt(formData.total_quantity, 10),
        available_quantity: parseInt(formData.available_quantity, 10),
      }

      const url = initialData
        ? `/api/businesses/${businessId}/events/${eventId}/items/${initialData.id}`
        : `/api/businesses/${businessId}/events/${eventId}/items`

      const method = initialData ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save item')
      }

      router.push(`/business/${businessId}/events/${eventId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Item' : 'Create New Item'}</CardTitle>
        <CardDescription>
          Add merchandise, food, drinks, or other items for sale at this event
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Event T-Shirt, Popcorn, VIP Upgrade"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the item..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value: typeof formData.category) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="merchandise">Merchandise</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="beverage">Beverage</SelectItem>
                <SelectItem value="addon">Add-on</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_quantity">Total Quantity</Label>
              <Input
                id="total_quantity"
                type="number"
                min="1"
                value={formData.total_quantity}
                onChange={(e) => {
                  const total = e.target.value
                  setFormData({
                    ...formData,
                    total_quantity: total,
                    // Auto-set available quantity to match total if creating new item
                    available_quantity: initialData ? formData.available_quantity : total,
                  })
                }}
                placeholder="100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_quantity">Available Quantity</Label>
              <Input
                id="available_quantity"
                type="number"
                min="0"
                max={formData.total_quantity}
                value={formData.available_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, available_quantity: e.target.value })
                }
                placeholder="100"
                required
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialData ? 'Update Item' : 'Create Item'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
