'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/contexts/user-context'
import Spinner from '@/components/ui/spinner'

export default function DashboardPage() {
  const router = useRouter()
  const {
    user,
    loading,
    startups,
    currentStartupId,
    startupsLoading,
    startupsInitialized,
  } = useUser()

  useEffect(() => {
    // If startups are loaded and we have a current startup, redirect
    if (startupsInitialized && currentStartupId) {
      router.replace(`/dashboard/${currentStartupId}/home`)
    } else if (startupsInitialized && startups.length === 0) {
      // If user has no startups, they might need to go through onboarding
      // The dashboard layout will handle the onboarding dialog
      // This page can remain as a loading screen until then
    } else if (!loading && !user) {
      // If not logged in, redirect to login
      router.replace('/login')
    }
  }, [
    router,
    user,
    loading,
    startups,
    currentStartupId,
    startupsLoading,
    startupsInitialized,
  ])

  // Show a loading spinner while we wait for the redirect
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner />
    </div>
  )
}
