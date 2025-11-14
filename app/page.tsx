import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Event Ticketing Platform</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Create your business profile, manage events, and sell tickets with ease
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/business">Business Login</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-8 md:grid-cols-3 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Custom Business URL</CardTitle>
              <CardDescription>
                Get your own branded page to showcase your events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Each business gets a unique URL like yoursite.com/your-business-name
                to display events and business information
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Management</CardTitle>
              <CardDescription>
                Create and manage events with ease
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add event details, set ticket prices, manage availability, and
                track sales all in one place
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ticket Sales</CardTitle>
              <CardDescription>
                Sell tickets and manage customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track ticket sales, manage customer information, and monitor
                event attendance in real-time
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Create your business profile and start selling tickets today
          </p>
          <Button size="lg" asChild>
            <Link href="/admin">Go to Admin Dashboard</Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
