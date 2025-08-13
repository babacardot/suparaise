'use client'

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import { DateRangePicker } from '@/components/design/date-range-picker'
import { DateRange } from 'react-day-picker'

export interface ApplicationsFilters {
  search: string
  statusFilter: string[]
  typeFilter: string[]
  dateRange: DateRange | undefined
}

interface ColumnVisibility {
  status: boolean
  type: boolean
  date: boolean
  notes: boolean
}

interface ApplicationsFiltersProps {
  filters: ApplicationsFilters
  onFiltersChange: (filters: ApplicationsFilters) => void
  onClearFilters: () => void
  columnVisibility: ColumnVisibility
  onColumnVisibilityChange: (
    column: keyof ColumnVisibility,
    visible: boolean,
  ) => void
}

// Memoized static data
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
] as const

const TYPE_OPTIONS = [
  { value: 'Fund', label: 'Funds' },
  // { value: 'Angel', label: 'Angels' }, // TODO: Not yet activated
  { value: 'Accelerator', label: 'Accelerators' },
] as const

const DEBOUNCE_DELAY = 1500

export default function ApplicationsFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  columnVisibility,
  onColumnVisibilityChange,
}: ApplicationsFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)
  const isMounted = useRef(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const playClickSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/light.mp3')
      audio.volume = 0.4
      void audio.play().catch(() => {})
    } catch {}
  }, [])

  // Sync local state when parent filters change (e.g., on "Clear all")
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Debounce filter changes before sending them to the parent
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (JSON.stringify(localFilters) !== JSON.stringify(filters)) {
        onFiltersChange(localFilters)
      }
    }, DEBOUNCE_DELAY)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [localFilters, filters, onFiltersChange])

  // Memoize expensive calculations
  const hasActiveFilters = useMemo(() => {
    return (
      localFilters.search?.trim().length > 0 ||
      localFilters.statusFilter.length > 0 ||
      localFilters.typeFilter.length > 0 ||
      localFilters.dateRange?.from != null ||
      localFilters.dateRange?.to != null
    )
  }, [localFilters])

  // Memoized filter update function
  const updateFilter = useCallback(
    (filterKey: keyof ApplicationsFilters, value: string, checked: boolean) => {
      if (filterKey === 'search' || filterKey === 'dateRange') return

      setLocalFilters((prevFilters) => {
        const currentValues = prevFilters[filterKey] as string[]
        const newValues = checked
          ? [...currentValues, value]
          : currentValues.filter((v: string) => v !== value)

        return {
          ...prevFilters,
          [filterKey]: newValues,
        }
      })
    },
    [],
  )

  // Memoized clear filter function with immediate update option
  const clearFilter = useCallback(
    (filterKey: keyof ApplicationsFilters, immediate = false) => {
      let newFilters: ApplicationsFilters

      if (filterKey === 'search') {
        newFilters = { ...localFilters, search: '' }
      } else if (filterKey === 'dateRange') {
        newFilters = { ...localFilters, dateRange: undefined }
      } else {
        newFilters = { ...localFilters, [filterKey]: [] }
      }

      setLocalFilters(newFilters)

      if (immediate) {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current)
        }
        onFiltersChange(newFilters)
      }
    },
    [localFilters, onFiltersChange],
  )

  const handleDateRangeChange = useCallback(
    (date: DateRange | undefined) => {
      const newFilters = { ...localFilters, dateRange: date }
      setLocalFilters(newFilters)
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      onFiltersChange(newFilters)
    },
    [localFilters, onFiltersChange],
  )

  const handleDateRangeClear = useCallback(() => {
    const newFilters = { ...localFilters, dateRange: undefined }
    setLocalFilters(newFilters)
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    onFiltersChange(newFilters)
  }, [localFilters, onFiltersChange])

  // Memoized search input handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalFilters((prevFilters) => ({
        ...prevFilters,
        search: e.target.value,
      }))
    },
    [],
  )

  const handleSearchClear = useCallback(() => {
    clearFilter('search', true)
  }, [clearFilter])

  // Color mapping functions memoized
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/40'
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40'
      case 'completed':
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40'
      case 'failed':
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40'
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/40'
    }
  }, [])

  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'Fund':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40'
      case 'Angel':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40'
      case 'Accelerator':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/40'
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/40'
    }
  }, [])

  const getOptionColors = useCallback(
    (filterKey: keyof ApplicationsFilters, value: string) => {
      if (filterKey === 'statusFilter') {
        return getStatusColor(value)
      }
      if (filterKey === 'typeFilter') {
        return getTypeColor(value)
      }
      return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/40'
    },
    [getStatusColor, getTypeColor],
  )

  const scrollPositions = React.useRef<Record<string, number>>({})

  const FilterSection = React.memo(function FilterSection({
    filterKey,
    options,
  }: {
    filterKey: keyof ApplicationsFilters
    options: Array<{ value: string; label: string }>
  }) {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null)

    React.useLayoutEffect(() => {
      if (scrollContainerRef.current && scrollPositions.current[filterKey]) {
        scrollContainerRef.current.scrollTop =
          scrollPositions.current[filterKey]
      }
    })

    const handleScroll = () => {
      if (scrollContainerRef.current) {
        scrollPositions.current[filterKey] =
          scrollContainerRef.current.scrollTop
      }
    }

    const handleOptionClick = useCallback(
      (optionValue: string, isSelected: boolean, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (scrollContainerRef.current) {
          scrollPositions.current[filterKey] =
            scrollContainerRef.current.scrollTop
        }

        updateFilter(filterKey, optionValue, !isSelected)
      },
      [filterKey],
    )

    return (
      <div className="p-2">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="space-y-1 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {options.map((option) => {
            const isSelected = Array.isArray(localFilters[filterKey])
              ? (localFilters[filterKey] as string[]).includes(option.value)
              : false
            const colors = getOptionColors(filterKey, option.value)

            return (
              <div
                key={option.value}
                onClick={(e) => handleOptionClick(option.value, isSelected, e)}
                className={`
                                  flex items-center px-3 py-2 rounded-sm cursor-pointer transition-colors text-left
                                  ${isSelected ? colors : 'bg-zinc-50 dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/40'}
                              `}
              >
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  })

  return (
    <div
      className="w-full px-4 pt-2 pb-4"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
      onCopy={(e: React.ClipboardEvent) => e.preventDefault()}
      onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-full sm:w-48">
          <LottieIcon
            animationData={animations.search}
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/80 pointer-events-none z-10"
          />
          <Input
            type="text"
            placeholder="Search applications..."
            value={localFilters.search || ''}
            onChange={handleSearchChange}
            className="pl-10 h-10 rounded-sm bg-card border-border text-card-foreground placeholder:text-foreground/80"
          />
          {localFilters.search && (
            <button
              onClick={handleSearchClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-sm hover:bg-muted flex items-center justify-center transition-colors"
              title="Clear search"
            >
              <LottieIcon
                animationData={animations.cross}
                size={12}
                className="opacity-50 hover:opacity-100"
              />
            </button>
          )}
        </div>

        {/* Status Filter */}
        {columnVisibility.status && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-40 justify-between h-10 rounded-sm bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
              >
                <div className="flex items-center space-x-2 truncate">
                  {localFilters.statusFilter.length > 0 ? (
                    localFilters.statusFilter.slice(0, 2).map((status) => {
                      const statusColor =
                        getStatusColor(status).split(' hover:')[0]
                      return (
                        <Badge
                          key={status}
                          className={`mr-1 ${statusColor} rounded-sm transition-none hover:bg-opacity-100 hover:opacity-100`}
                          style={{ pointerEvents: 'none' }}
                        >
                          {status === 'in_progress'
                            ? 'In Progress'
                            : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      )
                    })
                  ) : (
                    <span className="text-foreground/80 text-sm">Status</span>
                  )}
                  {localFilters.statusFilter.length > 2 && (
                    <Badge className="ml-1 bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 rounded-sm">
                      +{localFilters.statusFilter.length - 2}
                    </Badge>
                  )}
                </div>
                {localFilters.statusFilter.length > 0 ? (
                  <div
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      clearFilter('statusFilter', true)
                    }}
                    className="translate-x-1.5 w-6 h-6 shrink-0 rounded-sm p-1 transition-colors"
                  >
                    <LottieIcon
                      animationData={animations.cross}
                      size={16}
                      className="opacity-50 hover:opacity-100"
                    />
                  </div>
                ) : (
                  <LottieIcon
                    animationData={animations.arrowDown}
                    size={16}
                    className="ml-2 shrink-0 opacity-50 hover:opacity-100"
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-40 p-0 bg-card text-card-foreground rounded-sm"
              align="start"
            >
              <FilterSection
                filterKey="statusFilter"
                options={[...STATUS_OPTIONS]}
              />
            </PopoverContent>
          </Popover>
        )}

        {/* Type Filter */}
        {columnVisibility.type && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-40 justify-between h-10 rounded-sm bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
              >
                <div className="flex items-center space-x-2 truncate">
                  {localFilters.typeFilter.length > 0 ? (
                    localFilters.typeFilter.slice(0, 2).map((type) => {
                      const typeColor = getTypeColor(type).split(' hover:')[0]
                      return (
                        <Badge
                          key={type}
                          className={`mr-1 ${typeColor} rounded-sm transition-none hover:bg-opacity-100 hover:opacity-100`}
                          style={{ pointerEvents: 'none' }}
                        >
                          {type}
                        </Badge>
                      )
                    })
                  ) : (
                    <span className="text-foreground/80 text-sm">Type</span>
                  )}
                  {localFilters.typeFilter.length > 2 && (
                    <Badge className="ml-1 bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 rounded-sm">
                      +{localFilters.typeFilter.length - 2}
                    </Badge>
                  )}
                </div>
                {localFilters.typeFilter.length > 0 ? (
                  <div
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      clearFilter('typeFilter', true)
                    }}
                    className="translate-x-1.5 w-6 h-6 shrink-0 rounded-sm p-1 transition-colors"
                  >
                    <LottieIcon
                      animationData={animations.cross}
                      size={16}
                      className="opacity-50 hover:opacity-100"
                    />
                  </div>
                ) : (
                  <LottieIcon
                    animationData={animations.arrowDown}
                    size={16}
                    className="ml-2 shrink-0 opacity-50 hover:opacity-100"
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-40 p-0 bg-card text-card-foreground rounded-sm"
              align="start"
            >
              <FilterSection
                filterKey="typeFilter"
                options={[...TYPE_OPTIONS]}
              />
            </PopoverContent>
          </Popover>
        )}

        {/* Date Range Filter */}
        {columnVisibility.date && (
          <div className="w-full sm:w-auto min-w-40">
            <DateRangePicker
              date={localFilters.dateRange}
              setDate={handleDateRangeChange}
              onClear={handleDateRangeClear}
              className="w-full"
            />
          </div>
        )}

        {/* Column visibility toggle */}
        <div className="w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto h-10 px-3 rounded-sm bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
              >
                <LottieIcon
                  animationData={animations.view2}
                  size={16}
                  className="opacity-50 hover:opacity-100"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-48 p-2 bg-card text-card-foreground rounded-sm"
              align="end"
            >
              <div className="space-y-2">
                {['status', 'type', 'date'].map((key) => (
                  <div
                    key={key}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      playClickSound()
                      onColumnVisibilityChange(
                        key as keyof ColumnVisibility,
                        !columnVisibility[key as keyof ColumnVisibility],
                      )
                    }}
                    className={`
                      flex items-center px-3 py-2 rounded-sm cursor-pointer transition-colors text-left
                      ${
                        columnVisibility[key as keyof ColumnVisibility]
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'bg-zinc-50 dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/40'
                      }
                    `}
                  >
                    <span className="text-sm font-medium capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {hasActiveFilters && (
          <div className="w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="w-full sm:w-auto h-10 px-3 rounded-sm bg-card border-border text-foreground/80 hover:text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
            >
              <LottieIcon
                animationData={animations.trash}
                size={16}
                className="mr-0 opacity-50 hover:opacity-100"
              />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
