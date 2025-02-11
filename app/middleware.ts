import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is signed in and the current path is / or /login or /signup, redirect to /dashboard
  if (session && ['/login', '/signup', '/'].includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Auth pages are accessible to those without session
  if (!session && ['/login', '/signup', '/'].includes(req.nextUrl.pathname)) {
    return res
  }

  // If user is not signed in and the current path is not / or /login or /signup, redirect to /login
  if (!session && !['/login', '/signup', '/'].includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}