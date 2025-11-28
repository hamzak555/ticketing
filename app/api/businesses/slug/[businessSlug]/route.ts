import { NextRequest, NextResponse } from 'next/server'
import { getBusinessBySlug } from '@/lib/db/businesses'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessSlug: string }> }
) {
  try {
    const { businessSlug } = await params
    const business = await getBusinessBySlug(businessSlug)

    return NextResponse.json(business)
  } catch (error) {
    return NextResponse.json(
      { error: 'Business not found' },
      { status: 404 }
    )
  }
}
