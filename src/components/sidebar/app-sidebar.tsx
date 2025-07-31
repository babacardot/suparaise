'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import { NavMain } from '@/components/sidebar/nav-main'
import { NavSecondary } from '@/components/sidebar/nav-secondary'
import { NavUser } from '@/components/sidebar/nav-user'
import { StartupSwitcher } from '@/components/sidebar/startup-switcher'
import { Button } from '@/components/ui/button'
import { useUser } from '@/lib/contexts/user-context'
import { useValidation } from '@/lib/hooks/use-validation'
import { VALIDATION_PRESETS } from '@/components/ui/validation-gate'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string
    email: string
    avatar?: string
    startupName?: string
    startupLogo?: string
  } | null
  startups?: Array<{
    id: string
    name: string
    logo_url?: string | null
  }>
  currentStartupId?: string
  onStartupSelect?: (startup: {
    id: string
    name: string
    logo_url?: string | null
  }) => void
  onCreateNewStartup?: () => void
}

const playClickSound = () => {
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback or setTimeout to ensure audio doesn't block navigation
    const playAudio = () => {
      try {
        const audio = new Audio('/sounds/light.mp3')
        audio.volume = 0.4
        audio.play().catch(() => {
          // Silently handle audio play errors (autoplay policies, etc.)
        })
      } catch {
        // Silently handle audio creation errors
      }
    }

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(playAudio)
    } else {
      setTimeout(playAudio, 0)
    }
  }
}

export function AppSidebar({
  user,
  startups = [],
  currentStartupId,
  onStartupSelect,
  onCreateNewStartup,
  ...props
}: AppSidebarProps) {
  const router = useRouter()
  const { state, toggleSidebar } = useSidebar()
  const { subscription, user: contextUser } = useUser()
  const [isToggleHovered, setIsToggleHovered] = React.useState(false)

  // Check if user profile is complete
  const {
    isValid: isProfileComplete,
    checkValidation,
    missingFields,
  } = useValidation({
    requirements: VALIDATION_PRESETS.BASIC_APPLICATION,
    autoCheck: true,
  })

  // Debug missing fields in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && missingFields.length > 0) {
      console.log('🔍 Missing validation fields:', missingFields)
    }
  }, [missingFields])

  // Force re-check validation when startup changes (helps with cache issues)
  React.useEffect(() => {
    if (currentStartupId) {
      const timeoutId = setTimeout(() => {
        checkValidation()
      }, 500) // Small delay to ensure data is loaded

      return () => clearTimeout(timeoutId)
    }
  }, [currentStartupId, checkValidation])

  // Get permission level, defaulting to FREE if not available
  const permissionLevel = subscription?.permission_level || 'FREE'

  // Create display text: FirstName+StartupName
  // Use live user data from context for the most up-to-date firstName
  const firstName =
    contextUser?.user_metadata?.name?.split(' ')[0] ||
    contextUser?.user_metadata?.firstName ||
    user?.name?.split(' ')[0] ||
    'User'

  // Find current startup from the startups array
  const currentStartup = React.useMemo(() => {
    if (!currentStartupId) return null
    return startups.find((startup) => startup.id === currentStartupId) || null
  }, [startups, currentStartupId])

  // Create display text using actual startup name
  const displayText = currentStartup?.name
    ? `${firstName}+${currentStartup.name}`
    : firstName

  // Create display startup object for the switcher with formatted name
  const displayStartupForSwitcher = currentStartup
    ? {
        id: currentStartup.id,
        name: displayText, // Use formatted display text
        logo_url: currentStartup.logo_url,
      }
    : null

  const userData = {
    name: contextUser?.user_metadata?.name || user?.name || 'User',
    email: contextUser?.email || user?.email || 'user@example.com',
    avatar: contextUser?.user_metadata?.avatar_url || user?.avatar || '',
  }

  // Generate navigation URLs based on current startup
  const getNavUrl = (path: string) => {
    return currentStartupId ? `/dashboard/${currentStartupId}/${path}` : '#' // Prevent navigation when no startup is selected
  }

  const handleCompleteProfileClick = () => {
    playClickSound()
    // Navigate to settings page using router instead of window.location
    if (currentStartupId) {
      router.push(`/dashboard/${currentStartupId}/settings`)
    }
  }

  const data = {
    user: userData,
    navMain: [
      {
        title: 'Home',
        url: getNavUrl('home'),
        animation: animations.home,
      },
      {
        title: 'Funds',
        url: getNavUrl('funds'),
        animation: animations.cash,
      },
      {
        title: 'Accelerators',
        url: getNavUrl('accelerators'),
        animation: animations.speed,
        requiresPro: true,
      },
      // {
      //   title: 'Angels',
      //   url: getNavUrl('angels'),
      //   animation: animations.coin,
      //   requiresMax: true,
      // },
      {
        title: 'Applications',
        url: getNavUrl('applications'),
        animation: animations.view,
      },
      {
        title: 'Settings',
        url: currentStartupId ? `/dashboard/${currentStartupId}/settings` : '#', // Prevent navigation when no startup is selected
        animation: animations.settings,
      },
    ],
    navSecondary: [
      // Show Complete your onboarding if profile is incomplete
      ...(!isProfileComplete && currentStartupId
        ? [
            {
              title: 'Complete your onboarding',
              url: '#',
              animation: animations.checkmark,
              onClick: handleCompleteProfileClick,
              isSpecial: true,
            },
          ]
        : []),
      {
        title: 'Recommend',
        url: '#',
        animation: animations.bulb,
      },
      {
        title: 'Feedback',
        url: '#',
        animation: animations.chat,
      },
      {
        title: 'Support',
        url: '#',
        animation: animations.help,
      },
    ],
    permissionLevel,
  }

  return (
    <div className="relative select-none">
      <Sidebar variant="floating" collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="-my-2 mt-0">
              <StartupSwitcher
                startups={startups}
                currentStartupId={currentStartupId}
                currentStartupDisplay={displayStartupForSwitcher}
                firstName={firstName}
                onStartupSelect={onStartupSelect || (() => {})}
                onCreateNew={onCreateNewStartup || (() => {})}
                isCollapsed={state === 'collapsed'}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain
            items={data.navMain}
            onItemClick={playClickSound}
            permissionLevel={permissionLevel}
          />
          <NavSecondary
            items={data.navSecondary}
            className="mt-auto"
            onItemClick={playClickSound}
          />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>

      {/* Collapse/Expand Button - Always visible, fixed to viewport center */}
      <Button
        onClick={() => {
          playClickSound()
          toggleSidebar()
        }}
        onMouseEnter={() => setIsToggleHovered(true)}
        onMouseLeave={() => setIsToggleHovered(false)}
        variant="ghost"
        size="sm"
        className={`fixed top-1/2 -translate-y-1/2 z-30 h-4 w-3 rounded-sm bg-sidebar-border hover:bg-sidebar-accent border border-sidebar-border p-0 shadow-sm transition-all duration-200 hover:shadow-md ${
          state === 'collapsed'
            ? 'left-[calc(3rem+4px)]' // SIDEBAR_WIDTH_ICON (3rem) + 2px to center on edge
            : 'left-[calc(16rem-14px)]' // SIDEBAR_WIDTH (16rem) - 8px to position on edge
        }`}
      >
        <LottieIcon
          animationData={animations.nineGrid}
          size={8}
          className="text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors duration-200"
          isHovered={isToggleHovered}
        />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    </div>
  )
}
