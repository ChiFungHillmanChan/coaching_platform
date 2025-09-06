import { 
  BookOpen, 
  Rocket, 
  Zap, 
  Layers, 
  Gauge, 
  Settings, 
  Bot,
  Users,
  Calendar,
  BarChart3,
  Clipboard,
  Brain,
  Target,
  Repeat,
  FileText,
  MessageSquare,
  CheckSquare,
  LayoutTemplate,
  Lightbulb,
  AlertTriangle,
  BookMarked,
  CaseSensitive,
  Wrench,
  Eye,
  Globe,
  Gift
} from 'lucide-react'

// Icon components mapping
export const ICON_COMPONENTS = {
  BookOpen,
  Rocket,
  Zap,
  Layers,
  Gauge,
  Settings,
  Bot,
  Users,
  Calendar,
  BarChart3,
  Clipboard,
  Brain,
  Target,
  Repeat,
  FileText,
  MessageSquare,
  CheckSquare,
  LayoutTemplate,
  Lightbulb,
  AlertTriangle,
  BookMarked,
  CaseSensitive,
  Wrench,
  Eye,
  Globe,
  Gift
} as const

// Default icon mapping - can be extended via config in the future
const defaultIconMapping: Record<string, string> = {
  'BookOpen': 'BookOpen',
  'Rocket': 'Rocket', 
  'Zap': 'Zap',
  'Layers': 'Layers',
  'Gauge': 'Gauge',
  'Settings': 'Settings',
  'Bot': 'Bot',
  'Users': 'Users',
  'Calendar': 'Calendar',
  'BarChart3': 'BarChart3',
  'Clipboard': 'Clipboard',
  'Brain': 'Brain',
  'Target': 'Target',
  'Repeat': 'Repeat',
  'FileText': 'FileText',
  'MessageSquare': 'MessageSquare',
  'CheckSquare': 'CheckSquare',
  'LayoutTemplate': 'LayoutTemplate',
  'Lightbulb': 'Lightbulb',
  'AlertTriangle': 'AlertTriangle',
  'BookMarked': 'BookMarked',
  'CaseSensitive': 'CaseSensitive',
  'Wrench': 'Wrench',
  'Eye': 'Eye',
  'Globe': 'Globe',
  'Gift': 'Gift'
}

// Load icon mapping dynamically (server-side only)
let iconMapping = defaultIconMapping;

if (typeof window === 'undefined' && typeof process !== 'undefined') {
  try {
    const fs = eval('require("fs")');
    const path = eval('require("path")');
    const configPath = path.join(process.cwd(), 'config', 'icons.json');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      iconMapping = { ...defaultIconMapping, ...config.icons };
    }
  } catch (error) {
    // Use default mapping
  }
}

export function getIconComponent(iconName: string) {
  const mappedIconName = iconMapping[iconName] || iconName
  return ICON_COMPONENTS[mappedIconName as keyof typeof ICON_COMPONENTS] || FileText
}