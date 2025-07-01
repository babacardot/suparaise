'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import { useUser } from '@/lib/contexts/user-context'
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
  user: propUser,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { user, signOut } = useUser()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)

  const playClickSound = () => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/light.mp3')
      audio.volume = 0.4
      audio.play().catch(() => { })
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Determine user data, prioritizing live context user
  const name = user?.user_metadata?.name || propUser.name || 'User'
  const email = user?.email || propUser.email || ''

  // Generate avatar URL using the logic that respects custom uploads and removals
  const getAvatarUrl = () => {
    // Prioritize live user from context
    if (user && user.user_metadata) {
      const { avatar_url, avatar_removed } = user.user_metadata

      // If avatar was explicitly removed, use default
      if (avatar_removed) {
        return `https://avatar.vercel.sh/${encodeURIComponent(
          email.toLowerCase(),
        )}.png?size=80`
      }

      // Use avatar_url from OAuth providers (includes LinkedIn, Twitter, Github, Google)
      if (avatar_url) {
        return avatar_url
      }

      // Default fallback
      return `https://avatar.vercel.sh/${encodeURIComponent(
        email.toLowerCase(),
      )}.png?size=80`
    }

    // Fallback to prop user if context user isn't available
    return (
      propUser.avatar ||
      `https://avatar.vercel.sh/${encodeURIComponent(
        email.toLowerCase(),
      )}.png?size=80`
    )
  }

  const avatarUrl = getAvatarUrl()

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

  const initials = getInitials(name, email)

  return (
    <SidebarMenu className="select-none">
      <SidebarMenuItem>
        <DropdownMenu
          onOpenChange={(open) => {
            if (open) playClickSound()
          }}
        >
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              onClick={playClickSound}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-sm">
                <AvatarImage
                  src={avatarUrl}
                  alt={name}
                  className="h-full w-full rounded-sm"
                />
                <AvatarFallback className="rounded-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{name}</span>
                <span className="truncate text-xs">{email}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-sm"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={18}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-sm">
                  <AvatarImage
                    src={avatarUrl}
                    alt={name}
                    className="h-full w-full rounded-sm"
                  />
                  <AvatarFallback className="rounded-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{name}</span>
                  <span className="truncate text-xs">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  playClickSound()
                  router.push('/')
                }}
                onMouseEnter={() => setHoveredItem('homepage')}
                onMouseLeave={() => setHoveredItem(null)}
                className="text-sidebar-foreground hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
              >
                <LottieIcon
                  animationData={animations.luggage}
                  size={16}
                  loop={false}
                  autoplay={false}
                  initialFrame={0}
                  isHovered={hoveredItem === 'homepage'}
                />
                Homepage
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  playClickSound()
                  window.open(
                    'https://www.producthunt.com/posts/suparaise',
                    '_blank',
                  )
                }}
                onMouseEnter={() => setHoveredItem('support')}
                onMouseLeave={() => setHoveredItem(null)}
                className="text-sidebar-foreground hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
              >
                <LottieIcon
                  animationData={animations.star}
                  size={16}
                  loop={false}
                  autoplay={false}
                  initialFrame={0}
                  isHovered={hoveredItem === 'support'}
                />
                Support us
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
                    theme === 'dark' ? animations.sun : animations.point
                  }
                  size={16}
                  loop={false}
                  autoplay={false}
                  initialFrame={0}
                  isHovered={hoveredItem === 'theme'}
                />
                {theme === 'dark' ? 'Light' : 'Dark'} mode
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
