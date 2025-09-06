# 📧 Email Setup Guide

## 1. Getting Your Resend API Key

### Step 1: Sign up for Resend
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get API Key
1. Log in to your Resend dashboard
2. Click **"API Keys"** in the sidebar
3. Click **"Create API Key"**
4. Name it "Coaching Platform" 
5. Copy the API key (starts with `re_`)

### Step 3: Add Domain (Optional but Recommended)
1. Go to **"Domains"** in the sidebar
2. Click **"Add Domain"**
3. Add your domain (e.g., `yourdomain.com`)
4. Follow DNS setup instructions
5. Wait for verification

## 2. Environment Configuration

Add these to your `.env` file:

```bash
# Required - Your Resend API Key
RESEND_API_KEY=re_your_actual_api_key_here

# Optional - Customize the "From" email address
EMAIL_FROM=AI Coaching Platform <noreply@yourdomain.com>

# Optional - Your site URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. How Email Sending Works

### Automatic Welcome Emails
- ✅ **Automatically sent** when someone subscribes
- ✅ **Beautiful HTML template** with your branding
- ✅ **Includes unsubscribe link**
- ✅ **Error handling** - subscription works even if email fails

### Manual Newsletter Sending
You can send newsletters via API call:

```bash
# Send newsletter to all subscribers
curl -X POST http://localhost:3000/api/send-newsletter \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Weekly Update",
    "sections": [
      {
        "title": "New Course Available",
        "content": "Check out our latest AI fundamentals course.",
        "link": "https://yoursite.com/courses/ai-basics"
      },
      {
        "title": "Tips & Tricks",
        "content": "Here are 5 ways to improve your workflow with AI tools."
      }
    ]
  }'
```

## 4. Testing Email Setup

### Test 1: Check Configuration
```bash
# Make sure your API key is working
curl -X GET "https://api.resend.com/domains" \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY"
```

### Test 2: Subscribe & Check Welcome Email
1. Go to your website
2. Subscribe with your email
3. Check your inbox for welcome email

### Test 3: Send Test Newsletter
```bash
curl -X POST http://localhost:3000/api/send-newsletter \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Newsletter",
    "sections": [
      {
        "title": "Test Section",
        "content": "This is a test to verify email functionality.",
        "link": "https://example.com"
      }
    ]
  }'
```

## 5. Email Templates

### Welcome Email Features:
- 🎨 Professional design
- 📱 Mobile responsive  
- 🔗 Unsubscribe link
- 🚀 Quick start guide
- ✨ Your branding

### Newsletter Features:
- 📰 Multi-section layout
- 🔗 Call-to-action buttons
- 📅 Date stamp
- 🚫 Unsubscribe footer
- 📱 Mobile optimized

## 6. Monitoring & Analytics

### Check Subscriber Stats:
```bash
curl -X GET http://localhost:3000/api/subscribe
```

### Check Newsletter History:
```bash
curl -X GET http://localhost:3000/api/send-newsletter
```

### Resend Dashboard:
- View delivery stats
- Check bounce rates
- Monitor email performance

## 7. Best Practices

### Email Deliverability:
1. ✅ Use your own domain for sending
2. ✅ Set up SPF, DKIM, DMARC records
3. ✅ Don't send too frequently
4. ✅ Provide clear unsubscribe options

### Content Guidelines:
- Keep subject lines under 50 characters
- Make content scannable with headings
- Include clear call-to-actions
- Test on mobile devices

### Legal Compliance:
- Always include unsubscribe links
- Get explicit consent before subscribing
- Honor unsubscribe requests immediately
- Include your physical address (for commercial emails)

## 8. Troubleshooting

### Common Issues:

**"Email service not configured"**
- ✅ Check `RESEND_API_KEY` is in `.env`
- ✅ Restart your dev server after adding env vars

**"Authentication failed"**
- ✅ Verify API key is correct (starts with `re_`)
- ✅ Check for extra spaces in env file

**"Domain not verified"**
- ✅ Use `noreply@resend.dev` for testing
- ✅ Set up custom domain in Resend dashboard

**Emails not arriving:**
- ✅ Check spam folder
- ✅ Try different email provider (Gmail, Outlook)
- ✅ Check Resend dashboard for delivery status

## 9. Production Deployment

### Vercel:
1. Add environment variables in Vercel dashboard
2. Redeploy your application
3. Test email functionality in production

### Other Platforms:
1. Set environment variables in your hosting platform
2. Ensure Resend API can be reached from your server
3. Test after deployment

## 10. Rate Limits & Pricing

### Resend Free Tier:
- 3,000 emails/month
- 100 emails/day
- All features included

### Rate Limiting:
- Built-in batching (10 emails per batch)
- 1-second delay between batches
- Automatic retry on failures

---

🎉 **You're all set!** Your subscribers will now receive beautiful welcome emails automatically, and you can send newsletters whenever you have updates to share.

Need help? Check the [Resend documentation](https://resend.com/docs) or create an issue in your repository.