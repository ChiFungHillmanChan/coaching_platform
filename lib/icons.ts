import { 
  FileText, 
  Book, 
  Settings, 
  Users, 
  Database,
  Code,
  Globe,
  Lock,
  Zap,
  Brain,
  Target,
  TrendingUp,
  MessageSquare,
  Star,
  Bookmark,
  Download,
  Play,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Search,
  Filter,
  Edit,
  Plus,
  Minus,
  X,
  Menu,
  Home,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  MoreVertical,
  ExternalLink,
  Copy,
  Share,
  Eye,
  EyeOff,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bell,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Folder,
  FolderOpen,
  File,
  Image,
  Video,
  Music,
  Headphones,
  Camera,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Power,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Square,
  Circle,
  Triangle,
  Pentagon,
  Hexagon,
  Octagon,
  Diamond,
  type LucideIcon
} from 'lucide-react'

export type IconName = 
  | 'FileText'
  | 'Book' 
  | 'Settings'
  | 'Users'
  | 'Database'
  | 'Code'
  | 'Globe'
  | 'Lock'
  | 'Zap'
  | 'Brain'
  | 'Target'
  | 'TrendingUp'
  | 'MessageSquare'
  | 'Star'
  | 'Bookmark'
  | 'Download'
  | 'Play'
  | 'CheckCircle'
  | 'AlertCircle'
  | 'Info'
  | 'HelpCircle'
  | 'Search'
  | 'Filter'
  | 'Edit'
  | 'Plus'
  | 'Minus'
  | 'X'
  | 'Menu'
  | 'Home'
  | 'ArrowRight'
  | 'ArrowLeft'
  | 'ChevronRight'
  | 'ChevronLeft'
  | 'ChevronDown'
  | 'ChevronUp'
  | 'MoreHorizontal'
  | 'MoreVertical'
  | 'ExternalLink'
  | 'Copy'
  | 'Share'
  | 'Eye'
  | 'EyeOff'
  | 'Heart'
  | 'ThumbsUp'
  | 'ThumbsDown'
  | 'Flag'
  | 'Bell'
  | 'Mail'
  | 'Phone'
  | 'Calendar'
  | 'Clock'
  | 'MapPin'
  | 'Tag'
  | 'Folder'
  | 'FolderOpen'
  | 'File'
  | 'Image'
  | 'Video'
  | 'Music'
  | 'Headphones'
  | 'Camera'
  | 'Mic'
  | 'MicOff'
  | 'Volume2'
  | 'VolumeX'
  | 'Wifi'
  | 'WifiOff'
  | 'Battery'
  | 'BatteryLow'
  | 'Power'
  | 'RefreshCw'
  | 'RotateCcw'
  | 'RotateCw'
  | 'Maximize'
  | 'Minimize'
  | 'Square'
  | 'Circle'
  | 'Triangle'
  | 'Pentagon'
  | 'Hexagon'
  | 'Octagon'
  | 'Diamond'

const iconMap: Record<IconName, LucideIcon> = {
  FileText,
  Book,
  Settings,
  Users,
  Database,
  Code,
  Globe,
  Lock,
  Zap,
  Brain,
  Target,
  TrendingUp,
  MessageSquare,
  Star,
  Bookmark,
  Download,
  Play,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Search,
  Filter,
  Edit,
  Plus,
  Minus,
  X,
  Menu,
  Home,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  MoreVertical,
  ExternalLink,
  Copy,
  Share,
  Eye,
  EyeOff,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bell,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Folder,
  FolderOpen,
  File,
  Image,
  Video,
  Music,
  Headphones,
  Camera,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Power,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Square,
  Circle,
  Triangle,
  Pentagon,
  Hexagon,
  Octagon,
  Diamond,
}

export function getIconComponent(iconName: IconName | string): LucideIcon {
  const icon = iconMap[iconName as IconName]
  if (!icon) {
    // Return a default icon if the requested icon doesn't exist
    return FileText
  }
  return icon
}

export { iconMap }