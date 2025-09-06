import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateAdminCredentials, createSession, SESSION_COOKIE_NAME } from '@/lib/auth-utils'

function getAuthorizedEmails(): string[] {
  // Get authorized emails from Vercel environment variables
  const authorizedEmailsEnv = process.env.AUTHORIZED_EMAILS
  
  if (!authorizedEmailsEnv) {
    console.warn('AUTHORIZED_EMAILS environment variable not set')
    return []
  }
  
  try {
    // Support both comma-separated and JSON array formats
    if (authorizedEmailsEnv.startsWith('[')) {
      return JSON.parse(authorizedEmailsEnv)
    } else {
      return authorizedEmailsEnv.split(',').map(email => email.trim().toLowerCase())
    }
  } catch (error) {
    console.error('Error parsing AUTHORIZED_EMAILS:', error)
    return []
  }
}

function isEmailAuthorized(email: string): boolean {
  const authorizedEmails = getAuthorizedEmails()
  const normalizedEmail = email.toLowerCase().trim()
  
  return authorizedEmails.includes(normalizedEmail)
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }
    
    const normalizedEmail = email.toLowerCase().trim()
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }
    
    // Check if this is admin login (requires password)
    if (password) {
      if (validateAdminCredentials(normalizedEmail, password)) {
        const user = { email: normalizedEmail, isAdmin: true }
        const sessionToken = createSession(user)
        
        // Set session cookie
        const cookieStore = cookies()
        cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60, // 24 hours for admin
          path: '/'
        })
        
        return NextResponse.json({
          message: 'Admin login successful',
          user: {
            email: normalizedEmail,
            isAdmin: true,
            loginAt: new Date().toISOString()
          }
        })
      } else {
        return NextResponse.json(
          { error: 'Invalid admin credentials' },
          { status: 401 }
        )
      }
    }
    
    // Regular user login (email-only, check authorized emails from environment variables)
    if (!isEmailAuthorized(normalizedEmail)) {
      return NextResponse.json(
        { error: 'This email is not authorized to access the platform. Please contact the administrator for access.' },
        { status: 403 }
      )
    }
    
    const user = { email: normalizedEmail, isAdmin: false }
    const sessionToken = createSession(user)
    
    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    })
    
    return NextResponse.json({
      message: 'Login successful',
      user: {
        email: normalizedEmail,
        isAdmin: false,
        loginAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Logout - clear session cookie
    const cookieStore = cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
    
    return NextResponse.json({ message: 'Logged out successfully' })
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}