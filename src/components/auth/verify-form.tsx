'use client'

import { cn } from '@/lib/actions/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useUser } from '@/lib/contexts/user-context'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Spinner from '../ui/spinner'

export function VerifyForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { supabase } = useUser()

  const handleResendVerification = async () => {
    if (!email) return

    setIsResending(true)
    setError(null)

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })

    if (error) {
      setError(error.message)
    } else {
      setResent(true)
    }

    setIsResending(false)
  }

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
              <p className="text-balance text-muted-foreground">
                {email ? (
                  <>
                    We&apos;ve sent a verification link to{' '}
                    <strong>{email}</strong>.
                  </>
                ) : (
                  "We've sent a verification link to your email address."
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to complete your account setup.
              </p>
            </div>

            {email && (
              <div className="flex flex-col gap-3 w-full">
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                {resent && (
                  <p className="text-green-600 text-sm text-center">
                    Verification email resent successfully!
                  </p>
                )}
                <Button
                  variant="outline"
                  onClick={handleResendVerification}
                  disabled={isResending || resent}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Spinner className="h-3 w-3 mr-2" />
                      Resending...
                    </>
                  ) : resent ? (
                    'Email resent'
                  ) : (
                    'Resend verification email'
                  )}
                </Button>
              </div>
            )}

            <div className="text-center text-sm">
              <Link
                href="/login"
                className="underline underline-offset-4 text-muted-foreground hover:text-foreground"
              >
                Back to login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary mx-auto">
        By using this service, you agree to our <a href="/terms">Terms</a> and{' '}
        <a href="/privacy">Privacy Policy</a>.
      </div>
    </div>
  )
}
