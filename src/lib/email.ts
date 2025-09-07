import { Resend } from 'resend'

let resend: Resend | null = null

function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const client = getResendClient()
    if (!client) {
      throw new Error('Resend client not initialized. Check RESEND_API_KEY environment variable.')
    }

    const result = await client.emails.send({
      from: options.from || 'AI Coaching Platform <onboarding@resend.dev>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    
    console.log('Email sent successfully:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

export function getWelcomeEmailTemplate(subscriberEmail: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to AI Coaching Platform</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h1 style="color: #2563eb; margin: 0 0 10px 0; font-size: 28px;">Welcome to AI Coaching Platform! 🎉</h1>
        <p style="font-size: 18px; color: #6b7280; margin: 0;">Thank you for subscribing to our newsletter</p>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 10px; border: 1px solid #e5e7eb;">
        <h2 style="color: #1f2937; margin-top: 0;">What's next?</h2>
        
        <p>Hi there! 👋</p>
        
        <p>We're excited to have you on board! You've successfully subscribed to receive updates about:</p>
        
        <ul style="color: #4b5563; margin: 20px 0;">
          <li>🤖 <strong>AI Tools & Tutorials</strong> - Learn about the latest AI tools and how to use them</li>
          <li>🌐 <strong>Web Development Tips</strong> - Practical guides for modern web development</li>
          <li>📚 <strong>Learning Resources</strong> - Curated content to help you grow your skills</li>
          <li>🚀 <strong>New Course Updates</strong> - Be the first to know about new content</li>
        </ul>
        
        <p>We'll only send you valuable content - no spam, we promise! 📧</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">🎯 Quick Start Guide</h3>
          <p style="margin-bottom: 0;">Ready to dive in? Check out our <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site.com'}/welcome" style="color: #2563eb; text-decoration: none;">getting started guide</a> to make the most of our platform.</p>
        </div>
        
        <hr style="border: none; height: 1px; background-color: #e5e7eb; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #6b7280;">
          If you ever want to unsubscribe, you can do so <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site.com'}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}" style="color: #6b7280;">here</a>.
        </p>
        
        <p style="margin-bottom: 0;">
          Best regards,<br>
          <strong>The AI Coaching Platform Team</strong>
        </p>
      </div>
    </body>
    </html>
  `
}

export function getNewsletterTemplate(content: {
  subject: string
  headline: string
  sections: Array<{
    title: string
    content: string
    link?: string
  }>
  subscriberEmail: string
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${content.subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h1 style="color: #2563eb; margin: 0 0 10px 0; font-size: 28px;">${content.headline}</h1>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">${new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 10px; border: 1px solid #e5e7eb;">
        ${content.sections.map(section => `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">${section.title}</h2>
            <p style="color: #4b5563; margin-bottom: 15px;">${section.content}</p>
            ${section.link ? `<a href="${section.link}" style="color: #2563eb; text-decoration: none; font-weight: 500;">Read more →</a>` : ''}
          </div>
        `).join('')}
        
        <hr style="border: none; height: 1px; background-color: #e5e7eb; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #6b7280;">
          You're receiving this because you subscribed to AI Coaching Platform updates. 
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site.com'}/unsubscribe?email=${encodeURIComponent(content.subscriberEmail)}" style="color: #6b7280;">Unsubscribe</a>
        </p>
      </div>
    </body>
    </html>
  `
}