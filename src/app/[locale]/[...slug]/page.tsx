import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { ArticleContent } from '@/lib/types';
import { ContentRenderer } from '@/components/content-renderer';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: {
    locale: string;
    slug: string[];
  };
}

function convertMarkdownToContent(markdown: string, slug: string[]): ArticleContent {
  const lines = markdown.split('\n');
  const blocks: any[] = [];
  let currentBlock: any = null;
  
  // Extract title from first heading or use slug
  let title = slug[slug.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('# ')) {
      // Main heading
      title = trimmedLine.substring(2);
      blocks.push({
        type: 'heading',
        level: 1,
        content: title
      });
    } else if (trimmedLine.startsWith('## ')) {
      // Sub heading
      blocks.push({
        type: 'heading',
        level: 2,
        content: trimmedLine.substring(3)
      });
    } else if (trimmedLine.startsWith('### ')) {
      // Sub sub heading
      blocks.push({
        type: 'heading',
        level: 3,
        content: trimmedLine.substring(4)
      });
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      // List item
      if (currentBlock?.type === 'list') {
        currentBlock.items!.push(trimmedLine.substring(2));
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          type: 'list',
          content: '', // Required by interface
          items: [trimmedLine.substring(2)]
        };
      }
    } else if (trimmedLine.startsWith('> ')) {
      // Callout/quote
      if (currentBlock?.type === 'callout') {
        currentBlock.content += '\n' + trimmedLine.substring(2);
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          type: 'callout',
          variant: 'info',
          content: trimmedLine.substring(2)
        };
      }
    } else if (trimmedLine === '') {
      // Empty line - end current block
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
    } else if (trimmedLine) {
      // Regular text
      if (currentBlock?.type === 'text') {
        currentBlock.content += '\n' + trimmedLine;
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          type: 'text',
          content: trimmedLine
        };
      }
    }
  }
  
  // Add the last block if it exists
  if (currentBlock) {
    blocks.push(currentBlock);
  }
  
  return {
    title,
    description: `Content for ${title}`,
    slug: slug.join('/'),
    category: slug[0] || 'content',
    lastModified: new Date().toISOString(),
    blocks
  };
}

async function getArticleContent(slug: string[], locale: string): Promise<ArticleContent | null> {
  try {
    // Try standardized file types in order of preference
    const fileTypes = [
      `index.${locale}.json`,
      'index.en.json',
      'index.json',
      `index.${locale}.md`,
      'index.en.md',
      'index.md'
    ];
    
    let filePath: string | null = null;
    let fileType: 'json' | 'markdown' | null = null;
    
    // First, try to find the file in the directory structure (prioritize directory over root)
    const contentPath = path.join(process.cwd(), 'content', ...slug);
    for (const fileTypeName of fileTypes) {
      const dirPath = path.join(contentPath, fileTypeName);
      if (fs.existsSync(dirPath)) {
        filePath = dirPath;
        fileType = fileTypeName.endsWith('.json') ? 'json' : 'markdown';
        break;
      }
    }
    
    // If not found in directory, try in the content root directory
    if (!filePath) {
      for (const fileTypeName of fileTypes) {
        const rootPath = path.join(process.cwd(), 'content', fileTypeName);
        if (fs.existsSync(rootPath)) {
          filePath = rootPath;
          fileType = fileTypeName.endsWith('.json') ? 'json' : 'markdown';
          break;
        }
      }
    }
    
    if (!filePath || !fileType) {
      return null;
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    if (fileType === 'json') {
      return JSON.parse(fileContents);
    } else {
      // Convert markdown to content structure
      return convertMarkdownToContent(fileContents, slug);
    }
  } catch (error) {
    console.error('Error reading article content:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  // Remove duplicate locale from slug if it exists
  let processedSlug = params.slug;
  if (processedSlug[0] === params.locale) {
    processedSlug = processedSlug.slice(1);
  }
  
  const content = await getArticleContent(processedSlug, params.locale);
  
  if (!content) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: content.title,
    description: content.description,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  // Remove duplicate locale from slug if it exists
  let processedSlug = params.slug;
  if (processedSlug[0] === params.locale) {
    processedSlug = processedSlug.slice(1);
  }
  
  const content = await getArticleContent(processedSlug, params.locale);
  
  if (!content) {
    notFound();
  }

  // Navigation functionality temporarily disabled

  // Check if the first block is already a heading that matches the title
  const hasMatchingHeading = content.blocks.length > 0 && 
    content.blocks[0].type === 'heading' && 
    content.blocks[0].level === 1 && 
    content.blocks[0].content === content.title;

  return (
    <article className="max-w-4xl mx-auto px-6 ">
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
  );
}

// Force dynamic rendering due to file system operations
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  // This function would generate all possible static params
  // For now, we'll let Next.js handle this dynamically
  return [];
}