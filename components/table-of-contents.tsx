'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ContentBlock } from '@/lib/content'

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

  // Extract headings from content blocks
  const tocItems: TocItem[] = React.useMemo(() => {
    return blocks
      .filter(block => block.type === 'heading' && block.level && block.level <= 3)
      .map((block, index) => ({
        id: `heading-${index}`,
        title: block.content,
        level: block.level || 2
      }))
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
        rootMargin: '-100px 0px -80% 0px',
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
      const offsetTop = element.offsetTop - 80 // Account for header height
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  if (tocItems.length === 0) {
    return null
  }

  return (
    <div className={cn('hidden xl:block fixed top-24 right-8 w-64', className)}>
      <div className="sticky top-24">
        <div className="bg-card p-4">
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
                    'pl-2': item.level >= 1,
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