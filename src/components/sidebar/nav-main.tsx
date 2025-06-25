'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LottieIcon } from '@/components/design/lottie-icon'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/lib/hooks/use-toast'
import { cn } from '@/lib/actions/utils'

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url
          const isHovered = hoveredItem === item.title

          // Check if this item requires PRO permission
          const requiresProPermission = item.requiresPro || false
          const hasProAccess = permissionLevel === 'PRO' || permissionLevel === 'MAX'
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
            return (
              <SidebarMenuItem key={item.title}>
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-md p-2 text-left text-sm transition-colors",
                    "cursor-not-allowed opacity-70 hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground"
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
                  />
                  <span className="flex-1">{item.title}</span>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  >
                    PRO
                  </Badge>
                </div>
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
