'use client'

import { cn } from '@/lib/actions/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useUser } from '@/lib/contexts/user-context'
import { useState } from 'react'
import Spinner from '../ui/spinner'
import { getRedirectURL } from '@/lib/utils/auth'

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getRedirectURL().replace('/callback', '')}/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setIsSubmitted(true)
    }

    setIsSubmitting(false)
  }

  if (isSubmitted) {
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
            <div className="flex flex-col items-center text-center gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">Check your email</h1>
                <p className="text-balance text-foreground/80">
                  We&apos;ve sent a password reset link to{' '}
                  <strong>{email}</strong>.
                </p>
                <p className="text-sm text-foreground/80">
                  Click the link in the email to reset your password.
                </p>
              </div>

              <div className="text-center text-sm">
                <Link
                  href="/login"
                  className="underline underline-offset-4 text-foreground/80 hover:text-foreground"
                  onClick={playClickSound}
                >
                  Back to login
                </Link>
              </div>
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
          <form
            onSubmit={handleSubmit}
            className="px-6 md:px-8 pt-5 md:pt-4 pb-4 md:pb-8"
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-start text-start">
                <h1 className="text-2xl font-bold">Reset your password</h1>
                <p className="text-balance text-foreground/80">
                  We&apos;ll send you a link to reset your password.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="david@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {isSubmitting ? (
                  <Spinner className="h-3 w-3" />
                ) : (
                  'Send reset link'
                )}
              </Button>

              <div className="text-center text-sm">
                Remember your password?{' '}
                <Link
                  href="/login"
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
    </div>
  )
}
