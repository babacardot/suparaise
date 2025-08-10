'use client'

import React from 'react'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import { useUser } from '@/lib/contexts/user-context'
import { useTheme } from 'next-themes'
import { animateThemeSweep } from '@/lib/utils/theme-transition'

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
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const playClickSound = () => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/light.mp3')
      audio.volume = 0.4
      audio.play().catch(() => {})
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const toggleTheme = () => {
    const next = (theme === 'dark' ? 'light' : 'dark') as 'light' | 'dark'
    animateThemeSweep(next, () => setTheme(next))
  }

  // Determine user data, prioritizing live context user
  // Email: prefer modified contact_email set via founder settings, else auth email, else prop
  const displayEmail =
    (user?.user_metadata?.contact_email as string | undefined) ||
    user?.email ||
    propUser.email ||
    ''

  // Name: prefer firstName/lastName from founder settings, else metadataName from OAuth, else prop/fallback
  const firstName = (user?.user_metadata?.firstName as string | undefined) || ''
  const lastName = (user?.user_metadata?.lastName as string | undefined) || ''
  const constructedName = `${firstName} ${lastName}`.trim()
  const metadataName = (user?.user_metadata?.name as string | undefined) || ''
  const displayName =
    constructedName ||
    (metadataName && metadataName.trim()) ||
    propUser.name ||
    'User'

  // Generate avatar URL using the logic that respects custom uploads and removals
  const getAvatarUrl = () => {
    // Prioritize live user from context
    if (user && user.user_metadata) {
      const { avatar_url, avatar_removed } = user.user_metadata

      // If avatar was explicitly removed, use default
      if (avatar_removed) {
        return `https://avatar.vercel.sh/${encodeURIComponent(
          displayEmail.toLowerCase(),
        )}.png?size=80`
      }

      // Use avatar_url from OAuth providers (includes LinkedIn, Twitter, Github, Google)
      if (avatar_url) {
        return avatar_url
      }

      // Default fallback
      return `https://avatar.vercel.sh/${encodeURIComponent(
        displayEmail.toLowerCase(),
      )}.png?size=80`
    }

    // Fallback to prop user if context user isn't available
    return (
      propUser.avatar ||
      `https://avatar.vercel.sh/${encodeURIComponent(
        displayEmail.toLowerCase(),
      )}.png?size=80`
    )
  }

  const avatarUrl = getAvatarUrl()

  // Generate fallback initials
  const getInitials = (n: string, e: string) => {
    if (n && n !== 'User') {
      return n
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return e.split('@')[0].slice(0, 2).toUpperCase()
  }

  const initials = getInitials(displayName, displayEmail)

  return (
    <SidebarMenu className="select-none" onCopy={(e) => e.preventDefault()}>
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
                  alt={displayName}
                  className="h-full w-full rounded-sm"
                />
                <AvatarFallback className="rounded-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs">{displayEmail}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-sm bg-sidebar border-sidebar-border"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={18}
            onCopy={(e) => e.preventDefault()}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-sm">
                  <AvatarImage
                    src={avatarUrl}
                    alt={displayName}
                    className="h-full w-full rounded-sm"
                  />
                  <AvatarFallback className="rounded-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs">{displayEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  playClickSound()
                  window.open('/', '_blank')
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
                {mounted ? (
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
                ) : (
                  <div className="h-4 w-4 rounded-sm bg-muted animate-pulse" />
                )}
                {mounted
                  ? (theme === 'dark' ? 'Light' : 'Dark') + ' mode'
                  : 'Theme'}
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
