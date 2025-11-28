import { NextRequest, NextResponse } from 'next/server'
import { updateAdminUser, deleteAdminUser, getAdminUserById } from '@/lib/db/admin-users'
import { verifyAdminAccess } from '@/lib/auth/admin-session'

interface RouteContext {
  params: Promise<{
    userId: string
  }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    // Verify admin is authenticated
    const session = await verifyAdminAccess()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId } = await context.params
    const body = await request.json()

    // Validate that the user exists
    const existingUser = await getAdminUserById(userId)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }

    // Validate email format if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    // Validate password length if provided
    if (body.password && body.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Update the user
    const updatedUser = await updateAdminUser(userId, body)

    // Remove password_hash from response
    const { password_hash, ...sanitizedUser } = updatedUser

    return NextResponse.json(sanitizedUser)
  } catch (error: any) {
    console.error('Error updating admin user:', error)

    // Check for unique constraint violation
    if (error.code === '23505' || error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'An admin user with this email already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update admin user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Verify admin is authenticated
    const session = await verifyAdminAccess()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId } = await context.params

    // Validate that the user exists
    const existingUser = await getAdminUserById(userId)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }

    // Prevent deleting yourself
    if (userId === session.userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete the user
    await deleteAdminUser(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting admin user:', error)
    return NextResponse.json(
      { error: 'Failed to delete admin user' },
      { status: 500 }
    )
  }
}
