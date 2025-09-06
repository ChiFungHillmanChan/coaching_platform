import { Article } from '@/lib/content'
import { PageHeader } from '@/components/page-header'
import { ContentRenderer } from '@/components/content-renderer'

interface ArticlePageProps {
  article: Article
}

export function ArticlePage({ article }: ArticlePageProps) {
  // Check if the first block is already a heading with the same title
  const hasHeadingInContent = article.blocks[0]?.type === 'heading' && 
    article.blocks[0]?.content === article.title

  return (
    <div className="space-y-8">
      {!hasHeadingInContent && (
        <PageHeader
          title={article.title}
          description={article.description}
        />
      )}
      <ContentRenderer blocks={article.blocks} />
    </div>
  )
}