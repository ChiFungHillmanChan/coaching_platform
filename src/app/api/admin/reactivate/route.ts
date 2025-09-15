import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { saveSubscriber, getSubscriber } from '@/lib/storage'

export const dynamic = 'force-dynamic'

// Middleware to check admin authentication
async function checkAdminAuth() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('admin-session')

  if (!sessionCookie) {
    return false
  }

  try {
    const session = JSON.parse(sessionCookie.value)

    // Check if session is expired (4 hours)
    const loginTime = new Date(session.loginTime)
    const now = new Date()
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

    if (hoursDiff > 4 || !session.isAdmin) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await checkAdminAuth()

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const existingSubscriber = await getSubscriber(email)
    if (!existingSubscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    if (existingSubscriber.isActive) {
      return NextResponse.json(
        { error: 'Subscriber is already active' },
        { status: 400 }
      )
    }

    // Reactivate without sending welcome email
    existingSubscriber.isActive = true
    existingSubscriber.unsubscribedAt = undefined
    // Keep original subscribedAt date

    await saveSubscriber(existingSubscriber)

    return NextResponse.json({
      success: true,
      message: 'Subscriber reactivated successfully (no email sent)'
    })

  } catch (error) {
    console.error('Error reactivating subscriber:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}