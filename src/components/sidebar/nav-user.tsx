'use client'

import React from 'react'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const { theme, setTheme } = useTheme()
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)

  const playClickSound = () => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/light.mp3')
      audio.volume = 0.3
      audio.play().catch(() => {
      })
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Generate avatar URL using the provided logic
  const avatarUrl =
    user.avatar ||
    `https://avatar.vercel.sh/${encodeURIComponent(user.email?.toLowerCase() || '')}?rounded=60`

  // Generate fallback initials
  const getInitials = (name: string, email: string) => {
    if (name && name !== 'User') {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  const initials = getInitials(user.name, user.email)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu onOpenChange={(open) => { if (open) playClickSound() }}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              onClick={playClickSound}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-sm">
                <AvatarImage
                  src={avatarUrl}
                  alt={user.name}
                  className="h-full w-full rounded-sm"
                />
                <AvatarFallback className="rounded-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-sm"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-sm">
                  <AvatarImage
                    src={avatarUrl}
                    alt={user.name}
                    className="h-full w-full rounded-sm"
                  />
                  <AvatarFallback className="rounded-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={playClickSound}
                onMouseEnter={() => setHoveredItem('profile')}
                onMouseLeave={() => setHoveredItem(null)}
                className="text-sidebar-foreground hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
              >
                <LottieIcon
                  animationData={animations.profile}
                  size={16}
                  loop={false}
                  autoplay={false}
                  initialFrame={0}
                  isHovered={hoveredItem === 'profile'}
                />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={playClickSound}
                onMouseEnter={() => setHoveredItem('settings')}
                onMouseLeave={() => setHoveredItem(null)}
                className="text-sidebar-foreground hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
              >
                <LottieIcon
                  animationData={animations.settings}
                  size={16}
                  loop={false}
                  autoplay={false}
                  initialFrame={0}
                  isHovered={hoveredItem === 'settings'}
                />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  playClickSound()
                  toggleTheme()
                }}
                onMouseEnter={() => setHoveredItem('theme')}
                onMouseLeave={() => setHoveredItem(null)}
                className="text-sidebar-foreground hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
              >
                <LottieIcon
                  animationData={
                    theme === 'dark' ? animations.sun : animations.rain
                  }
                  size={16}
                  loop={false}
                  autoplay={false}
                  initialFrame={0}
                  isHovered={hoveredItem === 'theme'}
                />
                {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                playClickSound()
                handleSignOut()
              }}
              onMouseEnter={() => setHoveredItem('logout')}
              onMouseLeave={() => setHoveredItem(null)}
              className="text-sidebar-foreground hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
            >
              <LottieIcon
                animationData={animations.logout}
                size={16}
                loop={false}
                autoplay={false}
                initialFrame={0}
                isHovered={hoveredItem === 'logout'}
              />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
