import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { DocsLayout } from '@/components/docs-layout'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: {
    locale: string
  }
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: LocaleLayoutProps) {
  // Load the correct message file directly based on locale
  let messages
  try {
    if (locale === 'zh_hk') {
      messages = (await import(`../../../messages/zh_hk.json`)).default
    } else {
      messages = (await import(`../../../messages/en.json`)).default
    }
  } catch (error) {
    // Fallback to getMessages
    messages = await getMessages()
  }

  return (
    <NextIntlClientProvider 
      messages={messages}
      locale={locale}
    >
      <DocsLayout locale={locale}>{children}</DocsLayout>
    </NextIntlClientProvider>
  )
}