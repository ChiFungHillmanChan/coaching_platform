#!/usr/bin/env node

/**
 * Newsletter Sending Script
 * 
 * Usage:
 *   node scripts/send-newsletter.js --title "New Chapter Available" --url "/en/new-chapter" --subject "Exciting Update!"
 * 
 * Environment Variables Required:
 *   - ADMIN_KEY: Secret key for authentication
 */

const fetch = require('node-fetch').default || require('node-fetch')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function sendNewsletter() {
  try {
    console.log('📧 AI Coaching Platform - Newsletter Sender')
    console.log('='.repeat(50))

    // Get command line arguments
    const args = process.argv.slice(2)
    const getArg = (flag) => {
      const index = args.indexOf(flag)
      return index > -1 && args[index + 1] ? args[index + 1] : null
    }

    let title = getArg('--title')
    let contentUrl = getArg('--url')
    let subject = getArg('--subject')

    // Interactive mode if arguments not provided
    if (!title) {
      title = await question('📝 Enter content title: ')
    }

    if (!contentUrl) {
      contentUrl = await question('🔗 Enter content URL (e.g., /en/new-chapter): ')
    }

    if (!subject) {
      subject = await question('📧 Enter email subject (optional, press Enter to use default): ')
    }

    // Validate inputs
    if (!title || !contentUrl) {
      console.error('❌ Title and URL are required!')
      process.exit(1)
    }

    // Prepare the request
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const payload = {
      contentTitle: title,
      contentUrl: contentUrl,
      subject: subject || undefined
    }

    console.log('\n📋 Newsletter Details:')
    console.log(`   Title: ${title}`)
    console.log(`   URL: ${contentUrl}`)
    console.log(`   Subject: ${subject || `New Content Available: ${title}`}`)
    
    const proceed = await question('\n🚀 Send newsletter to all subscribers? (y/N): ')
    
    if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
      console.log('📋 Newsletter sending cancelled.')
      process.exit(0)
    }

    console.log('\n📤 Sending newsletter...')

    // Send the newsletter
    const response = await fetch(`${baseUrl}/api/send-newsletter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Newsletter sent successfully!')
      console.log(`📊 Recipients: ${result.recipientCount}`)
      console.log(`📧 Subject: ${result.subject}`)
      if (result.note) {
        console.log(`📝 Note: ${result.note}`)
      }
    } else {
      console.error('❌ Failed to send newsletter:')
      console.error(`   Error: ${result.error}`)
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Handle command line help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
📧 AI Coaching Platform - Newsletter Sender

Usage:
  node scripts/send-newsletter.js [options]

Options:
  --title    Title of the new content
  --url      URL path to the content (e.g., /en/new-chapter)
  --subject  Email subject line (optional)
  --help     Show this help message

Examples:
  # Interactive mode
  node scripts/send-newsletter.js

  # Command line mode
  node scripts/send-newsletter.js \\
    --title "New Chapter: Advanced AI Techniques" \\
    --url "/en/advanced-ai" \\
    --subject "🚀 New Chapter Available!"

Environment Variables:
  NEXT_PUBLIC_BASE_URL  Base URL of your site (default: http://localhost:3000)
`)
  process.exit(0)
}

// Run the script
sendNewsletter()