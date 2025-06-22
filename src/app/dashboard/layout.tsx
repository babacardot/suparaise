'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { OnboardingDialog } from '@/components/onboarding/onboarding-dialog'
import Spinner from '@/components/ui/spinner'
import { Profile } from '@/lib/types'
import { User } from '@supabase/supabase-js'

interface StartupData {
  name: string
  id: string
  logo_url?: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [startupData, setStartupData] = useState<StartupData | null>(null)
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const fetchInitialData = useCallback(
    async (userId: string) => {
      console.log('Fetching initial data for user:', userId)
      const { data, error } = await supabase.rpc(
        'get_user_profile_with_startup',
        {
          p_user_id: userId,
        },
      )

      if (error) {
        console.error('Error fetching initial data:', error)
        return
      }

      console.log('Initial data fetched:', data)
      if (data) {
        const profile = (data as { profile: Profile | null }).profile
        const startup = (data as { startup: StartupData | null }).startup

        if (profile && !profile.onboarded) {
          setNeedsOnboarding(true)
        }

        if (startup) {
          setStartupData(startup)
        }
      }
    },
    [supabase],
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

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false)
    if (user) {
      fetchInitialData(user.id) // Re-fetch to confirm onboarding status
    }
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
        startups={[]} // TODO: Fetch user's startups from database
        onStartupSelect={(startup) => {
          console.log('Selected startup:', startup)
          // TODO: Handle startup selection
        }}
        onCreateNewStartup={() => {
          console.log('Create new startup')
          // TODO: Handle new startup creation
        }}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>

      {needsOnboarding && user && (
        <OnboardingDialog
          isOpen={needsOnboarding}
          userId={user.id}
          onComplete={handleOnboardingComplete}
        />
      )}
    </SidebarProvider>
  )
}
