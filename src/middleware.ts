import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Simple check for Admin ID in middleware (Env var must be accessible)
const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;


// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/requests/new',  // Only protect create page, allow browsing
  '/travel',  // Only protect /travel (post trip), not /travelers (browse)
  '/messages(.*)'  // Protect all messages routes
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()

  // Protect Admin Routes specifically
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { userId } = await auth();
    // If logged in but not admin, redirect to user dashboard
    if (userId && userId !== ADMIN_USER_ID) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
