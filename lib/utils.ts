import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isRouteActive(currentPath: string, targetPath: string): boolean {
  if (targetPath === '/docs') return currentPath === '/docs' || currentPath === '/'
  
  // Remove locale prefix from current path for comparison
  // The next-intl usePathname already returns the path without locale prefix
  // So we can directly compare with the target path
  return currentPath.startsWith(targetPath)
}

export function formatTitle(title: string): string {
  return title
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}