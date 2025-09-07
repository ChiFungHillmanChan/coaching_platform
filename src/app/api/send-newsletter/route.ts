import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sendEmail, getNewsletterTemplate } from '@/lib/email'
import { getAllActiveSubscribers, saveNewsletterLog, getNewsletterLogs, type NewsletterLog } from '@/lib/storage'

// Force dynamic rendering
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

function generateEmailTemplate(contentTitle: string, contentUrl: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const fullUrl = contentUrl.startsWith('http') ? contentUrl : `${baseUrl}${contentUrl}`
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Content Available</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
        .button { display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
        .footer { text-align: center; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>New Content Available</h1>
    </div>
    
    <div class="content">
        <h2>Thank you for subscribing to my page!</h2>
        
        <p>I'm excited to share new content with you:</p>
        
        <h3>${contentTitle}</h3>
        
        <p>You can now view this new content by clicking the link below:</p>
        
        <p style="text-align: center;">
            <a href="${fullUrl}" class="button">View New Content</a>
        </p>
    </div>
    
    <div class="footer">
        <p>Thank you for being a valued subscriber!</p>
        <p><small>This email was sent because you subscribed to updates. If you no longer wish to receive these emails, please contact us to unsubscribe.</small></p>
    </div>
</body>
</html>
  `.trim()
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const isAuthenticated = await checkAdminAuth()
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }
    
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured. Please add RESEND_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }

    const { contentTitle, contentUrl, subject, sections } = await request.json()
    
    // Support both old format (contentTitle, contentUrl) and new format (sections)
    let newsletterSections
    let emailSubject
    
    if (sections && Array.isArray(sections)) {
      // New format with custom sections
      newsletterSections = sections
      emailSubject = subject || 'New Update from AI Coaching Platform'
    } else if (contentTitle && contentUrl) {
      // Legacy format - convert to sections
      newsletterSections = [{
        title: 'New Content Available',
        content: `Check out our latest update: ${contentTitle}`,
        link: contentUrl.startsWith('http') ? contentUrl : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${contentUrl}`
      }]
      emailSubject = subject || `New Content Available: ${contentTitle}`
    } else {
      return NextResponse.json(
        { error: 'Either provide sections array or contentTitle/contentUrl' },
        { status: 400 }
      )
    }
    
    const subscribers = await getAllActiveSubscribers()
    
    if (subscribers.length === 0) {
      return NextResponse.json(
        { message: 'No active subscribers found' },
        { status: 200 }
      )
    }
    
    console.log(`📧 Sending newsletter to ${subscribers.length} subscribers`)
    console.log(`📧 Subject: ${emailSubject}`)
    
    // Send emails in batches to avoid rate limits
    const batchSize = 10
    const results = []
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)
      const batchPromises = batch.map(async (subscriber) => {
        const newsletterHtml = getNewsletterTemplate({
          subject: emailSubject,
          headline: emailSubject,
          sections: newsletterSections,
          subscriberEmail: subscriber.email
        })
        
        return sendEmail({
          to: subscriber.email,
          subject: emailSubject,
          html: newsletterHtml,
          from: process.env.EMAIL_FROM || 'AI Coaching Platform <onboarding@resend.dev>'
        })
      })
      
      const batchResults = await Promise.allSettled(batchPromises)
      results.push(...batchResults)
      
      // Wait between batches to respect rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length
    
    const failed = results.length - successful
    
    console.log(`Newsletter sent: ${successful} successful, ${failed} failed`)
    
    // Log the newsletter sending
    const newsletterLog: NewsletterLog = {
      id: `newsletter_${Date.now()}`,
      sentAt: new Date().toISOString(),
      subject: emailSubject,
      contentTitle: contentTitle || emailSubject,
      contentUrl: contentUrl || '',
      recipientCount: subscribers.length,
      successCount: successful,
      failedCount: failed
    }
    
    await saveNewsletterLog(newsletterLog)
    
    return NextResponse.json({
      message: 'Newsletter sent successfully',
      stats: {
        totalSubscribers: subscribers.length,
        successful,
        failed
      },
      subject: emailSubject
    })
    
  } catch (error) {
    console.error('Newsletter sending error:', error)
    return NextResponse.json(
      { error: 'Failed to send newsletter' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check admin authentication
    const isAuthenticated = await checkAdminAuth()
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }
    
    const newsletters = await getNewsletterLogs(50)
    
    return NextResponse.json({ 
      newsletters
    })
    
  } catch (error) {
    console.error('Error fetching newsletter history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch newsletter history' },
      { status: 500 }
    )
  }
}