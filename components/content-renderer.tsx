'use client'

import React from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ContentBlock } from '@/lib/content'
import { AlertTriangle, CheckCircle, Info, XCircle, ExternalLink, Terminal, Check, X, Download, FileText, Copy, CheckCheck, ZoomIn, ZoomOut, Clock } from 'lucide-react'
import { TableOfContents } from '@/components/table-of-contents'
import { EmailSubscriptionForm } from '@/components/email-subscription-form'
import { CodePopup } from '@/components/code-popup'
import { ContentSearch } from '@/components/content-search'
import { PromptCategorySection } from '@/components/prompt-category-section'

// Enhanced markdown parser with extended syntax support
function parseMarkdown(text: string): React.ReactNode {
  if (!text) return text;
  
  // Enhanced pattern to include strikethrough, highlight, subscript, superscript, footnotes
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[([^\]]+)\]\(([^)]+)\)|~~[^~]+~~|==[^=]+==|~([^~]+)~|\^([^^]+)\^|\[\^([^\]]+)\])/g);
  
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
    
    // Strikethrough: ~~text~~
    if (part.startsWith('~~') && part.endsWith('~~') && part.length > 4) {
      const strikeText = part.slice(2, -2);
      return <del key={index} className="line-through text-muted-foreground">{strikeText}</del>;
    }
    
    // Highlight: ==text==
    if (part.startsWith('==') && part.endsWith('==') && part.length > 4) {
      const highlightText = part.slice(2, -2);
      return <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{highlightText}</mark>;
    }
    
    // Subscript: ~text~
    if (part.startsWith('~') && part.endsWith('~') && part.length > 2 && !part.startsWith('~~')) {
      const subText = part.slice(1, -1);
      return <sub key={index} className="text-xs">{subText}</sub>;
    }
    
    // Superscript: ^text^
    if (part.startsWith('^') && part.endsWith('^') && part.length > 2) {
      const supText = part.slice(1, -1);
      return <sup key={index} className="text-xs">{supText}</sup>;
    }
    
    // Footnote reference: [^id]
    const footnoteMatch = part.match(/^\[\^([^\]]+)\]$/);
    if (footnoteMatch) {
      const [, footnoteId] = footnoteMatch;
      return (
        <sup key={index}>
          <a 
            href={`#footnote-${footnoteId}`} 
            className="text-primary hover:underline text-xs"
            id={`footnote-ref-${footnoteId}`}
          >
            [{footnoteId}]
          </a>
        </sup>
      );
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
        className="w-full h-auto object-contain"
        controls
        muted
        preload="metadata"
        playsInline
        {...({'webkit-playsinline': 'true'} as any)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        style={{ aspectRatio: 'auto' }}
      >
        {/* MP4 - Most widely supported */}
        <source src={src} type="video/mp4" />
        {/* WebM - Good for modern browsers */}
        <source src={src.replace(/\.[^/.]+$/, '.webm')} type="video/webm" />
        {/* OGV - Firefox fallback */}
        <source src={src.replace(/\.[^/.]+$/, '.ogv')} type="video/ogg" />
        {/* Fallback message with better styling */}
        <div className="flex items-center justify-center h-48 text-center p-8">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              Your browser does not support video playback.
            </p>
            <p className="text-xs text-muted-foreground">
              Please try updating your browser or use a modern browser like Chrome, Firefox, Safari, or Edge.
            </p>
            <a 
              href={src} 
              download 
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
            >
              Download Video
            </a>
          </div>
        </div>
      </video>
    </div>
  )
}

