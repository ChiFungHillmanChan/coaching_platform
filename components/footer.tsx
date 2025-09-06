'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="container max-w-4xl px-6 py-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-2 text-sm text-muted-foreground">
          <p>
            © 2025{' '}
            <Link 
              href="https://hillmanchan.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Hillman Chan
            </Link>
          </p>
          <p className="text-xs">
            AI & Web Design Learning Manual
          </p>
        </div>
      </div>
    </footer>
  )
}
