'use client'

import * as React from 'react'
import { Search, ExternalLink, Menu, PanelLeftClose, PanelLeft, X, Mail, Globe, Palette, Moon, Sun, ChevronDown } from 'lucide-react'
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
  isHamburgerOpen?: boolean
  onHamburgerToggle?: () => void
  onShowSubscriptionPopup?: () => void
}

export function TopBar({ onMenuClick, onSidebarToggle, isSidebarOpen, className, isHamburgerOpen, onHamburgerToggle, onShowSubscriptionPopup }: TopBarProps) {
  const locale = useLocale()
  const t = useTranslations('ui')
  const [emailValue, setEmailValue] = React.useState('')
  const [isSubscribing, setIsSubscribing] = React.useState(false)
  const [subscriptionMessage, setSubscriptionMessage] = React.useState('')

  // Language and theme switching logic for mobile hamburger menu
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh_hk', name: '繁體中文', flag: '🇭🇰' },
  ]
  
  // Always show the language based on the current URL locale
  const currentLanguage = React.useMemo(() => 
    languages.find(lang => lang.code === locale) || languages[0], 
    [locale]
  )
  const [currentTheme, setCurrentTheme] = React.useState<string | null>(null)
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = React.useState(false)
  
  // Get current theme
  React.useEffect(() => {
    setCurrentTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  }, [])
  
  const handleMobileLanguageToggle = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
  }

  const handleMobileLanguageChange = (newLocale: string) => {
    console.log('Mobile language change:', locale, '->', newLocale)
    
    // Close language dropdown
    setIsLanguageDropdownOpen(false)
    
    // Prevent unnecessary navigation if already on the correct locale
    if (newLocale === locale) {
      console.log('Already on correct locale, skipping navigation')
      return
    }
    
    // Save preference to localStorage
    try {
      localStorage.setItem('preferred-language', newLocale)
    } catch (error) {
      console.warn('Could not save language preference:', error)
    }
    
    // Navigate to new locale
    const pathname = window.location.pathname
    const currentPath = pathname.replace(`/${locale}`, '') || '/'
    const newUrl = `/${newLocale}${currentPath}`
    
    onHamburgerToggle?.() // Close hamburger menu
    window.location.href = newUrl
  }
  
  const handleMobileThemeToggle = () => {
    const isDark = document.documentElement.classList.contains('dark')
    const newTheme = isDark ? 'light' : 'dark'
    
    console.log('Mobile theme toggle:', isDark ? 'dark' : 'light', '->', newTheme)
    
    // Toggle theme
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
    
    setCurrentTheme(newTheme)
    // Keep hamburger menu open for theme toggle
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailValue.trim()) return

    setIsSubscribing(true)
    setSubscriptionMessage('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailValue }),
      })

      if (response.ok) {
        setSubscriptionMessage('Successfully subscribed!')
        setEmailValue('')
      } else {
        const data = await response.json()
        setSubscriptionMessage(data.error || 'Subscription failed')
      }
    } catch (error) {
      setSubscriptionMessage('Network error occurred')
    } finally {
      setIsSubscribing(false)
      // Clear message after 3 seconds
      setTimeout(() => setSubscriptionMessage(''), 3000)
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="flex h-14 items-center px-4">
        {/* Mobile Sidebar Toggle - Only shown on mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Logo/Title */}
        <div className="flex items-center space-x-2">
          <Link href="/welcome" className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-sm font-bold">AI</span>
            </div>
            <span className="font-semibold hidden sm:block">{t('brandName')}</span>
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Email Subscription - Desktop only */}
        <div className="relative mx-4 w-full max-w-sm hidden md:block">
          <form onSubmit={handleEmailSubmit} className="relative">
            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="email-input"
              type="email"
              placeholder="Subscribe to newsletter..."
              className="pl-9 pr-16"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              disabled={isSubscribing}
              aria-label="Subscribe to newsletter"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1 h-8 px-3"
              disabled={isSubscribing || !emailValue.trim()}
            >
              {isSubscribing ? '...' : 'Subscribe'}
            </Button>
          </form>
          {subscriptionMessage && (
            <div className={cn(
              "absolute top-12 left-0 right-0 px-3 py-2 text-xs rounded-md shadow-md z-10",
              subscriptionMessage.includes('Successfully') 
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            )}>
              {subscriptionMessage}
            </div>
          )}
        </div>

        {/* Desktop Actions - Hidden on mobile */}
        <div className="hidden md:flex items-center space-x-2 min-w-[120px]">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label={t('websiteLink')}
          >
            <a
              href={process.env.NEXT_PUBLIC_GITHUB_URL || 'https://hillmanchan.com'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <ThemeToggle />
        </div>

        {/* Mobile Hamburger Menu Button - Only shown on mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onHamburgerToggle}
          aria-label="Toggle navigation menu"
          className="ml-4 md:hidden"
        >
          {isHamburgerOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Mobile Hamburger Menu Dropdown - Only shown on mobile */}
      {isHamburgerOpen && (
        <div 
          className="absolute top-14 right-0 w-64 max-w-[90vw] bg-background border border-border shadow-lg rounded-md z-50 m-2 animate-in slide-in-from-top-2 duration-200 md:hidden"
          data-hamburger-menu
        >
          <div className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-10 px-3"
                  onClick={() => {
                    onShowSubscriptionPopup?.()
                    onHamburgerToggle?.()
                  }}
                >
                  <Mail className="h-4 w-4 mr-3" />
                  Subscribe to Newsletter
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-10 px-3"
                  asChild
                >
                  <a
                    href={process.env.NEXT_PUBLIC_GITHUB_URL || 'https://hillmanchan.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onHamburgerToggle?.()}
                  >
                    <ExternalLink className="h-4 w-4 mr-3" />
                    Visit Website
                  </a>
                </Button>
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Settings</h3>
                
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between h-10 px-3"
                    onClick={handleMobileLanguageToggle}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Language</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{currentLanguage.flag}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {currentLanguage.name}
                      </span>
                      <ChevronDown 
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                          isLanguageDropdownOpen ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>
                  </Button>
                  
                  {isLanguageDropdownOpen && (
                    <div className="ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {languages.map((language) => (
                        <Button
                          key={language.code}
                          variant="ghost"
                          size="sm"
                          className={`w-full justify-start h-9 px-3 ${
                            language.code === locale ? 'bg-accent' : ''
                          }`}
                          onClick={() => handleMobileLanguageChange(language.code)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{language.flag}</span>
                            <span className="text-sm">{language.name}</span>
                          </div>
                          {language.code === locale && (
                            <span className="ml-auto text-xs text-muted-foreground">✓</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                  
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between h-10 px-3"
                  onClick={handleMobileThemeToggle}
                >
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Theme</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {currentTheme === 'dark' ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {currentTheme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </header>
  )
}