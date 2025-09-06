import { readFileSync } from 'fs'
import path from 'path'
import type { AppConfig } from './config'

// Check if we're in a Vercel environment
const isVercel = process.env.VERCEL === '1';

let config: AppConfig | null = null

export function getServerAppConfig(): AppConfig {
  if (!config) {
    try {
      // In Vercel, we need to use dynamic imports instead of fs
      if (isVercel) {
        try {
          const configModule = require('../../../config/app.json');
          config = configModule as AppConfig;
        } catch (error) {
          console.error('Failed to load app config in Vercel:', error);
          // Fallback configuration
          config = {
            app: {
              name: 'AI Coaching Platform',
              version: '1.0.0',
              githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://hillmanchan.com',
              sessionCookieName: 'coaching-platform-session',
              supportedLocales: ['en', 'zh_hk'],
              defaultLocale: 'en'
            }
          }
        }
      } else {
        const configPath = path.join(process.cwd(), 'config', 'app.json')
        const configContent = readFileSync(configPath, 'utf-8')
        config = JSON.parse(configContent) as AppConfig
      }
    } catch (error) {
      console.error('Failed to load app config:', error)
      // Fallback configuration
      config = {
        app: {
          name: 'AI Coaching Platform',
          version: '1.0.0',
          githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://hillmanchan.com',
          sessionCookieName: 'coaching-platform-session',
          supportedLocales: ['en', 'zh_hk'],
          defaultLocale: 'en'
        }
      }
    }
  }
  return config
}

export const serverAppConfig = getServerAppConfig()