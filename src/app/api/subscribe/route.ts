import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { sendEmail, getWelcomeEmailTemplate } from '@/lib/email'

// Check if we're in a Vercel environment
const isVercel = process.env.VERCEL === '1';

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const SUBSCRIBERS_FILE = join(process.cwd(), '.local-data', 'subscribers.json')

interface Subscriber {
  email: string
  subscribedAt: string
  isActive: boolean
  unsubscribedAt?: string
}

// In-memory store for Vercel (since file system is read-only)
let inMemorySubscribers: Subscriber[] = []

function ensureDataDirectory() {
  if (isVercel) return; // Skip in Vercel
  
  const dataDir = join(process.cwd(), '.local-data')
  if (!existsSync(dataDir)) {
    require('fs').mkdirSync(dataDir, { recursive: true })
  }
}

function getSubscribers(): Subscriber[] {
  if (isVercel) {
    return inMemorySubscribers
  }
  
  ensureDataDirectory()
  
  if (!existsSync(SUBSCRIBERS_FILE)) {
    return []
  }
  
  try {
    const data = readFileSync(SUBSCRIBERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading subscribers file:', error)
    return []
  }
}

function saveSubscribers(subscribers: Subscriber[]) {
  if (isVercel) {
    inMemorySubscribers = subscribers
    return
  }
  
  ensureDataDirectory()
  
  try {
    writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2))
  } catch (error) {
    console.error('Error saving subscribers:', error)
    throw new Error('Failed to save subscription')
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
    
    const subscribers = getSubscribers()
    
    // Check if email already exists
    const existingSubscriber = subscribers.find(sub => sub.email === normalizedEmail)
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { error: 'Email is already subscribed' },
          { status: 409 }
        )
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true
        existingSubscriber.subscribedAt = new Date().toISOString()
      }
    } else {
      // Add new subscriber
      subscribers.push({
        email: normalizedEmail,
        subscribedAt: new Date().toISOString(),
        isActive: true
      })
    }
    
    saveSubscribers(subscribers)
    
    // Send welcome email if Resend API key is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const welcomeHtml = getWelcomeEmailTemplate(normalizedEmail)
        const emailResult = await sendEmail({
          to: normalizedEmail,
          subject: 'Welcome to AI Coaching Platform! 🎉',
          html: welcomeHtml,
          from: process.env.EMAIL_FROM || 'AI Coaching Platform <noreply@yourdomain.com>'
        })
        
        if (emailResult.success) {
          console.log('Welcome email sent to:', normalizedEmail)
        } else {
          console.error('Failed to send welcome email:', emailResult.error)
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError)
        // Don't fail the subscription if email fails
      }
    }
    
    return NextResponse.json(
      { message: 'Successfully subscribed to updates' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const subscribers = getSubscribers()
    const activeSubscribers = subscribers.filter(sub => sub.isActive)
    
    return NextResponse.json({
      total: activeSubscribers.length,
      subscribers: activeSubscribers.map(sub => ({
        email: sub.email,
        subscribedAt: sub.subscribedAt
      }))
    })
    
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to unsubscribe
export async function DELETE(request: NextRequest) {
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
    
    const subscribers = getSubscribers()
    
    // Find and deactivate subscriber
    const existingSubscriber = subscribers.find(sub => sub.email === normalizedEmail)
    if (!existingSubscriber) {
      return NextResponse.json(
        { error: 'Email not found in subscription list' },
        { status: 404 }
      )
    }
    
    if (!existingSubscriber.isActive) {
      return NextResponse.json(
        { error: 'Email is already unsubscribed' },
        { status: 409 }
      )
    }
    
    // Deactivate subscription
    existingSubscriber.isActive = false
    existingSubscriber.unsubscribedAt = new Date().toISOString()
    
    saveSubscribers(subscribers)
    
    return NextResponse.json(
      { message: 'Successfully unsubscribed from updates' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}