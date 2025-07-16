'use client'

import { SignupForm } from '@/components/auth/signup-form'
import { useUser } from '@/lib/contexts/user-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Spinner from '@/components/ui/spinner'
import { TopBanner } from '@/components/design/ph-banner'

export default function SignupPage() {
  const router = useRouter()
  const { user, loading } = useUser()

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-20 pt-20">
        <div className="text-center">
          <Spinner className="h-5 w-5" />
        </div>
      </div>
    )
  }

  return (
    <>
      <TopBanner />
      <div className="flex min-h-svh flex-col items-center justify-start bg-muted p-6 md:p-20 pt-20">
        <div className="w-full max-w-sm md:max-w-3xl">
          <SignupForm />
        </div>
      </div>
    </>
  )
}
