'use client'

import * as React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from '@/routing'
import { Globe } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh_hk', name: '繁體中文', flag: '🇭🇰' },
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()

  // Always show the language based on the current URL locale
  const currentLanguage = React.useMemo(() => 
    languages.find(lang => lang.code === locale) || languages[0], 
    [locale]
  )
  const [isClient, setIsClient] = React.useState(false)

  // Mark as client-side after hydration
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  const handleLanguageChange = (newLocale: string) => {
    console.log('Language change requested:', newLocale, 'Current:', locale)
    
    // Prevent unnecessary navigation if already on the correct locale
    if (newLocale === locale) {
      console.log('Already on correct locale, skipping navigation')
      return
    }
    
    // Save preference to localStorage
    try {
      localStorage.setItem('preferred-language', newLocale)
      console.log('Saved language preference:', newLocale)
    } catch (error) {
      console.warn('Could not save language preference:', error)
    }
    
    // Use window.location to force a clean navigation with the new locale
    const currentPath = pathname.startsWith('/') ? pathname : `/${pathname}`
    const newUrl = `/${newLocale}${currentPath}`
    console.log('Navigating to:', newUrl)
    
    window.location.href = newUrl
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 gap-2 min-w-[80px] touch-manipulation"
          type="button"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">
            {isClient ? currentLanguage.flag : '🌐'}
          </span>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {isClient ? currentLanguage.name : 'Language'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 z-[60]" 
        sideOffset={8}
        collisionPadding={16}
      >
        {languages.map((language) => {
          const isCurrentLanguage = currentLanguage.code === language.code
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`flex items-center gap-2 cursor-pointer touch-manipulation min-h-[44px] ${
                isCurrentLanguage ? 'bg-accent' : ''
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
              {isCurrentLanguage && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}