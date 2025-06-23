'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
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

  // Determine breadcrumbs based on current pathname
  const getBreadcrumbs = () => {
    if (pathname?.includes('/funds')) {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Funds', isCurrentPage: true },
      ]
    } else if (pathname?.includes('/applications')) {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Applications', isCurrentPage: true },
      ]
    } else if (pathname?.includes('/home')) {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Home', isCurrentPage: true },
      ]
    } else if (pathname?.includes('/settings')) {
      // Settings breadcrumbs
      if (pathname?.includes('/settings/company')) {
        return [
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: `/dashboard/${currentStartupId}/settings` },
          { label: 'Company', isCurrentPage: true },
        ]
      } else if (pathname?.includes('/settings/agent')) {
        return [
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: `/dashboard/${currentStartupId}/settings` },
          { label: 'Agents', isCurrentPage: true },
        ]
      } else {
        return [
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: `/dashboard/${currentStartupId}/settings` },
          { label: 'Profile', isCurrentPage: true },
        ]
      }
    } else {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Overview', isCurrentPage: true },
      ]
    }
  }

  const playClickSound = () => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/light.mp3')
      audio.volume = 0.3
      audio.play().catch(() => {
        // Silently handle audio play errors (autoplay policies, etc.)
      })
    }
  }

  const handleOnboardingComplete = async () => {
    setNeedsOnboarding(false)
    if (user) {
      await refreshStartups() // Re-fetch startups to get the new one
    }
  }

  const handleNewStartupComplete = async () => {
    setIsCreatingNewStartup(false)
    if (user) {
      await refreshStartups() // Re-fetch startups to get the new one
    }
  }

  const handleNewStartupCancel = () => {
    setIsCreatingNewStartup(false)
  }

  const handleStartupSwitch = (startup: StartupDisplay) => {
    console.log('Switching to startup:', startup)
    playClickSound()
    selectStartup(startup.id)
  }

  const handleNewStartupCreation = () => {
    console.log('Creating new startup...')
    playClickSound()
    setIsCreatingNewStartup(true)
  }

  if (loading || signingOut) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  // If user is null and not loading, redirect immediately
  if (!user && !loading && !signingOut) {
    window.location.href = '/'
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

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
              <TopBanner breadcrumbs={getBreadcrumbs()} />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>

      {/* First-time onboarding dialog */}
      {needsOnboarding && user && (
        <OnboardingDialog
          isOpen={needsOnboarding}
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
