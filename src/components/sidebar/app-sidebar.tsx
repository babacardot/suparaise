"use client"

import * as React from "react"
import {
  Bot,
  Command,
  Home,
  LifeBuoy,
  Send,
  Target,
  User,
  Building,
  Settings,
} from "lucide-react"
import { NavMain } from '@/components/sidebar/nav-main'
import { NavProjects } from '@/components/sidebar/nav-projects'
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
  } | null
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const userData = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    avatar: user?.avatar || "",
  }

  const data = {
    user: userData,
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        isActive: true,
        items: [
          {
            title: "Overview",
            url: "/dashboard",
          },
          {
            title: "Settings",
            url: "/dashboard/settings",
          },
        ],
      },
      {
        title: "Startup Profile",
        url: "/dashboard/startup",
        icon: Building,
        items: [
          {
            title: "Company Info",
            url: "/dashboard/startup",
          },
          {
            title: "Pitch Deck",
            url: "/dashboard/startup/pitch",
          },
          {
            title: "Founder Info",
            url: "/dashboard/startup/founders",
          },
        ],
      },
      {
        title: "VC Targets",
        url: "/dashboard/vcs",
        icon: Target,
        items: [
          {
            title: "Browse VCs",
            url: "/dashboard/vcs",
          },
          {
            title: "Target List",
            url: "/dashboard/vcs/targets",
          },
          {
            title: "Add VC",
            url: "/dashboard/vcs/add",
          },
        ],
      },
      {
        title: "Agent",
        url: "/dashboard/agent",
        icon: Bot,
        items: [
          {
            title: "Run Campaign",
            url: "/dashboard/agent/run",
          },
          {
            title: "Campaign History",
            url: "/dashboard/agent/history",
          },
          {
            title: "Agent Settings",
            url: "/dashboard/agent/settings",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ],
    projects: [
      {
        name: "Current Campaign",
        url: "/dashboard/campaigns/current",
        icon: Target,
      },
      {
        name: "Account Settings",
        url: "/dashboard/settings",
        icon: Settings,
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
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Suparaise</span>
                  <span className="truncate text-xs">VC Automation</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
