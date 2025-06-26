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
    isSpecial?: boolean
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
                    className={
                      item.isSpecial
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800'
                        : ''
                    }
                  >
                    <LottieIcon
                      animationData={item.animation}
                      size={14}
                      loop={false}
                      autoplay={false}
                      initialFrame={0}
                      isHovered={isHovered}
                      customColor={
                        item.isSpecial ? [0.133, 0.773, 0.369] : undefined
                      } // Green-500 color in RGB decimals
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
                    className={
                      item.isSpecial
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800'
                        : ''
                    }
                  >
                    <Link href={item.url}>
                      <LottieIcon
                        animationData={item.animation}
                        size={14}
                        loop={false}
                        autoplay={false}
                        initialFrame={0}
                        isHovered={isHovered}
                        customColor={
                          item.isSpecial ? [0.133, 0.773, 0.369] : undefined
                        } // Green-500 color in RGB decimals
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
