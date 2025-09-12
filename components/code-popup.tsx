'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { X, Copy, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface CodePopupProps {
  title: string
  content: string
  language?: string
  className?: string
}

function parseMarkdown(text: string): React.ReactNode {
  if (!text) return text;
  
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[([^\]]+)\]\(([^)]+)\)|~~[^~]+~~|==[^=]+==|~([^~]+)~|\^([^^]+)\^|\[\^([^\]]+)\])/g);
  
  return parts.map((part, index) => {
    if (!part || part === '') return null;
    
    // Bold text: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const boldText = part.slice(2, -2);
      return <strong key={index}>{boldText}</strong>;
    }
    
    // Italic text: *text*
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**') && part.length > 2) {
      const italicText = part.slice(1, -1);
      return <em key={index}>{italicText}</em>;
    }
    
    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const codeText = part.slice(1, -1);
      return <code key={index} className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{codeText}</code>;
    }
    
    // Markdown links: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, linkText, url] = linkMatch;
      return (
        <a 
          key={index} 
          href={url} 
          className="text-primary hover:underline"
          target={url.startsWith('http') ? '_blank' : '_self'}
          rel={url.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {linkText}
        </a>
      );
    }
    
    return part;
  }).filter(item => item !== null);
}

export function CodePopup({ title, content, language, className }: CodePopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('codeSearch')



  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleClose = useCallback(() => {
    console.log('🚪 CodePopup handleClose triggered:', {
      title,
      previousState: isOpen,
      timestamp: new Date().toISOString()
    })
    setIsOpen(false)
  }, [title, isOpen])

  // DEBUG: Track state changes
  useEffect(() => {
    console.log('🔄 CodePopup isOpen state changed:', {
      title,
      newState: isOpen,
      timestamp: new Date().toISOString()
    })
  }, [isOpen, title])

  // Handle ESC key to close popup
  useEffect(() => {
    if (!isOpen) return
    
    console.log('⌨️ CodePopup ESC key listener attached for:', title)
    
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('⌨️ CodePopup key pressed:', {
        title,
        key: event.key,
        isEscape: event.key === 'Escape',
        timestamp: new Date().toISOString()
      })
      
      if (event.key === 'Escape') {
        console.log('🔑 CodePopup ESC key detected, closing modal for:', title)
        handleClose()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      console.log('🧹 CodePopup removing ESC key listener for:', title)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, title, handleClose])

  // Handle click outside to close popup
  const handleOverlayClick = (e: React.MouseEvent) => {
    console.log('🎯 CodePopup overlay click handler triggered:', {
      title,
      targetIsOverlay: e.target === overlayRef.current,
      overlayRef: overlayRef.current,
      target: e.target,
      timestamp: new Date().toISOString()
    })
    
    if (e.target === overlayRef.current) {
      console.log('✅ CodePopup overlay click detected, closing modal for:', title)
      handleClose()
    } else {
      console.log('🚫 CodePopup overlay click ignored (not on overlay) for:', title)
    }
  }

  // Prevent body scroll when popup is open
  useEffect(() => {
    console.log('📱 CodePopup body scroll effect triggered:', {
      title,
      isOpen,
      bodyOverflow: document.body.style.overflow,
      timestamp: new Date().toISOString()
    })
    
    if (isOpen) {
      console.log('🔒 CodePopup setting body overflow to hidden for:', title)
      document.body.style.overflow = 'hidden'
    } else {
      console.log('🔓 CodePopup restoring body overflow for:', title)
      document.body.style.overflow = ''
    }
    
    return () => {
      console.log('🧹 CodePopup cleanup: restoring body overflow for:', title)
      document.body.style.overflow = ''
    }
  }, [isOpen, title])

  const renderCodeContent = () => {
    if (language === 'markdown') {
      return (
        <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">
          {parseMarkdown(content)}
        </div>
      )
    }
    
    return (
      <code className={cn(
        'text-sm font-mono leading-relaxed text-foreground whitespace-pre-wrap break-words',
        language && `language-${language}`
      )}>
        {content}
      </code>
    )
  }

  return (
    <>
      
      {/* Compact Trigger Button */}
      <div className={cn("h-full", className)}>
        <div 
          className={cn(
            "relative rounded-lg border cursor-pointer group transition-all duration-200 ease-out h-full flex flex-col",
            "bg-card hover:bg-accent/30",
            "border-border hover:border-primary/40",
            "shadow-sm hover:shadow-md hover:shadow-primary/10",
            "dark:hover:bg-accent/20 dark:hover:border-primary/50",
            "p-4 min-h-[90px]" // Better spacing and readability
          )}
          onClick={() => setIsOpen(true)}
        >
          {/* Header with icon and indicator */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-shrink-0 w-7 h-7 rounded bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
              <span className="text-sm">📋</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary/50 transition-colors"></div>
          </div>
          
          {/* Title - better readability */}
          <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
              {title}
            </h4>
            <p className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors">
              {t('clickToUse')}
            </p>
          </div>
        </div>
      </div>

      
      {/* Popup Overlay */}
      {isOpen && (
        <div 
          ref={overlayRef}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in-0 duration-200"
          onClick={handleOverlayClick}
        >
          <div 
            ref={contentRef}
            className="bg-background rounded-lg border shadow-lg max-w-4xl max-h-[90vh] w-full flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
                <h3 className="text-sm font-medium text-foreground">{title}</h3>
                {language && (
                  <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                    {language}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted/50"
                  title={copied ? t('copied') : t('copy')}
                >
                  {copied ? (
                    <>
                      <CheckCheck className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">{t('copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>{t('copy')}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted/50"
                  title={t('close')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {renderCodeContent()}
            </div>
          </div>
        </div>
      )}
    </>
  )
}