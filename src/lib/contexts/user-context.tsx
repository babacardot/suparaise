'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'

// Get the actual return type of our supabase client function
type SupabaseClientType = ReturnType<typeof createSupabaseBrowserClient>

// Startup-related interfaces
interface StartupData {
  id: string
  name: string
  logo_url?: string | null
  onboarded?: boolean
  created_at?: string
}

// Add new interface for startup metadata cache
interface StartupMetadata {
  id: string
  name: string
}

// Subscription-related interfaces
interface SubscriptionData {
  is_subscribed: boolean
  subscription_status: string | null
  subscription_current_period_end: string | null
  stripe_customer_id: string | null
  permission_level: 'FREE' | 'PRO' | 'MAX' | 'ENTERPRISE'
  monthly_submissions_used: number
  monthly_submissions_limit: number
}

interface UserContextType {
  user: User | null
  supabase: SupabaseClientType
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

  // New: Startup metadata cache
  getStartupMetadata: (startupId: string) => Promise<StartupMetadata | null>
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

  // Add metadata cache state
  const [metadataCache, setMetadataCache] = useState<
    Map<string, StartupMetadata>
  >(new Map())

  // Add scroll position preservation
  const scrollPositions = useRef<Map<string, number>>(new Map())

  const router = useRouter()
  const pathname = usePathname()

  // Save scroll position for current page (optimized with ref to prevent deps)
  const saveScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const scrollElements = document.querySelectorAll('[data-scroll-preserve]')
      scrollElements.forEach((element) => {
        const scrollKey = element.getAttribute('data-scroll-preserve')
        if (scrollKey) {
          scrollPositions.current.set(scrollKey, element.scrollTop)
        }
      })

