#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), '.local-data');

// Ensure the .local-data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('✅ Created .local-data directory');
}

// Initialize empty data files
const subscribersFile = path.join(DATA_DIR, 'subscribers.json');
const newslettersFile = path.join(DATA_DIR, 'newsletters.json');

if (!fs.existsSync(subscribersFile)) {
  fs.writeFileSync(subscribersFile, '[]');
  console.log('✅ Created subscribers.json');
}

if (!fs.existsSync(newslettersFile)) {
  fs.writeFileSync(newslettersFile, '[]');
  console.log('✅ Created newsletters.json');
}

console.log('\n🎉 Local storage initialized! Your admin panel will now work without Vercel KV.');
console.log('💡 For production deployment, set up Vercel KV for persistent storage.');