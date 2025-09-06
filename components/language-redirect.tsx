'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function LanguageRedirect() {
  const router = useRouter()

  useEffect(() => {
    try {
      // Check for saved language preference
      const savedLanguage = localStorage.getItem('preferred-language')
      if (savedLanguage) {
        // Redirect to the saved language welcome page
        router.replace(`/${savedLanguage}/welcome`)
      } else {
        // Default to English if no preference is saved
        router.replace('/en/welcome')
      }
    } catch (error) {
      // Handle localStorage errors (e.g., in private browsing mode)
      router.replace('/en/welcome')
    }
  }, [router])

  return null // This component doesn't render anything
}
