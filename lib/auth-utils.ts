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

export function isEmailAuthorized(email: string): boolean {
  const authorizedEmails = getAuthorizedEmails()
  const normalizedEmail = email.toLowerCase().trim()
  
  return authorizedEmails.includes(normalizedEmail)
}

export function isAdminEmail(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim()
  if (!adminEmail) {
    console.error('ADMIN_EMAIL environment variable not set')
    return false
  }
  
  const normalizedEmail = email.toLowerCase().trim()
  
  // Check if email matches the admin email from environment variable
  return normalizedEmail === adminEmail
}

export function getUserFromSession(sessionCookie: string | undefined): { email: string; isAdmin: boolean } | null {
  if (!sessionCookie) return null
  
  try {
    // Simple base64 decode (in production, use proper JWT)
    const decoded = Buffer.from(sessionCookie, 'base64').toString('utf-8')
    const [email] = decoded.split(':')
    
    if (!email) return null
    
    // Check if email is still authorized
    if (!isEmailAuthorized(email)) return null
    
    return {
      email,
      isAdmin: isAdminEmail(email)
    }
  } catch (error) {
    return null
  }
}