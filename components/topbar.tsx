'use client'

import * as React from 'react'
import { Search, Github, Menu, PanelLeftClose, PanelLeft } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/routing'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Kbd } from '@/components/kbd'
import { cn } from '@/lib/utils'

interface TopBarProps {
  onMenuClick?: () => void
  onSidebarToggle?: () => void
  isSidebarOpen?: boolean
  className?: string
}

export function TopBar({ onMenuClick, onSidebarToggle, isSidebarOpen, className }: TopBarProps) {
  const locale = useLocale()
  const t = useTranslations('ui')
  const [searchValue, setSearchValue] = React.useState('')

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('search-input')?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="flex h-14 items-center px-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={onMenuClick}
          aria-label={t('toggleMenu')}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Desktop sidebar toggle button */}
        {onSidebarToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 hidden md:flex"
            onClick={onSidebarToggle}
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Logo/Title */}
        <div className="flex items-center space-x-2">
          <Link href="/welcome" className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-sm font-bold">AI</span>
            </div>
            <span className="font-semibold">{t('brandName')}</span>
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="relative mx-4 w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-input"
            type="search"
            placeholder={t('searchPlaceholder')}
            className="pl-9 pr-16"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label={t('searchDocumentation')}
          />
          <div className="absolute right-2.5 top-2.5 hidden sm:flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 min-w-[120px]">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label={t('githubLink')}
          >
            <a
              href={process.env.NEXT_PUBLIC_GITHUB_URL || 'https://hillmanchan.com'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}