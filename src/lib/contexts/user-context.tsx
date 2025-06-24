'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { User, SupabaseClient } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'

// Startup-related interfaces
interface StartupData {
  id: string
  name: string
  logo_url?: string | null
  onboarded?: boolean
  created_at?: string
}

// Subscription-related interfaces
interface SubscriptionData {
  is_subscribed: boolean
  subscription_status: string | null
  subscription_current_period_end: string | null
  stripe_customer_id: string | null
}

interface UserContextType {
  user: User | null
  supabase: SupabaseClient
  loading: boolean
  signingOut: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>

  // Startup management
  startups: StartupData[]
  currentStartup: StartupData | null
  currentStartupId: string | null
  startupsLoading: boolean
  startupsInitialized: boolean
  needsOnboarding: boolean

  // Subscription management
  subscription: SubscriptionData | null
  subscriptionLoading: boolean
  isSubscribed: boolean
  fetchSubscription: () => Promise<void>

  // Startup actions
  fetchStartups: () => Promise<void>
  selectStartup: (startupId: string) => Promise<void>
  setCurrentStartupFromUrl: (startupId: string) => void
  refreshStartups: () => Promise<void>
  selectStartupById: (startupId: string) => Promise<void>
  setNeedsOnboarding: (needs: boolean) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: React.ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  // Startup state
  const [startups, setStartups] = useState<StartupData[]>([])
  const [currentStartupId, setCurrentStartupId] = useState<string | null>(null)
  const [startupsLoading, setStartupsLoading] = useState(true)
  const [startupsInitialized, setStartupsInitialized] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  // Subscription state
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null,
  )
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)

  const router = useRouter()
  const pathname = usePathname()

  // Create a single supabase client instance that will be reused
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  // Derive current startup from currentStartupId
  const currentStartup = useMemo(() => {
    if (!currentStartupId) return null
    return startups.find((startup) => startup.id === currentStartupId) || null
  }, [startups, currentStartupId])

  // Derive subscription status
  const isSubscribed = useMemo(() => {
    return subscription?.is_subscribed || false
  }, [subscription])

  // Fetch user's startups
  const fetchStartups = useCallback(async () => {
    if (!user) return

    setStartupsLoading(true)
    try {
      const { data: startupsData, error } = await supabase.rpc(
        'get_user_startups_with_status',
        { p_user_id: user.id },
      )

      if (error) {
        console.error('Error fetching startups:', error)
      } else {
        const startupsArray = Array.isArray(startupsData)
          ? (startupsData as unknown as StartupData[])
          : []
        setStartups(startupsArray)

        // If no current startup is selected and we have startups, select the most recent one
        if (!currentStartupId && startupsArray.length > 0) {
          setCurrentStartupId(startupsArray[0].id)
        }
      }
    } catch (error) {
      console.error('Error in fetchStartups:', error)
    } finally {
      setStartupsLoading(false)
      setStartupsInitialized(true)
    }
  }, [user, supabase, currentStartupId])

  // Fetch subscription data
  const fetchSubscription = useCallback(async () => {
    if (!user) return

    setSubscriptionLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'is_subscribed, subscription_status, subscription_current_period_end, stripe_customer_id',
        )
        .eq('id', user.id)
        .single()

      if (error) {
        // If the columns don't exist yet, set default values
        if (
          error.message?.includes('column') &&
          error.message?.includes('does not exist')
        ) {
          setSubscription({
            is_subscribed: false,
            subscription_status: null,
            subscription_current_period_end: null,
            stripe_customer_id: null,
          })
        } else {
          console.error('Error fetching subscription:', error)
        }
      } else {
        setSubscription(data as unknown as SubscriptionData)
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error)
      // Set default values on error
      setSubscription({
        is_subscribed: false,
        subscription_status: null,
        subscription_current_period_end: null,
        stripe_customer_id: null,
      })
    } finally {
      setSubscriptionLoading(false)
    }
  }, [user, supabase])

  // Check onboarding status
  const checkOnboardingStatus = useCallback(async () => {
    if (!user) return

    try {
      const { data: onboardingStatus, error } = await supabase.rpc(
        'check_user_onboarding_status',
        { p_user_id: user.id },
      )

      if (error) {
        console.error('Error checking onboarding status:', error)
      } else {
        const statusData = onboardingStatus as {
          needsOnboarding: boolean
          hasStartup: boolean
        }
        setNeedsOnboarding(statusData?.needsOnboarding || false)
      }
    } catch (error) {
      console.error('Error in checkOnboardingStatus:', error)
    }
  }, [user, supabase])

  // Select a startup and optionally navigate
  const selectStartup = useCallback(
    async (startupId: string) => {
      setCurrentStartupId(startupId)

      // Navigate to the startup's home page if not already there
      const expectedPath = `/dashboard/${startupId}`
      if (!pathname.startsWith(expectedPath)) {
        router.push(`${expectedPath}/home`)
      }
    },
    [router, pathname],
  )

  // Set current startup from URL (used by layouts)
  const setCurrentStartupFromUrl = useCallback((startupId: string) => {
    setCurrentStartupId(startupId)
  }, [])

  // Refresh startups (useful after creating new ones)
  const refreshStartups = useCallback(async () => {
    await fetchStartups()
  }, [fetchStartups])

  // Select startup by ID and navigate (useful after creating new ones)
  const selectStartupById = useCallback(
    async (startupId: string) => {
      // First refresh startups to ensure we have the latest data
      await fetchStartups()

      // Then select the startup
      setCurrentStartupId(startupId)

      // Navigate to the startup's home page
      router.push(`/dashboard/${startupId}/home`)
    },
    [fetchStartups, router],
  )

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) {
        console.error('Error refreshing user:', error)
        setUser(null)
      } else {
        setUser(user)
      }
    } catch (error) {
      console.error('Error in refreshUser:', error)
      setUser(null)
    }
  }, [supabase])

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      // Immediately clear user state to prevent showing dashboard without data
      setUser(null)
      setStartups([])
      setCurrentStartupId(null)
      setStartupsInitialized(false)
      setNeedsOnboarding(false)
      setSigningOut(true)

      // Navigate immediately to prevent showing dashboard without data
      router.push('/')

      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }

      // Force a hard refresh to clear any cached state
      window.location.href = '/'
    } catch (error) {
      console.error('Error in signOut:', error)
      // Even if there's an error, try to redirect
      window.location.href = '/'
    }
  }, [supabase, router])

  // Initial auth setup
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting initial session:', error)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)
      const newUser = session?.user ?? null
      setUser(newUser)

      // Handle different auth events
      if (event === 'SIGNED_OUT') {
        // Reset all state immediately when signed out
        setStartups([])
        setCurrentStartupId(null)
        setStartupsInitialized(false)
        setNeedsOnboarding(false)
        setSigningOut(false)

        // Redirect to home page
        window.location.href = '/'
        return
      }

      // Reset startup state when user changes
      if (!newUser) {
        setStartups([])
        setCurrentStartupId(null)
        setStartupsInitialized(false)
        setNeedsOnboarding(false)
        setSigningOut(false)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Fetch startup data when user is available
  useEffect(() => {
    if (user && !loading) {
      fetchStartups()
      checkOnboardingStatus()
      fetchSubscription()
    }
  }, [user, loading, fetchStartups, checkOnboardingStatus, fetchSubscription])

  const value = useMemo(
    () => ({
      user,
      supabase,
      loading,
      signingOut,
      signOut,
      refreshUser,

      // Startup state
      startups,
      currentStartup,
      currentStartupId,
      startupsLoading,
      startupsInitialized,
      needsOnboarding,

      // Subscription state
      subscription,
      subscriptionLoading,
      isSubscribed,
      fetchSubscription,

      // Startup actions
      fetchStartups,
      selectStartup,
      setCurrentStartupFromUrl,
      refreshStartups,
      selectStartupById,
      setNeedsOnboarding,
    }),
    [
      user,
      supabase,
      loading,
      signingOut,
      signOut,
      refreshUser,
      startups,
      currentStartup,
      currentStartupId,
      startupsLoading,
      startupsInitialized,
      needsOnboarding,
      subscription,
      subscriptionLoading,
      isSubscribed,
      fetchSubscription,
      fetchStartups,
      selectStartup,
      setCurrentStartupFromUrl,
      refreshStartups,
      selectStartupById,
      setNeedsOnboarding,
    ],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
