# 📧 Email Newsletter System

This document explains how to use the complete email subscription and newsletter system for your coaching platform.

## Features Implemented

### 1. Email Subscription Popup ✅
- Appears after 10 seconds of scrolling/browsing
- Only shows once per session
- Users can subscribe or close the popup
- Popup won't show again until page is refreshed/revisited

### 2. Email Subscription Management ✅
- API endpoints for subscription management
- Local file storage for subscribers (`/api/subscribe`)
- Admin interface to view all subscribers

### 3. Email Template & Newsletter Sending ✅
- HTML email template for new content notifications
- Manual newsletter sending via admin interface (`/api/send-newsletter`)
- Template format: "Thank you for subscribing... You can now view {content title} with link"

### 4. Email-Based Access Control ✅
- Login page requires email only (no password)
- Only invited emails can access the platform
- Session-based authentication using cookies
- Middleware protection for all routes

### 5. Secure Local Data Storage ✅
- All sensitive data stored in `.local-data/` directory
- Directory is git-ignored (not uploaded to Vercel)
- Three data files:
  - `subscribers.json` - Email subscribers
  - `invited-emails.json` - Authorized email addresses
  - `newsletter-log.json` - Newsletter sending history

## Setup Instructions

### 1. Initialize Local Data
```bash
node scripts/init-local-data.js
```

This creates:
- `.local-data/` directory
- Default admin email: `admin@example.com`
- Empty subscribers and newsletter logs

### 2. Update Admin Email
Edit `.local-data/invited-emails.json` and replace `admin@example.com` with your actual email address.

### 3. Access the Platform
1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000`
3. You'll be redirected to `/login`
4. Enter your admin email to gain access

### 4. Manage Email System
Visit `/admin` to:
- View all subscribers
- Invite new email addresses
- Revoke access for specific emails
- Send newsletters to subscribers

## How It Works

### Email Subscription Flow
1. User visits any page
2. After 10 seconds, subscription popup appears
3. User can enter email to subscribe or close popup
4. Email is stored in `subscribers.json`
5. Popup won't show again in same session

### Access Control Flow
1. User visits protected route
2. Middleware checks for session cookie
3. If no session, redirect to `/login`
4. User enters email address
5. System checks if email is in `invited-emails.json`
6. If authorized, creates session and grants access

### Newsletter Sending Flow
1. Admin visits `/admin`
2. Enters content title, URL, and optional subject
3. System generates HTML email template
4. Newsletter is "sent" to all active subscribers
5. Currently simulated - integrate with email service to actually send

## Email Service Integration

The system is ready for email service integration. To actually send emails:

1. **Install an email service SDK** (choose one):
   ```bash
   npm install resend        # Recommended
   npm install @sendgrid/mail
   npm install nodemailer
   ```

2. **Add environment variables** to `.env.local`:
   ```env
   RESEND_API_KEY=your_api_key
   # OR
   SENDGRID_API_KEY=your_api_key
   ```

3. **Update `/api/send-newsletter/route.ts`** with actual email sending:
   ```typescript
   // Replace the TODO section with:
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
   ```

## API Endpoints

- `POST /api/subscribe` - Subscribe email
- `GET /api/subscribe` - Get subscribers list
- `POST /api/send-newsletter` - Send newsletter
- `GET /api/send-newsletter` - Get newsletter history
- `POST /api/auth/login` - Login with email
- `DELETE /api/auth/login` - Logout
- `POST /api/admin/invite-email` - Invite email
- `GET /api/admin/invite-email` - Get invited emails
- `DELETE /api/admin/invite-email` - Revoke email access

## Security Notes

- **No passwords required** - Access is email-based only
- **Session cookies** are httpOnly and secure in production
- **Local data files** are git-ignored and won't be deployed
- **Input validation** on all email addresses
- **CSRF protection** via same-origin policy

## File Structure

```
.local-data/               # Git-ignored secure storage
├── subscribers.json       # Email subscribers
├── invited-emails.json    # Authorized emails
└── newsletter-log.json    # Newsletter history

components/
├── email-subscription-popup.tsx
└── docs-layout-client.tsx  # Popup integration

src/app/
├── login/page.tsx         # Login page
├── admin/page.tsx         # Admin dashboard
└── api/
    ├── subscribe/route.ts
    ├── send-newsletter/route.ts
    ├── auth/login/route.ts
    └── admin/invite-email/route.ts

hooks/
└── use-email-subscription-popup.ts

middleware.ts              # Route protection
```

## Usage Tips

1. **Test the popup**: Clear browser storage and wait 10 seconds on any page
2. **Manage access**: Use `/admin` to invite/revoke email addresses
3. **Send newsletters**: Fill in content details in admin panel
4. **Monitor subscriptions**: Check subscriber count in admin dashboard
5. **Update email service**: Follow integration guide above for production use

The system is now fully functional with simulated email sending. Integrate with a real email service when ready to send actual emails to subscribers.