import * as React from 'react'
import Link from 'next/link'
import { LottieIcon } from '@/components/design/lottie-icon'
import FeedbackModal from '@/components/dashboard/feedback-modal'
import SupportModal from '@/components/dashboard/support-modal'
import SuggestionModal from '@/components/dashboard/suggestion-modal'
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
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false)
  const [isSupportOpen, setIsSupportOpen] = React.useState(false)
  const [isSuggestionOpen, setIsSuggestionOpen] = React.useState(false)

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isHovered = hoveredItem === item.title

            // Special handling for Suggest item
            if (item.title === 'Suggest') {
              return (
                <SidebarMenuItem key={item.title}>
                  <SuggestionModal
                    isOpen={isSuggestionOpen}
                    onClose={() => setIsSuggestionOpen(false)}
                  >
                    <SidebarMenuButton
                      size="sm"
                      tooltip={item.title}
                      onClick={() => {
                        onItemClick?.()
                        setIsSuggestionOpen(true)
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
                  </SuggestionModal>
                </SidebarMenuItem>
              )
            }

            // Special handling for Feedback item
            if (item.title === 'Feedback') {
              return (
                <SidebarMenuItem key={item.title}>
                  <FeedbackModal
                    isOpen={isFeedbackOpen}
                    onClose={() => setIsFeedbackOpen(false)}
                  >
                    <SidebarMenuButton
                      size="sm"
                      tooltip={item.title}
                      onClick={() => {
                        onItemClick?.()
                        setIsFeedbackOpen(true)
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
                  </FeedbackModal>
                </SidebarMenuItem>
              )
            }

            // Special handling for Support item
            if (item.title === 'Support') {
              return (
                <SidebarMenuItem key={item.title}>
                  <SupportModal
                    isOpen={isSupportOpen}
                    onClose={() => setIsSupportOpen(false)}
                  >
                    <SidebarMenuButton
                      size="sm"
                      tooltip={item.title}
                      onClick={() => {
                        onItemClick?.()
                        setIsSupportOpen(true)
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
                  </SupportModal>
                </SidebarMenuItem>
              )
            }

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
