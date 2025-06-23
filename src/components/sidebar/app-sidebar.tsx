'use client'

import * as React from 'react'

import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import { NavMain } from '@/components/sidebar/nav-main'
import { NavSecondary } from '@/components/sidebar/nav-secondary'
import { NavUser } from '@/components/sidebar/nav-user'
import { StartupSwitcher } from '@/components/sidebar/startup-switcher'
import { Button } from '@/components/ui/button'
import SupportModal from '@/components/dashboard/support-modal'
import FeedbackModal from '@/components/dashboard/feedback-modal'
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
    const audio = new Audio('/sounds/light.mp3')
    audio.volume = 0.3
    audio.play().catch(() => {
      // Silently handle audio play errors (autoplay policies, etc.)
    })
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
  const { state, toggleSidebar } = useSidebar()
  const [isToggleHovered, setIsToggleHovered] = React.useState(false)
  const [isSupportModalOpen, setIsSupportModalOpen] = React.useState(false)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = React.useState(false)

  // Create display text: FirstName+StartupName
  const firstName = user?.name?.split(' ')[0] || 'User'

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

  // Debug logging
  console.log('AppSidebar Debug:', {
    userName: user?.name,
    currentStartupId,
    currentStartup,
    displayText,
    displayStartupForSwitcher,
  })

  const userData = {
    name: user?.name || 'User',
    email: user?.email || 'user@example.com',
    avatar: user?.avatar || '',
  }

  // Generate navigation URLs based on current startup
  const getNavUrl = (path: string) => {
    return currentStartupId
      ? `/dashboard/${currentStartupId}/${path}`
      : `/dashboard/${path}`
  }

  const handleSupportClick = () => {
    playClickSound()
    setIsSupportModalOpen(true)
  }

  const handleFeedbackClick = () => {
    playClickSound()
    setIsFeedbackModalOpen(true)
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
        title: 'Applications',
        url: getNavUrl('applications'),
        animation: animations.view,
      },
    ],
    navSecondary: [
      {
        title: 'Support',
        url: '#',
        animation: animations.support,
        onClick: handleSupportClick,
      },
      {
        title: 'Feedback',
        url: '#',
        animation: animations.mail,
        onClick: handleFeedbackClick,
      },
    ],
  }

  return (
    <div className="relative">
      <Sidebar variant="inset" collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="-my-2">
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
          <NavMain items={data.navMain} onItemClick={playClickSound} />
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

      {/* Support Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

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
        className={`fixed top-1/2 -translate-y-1/2 z-30 h-4 w-3 rounded-[2px] bg-sidebar-border hover:bg-sidebar-accent border border-sidebar-border p-0 shadow-sm transition-all duration-200 hover:shadow-md ${
          state === 'collapsed'
            ? 'left-[calc(3rem+10px)]' // SIDEBAR_WIDTH_ICON (3rem) + 2px to center on edge
            : 'left-[calc(16rem-6px)]' // SIDEBAR_WIDTH (16rem) - 8px to position on edge
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