export function ContentRenderer({ blocks, className, showTableOfContents = true }: ContentRendererProps) {
  const [filteredBlocks, setFilteredBlocks] = React.useState<ContentBlock[]>(blocks)

  // Check if there are any code_pop_up blocks to show search
  const hasCodePopupBlocks = React.useMemo(() => {
    return blocks.some(block => 
      (block.type === 'code_pop_up' || block.type === 'code_popup') && block.title
    )
  }, [blocks])

  // Find the index of the heading "指令Cheat Sheet" or "Prompt Cheat Sheet" to place search after it
  const cheatSheetHeadingIndex = React.useMemo(() => {
    return blocks.findIndex(block => 
      block.type === 'heading' && (block.content === '指令Cheat Sheet' || block.content === 'Prompt Cheat Sheet')
    )
  }, [blocks])

  // Group blocks by categories (heading level 3 followed by code_pop_up blocks)
  const categorizedPrompts = React.useMemo(() => {
    const categories: Array<{ title: string; prompts: ContentBlock[] }> = []
    let currentCategory: string | null = null
    let currentPrompts: ContentBlock[] = []

    filteredBlocks.forEach(block => {
      if (block.type === 'heading' && block.level === 3) {
        // Save previous category if it has prompts
        if (currentCategory && currentPrompts.length > 0) {
          categories.push({ title: currentCategory, prompts: [...currentPrompts] })
        }
        // Start new category
        currentCategory = block.content
        currentPrompts = []
      } else if ((block.type === 'code_pop_up' || block.type === 'code_popup')) {
        if (!currentCategory) {
          // Handle prompts before any category heading (put in default category)
          currentCategory = '指令模板'
        }
        currentPrompts.push(block)
      }
    })

    // Save last category
    if (currentCategory && currentPrompts.length > 0) {
      categories.push({ title: currentCategory, prompts: [...currentPrompts] })
    }

    return categories
  }, [filteredBlocks])

  const renderBlock = (block: ContentBlock, index: number) => {
    // Skip search bar type blocks as they're handled automatically
    if (block.type === 'search bar') {
      return null
    }

    // Skip individual code_pop_up blocks as they're handled by categories (disabled for now)
    // if (block.type === 'code_pop_up' || block.type === 'code_popup') {
    //   return null
    // }

    // Skip heading level 3 blocks if they have associated prompts (handled by categories) (disabled for now)  
    // if (block.type === 'heading' && block.level === 3) {
    //   const hasPromptsInCategory = categorizedPrompts.some(cat => cat.title === block.content)
    //   if (hasPromptsInCategory) {
    //     return null
    //   }
    // }


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
        // Generate ID for headings level 1-4, using the same index-based logic as TableOfContents
        const headingId = block.level && block.level <= 4 ? `heading-${index}` : undefined
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
        const CodeBlockComponent = () => {
          const [copied, setCopied] = React.useState(false)
          
          const handleCopy = async () => {
            try {
              // Process the content to handle \n and \t characters
              let processedContent = block.content
              
              // Replace \n and \t with empty strings when not inside quotes
              let inQuotes = false
              let quoteChar = ''
              let result = ''
              
              for (let i = 0; i < processedContent.length; i++) {
                const char = processedContent[i]
                const nextChar = processedContent[i + 1]
                
                // Check for quote characters
                if ((char === '"' || char === "'" || char === '`') && processedContent[i - 1] !== '\\') {
                  if (!inQuotes) {
                    inQuotes = true
                    quoteChar = char
                    result += char
                  } else if (char === quoteChar) {
                    inQuotes = false
                    quoteChar = ''
                    result += char
                  } else {
                    result += char
                  }
                }
                // Handle escape sequences
                else if (char === '\\' && (nextChar === 'n' || nextChar === 't')) {
                  if (inQuotes) {
                    // Inside quotes: keep the actual characters
                    result += char === '\\' && nextChar === 'n' ? '\n' : 
                             char === '\\' && nextChar === 't' ? '\t' : char
                    if (nextChar === 'n' || nextChar === 't') i++ // skip next character
                  } else {
                    // Outside quotes: replace with empty string (skip both characters)
                    i++ // skip the next character (n or t)
                  }
                }
                // Regular characters
                else {
                  result += char
                }
              }
              
              await navigator.clipboard.writeText(result)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            } catch (err) {
              console.error('Failed to copy text: ', err)
            }
          }

          const renderCodeContent = () => {
            // If language is markdown, parse it as markdown
            if (block.language === 'markdown') {
              return (
                <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">
                  {parseMarkdown(block.content)}
                </div>
              )
            }
            
            // For other languages, display as plain code
            return (
              <code className={cn(
                'text-sm font-mono leading-relaxed text-foreground whitespace-pre-wrap break-words',
                block.language && `language-${block.language}`
              )}>
                {block.content}
              </code>
            )
          }

          return (
            <div className="mb-6">
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
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted/50"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <>
                        <CheckCheck className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4">
                  {renderCodeContent()}
                </div>
              </div>
            </div>
          )
        }

        return <CodeBlockComponent key={index} />

      case 'image':
        const ImageWithZoom = () => {
          const [isZoomed, setIsZoomed] = React.useState(false)
          
          const getImageSizeClasses = (size?: number) => {
            if (!size) return 'w-full max-w-4xl'
            
            const sizeMap = {
              1: 'w-32 max-w-32 sm:w-32 sm:max-w-32',     // 128px - very small
              2: 'w-40 max-w-40 sm:w-48 sm:max-w-48',     // Mobile: 160px, Desktop: 192px - small
              3: 'w-48 max-w-48 sm:w-64 sm:max-w-64',     // Mobile: 192px, Desktop: 256px - small-medium
              4: 'w-56 max-w-56 sm:w-80 sm:max-w-80',     // Mobile: 224px, Desktop: 320px - medium-small
              5: 'w-64 max-w-64 sm:w-96 sm:max-w-96',     // Mobile: 256px, Desktop: 384px - medium
              6: 'w-72 max-w-72 sm:w-[30rem] sm:max-w-[30rem]', // Mobile: 288px, Desktop: 480px - medium-large
              7: 'w-80 max-w-80 sm:w-[36rem] sm:max-w-[36rem]', // Mobile: 320px, Desktop: 576px - large
              8: 'w-full max-w-sm sm:w-[42rem] sm:max-w-[42rem]', // Mobile: full width up to 384px, Desktop: 672px
              9: 'w-full max-w-md sm:w-[48rem] sm:max-w-[48rem]', // Mobile: full width up to 448px, Desktop: 768px
              10: 'w-full max-w-2xl sm:max-w-4xl'  // Mobile: full width up to 672px, Desktop: full width
            }
            
            return sizeMap[size as keyof typeof sizeMap] || 'w-full max-w-2xl sm:max-w-4xl'
          }

          const toggleZoom = () => {
            setIsZoomed(!isZoomed)
          }

          const closeZoom = () => {
            setIsZoomed(false)
          }

          // Handle ESC key to close zoom
          React.useEffect(() => {
            if (!isZoomed) return
            
            const handleKeyDown = (event: KeyboardEvent) => {
              if (event.key === 'Escape') {
                closeZoom()
              }
            }
            
            document.addEventListener('keydown', handleKeyDown)
            return () => document.removeEventListener('keydown', handleKeyDown)
          }, [isZoomed])
          
          return (
            <div className="mb-6">
              <div className={cn(
                "relative rounded-lg overflow-hidden mr-auto group transition-all duration-300 ease-in-out",
                getImageSizeClasses(block.size)
              )}>
                <div 
                  className="relative cursor-pointer"
                  onClick={toggleZoom}
                >
                  <Image
                    src={block.src || ''}
                    alt={block.alt || ''}
                    width={800}
                    height={400}
                    className="w-full h-auto transition-transform duration-300 object-contain"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 80vw"
                  />
                  {/* Zoom button overlay */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleZoom()
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-black/60 hover:bg-black/80 text-white rounded-md text-sm font-medium transition-colors backdrop-blur-sm"
                      title="Zoom to full screen"
                    >
                      <ZoomIn className="h-4 w-4" />
                      <span className="hidden sm:inline">Full Screen</span>
                    </button>
                  </div>
                  {/* Click hint overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/10">
                    <div className="bg-black/60 text-white px-3 py-2 rounded-md text-sm backdrop-blur-sm">
                      Click to zoom
                    </div>
                  </div>
                </div>
                {(block.caption || block.alt) && (
                  <p className="text-sm text-muted-foreground mt-3 text-center italic px-4">
                    {parseMarkdown(block.caption || block.alt || '')}
                  </p>
                )}
              </div>

              {/* Full Screen Zoom Overlay */}
              {isZoomed && (
                <div 
                  className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in-0 duration-300" 
                  onClick={closeZoom}
                >
                  <div className="relative animate-in zoom-in-95 duration-300">
                    <Image
                      src={block.src || ''}
                      alt={block.alt || ''}
                      width={0}
                      height={0}
                      sizes="100vw"
                      className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain transition-all duration-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {/* Close button */}
                    <button
                      onClick={closeZoom}
                      className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
                      title="Close full screen"
                    >
                      <ZoomOut className="h-6 w-6" />
                    </button>
                    {/* Caption in full screen */}
                    {(block.caption || block.alt) && (
                      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 max-w-2xl">
                        <p className="text-sm text-white/90 text-center bg-black/60 px-4 py-2 rounded-md backdrop-blur-sm">
                          {parseMarkdown(block.caption || block.alt || '')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        }
        
        return <ImageWithZoom key={index} />

      case 'video':
        const getVideoSizeClasses = (size?: number) => {
          if (!size) return 'w-full max-w-4xl'
          
          const sizeMap = {
            1: 'w-32 max-w-32 sm:w-32 sm:max-w-32',     // 128px - very small
            2: 'w-40 max-w-40 sm:w-48 sm:max-w-48',     // Mobile: 160px, Desktop: 192px - small
            3: 'w-48 max-w-48 sm:w-64 sm:max-w-64',     // Mobile: 192px, Desktop: 256px - small-medium
            4: 'w-56 max-w-56 sm:w-80 sm:max-w-80',     // Mobile: 224px, Desktop: 320px - medium-small
            5: 'w-64 max-w-64 sm:w-96 sm:max-w-96',     // Mobile: 256px, Desktop: 384px - medium
            6: 'w-72 max-w-72 sm:w-[30rem] sm:max-w-[30rem]', // Mobile: 288px, Desktop: 480px - medium-large
            7: 'w-80 max-w-80 sm:w-[36rem] sm:max-w-[36rem]', // Mobile: 320px, Desktop: 576px - large
            8: 'w-full max-w-sm sm:w-[42rem] sm:max-w-[42rem]', // Mobile: full width up to 384px, Desktop: 672px
            9: 'w-full max-w-md sm:w-[48rem] sm:max-w-[48rem]', // Mobile: full width up to 448px, Desktop: 768px
            10: 'w-full max-w-2xl sm:max-w-4xl'  // Mobile: full width up to 672px, Desktop: full width
          }
          
          return sizeMap[size as keyof typeof sizeMap] || 'w-full max-w-2xl sm:max-w-4xl'
        }

        // Check if video is upcoming
        const isUpcomingVideo = block.src === '/upcoming' || block.src?.startsWith('/upcoming')

        return (
          <div key={index} className="mb-4">
            <div className={cn("mr-auto", getVideoSizeClasses(block.size))}>
              {isUpcomingVideo ? (
                // Upcoming video placeholder
                <div className="relative w-full aspect-video bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Clock className="h-12 w-12 text-muted-foreground/60 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-lg font-medium text-muted-foreground">Video Coming Soon</p>
                      <p className="text-sm text-muted-foreground/80">This content is currently in production</p>
                    </div>
                  </div>
                </div>
              ) : (
                // Regular video player
                <VideoPlayer src={block.src || ''} className="w-full" />
              )}
              {block.alt && (
                <p className="text-sm text-muted-foreground mt-2 text-center italic">
                  {parseMarkdown(block.alt)}
                </p>
              )}
            </div>
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
        const TerminalComponent = () => {
          const [copied, setCopied] = React.useState(false)
          
          const handleCopy = async () => {
            try {
              // Process the content to handle \n and \t characters
              let processedContent = block.content
              
              // Replace \n and \t with empty strings when not inside quotes
              let inQuotes = false
              let quoteChar = ''
              let result = ''
              
              for (let i = 0; i < processedContent.length; i++) {
                const char = processedContent[i]
                const nextChar = processedContent[i + 1]
                
                // Check for quote characters
                if ((char === '"' || char === "'" || char === '`') && processedContent[i - 1] !== '\\') {
                  if (!inQuotes) {
                    inQuotes = true
                    quoteChar = char
                    result += char
                  } else if (char === quoteChar) {
                    inQuotes = false
                    quoteChar = ''
                    result += char
                  } else {
                    result += char
                  }
                }
                // Handle escape sequences
                else if (char === '\\' && (nextChar === 'n' || nextChar === 't')) {
                  if (inQuotes) {
                    // Inside quotes: keep the actual characters
                    result += char === '\\' && nextChar === 'n' ? '\n' : 
                             char === '\\' && nextChar === 't' ? '\t' : char
                    if (nextChar === 'n' || nextChar === 't') i++ // skip next character
                  } else {
                    // Outside quotes: replace with empty string (skip both characters)
                    i++ // skip the next character (n or t)
                  }
                }
                // Regular characters
                else {
                  result += char
                }
              }
              
              await navigator.clipboard.writeText(result)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            } catch (err) {
              console.error('Failed to copy text: ', err)
            }
          }

          return (
            <div className="mb-6">
              {block.title && (
                <div className="text-sm font-medium text-muted-foreground mb-2 px-1">
                  {block.title}
                </div>
              )}
              <div className="rounded-lg border bg-slate-900 dark:bg-slate-950">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-slate-400 font-mono">Terminal</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-green-400 transition-colors rounded hover:bg-slate-800"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <>
                        <CheckCheck className="h-3 w-3 text-green-400" />
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4">
                  <code className="text-sm font-mono leading-relaxed text-green-400 whitespace-pre-wrap break-words">
                    {block.content}
                  </code>
                </div>
              </div>
            </div>
          )
        }

        return <TerminalComponent key={index} />

      case 'table':
        return (
          <div key={index} className="mb-6">
            {block.title && (
              <div className="text-sm font-medium text-muted-foreground mb-2 px-1">
                {parseMarkdown(block.title)}
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
                        {row.map((cell, cellIdx) => {
                          // Enhanced table cell rendering with list support
                          const renderTableCell = (content: string) => {
                            // Check if content contains semicolon-separated items (common list pattern)
                            if (content.includes('；') || content.includes(';')) {
                              const separator = content.includes('；') ? '；' : ';'
                              const items = content.split(separator).map(item => item.trim()).filter(item => item.length > 0)
                              
                              if (items.length > 1) {
                                return (
                                  <ul className="space-y-1 text-sm">
                                    {items.map((item, idx) => (
                                      <li key={idx} className="flex items-start">
                                        <span className="inline-block w-1 h-1 bg-current rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                        <span>{parseMarkdown(item)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )
                              }
                            }
                            
                            // Check for numbered list pattern (1. 2. 3.)
                            if (content.match(/^\d+\./)) {
                              const items = content.split(/(?=\d+\.)/).map(item => item.trim()).filter(item => item.length > 0)
                              
                              if (items.length > 1) {
                                return (
                                  <ol className="space-y-1 text-sm">
                                    {items.map((item, idx) => (
                                      <li key={idx} className="flex items-start">
                                        <span className="inline-block min-w-[1.2rem] text-xs text-muted-foreground mr-1">
                                          {idx + 1}.
                                        </span>
                                        <span>{parseMarkdown(item.replace(/^\d+\./, '').trim())}</span>
                                      </li>
                                    ))}
                                  </ol>
                                )
                              }
                            }
                            
                            // Default markdown parsing
                            return parseMarkdown(content)
                          }
                          
                          return (
                            <td key={cellIdx} className="px-4 py-3 text-sm text-muted-foreground border-r border-black dark:border-gray-600 last:border-r-0 align-top">
                              {renderTableCell(cell)}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case 'task-list':
        // Support both taskItems (new format) and items (legacy format)
        const taskListItems = block.taskItems || (block.items as any[])?.map(item => 
          typeof item === 'string' ? { content: item, completed: false } : {
            ...item,
            // Support both 'completed' and 'checked' properties
            completed: item.completed || item.checked || false
          }
        ) || []
        
        return (
          <div key={index} className="mb-6">
            {block.title && (
              <div className="text-sm font-medium text-muted-foreground mb-3 px-1">
                {block.title}
              </div>
            )}
            <div className="space-y-2">
              {taskListItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={cn(
                    'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5',
                    item.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-muted-foreground/30 hover:border-muted-foreground/50'
                  )}>
                    {item.completed && <Check className="h-3 w-3" />}
                  </div>
                  <div className="text-sm leading-relaxed flex-1 text-foreground">
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

      case 'download-link':
        return (
          <div key={index} className="mb-6">
            <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-lg mb-1">{block.title || 'Download File'}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {parseMarkdown(block.content)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {block.fileType && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {block.fileType.toUpperCase()}
                        </span>
                      )}
                      {block.fileSize && (
                        <span>{block.fileSize}</span>
                      )}
                    </div>
                  </div>
                  <a
                    href={block.href || '#'}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'footnote':
        return (
          <div key={index} className="mb-4 pt-4 border-t border-muted text-sm">
            <p id={`footnote-${block.footnoteId}`} className="text-muted-foreground">
              <a 
                href={`#footnote-ref-${block.footnoteId}`}
                className="text-primary hover:underline mr-2"
              >
                [{block.footnoteId}]
              </a>
              {parseMarkdown(block.footnoteText || block.content)}
            </p>
          </div>
        )

      case 'definition-list':
        return (
          <div key={index} className="mb-6">
            {block.title && (
              <div className="text-sm font-medium text-muted-foreground mb-3 px-1">
                {block.title}
              </div>
            )}
            <dl className="space-y-4">
              {block.definitions?.map((def, idx) => (
                <div key={idx} className="border-l-2 border-primary/20 pl-4">
                  <dt className="font-medium text-foreground mb-1">
                    {parseMarkdown(def.term)}
                  </dt>
                  <dd className="text-sm text-muted-foreground leading-relaxed">
                    {def.definition ? (
                      parseMarkdown(def.definition)
                    ) : def.items ? (
                      <div className="mt-1">
                        {def.listType === 'ordered' ? (
                          <ol className="list-decimal list-inside space-y-1">
                            {def.items.map((item, itemIdx) => (
                              <li key={itemIdx} className="leading-relaxed">
                                {parseMarkdown(item)}
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <ul className="list-disc list-inside space-y-1">
                            {def.items.map((item, itemIdx) => (
                              <li key={itemIdx} className="leading-relaxed">
                                {parseMarkdown(item)}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )

      case 'code_pop_up':
      case 'code_popup':
        // Skip individual rendering - now handled by grid
        return null

      default:
        return null
    }
  }

  // Group consecutive code popup blocks into grids
  const processBlocksForGrid = (blocks: ContentBlock[]) => {
    const processedBlocks: (ContentBlock | { type: 'code_popup_grid'; blocks: ContentBlock[] })[] = []
    let currentCodePopupGroup: ContentBlock[] = []
    
    const flushCodePopups = () => {
      if (currentCodePopupGroup.length > 0) {
        processedBlocks.push({ type: 'code_popup_grid', blocks: currentCodePopupGroup })
        currentCodePopupGroup = []
      }
    }
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      
      if (block.type === 'code_pop_up' || block.type === 'code_popup') {
        currentCodePopupGroup.push(block)
      } else {
        // Flush any accumulated code popups before adding the non-popup block
        flushCodePopups()
        processedBlocks.push(block)
      }
    }
    
    // Handle remaining code popups at the end
    flushCodePopups()
    
    return processedBlocks
  }

  const processedBlocks = processBlocksForGrid(filteredBlocks)

  return (
    <>
      <div className={cn('space-y-4', showTableOfContents && 'xl:mr-20', className)}>
        {processedBlocks.map((block, index) => {
          // Handle code popup grids
          if ('type' in block && block.type === 'code_popup_grid') {
            return (
              <div key={`grid-${index}`} className={cn(
                "grid gap-4 mb-8",
                // Mobile: 1 column
                "grid-cols-1",
                // Tablet: 2 columns
                "sm:grid-cols-2", 
                // Desktop and above: max 3 columns
                "md:grid-cols-3",
                // Ensure equal heights for grid items
                "auto-rows-fr"
              )}>
                {block.blocks.map((popup, popupIndex) => (
                  <CodePopup
                    key={`popup-${popupIndex}`}
                    title={popup.title || 'Untitled'}
                    content={popup.content || ''}
                    language={popup.language}
                  />
                ))}
              </div>
            )
          }
          
          const renderedBlock = renderBlock(block as ContentBlock, index)
          
          // Insert search component after the "指令Cheat Sheet" or "Prompt Cheat Sheet" heading
          if (hasCodePopupBlocks && index === cheatSheetHeadingIndex && cheatSheetHeadingIndex !== -1) {
            return (
              <React.Fragment key={index}>
                {renderedBlock}
                <ContentSearch 
                  blocks={blocks} 
                  onFilteredBlocksChange={setFilteredBlocks}
                />
                
                {/* Render categorized prompts after search - DISABLED */}
                {/* <div className="mt-8">
                  {categorizedPrompts.map((category, catIndex) => (
                    <PromptCategorySection
                      key={`category-${catIndex}`}
                      title={category.title}
                      prompts={category.prompts}
                    />
                  ))}
                </div> */}
              </React.Fragment>
            )
          }
          
          return <React.Fragment key={index}>{renderedBlock}</React.Fragment>
        })}
      </div>
      {showTableOfContents && <TableOfContents blocks={filteredBlocks} />}
    </>
  )
}