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
      <div className="flex justify-between items-center gap-4">
        {/* Previous Page */}
        {previous ? (
          <Link 
            href={previous.href} 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <div className="text-left">
              <div className="text-xs text-muted-foreground">{t('previous')}</div>
              <div className="font-medium">{previous.label}</div>
            </div>
          </Link>
        ) : (
          <div /> // Placeholder for alignment
        )}

        {/* Next Page */}
        {next ? (
          <Link 
            href={next.href} 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <div className="text-right">
              <div className="text-xs text-muted-foreground">{t('next')}</div>
              <div className="font-medium">{next.label}</div>
            </div>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <div /> // Placeholder for alignment
        )}
      </div>
    </nav>
  )
}