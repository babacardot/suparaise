'use client'

import { LoginForm } from '@/components/auth/login-form'
import { useUser } from '@/lib/contexts/user-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Spinner from '@/components/ui/spinner'

export default function LoginPage() {
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
          <Spinner />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-start bg-muted p-6 md:p-20 pt-20">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  )
}
