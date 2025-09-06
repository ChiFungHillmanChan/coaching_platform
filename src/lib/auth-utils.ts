import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'coaching-platform-session'

interface User {
  email: string
  isAdmin: boolean
}

interface SessionData {
  email: string
  isAdmin: boolean
  timestamp: number
}

export function validateAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  
  if (!adminEmail || !adminPassword) {
    console.error('Admin credentials not configured in environment variables')
    return false
  }
  
  return email === adminEmail && password === adminPassword
}

export function createSession(user: User): string {
  const sessionData: SessionData = {
    email: user.email,
    isAdmin: user.isAdmin,
    timestamp: Date.now()
  }
  
  // In a real app, you'd encrypt this and use a proper session store
  // For demo purposes, we'll use base64 encoding
  return Buffer.from(JSON.stringify(sessionData)).toString('base64')
}

export function getUserFromSession(sessionToken?: string): User | null {
  if (!sessionToken) {
    return null
  }
  
  try {
    const sessionData: SessionData = JSON.parse(Buffer.from(sessionToken, 'base64').toString())
    
    // Check if session is expired (24 hours)
    const twentyFourHours = 24 * 60 * 60 * 1000
    if (Date.now() - sessionData.timestamp > twentyFourHours) {
      return null
    }
    
    return {
      email: sessionData.email,
      isAdmin: sessionData.isAdmin
    }
  } catch (error) {
    console.error('Invalid session token:', error)
    return null
  }
}

export function getCurrentUser(): User | null {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
  return getUserFromSession(sessionCookie)
}

export function clearSession(): void {
  const cookieStore = cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export { SESSION_COOKIE_NAME }