'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from '@/routing'
import { type NavItem } from '@/../../lib/nav'
import { useTranslations } from 'next-intl'

interface PageNavigationProps {
  previous: NavItem | null
  next: NavItem | null
  className?: string
}

export function PageNavigation({ previous, next, className }: PageNavigationProps) {
  const t = useTranslations('common')
  
  // Don't render if no navigation items
  if (!previous && !next) {
    return null
  }

  return (
    <nav className={`mt-12 pt-8 border-t ${className || ''}`}>
      <div className="grid grid-cols-2 gap-4 items-start">
        {/* Previous Page */}
        <div className="flex justify-start">
          {previous && (
            <Link 
              href={previous.href} 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group max-w-full"
              aria-label={`Previous: ${previous.label}`}
            >
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-xs text-muted-foreground">{t('previous')}</div>
                <div className="font-medium truncate">{previous.label}</div>
              </div>
            </Link>
          )}
        </div>

        {/* Next Page */}
        <div className="flex justify-end">
          {next && (
            <Link 
              href={next.href} 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group max-w-full"
              aria-label={`Next: ${next.label}`}
            >
              <div className="text-right min-w-0">
                <div className="text-xs text-muted-foreground">{t('next')}</div>
                <div className="font-medium truncate">{next.label}</div>
              </div>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}