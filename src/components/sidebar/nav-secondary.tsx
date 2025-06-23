import * as React from 'react'
import Link from 'next/link'
import { LottieIcon } from '@/components/design/lottie-icon'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavSecondary({
  items,
  onItemClick,
  ...props
}: {
  items: {
    title: string
    url: string
    animation: object
    onClick?: () => void
  }[]
  onItemClick?: () => void
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isHovered = hoveredItem === item.title

            return (
              <SidebarMenuItem key={item.title}>
                {item.onClick ? (
                  <SidebarMenuButton
                    size="sm"
                    tooltip={item.title}
                    onClick={() => {
                      onItemClick?.()
                      item.onClick?.()
                    }}
                    onMouseEnter={() => setHoveredItem(item.title)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <LottieIcon
                      animationData={item.animation}
                      size={14}
                      loop={false}
                      autoplay={false}
                      initialFrame={0}
                      isHovered={isHovered}
                    />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    asChild
                    size="sm"
                    tooltip={item.title}
                    onClick={onItemClick}
                    onMouseEnter={() => setHoveredItem(item.title)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link href={item.url}>
                      <LottieIcon
                        animationData={item.animation}
                        size={14}
                        loop={false}
                        autoplay={false}
                        initialFrame={0}
                        isHovered={isHovered}
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
