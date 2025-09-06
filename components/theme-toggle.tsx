'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

interface ThemeToggleProps {
  variant?: 'button' | 'switch'
  className?: string
}

export function ThemeToggle({ variant = 'button', className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  
  const isDark = theme === 'dark'
  
  const handleToggle = React.useCallback(() => {
    setTheme(isDark ? 'light' : 'dark')
  }, [isDark, setTheme])

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  }, [handleToggle])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (variant === 'switch') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Sun className="h-4 w-4" />
        <Switch
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          aria-label="Toggle dark mode"
        />
        <Moon className="h-4 w-4" />
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={className}
      aria-label="Toggle dark mode"
    >
      <div className="relative h-4 w-4">
        <Sun className={`absolute h-4 w-4 transition-all duration-500 ${isDark ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
        <Moon className={`absolute h-4 w-4 transition-all duration-500 ${isDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
      </div>
    </Button>
  )
}

import { cn } from '@/lib/utils'