'use client'

import React from 'react'
import Image from 'next/image'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/design/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import {
  ValidationGate,
  VALIDATION_PRESETS,
} from '@/components/ui/validation-gate'
import FundsFilters, { FundsFilters as FundsFiltersType } from './funds-filters'

type Target = {
  id: string
  name: string
  website?: string
  application_url: string
  application_email?: string
  submission_type: 'form' | 'email' | 'other'
  stage_focus?: string[]
  industry_focus?: string[]
  region_focus?: string[]
  form_complexity?: 'simple' | 'standard' | 'comprehensive'
  question_count_range?: '1-5' | '6-10' | '11-20' | '21+'
  required_documents?: string[]
  notes?: string
  created_at: string
  updated_at: string
}

interface FundsTableProps {
  targets: Target[]
  filters: FundsFiltersType
  onFiltersChange: (filters: FundsFiltersType) => void
  startupId: string
}

interface ColumnVisibility {
  region: boolean
  focus: boolean
  industry: boolean
  requirements: boolean
  type: boolean
  complexity: boolean
}

const SORT_STORAGE_KEY = 'funds-table-sort'
const COLUMN_VISIBILITY_STORAGE_KEY = 'funds-table-columns'

const FundsTable = React.memo(function FundsTable({
  targets,
  filters,
  onFiltersChange,
  startupId,
}: FundsTableProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const [hoveredButton, setHoveredButton] = React.useState<string | null>(null)
  const [submittingTargets, setSubmittingTargets] = React.useState<Set<string>>(
    new Set(),
  )
  const [queueStatus, setQueueStatus] = React.useState<{
    maxParallel: number
    maxQueue: number
    currentInProgress: number
    currentQueued: number
    availableSlots: number
    availableQueueSlots: number
    canSubmitMore: boolean
  } | null>(null)

  // Initialize sort config from localStorage if available
  const [sortConfig, setSortConfig] = React.useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSort = localStorage.getItem(SORT_STORAGE_KEY)
        if (savedSort) {
          return JSON.parse(savedSort)
        }
      } catch (error) {
        console.warn('Failed to load saved sort:', error)
      }
    }
    return { key: null, direction: 'asc' }
  })

  // Initialize column visibility from localStorage, with complexity hidden by default
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibility>(() => {
      if (typeof window !== 'undefined') {
        try {
          const savedVisibility = localStorage.getItem(
            COLUMN_VISIBILITY_STORAGE_KEY,
          )
          if (savedVisibility) {
            return JSON.parse(savedVisibility)
          }
        } catch (error) {
          console.warn('Failed to load saved column visibility:', error)
        }
      }
      return {
        region: true,
        focus: true,
        industry: true,
        requirements: true,
        type: true,
        complexity: false, // Hidden by default
      }
    })

  // Update column visibility and save to localStorage
  const updateColumnVisibility = React.useCallback(
    (column: keyof ColumnVisibility, visible: boolean) => {
      setColumnVisibility((prev) => {
        const newVisibility = { ...prev, [column]: visible }

        // Save to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(
              COLUMN_VISIBILITY_STORAGE_KEY,
              JSON.stringify(newVisibility),
            )
          } catch (error) {
            console.warn('Failed to save column visibility:', error)
          }
        }

        return newVisibility
      })
    },
    [],
  )

  // Filter and sort targets based on active filters and sort configuration
  const filteredAndSortedTargets = React.useMemo(() => {
    const result = targets.filter((target) => {
      // Filter by submission type
      if (
        filters.submissionTypes.length > 0 &&
        !filters.submissionTypes.includes(target.submission_type)
      ) {
        return false
      }

      // Filter by stage focus
      if (filters.stageFocus.length > 0) {
        const hasMatchingStage = target.stage_focus?.some((stage) =>
          filters.stageFocus.includes(stage),
        )
        if (!hasMatchingStage) return false
      }

      // Filter by industry focus
      if (filters.industryFocus.length > 0) {
        const hasMatchingIndustry = target.industry_focus?.some((industry) =>
          filters.industryFocus.includes(industry),
        )
        if (!hasMatchingIndustry) return false
      }

      // Filter by region focus
      if (filters.regionFocus.length > 0) {
        const hasMatchingRegion = target.region_focus?.some((region) =>
          filters.regionFocus.includes(region),
        )
        if (!hasMatchingRegion) return false
      }

      // Filter by form complexity
      if (
        filters.formComplexity.length > 0 &&
        target.form_complexity &&
        !filters.formComplexity.includes(target.form_complexity)
      ) {
        return false
      }

      // Filter by required documents
      if (filters.requiredDocuments && filters.requiredDocuments.length > 0) {
        const hasMatchingDocument = target.required_documents?.some((doc) =>
          filters.requiredDocuments.includes(doc),
        )
        if (!hasMatchingDocument) return false
      }

      return true
    })

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue: string | number
        let bValue: string | number

        switch (sortConfig.key) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'type':
            aValue = a.submission_type
            bValue = b.submission_type
            break
          case 'focus':
            aValue = a.stage_focus?.join(', ') || ''
            bValue = b.stage_focus?.join(', ') || ''
            break
          case 'industry':
            aValue = a.industry_focus?.join(', ') || ''
            bValue = b.industry_focus?.join(', ') || ''
            break
          case 'complexity':
            const complexityOrder = { simple: 1, standard: 2, comprehensive: 3 }
            aValue =
              complexityOrder[
                a.form_complexity as keyof typeof complexityOrder
              ] || 0
            bValue =
              complexityOrder[
                b.form_complexity as keyof typeof complexityOrder
              ] || 0
            break
          case 'requirements':
            aValue = a.required_documents?.length || 0
            bValue = b.required_documents?.length || 0
            break
          case 'region':
            aValue = a.region_focus?.join(', ') || ''
            bValue = b.region_focus?.join(', ') || ''
            break
          default:
            return 0
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return result
  }, [targets, filters, sortConfig])

  const handleSort = React.useCallback((key: string) => {
    setSortConfig((prevConfig) => {
      const config = {
        key,
        direction: (prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc') as 'asc' | 'desc',
      }

      // Persist sort config to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(config))
        } catch (error) {
          console.warn('Failed to save sort config:', error)
        }
      }
      return config
    })
  }, [])

  // Filter targets based on active filters (keeping for backward compatibility)
  const filteredTargets = filteredAndSortedTargets

  // Fetch queue status
  React.useEffect(() => {
    if (!user?.id || !startupId) return

    const fetchQueueStatus = async () => {
      try {
        const response = await fetch('/api/queue/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            startupId,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setQueueStatus(data)
        }
      } catch (error) {
        console.error('Failed to fetch queue status:', error)
      }
    }

    fetchQueueStatus()
    // Refresh queue status every 30 seconds
    const interval = setInterval(fetchQueueStatus, 30000)

    return () => clearInterval(interval)
  }, [user?.id, startupId])

  const clearFilters = React.useCallback(() => {
    onFiltersChange({
      submissionTypes: [],
      stageFocus: [],
      industryFocus: [],
      regionFocus: [],
      formComplexity: [],
      requiredDocuments: [],
    })
  }, [onFiltersChange])

  const getSubmissionTypeColor = React.useCallback((type: string) => {
    switch (type) {
      case 'form':
        return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
      case 'email':
        return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
      case 'other':
        return 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
      default:
        return 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
    }
  }, [])

  const getComplexityColor = React.useCallback((complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
      case 'standard':
        return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
      case 'comprehensive':
        return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
    }
  }, [])

  const getRegionColor = React.useCallback((region: string) => {
    // Global and Emerging Markets - Blue
    if (['Global', 'Emerging Markets'].includes(region)) {
      return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
    }
    // North America - Green
    if (region === 'North America') {
      return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
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
      return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
    }
    // Asia - Orange
    if (
      ['Asia', 'East Asia', 'South Asia', 'South East Asia'].includes(region)
    ) {
      return 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
    }
    // Latin America - Pink
    if (['LATAM', 'South America'].includes(region)) {
      return 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800'
    }
    // Africa, Middle East, and EMEA - Teal
    if (['Africa', 'Middle East', 'EMEA'].includes(region)) {
      return 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
    }
    // Oceania - Cyan
    if (region === 'Oceania') {
      return 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800'
    }
    // Default
    return 'bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
  }, [])

  const getRegionIconColor = React.useCallback((region: string) => {
    // Global and Emerging Markets - Blue
    if (['Global', 'Emerging Markets'].includes(region)) {
      return [0.219, 0.461, 0.835] as [number, number, number] // blue-600
    }
    // North America - Green
    if (region === 'North America') {
      return [0.133, 0.773, 0.369] as [number, number, number] // green-600
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
      return [0.583, 0.278, 0.824] as [number, number, number] // purple-600
    }
    // Asia - Orange
    if (
      ['Asia', 'East Asia', 'South Asia', 'South East Asia'].includes(region)
    ) {
      return [0.918, 0.435, 0.071] as [number, number, number] // orange-600
    }
    // Latin America - Pink
    if (['LATAM', 'South America'].includes(region)) {
      return [0.925, 0.314, 0.604] as [number, number, number] // pink-600
    }
    // Africa, Middle East, and EMEA - Teal
    if (['Africa', 'Middle East', 'EMEA'].includes(region)) {
      return [0.059, 0.735, 0.616] as [number, number, number] // teal-600
    }
    // Oceania - Cyan
    if (region === 'Oceania') {
      return [0.031, 0.678, 0.827] as [number, number, number] // cyan-600
    }
    // Default
    return [0.467, 0.467, 0.467] as [number, number, number] // gray-600
  }, [])

  const getStageColor = React.useCallback((stage: string) => {
    switch (stage) {
      case 'All':
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
      case 'Pre-seed':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
      case 'Seed':
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
      case 'Series A':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
      case 'Series B':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
      case 'Series C':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
      case 'Growth':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
    }
  }, [])

  const getDocumentBadge = React.useCallback((docType: string) => {
    switch (docType) {
      case 'pitch_deck':
        return {
          label: 'Deck',
          animation: animations.fileplus,
          color:
            'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
          customColor: [1.0, 0.451, 0.102] as [number, number, number], // orange-600
        }
      case 'video':
        return {
          label: 'Video',
          animation: animations.ratio,
          color:
            'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
          customColor: [0.924, 0.314, 0.604] as [number, number, number], // pink-600
        }
      case 'financial_projections':
        return {
          label: 'Financials',
          animation: animations.cash,
          color:
            'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
          customColor: [0.059, 0.735, 0.467] as [number, number, number], // emerald-600
        }
      case 'traction_data':
        return {
          label: 'Traction',
          animation: animations.trending,
          color:
            'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800',
          customColor: [0.543, 0.361, 0.839] as [number, number, number], // violet-600
        }
      case 'team_bios':
        return {
          label: 'Team',
          animation: animations.group,
          color:
            'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
          customColor: [0.373, 0.361, 0.804] as [number, number, number], // indigo-600
        }
      default:
        return {
          label: docType.replace('_', ' '),
          animation: animations.fileplus,
          color:
            'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800',
          customColor: [0.467, 0.467, 0.467] as [number, number, number], // gray-600
        }
    }
  }, [])

  const capitalizeFirst = React.useCallback((str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }, [])

  const handleApplyForm = React.useCallback(
    async (targetId: string, targetName: string) => {
      if (!user?.id) {
        toast({
          title: 'Error',
          description: 'You must be logged in to submit applications',
          variant: 'destructive',
        })
        return
      }

      if (submittingTargets.has(targetId)) {
        return // Already submitting
      }

      setSubmittingTargets((prev) => new Set(Array.from(prev).concat(targetId)))

      try {
        // Check queue status first
        if (!queueStatus?.canSubmitMore) {
          toast({
            title: 'Queue full',
            variant: 'destructive',
            description:
              'Cannot submit more applications. Queue is at capacity.',
          })
          return
        }

        toast({
          title: 'Adding to queue',
          variant: 'info',
          duration: 4000,
          description: `Adding application to ${targetName} to processing queue...`,
        })

        const response = await fetch('/api/agent/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startupId,
            targetId,
            userId: user.id,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to submit application')
        }

        if (result.success) {
          if (result.status === 'queued') {
            toast({
              title: 'Added to queue',
              variant: 'success',
              description: `Application to ${result.targetName} added to queue at position ${result.queuePosition}`,
            })
          } else {
            toast({
              title: 'Processing started',
              variant: 'info',
              duration: 4000,
              description: `Application to ${result.targetName} is now being processed`,
            })
          }

          // Refresh queue status
          setTimeout(() => {
            const fetchQueueStatus = async () => {
              try {
                const response = await fetch('/api/queue/status', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userId: user.id,
                    startupId,
                  }),
                })

                if (response.ok) {
                  const data = await response.json()
                  setQueueStatus(data)
                }
              } catch (error) {
                console.error('Failed to refresh queue status:', error)
              }
            }
            fetchQueueStatus()
          }, 1000)
        } else {
          toast({
            title: 'Application failed',
            description: result.error || 'Failed to submit application',
            variant: 'destructive',
          })
        }
      } catch (error) {
        console.error('Application submission error:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to submit application',
          variant: 'destructive',
        })
      } finally {
        setSubmittingTargets((prev) => {
          const newSet = new Set(prev)
          newSet.delete(targetId)
          return newSet
        })
      }
    },
    [user?.id, startupId, submittingTargets, toast, queueStatus],
  )

  const handleSendEmail = React.useCallback((email: string | undefined) => {
    if (!email) return
    window.open(`mailto:${email}`, '_blank')
  }, [])

  const handleLearnMore = React.useCallback((applicationUrl: string) => {
    window.open(applicationUrl, '_blank')
  }, [])

  return (
    <TooltipProvider>
      <div
        className="h-full flex flex-col"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
        onCopy={(e: React.ClipboardEvent) => e.preventDefault()}
        onCut={(e: React.ClipboardEvent) => e.preventDefault()}
        onPaste={(e: React.ClipboardEvent) => e.preventDefault()}
        onDragStart={(e: React.DragEvent) => e.preventDefault()}
        onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
      >
        {/* Filters Component */}
        <FundsFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearFilters={clearFilters}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={updateColumnVisibility}
        />

        <div className="flex-1 min-h-0">
          {filteredTargets.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-sm border border-dashed shadow-sm min-h-[74vh]">
              <div className="flex flex-col items-center gap-6 text-center max-w-md">
                <div className="relative w-48 h-48">
                  <Image
                    src="/placeholder/no_match_record.webp"
                    alt="No matching funds"
                    fill
                    className="object-contain opacity-80"
                    priority
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full rounded-sm border overflow-hidden">
              <div
                className="h-full overflow-auto hide-scrollbar max-h-[88vh]"
                data-scroll-preserve="funds-table-scroll"
              >
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10 border-b">
                    <TableRow>
                      <TableHead className="w-[320px]">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center hover:text-foreground transition-colors font-medium"
                        >
                          Name
                        </button>
                      </TableHead>
                      {columnVisibility.region && (
                        <TableHead className="w-[100px]">
                          <button
                            onClick={() => handleSort('region')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Region
                          </button>
                        </TableHead>
                      )}
                      {columnVisibility.focus && (
                        <TableHead className="w-[100px]">
                          <button
                            onClick={() => handleSort('focus')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Focus
                          </button>
                        </TableHead>
                      )}
                      {columnVisibility.industry && (
                        <TableHead className="w-[100px]">
                          <button
                            onClick={() => handleSort('industry')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Industry
                          </button>
                        </TableHead>
                      )}
                      {columnVisibility.type && (
                        <TableHead className="w-[70px]">
                          <button
                            onClick={() => handleSort('type')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Type
                          </button>
                        </TableHead>
                      )}
                      {columnVisibility.requirements && (
                        <TableHead className="w-[110px]">
                          <button
                            onClick={() => handleSort('requirements')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Requirements
                          </button>
                        </TableHead>
                      )}
                      {columnVisibility.complexity && (
                        <TableHead className="w-[90px]">
                          <button
                            onClick={() => handleSort('complexity')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Complexity
                          </button>
                        </TableHead>
                      )}
                      <TableHead className="text-right w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTargets.map((target) => (
                      <TableRow key={target.id}>
                        <TableCell className="font-medium p-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {target.website ? (
                                <a
                                  href={target.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-foreground hover:text-foreground hover:underline"
                                >
                                  {target.name}
                                </a>
                              ) : (
                                <span className="font-medium">
                                  {target.name}
                                </span>
                              )}
                            </div>
                            {target.notes && (
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {target.notes}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        {columnVisibility.region && (
                          <TableCell className="p-2">
                            <div className="flex flex-wrap gap-1">
                              {target.region_focus
                                ?.slice(0, 2)
                                .map((region) => (
                                  <Badge
                                    key={region}
                                    className={`rounded-sm ${getRegionColor(region)} text-xs`}
                                  >
                                    <LottieIcon
                                      animationData={animations.globe}
                                      size={12}
                                      className="mr-1"
                                      customColor={getRegionIconColor(region)}
                                    />
                                    {region}
                                  </Badge>
                                ))}
                              {target.region_focus &&
                                target.region_focus.length > 2 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge className="rounded-sm bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs cursor-help">
                                        +{target.region_focus.length - 2}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-background text-foreground border border-border rounded-sm shadow-md px-3 py-2 before:hidden after:hidden [&>svg]:hidden [&>*[role='presentation']]:hidden">
                                      <div className="space-y-1">
                                        {target.region_focus
                                          .slice(2)
                                          .map((region) => (
                                            <div
                                              key={region}
                                              className="text-xs"
                                            >
                                              {region}
                                            </div>
                                          ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                            </div>
                          </TableCell>
                        )}
                        {columnVisibility.focus && (
                          <TableCell className="p-2">
                            <div className="flex flex-wrap gap-1">
                              {target.stage_focus?.slice(0, 2).map((stage) => (
                                <Badge
                                  key={stage}
                                  className={`rounded-sm ${getStageColor(stage)} text-xs`}
                                >
                                  {stage}
                                </Badge>
                              ))}
                              {target.stage_focus &&
                                target.stage_focus.length > 2 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge className="rounded-sm bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs cursor-help">
                                        +{target.stage_focus.length - 2}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-background text-foreground border border-border rounded-sm shadow-md px-3 py-2 before:hidden after:hidden [&>svg]:hidden [&>*[role='presentation']]:hidden">
                                      <div className="space-y-1">
                                        {target.stage_focus
                                          .slice(2)
                                          .map((stage) => (
                                            <div
                                              key={stage}
                                              className="text-xs"
                                            >
                                              {stage}
                                            </div>
                                          ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                            </div>
                          </TableCell>
                        )}
                        {columnVisibility.industry && (
                          <TableCell className="p-2">
                            <div className="flex flex-wrap gap-1">
                              {target.industry_focus
                                ?.slice(0, 2)
                                .map((industry) => (
                                  <Badge
                                    key={industry}
                                    className="rounded-sm bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs"
                                  >
                                    {industry}
                                  </Badge>
                                ))}
                              {target.industry_focus &&
                                target.industry_focus.length > 2 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge className="rounded-sm bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs cursor-help">
                                        +{target.industry_focus.length - 2}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-background text-foreground border border-border rounded-sm shadow-md px-3 py-2 before:hidden after:hidden [&>svg]:hidden [&>*[role='presentation']]:hidden">
                                      <div className="space-y-1">
                                        {target.industry_focus
                                          .slice(2)
                                          .map((industry) => (
                                            <div
                                              key={industry}
                                              className="text-xs"
                                            >
                                              {industry}
                                            </div>
                                          ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                            </div>
                          </TableCell>
                        )}
                        {columnVisibility.type && (
                          <TableCell className="p-2">
                            <Badge
                              className={`rounded-sm text-xs ${getSubmissionTypeColor(target.submission_type)}`}
                            >
                              {capitalizeFirst(target.submission_type)}
                            </Badge>
                          </TableCell>
                        )}
                        {columnVisibility.requirements && (
                          <TableCell className="p-2">
                            <div className="flex flex-wrap gap-1">
                              {target.required_documents
                                ?.slice(0, 2)
                                .map((docType) => {
                                  const docBadge = getDocumentBadge(docType)
                                  return (
                                    <Badge
                                      key={docType}
                                      className={`rounded-sm text-xs ${docBadge.color}`}
                                    >
                                      <LottieIcon
                                        animationData={docBadge.animation}
                                        size={12}
                                        className="mr-1"
                                        customColor={docBadge.customColor}
                                      />
                                      {docBadge.label}
                                    </Badge>
                                  )
                                })}
                              {target.required_documents &&
                                target.required_documents.length > 2 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge className="rounded-sm bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs cursor-help">
                                        +{target.required_documents.length - 2}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-background text-foreground border border-border rounded-sm shadow-md px-3 py-2 before:hidden after:hidden [&>svg]:hidden [&>*[role='presentation']]:hidden">
                                      <div className="space-y-1">
                                        {target.required_documents
                                          .slice(2)
                                          .map((docType) => {
                                            const docBadge =
                                              getDocumentBadge(docType)
                                            return (
                                              <div
                                                key={docType}
                                                className="text-xs flex items-center gap-1"
                                              >
                                                <LottieIcon
                                                  animationData={
                                                    docBadge.animation
                                                  }
                                                  size={12}
                                                  customColor={
                                                    docBadge.customColor
                                                  }
                                                />
                                                {docBadge.label}
                                              </div>
                                            )
                                          })}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                            </div>
                          </TableCell>
                        )}
                        {columnVisibility.complexity && (
                          <TableCell className="p-2">
                            <div className="flex flex-wrap gap-1">
                              {target.form_complexity && (
                                <Badge
                                  className={`rounded-sm text-xs ${getComplexityColor(target.form_complexity)}`}
                                >
                                  {capitalizeFirst(target.form_complexity)}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        )}

                        <TableCell className="text-right p-2">
                          <div className="flex justify-end">
                            {target.submission_type === 'form' && (
                              <ValidationGate
                                requirements={
                                  VALIDATION_PRESETS.BASIC_APPLICATION
                                }
                                onValidationPass={() =>
                                  handleApplyForm(target.id, target.name)
                                }
                              >
                                <Button
                                  size="sm"
                                  disabled={
                                    submittingTargets.has(target.id) ||
                                    (queueStatus
                                      ? !queueStatus.canSubmitMore
                                      : false)
                                  }
                                  onMouseEnter={() =>
                                    setHoveredButton(`apply-${target.id}`)
                                  }
                                  onMouseLeave={() => setHoveredButton(null)}
                                  className={`rounded-sm px-3 text-sm h-8 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    queueStatus && !queueStatus.canSubmitMore
                                      ? 'bg-gray-50 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
                                      : queueStatus &&
                                          queueStatus.availableSlots === 0
                                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800'
                                        : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800'
                                  }`}
                                  title={
                                    queueStatus && !queueStatus.canSubmitMore
                                      ? 'Queue is full. Cannot add more applications.'
                                      : queueStatus &&
                                          queueStatus.availableSlots === 0
                                        ? `Will be added to queue (${queueStatus.currentQueued}/${queueStatus.maxQueue})`
                                        : queueStatus
                                          ? `Available slots: ${queueStatus.availableSlots}/${queueStatus.maxParallel}`
                                          : 'Submit application'
                                  }
                                >
                                  <LottieIcon
                                    animationData={
                                      submittingTargets.has(target.id)
                                        ? animations.autorenew
                                        : queueStatus &&
                                            !queueStatus.canSubmitMore
                                          ? animations.cross
                                          : queueStatus &&
                                              queueStatus.availableSlots === 0
                                            ? animations.hourglass
                                            : animations.takeoff
                                    }
                                    size={14}
                                    className="mr-1"
                                    isHovered={
                                      hoveredButton === `apply-${target.id}` &&
                                      !submittingTargets.has(target.id) &&
                                      queueStatus?.canSubmitMore !== false
                                    }
                                  />
                                  {submittingTargets.has(target.id)
                                    ? 'Submitting...'
                                    : queueStatus && !queueStatus.canSubmitMore
                                      ? 'Queue Full'
                                      : queueStatus &&
                                          queueStatus.availableSlots === 0
                                        ? 'Queue'
                                        : 'Apply'}
                                </Button>
                              </ValidationGate>
                            )}
                            {target.submission_type === 'email' &&
                              target.application_email && (
                                <ValidationGate
                                  requirements={
                                    VALIDATION_PRESETS.BASIC_APPLICATION
                                  }
                                  onValidationPass={() =>
                                    handleSendEmail(target.application_email)
                                  }
                                >
                                  <Button
                                    size="sm"
                                    onMouseEnter={() =>
                                      setHoveredButton(`email-${target.id}`)
                                    }
                                    onMouseLeave={() => setHoveredButton(null)}
                                    className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-800 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-800 rounded-sm px-3 text-sm h-8"
                                  >
                                    <LottieIcon
                                      animationData={animations.mailopen}
                                      size={14}
                                      className="mr-1"
                                      isHovered={
                                        hoveredButton === `email-${target.id}`
                                      }
                                    />
                                    Send Email
                                  </Button>
                                </ValidationGate>
                              )}
                            {target.submission_type === 'other' && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleLearnMore(target.application_url)
                                }
                                onMouseEnter={() =>
                                  setHoveredButton(`learn-${target.id}`)
                                }
                                onMouseLeave={() => setHoveredButton(null)}
                                className="bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900/40 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-sm px-3 text-sm h-8"
                              >
                                <LottieIcon
                                  animationData={animations.info}
                                  size={14}
                                  className="mr-1"
                                  isHovered={
                                    hoveredButton === `learn-${target.id}`
                                  }
                                />
                                Learn More
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
})

export default FundsTable
