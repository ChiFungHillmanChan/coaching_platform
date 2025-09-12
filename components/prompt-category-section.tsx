'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ContentBlock } from '@/lib/content'
import { CodePopup } from '@/components/code-popup'

interface PromptCategorySectionProps {
  title: string
  prompts: ContentBlock[]
  className?: string
}

export function PromptCategorySection({ title, prompts, className }: PromptCategorySectionProps) {
  if (prompts.length === 0) return null

  return (
    <div className={cn("mb-12", className)}>
      {/* Category Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-1 w-8 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
        </div>
        <p className="text-sm text-muted-foreground ml-11">
          {prompts.length} 個指令模板
        </p>
      </div>

      {/* Prompts Grid - More compact with better space utilization */}
      <div className={cn(
        "grid gap-3",
        // Mobile: 2 columns (fits compact cards)
        "grid-cols-2",
        // Tablet: 3 columns
        "sm:grid-cols-3",
        // Medium screens: 4 columns
        "md:grid-cols-4",
        // Large screens: 5 columns
        "lg:grid-cols-5",
        // Extra large screens: 6 columns
        "xl:grid-cols-6",
        // Ensure equal heights for grid items
        "auto-rows-fr",
        // Additional grid properties for consistent sizing
        "[&>*]:h-full"
      )}>
        {prompts.map((prompt, index) => (
          <CodePopup
            key={`${title}-${index}`}
            title={prompt.title || 'Untitled'}
            content={prompt.content || ''}
            language={prompt.language}
          />
        ))}
      </div>
    </div>
  )
}