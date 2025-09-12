'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ContentBlock } from '@/lib/content'
import { useTranslations } from 'next-intl'

interface TocItem {
  id: string
  title: string
  level: number
}

interface TableOfContentsProps {
  blocks: ContentBlock[]
  className?: string
}

export function TableOfContents({ blocks, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string>('')
  const t = useTranslations('tableOfContents')

  // Extract headings from content blocks (levels 1-4)
  const tocItems: TocItem[] = React.useMemo(() => {
    const headingItems: TocItem[] = []
    blocks.forEach((block, index) => {
      if (block.type === 'heading' && block.level && block.level <= 4) {
        headingItems.push({
          id: `heading-${index}`,
          title: block.content,
          level: block.level || 2
        })
      }
    })
    return headingItems
  }, [blocks])

  // Track active section on scroll
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-88px 0px -80% 0px', // Account for header height (88px)
        threshold: 0
      }
    )

    // Observe all heading elements
    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [tocItems])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      // Calculate offset to account for fixed header (56px) + extra padding (32px)
      const headerOffset = 88
      const elementPosition = element.offsetTop
      const offsetPosition = elementPosition - headerOffset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  if (tocItems.length === 0) {
    return null
  }

  return (
    <div className={cn('hidden xl:block fixed top-24 right-8 w-64 max-h-[calc(100vh-6rem)] overflow-y-auto', className)}>
      <div className="sticky top-0">
        <div className="bg-card border rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('onThisPage')}</h3>
          <nav className="space-y-1">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={cn(
                  'flex w-full text-left text-sm py-1.5 px-2 rounded transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                  {
                    'text-primary bg-accent': activeId === item.id,
                    'text-muted-foreground': activeId !== item.id,
                    'pl-2': item.level <= 2,
                    'pl-10': item.level >= 3,
                  }
                )}
              >
                <span className="truncate min-w-0 flex-1">{item.title}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}