'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/actions/utils'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'

// Optimized sound utility functions - don't block navigation
const playSound = (soundFile: string) => {
  // Use setTimeout to ensure sound doesn't block navigation
  setTimeout(() => {
    try {
      const audio = new Audio(soundFile)
      audio.volume = 0.4
      audio.play().catch(() => {
        // Silently handle audio play errors
      })
    } catch {
      // Silently handle any audio creation errors
    }
  }, 0)
}

const playClickSound = () => {
  playSound('/sounds/light.mp3')
}

interface SettingsNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: string
  }[]
  currentPath: string
}

// Individual nav item component to handle hover state properly
function NavItem({
  item,
  isActive,
  permissionLevel,
}: {
  item: { href: string; title: string; icon: string }
  isActive: boolean
  permissionLevel: 'FREE' | 'PRO' | 'MAX'
}) {
  const [isHovered, setIsHovered] = useState(false)
  const { toast } = useToast()

  // Get the animation from the animations object - memoize for performance
  const animationData = useMemo(
    () => animations[item.icon as keyof typeof animations],
    [item.icon],
  )

  // Check if this item requires MAX permission
  const requiresMaxPermission = item.title === 'Integrations'
  const hasMaxAccess = permissionLevel === 'MAX'
  const isLockedForUser = requiresMaxPermission && !hasMaxAccess

  // Optimize click handler with useCallback
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isLockedForUser) {
        e.preventDefault()
        toast({
          variant: 'destructive',
          title: 'Feature locked',
          description: `${item.title} is only available for MAX users. Please upgrade your plan.`,
        })
        return
      }
      // Play sound asynchronously to not block navigation
      playClickSound()
    },
    [isLockedForUser, item.title, toast],
  )

  // Optimize hover handlers with useCallback
  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  if (isLockedForUser) {
    return (
      <div
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          isActive
            ? 'bg-[#E9EAEF] dark:bg-[#2A2B30] text-accent-foreground'
            : 'hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30] hover:text-primary',
          'justify-start w-full text-left whitespace-nowrap rounded-sm transition-all duration-200 mb-1 h-10',
          'cursor-not-allowed opacity-70',
        )}
      >
        <div className="flex items-center gap-3 justify-between w-full">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex-shrink-0',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground group-hover:text-primary',
              )}
            >
              {animationData && (
                <LottieIcon
                  animationData={animationData}
                  size={18}
                  className="translate-y-[2px]"
                  isHovered={isHovered}
                />
              )}
            </span>
            <span className="font-medium text-sm select-none">
              {item.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {requiresMaxPermission && (
              <Badge
                variant="secondary"
                className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
              >
                MAX
              </Badge>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        isActive
          ? 'bg-[#E9EAEF] dark:bg-[#2A2B30] text-accent-foreground'
          : 'hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30] hover:text-primary',
        'justify-start w-full text-left whitespace-nowrap rounded-sm transition-all duration-200 mb-1 h-10',
      )}
    >
      <div className="flex items-center gap-3 justify-between w-full">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex-shrink-0',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground group-hover:text-primary',
            )}
          >
            {animationData && (
              <LottieIcon
                animationData={animationData}
                size={18}
                className="translate-y-[2px]"
                isHovered={isHovered}
              />
            )}
          </span>
          <span className="font-medium text-sm select-none">{item.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {item.title === 'Integrations' && (
            <Badge
              variant="secondary"
              className="text-xs bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800"
            >
              BETA
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function SettingsNav({
  className,
  items,
  currentPath,
  ...props
}: SettingsNavProps) {
  const { subscription } = useUser()
  const router = useRouter()

  // Get permission level, defaulting to FREE if not available - memoize for performance
  const permissionLevel = useMemo(
    () => subscription?.permission_level || 'FREE',
    [subscription?.permission_level],
  )

  // Prefetch all navigation links for faster navigation
  useEffect(() => {
    items.forEach((item) => {
      try {
        router.prefetch(item.href)
      } catch {
        // Silently handle prefetch errors
      }
    })
  }, [items, router])

  // Memoize the items processing for better performance
  const processedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        isActive: (() => {
          // More precise active state logic
          // Exact match for the current path
          if (currentPath === item.href) return true

          // For sub-routes, only consider them active if they start with the href
          // but exclude the base settings path from this logic
          if (item.href.endsWith('/settings')) {
            // For the base settings path, only active if exact match
            return currentPath === item.href
          } else {
            // For sub-routes like /settings/company, /settings/agent
            return (
              currentPath.startsWith(item.href + '/') ||
              currentPath === item.href
            )
          }
        })(),
      })),
    [items, currentPath],
  )

  return (
    <div className="w-full bg-background border rounded-sm">
      <nav className={cn('flex flex-col p-2', className)} {...props}>
        {processedItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={item.isActive}
            permissionLevel={permissionLevel}
          />
        ))}
      </nav>
    </div>
  )
}
