'use client'

import { useState, useEffect, useCallback } from 'react'

const POPUP_STORAGE_KEY = 'email-subscription-popup-shown'
const POPUP_DELAY = 10000 // 10 seconds

export function useEmailSubscriptionPopup() {
  const [shouldShow, setShouldShow] = useState(false)
  const [hasBeenShown, setHasBeenShown] = useState(false)

  useEffect(() => {
    // Check if popup has been shown before for this session/page
    const hasShownBefore = sessionStorage.getItem(POPUP_STORAGE_KEY) === 'true'
    
    if (hasShownBefore) {
      setHasBeenShown(true)
      return
    }

    // Set up timer to show popup after 10 seconds
    const timer = setTimeout(() => {
      if (!hasBeenShown) {
        setShouldShow(true)
        setHasBeenShown(true)
        // Mark as shown in session storage
        sessionStorage.setItem(POPUP_STORAGE_KEY, 'true')
      }
    }, POPUP_DELAY)

    return () => {
      clearTimeout(timer)
    }
  }, [hasBeenShown])

  const closePopup = useCallback(() => {
    setShouldShow(false)
    // Ensure it won't show again in this session
    sessionStorage.setItem(POPUP_STORAGE_KEY, 'true')
  }, [])

  return {
    shouldShowPopup: shouldShow,
    closePopup
  }
}