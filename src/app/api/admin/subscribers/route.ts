import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAllActiveSubscribers, getSubscriberStats } from '@/lib/storage'

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

export async function GET() {
  try {
    const isAuthenticated = await checkAdminAuth()
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const subscribers = await getAllActiveSubscribers()
    const stats = await getSubscriberStats()
    
    return NextResponse.json({
      subscribers,
      stats,
      total: subscribers.length
    })
    
  } catch (error) {
    console.error('Error fetching admin subscribers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}