      // Also save main window scroll
      scrollPositions.current.set(
        `window-${window.location.pathname}`,
        window.scrollY,
      )
    }
  }, [])

  // Restore scroll position for current page (optimized with ref to prevent deps)
  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Use multiple requestAnimationFrame calls to ensure DOM is fully ready
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const scrollElements = document.querySelectorAll(
            '[data-scroll-preserve]',
          )
          scrollElements.forEach((element) => {
            const scrollKey = element.getAttribute('data-scroll-preserve')
            if (scrollKey) {
              const savedPosition = scrollPositions.current.get(scrollKey)
              if (savedPosition !== undefined) {
                element.scrollTop = savedPosition
              }
            }
          })

          // Restore main window scroll
          const savedWindowPosition = scrollPositions.current.get(
            `window-${window.location.pathname}`,
          )
          if (savedWindowPosition !== undefined) {
            window.scrollTo(0, savedWindowPosition)
          }
        })
      })
    }
  }, [])

  // Save scroll position on navigation and page visibility changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveScrollPosition()
      } else if (document.visibilityState === 'visible') {
        // Small delay to ensure everything is rendered
        setTimeout(restoreScrollPosition, 150)
      }
    }

    // Save scroll position before page unload/navigation
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Restore scroll position on mount
    restoreScrollPosition()

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [saveScrollPosition, restoreScrollPosition])

  // Create a single supabase client instance that will be reused
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  // Use ref to track current user for auth callbacks without triggering re-renders
  const userRef = useRef(user)
  userRef.current = user

  // Derive current startup from currentStartupId
  const currentStartup = useMemo(() => {
    if (!currentStartupId) return null
    return startups.find((startup) => startup.id === currentStartupId) || null
  }, [startups, currentStartupId])

  // Derive subscription status
  const isSubscribed = useMemo(() => {
    if (!subscription) return false
    return subscription.subscription_status === 'active'
  }, [subscription])

  // Fetch user's startups
  const fetchStartups = useCallback(async () => {
    if (!user) return

    setStartupsLoading(true)
    try {
      const { data: startupsData, error } = await supabase.rpc(
        'get_user_startups',
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
          'is_subscribed, subscription_status, subscription_current_period_end, stripe_customer_id, permission_level, monthly_submissions_used, monthly_submissions_limit',
        )
        .eq('id', user.id)
        .single()

      if (error) {
        // If profile doesn't exist or columns don't exist yet, set default values
        if (
          error.code === 'PGRST116' || // No rows returned
          (error.message?.includes('column') &&
            error.message?.includes('does not exist'))
        ) {
          setSubscription({
            is_subscribed: false,
            subscription_status: null,
            subscription_current_period_end: null,
            stripe_customer_id: null,
            permission_level: 'FREE',
            monthly_submissions_used: 0,
            monthly_submissions_limit: 0,
          })
        } else {
          console.error('Error fetching subscription:', error)
          // Still set default values even on error
          setSubscription({
            is_subscribed: false,
            subscription_status: null,
            subscription_current_period_end: null,
            stripe_customer_id: null,
            permission_level: 'FREE',
            monthly_submissions_used: 0,
            monthly_submissions_limit: 0,
          })
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
        permission_level: 'FREE',
        monthly_submissions_used: 0,
        monthly_submissions_limit: 0,
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

  // Get startup metadata with caching
  const getStartupMetadata = useCallback(
    async (startupId: string): Promise<StartupMetadata | null> => {
      // Check cache first
      if (metadataCache.has(startupId)) {
        return metadataCache.get(startupId)!
      }

      try {
        const { data, error } = await supabase.rpc('get_startup_metadata', {
          p_startup_id: startupId,
        })

        if (error) {
          console.error('Error fetching startup metadata:', error)
          return null
        }

        const metadata = data as unknown as StartupMetadata

        // Update cache
        setMetadataCache((prev) => new Map(prev).set(startupId, metadata))

        return metadata
      } catch (error) {
        console.error('Error in getStartupMetadata:', error)
        return null
      }
    },
    [supabase, metadataCache, setMetadataCache],
  )

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

      // Use router for navigation instead of window.location
      // window.location.href = '/'
    } catch (error) {
      console.error('Error in signOut:', error)
      // Even if there's an error, try to redirect with router
      router.push('/')
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

    // Prevent unnecessary checks on window focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userRef.current) {
        // User is already authenticated, don't trigger re-auth
        return
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Listen for auth changes - optimize to prevent unnecessary loading states
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)
      const newUser = session?.user ?? null

      // Determine if this is just a token refresh (common on window focus)
      const isTokenRefresh = event === 'TOKEN_REFRESHED'
      const isSignedIn = event === 'SIGNED_IN'

      // If it's just a token refresh and we already have the same user, don't reset loading states
      if (
        isTokenRefresh &&
        userRef.current &&
        newUser &&
        userRef.current.id === newUser.id
      ) {
        setUser(newUser) // Update with fresh token
        return // Don't reset any loading states
      }

      setUser(newUser)

      // Handle different auth events
      if (event === 'SIGNED_OUT') {
        // Reset all state immediately when signed out
        setStartups([])
        setCurrentStartupId(null)
        setStartupsInitialized(false)
        setNeedsOnboarding(false)
        setSigningOut(false)

        // Use router for redirect instead of window.location
        router.push('/')
        return
      }

      // For sign in events, always update user data to get fresh metadata
      // but don't reset loading states if it's the same user
      if (
        isSignedIn &&
        userRef.current &&
        newUser &&
        userRef.current.id === newUser.id
      ) {
        setUser(newUser) // Update with fresh user data including metadata
        return // Don't reset loading states for same user
      }

      // Reset startup state when user changes (but not for token refresh)
      if (!newUser && !isTokenRefresh) {
        setStartups([])
        setCurrentStartupId(null)
        setStartupsInitialized(false)
        setNeedsOnboarding(false)
        setSigningOut(false)
      }

      // Only set loading to false for actual auth changes, not token refreshes
      if (!isTokenRefresh) {
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [supabase, router])

  // Fetch startup data when user is available (only once, not on every navigation)
  useEffect(() => {
    if (user && !loading && !startupsInitialized) {
      fetchStartups()
      checkOnboardingStatus()
      fetchSubscription()
    }
  }, [
    user,
    loading,
    startupsInitialized,
    fetchStartups,
    checkOnboardingStatus,
    fetchSubscription,
  ])

  // Optimize memoized value to prevent unnecessary re-renders
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

      // New: Startup metadata cache
      getStartupMetadata,
    }),
    [
      user,
      loading,
      signingOut,
      supabase,
      startups,
      currentStartup,
      currentStartupId,
      startupsLoading,
      startupsInitialized,
      needsOnboarding,
      subscription,
      subscriptionLoading,
      isSubscribed,
      signOut,
      refreshUser,
      fetchSubscription,
      fetchStartups,
      selectStartup,
      setCurrentStartupFromUrl,
      refreshStartups,
      selectStartupById,
      setNeedsOnboarding,
      getStartupMetadata,
    ],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
