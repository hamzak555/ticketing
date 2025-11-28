import { NextRequest, NextResponse } from 'next/server'
import { getBusinessUsers, createBusinessUser } from '@/lib/db/business-users'
import { verifyBusinessAccess } from '@/lib/auth/business-session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params

    // Verify access
    const session = await verifyBusinessAccess(businessId)
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const users = await getBusinessUsers(businessId)

    // Remove password hashes from response
    const safeUsers = users.map(({ password_hash, ...user }) => user)

    return NextResponse.json(safeUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params

    // Verify access
    const session = await verifyBusinessAccess(businessId)
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, password, name, role } = body

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      )
    }

    if (role !== 'admin' && role !== 'regular') {
      return NextResponse.json(
        { error: 'Role must be either "admin" or "regular"' },
        { status: 400 }
      )
    }

    const user = await createBusinessUser({
      business_id: businessId,
      email,
      password,
      name,
      role,
      is_active: true,
    })

    // Remove password hash from response
    const { password_hash, ...safeUser } = user

    return NextResponse.json(safeUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)

    // Check if it's a unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate')) {
      return NextResponse.json(
        { error: 'A user with this email already exists for this business' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
