'use client'

import { useState, useEffect, useCallback } from 'react'

const POPUP_COUNT_KEY = 'email-subscription-popup-count'
const POPUP_DELAY = 10000 // 10 seconds
const MAX_POPUP_DISPLAYS = 2

export function useEmailSubscriptionPopup() {
  const [shouldShow, setShouldShow] = useState(false)
  const [popupCount, setPopupCount] = useState(0)
  const [hasTimerTriggered, setHasTimerTriggered] = useState(false)
  const [hasScrollTriggered, setHasScrollTriggered] = useState(false)

  useEffect(() => {
    // Get current popup display count from session storage
    const currentCount = parseInt(sessionStorage.getItem(POPUP_COUNT_KEY) || '0', 10)
    setPopupCount(currentCount)
    
    // If we've already shown the popup twice, don't show it again
    if (currentCount >= MAX_POPUP_DISPLAYS) {
      setHasTimerTriggered(true)
      setHasScrollTriggered(true)
      return
    }

    // Set up timer to show popup after 10 seconds (first trigger)
    const timer = setTimeout(() => {
      if (!hasTimerTriggered && currentCount < MAX_POPUP_DISPLAYS) {
        setShouldShow(true)
        setHasTimerTriggered(true)
        const newCount = currentCount + 1
        setPopupCount(newCount)
        sessionStorage.setItem(POPUP_COUNT_KEY, newCount.toString())
      }
    }, POPUP_DELAY)

    return () => {
      clearTimeout(timer)
    }
  }, [hasTimerTriggered])

  // Scroll to bottom detection
  useEffect(() => {
    const currentCount = parseInt(sessionStorage.getItem(POPUP_COUNT_KEY) || '0', 10)
    
    // Only add scroll listener if we haven't reached max displays and haven't triggered scroll popup yet
    if (currentCount >= MAX_POPUP_DISPLAYS || hasScrollTriggered) {
      return
    }

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      // Check if user has scrolled to bottom (with 100px threshold)
      const isAtBottom = scrollTop + windowHeight >= documentHeight - 100
      
      if (isAtBottom && !hasScrollTriggered && !shouldShow) {
        const newCount = parseInt(sessionStorage.getItem(POPUP_COUNT_KEY) || '0', 10)
        if (newCount < MAX_POPUP_DISPLAYS) {
          setShouldShow(true)
          setHasScrollTriggered(true)
          const updatedCount = newCount + 1
          setPopupCount(updatedCount)
          sessionStorage.setItem(POPUP_COUNT_KEY, updatedCount.toString())
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasScrollTriggered, shouldShow])

  const closePopup = useCallback(() => {
    setShouldShow(false)
  }, [])

  const showPopup = useCallback(() => {
    const currentCount = parseInt(sessionStorage.getItem(POPUP_COUNT_KEY) || '0', 10)
    if (currentCount < MAX_POPUP_DISPLAYS) {
      setShouldShow(true)
    }
  }, [])

  return {
    shouldShowPopup: shouldShow,
    closePopup,
    showPopup,
    popupCount,
    maxDisplaysReached: popupCount >= MAX_POPUP_DISPLAYS
  }
}