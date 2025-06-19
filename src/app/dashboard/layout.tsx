'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
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

interface UserData {
  name: string
  email: string
  avatar?: string
  startupName?: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowserClient()

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      // Use RPC function instead of direct queries
      const supabase = createSupabaseBrowserClient()
      const { data, error } = await supabase.rpc('get_user_profile_with_startup', {
        p_user_id: userId,
      })

      if (error) {
        console.error('Error fetching user data via RPC:', error)
        return { profile: null, startup: null }
      }

      return {
        profile: data ? (data as any).profile : null,
        startup: data ? (data as any).startup : null,
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      return { profile: null, startup: null }
    }
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { profile, startup } = await fetchUserData(user.id)

          // Extract first name from full name or email
          const fullName =
            profile?.full_name ||
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] ||
            'User'
          const firstName = fullName.split(' ')[0]

          setUserData({
            name: firstName,
            email: user.email || '',
            avatar: user.user_metadata?.avatar_url,
            startupName: startup?.name,
          })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { profile, startup } = await fetchUserData(session.user.id)

        const fullName =
          profile?.full_name ||
          session.user.user_metadata?.full_name ||
          session.user.email?.split('@')[0] ||
          'User'
        const firstName = fullName.split(' ')[0]

        setUserData({
          name: firstName,
          email: session.user.email || '',
          avatar: session.user.user_metadata?.avatar_url,
          startupName: startup?.name,
        })
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, fetchUserData])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-sm h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
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
    </SidebarProvider>
  )
}
