'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ContentBlock } from '@/lib/content'
import { CodePopup } from '@/components/code-popup'
import { useTranslations } from 'next-intl'

interface PromptCategorySectionProps {
  title: string
  prompts: ContentBlock[]
  className?: string
}

export function PromptCategorySection({ title, prompts, className }: PromptCategorySectionProps) {
  const t = useTranslations('codeSearch')
  
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
          {t('templateCount', { count: prompts.length, plural: prompts.length !== 1 ? 's' : '' })}
        </p>
      </div>

      {/* Prompts Grid - Better spacing and readability */}
      <div className={cn(
        "grid gap-4",
        // Mobile: 1 column
        "grid-cols-1",
        // Tablet: 2 columns
        "sm:grid-cols-2",
        // Desktop and above: max 3 columns
        "md:grid-cols-3",
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