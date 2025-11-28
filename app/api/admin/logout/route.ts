import { NextResponse } from 'next/server'
import { deleteAdminSession } from '@/lib/auth/admin-session'

export async function POST() {
  try {
    await deleteAdminSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error during admin logout:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}
