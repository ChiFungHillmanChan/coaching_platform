#!/usr/bin/env node

/**
 * Test script for email functionality
 * Usage: node scripts/test-email.js
 */

const { sendEmail, getWelcomeEmailTemplate } = require('../src/lib/email.ts')

async function testWelcomeEmail() {
  console.log('🧪 Testing welcome email...')
  
  const testEmail = 'test@example.com'
  const welcomeHtml = getWelcomeEmailTemplate(testEmail)
  
  const result = await sendEmail({
    to: testEmail,
    subject: 'Test Welcome Email',
    html: welcomeHtml,
    from: process.env.EMAIL_FROM || 'Test <test@yourdomain.com>'
  })
  
  if (result.success) {
    console.log('✅ Welcome email sent successfully!')
    console.log('Result:', result.data)
  } else {
    console.error('❌ Failed to send welcome email')
    console.error('Error:', result.error)
  }
}

async function testNewsletterAPI() {
  console.log('🧪 Testing newsletter API...')
  
  const response = await fetch('http://localhost:3000/api/send-newsletter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: 'Test Newsletter',
      sections: [
        {
          title: 'Welcome to Our Newsletter',
          content: 'This is a test newsletter to verify email functionality.',
          link: 'https://example.com'
        },
        {
          title: 'Another Section',
          content: 'More test content here.'
        }
      ]
    })
  })
  
  const result = await response.json()
  
  if (response.ok) {
    console.log('✅ Newsletter API test successful!')
    console.log('Result:', result)
  } else {
    console.error('❌ Newsletter API test failed')
    console.error('Error:', result)
  }
}

async function main() {
  console.log('📧 Email Functionality Test Suite\n')
  
  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables')
    console.log('Please add your Resend API key to your .env file:')
    console.log('RESEND_API_KEY=re_your_api_key_here')
    process.exit(1)
  }
  
  console.log('✅ RESEND_API_KEY found')
  
  try {
    // Test 1: Direct email sending
    await testWelcomeEmail()
    
    console.log('\n' + '='.repeat(50) + '\n')
    
    // Test 2: Newsletter API
    console.log('⚠️  Note: Newsletter API test requires the dev server to be running')
    console.log('Run "npm run dev" in another terminal first\n')
    
    // Uncomment the line below to test the newsletter API
    // await testNewsletterAPI()
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}