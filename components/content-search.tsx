'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ContentBlock } from '@/lib/content'
import { useTranslations } from 'next-intl'

interface ContentSearchProps {
  blocks: ContentBlock[]
  onFilteredBlocksChange: (filteredBlocks: ContentBlock[]) => void
  className?: string
}

export function ContentSearch({ blocks, onFilteredBlocksChange, className }: ContentSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const t = useTranslations('codeSearch')

  // Get all code_pop_up blocks with their titles
  const codePopupBlocks = useMemo(() => {
    return blocks.filter(block => 
      (block.type === 'code_pop_up' || block.type === 'code_popup') && 
      block.title
    )
  }, [blocks])

  // Filter blocks based on search query
  const filteredBlocks = useMemo(() => {
    if (!searchQuery.trim()) {
      return blocks // Return all blocks if no search query
    }

    const query = searchQuery.toLowerCase().trim()
    
    // Filter to only show matching code_pop_up blocks and other non-code_pop_up blocks
    return blocks.filter(block => {
      // Always show non-code_pop_up blocks
      if (block.type !== 'code_pop_up' && block.type !== 'code_popup') {
        return true
      }
      
      // For code_pop_up blocks, only show if title matches search
      if (block.title) {
        return block.title.toLowerCase().includes(query)
      }
      
      return false
    })
  }, [blocks, searchQuery])

  // Update parent component with filtered blocks
  useEffect(() => {
    onFilteredBlocksChange(filteredBlocks)
  }, [filteredBlocks, onFilteredBlocksChange])

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Don't render if there are no code_pop_up blocks
  if (codePopupBlocks.length === 0) {
    return null
  }

  const hasResults = searchQuery.trim() && filteredBlocks.some(block => 
    block.type === 'code_pop_up' || block.type === 'code_popup'
  )
  const noResults = searchQuery.trim() && !hasResults

  return (
    <div className={cn("mb-6", className)}>
      <div className="relative max-w-md mx-auto">
        {/* Search Input */}
        <div className={cn(
          "relative flex items-center transition-all duration-200",
          isFocused ? "transform scale-105" : ""
        )}>
          <div className="absolute left-3 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t('searchPrompts', { count: codePopupBlocks.length, plural: codePopupBlocks.length !== 1 ? 's' : '' })}
            className={cn(
              "w-full pl-10 pr-10 py-3 rounded-lg border bg-background text-foreground",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "transition-all duration-200",
              "text-sm sm:text-base",
              isFocused 
                ? "border-primary shadow-lg shadow-primary/10" 
                : "border-border hover:border-muted-foreground"
            )}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className={cn(
                "absolute right-3 p-1 rounded-full",
                "text-muted-foreground hover:text-foreground hover:bg-muted",
                "transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
              title={t('clearSearch')}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results Info */}
        {searchQuery.trim() && (
          <div className="mt-2 text-center">
            {noResults ? (
              <p className="text-sm text-muted-foreground">
                {t('noPromptsFound', { query: searchQuery })}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {(() => {
                  const count = filteredBlocks.filter(block => 
                    block.type === 'code_pop_up' || block.type === 'code_popup'
                  ).length
                  return t('promptsFound', { count, plural: count !== 1 ? 's' : '' })
                })()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mobile-friendly search tips */}
      {!searchQuery && (
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground">
            {t('searchTip')}
          </p>
        </div>
      )}
    </div>
  )
}