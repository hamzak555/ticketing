'use client'

import { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern'

interface LoginPageProps {
  params: Promise<{
    businessSlug: string
  }>
}

export default function LoginPage({ params }: LoginPageProps) {
  const { businessSlug } = use(params)
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [loadingBusiness, setLoadingBusiness] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const response = await fetch(`/api/businesses/slug/${businessSlug}`)
        const data = await response.json()
        if (response.ok) {
          setBusinessName(data.name)
          setBusinessId(data.id)
        }
      } catch (err) {
        console.error('Error fetching business:', err)
      } finally {
        setLoadingBusiness(false)
      }
    }
    fetchBusiness()
  }, [businessSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/business/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Redirect to business dashboard
      router.push(`/${businessSlug}/dashboard`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-2xl font-bold text-foreground">Ticketing</h1>
      </div>
      <div className="absolute inset-0">
        <InteractiveGridPattern
          className="[mask-image:radial-gradient(ellipse_1000px_100%_at_82%_50%,white,transparent)]"
          width={60}
          height={60}
          squares={[30, 20]}
        />
      </div>
      <Card className="w-full max-w-md relative z-10">
        <CardHeader>
          <CardTitle>
            {loadingBusiness ? 'Business Dashboard Login' : `${businessName} Dashboard`}
          </CardTitle>
          <CardDescription>
            {loadingBusiness
              ? 'Enter your credentials to access the business dashboard'
              : `Sign in to access ${businessName}'s dashboard`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-3">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
