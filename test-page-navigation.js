const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testPageNavigation() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 } // iPhone X dimensions
  });
  const page = await context.newPage();

  try {
    // Navigate to the home page first
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    // Take initial screenshot of homepage
    await page.screenshot({ 
      path: 'mobile-homepage.png', 
      fullPage: true 
    });
    console.log('Homepage screenshot taken: mobile-homepage.png');

    // Try to find a page with navigation - let's navigate to the welcome page
    try {
      await page.goto('http://localhost:3000/en/welcome', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      // Take screenshot of welcome page with navigation
      await page.screenshot({ 
        path: 'mobile-welcome-page.png', 
        fullPage: true 
      });
      console.log('Welcome page screenshot taken: mobile-welcome-page.png');
      
      // Look for PageNavigation component
      const navElement = await page.locator('nav').filter({ hasText: /previous|next/i }).first();
      
      if (await navElement.count() > 0) {
        // Focus on the navigation area
        await navElement.scrollIntoViewIfNeeded();
        
        // Take focused screenshot of navigation area
        await navElement.screenshot({ 
          path: 'mobile-page-navigation-focus.png' 
        });
        console.log('Page navigation focus screenshot taken: mobile-page-navigation-focus.png');
        
        // Get navigation container dimensions and check layout
        const navBox = await navElement.boundingBox();
        const navHTML = await navElement.innerHTML();
        
        console.log('Navigation container dimensions:', navBox);
        console.log('Navigation HTML structure:');
        console.log(navHTML);
        
        // Test text content and measure elements
        const prevLink = await page.locator('nav a').filter({ hasText: /previous/i }).first();
        const nextLink = await page.locator('nav a').filter({ hasText: /next/i }).first();
        
        if (await prevLink.count() > 0) {
          const prevBox = await prevLink.boundingBox();
          console.log('Previous link dimensions:', prevBox);
          
          const prevText = await prevLink.textContent();
          console.log('Previous link text:', prevText);
        }
        
        if (await nextLink.count() > 0) {
          const nextBox = await nextLink.boundingBox();
          console.log('Next link dimensions:', nextBox);
          
          const nextText = await nextLink.textContent();
          console.log('Next link text:', nextText);
        }
        
      } else {
        console.log('No page navigation found on welcome page');
      }
      
    } catch (welcomeError) {
      console.log('Welcome page not accessible, trying alternative navigation...');
    }

    // Let's also try to find any page with navigation by checking the navigation structure
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Look for navigation links in the sidebar or main content
    const allLinks = await page.locator('a').all();
    console.log(`Found ${allLinks.length} links on homepage`);
    
    // Try to find a content page by looking for internal links
    for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
      const link = allLinks[i];
      const href = await link.getAttribute('href');
      
      if (href && href.startsWith('/') && !href.includes('#') && href !== '/') {
        console.log(`Trying navigation link: ${href}`);
        
        try {
          await page.goto(`http://localhost:3000${href}`, { waitUntil: 'networkidle' });
          await page.waitForTimeout(1000);
          
          // Check if this page has navigation
          const pageNav = await page.locator('nav').filter({ hasText: /previous|next/i }).first();
          
          if (await pageNav.count() > 0) {
            console.log(`Found page navigation on: ${href}`);
            
            // Take screenshot of this page
            await page.screenshot({ 
              path: `mobile-page-with-nav-${i}.png`, 
              fullPage: true 
            });
            
            // Focus on navigation and take detailed screenshot
            await pageNav.scrollIntoViewIfNeeded();
            await pageNav.screenshot({ 
              path: `mobile-navigation-detail-${i}.png` 
            });
            
            // Analyze the navigation layout
            const flexContainer = await pageNav.locator('.flex').first();
            if (await flexContainer.count() > 0) {
              const containerHTML = await flexContainer.innerHTML();
              console.log(`Navigation HTML for ${href}:`);
              console.log(containerHTML);
              
              // Check if justify-between is working properly
              const containerStyles = await flexContainer.evaluate(el => {
                const computed = window.getComputedStyle(el);
                return {
                  display: computed.display,
                  justifyContent: computed.justifyContent,
                  gap: computed.gap,
                  width: computed.width,
                  flexWrap: computed.flexWrap
                };
              });
              console.log('Container computed styles:', containerStyles);
            }
            
            break; // Found navigation, exit loop
          }
        } catch (err) {
          console.log(`Error navigating to ${href}:`, err.message);
        }
      }
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testPageNavigation().catch(console.error);
