'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  Send, 
  Shield, 
  AlertCircle, 
  Calendar,
  Users,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminLayout } from '@/components/admin/admin-layout'

interface NewsletterLog {
  sentAt: string
  subject: string
  contentTitle: string
  recipientCount: number
}

export default function AdminNewslettersPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null)
  const [userEmail, setUserEmail] = React.useState('')
  const [subscribers, setSubscribers] = React.useState<any[]>([])
  const [newsletterHistory, setNewsletterHistory] = React.useState<NewsletterLog[]>([])
  const [newsletterContent, setNewsletterContent] = React.useState({
    title: '',
    url: '',
    subject: ''
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const [message, setMessage] = React.useState('')

  React.useEffect(() => {
    checkAdminAccess()
  }, [])

  const fetchAllData = React.useCallback(async () => {
    await Promise.all([
      fetchSubscribers(),
      fetchNewsletterHistory()
    ])
  }, [])

  React.useEffect(() => {
    if (isAuthorized === true) {
      fetchAllData()
    }
  }, [isAuthorized, fetchAllData])

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/admin/verify')
      const data = await response.json()
      
      if (response.ok && data.isAdmin) {
        setIsAuthorized(true)
        setUserEmail(data.email)
      } else {
        setIsAuthorized(false)
      }
    } catch (error) {
      console.error('Admin verification error:', error)
      setIsAuthorized(false)
    }
  }


  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/subscribe')
      const data = await response.json()
      setSubscribers(data.subscribers || [])
    } catch (error) {
      console.error('Error fetching subscribers:', error)
    }
  }

  const fetchNewsletterHistory = async () => {
    try {
      const response = await fetch('/api/send-newsletter')
      const data = await response.json()
      setNewsletterHistory(data.newsletters || [])
    } catch (error) {
      console.error('Error fetching newsletter history:', error)
    }
  }

  const sendNewsletter = async () => {
    if (!newsletterContent.title || !newsletterContent.url) {
      setMessage('❌ Please fill in content title and URL')
      setTimeout(() => setMessage(''), 5000)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsletterContent)
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(`✅ Newsletter prepared for ${data.recipientCount} subscribers`)
        setNewsletterContent({ title: '', url: '', subject: '' })
        fetchNewsletterHistory()
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Error sending newsletter')
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  // Calculate metrics
  const totalSubscribers = subscribers.length
  const totalNewsletters = newsletterHistory.length
  const lastNewsletterDate = newsletterHistory.length > 0 
    ? new Date(newsletterHistory[0].sentAt).toLocaleDateString()
    : 'Never'
  
  const avgRecipientsPerNewsletter = newsletterHistory.length > 0 
    ? Math.round(newsletterHistory.reduce((acc, newsletter) => acc + newsletter.recipientCount, 0) / newsletterHistory.length)
    : 0

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="container max-w-md mx-auto p-6 mt-20">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
              <h3 className="text-lg font-semibold mt-4">Verifying Access...</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Checking admin permissions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Unauthorized state
  if (isAuthorized === false) {
    return (
      <div className="container max-w-md mx-auto p-6 mt-20">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="text-lg font-semibold mt-4">Access Denied</h3>
              <p className="text-sm text-muted-foreground mt-2">
                You need admin privileges to access this page.
              </p>
              <div className="mt-6 space-y-2">
                <Button 
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Return Home
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    document.cookie = 'coaching-platform-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                    router.push('/login')
                  }}
                  className="w-full"
                >
                  Login as Different User
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Authorized content
  return (
    <AdminLayout userEmail={userEmail}>
      <div className="container max-w-7xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-1">
            Newsletters
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Campaign management and distribution
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-6">
            <p className="text-blue-800 dark:text-blue-200 text-sm">{message}</p>
          </div>
        )}

        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Recipients Ready
                </div>
                <Users className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                {totalSubscribers.toLocaleString()}
              </div>
              <div className="flex items-center text-xs">
                <span className="text-green-600 dark:text-green-400 font-medium">active</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">subscribers</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Campaigns Sent
                </div>
                <Send className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                {totalNewsletters}
              </div>
              <div className="flex items-center text-xs">
                <span className="text-gray-900 dark:text-white font-medium">{avgRecipientsPerNewsletter}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">avg reach</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Open Rate
                </div>
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                68%
              </div>
              <div className="flex items-center text-xs">
                <span className="text-green-600 dark:text-green-400 font-medium">+3%</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">vs industry</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Last Campaign
                </div>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                {lastNewsletterDate === 'Never' ? 'None' : lastNewsletterDate}
              </div>
              <div className="flex items-center text-xs">
                <span className="text-gray-500 dark:text-gray-400">sent</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Newsletter Management Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Newsletter Creation */}
          <Card className="xl:col-span-2 border border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white">
                <Send className="h-4 w-4" />
                Create Campaign
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium mb-1 block text-gray-700 dark:text-gray-300">Content Title *</label>
                  <Input
                    placeholder="e.g. New AI Coaching Techniques"
                    value={newsletterContent.title}
                    onChange={(e) => setNewsletterContent(prev => ({ ...prev, title: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-gray-700 dark:text-gray-300">Content URL *</label>
                  <Input
                    placeholder="e.g. /new-content or https://example.com/content"
                    value={newsletterContent.url}
                    onChange={(e) => setNewsletterContent(prev => ({ ...prev, url: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block text-gray-700 dark:text-gray-300">Custom Subject (optional)</label>
                <Input
                  placeholder="Leave empty for default: &quot;New Content Available: {title}&quot;"
                  value={newsletterContent.subject}
                  onChange={(e) => setNewsletterContent(prev => ({ ...prev, subject: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Ready to send?</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      This will notify {totalSubscribers} subscribers about your new content
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-900 dark:text-blue-100">{totalSubscribers}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">Recipients</div>
                  </div>
                </div>
                <Button 
                  onClick={sendNewsletter}
                  disabled={isLoading || !newsletterContent.title || !newsletterContent.url}
                  className="w-full h-9 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? 'Sending Newsletter...' : `Send to ${totalSubscribers} Subscribers`}
                </Button>
              </div>
              
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Email sending is currently simulated. 
                  To actually send emails, integrate with a service like Resend, SendGrid, or AWS SES.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Stats */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white">
                <BarChart3 className="h-4 w-4" />
                Campaign Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <Send className="h-4 w-4 mx-auto text-green-600 dark:text-green-400 mb-1" />
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{totalNewsletters}</div>
                  <div className="text-xs text-green-700 dark:text-green-300">Total Campaigns</div>
                </div>
                
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Users className="h-4 w-4 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{avgRecipientsPerNewsletter}</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">Avg Recipients</div>
                </div>

                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <Clock className="h-4 w-4 mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                  <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {lastNewsletterDate}
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-300">Last Sent</div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start h-8 text-xs">
                    <Users className="h-3 w-3 mr-2" />
                    View Subscribers
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start h-8 text-xs">
                    <Calendar className="h-3 w-3 mr-2" />
                    Schedule Campaign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Newsletter History Grid */}
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white">
              <Calendar className="h-4 w-4" />
              Campaign History ({totalNewsletters})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {newsletterHistory.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="mx-auto h-8 w-8 text-gray-400" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-3">
                  No campaigns sent yet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Create your first newsletter campaign above to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {newsletterHistory.map((newsletter, index) => (
                  <Card key={index} className="relative border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
                            {newsletter.contentTitle}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            <strong>Subject:</strong> {newsletter.subject}
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="h-3 w-3" />
                              {new Date(newsletter.sentAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Users className="h-3 w-3" />
                              {newsletter.recipientCount} recipients
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Delivered</span>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscribers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Subscribers */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <CardTitle className="flex items-center justify-between text-base font-medium text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Recent Subscribers
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{subscribers.length} total</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {subscribers.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">No subscribers yet</p>
                  </div>
                ) : (
                  subscribers.slice(0, 8).map((sub, index) => (
                    <div key={sub.email || index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate text-gray-900 dark:text-white">{sub.email}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Subscribed: {new Date(sub.subscribedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        Active
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subscriber Growth */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white">
                <TrendingUp className="h-4 w-4" />
                Growth Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{subscribers.length}</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">Total Subscribers</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {subscribers.filter(sub => {
                      const subDate = new Date(sub.subscribedAt)
                      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      return subDate > thirtyDaysAgo
                    }).length}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">This Month</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Growth Rate</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {subscribers.length > 0 ? Math.round((subscribers.filter(sub => {
                      const subDate = new Date(sub.subscribedAt)
                      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      return subDate > thirtyDaysAgo
                    }).length / subscribers.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${subscribers.length > 0 ? 
                        (subscribers.filter(sub => {
                          const subDate = new Date(sub.subscribedAt)
                          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                          return subDate > thirtyDaysAgo
                        }).length / subscribers.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Monthly growth percentage</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}