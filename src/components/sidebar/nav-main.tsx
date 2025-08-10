'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LottieIcon } from '@/components/design/lottie-icon'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/lib/hooks/use-toast'
import { cn } from '@/lib/actions/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function NavMain({
  items,
  onItemClick,
  permissionLevel = 'FREE',
}: {
  items: {
    title: string
    url: string
    animation: object
    requiresPro?: boolean
    requiresMax?: boolean
    requiresEnterprise?: boolean
  }[]
  onItemClick?: () => void
  permissionLevel?: 'FREE' | 'PRO' | 'MAX' | 'ENTERPRISE'
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)
  const { toast } = useToast()
  const { isMobile, state } = useSidebar()

  // Plays a subtle negative feedback sound when a locked feature is clicked
  const playNopeSound = () => {
    if (typeof window === 'undefined') return
    try {
      const audio = new Audio('/sounds/nope.mp3')
      audio.volume = 0.5
      void audio.play()
    } catch {
      // ignore playback errors
    }
  }

  // Prefetch all navigation links for faster navigation
  useEffect(() => {
    items.forEach((item) => {
      try {
        router.prefetch(item.url)
      } catch {
        // Silently handle prefetch errors
      }
    })
  }, [items, router])

  return (
    <SidebarGroup className="select-none">
      <SidebarMenu>
        {items.map((item, index) => {
          const isActive = pathname === item.url
          const isHovered = hoveredItem === item.title
          const isFirstItem = index === 0

          // Check if this item requires special permissions
          const requiresProPermission = item.requiresPro || false
          const requiresMaxPermission = item.requiresMax || false
          const requiresEnterprisePermission = item.requiresEnterprise || false
          const hasProAccess =
            permissionLevel === 'PRO' ||
            permissionLevel === 'MAX' ||
            permissionLevel === 'ENTERPRISE'
          const hasMaxAccess =
            permissionLevel === 'MAX' || permissionLevel === 'ENTERPRISE'
          const hasEnterpriseAccess = permissionLevel === 'ENTERPRISE'

          const isLockedForUser =
            (requiresProPermission && !hasProAccess) ||
            (requiresMaxPermission && !hasMaxAccess) ||
            (requiresEnterprisePermission && !hasEnterpriseAccess)

          const handleClick = (e: React.MouseEvent) => {
            if (isLockedForUser) {
              e.preventDefault()
              playNopeSound()
              const upgradeMessage = requiresEnterprisePermission
                ? `${item.title} is only available for Enterprise users. Please upgrade your plan.`
                : requiresMaxPermission
                  ? `${item.title} is only available for MAX and Enterprise users. Please upgrade your plan.`
                  : `${item.title} is only available for PRO, MAX and Enterprise users. Please upgrade your plan.`
              toast({
                variant: 'info',
                title: 'Feature locked',
                description: upgradeMessage,
              })
              return
            }
            if (onItemClick) {
              // Use setTimeout to prevent click sound from blocking navigation
              setTimeout(() => {
                onItemClick()
              }, 0)
            }
          }

          if (isLockedForUser) {
            const lockedButton = (
              <div
                className={cn(
                  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-sm p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding]',
                  'cursor-not-allowed opacity-70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2',
                  'h-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!',
                  '[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
                  isActive &&
                  'bg-sidebar-accent text-sidebar-accent-foreground',
                )}
                onMouseEnter={() => setHoveredItem(item.title)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={handleClick}
              >
                <LottieIcon
                  animationData={item.animation}
                  size={16}
                  loop={false}
                  autoplay={false}
                  initialFrame={0}
                  isHovered={isHovered}
                  className="opacity-60"
                />
                <span className="flex-1 group-data-[collapsible=icon]:sr-only">
                  {item.title}
                </span>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs border group-data-[collapsible=icon]:sr-only',
                    requiresEnterprisePermission
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                      : requiresMaxPermission
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                  )}
                >
                  {requiresEnterprisePermission
                    ? 'ENT'
                    : requiresMaxPermission
                      ? 'MAX'
                      : 'PRO'}
                </Badge>
              </div>
            )

            return (
              <SidebarMenuItem
                key={item.title}
                className={cn(isFirstItem && state === 'collapsed' && 'mt-1')}
              >
                <Tooltip>
                  <TooltipTrigger asChild>{lockedButton}</TooltipTrigger>
                  <TooltipContent
                    side="right"
                    align="center"
                    hidden={state !== 'collapsed' || isMobile}
                    className="bg-background text-foreground border border-border rounded-sm shadow-md px-3 py-2 before:hidden after:hidden [&>svg]:hidden [&>*[role='presentation']]:hidden"
                    sideOffset={18}
                  >
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            )
          }

          return (
            <SidebarMenuItem
              key={item.title}
              className={cn(isFirstItem && state === 'collapsed' && 'mt-1')}
            >
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
                onMouseEnter={() => setHoveredItem(item.title)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={handleClick}
              >
                <Link href={item.url}>
                  <LottieIcon
                    animationData={item.animation}
                    size={16}
                    loop={false}
                    autoplay={false}
                    initialFrame={0}
                    isHovered={isHovered}
                  />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
