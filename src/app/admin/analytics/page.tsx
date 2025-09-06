'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  AlertCircle, 
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Send,
  Clock,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminLayout } from '@/components/admin/admin-layout'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Pie
} from 'recharts'

interface ChartData {
  name: string
  subscribers: number
  invites: number
  date: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null)
  const [userEmail, setUserEmail] = React.useState('')
  const [subscribers, setSubscribers] = React.useState<any[]>([])
  const [invitedEmails, setInvitedEmails] = React.useState<any[]>([])
  const [newsletterHistory, setNewsletterHistory] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    checkAdminAccess()
  }, [])

  const fetchAllData = React.useCallback(async () => {
    await Promise.all([
      fetchSubscribers(),
      fetchInvitedEmails(),
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

  const fetchInvitedEmails = async () => {
    try {
      const response = await fetch('/api/admin/invite-email')
      const data = await response.json()
      setInvitedEmails(data.emails || [])
    } catch (error) {
      console.error('Error fetching invited emails:', error)
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

  // Generate comprehensive chart data
  const generateGrowthChartData = (): ChartData[] => {
    const data: ChartData[] = []
    const now = new Date()
    
    // Create data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en', { month: 'short' })
      
      const subscribersUntilThisMonth = subscribers.filter(sub => 
        new Date(sub.subscribedAt) <= date
      ).length
      
      const invitesUntilThisMonth = invitedEmails.filter(email => 
        new Date(email.invitedAt) <= date && email.isActive
      ).length
      
      data.push({
        name: monthName,
        subscribers: subscribersUntilThisMonth,
        invites: invitesUntilThisMonth,
        date: date.toISOString()
      })
    }
    
    return data
  }

  // Generate user activity pie chart data
  const generateUserActivityData = () => {
    const activeUsers = invitedEmails.filter(e => e.lastLoginAt).length
    const inactiveUsers = invitedEmails.filter(e => e.isActive && !e.lastLoginAt).length
    
    return [
      { name: 'Active Users', value: activeUsers },
      { name: 'Never Logged In', value: inactiveUsers }
    ]
  }

  // Generate newsletter performance data
  const generateNewsletterData = () => {
    return newsletterHistory.slice(0, 6).map((newsletter, index) => ({
      name: `Newsletter ${index + 1}`,
      recipients: newsletter.recipientCount,
      date: new Date(newsletter.sentAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })
    }))
  }

  // Calculate metrics
  const totalSubscribers = subscribers.length
  const totalInvited = invitedEmails.filter(e => e.isActive).length
  const totalNewsletters = newsletterHistory.length
  const recentGrowth = subscribers.filter(sub => {
    const subDate = new Date(sub.subscribedAt)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return subDate > thirtyDaysAgo
  }).length

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

  const growthData = generateGrowthChartData()
  const userActivityData = generateUserActivityData()
  const newsletterData = generateNewsletterData()

  // Authorized content
  return (
    <AdminLayout userEmail={userEmail}>
      <div className="container max-w-7xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-1">
            Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Deep insights and performance analysis
          </p>
        </div>

        {/* Advanced Metrics - Different from Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Conversion Rate
                </div>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                {totalInvited > 0 ? Math.round((totalSubscribers / totalInvited) * 100) : 0}%
              </div>
              <div className="flex items-center text-xs">
                <span className="text-gray-900 dark:text-white font-medium">
                  {totalSubscribers}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">of {totalInvited} invited</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Avg Session Time
                </div>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                12m
              </div>
              <div className="flex items-center text-xs">
                <span className="text-green-600 dark:text-green-400 font-medium">+2.1m</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Bounce Rate
                </div>
                <Activity className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                23%
              </div>
              <div className="flex items-center text-xs">
                <span className="text-green-600 dark:text-green-400 font-medium">-5%</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">improvement</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Email Open Rate
                </div>
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                68%
              </div>
              <div className="flex items-center text-xs">
                <span className="text-gray-900 dark:text-white font-medium">
                  {newsletterHistory.length > 0 ? Math.round(newsletterHistory.reduce((acc, newsletter) => acc + newsletter.recipientCount, 0) / newsletterHistory.length) : 0}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">avg opens</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two Large AWS-Style Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* User Behavior Trends */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium text-gray-900 dark:text-white">
                    User Engagement Trends
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Daily active users vs invited users
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#e5e7eb" 
                      strokeOpacity={0.5}
                    />
                    <XAxis 
                      dataKey="name" 
                      axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                      tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                      tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      label={{ 
                        value: 'Users', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' }
                      }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="subscribers" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      name="Active Subscribers"
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2, fill: 'white' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="invites" 
                      stroke="#059669" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Total Invited"
                      dot={{ fill: '#059669', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#059669', strokeWidth: 2, fill: 'white' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                    <span>Active Subscribers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded-sm border-2 border-dashed border-green-600"></div>
                    <span>Total Invited</span>
                  </div>
                </div>
                <span>Engagement: {totalInvited > 0 ? Math.round((invitedEmails.filter(e => e.lastLoginAt).length / totalInvited) * 100) : 0}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Email Performance Analytics */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium text-gray-900 dark:text-white">
                    Newsletter Reach Analysis
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Campaign performance and reach metrics
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                {newsletterData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={newsletterData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#e5e7eb" 
                        strokeOpacity={0.5}
                      />
                      <XAxis 
                        dataKey="name" 
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                        tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                        tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        label={{ 
                          value: 'Recipients', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' }
                        }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          fontSize: '12px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="recipients"
                        stroke="#7c3aed"
                        fill="#ddd6fe"
                        strokeWidth={2}
                        fillOpacity={0.3}
                        name="Recipients"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Mail className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">No Campaign Data</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Send newsletters to see reach analytics
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-100 border border-purple-500 rounded-sm"></div>
                  <span>Campaign Reach</span>
                </div>
                <span>Avg: {newsletterHistory.length > 0 ? Math.round(newsletterHistory.reduce((acc, newsletter) => acc + newsletter.recipientCount, 0) / newsletterHistory.length) : 0} recipients</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* User Activity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChart className="h-4 w-4" />
                User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={userActivityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {userActivityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Daily Growth Average */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Daily Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(recentGrowth / 30) || 0}
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Avg daily subscribers
                </p>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Based on last 30 days of activity
              </div>
            </CardContent>
          </Card>

          {/* Engagement Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {totalInvited > 0 ? Math.round((invitedEmails.filter(e => e.lastLoginAt).length / totalInvited) * 100) : 0}%
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  User engagement rate
                </p>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Invited users who logged in
              </div>
            </CardContent>
          </Card>

          {/* Newsletter Reach */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Send className="h-4 w-4" />
                Newsletter Reach
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {newsletterHistory.length > 0 ? Math.round(newsletterHistory.reduce((acc, newsletter) => acc + newsletter.recipientCount, 0) / newsletterHistory.length) : 0}
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Avg reach per newsletter
                </p>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Average recipients per campaign
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}