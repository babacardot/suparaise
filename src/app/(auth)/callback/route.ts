import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error && data.user) {
        // Check if this is a password recovery session
        if (type === 'recovery') {
          const redirectUrl = new URL('/reset-password', origin)
          const response = NextResponse.redirect(redirectUrl)
          response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
          return response
        }
        
        // Successful authentication - redirect to dashboard
        const redirectUrl = new URL('/dashboard', origin)
        const response = NextResponse.redirect(redirectUrl)
        
        // Ensure cookies are properly set
        response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
        
        return response
      }
      
      console.error('Authentication error:', error)
    } catch (err) {
      console.error('Session exchange error:', err)
    }
  }

  // Return to login with error
  const errorUrl = new URL('/login', origin)
  errorUrl.searchParams.set('error', 'Could not authenticate user')
  return NextResponse.redirect(errorUrl)
}
