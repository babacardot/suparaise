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

export interface AngelsFilters {
  search: string
  submissionTypes: string[]
  stageFocus: string[]
  industryFocus: string[]
  regionFocus: string[]
  checkSizes: string[]
  investmentApproaches: string[]
  submissionFilter: 'all' | 'hide_submitted' | 'only_submitted'
}

interface ColumnVisibility {
  region: boolean
  focus: boolean
  industry: boolean
  check_size: boolean
  investment_approach: boolean
  type: boolean
}

interface AngelsFiltersProps {
  filters: AngelsFilters
  onFiltersChange: (filters: AngelsFilters) => void
  onClearFilters: () => void
  columnVisibility: ColumnVisibility
  onColumnVisibilityChange: (
    column: keyof ColumnVisibility,
    visible: boolean,
  ) => void
  totalSubmissions?: number
}

const SUBMISSION_TYPES = [
  { value: 'form', label: 'Form', animation: animations.fileplus },
  { value: 'email', label: 'Email', animation: animations.mail },
  { value: 'other', label: 'Other', animation: animations.help },
] as const

const INVESTMENT_STAGES = [
  'All',
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Growth',
] as const

const INDUSTRIES = [
  'B2B SaaS',
  'AI/ML',
  'Deep tech',
  'Developer tools',
  'Cybersecurity',
  'Fintech',
  'Healthtech',
  'Consumer',
  'E-commerce',
  'Marketplace',
  'Gaming',
  'Climate tech',
  'PropTech',
  'InsurTech',
  'AdTech',
  'Logistics',
  'Web3',
] as const

const REGIONS = [
  'Global',
  'North America',
  'Europe',
  'Western Europe',
  'Eastern Europe',
  'Continental Europe',
  'Asia',
  'East Asia',
  'South Asia',
  'South East Asia',
  'LATAM',
  'South America',
  'Middle East',
  'Africa',
  'Oceania',
  'EMEA',
  'Emerging Markets',
] as const

const CHECK_SIZES = [
  '1K — 10K',
  '10K — 25K',
  '25K — 50K',
  '50K — 100K',
  '100K — 250K',
  '250K — 500K',
  '500K — 1M',
  '1M +',
] as const

const INVESTMENT_APPROACHES = [
  'hands-on',
  'passive',
  'advisory',
  'network-focused',
] as const

const DEBOUNCE_DELAY = 1500

