'use client'

import * as React from 'react'
import { Check, Plus } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/actions/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useSidebar } from '@/components/ui/sidebar'

// Simple interface for startup switcher display
interface StartupDisplay {
  id: string
  name: string
  logo_url?: string | null
}

interface StartupSwitcherProps {
  startups: StartupDisplay[]
  currentStartupId?: string
  currentStartupDisplay?: StartupDisplay | null // For formatted display (FirstName+StartupName)
  firstName?: string // For formatting other startup names in dropdown
  onStartupSelect: (startup: StartupDisplay) => void
  onCreateNew: () => void
  className?: string
  isCollapsed?: boolean
}

// Helper function to generate consistent avatar URLs
const generateAvatarUrl = (name: string | undefined, size: number) => {
  const normalizedName = name?.toLowerCase().trim() || 'startup'
  return `https://avatar.vercel.sh/${encodeURIComponent(normalizedName)}.png?size=${size}`
}

export function StartupSwitcher({
  startups,
  currentStartupId,
  currentStartupDisplay,
  firstName = 'User',
  onStartupSelect,
  onCreateNew,
  className,
  isCollapsed = false,
}: StartupSwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const { isMobile } = useSidebar()

  // Play a light click sound when opening the switcher (UX parity with user menu)
  const playClickSound = () => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/light.mp3')
      audio.volume = 0.4
      audio.play().catch(() => {})
    }
  }

  // Find current startup from the startups array to ensure consistency
  const currentStartup = currentStartupId
    ? startups.find((s) => s.id === currentStartupId)
    : null

  // Use currentStartupDisplay if it has a formatted name, otherwise format currentStartup
  const displayStartup =
    currentStartupDisplay ||
    (currentStartup
      ? {
          ...currentStartup,
          name: `${firstName}+${currentStartup.name}`,
        }
      : null)

  // Keep the original company name for avatar generation to maintain consistent colors
  const avatarName = currentStartup?.name || displayStartup?.name

  // Format startup names for display in dropdown
  const formatStartupDisplayName = (startup: StartupDisplay) => {
    return `${firstName}+${startup.name}`
  }

  const handleSelect = (startup: StartupDisplay) => {
    onStartupSelect(startup)
    setOpen(false)
  }

  const handleCreateNew = () => {
    onCreateNew()
    setOpen(false)
  }

  const handlePopoverChange = (newOpen: boolean) => {
    if (newOpen) playClickSound()
    setOpen(newOpen)
  }

  return (
    <Popover open={open} onOpenChange={handlePopoverChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-label="Select startup"
          className={cn(
            'h-auto min-h-[44px] p-2 justify-start gap-2 bg-transparent hover:bg-sidebar-accent/80 w-full',
            'group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:hover:bg-transparent group-data-[collapsible=icon]:border-none',
            className,
          )}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-sidebar-accent/20 text-sidebar-foreground overflow-hidden flex-shrink-0">
            {displayStartup?.logo_url ? (
              <Image
                src={displayStartup.logo_url}
                alt={displayStartup.name}
                className="w-full h-full object-contain"
                width={32}
                height={32}
                unoptimized
              />
            ) : (
              <Image
                src={generateAvatarUrl(avatarName, 32)}
                alt={displayStartup?.name || 'Startup'}
                className="w-full h-full object-contain"
                width={32}
                height={32}
              />
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">
              {displayStartup?.name || 'Onboarding'}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] min-w-56 rounded-sm p-0 bg-sidebar border-sidebar-border"
        side={isMobile ? 'bottom' : isCollapsed ? 'right' : 'bottom'}
        align={isCollapsed ? 'end' : 'start'}
        sideOffset={isCollapsed ? 18 : 0}
        alignOffset={isCollapsed ? 15 : 0}
        style={isCollapsed ? { marginTop: 15 } : undefined}
      >
        <Command
          className="bg-sidebar [&_[cmdk-item]]:aria-selected:bg-sidebar-accent [&_[cmdk-item]]:data-[selected=true]:bg-sidebar-accent"
          defaultValue=""
        >
          <CommandList>
            {startups.length > 0 && (
              <CommandGroup className="pb-0">
                {startups.map((startup) => (
                  <CommandItem
                    key={startup.id}
                    value={formatStartupDisplayName(startup)}
                    onSelect={() => handleSelect(startup)}
                    className="text-sm p-0 m-1"
                  >
                    <div className="flex items-center gap-2 min-w-0 w-full px-2 py-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-sidebar-accent/20 text-sidebar-foreground overflow-hidden flex-shrink-0">
                        {startup.logo_url ? (
                          <Image
                            src={startup.logo_url}
                            alt={startup.name}
                            className="w-full h-full object-contain"
                            width={20}
                            height={20}
                            unoptimized
                          />
                        ) : (
                          <Image
                            src={generateAvatarUrl(startup.name, 20)}
                            alt={startup.name}
                            className="w-full h-full object-contain"
                            width={20}
                            height={20}
                          />
                        )}
                      </div>
                      <span className="truncate">
                        {formatStartupDisplayName(startup)}
                      </span>
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4 text-green-700 dark:text-green-300',
                          currentStartupId === startup.id
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup className="pt-0">
              <CommandItem
                onSelect={handleCreateNew}
                className="text-sm p-0 m-1 !bg-green-50 dark:!bg-green-900/30 !text-green-700 dark:!text-green-300 aria-selected:!bg-green-100 dark:aria-selected:!bg-green-900/40 data-[selected=true]:!bg-green-100 dark:data-[selected=true]:!bg-green-900/40 hover:!bg-green-100 dark:hover:!bg-green-900/40 hover:!text-green-800 dark:hover:!text-green-200 !border !border-green-200 dark:!border-green-800 !rounded-sm"
                value="create-startup-item"
              >
                <div className="flex items-center gap-2 min-w-0 w-full px-2 py-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-green-100 dark:bg-green-800/50 border border-green-200 dark:border-green-700">
                    <Plus className="h-3 w-3 text-green-700 dark:text-green-300" />
                  </div>
                  <span className="truncate group-data-[collapsible=icon]:hidden">
                    Create
                  </span>
                </div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
