'use client'

import React from 'react'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import { useUser } from '@/lib/contexts/user-context'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
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
import { getSoundEnabled, setSoundEnabled } from '@/lib/utils/sound'

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
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [soundEnabled, setSoundEnabledState] = React.useState<boolean>(true)

  React.useEffect(() => {
    setMounted(true)
    // Initialize sound state from storage
    try {
      setSoundEnabledState(getSoundEnabled())
    } catch { }
  }, [])

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
    const next = (theme === 'dark' ? 'light' : 'dark') as 'light' | 'dark'
    const skipSweep =
      (typeof pathname === 'string' &&
        pathname.includes('/dashboard/') &&
        (pathname.includes('/funds') || pathname.includes('/accelerators'))) ||
      pathname.includes('/angels') ||
      pathname.includes('/applications')

    if (skipSweep) {
      setTheme(next)
      return
    }

    animateThemeSweep(next, () => setTheme(next))
  }

  const toggleSound = () => {
    const next = !soundEnabled
    setSoundEnabledState(next)
    setSoundEnabled(next)
    if (next && typeof window !== 'undefined') {
      try {
        const audio = new Audio('/sounds/light.mp3')
        audio.volume = 0.4
        void audio.play()
      } catch { }
    }
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
  const getAvatarUrl = React.useCallback(() => {
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
  }, [user, displayEmail, propUser.avatar])

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

  // Preload avatar image to ensure seamless loading
  React.useEffect(() => {
    if (avatarUrl && typeof window !== 'undefined') {
      // Create preload link
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = avatarUrl
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)

      // Also preload via Image object for better browser cache
      const img = new Image()
      img.src = avatarUrl

      // Cleanup
      return () => {
        try {
          document.head.removeChild(link)
        } catch {
          // Link might already be removed
        }
      }
    }
  }, [avatarUrl])

  return (
    <SidebarMenu
      className="select-none"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
    >
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
            className="select-none w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-sm bg-sidebar border-sidebar-border"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={18}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
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
              <DropdownMenuItem
                onClick={() => {
                  playClickSound()
                  toggleSound()
                }}
                onMouseEnter={() => setHoveredItem('sound')}
                onMouseLeave={() => setHoveredItem(null)}
                className="text-sidebar-foreground hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
              >
                <LottieIcon
                  animationData={soundEnabled ? animations.play : animations.pause}
                  size={16}
                  loop={false}
                  autoplay={false}
                  initialFrame={0}
                  isHovered={hoveredItem === 'sound'}
                />
                {soundEnabled ? 'Sound on' : 'Sound off'}
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
