'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react'

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get('email')
  
  const [email, setEmail] = useState(emailFromUrl || '')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Auto-unsubscribe if email is provided in URL
  useEffect(() => {
    if (emailFromUrl) {
      handleUnsubscribe(emailFromUrl)
    }
  }, [emailFromUrl])

  const handleUnsubscribe = async (emailToUnsubscribe?: string) => {
    const targetEmail = emailToUnsubscribe || email
    if (!targetEmail.trim()) return

    setIsLoading(true)
    setMessage('')
    setIsError(false)
    setIsSuccess(false)

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: targetEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('You have been successfully unsubscribed from all future emails.')
        setIsSuccess(true)
        setEmail('')
      } else {
        setMessage(data.error || 'Failed to unsubscribe')
        setIsError(true)
      }
    } catch (error) {
      setMessage('Network error occurred. Please try again.')
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleUnsubscribe()
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unsubscribed Successfully</h3>
              <p className="text-gray-600 mb-6">
                You won't receive any more emails from us. We're sorry to see you go!
              </p>
              
              <div className="space-y-3">
                <Link 
                  href="/welcome"
                  className="inline-flex items-center gap-2 w-full justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Welcome Page
                </Link>
                
                <p className="text-xs text-gray-500 mt-4">
                  Changed your mind? You can always subscribe again on our welcome page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Mail className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">Unsubscribe from Newsletter</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            We're sorry to see you go! Enter your email address to unsubscribe from our updates.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700" 
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? 'Unsubscribing...' : 'Unsubscribe from All Emails'}
            </Button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm flex items-center gap-2 ${
              isError 
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {isError ? (
                <XCircle className="h-4 w-4 flex-shrink-0" />
              ) : (
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
              )}
              {message}
            </div>
          )}

          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-xs text-gray-500">
              Changed your mind?{' '}
              <Link href="/welcome" className="text-blue-600 hover:underline">
                Visit our welcome page
              </Link>{' '}
              to subscribe again.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}