import * as React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  children,
  className
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}