import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Check admin credentials
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Admin credentials not configured' },
        { status: 500 }
      )
    }
    
    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Create session cookie
    const sessionData = {
      email: adminEmail,
      isAdmin: true,
      loginTime: new Date().toISOString()
    }
    
    const cookieStore = await cookies()
    cookieStore.set('admin-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 4, // 4 hours
      path: '/',
      sameSite: 'lax'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Logged in successfully'
    })
    
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('admin-session')
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('admin-session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 401 }
      )
    }
    
    const session = JSON.parse(sessionCookie.value)
    
    // Check if session is expired (4 hours)
    const loginTime = new Date(session.loginTime)
    const now = new Date()
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)
    
    if (hoursDiff > 4) {
      cookieStore.delete('admin-session')
      return NextResponse.json(
        { isAuthenticated: false, error: 'Session expired' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      isAuthenticated: true,
      email: session.email
    })
    
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { isAuthenticated: false },
      { status: 401 }
    )
  }
}