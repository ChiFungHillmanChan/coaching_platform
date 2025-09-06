'use client'

import React from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ContentBlock } from '@/lib/content'
import { AlertTriangle, CheckCircle, Info, XCircle, ExternalLink, Terminal, Check, X } from 'lucide-react'
import { TableOfContents } from '@/components/table-of-contents'
import { EmailSubscriptionForm } from '@/components/email-subscription-form'

// Enhanced markdown parser for bold, italic, and inline code
function parseMarkdown(text: string): React.ReactNode {
  if (!text) return text;
  
  // Split by markdown patterns and capture them
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[([^\]]+)\]\(([^)]+)\))/g);
  
  return parts.map((part, index) => {
    // Skip empty or undefined parts
    if (!part || part === '') return null;
    
    // Bold text: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const boldText = part.slice(2, -2);
      return <strong key={index}>{boldText}</strong>;
    }
    
    // Italic text: *text* (but not **text**)
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

interface ContentRendererProps {
  blocks: ContentBlock[]
  className?: string
  showTableOfContents?: boolean
}

interface VideoPlayerProps {
  src: string
  className?: string
}

function VideoPlayer({ src, className }: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className={cn('relative rounded-lg overflow-hidden bg-muted', className)}>
      <video
        ref={videoRef}
        className="w-full h-auto"
        controls
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

export function ContentRenderer({ blocks, className, showTableOfContents = true }: ContentRendererProps) {
  let headingCounter = 0

  const renderBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements
        const headingClasses = {
          1: 'text-3xl font-bold leading-tight tracking-tighter md:text-4xl',
          2: 'text-2xl font-semibold leading-none tracking-tight',
          3: 'text-xl font-semibold',
          4: 'text-lg font-medium',
          5: 'text-base font-medium',
          6: 'text-sm font-medium'
        }
        const headingId = block.level && block.level <= 3 ? `heading-${headingCounter++}` : undefined
        return (
          <HeadingTag 
            key={index} 
            id={headingId}
            className={cn(headingClasses[block.level as keyof typeof headingClasses] || headingClasses[2], 'mb-4 scroll-mt-24')}
          >
            {block.content}
          </HeadingTag>
        )

      case 'text':
        return (
          <p key={index} className="text-muted-foreground leading-7 mb-4">
            {parseMarkdown(block.content)}
          </p>
        )

      case 'code':
        return (
          <div key={index} className="mb-6">
            {block.title && (
              <div className="text-sm font-medium text-muted-foreground mb-2 px-1">
                {block.title}
              </div>
            )}
            <div className="rounded-lg border bg-card">
              <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                  {block.language && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {block.language}
                    </span>
                  )}
                </div>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className={cn(
                  'text-sm font-mono leading-relaxed',
                  block.language && `language-${block.language}`
                )}>
                  {block.content}
                </code>
              </pre>
            </div>
          </div>
        )

      case 'image':
        return (
          <div key={index} className="mb-4">
            <div className="relative rounded-lg overflow-hidden border">
              <Image
                src={block.src || ''}
                alt={block.alt || ''}
                width={800}
                height={400}
                className="w-full h-auto"
              />
            </div>
            {block.alt && (
              <p className="text-sm text-muted-foreground mt-2 text-center italic">
                {block.alt}
              </p>
            )}
          </div>
        )

      case 'video':
        return (
          <div key={index} className="mb-4">
            <VideoPlayer src={block.src || ''} />
            {block.alt && (
              <p className="text-sm text-muted-foreground mt-2 text-center italic">
                {block.alt}
              </p>
            )}
          </div>
        )

      case 'list':
        const ListTag = block.listType === 'ordered' ? 'ol' : 'ul';
        const listClass = block.listType === 'ordered' 
          ? "list-decimal list-inside space-y-1 text-muted-foreground mb-4" 
          : "list-disc list-inside space-y-1 text-muted-foreground mb-4";
        return (
          <ListTag key={index} className={listClass}>
            {block.items?.map((item, idx) => (
              <li key={idx} className="leading-7">{parseMarkdown(item)}</li>
            ))}
          </ListTag>
        )

      case 'card':
        return (
          <Card key={index} className="mb-4">
            {block.title && (
              <CardHeader>
                <CardTitle>{block.title}</CardTitle>
                {block.description && (
                  <CardDescription>{block.description}</CardDescription>
                )}
              </CardHeader>
            )}
            <CardContent>
              <p className="text-sm text-muted-foreground">{block.content}</p>
            </CardContent>
          </Card>
        )

      case 'callout':
        const calloutIcons = {
          info: Info,
          warning: AlertTriangle,
          success: CheckCircle,
          error: XCircle
        }
        const calloutColors = {
          info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
          warning: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
          success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
          error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
        }
        const IconComponent = calloutIcons[block.variant || 'info']
        
        return (
          <Card key={index} className={cn('mb-8', calloutColors[block.variant || 'info'])}>
            <CardContent className="pt-8 pb-8 px-8">
              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/50 flex-shrink-0">
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  {block.title && (
                    <p className="font-medium mb-3 text-base">{parseMarkdown(block.title)}</p>
                  )}
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed break-words hyphens-auto">{parseMarkdown(block.content || '')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'blockquote':
        return (
          <blockquote 
            key={index} 
            className={cn(
              'border-l-4 border-muted-foreground/30 pl-6 py-4 mb-4',
              'bg-muted/30 rounded-r-md',
              block.nested && 'ml-6 border-l-2'
            )}
          >
            <div className="text-muted-foreground italic leading-7">
              {parseMarkdown(block.content)}
            </div>
            {block.title && (
              <cite className="text-sm text-muted-foreground/80 not-italic block mt-2">
                — {block.title}
              </cite>
            )}
          </blockquote>
        )

      case 'link':
        return (
          <div key={index} className="mb-4">
            <a
              href={block.href || '#'}
              target={block.target || (block.href?.startsWith('http') ? '_blank' : '_self')}
              rel={block.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              {block.content || block.title}
              {block.href?.startsWith('http') && (
                <ExternalLink className="h-4 w-4" />
              )}
            </a>
            {block.description && (
              <p className="text-sm text-muted-foreground mt-1">{block.description}</p>
            )}
          </div>
        )

      case 'line-break':
        return <br key={index} />

      case 'horizontal-rule':
        return (
          <hr key={index} className="my-8 border-t border-border" />
        )

      case 'terminal':
        return (
          <div key={index} className="mb-6">
            {block.title && (
              <div className="text-sm font-medium text-muted-foreground mb-2 px-1">
                {block.title}
              </div>
            )}
            <div className="rounded-lg border bg-slate-900 dark:bg-slate-950">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700">
                <Terminal className="h-4 w-4 text-green-400" />
                <span className="text-xs text-slate-400 font-mono">Terminal</span>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm font-mono leading-relaxed text-green-400">
                  {block.content}
                </code>
              </pre>
            </div>
          </div>
        )

      case 'table':
        return (
          <div key={index} className="mb-6">
            {block.title && (
              <div className="text-sm font-medium text-muted-foreground mb-2 px-1">
                {block.title}
              </div>
            )}
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  {block.headers && (
                    <thead className="bg-muted/50">
                      <tr className="border-b border-black dark:border-gray-600">
                        {block.headers.map((header, idx) => (
                          <th key={idx} className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-r border-black dark:border-gray-600 last:border-r-0">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody className="divide-y divide-gray-800 dark:divide-gray-200">
                    {block.rows?.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-muted/30 transition-colors">
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-3 text-sm text-muted-foreground border-r border-black dark:border-gray-600 last:border-r-0">
                            {parseMarkdown(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case 'task-list':
        return (
          <div key={index} className="mb-6">
            {block.title && (
              <div className="text-sm font-medium text-muted-foreground mb-3 px-1">
                {block.title}
              </div>
            )}
            <div className="space-y-2">
              {block.taskItems?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={cn(
                    'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5',
                    item.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-muted-foreground/30 hover:border-muted-foreground/50'
                  )}>
                    {item.completed && <Check className="h-3 w-3" />}
                  </div>
                  <div className={cn(
                    'text-sm leading-relaxed flex-1',
                    item.completed 
                      ? 'text-muted-foreground line-through' 
                      : 'text-foreground'
                  )}>
                    {parseMarkdown(item.content)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'email-subscription':
        return (
          <div key={index} className="my-8">
            <EmailSubscriptionForm 
              variant="minimal"
              title={block.title || "Stay Updated"}
              description={block.content || "Subscribe to receive notifications when new content is published."}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <div className={cn('space-y-4', showTableOfContents && 'xl:mr-20', className)}>
        {blocks.map(renderBlock)}
      </div>
      {showTableOfContents && <TableOfContents blocks={blocks} />}
    </>
  )
}