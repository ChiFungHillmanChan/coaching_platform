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
  checked?: boolean;
}

export interface ContentBlock {
  type: 'text' | 'heading' | 'code' | 'image' | 'video' | 'list' | 'card' | 'callout' | 'blockquote' | 'link' | 'line-break' | 'horizontal-rule' | 'terminal' | 'table' | 'task-list';
  content: string;
  level?: number; // For headings
  language?: string; // For code blocks
  src?: string; // For images/videos/links
  alt?: string; // For images
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
