'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'

export interface FundsFilters {
  submissionTypes: string[]
  stageFocus: string[]
  industryFocus: string[]
  regionFocus: string[]
  formComplexity: string[]
  requiredDocuments: string[]
}

interface ColumnVisibility {
  region: boolean
  focus: boolean
  industry: boolean
  requirements: boolean
  type: boolean
  complexity: boolean
}

interface FundsFiltersProps {
  filters: FundsFilters
  onFiltersChange: (filters: FundsFilters) => void
  onClearFilters: () => void
  columnVisibility: ColumnVisibility
  onColumnVisibilityChange: (
    column: keyof ColumnVisibility,
    visible: boolean,
  ) => void
}

const SUBMISSION_TYPES = [
  { value: 'form', label: 'Form', animation: animations.fileplus },
  { value: 'email', label: 'Email', animation: animations.mail },
  { value: 'other', label: 'Other', animation: animations.help },
]

const INVESTMENT_STAGES = [
  'All',
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Growth',
]

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
]

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
]

const FORM_COMPLEXITY = [
  { value: 'simple', label: 'Simple' },
  { value: 'standard', label: 'Standard' },
  { value: 'comprehensive', label: 'Comprehensive' },
]

const REQUIRED_DOCUMENTS = [
  { value: 'pitch_deck', label: 'Deck' },
  { value: 'video', label: 'Video' },
  { value: 'financial_projections', label: 'Financials' },
  { value: 'traction_data', label: 'Traction' },
  { value: 'team_bios', label: 'Team' },
]

