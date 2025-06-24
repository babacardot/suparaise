import { VerifyForm } from '@/components/auth/verify-form'
import { Suspense } from 'react'
import Spinner from '@/components/ui/spinner'

export default function VerifyPage() {
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
      <VerifyForm />
    </Suspense>
  )
}
