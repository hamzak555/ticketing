'use client'

import { useState, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface LogoUploadProps {
  businessId: string
  currentLogoUrl: string | null
  onLogoChange: (url: string | null) => void
  disabled?: boolean
}

export function LogoUpload({ businessId, currentLogoUrl, onLogoChange, disabled }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(currentLogoUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploading(true)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('businessId', businessId)

      // Upload to API
      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload logo')
      }

      const data = await response.json()

      // Update preview and notify parent
      setLogoPreview(data.url)
      onLogoChange(data.url)

      toast.success('Logo uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload logo')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    onLogoChange(null)
    toast.success('Logo removed')
  }

  return (
    <div className="space-y-2">
      <Label>Business Logo</Label>

      <div className="flex items-start gap-4">
        {/* Logo Preview */}
        <div className="flex-shrink-0">
          {logoPreview ? (
            <div className="relative w-32 h-32 rounded-lg border bg-muted overflow-hidden group">
              <Image
                src={logoPreview}
                alt="Business logo"
                fill
                className="object-contain p-2"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                disabled={disabled || uploading}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-lg border-2 border-dashed bg-muted flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Uploading...' : logoPreview ? 'Change Logo' : 'Upload Logo'}
          </Button>

          <p className="text-xs text-muted-foreground">
            Max size: 5MB.
          </p>

          {logoPreview && (
            <p className="text-xs text-green-600">
              Logo will replace business name on your public page.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
