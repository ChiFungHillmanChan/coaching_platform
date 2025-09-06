# 📧 Email Subscription Setup Guide

## Quick Setup Steps

### 1. **Start Your Development Server**
```bash
npm run dev
```
Your site will be available at `http://localhost:3000`

### 2. **Test Email Subscription**
- **Desktop**: Use the email form in the header
- **Mobile**: Click hamburger menu → use email form in Quick Actions
- Enter any email (e.g., `test@example.com`) and click "Subscribe"
- You'll see a success message

### 3. **View Subscribers**
Check your subscribers anytime:
```bash
curl http://localhost:3000/api/subscribe
```

### 4. **Send Newsletter When You Add New Content**

**Option A: Interactive Script (Recommended)**
```bash
node scripts/send-newsletter.js
```
Follow the prompts to enter:
- Content title (e.g., "New Chapter: Advanced AI Techniques")
- Content URL (e.g., "/en/advanced-ai")
- Email subject (optional)

**Option B: Command Line**
```bash
node scripts/send-newsletter.js \
  --title "New Chapter Available" \
  --url "/en/new-chapter" \
  --subject "🚀 Exciting Update!"
```

## 📱 Mobile-Friendly Features

✅ **Responsive Design**: Works perfectly on all screen sizes  
✅ **Touch-Friendly**: Large tap targets and smooth interactions  
✅ **Smart Layout**: Email form hidden on small screens, shown in hamburger menu  
✅ **Easy Access**: Quick Actions in vertical dropdown menu  

## 🎯 User Experience

### Desktop Users:
- See email subscription directly in header
- Click hamburger menu for additional actions
- Clean, uncluttered interface

### Mobile Users:
- Hamburger menu contains everything they need
- Email subscription form easily accessible
- Optimized for touch interactions

## 📂 Data Storage

Your subscribers are stored in:
```
.local-data/subscribers.json
```

Example subscriber data:
```json
[
  {
    "email": "user@example.com",
    "subscribedAt": "2024-09-06T12:00:00.000Z",
    "isActive": true
  }
]
```

## 🔧 How It Works

1. **Users subscribe** via the email form (header or hamburger menu)
2. **You add new content** to your coaching platform
3. **You run the newsletter script** to notify subscribers
4. **Users receive beautiful emails** with links to your new content
5. **Users can unsubscribe** anytime at `/unsubscribe`

## 📧 Email Template Preview

When you send a newsletter, subscribers receive a professional HTML email with:
- Your platform branding
- Content title and description  
- "View New Content" button
- Unsubscribe link
- Mobile-responsive design

## 🚀 Production Deployment

For production, you may want to integrate with email services like:
- **Resend** (easiest to set up)
- **SendGrid**
- **Mailgun** 
- **AWS SES**

The email sending logic is ready - just uncomment the integration code in `/api/send-newsletter/route.ts`

## ✅ You're All Set!

Your email subscription system is now:
- ✅ Fully functional
- ✅ Mobile-friendly
- ✅ Easy to use
- ✅ Professional looking
- ✅ Ready for production

Start collecting subscribers and engaging your coaching platform audience! 🎯


Perfect! Now everything is working. Let me summarize what I've set up for you:

  ✅ Complete Email System Setup

  1. How to Get Resend API Key:

  1. Go to https://resend.com → Sign up
  2. Dashboard → "API Keys" → "Create API Key"
  3. Copy the key (starts with re_)
  4. Add to your .env: RESEND_API_KEY=re_your_key_here

  2. Email Functionality Implemented:

  ✨ Automatic Welcome Emails

  - Triggers: When someone subscribes via your website
  - Template: Professional HTML with your branding
  - Features: Unsubscribe link, mobile responsive, error handling

  📧 Newsletter System

  - API Endpoint: /api/send-newsletter
  - Batched Sending: 10 emails at a time (respects rate limits)
  - Templates: Multi-section newsletters with links
  - Error Handling: Continues even if some emails fail

  3. Files Created/Updated:

  1. /src/lib/email.ts - Email utilities and templates
  2. /src/app/api/subscribe/route.ts - Updated with welcome email
  3. /src/app/api/send-newsletter/route.ts - Updated with Resend integration
  4. EMAIL_SETUP_GUIDE.md - Complete setup instructions
  5. .env.example - All required environment variables

  4. How to Send Emails to Subscribers:

  Option A: API Call

  curl -X POST http://localhost:3000/api/send-newsletter \
    -H "Content-Type: application/json" \
    -d '{
      "subject": "Weekly Update",
      "sections": [
        {
          "title": "New Content Available", 
          "content": "Check out our latest tutorial on AI tools",
          "link": "https://yoursite.com/new-tutorial"
        }
      ]
    }'

  Option B: Simple Content Update

  curl -X POST http://localhost:3000/api/send-newsletter \
    -H "Content-Type: application/json" \
    -d '{
      "contentTitle": "New AI Tutorial Available",
      "contentUrl": "/tutorials/ai-basics",
      "subject": "New Tutorial: AI Basics"
    }'

  5. Required Environment Variables:

  RESEND_API_KEY=re_your_actual_api_key
  EMAIL_FROM=Your Name <noreply@yourdomain.com>
  NEXT_PUBLIC_BASE_URL=https://yourdomain.com

  6. What Happens Now:

  ✅ Automatic welcome emails when users subscribe✅ Professional HTML templates with your
  branding✅ Rate limiting and error handling✅ Unsubscribe links included automatically✅
  Mobile responsive email design

  Just add your Resend API key to your .env file and you're ready to start sending emails to
  your subscribers! 🚀
