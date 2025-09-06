#!/bin/bash

echo "🧹 Clearing Next.js cache and temporary files..."

# Remove Next.js cache
rm -rf .next
echo "✅ Removed .next directory"

# Remove node_modules cache (if needed)
# rm -rf node_modules/.cache
# echo "✅ Removed node_modules/.cache"

# Clear npm cache (optional)
# npm cache clean --force
# echo "✅ Cleared npm cache"

echo "🎉 Cache cleared! You can now run 'npm run dev' for a fresh start."