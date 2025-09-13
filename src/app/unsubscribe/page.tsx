'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Loader2 } from 'lucide-react'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get('email')

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleUnsubscribe = useCallback(async () => {
    if (!emailFromUrl) {
      setError('No email provided')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailFromUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
      } else {
        setError(data.error || 'Failed to unsubscribe')
      }
    } catch (error) {
      setError('Network error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [emailFromUrl])

  // Auto-unsubscribe if email is provided in URL
  useEffect(() => {
    if (emailFromUrl && !isSuccess && !error && !isLoading) {
      handleUnsubscribe()
    }
  }, [emailFromUrl, handleUnsubscribe, isSuccess, error, isLoading])

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                Unsubscribed Successfully
              </h1>
              <p className="text-gray-600 text-lg">
                You won&apos;t receive any more emails from us.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                We&apos;re sorry to see you go!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900 mb-4">
                Unable to Unsubscribe
              </h1>
              <p className="text-red-600 mb-6">
                {error}
              </p>
              <Button
                onClick={handleUnsubscribe}
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? 'Trying again...' : 'Try Again'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading or initial state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-8 pb-8">
          <div className="text-center">
            {emailFromUrl ? (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-4">
                  Unsubscribing...
                </h1>
                <p className="text-gray-600">
                  Please wait while we process your request.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-semibold text-gray-900 mb-4">
                  Unsubscribe
                </h1>
                <p className="text-gray-600 mb-6">
                  Please use the unsubscribe link from your email.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-4">
                Loading...
              </h1>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}