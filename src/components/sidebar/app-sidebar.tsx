'use client'

import * as React from 'react'

import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import { NavMain } from '@/components/sidebar/nav-main'
import { NavSecondary } from '@/components/sidebar/nav-secondary'
import { NavUser } from '@/components/sidebar/nav-user'
import { StartupSwitcher } from '@/components/sidebar/startup-switcher'
import { Button } from '@/components/ui/button'
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
  onStartupSelect?: (startup: { id: string; name: string; logo_url?: string | null }) => void
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
  onStartupSelect,
  onCreateNewStartup,
  ...props
}: AppSidebarProps) {
  const { state, toggleSidebar } = useSidebar()
  const [isToggleHovered, setIsToggleHovered] = React.useState(false)

  // Create display text: FirstName+StartupName
  const firstName = user?.name?.split(' ')[0] || 'User'
  const displayText = user?.startupName
    ? `${firstName}+${user.startupName}`
    : firstName

  // Create current startup object for the switcher
  const currentStartup = user?.startupName ? {
    id: 'current',
    name: displayText, // Use formatted display text
    logo_url: user.startupLogo || null
  } : null

  // Debug logging
  console.log('AppSidebar Debug:', {
    userName: user?.name,
    startupName: user?.startupName,
    startupLogo: user?.startupLogo,
    displayText,
    currentStartup
  })

  const userData = {
    name: user?.name || 'User',
    email: user?.email || 'user@example.com',
    avatar: user?.avatar || '',
  }



  const data = {
    user: userData,
    navMain: [
      {
        title: 'Home',
        url: '/dashboard/home',
        animation: animations.home,
      },
      {
        title: 'Funds',
        url: '/dashboard/funds',
        animation: animations.cash,
      },
      {
        title: 'Applications',
        url: '/dashboard/applications',
        animation: animations.view,
      },
    ],
    navSecondary: [
      {
        title: 'Support',
        url: '#',
        animation: animations.support,
      },
      {
        title: 'Feedback',
        url: '#',
        animation: animations.mail,
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
                currentStartup={currentStartup}
                onStartupSelect={onStartupSelect || (() => { })}
                onCreateNew={onCreateNewStartup || (() => { })}
                isCollapsed={state === 'collapsed'}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} onItemClick={playClickSound} />
          <NavSecondary items={data.navSecondary} className="mt-auto" onItemClick={playClickSound} />
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
        className={`fixed top-1/2 -translate-y-1/2 z-30 h-4 w-4 rounded-[2px] bg-sidebar-border hover:bg-sidebar-accent border border-sidebar-border p-0 shadow-sm transition-all duration-200 hover:shadow-md ${state === 'collapsed'
          ? 'left-[calc(3rem+8px)]' // SIDEBAR_WIDTH_ICON (3rem) + 2px to center on edge
          : 'left-[calc(16rem-8px)]' // SIDEBAR_WIDTH (16rem) - 8px to position on edge
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
