'use client'

import React from 'react'
import { AdminNav } from './admin-nav'
import { Footer } from '@/components/footer'

interface AdminLayoutProps {
  children: React.ReactNode
  userEmail: string
}

export function AdminLayout({ children, userEmail }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav userEmail={userEmail} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
