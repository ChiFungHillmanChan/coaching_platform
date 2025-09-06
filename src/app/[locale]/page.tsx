import { getPageContent } from '@/lib/content-utils'
import { ContentRenderer } from '@/components/content-renderer'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    locale: string
  }
}

export default function LocalePage({ params }: PageProps) {
  // Show welcome page content directly
  const content = getPageContent(['welcome', 'welcome'], params.locale)
  
  if (!content) {
    notFound()
  }

  // Check if the first block is already a heading that matches the title
  const hasMatchingHeading = content.blocks.length > 0 && 
    content.blocks[0].type === 'heading' && 
    content.blocks[0].level === 1 && 
    content.blocks[0].content === content.title;

  return (
    <article className="max-w-4xl mx-auto px-6 py-8">
      {!hasMatchingHeading && (
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
          {content.description && (
            <p className="text-xl text-muted-foreground">{content.description}</p>
          )}
        </header>
      )}
      <ContentRenderer blocks={content.blocks} />
    </article>
  )
}