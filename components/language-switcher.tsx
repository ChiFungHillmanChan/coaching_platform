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

  // Simple state for current language
  const [currentLanguage, setCurrentLanguage] = React.useState(() => 
    languages.find(lang => lang.code === locale) || languages[0]
  )
  const [isClient, setIsClient] = React.useState(false)

  // Mark as client-side after hydration
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // Load saved language preference on initial load
  React.useEffect(() => {
    if (isClient) {
      try {
        const savedLanguage = localStorage.getItem('preferred-language')
        if (savedLanguage) {
          const savedLang = languages.find(lang => lang.code === savedLanguage)
          if (savedLang) {
            setCurrentLanguage(savedLang)
            return
          }
        }
      } catch (error) {
        console.warn('Could not access localStorage:', error)
      }
      
      // Fallback to URL locale if no saved preference
      const urlLanguage = languages.find(lang => lang.code === locale) || languages[0]
      setCurrentLanguage(urlLanguage)
    }
  }, [locale, isClient])

  const handleLanguageChange = (newLocale: string) => {
    // Update current language immediately for instant visual feedback
    const newLanguage = languages.find(lang => lang.code === newLocale) || languages[0]
    setCurrentLanguage(newLanguage)
    
    // Save preference to localStorage
    try {
      localStorage.setItem('preferred-language', newLocale)
    } catch (error) {
      console.warn('Could not save language preference:', error)
    }
    
    // Use next-intl router to navigate to the same path with new locale
    // Use window.location to force a clean navigation with the new locale
    const currentPath = pathname.startsWith('/') ? pathname : `/${pathname}`
    window.location.href = `/${newLocale}${currentPath}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 gap-2 min-w-[80px]">
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">
            {isClient ? currentLanguage.flag : '🌐'}
          </span>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {isClient ? currentLanguage.name : 'Language'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => {
          const isCurrentLanguage = currentLanguage.code === language.code
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`flex items-center gap-2 cursor-pointer ${
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