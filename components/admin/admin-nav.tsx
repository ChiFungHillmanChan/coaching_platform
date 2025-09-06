'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Send, 
  Settings,
  LogOut,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AdminNavProps {
  userEmail: string
}

export function AdminNav({ userEmail }: AdminNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/login', { method: 'DELETE' })
      document.cookie = 'coaching-platform-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: pathname === '/admin'
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: Users,
      active: pathname === '/admin/users'
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: BarChart3,
      active: pathname === '/admin/analytics'
    },
    {
      href: '/admin/newsletters',
      label: 'Newsletters',
      icon: Send,
      active: pathname === '/admin/newsletters'
    }
  ]

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-base">Admin Panel</span>
            </Link>

            {/* Navigation Items */}
            <nav className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      item.active
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">{userEmail}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 h-8 text-xs"
            >
              <LogOut className="h-3 w-3" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}