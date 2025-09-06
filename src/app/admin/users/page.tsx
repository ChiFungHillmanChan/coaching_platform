'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  AlertCircle, 
  Mail,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  UserCheck,
  UserX
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AdminLayout } from '../../../../components/admin/admin-layout'

export default function AdminUsersPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null)
  const [userEmail, setUserEmail] = React.useState('')
  const [invitedEmails, setInvitedEmails] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailFilter, setEmailFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  React.useEffect(() => {
    checkAdminAccess()
  }, [])

  const fetchAllData = React.useCallback(async () => {
    await fetchInvitedEmails()
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

  const fetchInvitedEmails = async () => {
    try {
      const response = await fetch('/api/admin/invite-email')
      const data = await response.json()
      setInvitedEmails(data.emails || [])
    } catch (error) {
      console.error('Error fetching invited emails:', error)
    }
  }

  const inviteEmail = async () => {
    if (!newEmail.trim()) {
      setMessage('❌ Please enter an email address')
      setTimeout(() => setMessage(''), 5000)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/invite-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim() })
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(`✅ Successfully invited ${newEmail}`)
        setNewEmail('')
        fetchInvitedEmails()
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Error inviting user')
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const revokeEmail = async (email: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/invite-email', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(`✅ Successfully removed ${email}`)
        fetchInvitedEmails()
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Error removing user')
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  // Filter and paginate emails
  const filteredEmails = useMemo(() => {
    if (!emailFilter.trim()) return invitedEmails
    return invitedEmails.filter(email => 
      email.email.toLowerCase().includes(emailFilter.toLowerCase())
    )
  }, [invitedEmails, emailFilter])

  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage)
  const paginatedEmails = filteredEmails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Calculate metrics
  const totalInvited = invitedEmails.length
  const activeUsers = invitedEmails.filter(email => email.lastLoginAt).length
  const pendingUsers = totalInvited - activeUsers

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

  return (
    <AdminLayout userEmail={userEmail}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage access and permissions</p>
          </div>

          {/* Message Alert */}
          {message && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-6">
              <p className="text-blue-800 dark:text-blue-200">{message}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invited</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInvited}</div>
                <p className="text-xs text-muted-foreground">
                  Email addresses with access
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Users who have logged in
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Invited but not logged in
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Management Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Invite User</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter email address"
                  type="email"
                />
                <Button 
                  onClick={inviteEmail} 
                  disabled={isLoading || !newEmail.trim()}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isLoading ? 'Inviting...' : 'Invite User'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Search & Filter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    placeholder="Search by email"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {filteredEmails.length} of {totalInvited} users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active:</span>
                  <span className="font-medium">{activeUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pending:</span>
                  <span className="font-medium">{pendingUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-medium">{totalInvited}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Filter Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {emailFilter ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Filtered by: "{emailFilter}"
                    </p>
                    <p className="text-sm">
                      Showing {filteredEmails.length} results
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEmailFilter('')}
                      className="w-full"
                    >
                      Clear Filter
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No filters applied
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* User List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                All Users ({totalInvited})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paginatedEmails.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {emailFilter ? 'No users match your search.' : 'Get started by inviting a user.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {paginatedEmails.map(email => (
                      <div key={email.email} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <Mail className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {email.email}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Invited: {new Date(email.invitedAt).toLocaleDateString()}
                              {email.lastLoginAt && (
                                <span className="ml-2">
                                  • Last login: {new Date(email.lastLoginAt).toLocaleDateString()}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            email.lastLoginAt
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}>
                            {email.lastLoginAt ? 'Active' : 'Pending'}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeEmail(email.email)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredEmails.length)} of {filteredEmails.length}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
