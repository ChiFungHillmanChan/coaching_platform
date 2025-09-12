const { chromium } = require('playwright');

async function testNavigationScenarios() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 } // iPhone X dimensions
  });
  const page = await context.newPage();

  try {
    console.log('=== Testing PageNavigation Component Layout Issues ===\n');

    // Test different pages to find ones with both previous and next buttons
    const testUrls = [
      '/en/welcome',
      '/en/01-foundation/01-web-computer-basics',
      '/en/01-foundation/02-version-control',
      '/en/01-foundation/03-hosting-deployment',
      '/en/02-web-fundamentals/01-html-css',
      '/en/02-web-fundamentals/02-javascript',
      '/en/03-ai-tools/01-chatgpt-cursor-claude'
    ];

    for (const url of testUrls) {
      console.log(`\n--- Testing: ${url} ---`);
      
      try {
        await page.goto(`http://localhost:3000${url}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        // Check if page navigation exists
        const navElement = await page.locator('nav').filter({ hasText: /previous|next/i }).first();
        
        if (await navElement.count() > 0) {
          console.log('✓ Page navigation found');
          
          // Scroll to navigation area
          await navElement.scrollIntoViewIfNeeded();
          
          // Take screenshot of this specific navigation
          const filename = url.replace(/\//g, '-').replace(/^-/, '') + '-navigation.png';
          await navElement.screenshot({ path: filename });
          console.log(`📸 Screenshot saved: ${filename}`);
          
          // Analyze the navigation structure
          const flexContainer = await navElement.locator('.flex.justify-between').first();
          
          if (await flexContainer.count() > 0) {
            // Get all child elements
            const children = await flexContainer.locator('> *').all();
            console.log(`Found ${children.length} child elements in flex container`);
            
            let prevElement = null;
            let nextElement = null;
            
            for (let i = 0; i < children.length; i++) {
              const child = children[i];
              const childHTML = await child.innerHTML();
              const childBox = await child.boundingBox();
              
              if (childHTML.includes('Previous') || childHTML.includes('previous')) {
                prevElement = child;
                console.log(`Previous element [${i}]:`, {
                  dimensions: childBox,
                  hasText: await child.textContent()
                });
              } else if (childHTML.includes('Next') || childHTML.includes('next')) {
                nextElement = child;
                console.log(`Next element [${i}]:`, {
                  dimensions: childBox,
                  hasText: await child.textContent()
                });
              } else if (childHTML.trim() === '' || childHTML.includes('<div></div>')) {
                console.log(`Empty placeholder element [${i}]:`, {
                  dimensions: childBox,
                  innerHTML: childHTML
                });
              }
            }
            
            // Check container dimensions and calculate balance
            const containerBox = await flexContainer.boundingBox();
            console.log('Container dimensions:', containerBox);
            
            // Test layout balance
            if (prevElement && nextElement) {
              const prevBox = await prevElement.boundingBox();
              const nextBox = await nextElement.boundingBox();
              
              const prevSpace = prevBox.x + prevBox.width - containerBox.x;
              const nextSpace = (containerBox.x + containerBox.width) - nextBox.x;
              const balance = Math.abs(prevSpace - nextSpace);
              
              console.log('Balance analysis:', {
                previousSpace: prevSpace,
                nextSpace: nextSpace,
                imbalance: balance,
                isBalanced: balance < 10
              });
            }
            
            // Check for text overflow
            const allTextElements = await flexContainer.locator('div').filter({ hasText: /.+/ }).all();
            for (const textEl of allTextElements) {
              const textBox = await textEl.boundingBox();
              const text = await textEl.textContent();
              
              if (text && text.length > 20) {
                console.log('Long text element detected:', {
                  text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
                  dimensions: textBox,
                  potentialOverflow: textBox.width > 150
                });
              }
            }
            
          } else {
            console.log('⚠️ No flex container with justify-between found');
          }
          
        } else {
          console.log('✗ No page navigation found');
        }
        
      } catch (error) {
        console.log(`❌ Error testing ${url}:`, error.message);
      }
    }

    // Test with artificially long titles by injecting CSS to simulate overflow scenarios
    console.log('\n=== Testing Overflow Scenarios ===');
    
    await page.goto('http://localhost:3000/en/welcome', { waitUntil: 'networkidle' });
    
    // Inject CSS to simulate long titles
    await page.addStyleTag({
      content: `
        .page-nav-test .font-medium {
          width: 200px !important;
          font-size: 14px !important;
        }
        .page-nav-test-long .font-medium::after {
          content: " - This is a Very Long Title That Should Cause Layout Issues";
        }
      `
    });
    
    const navElement = await page.locator('nav').filter({ hasText: /next/i }).first();
    if (await navElement.count() > 0) {
      // Add test class
      await navElement.evaluate(el => el.classList.add('page-nav-test-long'));
      
      await page.waitForTimeout(500);
      await navElement.screenshot({ path: 'navigation-long-title-test.png' });
      console.log('📸 Long title test screenshot: navigation-long-title-test.png');
      
      // Analyze overflow
      const overflowCheck = await navElement.evaluate(() => {
        const container = document.querySelector('nav .flex');
        const containerRect = container.getBoundingClientRect();
        const children = Array.from(container.children);
        
        return children.map((child, i) => {
          const childRect = child.getBoundingClientRect();
          return {
            index: i,
            overflowsContainer: childRect.right > containerRect.right,
            width: childRect.width,
            containerWidth: containerRect.width
          };
        });
      });
      
      console.log('Overflow analysis:', overflowCheck);
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testNavigationScenarios().catch(console.error);
