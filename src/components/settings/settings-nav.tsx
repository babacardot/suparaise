'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const playNopeSound = () => {
  playSound('/sounds/nope.mp3')
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
  permissionLevel: 'FREE' | 'PRO' | 'MAX' | 'ENTERPRISE'
}) {
  const [isHovered, setIsHovered] = useState(false)
  const { toast } = useToast()

  // Get the animation from the animations object - memoize for performance
  const animationData = useMemo(
    () => animations[item.icon as keyof typeof animations],
    [item.icon],
  )

  // Check if this item requires ENTERPRISE permission
  const requiresEnterprisePermission = item.title === 'Integrations'
  const hasEnterpriseAccess = permissionLevel === 'ENTERPRISE'
  const isLockedForUser = requiresEnterprisePermission && !hasEnterpriseAccess

  // Optimize click handler with useCallback
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isLockedForUser) {
        e.preventDefault()
        playNopeSound()
        toast({
          variant: 'locked',
          title: 'Feature locked',
          description: `${item.title} is only available for Enterprise users. Please upgrade your plan.`,
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
          'justify-start w-full text-left whitespace-nowrap rounded-sm transition-all duration-200 mb-1 h-8',
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
                  : 'text-foreground/80 group-hover:text-primary',
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
            {requiresEnterprisePermission && (
              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-1.5 py-0.5 rounded select-none">
                ENT
              </span>
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
        'justify-start w-full text-left whitespace-nowrap rounded-sm transition-all duration-200 mb-1 h-8',
      )}
    >
      <div className="flex items-center gap-3 justify-between w-full">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex-shrink-0',
              isActive
                ? 'text-primary'
                : 'text-foreground/80 group-hover:text-primary',
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
            <span className="text-xs bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 px-1.5 py-0.5 rounded">
              BETA
            </span>
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
  const [val, setVal] = useState(currentPath)

  // Get permission level, defaulting to FREE if not available - memoize for performance
  const permissionLevel = useMemo<'FREE' | 'PRO' | 'MAX' | 'ENTERPRISE'>(
    () => subscription?.permission_level ?? 'FREE',
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

  // Update val when currentPath changes
  useEffect(() => {
    setVal(currentPath)
  }, [currentPath])

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

  const handleSelect = useCallback(
    (href: string) => {
      playClickSound()
      setVal(href)
      router.push(href)
    },
    [router],
  )

  // Get current item title for mobile select
  const currentItem = processedItems.find((item) => item.isActive)
  const currentTitle = currentItem?.title || 'Settings'

  return (
    <>
      {/* Mobile Navigation - Always show on mobile */}
      <div className="block md:hidden mb-2">
        <Select value={val} onValueChange={handleSelect}>
          <SelectTrigger className="h-16 w-full rounded-sm border-2 text-left px-4">
            <SelectValue placeholder="Settings">
              <span className="flex items-center gap-x-3 w-full">
                <span className="flex items-center justify-center flex-shrink-0 h-5 w-5 overflow-visible">
                  {(() => {
                    const currentItem = processedItems.find(
                      (item) => item.isActive,
                    )
                    const animationData = currentItem
                      ? animations[currentItem.icon as keyof typeof animations]
                      : null
                    return animationData ? (
                      <LottieIcon
                        animationData={animationData}
                        size={18}
                        className="translate-y-[1px]"
                      />
                    ) : null
                  })()}
                </span>
                <span className="text-base font-medium">{currentTitle}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="w-full max-h-[60vh] overflow-y-auto">
            <style>{`
              .mobile-select-item .absolute.left-2 {
                display: none !important;
              }
              .mobile-select-item [data-radix-select-item-indicator] {
                display: none !important;
              }
            `}</style>
            {items.map((item) => {
              const animationData =
                animations[item.icon as keyof typeof animations]
              const requiresEnterprisePermission = item.title === 'Integrations'
              const hasEnterpriseAccess =
                (permissionLevel as 'FREE' | 'PRO' | 'MAX' | 'ENTERPRISE') ===
                'ENTERPRISE'
              const isLockedForUser =
                requiresEnterprisePermission && !hasEnterpriseAccess

              return (
                <SelectItem
                  key={item.href}
                  value={item.href}
                  disabled={isLockedForUser}
                  className="mobile-select-item py-4 pl-4 pr-4 cursor-pointer focus:bg-[#E9EAEF] dark:focus:bg-[#2A2B30] data-[highlighted]:bg-[#E9EAEF] dark:data-[highlighted]:bg-[#2A2B30] relative h-16"
                >
                  <span className="flex items-center gap-x-4 w-full">
                    <span className="scale-125 flex items-center justify-center flex-shrink-0 h-6 w-6 overflow-visible">
                      {animationData && (
                        <LottieIcon
                          animationData={animationData}
                          size={18}
                          className="translate-y-[2px]"
                        />
                      )}
                    </span>
                    <span className="text-base font-medium leading-none translate-y-[2px] flex-1">
                      {item.title}
                    </span>
                    {requiresEnterprisePermission && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-1.5 py-0.5 rounded select-none">
                        ENT
                      </span>
                    )}
                    {item.title === 'Integrations' && hasEnterpriseAccess && (
                      <span className="text-xs bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 px-1.5 py-0.5 rounded">
                        BETA
                      </span>
                    )}
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Navigation - Only show on desktop */}
      <div className="hidden w-full bg-background border rounded-sm md:block">
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
    </>
  )
}
