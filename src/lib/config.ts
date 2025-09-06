// Client-side config - hardcoded fallback that can be overridden by environment
export interface AppConfig {
  app: {
    name: string
    version: string
    githubUrl: string
    sessionCookieName: string
    supportedLocales: string[]
    defaultLocale: string
  }
}

// Default configuration - can be overridden by server-side loading
export const defaultConfig: AppConfig = {
  app: {
    name: 'AI Coaching Platform',
    version: '1.0.0',
    githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://hillmanchan.com',
    sessionCookieName: 'coaching-platform-session',
    supportedLocales: ['en', 'es', 'fr', 'zh_hk'],
    defaultLocale: 'en'
  }
}

export const appConfig = defaultConfig