import { NextRequest, NextResponse } from 'next/server'
import { unsubscribeUser, getSubscriber } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  
  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter is required' },
      { status: 400 }
    )
  }
  
  try {
    const subscriber = await getSubscriber(email)
    
    if (!subscriber) {
      return NextResponse.json(
        { error: 'Email not found in our subscription list' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      email: subscriber.email,
      isActive: subscriber.isActive,
      subscribedAt: subscriber.subscribedAt
    })
    
  } catch (error) {
    console.error('Error checking subscriber:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
    
    const subscriber = await getSubscriber(normalizedEmail)
    if (!subscriber) {
      return NextResponse.json(
        { error: 'Email not found in our subscription list' },
        { status: 404 }
      )
    }
    
    if (!subscriber.isActive) {
      return NextResponse.json(
        { error: 'Email is already unsubscribed' },
        { status: 409 }
      )
    }
    
    const success = await unsubscribeUser(normalizedEmail)
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { message: 'Successfully unsubscribed from all future emails' },
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