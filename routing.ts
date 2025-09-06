import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

// Load config dynamically to avoid fs issues in client components  
let supportedLocales: string[] = ['en', 'zh_hk'];
let defaultLocale: string = 'en';

// Try to load from server config if available (Node.js environment only)
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  try {
    const fs = eval('require("fs")');
    const path = eval('require("path")');
    const configPath = path.join(process.cwd(), 'config', 'app.json');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      supportedLocales = config.app.supportedLocales || supportedLocales;
      defaultLocale = config.app.defaultLocale || defaultLocale;
    }
  } catch (error) {
    // Fallback to hardcoded values
  }
}
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: supportedLocales,
 
  // Used when no locale matches
  defaultLocale: defaultLocale,
  
  // Ensure locale is always in the URL
  localePrefix: 'always'
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);