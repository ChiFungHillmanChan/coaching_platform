import { test, expect } from '@playwright/test';

test.describe('Mobile Layout Analysis', () => {
  // Mobile viewport sizes to test
  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'Galaxy S21', width: 360, height: 800 },
    { name: 'Tablet Portrait', width: 768, height: 1024 }
  ];

  test.beforeEach(async ({ page }) => {
    // Wait for the dev server to be ready
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  viewports.forEach(({ name, width, height }) => {
    test(`Mobile layout analysis - ${name} (${width}x${height})`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize({ width, height });
      
      // Navigate to home page
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of home page
      await page.screenshot({ 
        path: `screenshots/mobile-${name.toLowerCase().replace(/\s+/g, '-')}-home.png`,
        fullPage: true 
      });

      // Try to navigate to a content page with navigation
      const links = page.locator('a[href*="/"]').first();
      if (await links.count() > 0) {
        await links.click();
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of content page
        await page.screenshot({ 
          path: `screenshots/mobile-${name.toLowerCase().replace(/\s+/g, '-')}-content.png`,
          fullPage: true 
        });
        
        // Check for page navigation elements
        const pageNavigation = page.locator('nav').filter({ hasText: /previous|next/i });
        if (await pageNavigation.count() > 0) {
          await page.screenshot({ 
            path: `screenshots/mobile-${name.toLowerCase().replace(/\s+/g, '-')}-navigation.png`,
            clip: await pageNavigation.boundingBox() || undefined
          });
        }
      }

      // Check mobile menu functionality
      const hamburgerButton = page.locator('[aria-label*="menu" i], [aria-label*="navigation" i], button:has([data-testid="hamburger"])').first();
      if (await hamburgerButton.count() > 0) {
        await hamburgerButton.click();
        await page.waitForTimeout(500); // Wait for animation
        
        await page.screenshot({ 
          path: `screenshots/mobile-${name.toLowerCase().replace(/\s+/g, '-')}-menu-open.png`,
          fullPage: true 
        });
      }
    });
  });

  test('Check page navigation layout balance', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    
    // Try to find a page with navigation
    const navLinks = page.locator('a').filter({ hasText: /getting started|guide|tutorial/i }).first();
    if (await navLinks.count() > 0) {
      await navLinks.click();
      await page.waitForLoadState('networkidle');
      
      const navigation = page.locator('nav').filter({ hasText: /previous|next/i });
      if (await navigation.count() > 0) {
        const navBox = await navigation.boundingBox();
        if (navBox) {
          // Check navigation elements
          const prevLink = navigation.locator('a').first();
          const nextLink = navigation.locator('a').last();
          
          const prevBox = await prevLink.boundingBox();
          const nextBox = await nextLink.boundingBox();
          
          console.log('Navigation container width:', navBox.width);
          if (prevBox) console.log('Previous button position:', prevBox.x, 'width:', prevBox.width);
          if (nextBox) console.log('Next button position:', nextBox.x, 'width:', nextBox.width);
        }
      }
    }
  });
});
