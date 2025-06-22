'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
import { User } from '@supabase/supabase-js'

interface StartupData {
  name: string
  id: string
  logo_url?: string
  setup_completed?: boolean
}

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
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [creatingNewStartup, setCreatingNewStartup] = useState(false)
  const [startupData, setStartupData] = useState<StartupData | null>(null)
  const [allStartups, setAllStartups] = useState<StartupDisplay[]>([])

  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const router = useRouter()

  const playClickSound = () => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/light.mp3')
      audio.volume = 0.3
      audio.play().catch(() => {
        // Silently handle audio play errors (autoplay policies, etc.)
      })
    }
  }

  const fetchUserStartups = useCallback(
    async (userId: string) => {
      console.log('Fetching user startups for:', userId)

      const { data: startups, error } = await supabase.rpc(
        'get_user_startups_with_status',
        {
          p_user_id: userId,
        },
      )

      if (error) {
        console.error('Error fetching startups:', error)
        return []
      }

      console.log('Fetched startups:', startups)
      const startupsArray = startups as Array<{
        id: string
        name: string
        logo_url?: string | null
        onboarded: boolean
        created_at: string
      }>

      return startupsArray || []
    },
    [supabase],
  )

  const fetchInitialData = useCallback(
    async (userId: string) => {
      console.log('Fetching initial data for user:', userId)

      // Check onboarding status
      const { data: onboardingStatus, error: onboardingError } = await supabase.rpc(
        'check_user_onboarding_status',
        {
          p_user_id: userId,
        },
      )

      if (onboardingError) {
        console.error('Error fetching onboarding status:', onboardingError)
        return
      }

      console.log('Onboarding status:', onboardingStatus)
      const statusData = onboardingStatus as { needsOnboarding: boolean; hasStartup: boolean }
      if (statusData && statusData.needsOnboarding) {
        setNeedsOnboarding(true)
      }

      // Get user's startups if they have any
      if (statusData && statusData.hasStartup) {
        const startups = await fetchUserStartups(userId)
        setAllStartups(startups)

        if (startups && startups.length > 0) {
          // Set the most recent startup as current
          const mostRecentStartup = startups[0]
          setStartupData({
            name: mostRecentStartup.name,
            id: mostRecentStartup.id,
            logo_url: mostRecentStartup.logo_url || undefined,
          })
        }
      }
    },
    [supabase, fetchUserStartups],
  )

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchInitialData(session.user.id)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchInitialData])

  const handleOnboardingComplete = async () => {
    setNeedsOnboarding(false)
    if (user) {
      await fetchInitialData(user.id) // Re-fetch to confirm onboarding status

      // After fetching data, redirect to the startup's home page
      const startups = await fetchUserStartups(user.id)
      if (startups && startups.length > 0) {
        const mostRecentStartup = startups[0]
        router.push(`/dashboard/${mostRecentStartup.id}/home`)
      }
    }
  }

  const handleNewStartupCreation = () => {
    console.log('Creating new startup...')
    playClickSound()
    setCreatingNewStartup(true)
  }

  const handleNewStartupComplete = async () => {
    setCreatingNewStartup(false)
    if (user) {
      // Re-fetch startups to get the new one
      const startups = await fetchUserStartups(user.id)
      setAllStartups(startups)

      if (startups && startups.length > 0) {
        // Find the most recent startup (the one just created)
        const mostRecentStartup = startups[0]
        setStartupData({
          name: mostRecentStartup.name,
          id: mostRecentStartup.id,
          logo_url: mostRecentStartup.logo_url || undefined,
        })

        // Navigate to the new startup's home page
        router.push(`/dashboard/${mostRecentStartup.id}/home`)
      }
    }
  }

  const handleNewStartupCancel = () => {
    console.log('Canceling new startup creation...')
    playClickSound()
    setCreatingNewStartup(false)
  }

  const handleStartupSwitch = (startup: StartupDisplay) => {
    console.log('Switching to startup:', startup)
    playClickSound()

    setStartupData({
      name: startup.name,
      id: startup.id,
      logo_url: startup.logo_url || undefined,
    })

    // Navigate to the selected startup's home page
    router.push(`/dashboard/${startup.id}/home`)
  }

  if (loading) {
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
              startupName: startupData?.name || undefined,
              startupLogo: startupData?.logo_url || undefined,
            }
            : null
        }
        startups={allStartups}
        onStartupSelect={handleStartupSwitch}
        onCreateNewStartup={handleNewStartupCreation}
        currentStartupId={startupData?.id}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" onClick={playClickSound} />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="-ml-2">
              <TopBanner />
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
        />
      )}

      {/* New startup creation dialog */}
      {creatingNewStartup && user && (
        <OnboardingDialog
          isOpen={creatingNewStartup}
          userId={user.id}
          onComplete={handleNewStartupComplete}
          onCancel={handleNewStartupCancel}
          isFirstStartup={false}
        />
      )}
    </SidebarProvider>
  )
}