export default function FundsFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  columnVisibility,
  onColumnVisibilityChange,
}: FundsFiltersProps) {
  const updateFilter = (
    filterKey: keyof FundsFilters,
    value: string,
    checked: boolean,
  ) => {
    const currentValues = filters[filterKey]
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value)

    onFiltersChange({
      ...filters,
      [filterKey]: newValues,
    })
  }

  const clearFilter = (filterKey: keyof FundsFilters) => {
    onFiltersChange({
      ...filters,
      [filterKey]: [],
    })
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce(
      (count, filterArray) => count + filterArray.length,
      0,
    )
  }

  const hasActiveFilters = getActiveFiltersCount() > 0

  // Color mapping functions with improved gradient for investment stages
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'All':
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/40'
      case 'Pre-seed':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40'
      case 'Seed':
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40'
      case 'Series A':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40'
      case 'Series B':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
      case 'Series C':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40'
      case 'Growth':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40'
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/40'
    }
  }

  const getIndustryColor = (industry: string) => {
    // Tech/SaaS group
    if (
      [
        'B2B SaaS',
        'AI/ML',
        'Deep tech',
        'Developer tools',
        'Cybersecurity',
      ].includes(industry)
    ) {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40'
    }
    // Finance
    if (industry === 'Fintech') {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
    }
    // Health
    if (industry === 'Healthtech') {
      return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40'
    }
    // Consumer/Commerce
    if (
      ['Consumer', 'E-commerce', 'Marketplace', 'Gaming'].includes(industry)
    ) {
      return 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40'
    }
    // Climate
    if (industry === 'Climate tech') {
      return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40'
    }
    // Property/Insurance
    if (['PropTech', 'InsurTech'].includes(industry)) {
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40'
    }
    // Advertising/Logistics
    if (['AdTech', 'Logistics'].includes(industry)) {
      return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40'
    }
    // Web3/Crypto
    if (industry === 'Web3') {
      return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40'
    }
    // Default
    return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/40'
  }

  const getRegionColor = (region: string) => {
    // Global and Emerging Markets - Blue
    if (['Global', 'Emerging Markets'].includes(region)) {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40'
    }
    // North America - Green
    if (region === 'North America') {
      return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40'
    }
    // Europe - Purple
    if (
      [
        'Europe',
        'Western Europe',
        'Eastern Europe',
        'Continental Europe',
      ].includes(region)
    ) {
      return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40'
    }
    // Asia - Orange
    if (
      ['Asia', 'East Asia', 'South Asia', 'South East Asia'].includes(region)
    ) {
      return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40'
    }
    // Latin America - Pink
    if (['LATAM', 'South America'].includes(region)) {
      return 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40'
    }
    // Africa, Middle East, and EMEA - Teal
    if (['Africa', 'Middle East', 'EMEA'].includes(region)) {
      return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40'
    }
    // Oceania - Cyan
    if (region === 'Oceania') {
      return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/40'
    }
    // Default
    return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/40'
  }

  const getOptionColors = (filterKey: keyof FundsFilters, value: string) => {
    if (filterKey === 'submissionTypes') {
      if (value === 'form')
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40'
      if (value === 'email')
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40'
      if (value === 'other')
        return 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40'
    }
    if (filterKey === 'formComplexity') {
      if (value === 'simple')
        return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40'
      if (value === 'standard')
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40'
      if (value === 'comprehensive')
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40'
    }
    if (filterKey === 'regionFocus') {
      return getRegionColor(value)
    }
    if (filterKey === 'stageFocus') {
      return getStageColor(value)
    }
    if (filterKey === 'industryFocus') {
      return getIndustryColor(value)
    }
    if (filterKey === 'requiredDocuments') {
      if (value === 'pitch_deck')
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40'
      if (value === 'video')
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40'
      if (value === 'financial_projections')
        return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40'
      if (value === 'traction_data')
        return 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/40'
      if (value === 'team_bios')
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
    }
    return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/40'
  }

  const FilterSection = ({
    filterKey,
    options,
    hasIcon = false,
  }: {
    filterKey: keyof FundsFilters
    options: Array<{ value: string; label: string; animation?: object }>
    hasIcon?: boolean
  }) => (
    <div className="p-2">
      <div
        className="space-y-1 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {options.map((option) => {
          const isSelected = filters[filterKey]?.includes(option.value) || false
          const colors = getOptionColors(filterKey, option.value)

          return (
            <div
              key={option.value}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                updateFilter(filterKey, option.value, !isSelected)
              }}
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

  return (
    <div
      className="w-[calc(100%+2rem)] -ml-4 sm:ml-0 sm:w-full p-4"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
      onCopy={(e: React.ClipboardEvent) => e.preventDefault()}
      onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Region Filter - 5% width reduction */}
        {columnVisibility.region && (
          <div className="w-full sm:w-44">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 rounded-sm bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {filters.regionFocus.length > 0 ? (
                      filters.regionFocus.slice(0, 2).map((region) => {
                        const regionColor =
                          getRegionColor(region).split(' hover:')[0] // Remove hover classes for display
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
                    {filters.regionFocus.length > 2 && (
                      <Badge className="ml-1 bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 rounded-sm">
                        +{filters.regionFocus.length - 2}
                      </Badge>
                    )}
                  </div>
                  {filters.regionFocus.length > 0 ? (
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearFilter('regionFocus')
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
                className="w-44 p-0 bg-card text-card-foreground rounded-sm"
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

        {/* Focus Filter - 40% width reduction */}
        {columnVisibility.focus && (
          <div className="w-full sm:w-36">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 rounded-sm bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {filters.stageFocus.length > 0 ? (
                      filters.stageFocus.slice(0, 2).map((stage) => {
                        const stageColor =
                          getStageColor(stage).split(' hover:')[0] // Remove hover classes for display
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
                    {filters.stageFocus.length > 2 && (
                      <Badge className="ml-1 bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 rounded-sm">
                        +{filters.stageFocus.length - 2}
                      </Badge>
                    )}
                  </div>
                  {filters.stageFocus.length > 0 ? (
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearFilter('stageFocus')
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
                className="w-36 p-0 bg-card text-card-foreground rounded-sm"
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

        {/* Industry Filter - 10% width reduction */}
        {columnVisibility.industry && (
          <div className="w-full sm:w-40">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 rounded-sm bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {filters.industryFocus.length > 0 ? (
                      filters.industryFocus.slice(0, 2).map((industry) => {
                        const industryColor =
                          getIndustryColor(industry).split(' hover:')[0] // Remove hover classes for display
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
                    {filters.industryFocus.length > 2 && (
                      <Badge className="ml-1 bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 rounded-sm">
                        +{filters.industryFocus.length - 2}
                      </Badge>
                    )}
                  </div>
                  {filters.industryFocus.length > 0 ? (
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearFilter('industryFocus')
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

        {/* Type Filter - 10% width increase from w-28 */}
        {columnVisibility.type && (
          <div className="w-full sm:w-36">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 rounded-sm bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {filters.submissionTypes.length > 0 ? (
                      filters.submissionTypes.map((type) => {
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
                  {filters.submissionTypes.length > 0 ? (
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearFilter('submissionTypes')
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
                className="w-36 p-0 bg-card text-card-foreground rounded-sm"
                align="start"
              >
                <FilterSection
                  filterKey="submissionTypes"
                  options={SUBMISSION_TYPES}
                  hasIcon={false}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Requirements Filter */}
        {columnVisibility.requirements && (
          <div className="w-full sm:w-40">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 rounded-sm bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {filters.requiredDocuments &&
                      filters.requiredDocuments.length > 0 ? (
                      filters.requiredDocuments.slice(0, 2).map((doc) => {
                        const docOption = REQUIRED_DOCUMENTS.find(
                          (d) => d.value === doc,
                        )
                        const docColor = getOptionColors(
                          'requiredDocuments',
                          doc,
                        ).split(' hover:')[0] // Remove hover classes for display
                        return (
                          <Badge
                            key={doc}
                            className={`mr-1 ${docColor} rounded-sm transition-none hover:bg-opacity-100 hover:opacity-100`}
                            style={{ pointerEvents: 'none' }}
                          >
                            {docOption?.label}
                          </Badge>
                        )
                      })
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Requirements
                      </span>
                    )}
                    {filters.requiredDocuments &&
                      filters.requiredDocuments.length > 2 && (
                        <Badge className="ml-1 bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 rounded-sm">
                          +{filters.requiredDocuments.length - 2}
                        </Badge>
                      )}
                  </div>
                  {filters.requiredDocuments &&
                    filters.requiredDocuments.length > 0 ? (
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearFilter('requiredDocuments')
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
                  filterKey="requiredDocuments"
                  options={REQUIRED_DOCUMENTS}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Complexity Filter - 5% width reduction */}
        {columnVisibility.complexity && (
          <div className="w-full sm:w-36">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 rounded-sm bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {filters.formComplexity.length > 0 ? (
                      filters.formComplexity.map((complexity) => {
                        const color =
                          complexity === 'simple'
                            ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                            : complexity === 'standard'
                              ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        return (
                          <Badge
                            key={complexity}
                            className={`mr-1 ${color} rounded-sm transition-none hover:bg-opacity-100 hover:opacity-100`}
                            style={{ pointerEvents: 'none' }}
                          >
                            {complexity.charAt(0).toUpperCase() +
                              complexity.slice(1)}
                          </Badge>
                        )
                      })
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Complexity
                      </span>
                    )}
                  </div>
                  {filters.formComplexity.length > 0 ? (
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearFilter('formComplexity')
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
                className="w-36 p-0 bg-card text-card-foreground rounded-sm"
                align="start"
              >
                <FilterSection
                  filterKey="formComplexity"
                  options={FORM_COMPLEXITY}
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
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onColumnVisibilityChange(
                        key as keyof ColumnVisibility,
                        !visible,
                      )
                    }}
                    className={`
                                            flex items-center px-3 py-2 rounded-sm cursor-pointer transition-colors text-left
                                            ${visible
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'bg-zinc-50 dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/40'
                      }
                                        `}
                  >
                    <span className="text-sm font-medium capitalize">
                      {key === 'requirements' ? 'Requirements' : key}
                    </span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear filters button - inline on desktop */}
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
                className="mr-2 opacity-50 hover:opacity-100"
              />
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
