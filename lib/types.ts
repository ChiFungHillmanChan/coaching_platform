export interface ArticleContent {
  title: string;
  description?: string;
  slug: string;
  category: string;
  lastModified: string;
  blocks: ContentBlock[];
}

export interface TaskItem {
  content: string;
  completed?: boolean;
  checked?: boolean; // Alternative to completed for backward compatibility
}

export interface ContentBlock {
  type: 'text' | 'heading' | 'code' | 'image' | 'video' | 'list' | 'card' | 'callout' | 'blockquote' | 'link' | 'line-break' | 'horizontal-rule' | 'terminal' | 'table' | 'task-list' | 'download-link' | 'footnote' | 'definition-list';
  content: string;
  level?: number; // For headings
  language?: string; // For code blocks
  src?: string; // For images/videos/links
  alt?: string; // For images
  caption?: string; // For images with captions
  items?: string[]; // For lists
  taskItems?: TaskItem[]; // For task-lists
  title?: string; // For cards/callouts/links
  description?: string; // For cards/callouts
  variant?: 'info' | 'warning' | 'success' | 'error'; // For callouts
  href?: string; // For links
  target?: string; // For links (_blank, _self, etc.)
  listType?: 'unordered' | 'ordered'; // For lists
  nested?: boolean; // For nested blockquotes
  headers?: string[]; // For tables
  rows?: string[][]; // For tables
  fileSize?: string; // For download links
  fileType?: string; // For download links
  footnoteId?: string; // For footnotes
  footnoteText?: string; // For footnotes
  definitions?: { term: string; definition: string }[]; // For definition lists
}

export interface NavigationItem {
  name: string;
  href: string;
  children?: NavigationItem[];
}

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: Omit<NavItem, 'children' | 'icon'>[];
}
