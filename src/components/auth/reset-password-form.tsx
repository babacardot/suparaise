'use client'

import { cn } from '@/lib/actions/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useUser } from '@/lib/contexts/user-context'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from '../ui/spinner'

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)

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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
          setError('Invalid or expired reset link')
          setIsCheckingToken(false)
          return
        }

        if (session) {
          setIsValidToken(true)
        } else {
          setError('Invalid or expired reset link')
        }
      } catch (err) {
        console.error('Token validation error:', err)
        setError('Invalid or expired reset link')
      } finally {
        setIsCheckingToken(false)
      }
    }

    checkSession()
  }, [supabase])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }

    setIsSubmitting(false)
  }

  if (isCheckingToken) {
    return (
      <div
        className={cn(
          'flex flex-col gap-6 min-h-[calc(100vh-200px)] justify-center',
          className,
        )}
        {...props}
      >
        <Card className="overflow-hidden rounded-sm w-full md:w-[450px] mx-auto">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col items-center text-center gap-4">
              <Spinner className="h-3 w-3 mr-2" />
            </div>
          </CardContent>
        </Card>
        <div className="text-balance text-center text-xs text-foreground/80 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary mx-auto">
          By using this service, you agree to our <a href="/terms">Terms</a> and{' '}
          <a href="/privacy">Privacy Policy</a>.
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div
        className={cn(
          'flex flex-col gap-6 min-h-[calc(100vh-200px)] justify-center',
          className,
        )}
        {...props}
      >
        <Card className="overflow-hidden rounded-sm w-full md:w-[450px] mx-auto">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col items-start text-start gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">Invalid reset link</h1>
                <p className="text-balance text-foreground/80">
                  The password reset link is invalid or has expired.
                </p>
              </div>

              <Link
                href="/forgot-password"
                className="underline underline-offset-4 text-foreground/80 hover:text-foreground text-sm"
                onClick={playClickSound}
              >
                Request a new reset link
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-6 min-h-[calc(100vh-200px)] justify-center select-none',
        className,
      )}
      {...props}
    >
      <Card className="overflow-hidden rounded-sm w-full md:w-[450px] mx-auto">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-start text-start">
                <h1 className="text-2xl font-bold">Set new password</h1>
                <p className="text-balance text-foreground/80">
                  Enter your new password below.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  minLength={6}
                  className="select-auto"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  minLength={6}
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
                {isSubmitting ? (
                  <Spinner className="h-3 w-3" />
                ) : (
                  'Update password'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-foreground/80 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary mx-auto">
        By using this service, you agree to our <a href="/terms">Terms</a> and{' '}
        <a href="/privacy">Privacy Policy</a>.
      </div>
    </div>
  )
}
