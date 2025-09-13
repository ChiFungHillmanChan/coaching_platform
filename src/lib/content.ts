import { readFileSync } from 'fs'
import path from 'path'

export interface TaskItem {
  content: string
  completed?: boolean
  checked?: boolean
}

export interface ContentBlock {
  type: 'text' | 'heading' | 'code' | 'code_popup' | 'code_pop_up' | 'search bar' | 'image' | 'video' | 'youtube_video' | 'list' | 'card' | 'callout' | 'blockquote' | 'link' | 'line-break' | 'horizontal-rule' | 'email-subscription' | 'terminal' | 'table' | 'task-list' | 'download-link' | 'footnote' | 'definition-list'
  content: string
  level?: number // for headings
  language?: string // for code blocks
  src?: string // for images/videos/links
  alt?: string // for images
  caption?: string // for images with captions
  size?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 // for image size levels (1=smallest, 10=largest)
  items?: string[] // for lists
  taskItems?: TaskItem[] // for task-lists
  title?: string // for cards/callouts/links
  description?: string // for cards/callouts
  variant?: 'info' | 'warning' | 'success' | 'error' // for callouts
  href?: string // for links
  target?: string // for links (_blank, _self, etc.)
  listType?: 'unordered' | 'ordered' // for lists
  nested?: boolean // for nested blockquotes
  headers?: string[] // for tables
  rows?: string[][] // for tables
  fileSize?: string // for download links
  fileType?: string // for download links
  footnoteId?: string // for footnotes
  footnoteText?: string // for footnotes
  definitions?: { term: string; definition?: string; items?: string[]; listType?: 'unordered' | 'ordered' }[] // for definition lists
}

export interface Article {
  title: string
  description: string
  slug: string
  category: string
  blocks: ContentBlock[]
  lastModified: string
}

export function getArticle(category: string, slug: string): Article | null {
  try {
    // Try the nested structure first: content/category/slug/article.json
    let filePath = path.join(process.cwd(), 'content', category, slug, 'article.json')
    
    try {
      const fileContent = readFileSync(filePath, 'utf-8')
      return JSON.parse(fileContent) as Article
    } catch {
      // Fallback to flat structure: content/category/article.json or content/slug/article.json
      if (category) {
        filePath = path.join(process.cwd(), 'content', category, 'article.json')
      } else {
        filePath = path.join(process.cwd(), 'content', slug, 'article.json')
      }
      const fileContent = readFileSync(filePath, 'utf-8')
      return JSON.parse(fileContent) as Article
    }
  } catch (error) {
    console.error(`Failed to load article: ${category}/${slug}`, error)
    return null
  }
}

export function getAllArticles(): Article[] {
  // This would scan the content directory and return all articles
  // For now, return empty array - implement as needed
  return []
}

export function getArticlesByCategory(category: string): Article[] {
  // This would scan the specific category directory
  // For now, return empty array - implement as needed
  return []
}