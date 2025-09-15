'use client'

import * as React from 'react'
import { TopBar } from '@/components/topbar'
import { SidebarNav } from '@/components/sidebar-nav'
import { ContentFrame } from '@/components/content-frame'
import { EmailSubscriptionPopup } from '@/components/email-subscription-popup'
import { Footer } from '@/components/footer'
import { useEmailSubscriptionPopup } from '@/hooks/use-email-subscription-popup'
import { type NavItem } from '@/lib/nav'

interface DocsLayoutClientProps {
  children: React.ReactNode
  navigation: NavItem[]
}

export function DocsLayoutClient({ children, navigation }: DocsLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isHamburgerOpen, setIsHamburgerOpen] = React.useState(false)
  const { shouldShowPopup, closePopup, showPopup } = useEmailSubscriptionPopup()

  // Scroll to top on initial load and navigation
  React.useEffect(() => {
    // Scroll to top immediately on mount
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    
    // Also ensure scroll position is reset after potential layout shifts
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }, 100)

    return () => clearTimeout(timer)
  }, [children]) // Re-run when children change (navigation)

  // Close hamburger menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isHamburgerOpen) {
        const target = event.target as Element
        if (!target.closest('[data-hamburger-menu]') && !target.closest('[aria-label="Toggle navigation menu"]')) {
          setIsHamburgerOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isHamburgerOpen])

  return (
    <div className="min-h-screen bg-background">
      <TopBar 
        onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isHamburgerOpen={isHamburgerOpen}
        onHamburgerToggle={() => setIsHamburgerOpen(!isHamburgerOpen)}
        onShowSubscriptionPopup={showPopup}
      />
      
      <div className="flex">
        {/* Desktop sidebar - always visible */}
        <div className="hidden md:block">
          <SidebarNav navigation={navigation} />
        </div>
        
        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="fixed left-0 top-14 bottom-0 w-64 border-r border-border/50 bg-background/95 backdrop-blur-sm shadow-xl animate-in slide-in-from-left duration-300 overflow-hidden mobile-scroll"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarNav
                navigation={navigation}
                onNavigate={() => setIsMobileMenuOpen(false)}
                className="h-full"
              />
            </div>
          </div>
        )}
        
        <ContentFrame className="min-h-[calc(100vh-3.5rem)] md:ml-64">
          <main className="container max-w-4xl px-6 py-6 lg:px-8 lg:py-10">
            {children}
          </main>
          <Footer />
        </ContentFrame>
      </div>
      
      {/* Email Subscription Popup */}
      {shouldShowPopup && (
        <EmailSubscriptionPopup onClose={closePopup} />
      )}
    </div>
  )
}