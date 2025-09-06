import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

const SUBSCRIBERS_FILE = join(process.cwd(), '.local-data', 'subscribers.json')

interface Subscriber {
  email: string
  subscribedAt: string
  isActive: boolean
}

function ensureDataDirectory() {
  const dataDir = join(process.cwd(), '.local-data')
  if (!existsSync(dataDir)) {
    require('fs').mkdirSync(dataDir, { recursive: true })
  }
}

function getSubscribers(): Subscriber[] {
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