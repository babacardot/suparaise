'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@/lib/contexts/user-context'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { TopBanner } from '@/components/ui/top-banner'
import { OnboardingDialog } from '@/components/onboarding/onboarding-dialog'
import Spinner from '@/components/ui/spinner'

interface StartupDisplay {
  id: string
  name: string
  logo_url?: string | null
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const {
    user,
    loading,
    signingOut,
    needsOnboarding,
    setNeedsOnboarding,
    startups,
    currentStartup,
    currentStartupId,
    selectStartup,
    refreshStartups,
  } = useUser()

  // Add state for new startup creation dialog
  const [isCreatingNewStartup, setIsCreatingNewStartup] = useState(false)

  // Memoize breadcrumbs to prevent unnecessary re-renders
  const breadcrumbs = React.useMemo(() => {
    const dashboardUrl = currentStartupId
      ? `/dashboard/${currentStartupId}/home`
      : '/dashboard/home'

    if (pathname?.includes('/funds')) {
      return [
        { label: 'Dashboard', href: dashboardUrl },
        { label: 'Funds', isCurrentPage: true },
      ]
    } else if (pathname?.includes('/applications')) {
      return [
        { label: 'Dashboard', href: dashboardUrl },
        { label: 'Applications', isCurrentPage: true },
      ]
    } else if (pathname?.includes('/home')) {
      return [
        { label: 'Dashboard', href: dashboardUrl },
        { label: 'Home', isCurrentPage: true },
      ]
    } else if (pathname?.includes('/settings')) {
      // Settings breadcrumbs
      if (pathname?.includes('/settings/company')) {
        return [
          { label: 'Dashboard', href: dashboardUrl },
          {
            label: 'Settings',
            href: `/dashboard/${currentStartupId}/settings`,
          },
          { label: 'Company', isCurrentPage: true },
        ]
      } else if (pathname?.includes('/settings/agent')) {
        return [
          { label: 'Dashboard', href: dashboardUrl },
          {
            label: 'Settings',
            href: `/dashboard/${currentStartupId}/settings`,
          },
          { label: 'Agents', isCurrentPage: true },
        ]
      } else {
        return [
          { label: 'Dashboard', href: dashboardUrl },
          {
            label: 'Settings',
            href: `/dashboard/${currentStartupId}/settings`,
          },
          { label: 'Founder', isCurrentPage: true },
        ]
      }
    } else {
      return [
        { label: 'Dashboard', href: dashboardUrl },
        { label: 'Overview', isCurrentPage: true },
      ]
    }
  }, [pathname, currentStartupId])

  const playClickSound = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      // Optimize audio playback to not block navigation
      try {
        const audio = new Audio('/sounds/light.mp3')
        audio.volume = 0.4
        // Use a promise that won't block navigation
        audio.play().catch(() => {
          // Silently handle audio play errors (autoplay policies, etc.)
        })
      } catch {
        // Silently handle any audio creation errors
      }
    }
  }, [])

  const handleOnboardingComplete = React.useCallback(async () => {
    setNeedsOnboarding(false)
    if (user) {
      await refreshStartups() // Re-fetch startups to get the new one

      // Add a small delay and trigger a window event to force validation refresh
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('validation-refresh'))
      }, 1000) // 1 second delay to ensure data is fully saved and available
    }
  }, [user, refreshStartups, setNeedsOnboarding])

  const handleNewStartupComplete = React.useCallback(async () => {
    setIsCreatingNewStartup(false)
    if (user) {
      await refreshStartups() // Re-fetch startups to get the new one

      // Add a small delay and trigger a window event to force validation refresh
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('validation-refresh'))
      }, 1000) // 1 second delay to ensure data is fully saved and available
    }
  }, [user, refreshStartups])

  const handleNewStartupCancel = React.useCallback(() => {
    setIsCreatingNewStartup(false)
  }, [])

  const handleStartupSwitch = React.useCallback(
    (startup: StartupDisplay) => {
      console.log('Switching to startup:', startup)
      playClickSound()
      selectStartup(startup.id)
    },
    [playClickSound, selectStartup],
  )

  const handleNewStartupCreation = React.useCallback(() => {
    console.log('Creating new startup...')
    playClickSound()
    setIsCreatingNewStartup(true)
  }, [playClickSound])

  // Handle redirect when user is null (moved to useEffect to avoid render-time side effects)
  useEffect(() => {
    if (!user && !loading && !signingOut) {
      router.push('/login')
    }
  }, [user, loading, signingOut, router])

  // Only show loading spinner if we truly don't have a user and are loading for the first time
  // Avoid showing spinner for brief loading states during navigation
  if (loading && !user && !signingOut) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  if (signingOut) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  // If no user and not in a loading state, let redirect happen
  if (!user && !loading && !signingOut) {
    // Brief delay to allow for quick authentication checks without showing spinner
    return (
      <div className="flex min-h-screen items-center justify-center opacity-0">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  // Determine if onboarding is truly needed only after startups are initialized
  const showOnboarding = needsOnboarding && startups.length === 0

  return (
    <SidebarProvider>
      <AppSidebar
        user={
          user
            ? {
              name: user.user_metadata?.full_name || user.email || '',
              email: user.email || '',
              avatar: user.user_metadata?.avatar_url,
              startupName: currentStartup?.name || undefined,
              startupLogo: currentStartup?.logo_url || undefined,
            }
            : null
        }
        startups={startups}
        onStartupSelect={handleStartupSwitch}
        onCreateNewStartup={handleNewStartupCreation}
        currentStartupId={currentStartupId || undefined}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" onClick={playClickSound} />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="-ml-2">
              <TopBanner breadcrumbs={breadcrumbs} />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>

      {/* First-time onboarding dialog */}
      {showOnboarding && user && (
        <OnboardingDialog
          isOpen={showOnboarding}
          userId={user.id}
          onComplete={handleOnboardingComplete}
          isFirstStartup={true}
        />
      )}

      {/* New startup creation dialog */}
      {isCreatingNewStartup && user && (
        <OnboardingDialog
          isOpen={isCreatingNewStartup}
          userId={user.id}
          onComplete={handleNewStartupComplete}
          isFirstStartup={false}
          onCancel={handleNewStartupCancel}
        />
      )}
    </SidebarProvider>
  )
}
