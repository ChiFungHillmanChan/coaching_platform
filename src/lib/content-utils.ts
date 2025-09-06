import fs from 'fs';
import path from 'path';

export interface NavigationItem {
  name: string;
  href: string;
  children?: NavigationItem[];
}

interface NavigationData {
  sections: Array<{
    id: string;
    title: string;
    href: string;
    icon?: string;
    order: number;
    children?: Array<{
      id: string;
      title: string;
      href: string;
      order: number;
    }>;
  }>;
}

// Load navigation configuration from JSON files
function loadNavigationConfig(locale: string): NavigationData | null {
  try {
    const navigationPath = path.join(process.cwd(), 'content', 'sidebar', `navigation.${locale}.json`);
    const fallbackPath = path.join(process.cwd(), 'content', 'sidebar', 'navigation.en.json');
    const filePath = fs.existsSync(navigationPath) ? navigationPath : fallbackPath;
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading navigation config:', error);
    return null;
  }
}

// Get navigation order from config
function getNavigationOrder(locale: string): string[] {
  const navConfig = loadNavigationConfig(locale);
  if (!navConfig) return [];
  
  return navConfig.sections
    .sort((a, b) => a.order - b.order)
    .map(section => section.id);
}

// Get section titles from config
function getSectionTitle(sectionId: string, locale: string): string | null {
  const navConfig = loadNavigationConfig(locale);
  if (!navConfig) return null;
  
  const section = navConfig.sections.find(s => s.id === sectionId);
  return section?.title || null;
}

// Get subsection title from config
function getSubsectionTitle(sectionId: string, subsectionId: string, locale: string): string | null {
  const navConfig = loadNavigationConfig(locale);
  if (!navConfig) return null;
  
  const section = navConfig.sections.find(s => s.id === sectionId);
  if (!section?.children) return null;
  
  const subsection = section.children.find(c => c.id === subsectionId);
  return subsection?.title || null;
}

function getContentTitle(contentPath: string, section: string, subsection?: string, locale: string = 'en'): string {
  // Check for standardized JSON files first
  const jsonFiles = [`index.${locale}.json`, 'index.en.json', 'index.json'];
  for (const jsonFile of jsonFiles) {
    const jsonPath = path.join(contentPath, jsonFile);
    if (fs.existsSync(jsonPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        return content.title || section;
      } catch (error) {
        console.error(`Error parsing ${jsonPath}:`, error);
      }
    }
  }

  // Check for markdown files as fallback
  const mdFiles = [`index.${locale}.md`, 'index.en.md', 'index.md'];
  for (const mdFile of mdFiles) {
    const mdPath = path.join(contentPath, mdFile);
    if (fs.existsSync(mdPath)) {
      try {
        const content = fs.readFileSync(mdPath, 'utf8');
        // Extract title from markdown (first # heading or fallback)
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
          return titleMatch[1].trim();
        }
      } catch (error) {
        console.error(`Error reading ${mdPath}:`, error);
      }
    }
  }

  // Use navigation config titles as fallback
  if (subsection) {
    const subsectionTitle = getSubsectionTitle(section, subsection, locale);
    if (subsectionTitle) return subsectionTitle;
  }
  
  const sectionTitle = getSectionTitle(section, locale);
  return sectionTitle || section;
}

