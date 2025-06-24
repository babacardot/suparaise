import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    },
  )

  const { pathname } = request.nextUrl

  // Allow callback and auth routes to process without authentication check
  if (
    pathname === '/callback' ||
    pathname === '/verify' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'
  ) {
    return response
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Auth routes - where users go to login/signup/reset password
    const authRoutes = [
      '/login',
      '/signup',
      '/verify',
      '/forgot-password',
      '/reset-password',
    ]

    // If user is logged in and tries to access auth routes, redirect to dashboard
    if (user && authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If user is not logged in and tries to access protected routes, redirect to login
    if (!user && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // For the root path, redirect authenticated users to dashboard
    if (user && pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch (error) {
    console.error('Middleware auth error:', error)
    // On auth error, redirect to login for protected routes
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
