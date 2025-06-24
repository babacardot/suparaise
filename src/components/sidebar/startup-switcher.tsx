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
    // Prevent opening when sidebar is collapsed
    if (isCollapsed && newOpen) {
      return
    }
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
            {currentStartupDisplay?.logo_url ? (
              <Image
                src={currentStartupDisplay.logo_url}
                alt={currentStartupDisplay.name}
                className="w-full h-full object-contain"
                width={32}
                height={32}
              />
            ) : (
              <Image
                src={`https://avatar.vercel.sh/${encodeURIComponent(
                  currentStartupDisplay?.name?.toLowerCase() || 'startup',
                )}.png?size=32`}
                alt={currentStartupDisplay?.name || 'Startup'}
                className="w-full h-full object-contain"
                width={32}
                height={32}
              />
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">
              {currentStartupDisplay?.name || 'Onboarding'}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 bg-sidebar border-sidebar-border"
        align="start"
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
                      <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-sidebar-accent/20 border border-sidebar-border overflow-hidden">
                        {startup.logo_url ? (
                          <Image
                            src={startup.logo_url}
                            alt={startup.name}
                            className="w-full h-full object-cover"
                            width={20}
                            height={20}
                          />
                        ) : (
                          <Image
                            src={`https://avatar.vercel.sh/${encodeURIComponent(
                              startup.name?.toLowerCase() || 'startup',
                            )}.png?size=20`}
                            alt={startup.name}
                            className="w-full h-full object-cover"
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
