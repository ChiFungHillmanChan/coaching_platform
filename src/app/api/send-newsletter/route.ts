import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const SUBSCRIBERS_FILE = join(process.cwd(), '.local-data', 'subscribers.json')
const NEWSLETTER_LOG_FILE = join(process.cwd(), '.local-data', 'newsletter-log.json')

interface Subscriber {
  email: string
  subscribedAt: string
  isActive: boolean
}

interface NewsletterLog {
  sentAt: string
  subject: string
  contentTitle: string
  contentUrl: string
  recipientCount: number
}

function getSubscribers(): Subscriber[] {
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

function logNewsletter(log: NewsletterLog) {
  const logFile = NEWSLETTER_LOG_FILE
  let logs: NewsletterLog[] = []
  
  if (existsSync(logFile)) {
    try {
      const data = readFileSync(logFile, 'utf-8')
      logs = JSON.parse(data)
    } catch (error) {
      console.error('Error reading newsletter log:', error)
    }
  }
  
  logs.push(log)
  
  try {
    require('fs').writeFileSync(logFile, JSON.stringify(logs, null, 2))
  } catch (error) {
    console.error('Error saving newsletter log:', error)
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
    const { contentTitle, contentUrl, subject } = await request.json()
    
    if (!contentTitle || !contentUrl) {
      return NextResponse.json(
        { error: 'Content title and URL are required' },
        { status: 400 }
      )
    }
    
    const subscribers = getSubscribers().filter(sub => sub.isActive)
    
    if (subscribers.length === 0) {
      return NextResponse.json(
        { message: 'No active subscribers found' },
        { status: 200 }
      )
    }
    
    const emailSubject = subject || `New Content Available: ${contentTitle}`
    const emailTemplate = generateEmailTemplate(contentTitle, contentUrl)
    
    // In a real implementation, you would integrate with an email service like:
    // - SendGrid
    // - Mailgun  
    // - AWS SES
    // - Resend
    
    // For now, we'll simulate sending and log the details
    console.log('📧 Newsletter would be sent to:', subscribers.length, 'subscribers')
    console.log('📧 Subject:', emailSubject)
    console.log('📧 Content Title:', contentTitle)
    console.log('📧 Content URL:', contentUrl)
    
    // Log the newsletter sending
    logNewsletter({
      sentAt: new Date().toISOString(),
      subject: emailSubject,
      contentTitle,
      contentUrl,
      recipientCount: subscribers.length
    })
    
    // TODO: Replace with actual email sending logic
    // Example with a service like Resend:
    /*
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    for (const subscriber of subscribers) {
      await resend.emails.send({
        from: 'noreply@yourdomain.com',
        to: subscriber.email,
        subject: emailSubject,
        html: emailTemplate
      })
    }
    */
    
    return NextResponse.json({
      message: `Newsletter prepared for ${subscribers.length} subscribers`,
      recipientCount: subscribers.length,
      subject: emailSubject,
      note: 'Email sending is currently simulated. Integrate with an email service to actually send emails.'
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
    const logFile = NEWSLETTER_LOG_FILE
    
    if (!existsSync(logFile)) {
      return NextResponse.json({ newsletters: [] })
    }
    
    const data = readFileSync(logFile, 'utf-8')
    const logs = JSON.parse(data)
    
    return NextResponse.json({ 
      newsletters: logs.sort((a: NewsletterLog, b: NewsletterLog) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
    })
    
  } catch (error) {
    console.error('Error fetching newsletter history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch newsletter history' },
      { status: 500 }
    )
  }
}