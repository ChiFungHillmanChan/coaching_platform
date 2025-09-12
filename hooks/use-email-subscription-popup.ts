'use client'

import { useState, useEffect, useCallback } from 'react'

const POPUP_SHOWN_KEY = 'email-subscription-popup-shown'

export function useEmailSubscriptionPopup() {
  const [shouldShow, setShouldShow] = useState(false)
  const [hasScrollTriggered, setHasScrollTriggered] = useState(false)

  useEffect(() => {
    // Check if popup has already been shown in this browser session
    const hasBeenShown = sessionStorage.getItem(POPUP_SHOWN_KEY) === 'true'
    
    if (hasBeenShown) {
      setHasScrollTriggered(true)
      return
    }

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const documentHeight = document.documentElement.scrollHeight
      
      // Check if user has scrolled to 50% of the page height
      const scrollPercentage = scrollTop / (documentHeight - window.innerHeight)
      const hasScrolledToMiddle = scrollPercentage >= 0.5
      
      if (hasScrolledToMiddle && !hasScrollTriggered && !shouldShow) {
        setShouldShow(true)
        setHasScrollTriggered(true)
        sessionStorage.setItem(POPUP_SHOWN_KEY, 'true')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasScrollTriggered, shouldShow])

  const closePopup = useCallback(() => {
    setShouldShow(false)
  }, [])

  const showPopup = useCallback(() => {
    const hasBeenShown = sessionStorage.getItem(POPUP_SHOWN_KEY) === 'true'
    if (!hasBeenShown) {
      setShouldShow(true)
      sessionStorage.setItem(POPUP_SHOWN_KEY, 'true')
    }
  }, [])

  return {
    shouldShowPopup: shouldShow,
    closePopup,
    showPopup
  }
}