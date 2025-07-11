'use client'

import { cn } from '@/lib/actions/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useUser } from '@/lib/contexts/user-context'
import { getRedirectURL } from '@/lib/utils/auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from '../ui/spinner'

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { supabase } = useUser()

  const playClickSound = () => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/light.mp3')
      audio.volume = 0.4
      audio.play().catch(() => {
        // Silently handle audio play errors (autoplay policies, etc.)
      })
    }
  }

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectURL(),
      },
    })

    if (error) {
      setError(error.message)
    } else {
      router.push(`/verify?email=${encodeURIComponent(email)}`)
    }
    setIsSubmitting(false)
  }

  return (
    <div
      className={cn('flex flex-col gap-6 select-none', className)}
      {...props}
    >
      <Card className="overflow-hidden rounded-sm w-full md:w-[450px] mx-auto">
        <CardContent className="p-0">
          <form onSubmit={handleSignup} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-start text-start">
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-balance text-muted-foreground">
                  Get started free, no credit card required
                </p>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={async () => {
                    playClickSound()
                    setIsSubmitting(true)
                    setError(null)
                    try {
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'github',
                        options: {
                          redirectTo: getRedirectURL(),
                        },
                      })
                      if (error) {
                        console.error('Github OAuth error:', error)
                        setError(error.message)
                        setIsSubmitting(false)
                      }
                      // Don't set setIsSubmitting(false) here if no error - redirect will happen
                    } catch (err) {
                      console.error('Github signup error:', err)
                      setError('Failed to sign up with Github')
                      setIsSubmitting(false)
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full h-9 px-3 rounded-sm bg-[#333] hover:bg-[#444] dark:bg-[#171515] dark:hover:bg-[#2b2a2a] text-white text-sm font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    playClickSound()
                    setIsSubmitting(true)
                    setError(null)
                    try {
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                          redirectTo: getRedirectURL(),
                          queryParams: {
                            access_type: 'offline',
                          },
                        },
                      })
                      if (error) {
                        console.error('Google OAuth error:', error)
                        setError(error.message)
                        setIsSubmitting(false)
                      }
                      // Don't set setIsSubmitting(false) here if no error - redirect will happen
                    } catch (err) {
                      console.error('Google signup error:', err)
                      setError('Failed to sign up with Google')
                      setIsSubmitting(false)
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full h-9 px-3 rounded-sm bg-white hover:bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-900 text-gray-600 dark:text-white border border-gray-300 dark:border-transparent text-sm font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    playClickSound()
                    setIsSubmitting(true)
                    setError(null)
                    try {
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'twitter',
                        options: {
                          redirectTo: getRedirectURL(),
                        },
                      })
                      if (error) {
                        console.error('X OAuth error:', error)
                        setError(error.message)
                        setIsSubmitting(false)
                      }
                      // Don't set setIsSubmitting(false) here if no error - redirect will happen
                    } catch (err) {
                      console.error('X signup error:', err)
                      setError('Failed to sign up with X')
                      setIsSubmitting(false)
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full h-9 px-3 rounded-sm bg-[#000000] hover:bg-[#333333] dark:bg-[#000000] dark:hover:bg-[#1a1a1a] text-white text-sm font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    playClickSound()
                    setIsSubmitting(true)
                    setError(null)
                    try {
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'linkedin_oidc',
                        options: {
                          redirectTo: getRedirectURL(),
                        },
                      })
                      if (error) {
                        console.error('LinkedIn OAuth error:', error)
                        setError(error.message)
                        setIsSubmitting(false)
                      }
                      // Don't set setIsSubmitting(false) here if no error - redirect will happen
                    } catch (err) {
                      console.error('LinkedIn signup error:', err)
                      setError('Failed to sign up with LinkedIn')
                      setIsSubmitting(false)
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full h-9 px-3 rounded-sm bg-[#0077B5] hover:bg-[#005885] dark:bg-[#0077B5] dark:hover:bg-[#005885] text-white text-sm font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  or continue with
                </span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jonathan@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="select-auto"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <div className="ml-auto text-sm h-4"></div>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="select-auto"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm"
                disabled={isSubmitting}
                onClick={playClickSound}
              >
                {isSubmitting ? <Spinner className="h-3 w-3" /> : 'Sign up'}
              </Button>
              <div className="text-center text-sm mt-2 -mb-4">
                Already have an account?{' '}
                <Link
                  href="/login"
                  prefetch={true}
                  className="underline underline-offset-4"
                  onClick={playClickSound}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary mx-auto -mt-4">
        By creating an account, you agree to our <a href="/terms">Terms</a> and{' '}
        <a href="/privacy">Privacy Policy</a>.
      </div>
    </div>
  )
}
