import { getNavigation } from '@/lib/nav'
import { DocsLayoutClient } from '@/components/docs-layout-client'

interface DocsLayoutProps {
  children: React.ReactNode
  locale: string
}

export function DocsLayout({ children, locale }: DocsLayoutProps) {
  const navigation = getNavigation(locale)

  return (
    <DocsLayoutClient navigation={navigation}>
      {children}
    </DocsLayoutClient>
  )
}