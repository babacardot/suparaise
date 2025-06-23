'use client'

import { useState } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/actions/utils'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'

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
}: {
    item: { href: string; title: string; icon: string }
    isActive: boolean
}) {
    const [isHovered, setIsHovered] = useState(false)

    // Get the animation from the animations object
    const animationData = animations[item.icon as keyof typeof animations]

    return (
        <Link
            href={item.href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                buttonVariants({ variant: 'ghost' }),
                isActive
                    ? 'bg-[#E9EAEF] dark:bg-[#2A2B30] text-accent-foreground'
                    : 'hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30] hover:text-primary',
                'justify-start w-full text-left whitespace-nowrap rounded-sm transition-all duration-200 mb-1 h-10'
            )}
        >
            <div className="flex items-center gap-3">
                <span
                    className={cn(
                        'flex-shrink-0',
                        isActive
                            ? 'text-primary'
                            : 'text-muted-foreground group-hover:text-primary'
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
                <span className="font-medium text-sm">{item.title}</span>
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
    return (
        <div className="w-full bg-background border rounded-sm">
            <nav className={cn('flex flex-col p-2', className)} {...props}>
                {items.map((item) => {
                    // More precise active state logic
                    const isActive = (() => {
                        // Exact match for the current path
                        if (currentPath === item.href) return true

                        // For sub-routes, only consider them active if they start with the href 
                        // but exclude the base settings path from this logic
                        if (item.href.endsWith('/settings')) {
                            // For the base settings path, only active if exact match
                            return currentPath === item.href
                        } else {
                            // For sub-routes like /settings/company, /settings/agent
                            return currentPath.startsWith(item.href + '/') || currentPath === item.href
                        }
                    })()

                    return <NavItem key={item.href} item={item} isActive={isActive} />
                })}
            </nav>
        </div>
    )
} 