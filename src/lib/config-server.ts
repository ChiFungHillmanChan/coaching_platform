import { readFileSync } from 'fs'
import path from 'path'
import type { AppConfig } from './config'

let config: AppConfig | null = null

export function getServerAppConfig(): AppConfig {
  if (!config) {
    try {
      const configPath = path.join(process.cwd(), 'config', 'app.json')
      const configContent = readFileSync(configPath, 'utf-8')
      config = JSON.parse(configContent) as AppConfig
    } catch (error) {
      console.error('Failed to load app config:', error)
      // Fallback configuration
      config = {
        app: {
          name: 'AI Coaching Platform',
          version: '1.0.0',
          githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://hillmanchan.com',
          sessionCookieName: 'coaching-platform-session',
          supportedLocales: ['en', 'es', 'fr', 'zh_hk'],
          defaultLocale: 'en'
        }
      }
    }
  }
  return config
}

export const serverAppConfig = getServerAppConfig()