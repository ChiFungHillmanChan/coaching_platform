import { kv } from '@vercel/kv'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Check if KV is available
const isKVAvailable = () => {
  return process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
}

// Local file paths
const DATA_DIR = join(process.cwd(), '.local-data')
const SUBSCRIBERS_FILE = join(DATA_DIR, 'subscribers.json')
const NEWSLETTERS_FILE = join(DATA_DIR, 'newsletters.json')

// Ensure local data directory exists
const ensureDataDir = () => {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
}

export interface Subscriber {
  email: string
  subscribedAt: string
  isActive: boolean
  unsubscribedAt?: string
  source?: string // Track where they subscribed from
}

export interface NewsletterLog {
  id: string
  sentAt: string
  subject: string
  contentTitle: string
  contentUrl: string
  recipientCount: number
  successCount: number
  failedCount: number
}

// Subscriber management
export async function saveSubscriber(subscriber: Subscriber): Promise<void> {
  if (isKVAvailable()) {
    const key = `subscriber:${subscriber.email}`
    await kv.set(key, subscriber)
    
    // Also add to active subscribers list for quick lookup
    if (subscriber.isActive) {
      await kv.sadd('active_subscribers', subscriber.email)
    } else {
      await kv.srem('active_subscribers', subscriber.email)
    }
  } else {
    // In production without KV, throw error instead of using file system
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV) {
      throw new Error('Vercel KV is required in production. Please configure KV_REST_API_URL and KV_REST_API_TOKEN environment variables.')
    }
    
    // Fallback to local file storage (development only)
    ensureDataDir()
    let subscribers: Subscriber[] = []
    
    if (existsSync(SUBSCRIBERS_FILE)) {
      try {
        const data = readFileSync(SUBSCRIBERS_FILE, 'utf-8')
        subscribers = JSON.parse(data)
      } catch (error) {
        console.error('Error reading subscribers file:', error)
      }
    }
    
    // Update or add subscriber
    const existingIndex = subscribers.findIndex(s => s.email === subscriber.email)
    if (existingIndex >= 0) {
      subscribers[existingIndex] = subscriber
    } else {
      subscribers.push(subscriber)
    }
    
    writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2))
  }
}

export async function getSubscriber(email: string): Promise<Subscriber | null> {
  if (isKVAvailable()) {
    const key = `subscriber:${email}`
    return await kv.get<Subscriber>(key)
  } else {
    // In production without KV, throw error instead of using file system
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV) {
      throw new Error('Vercel KV is required in production. Please configure KV_REST_API_URL and KV_REST_API_TOKEN environment variables.')
    }
    
    // Fallback to local file storage (development only)
    ensureDataDir()
    if (!existsSync(SUBSCRIBERS_FILE)) return null
    
    try {
      const data = readFileSync(SUBSCRIBERS_FILE, 'utf-8')
      const subscribers: Subscriber[] = JSON.parse(data)
      return subscribers.find(s => s.email === email) || null
    } catch (error) {
      console.error('Error reading subscriber:', error)
      return null
    }
  }
}

export async function getAllActiveSubscribers(): Promise<Subscriber[]> {
  if (isKVAvailable()) {
    const activeEmails = await kv.smembers('active_subscribers')
    const subscribers: Subscriber[] = []
    
    for (const email of activeEmails) {
      const subscriber = await getSubscriber(email)
      if (subscriber && subscriber.isActive) {
        subscribers.push(subscriber)
      }
    }
    
    return subscribers.sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime())
  } else {
    // In production without KV, throw error instead of using file system
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV) {
      throw new Error('Vercel KV is required in production. Please configure KV_REST_API_URL and KV_REST_API_TOKEN environment variables.')
    }
    
    // Fallback to local file storage (development only)
    ensureDataDir()
    if (!existsSync(SUBSCRIBERS_FILE)) return []
    
    try {
      const data = readFileSync(SUBSCRIBERS_FILE, 'utf-8')
      const subscribers: Subscriber[] = JSON.parse(data)
      return subscribers
        .filter(s => s.isActive)
        .sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime())
    } catch (error) {
      console.error('Error reading subscribers:', error)
      return []
    }
  }
}

export async function getSubscriberCount(): Promise<number> {
  if (isKVAvailable()) {
    return await kv.scard('active_subscribers')
  } else {
    const subscribers = await getAllActiveSubscribers()
    return subscribers.length
  }
}

export async function unsubscribeUser(email: string): Promise<boolean> {
  const subscriber = await getSubscriber(email)
  if (!subscriber) return false
  
  subscriber.isActive = false
  subscriber.unsubscribedAt = new Date().toISOString()
  
  await saveSubscriber(subscriber)
  return true
}

// Newsletter log management
export async function saveNewsletterLog(log: NewsletterLog): Promise<void> {
  if (isKVAvailable()) {
    const key = `newsletter:${log.id}`
    await kv.set(key, log)
    
    // Add to newsletter logs list for chronological ordering
    await kv.lpush('newsletter_logs', log.id)
  } else {
    // Fallback to local file storage
    ensureDataDir()
    let logs: NewsletterLog[] = []
    
    if (existsSync(NEWSLETTERS_FILE)) {
      try {
        const data = readFileSync(NEWSLETTERS_FILE, 'utf-8')
        logs = JSON.parse(data)
      } catch (error) {
        console.error('Error reading newsletters file:', error)
      }
    }
    
    logs.unshift(log) // Add to beginning for chronological order
    writeFileSync(NEWSLETTERS_FILE, JSON.stringify(logs, null, 2))
  }
}

export async function getNewsletterLogs(limit: number = 50): Promise<NewsletterLog[]> {
  if (isKVAvailable()) {
    const logIds = await kv.lrange('newsletter_logs', 0, limit - 1)
    const logs: NewsletterLog[] = []
    
    for (const id of logIds) {
      const log = await kv.get<NewsletterLog>(`newsletter:${id}`)
      if (log) {
        logs.push(log)
      }
    }
    
    return logs
  } else {
    // Fallback to local file storage
    ensureDataDir()
    if (!existsSync(NEWSLETTERS_FILE)) return []
    
    try {
      const data = readFileSync(NEWSLETTERS_FILE, 'utf-8')
      const logs: NewsletterLog[] = JSON.parse(data)
      return logs.slice(0, limit)
    } catch (error) {
      console.error('Error reading newsletters:', error)
      return []
    }
  }
}

// Admin statistics
export async function getSubscriberStats() {
  const totalActive = await getSubscriberCount()
  const recentLogs = await getNewsletterLogs(5)
  
  return {
    totalActiveSubscribers: totalActive,
    recentNewsletters: recentLogs.length,
    lastNewsletterSent: recentLogs[0]?.sentAt || null
  }
}