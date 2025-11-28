import { NextRequest, NextResponse } from 'next/server'
import { verifyBusinessUserPassword } from '@/lib/db/business-users'
import { createBusinessSession } from '@/lib/auth/business-session'

export async function POST(request: NextRequest) {
  try {
    const { businessId, email, password } = await request.json()

    if (!businessId || !email || !password) {
      return NextResponse.json(
        { error: 'Business ID, email, and password are required' },
        { status: 400 }
      )
    }

    const user = await verifyBusinessUserPassword(businessId, email, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    await createBusinessSession(user)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
