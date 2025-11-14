'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface EventFormProps {
  businessId: string
  initialData?: {
    id?: string
    title: string
    description: string
    event_date: string
    event_time: string | null
    location: string
    image_url: string | null
    status: 'draft' | 'published' | 'cancelled'
  }
}

export function EventForm({ businessId, initialData }: EventFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null)
  const [date, setDate] = useState<Date | undefined>(
    initialData?.event_date ? new Date(initialData.event_date) : undefined
  )

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    event_time: initialData?.event_time || '',
    location: initialData?.location || '',
    status: initialData?.status || 'draft' as const,
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }

      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return initialData?.image_url || null

    try {
      const supabase = createClient()
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${businessId}/${Date.now()}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(fileName, imageFile)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (err) {
      console.error('Image upload error:', err)
      throw new Error('Failed to upload image')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!date) {
        throw new Error('Please select an event date')
      }

      // Upload image if there's a new one
      const imageUrl = await uploadImage()

      const url = initialData?.id
        ? `/api/businesses/${businessId}/events/${initialData.id}`
        : `/api/businesses/${businessId}/events`

      const method = initialData?.id ? 'PATCH' : 'POST'

      const payload = {
        title: formData.title,
        description: formData.description || null,
        event_date: format(date, 'yyyy-MM-dd'),
        event_time: formData.event_time || null,
        location: formData.location || null,
        image_url: imageUrl,
        status: formData.status,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save event')
      }

      router.push(`/business/${businessId}/events`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{initialData?.id ? 'Edit Event' : 'Create New Event'}</CardTitle>
          <CardDescription>
            {initialData?.id
              ? 'Update event details and settings'
              : 'Set up a new event for ticket sales'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Summer Music Festival 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your event..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Event Image (Square format recommended)</Label>
            {imagePreview ? (
              <div className="relative w-64 h-64 border rounded-md overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Event preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Upload a square image (1:1 ratio) for best results. Max size: 5MB
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Event Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_time">Event Time</Label>
              <Input
                id="event_time"
                type="time"
                value={formData.event_time}
                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                placeholder="e.g., 19:00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Central Park, New York"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'draft' | 'published' | 'cancelled') =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Published events will be visible on your public page
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialData?.id ? 'Update Event' : 'Create Event'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/business/${businessId}/events`)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
