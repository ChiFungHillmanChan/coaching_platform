const fs = require('fs');
const path = require('path');

// Create .local-data directory
const dataDir = path.join(process.cwd(), '.local-data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created .local-data directory');
}

// Initialize invited emails with your email
const invitedEmailsFile = path.join(dataDir, 'invited-emails.json');
if (!fs.existsSync(invitedEmailsFile)) {
  const defaultInvitedEmails = [
    {
      email: 'admin@example.com', // Replace with your actual email
      invitedAt: new Date().toISOString(),
      isActive: true
    }
  ];
  
  fs.writeFileSync(invitedEmailsFile, JSON.stringify(defaultInvitedEmails, null, 2));
  console.log('✅ Created invited-emails.json with default admin email');
}

// Initialize empty subscribers file
const subscribersFile = path.join(dataDir, 'subscribers.json');
if (!fs.existsSync(subscribersFile)) {
  fs.writeFileSync(subscribersFile, JSON.stringify([], null, 2));
  console.log('✅ Created subscribers.json');
}

// Initialize empty newsletter log
const newsletterLogFile = path.join(dataDir, 'newsletter-log.json');
if (!fs.existsSync(newsletterLogFile)) {
  fs.writeFileSync(newsletterLogFile, JSON.stringify([], null, 2));
  console.log('✅ Created newsletter-log.json');
}

console.log('\n🎉 Local data files initialized successfully!');
console.log('📧 Default admin email: admin@example.com');
console.log('⚠️  Please update the admin email in .local-data/invited-emails.json');