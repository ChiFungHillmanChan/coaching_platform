import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Check if we're in a Vercel environment
const isVercel = process.env.VERCEL === '1';

const INVITED_EMAILS_FILE = join(process.cwd(), '.local-data', 'invited-emails.json')

interface InvitedEmail {
  email: string
  invitedAt: string
  lastLoginAt?: string
  isActive: boolean
}

// In-memory store for Vercel
let inMemoryInvitedEmails: InvitedEmail[] = []

function ensureDataDirectory() {
  if (isVercel) return; // Skip in Vercel
  
  const dataDir = join(process.cwd(), '.local-data')
  if (!existsSync(dataDir)) {
    require('fs').mkdirSync(dataDir, { recursive: true })
  }
}

function getInvitedEmails(): InvitedEmail[] {
  if (isVercel) {
    return inMemoryInvitedEmails
  }
  
  ensureDataDirectory()
  
  if (!existsSync(INVITED_EMAILS_FILE)) {
    return []
  }
  
  try {
    const data = readFileSync(INVITED_EMAILS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading invited emails file:', error)
    return []
  }
}

function saveInvitedEmails(emails: InvitedEmail[]) {
  if (isVercel) {
    inMemoryInvitedEmails = emails
    return
  }
  
  ensureDataDirectory()
  
  try {
    writeFileSync(INVITED_EMAILS_FILE, JSON.stringify(emails, null, 2))
  } catch (error) {
    console.error('Error saving invited emails:', error)
    throw new Error('Failed to save invited email')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
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
    
    const invitedEmails = getInvitedEmails()
    
    // Check if email already exists
    const existingEmail = invitedEmails.find(entry => entry.email === normalizedEmail)
    if (existingEmail) {
      if (existingEmail.isActive) {
        return NextResponse.json(
          { error: 'Email is already invited' },
          { status: 409 }
        )
      } else {
        // Reactivate invitation
        existingEmail.isActive = true
        existingEmail.invitedAt = new Date().toISOString()
      }
    } else {
      // Add new invited email
      invitedEmails.push({
        email: normalizedEmail,
        invitedAt: new Date().toISOString(),
        isActive: true
      })
    }
    
    saveInvitedEmails(invitedEmails)
    
    return NextResponse.json(
      { message: 'Email invited successfully', email: normalizedEmail },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Invite email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const invitedEmails = getInvitedEmails()
    
    return NextResponse.json({
      total: invitedEmails.filter(email => email.isActive).length,
      emails: invitedEmails.map(email => ({
        email: email.email,
        invitedAt: email.invitedAt,
        lastLoginAt: email.lastLoginAt,
        isActive: email.isActive
      }))
    })
    
  } catch (error) {
    console.error('Error fetching invited emails:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    const invitedEmails = getInvitedEmails()
    const emailIndex = invitedEmails.findIndex(entry => entry.email === email.toLowerCase().trim())
    
    if (emailIndex === -1) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      )
    }
    
    // Deactivate instead of deleting to maintain history
    invitedEmails[emailIndex].isActive = false
    
    saveInvitedEmails(invitedEmails)
    
    return NextResponse.json({
      message: 'Email access revoked successfully'
    })
    
  } catch (error) {
    console.error('Error revoking email access:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}