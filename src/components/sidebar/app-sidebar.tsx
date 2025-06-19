'use client'

import * as React from 'react'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import { NavMain } from '@/components/sidebar/nav-main'
import { NavSecondary } from '@/components/sidebar/nav-secondary'
import { NavUser } from '@/components/sidebar/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string
    email: string
    avatar?: string
    startupName?: string
  } | null
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const userData = {
    name: user?.name || 'User',
    email: user?.email || 'user@example.com',
    avatar: user?.avatar || '',
  }

  // Create display text: FirstName + StartupName or fallback
  const displayText = user?.startupName
    ? `${user.name} • ${user.startupName}`
    : user?.name || 'Welcome'

  const data = {
    user: userData,
    navMain: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        animation: animations.home,
        isActive: true,
        items: [
          {
            title: 'Overview',
            url: '/dashboard',
          },
          {
            title: 'Settings',
            url: '/dashboard/settings',
          },
        ],
      },
      {
        title: 'Startup',
        url: '/dashboard/startup',
        animation: animations.work,
        items: [
          {
            title: 'Company',
            url: '/dashboard/startup',
          },
          {
            title: 'Team',
            url: '/dashboard/startup/team',
          },
        ],
      },
      {
        title: 'Targets',
        url: '/dashboard/targets',
        animation: animations.tag,
        items: [
          {
            title: 'Funds',
            url: '/dashboard/vcs',
          },
          {
            title: 'Browse',
            url: '/dashboard/targets/browse',
          },
        ],
      },
      {
        title: 'Agent',
        url: '/dashboard/agent',
        animation: animations.science,
        items: [
          {
            title: 'Run',
            url: '/dashboard/agent/run',
          },
          {
            title: 'History',
            url: '/dashboard/agent/history',
          },
        ],
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
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
                  <LottieIcon
                    animationData={animations.takeoff}
                    size={16}
                    loop={false}
                    autoplay={false}
                    initialFrame={0}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayText}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
