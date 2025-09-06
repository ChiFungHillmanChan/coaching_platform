import fs from 'fs'
import path from 'path'

// Navigation cache
const navigationCache = new Map<string, NavItem[]>()

// Check if content exists for a given href
function checkContentExists(href: string, locale: string): boolean {
  try {
    // Remove leading slash and split into parts
    const pathParts = href.replace(/^\//, '').split('/')
    
    // Only check for content in subfolders (more than 1 path part)
    // Main folders (like /03-ai-tools-intro) don't need index.json
    if (pathParts.length <= 1) {
      return true // Main folders are always considered to have content
    }
    
    // Construct the content file path
    const contentDir = path.join(process.cwd(), 'content', ...pathParts)
    const indexPath = path.join(contentDir, `index.${locale}.json`)
    const fallbackPath = path.join(contentDir, 'index.en.json')
    
    // Check if either locale-specific or fallback content exists
    return fs.existsSync(indexPath) || fs.existsSync(fallbackPath)
  } catch (error) {
    return false
  }
}

export type NavItem = {
  key: string
  label: string
  href: string
  isComingSoon?: boolean
  iconName?: string
  children?: Omit<NavItem, 'children' | 'iconName'>[]
}



function loadNavigationFromContent(locale: string): NavItem[] | null {
  try {
    const navigationPath = path.join(process.cwd(), 'content', 'sidebar', `navigation.${locale}.json`)
    
    // Fallback to English if locale-specific file doesn't exist
    const fallbackPath = path.join(process.cwd(), 'content', 'sidebar', 'navigation.en.json')
    const filePath = fs.existsSync(navigationPath) ? navigationPath : fallbackPath
    
    if (!fs.existsSync(filePath)) {
      // Navigation file not found
      return null
    }
    
    const content = fs.readFileSync(filePath, 'utf8')
    const navigationData = JSON.parse(content)
    
    if (!navigationData.sections || !Array.isArray(navigationData.sections)) {
      // Invalid navigation data structure
      return null
    }
    
    // Navigation loaded successfully
    
    // Convert content structure to NavItem format
    return navigationData.sections.map((section: any) => ({
      key: section.id,
      label: section.title,
      href: section.href,
      isComingSoon: !checkContentExists(section.href, locale),
      iconName: section.icon,
      children: section.children && section.children.length > 0 
        ? section.children.map((child: any) => ({
            key: child.id,
            label: child.title,
            href: child.href,
            isComingSoon: !checkContentExists(child.href, locale)
          }))
        : undefined
    }))
  } catch (error) {
    // Error loading navigation from content
    return null
  }
}

export function getNavigation(locale: string = 'en'): NavItem[] {
  // Check cache first
  const cacheKey = locale
  if (navigationCache.has(cacheKey)) {
    return navigationCache.get(cacheKey)!
  }

  try {
    // Load navigation from content files (primary source)
    // Loading navigation from content files
    const navigationFromContent = loadNavigationFromContent(locale)
    if (navigationFromContent && navigationFromContent.length > 0) {
      // Navigation loaded successfully
      navigationCache.set(cacheKey, navigationFromContent)
      return navigationFromContent
    } else {
      // Failed to load navigation from content files
      // Return empty navigation instead of fallback
      const emptyNav: NavItem[] = []
      navigationCache.set(cacheKey, emptyNav)
      return emptyNav
    }
  } catch (error) {
    console.warn('Error loading navigation:', error)
    // Error loading navigation from content files
    // Return empty navigation instead of fallback
    const emptyNav: NavItem[] = []
    navigationCache.set(cacheKey, emptyNav)
    return emptyNav
  }
}

// For backward compatibility
export const NAV: NavItem[] = getNavigation('en')

export function findNavItemByHref(href: string): NavItem | null {
  function searchNav(items: NavItem[]): NavItem | null {
    for (const item of items) {
      if (item.href === href) return item
      if (item.children) {
        const found = searchNav(item.children)
        if (found) return found
      }
    }
    return null
  }
  return searchNav(NAV)
}

export function getParentNavItem(href: string): NavItem | null {
  for (const item of NAV) {
    if (item.children && item.children.some(child => child.href === href)) {
      return item
    }
  }
  return null
}

// Get flat list of all navigation items for pagination
export function getFlatNavItems(navigation: NavItem[]): NavItem[] {
  const flatItems: NavItem[] = []
  
  function flatten(items: NavItem[]) {
    for (const item of items) {
      // Only add items that have no children (sub-folder links only)
      // Skip parent folders that have children
      if (!item.isComingSoon && !item.children) {
        flatItems.push(item)
      }
      // If item has children, process children instead of the parent
      if (item.children) {
        flatten(item.children)
      }
    }
  }
  
  flatten(navigation)
  return flatItems
}

// Get previous and next navigation items
export function getAdjacentNavItems(currentHref: string, navigation: NavItem[]): {
  previous: NavItem | null
  next: NavItem | null
} {
  const flatItems = getFlatNavItems(navigation)
  const currentIndex = flatItems.findIndex(item => item.href === currentHref)
  
  if (currentIndex === -1) {
    return { previous: null, next: null }
  }
  
  return {
    previous: currentIndex > 0 ? flatItems[currentIndex - 1] : null,
    next: currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null
  }
}