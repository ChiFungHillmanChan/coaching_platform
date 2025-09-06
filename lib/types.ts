export interface ArticleContent {
  title: string;
  description?: string;
  slug: string;
  category: string;
  lastModified: string;
  blocks: ContentBlock[];
}

export interface ContentBlock {
  type: 'text' | 'heading' | 'code' | 'image' | 'video' | 'list' | 'card' | 'callout' | 'blockquote' | 'link' | 'line-break' | 'horizontal-rule';
  content: string;
  level?: number; // For headings
  language?: string; // For code blocks
  src?: string; // For images/videos/links
  alt?: string; // For images
  items?: string[]; // For lists
  title?: string; // For cards/callouts/links
  description?: string; // For cards/callouts
  variant?: 'info' | 'warning' | 'success' | 'error'; // For callouts
  href?: string; // For links
  target?: string; // For links (_blank, _self, etc.)
  listType?: 'unordered' | 'ordered'; // For lists
  nested?: boolean; // For nested blockquotes
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
