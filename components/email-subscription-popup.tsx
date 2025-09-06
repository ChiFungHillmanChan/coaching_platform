'use client'

import React from 'react'
import { X, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface EmailSubscriptionPopupProps {
  onClose: () => void
  className?: string
}

export function EmailSubscriptionPopup({ onClose, className }: EmailSubscriptionPopupProps) {
  const t = useTranslations('emailSubscription')
  const [email, setEmail] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('errorGeneric'))
      }

      setIsSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneric'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className={cn(
        'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
        className
      )}>
        <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('successTitle')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('successMessage')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn(
      'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
      className
    )}>
      <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={t('closePopup')}
          >
            <X className="h-4 w-4" />
          </button>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t('description')}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder={t('placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                disabled={isSubmitting}
              />
              {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                {t('maybeLater')}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || !email.trim()}
              >
                {isSubmitting ? t('subscribing') : t('subscribe')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}