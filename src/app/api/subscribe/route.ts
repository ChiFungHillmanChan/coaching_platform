import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, getWelcomeEmailTemplate } from '@/lib/email'
import { saveSubscriber, getSubscriber, getAllActiveSubscribers, unsubscribeUser, type Subscriber } from '@/lib/storage'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

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
    
    // Check if email already exists
    const existingSubscriber = await getSubscriber(normalizedEmail)
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
        existingSubscriber.unsubscribedAt = undefined
        await saveSubscriber(existingSubscriber)
      }
    } else {
      // Add new subscriber
      const newSubscriber: Subscriber = {
        email: normalizedEmail,
        subscribedAt: new Date().toISOString(),
        isActive: true,
        source: 'popup'
      }
      await saveSubscriber(newSubscriber)
    }
    
    // Send welcome email if Resend API key is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const welcomeHtml = getWelcomeEmailTemplate(normalizedEmail)
        const emailResult = await sendEmail({
          to: normalizedEmail,
          subject: 'Welcome to AI Coaching Platform! 🎉',
          html: welcomeHtml,
          from: process.env.EMAIL_FROM || 'AI Coaching Platform <onboarding@resend.dev>'
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
    const activeSubscribers = await getAllActiveSubscribers()
    
    return NextResponse.json({
      total: activeSubscribers.length,
      subscribers: activeSubscribers.map(sub => ({
        email: sub.email,
        subscribedAt: sub.subscribedAt,
        source: sub.source
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
    
    const existingSubscriber = await getSubscriber(normalizedEmail)
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
    
    const success = await unsubscribeUser(normalizedEmail)
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      )
    }
    
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