'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LottieIcon } from '@/components/design/lottie-icon'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavMain({
  items,
  onItemClick,
}: {
  items: {
    title: string
    url: string
    animation: object
  }[]
  onItemClick?: () => void
}) {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url
          const isHovered = hoveredItem === item.title

          const handleClick = () => {
            if (onItemClick) {
              onItemClick()
            }
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