function getItemId(itemName: string, locale: string, basePath: string): number | null {
  try {
    const itemPath = path.join(process.cwd(), 'content', basePath, itemName);
    
    // Try locale-specific file first, then fallback to English
    const jsonFiles = [`index.${locale}.json`, 'index.en.json', 'index.json'];
    
    for (const jsonFile of jsonFiles) {
      const jsonPath = path.join(itemPath, jsonFile);
      if (fs.existsSync(jsonPath)) {
        try {
          const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          if (typeof content.id === 'number') {
            return content.id;
          }
        } catch (error) {
          console.error(`Error parsing ${jsonPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error getting item id for ${itemName}:`, error);
  }
  
  return null;
}

// Cache for content-utils
const contentCache = new Map<string, NavigationItem[]>()

export function getAvailablePages(locale: string = 'en', basePath: string = ''): NavigationItem[] {
  const cacheKey = `${locale}-${basePath}`
  
  // Check cache first
  if (contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey)!
  }

  const contentDir = path.join(process.cwd(), 'content', basePath);
  
  if (!fs.existsSync(contentDir)) {
    contentCache.set(cacheKey, [])
    return [];
  }

  const items: NavigationItem[] = [];
  const entries = fs.readdirSync(contentDir, { withFileTypes: true });


  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subDir = path.join(contentDir, entry.name);
      const files = fs.readdirSync(subDir);
      
      // Only include directories that are in the navigation config order or are subdirectories of included directories
      const navigationOrder = getNavigationOrder(locale);
      const isInNavigationOrder = basePath === '' ? navigationOrder.includes(entry.name) : true;
      
      if (!isInNavigationOrder) {
        continue; // Skip directories not in the navigation order
      }
      
      // Check if this directory has content (JSON or markdown files) OR if it's a main topic directory
      const hasContent = files.some(file => 
        file.endsWith('.json') || file.endsWith('.md')
      );
      
      // Check if this is a main topic directory (has subdirectories but no index files)
      const hasSubdirectories = files.some(file => {
        const filePath = path.join(subDir, file);
        return fs.statSync(filePath).isDirectory();
      });
      
      const isMainTopic = hasSubdirectories && !files.some(file => file.startsWith('index.'));

      if (hasContent || isMainTopic) {
        // Generate href without locale prefix - next-intl Link will handle locale automatically
        const href = basePath ? `/${basePath}/${entry.name}` : `/${entry.name}`;
        const title = getContentTitle(subDir, entry.name, undefined, locale);
        
        // Get children for this section
        const children = getAvailablePages(locale, basePath ? `${basePath}/${entry.name}` : entry.name);
        
        items.push({
          name: title,
          href: href, // Always set href for proper sorting
          children: children.length > 0 ? children : undefined
        });
      }
    }
  }

  // Sort items according to the navigation config order and id field
  const navigationOrder = getNavigationOrder(locale);
  const sortedItems = items.sort((a, b) => {
    // For checklist items, use the id field from JSON files
    if (basePath === 'checklist' || (basePath === '' && (a.href === '/checklist' || b.href === '/checklist'))) {
      // Extract directory name from href
      const aName = a.href.split('/').pop() || '';
      const bName = b.href.split('/').pop() || '';
      
      // Get id values from JSON files
      const aId = getItemId(aName, locale, basePath);
      const bId = getItemId(bName, locale, basePath);
      
      // If both have id values, sort by id
      if (aId !== null && bId !== null) {
        return aId - bId;
      }
    }
    
    // Use navigation config order
    const aIndex = navigationOrder.indexOf(a.href.replace('/', ''));
    const bIndex = navigationOrder.indexOf(b.href.replace('/', ''));
    
    // If both items are in the order list, sort by their position
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one is in the order list, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // If neither is in the order list, sort alphabetically
    return a.name.localeCompare(b.name);
  });

  // Cache the sorted result
  contentCache.set(cacheKey, sortedItems)
  return sortedItems
}

export function getPageContent(slug: string[], locale: string) {
  try {
    const contentPath = path.join(process.cwd(), 'content', ...slug);
    
    // Try locale-specific file first, then fallback to English
    const localeFile = `${slug[slug.length - 1]}.${locale}.json`;
    const defaultFile = `${slug[slug.length - 1]}.en.json`;
    
    let filePath: string;
    
    if (fs.existsSync(path.join(contentPath, localeFile))) {
      filePath = path.join(contentPath, localeFile);
    } else if (fs.existsSync(path.join(contentPath, defaultFile))) {
      filePath = path.join(contentPath, defaultFile);
    } else {
      return null;
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading page content:', error);
    return null;
  }
}