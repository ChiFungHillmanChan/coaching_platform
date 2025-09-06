import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './routing';
import { getUserFromSession } from '@/lib/auth-utils';

// Load session cookie name from config or fallback
let sessionCookieName = 'coaching-platform-session';
try {
  const { serverAppConfig } = require('./src/lib/config-server');
  sessionCookieName = serverAppConfig.app.sessionCookieName;
} catch (error) {
  // Use fallback value
}

const SESSION_COOKIE_NAME = sessionCookieName;

// Create the internationalization middleware
const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // Skip middleware for API auth endpoints, static files, login page, and admin routes
  if (request.nextUrl.pathname.startsWith('/api/auth/login') ||
      request.nextUrl.pathname.includes('/login') ||
      request.nextUrl.pathname.startsWith('/admin') ||
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/_vercel') ||
      request.nextUrl.pathname.includes('.')) {
    
    // Handle admin route authentication separately
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      const user = getUserFromSession(sessionCookie);
      
      if (!user || !user.isAdmin) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
    
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = getUserFromSession(sessionCookie);

  // Check if this is an API admin route
  const isAdminAPIRoute = request.nextUrl.pathname.startsWith('/api/admin');

  // Handle admin API route protection
  if (isAdminAPIRoute) {
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
  }

  // Handle general authentication for protected routes (skip login page)
  const isProtectedRoute = !request.nextUrl.pathname.startsWith('/api') && 
                          !request.nextUrl.pathname.includes('/login');
  
  if (isProtectedRoute && !user) {
    // Redirect to login page
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Apply internationalization middleware
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/((?!api|_next|_vercel|.*\\..*).*)']
};