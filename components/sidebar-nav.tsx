'use client'

import * as React from 'react'
import { Link, usePathname } from '@/routing'
import { useParams } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { type NavItem } from '@/../../lib/nav'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn, isRouteActive } from '@/lib/utils'
import { getIconComponent } from '@/lib/icons'

interface SidebarNavProps {
  navigation: NavItem[]
  className?: string
}

export function SidebarNav({ navigation, className }: SidebarNavProps) {
  const pathname = usePathname()
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    new Set() // Don't expand any sections by default
  )

  const toggleExpanded = React.useCallback((key: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  // Auto-expand parent when child is active (preserve existing expanded items)
  React.useEffect(() => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      for (const item of navigation) {
        if (item.children && item.children.some(child => child.href === pathname)) {
          next.add(item.key)
        }
      }
      return next
    })
  }, [pathname, navigation])

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const focusedElement = document.activeElement as HTMLElement
      if (!focusedElement?.closest('[data-sidebar-nav]')) return

      const navLinks = Array.from(
        document.querySelectorAll('[data-nav-link]')
      ) as HTMLElement[]

      const currentIndex = navLinks.indexOf(focusedElement)
      if (currentIndex === -1) return

      let nextIndex = currentIndex

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          nextIndex = Math.min(currentIndex + 1, navLinks.length - 1)
          break
        case 'ArrowUp':
          e.preventDefault()
          nextIndex = Math.max(currentIndex - 1, 0)
          break
        case 'Home':
          e.preventDefault()
          nextIndex = 0
          break
        case 'End':
          e.preventDefault()
          nextIndex = navLinks.length - 1
          break
        default:
          return
      }

      navLinks[nextIndex]?.focus()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const renderNavItem = React.useCallback((item: NavItem, level = 0) => {
    const isActive = isRouteActive(pathname, item.href)
    const isExpanded = expandedItems.has(item.key)
    const hasChildren = item.children && item.children.length > 0
    const Icon = getIconComponent(item.iconName || 'FileText')

    return (
      <React.Fragment key={item.key}>
        <div className="relative">
          {hasChildren ? (
            <button
              onClick={() => {
                if (!item.isComingSoon) {
                  toggleExpanded(item.key)
                }
              }}
              disabled={item.isComingSoon}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                'hover:bg-accent/70 hover:text-accent-foreground hover:shadow-sm hover:scale-[1.02]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                'active:scale-[0.98]',
                isActive && 'bg-accent text-accent-foreground shadow-sm scale-[1.02]',
                item.isComingSoon && 'opacity-60 cursor-not-allowed',
                level > 0 && 'ml-2 text-xs'
              )}
              data-nav-link
              aria-expanded={isExpanded}
              aria-controls={`nav-${item.key}-children`}
              title={item.isComingSoon ? (locale === 'zh_hk' ? '請期待' : 'Coming Soon') : undefined}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span className="flex-1 text-left">{item.label}</span>
              {item.isComingSoon ? (
                <span className="text-xs opacity-50">
                  {locale === 'zh_hk' ? '請期待' : 'Soon'}
                </span>
              ) : (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
                )
              )}
            </button>
          ) : (
            item.isComingSoon ? (
              <button
                disabled={true}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  'opacity-60 cursor-not-allowed',
                  level > 0 && 'ml-2 text-xs'
                )}
                data-nav-link
                title={locale === 'zh_hk' ? '請期待' : 'Coming Soon'}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span className="flex-1">{item.label}</span>
                <span className="text-xs opacity-50">
                  {locale === 'zh_hk' ? '請期待' : 'Soon'}
                </span>
              </button>
            ) : (
              <Link
                href={item.href}
                locale={locale}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  'hover:bg-accent/70 hover:text-accent-foreground hover:shadow-sm hover:translate-x-1 hover:scale-[1.02]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                  'active:scale-[0.98]',
                  isActive && 'bg-accent text-accent-foreground shadow-sm translate-x-1 scale-[1.02]',
                  level > 0 && 'ml-2 text-xs'
                )}
                data-nav-link
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span>{item.label}</span>
              </Link>
            )
          )}
        </div>

        {hasChildren && isExpanded && !item.isComingSoon && (
          <div
            id={`nav-${item.key}-children`}
            className="mt-2 space-y-1 border-l-2 border-border/30 ml-4 pl-3"
            role="group"
            aria-labelledby={item.key}
          >
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </React.Fragment>
    )
  }, [pathname, expandedItems, toggleExpanded, locale])

  return (
    <aside
      className={cn(
        'fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] border-r border-border/50 bg-background/95 backdrop-blur-sm',
        'w-64 shrink-0 overflow-hidden shadow-lg transition-all duration-300 ease-in-out',
        'md:fixed md:top-14 md:h-[calc(100vh-3.5rem)] md:z-30 md:shadow-lg',
        className
      )}
      aria-label="Documentation navigation"
      data-sidebar-nav
    >
      <ScrollArea className="h-full w-full">
        <div className="p-4 space-y-6">
          <nav className="space-y-2" role="navigation">
            {navigation.map((item, index) => (
              <React.Fragment key={item.key}>
                {renderNavItem(item)}
                {/* Add separator between major sections */}
                {index < navigation.length - 1 && (
                  <Separator className="my-6 bg-border/60 border-t-2" />
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </ScrollArea>
    </aside>
  )
}