'use client'

import { useEffect, useMemo } from 'react'
import { notFound } from 'next/navigation'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/lib/contexts/user-context'
import Spinner from '@/components/ui/spinner'

interface StartupLayoutProps {
  children: React.ReactNode
}

export default function StartupLayout({ children }: StartupLayoutProps) {
  const params = useParams()
  const startupId = params.startupId as string
  const router = useRouter()

  const {
    user,
    loading,
    startups,
    startupsLoading,
    startupsInitialized,
    currentStartupId,
    setCurrentStartupFromUrl,
  } = useUser()

  // Memoize startup lookup for performance
  const startup = useMemo(() => {
    if (!startupsInitialized || startupsLoading) return null
    return startups.find((s) => s.id === startupId) || null
  }, [startups, startupId, startupsInitialized, startupsLoading])

  // Set current startup from URL when component mounts or startup ID changes
  useEffect(() => {
    if (startupId && startupId !== currentStartupId) {
      setCurrentStartupFromUrl(startupId)
    }
  }, [startupId, currentStartupId, setCurrentStartupFromUrl])

  // Only show loading while auth is loading and we don't have a user
  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  // Redirect to login if not authenticated using router instead of redirect()
  if (!user) {
    router.push('/login')
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  // Show loading while startups are being fetched OR if startups haven't been initialized yet
  if (startupsLoading || !startupsInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  // Check if startup exists and belongs to user (only after startups are loaded and initialized)
  if (!startup) {
    notFound()
  }

  return <div className="startup-scoped-dashboard">{children}</div>
}
