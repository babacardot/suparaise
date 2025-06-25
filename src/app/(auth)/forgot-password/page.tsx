import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { Suspense } from 'react'
import Spinner from '@/components/ui/spinner'
import { TopBanner } from '@/components/design/top-banner'

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-20 pt-20">
          <div className="text-center">
            <Spinner className="h-5 w-5" />
          </div>
        </div>
      }
    >
      <TopBanner />
      <ForgotPasswordForm />
    </Suspense>
  )
}