export default function AngelsFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  columnVisibility,
  onColumnVisibilityChange,
  totalSubmissions = 0,
}: AngelsFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)
  const isMounted = useRef(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (JSON.stringify(localFilters) !== JSON.stringify(filters)) {
        onFiltersChange(localFilters)
      }
      debounceTimeoutRef.current = null
    }, DEBOUNCE_DELAY)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
        debounceTimeoutRef.current = null
      }
    }
  }, [localFilters, filters, onFiltersChange])

  const hasActiveFilters = useMemo(() => {
    const searchCount = localFilters.search?.trim() ? 1 : 0
    const arrayFiltersCount = Object.entries(localFilters).reduce(
      (count, [key, value]) => {
        if (key === 'search' || key === 'submissionFilter') return count
        return count + (Array.isArray(value) ? value.length : 0)
      },
      0,
    )
    return searchCount + arrayFiltersCount > 0
  }, [localFilters])

  const updateFilter = useCallback(
    (filterKey: keyof AngelsFilters, value: string, checked: boolean) => {
      if (filterKey === 'search' || filterKey === 'submissionFilter') return

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

  const clearFilter = useCallback(
    (filterKey: keyof AngelsFilters, immediate = false) => {
      let newFilters: AngelsFilters

      if (filterKey === 'search') {
        newFilters = { ...localFilters, [filterKey]: '' }
      } else if (filterKey === 'submissionFilter') {
        newFilters = { ...localFilters, [filterKey]: 'all' }
      } else {
        newFilters = { ...localFilters, [filterKey]: [] }
      }

      setLocalFilters(newFilters)

      if (immediate) {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current)
          debounceTimeoutRef.current = null
        }
        onFiltersChange(newFilters)
      }
    },
    [localFilters, onFiltersChange],
  )

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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current)
          debounceTimeoutRef.current = null
        }
        if (JSON.stringify(localFilters) !== JSON.stringify(filters)) {
          onFiltersChange(localFilters)
        }
      }
    },
    [localFilters, filters, onFiltersChange],
  )

  const getStageColor = useCallback((stage: string) => {
    switch (stage) {
      case 'All':
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/40'
      case 'Pre-seed':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40'
      case 'Seed':
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40'
      case 'Series A':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/40'
      case 'Series B':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
      case 'Series C':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40'
      case 'Growth':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40'
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/40'
    }
  }, [])

  const getIndustryColor = useCallback((industry: string) => {
    if (
      [
        'Deep tech',
        'Healthtech',
        'Climate tech',
        'PropTech',
        'Logistics',
      ].includes(industry)
    ) {
      return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40'
    }
    return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40'
  }, [])

  const getRegionColor = useCallback((region: string) => {
    if (['Global', 'Emerging Markets'].includes(region))
      return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/40 border border-sky-200 dark:border-sky-800'
    if (region === 'North America')
      return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800'
    if (
      [
        'Europe',
        'Western Europe',
        'Eastern Europe',
        'Continental Europe',
      ].includes(region)
    )
      return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40'
    if (['Asia', 'East Asia', 'South Asia', 'South East Asia'].includes(region))
      return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40'
    if (['LATAM', 'South America'].includes(region))
      return 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40'
    if (['Africa', 'Middle East', 'EMEA'].includes(region))
      return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40'
    if (region === 'Oceania')
      return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/40'
    return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/40'
  }, [])

  const getOptionColors = useCallback(
    (filterKey: keyof AngelsFilters, value: string) => {
      if (filterKey === 'submissionTypes') {
        if (value === 'form')
          return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40'
        if (value === 'email')
          return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40'
        if (value === 'other')
          return 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40'
      }
      if (filterKey === 'regionFocus') return getRegionColor(value)
      if (filterKey === 'stageFocus') return getStageColor(value)
      if (filterKey === 'industryFocus') return getIndustryColor(value)
      if (filterKey === 'checkSizes')
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
      if (filterKey === 'investmentApproaches')
        return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/40'
      return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/40'
    },
    [getRegionColor, getStageColor, getIndustryColor],
  )

  const scrollPositions = React.useRef<Record<string, number>>({})

  const FilterSection = React.memo(function FilterSection({
    filterKey,
    options,
    hasIcon = false,
  }: {
    filterKey: keyof AngelsFilters
    options: Array<{ value: string; label: string; animation?: object }>
    hasIcon?: boolean
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
                {hasIcon && option.animation && (
                  <LottieIcon
                    animationData={option.animation}
                    size={14}
                    className="mr-2"
                  />
                )}
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
      className="w-[calc(100%+2rem)] -ml-4 sm:ml-0 sm:w-full px-4 pt-2 pb-4"
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
        {/* Search Input */}
        <div className="w-full sm:w-48">
          <div className="relative">
            <LottieIcon
              animationData={animations.search}
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
            />
            <Input
              type="text"
              placeholder="Search angels..."
              value={localFilters.search || ''}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="pl-10 h-10 rounded-sm bg-card border-border text-card-foreground placeholder:text-muted-foreground"
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
        </div>

        {/* Region Filter */}
        {columnVisibility.region && (
          <div className="w-full sm:w-40">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 rounded-sm bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {localFilters.regionFocus.length > 0 ? (
                      localFilters.regionFocus.slice(0, 2).map((region) => {
                        const regionColor =
                          getRegionColor(region).split(' hover:')[0]
                        return (
                          <Badge
                            key={region}
                            className={`mr-1 ${regionColor} rounded-sm transition-none hover:bg-opacity-100 hover:opacity-100`}
                            style={{ pointerEvents: 'none' }}
                          >
                            {region}
                          </Badge>
                        )
                      })
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Region
                      </span>
                    )}
                    {localFilters.regionFocus.length > 2 && (
                      <Badge className="ml-1 bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 rounded-sm">
                        +{localFilters.regionFocus.length - 2}
                      </Badge>
                    )}
                  </div>
                  {localFilters.regionFocus.length > 0 ? (
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearFilter('regionFocus', true)
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
                  filterKey="regionFocus"
                  options={REGIONS.map((region) => ({
                    value: region,
                    label: region,
                  }))}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Focus Filter */}
        {columnVisibility.focus && (
          <div className="w-full sm:w-40">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 rounded-sm bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {localFilters.stageFocus.length > 0 ? (
                      localFilters.stageFocus.slice(0, 2).map((stage) => {
                        const stageColor =
                          getStageColor(stage).split(' hover:')[0]
                        return (
                          <Badge
                            key={stage}
                            className={`mr-1 ${stageColor} rounded-sm transition-none hover:bg-opacity-100 hover:opacity-100`}
                            style={{ pointerEvents: 'none' }}
                          >
                            {stage}
                          </Badge>
                        )
                      })
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Focus
                      </span>
                    )}
                    {localFilters.stageFocus.length > 2 && (
                      <Badge className="ml-1 bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 rounded-sm">
                        +{localFilters.stageFocus.length - 2}
                      </Badge>
                    )}
                  </div>
                  {localFilters.stageFocus.length > 0 ? (
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearFilter('stageFocus', true)
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
                  filterKey="stageFocus"
                  options={INVESTMENT_STAGES.map((stage) => ({
                    value: stage,
                    label: stage,
                  }))}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Industry Filter */}
        {columnVisibility.industry && (
          <div className="w-full sm:w-40">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 rounded-sm bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {localFilters.industryFocus.length > 0 ? (
                      localFilters.industryFocus.slice(0, 2).map((industry) => {
                        const industryColor =
                          getIndustryColor(industry).split(' hover:')[0]
                        return (
                          <Badge
                            key={industry}
                            className={`mr-1 ${industryColor} rounded-sm transition-none hover:bg-opacity-100 hover:opacity-100`}
                            style={{ pointerEvents: 'none' }}
                          >
                            {industry}
                          </Badge>
                        )
                      })
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Industry
                      </span>
                    )}
                    {localFilters.industryFocus.length > 2 && (
                      <Badge className="ml-1 bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 rounded-sm">
                        +{localFilters.industryFocus.length - 2}
                      </Badge>
                    )}
                  </div>
                  {localFilters.industryFocus.length > 0 ? (
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearFilter('industryFocus', true)
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
                  filterKey="industryFocus"
                  options={INDUSTRIES.map((industry) => ({
                    value: industry,
                    label: industry,
                  }))}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Check Size Filter */}
        {columnVisibility.check_size && (
          <div className="w-full sm:w-40">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 rounded-sm bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {localFilters.checkSizes.length > 0 ? (
                      localFilters.checkSizes.slice(0, 2).map((size) => {
                        const sizeColor = getOptionColors(
                          'checkSizes',
                          size,
                        ).split(' hover:')[0]
                        return (
                          <Badge
                            key={size}
                            className={`mr-1 ${sizeColor} rounded-sm transition-none hover:bg-opacity-100 hover:opacity-100`}
                            style={{ pointerEvents: 'none' }}
                          >
                            {size}
                          </Badge>
                        )
                      })
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Check Size
                      </span>
                    )}
                    {localFilters.checkSizes.length > 2 && (
                      <Badge className="ml-1 bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 rounded-sm">
                        +{localFilters.checkSizes.length - 2}
                      </Badge>
                    )}
                  </div>
                  {localFilters.checkSizes.length > 0 ? (
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearFilter('checkSizes', true)
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
                  filterKey="checkSizes"
                  options={CHECK_SIZES.map((size) => ({
                    value: size,
                    label: size,
                  }))}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Investment Approach Filter */}
        {columnVisibility.investment_approach && (
          <div className="w-full sm:w-40">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 rounded-sm bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {localFilters.investmentApproaches.length > 0 ? (
                      localFilters.investmentApproaches
                        .slice(0, 2)
                        .map((approach) => {
                          const approachColor = getOptionColors(
                            'investmentApproaches',
                            approach,
                          ).split(' hover:')[0]
                          const approachLabel =
                            approach.charAt(0).toUpperCase() +
                            approach.slice(1).replace('-', ' ')
                          return (
                            <Badge
                              key={approach}
                              className={`mr-1 ${approachColor} rounded-sm transition-none hover:bg-opacity-100 hover:opacity-100`}
                              style={{ pointerEvents: 'none' }}
                            >
                              {approachLabel}
                            </Badge>
                          )
                        })
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Approach
                      </span>
                    )}
                    {localFilters.investmentApproaches.length > 2 && (
                      <Badge className="ml-1 bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 rounded-sm">
                        +{localFilters.investmentApproaches.length - 2}
                      </Badge>
                    )}
                  </div>
                  {localFilters.investmentApproaches.length > 0 ? (
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearFilter('investmentApproaches', true)
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
                  filterKey="investmentApproaches"
                  options={INVESTMENT_APPROACHES.map((approach) => ({
                    value: approach,
                    label:
                      approach.charAt(0).toUpperCase() +
                      approach.slice(1).replace('-', ' '),
                  }))}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Type Filter */}
        {columnVisibility.type && (
          <div className="w-full sm:w-40">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 rounded-sm bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {localFilters.submissionTypes.length > 0 ? (
                      localFilters.submissionTypes.map((type) => {
                        const typeOption = SUBMISSION_TYPES.find(
                          (t) => t.value === type,
                        )
                        const color =
                          type === 'form'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : type === 'email'
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                        return (
                          <Badge
                            key={type}
                            className={`mr-1 ${color} rounded-sm transition-none hover:bg-opacity-100 hover:opacity-100`}
                            style={{ pointerEvents: 'none' }}
                          >
                            {typeOption?.label}
                          </Badge>
                        )
                      })
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Type
                      </span>
                    )}
                  </div>
                  {localFilters.submissionTypes.length > 0 ? (
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearFilter('submissionTypes', true)
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
                  filterKey="submissionTypes"
                  options={[...SUBMISSION_TYPES]}
                  hasIcon={false}
                />
              </PopoverContent>
            </Popover>
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
                {Object.entries(columnVisibility).map(([key, visible]) => (
                  <div
                    key={key}
                    onClick={() =>
                      onColumnVisibilityChange(
                        key as keyof ColumnVisibility,
                        !visible,
                      )
                    }
                    className={`flex items-center px-3 py-2 rounded-sm cursor-pointer transition-colors text-left ${visible ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-zinc-50 dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/40'}`}
                  >
                    <span className="text-sm font-medium capitalize">
                      {key === 'investment_approach'
                        ? 'Approach'
                        : key.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Submission Filter Toggle */}
        {totalSubmissions > 0 && (
          <div className="w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => {
                const nextState =
                  localFilters.submissionFilter === 'all'
                    ? 'hide_submitted'
                    : localFilters.submissionFilter === 'hide_submitted'
                      ? 'only_submitted'
                      : 'all'
                const newFilters = {
                  ...localFilters,
                  submissionFilter: nextState,
                }
                setLocalFilters(newFilters as unknown as AngelsFilters)
                onFiltersChange(newFilters as unknown as AngelsFilters)
              }}
              className={`w-full sm:w-auto h-10 px-3 rounded-sm transition-colors ${localFilters.submissionFilter === 'hide_submitted'
                  ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800 hover:bg-pink-100 dark:hover:bg-pink-900/40'
                  : localFilters.submissionFilter === 'only_submitted'
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40'
                    : 'bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]'
                }`}
              title={
                localFilters.submissionFilter === 'all'
                  ? 'Showing all angels (click to hide submitted)'
                  : localFilters.submissionFilter === 'hide_submitted'
                    ? 'Hiding submitted angels (click to show only submitted)'
                    : 'Showing only submitted angels (click to show all)'
              }
            >
              <LottieIcon
                animationData={
                  localFilters.submissionFilter === 'hide_submitted'
                    ? animations.visibility
                    : localFilters.submissionFilter === 'only_submitted'
                      ? animations.check
                      : animations.visibility
                }
                size={16}
                className="opacity-50 hover:opacity-100"
              />
            </Button>
          </div>
        )}

        {/* Clear filters button */}
        {hasActiveFilters && (
          <div className="w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="w-full sm:w-auto h-10 px-3 rounded-sm bg-card border-border text-muted-foreground hover:text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
            >
              <LottieIcon
                animationData={animations.trash}
                size={16}
                className="opacity-50 hover:opacity-100"
              />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
