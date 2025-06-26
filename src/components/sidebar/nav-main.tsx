'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
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
  }[]
  onItemClick?: () => void
  permissionLevel?: 'FREE' | 'PRO' | 'MAX'
}) {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)
  const { toast } = useToast()
  const { isMobile, state } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url
          const isHovered = hoveredItem === item.title

          // Check if this item requires PRO permission
          const requiresProPermission = item.requiresPro || false
          const hasProAccess =
            permissionLevel === 'PRO' || permissionLevel === 'MAX'
          const isLockedForFreeUser = requiresProPermission && !hasProAccess

          const handleClick = (e: React.MouseEvent) => {
            if (isLockedForFreeUser) {
              e.preventDefault()
              toast({
                variant: 'destructive',
                title: 'Feature locked',
                description: `${item.title} is only available for PRO and MAX users. Please upgrade your plan.`,
              })
              return
            }
            if (onItemClick) {
              onItemClick()
            }
          }

          if (isLockedForFreeUser) {
            const lockedButton = (
              <div
                className={cn(
                  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-sm p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding]',
                  'cursor-not-allowed opacity-70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2',
                  'h-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!',
                  '[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
                  isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
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
                <span className="flex-1 group-data-[collapsible=icon]:sr-only">{item.title}</span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 group-data-[collapsible=icon]:sr-only"
                >
                  PRO+
                </Badge>
              </div>
            )

            return (
              <SidebarMenuItem key={item.title}>
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
            <SidebarMenuItem key={item.title}>
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
