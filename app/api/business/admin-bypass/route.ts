import { NextRequest, NextResponse } from 'next/server'
import { createAdminBypassSession } from '@/lib/auth/business-session'

export async function POST(request: NextRequest) {
  try {
    const { businessId } = await request.json()

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      )
    }

    // TODO: In production, you should verify that the request is coming from
    // an authenticated platform admin before allowing bypass
    // For now, we'll allow it

    await createAdminBypassSession(businessId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin bypass error:', error)
    return NextResponse.json(
      { error: 'An error occurred creating admin bypass' },
      { status: 500 }
    )
  }
}
