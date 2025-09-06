'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function UnsubscribePage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const response = await fetch('/api/subscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Successfully unsubscribed from our newsletter!')
        setEmail('')
      } else {
        setMessage(data.error || 'Failed to unsubscribe')
        setIsError(true)
      }
    } catch (error) {
      setMessage('Network error occurred')
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Unsubscribe from Newsletter</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            We&apos;re sorry to see you go! Enter your email address to unsubscribe from our updates.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUnsubscribe} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
            </Button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              isError 
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Changed your mind? You can always{' '}
              <a href="/welcome" className="text-primary hover:underline">
                visit our homepage
              </a>{' '}
              to subscribe again.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}