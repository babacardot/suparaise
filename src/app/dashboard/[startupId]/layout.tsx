'use client'

import { useEffect } from 'react'
import { notFound, redirect } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useUser } from '@/lib/contexts/user-context'
import Spinner from '@/components/ui/spinner'

interface StartupLayoutProps {
  children: React.ReactNode
}

export default function StartupLayout({ children }: StartupLayoutProps) {
  const params = useParams()
  const startupId = params.startupId as string

  const {
    user,
    loading,
    startups,
    startupsLoading,
    startupsInitialized,
    currentStartupId,
    setCurrentStartupFromUrl,
  } = useUser()

  // Set current startup from URL when component mounts or startup ID changes
  useEffect(() => {
    if (startupId && startupId !== currentStartupId) {
      setCurrentStartupFromUrl(startupId)
    }
  }, [startupId, currentStartupId, setCurrentStartupFromUrl])

  // Show loading while auth is loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
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
  const startup = startups.find((s) => s.id === startupId)
  if (!startup) {
    notFound()
  }

  return <div className="startup-scoped-dashboard">{children}</div>
}
