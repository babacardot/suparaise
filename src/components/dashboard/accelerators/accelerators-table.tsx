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
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
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
import Link from 'next/link'

type Accelerator = {
  id: string
  name: string
  website?: string
  application_url?: string
  application_email?: string
  submission_type: 'form' | 'email' | 'other'
  program_type?: 'in-person' | 'remote' | 'hybrid'
  program_duration?: string
  location?: string
  is_remote_friendly?: boolean
  batch_size?: string
  batches_per_year?: number
  next_application_deadline?: string
  stage_focus?: string[]
  industry_focus?: string[]
  region_focus?: string[]
  equity_taken?: string
  funding_provided?: string
  acceptance_rate?: string
  form_complexity?: 'simple' | 'standard' | 'comprehensive'
  required_documents?: string[]
  program_fee?: number
  is_active?: boolean
  notes?: string
  visibility_level?: 'FREE' | 'PRO' | 'MAX'
  created_at: string
  updated_at: string
}

interface AcceleratorsTableProps {
  accelerators: Accelerator[]
  startupId: string
  paginationData: {
    totalCount: number
    hasMore: boolean
    currentPage: number
    limit: number
  } | null
  offset: number
  onPreviousPage: () => void
  onNextPage: () => void
  onSortChange: (key: string) => void
  columnVisibility: ColumnVisibility
  onAcceleratorClick?: (accelerator: Accelerator) => void
  onAcceleratorHover?: (accelerator: Accelerator) => void
  onAcceleratorLeave?: () => void
}

interface ColumnVisibility {
  region: boolean
  focus: boolean
  industry: boolean
  requirements: boolean
  type: boolean
  programType: boolean
  equity: boolean
  funding: boolean
}

const AcceleratorsTable = React.memo(function AcceleratorsTable({
  accelerators,
  startupId,
  paginationData,
  offset,
  onPreviousPage,
  onNextPage,
  onSortChange,
  columnVisibility,
  onAcceleratorClick,
  onAcceleratorHover,
  onAcceleratorLeave,
}: AcceleratorsTableProps) {
  const { user, subscription } = useUser()
  const { toast } = useToast()
  const [hoveredButton, setHoveredButton] = React.useState<string | null>(null)
  const [submittingAccelerators, setSubmittingAccelerators] = React.useState<
    Set<string>
  >(new Set())
  const [queueStatus, setQueueStatus] = React.useState<{
    maxParallel: number
    maxQueue: number
    currentInProgress: number
    currentQueued: number
    availableSlots: number
    availableQueueSlots: number
    canSubmitMore: boolean
  } | null>(null)
  const playClickSound = React.useCallback(() => {
    try {
      const audio = new Audio('/sounds/light.mp3')
      audio.volume = 0.4
      void audio.play().catch(() => { })
    } catch { }
  }, [])

  const isQuotaReached =
    subscription &&
    subscription.monthly_submissions_used >=
    subscription.monthly_submissions_limit

  const showUpgradeBanner = React.useMemo(() => {
    const level = subscription?.permission_level
    const page = Number(paginationData?.currentPage)
    if (!level || !page) return false

    if (level === 'FREE' && (page === 1 || page === 2)) return true
    if (level === 'PRO' && page > 1) return true

    return false
  }, [subscription?.permission_level, paginationData?.currentPage])

  const bannerContent = React.useMemo(() => {
    const level = subscription?.permission_level
    if (level === 'FREE') {
      return {
        text: 'Upgrade to Pro to unlock more monthly runs, accelerators and faster processing.',
      }
    }
    if (level === 'PRO') {
      return {
        text: 'Upgrade to Max to access our full database and advanced agent capabilities.',
      }
    }
    return null
  }, [subscription?.permission_level])

  // Defer rendering to keep pagination snappy
  const deferredAccelerators = React.useDeferredValue(accelerators)
  const filteredAccelerators = React.useMemo(
    () => deferredAccelerators,
    [deferredAccelerators],
  )

  const handleSort = React.useCallback(
    (key: string) => {
      playClickSound()
      onSortChange(key)
    },
    [onSortChange, playClickSound],
  )

  React.useEffect(() => {
    if (!user?.id || !startupId) return

    const fetchQueueStatus = async () => {
      try {
        const response = await fetch('/api/queue/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, startupId }),
        })
        if (response.ok) setQueueStatus(await response.json())
      } catch {
        // console.error('Failed to fetch queue status:', error)
      }
    }

    fetchQueueStatus()
    const interval = setInterval(fetchQueueStatus, 30000)
    return () => clearInterval(interval)
  }, [user?.id, startupId])

  // const getSubmissionTypeColor = React.useCallback((type: string) => {
  //   switch (type) {
  //     case 'form':
  //       return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
  //     case 'email':
  //       return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
  //     case 'other':
  //       return 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
  //     default:
  //       return 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
  //   }
  // }, [])

  const getRegionColor = React.useCallback((region: string) => {
    if (['Global', 'Emerging Markets'].includes(region)) {
      return 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
    }
    // North America - includes country-level variants
    if (['North America', 'United States', 'Canada'].includes(region)) {
      return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
    }
    // Europe - includes country-level variants
    if (
      [
        'Europe',
        'Western Europe',
        'Eastern Europe',
        'Continental Europe',
        'UK',
        'France',
        'Netherlands',
        'Sweden',
      ].includes(region)
    ) {
      return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
    }
    // Asia - includes country-level variants
    if (
      [
        'Asia',
        'East Asia',
        'South Asia',
        'South East Asia',
        'India',
        'China',
        'Japan',
        'Korea',
      ].includes(region)
    ) {
      return 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
    }
    if (['LATAM', 'South America'].includes(region)) {
      return 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800'
    }
    // Africa/Middle East/EMEA - includes country-level variants
    if (
      [
        'Africa',
        'Middle East',
        'EMEA',
        'Nigeria',
        'Kenya',
        'Egypt',
        'Senegal',
        'South Africa',
      ].includes(region)
    ) {
      return 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
    }
    // Oceania - includes country-level variants
    if (['Oceania', 'Australia'].includes(region)) {
      return 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800'
    }
    return 'bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
  }, [])

  const getRegionIconColor = React.useCallback((region: string) => {
    if (['Global', 'Emerging Markets'].includes(region)) {
      return [0.08, 0.55, 0.82] as [number, number, number]
    }
    // North America - includes country-level variants
    if (['North America', 'United States', 'Canada'].includes(region)) {
      return [0.133, 0.773, 0.369] as [number, number, number]
    }
    // Europe - includes country-level variants
    if (
      [
        'Europe',
        'Western Europe',
        'Eastern Europe',
        'Continental Europe',
        'UK',
        'France',
        'Netherlands',
        'Sweden',
      ].includes(region)
    ) {
      return [0.583, 0.278, 0.824] as [number, number, number]
    }
    // Asia - includes country-level variants
    if (
      [
        'Asia',
        'East Asia',
        'South Asia',
        'South East Asia',
        'India',
        'China',
        'Japan',
        'Korea',
      ].includes(region)
    ) {
      return [0.918, 0.435, 0.071] as [number, number, number]
    }
    if (['LATAM', 'South America'].includes(region)) {
      return [0.925, 0.314, 0.604] as [number, number, number]
    }
    // Africa/Middle East/EMEA - includes country-level variants
    if (
      [
        'Africa',
        'Middle East',
        'EMEA',
        'Nigeria',
        'Kenya',
        'Egypt',
        'Senegal',
        'South Africa',
      ].includes(region)
    ) {
      return [0.059, 0.735, 0.616] as [number, number, number]
    }
    // Oceania - includes country-level variants
    if (['Oceania', 'Australia'].includes(region)) {
      return [0.031, 0.678, 0.827] as [number, number, number]
    }
    return [0.467, 0.467, 0.467] as [number, number, number]
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
        return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
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

  const getIndustryColor = React.useCallback((industry: string) => {
    // Physical/hardware/deep science industries
    if (
      [
        'Deep tech',
        'Healthcare',
        'Medtech',
        'Climate',
        'Environment',
        'Proptech',
        'Logistics',
        'Agriculture',
        'Automotive',
        'Robotics',
        'Biotechnology',
        'Construction',
        'Energy',
        'Hardware',
        'Manufacturing',
        'Mining',
        'Advanced Materials',
        'Biofuels',
        'Nanotechnology',
        'Real estate',
        'IoT',
        'Telecommunications',
        'Transportation',
        'Aerospace',
        'Pharmaceuticals',
      ].includes(industry)
    ) {
      return 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
    }
    // Default blue for software/digital/service industries
    return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
  }, [])

  const getDocumentBadge = React.useCallback((docType: string) => {
    switch (docType) {
      case 'pitch_deck':
        return {
          label: 'Deck',
          animation: animations.fileplus,
          color:
            'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
          customColor: [1.0, 0.451, 0.102] as [number, number, number],
        }
      case 'video':
        return {
          label: 'Demo',
          animation: animations.ratio,
          color:
            'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
          customColor: [0.924, 0.314, 0.604] as [number, number, number],
        }
      case 'financials':
        return {
          label: 'Financials',
          animation: animations.cash,
          color:
            'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
          customColor: [0.059, 0.735, 0.467] as [number, number, number],
        }
      case 'business_plan':
        return {
          label: 'Business Plan',
          animation: animations.work,
          color:
            'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
          customColor: [0.08, 0.55, 0.82] as [number, number, number],
        }
      default:
        return {
          label: docType.replace('_', ' '),
          animation: animations.fileplus,
          color:
            'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800',
          customColor: [0.467, 0.467, 0.467] as [number, number, number],
        }
    }
  }, [])

  const capitalizeFirst = React.useCallback((str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }, [])

  const getEquityDisplay = (equity: string) => {
    if (!equity) return ''
    if (equity === 'variable') return 'Variable'
    return equity.replace('-', ' — ')
  }

  const getEquityColor = React.useCallback(() => {
    return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
  }, [])

  const getFundingDisplay = (funding: string) => {
    if (!funding) return ''
    return funding.replace('-', ' — ')
  }

  const getFundingColor = React.useCallback(() => {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
  }, [])

  const handleApplyForm = React.useCallback(
    async (acceleratorId: string, acceleratorName: string) => {
      if (!user?.id) {
        toast({
          title: 'Error',
          description: 'You must be logged in to submit applications',
          variant: 'destructive',
        })
        return
      }

      if (isQuotaReached) {
        toast({
          title: 'Limit reached',
          description: `You have used ${subscription?.monthly_submissions_used} of your ${subscription?.monthly_submissions_limit} monthly submissions.`,
          variant: 'default',
        })
        return
      }

      if (submittingAccelerators.has(acceleratorId)) return

      playClickSound()
      setSubmittingAccelerators(
        (prev) => new Set(Array.from(prev).concat(acceleratorId)),
      )

      try {
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
          description: `Adding application to ${acceleratorName} to processing queue...`,
        })

        const response = await fetch('/api/agent/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startupId,
            targetId: acceleratorId,
            userId: user.id,
            targetType: 'accelerator',
          }),
        })

        const result = await response.json()
        if (!response.ok)
          throw new Error(result.error || 'Failed to submit application')

        if (result.success) {
          if (result.status === 'queued') {
            toast({
              title: 'Added to queue',
              variant: 'success',
              description: `Application to ${acceleratorName} added to queue at position ${result.queuePosition}`,
            })
          } else {
            toast({
              title: 'Processing started',
              variant: 'info',
              duration: 4000,
              description: `Application to ${acceleratorName} is now being processed`,
            })
          }
        } else {
          toast({
            title: 'Application failed',
            description: result.error || 'Failed to submit application',
            variant: 'destructive',
          })
        }
      } catch {
        // console.error('Application submission error:', error)
        toast({
          title: 'Error',
          description: 'Failed to submit application',
          variant: 'destructive',
        })
      } finally {
        setSubmittingAccelerators((prev) => {
          const newSet = new Set(prev)
          newSet.delete(acceleratorId)
          return newSet
        })
      }
    },
    [
      user?.id,
      startupId,
      submittingAccelerators,
      toast,
      queueStatus,
      isQuotaReached,
      subscription,
      playClickSound,
    ],
  )

  const handleSendEmail = React.useCallback(
    (email: string | undefined) => {
      if (!email) return
      playClickSound()
      window.open(`mailto:${email}`, '_blank')
    },
    [playClickSound],
  )

  const handleLearnMore = React.useCallback(
    (applicationUrl?: string) => {
      if (!applicationUrl) return
      playClickSound()
      window.open(applicationUrl, '_blank')
    },
    [playClickSound],
  )

  return (
    <TooltipProvider>
      <div
        className="h-full flex flex-col"
        onCopy={(e: React.ClipboardEvent) => e.preventDefault()}
        onCut={(e: React.ClipboardEvent) => e.preventDefault()}
        onPaste={(e: React.ClipboardEvent) => e.preventDefault()}
        onDragStart={(e: React.DragEvent) => e.preventDefault()}
        onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
      >
        <div className="flex-1 min-h-0">
          {filteredAccelerators.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-sm border border-dashed shadow-sm min-h-[75vh]">
              <div className="flex flex-col items-center gap-6 text-center max-w-md">
                <div className="relative w-48 h-48">
                  <Image
                    src="/placeholder/empty_timeline.webp"
                    alt="No matching accelerators"
                    fill
                    className="object-contain opacity-80"
                    priority
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full rounded-sm border overflow-hidden flex flex-col max-h-[75vh]">
              <div
                className="flex-1 overflow-auto hide-scrollbar"
                data-scroll-preserve="accelerators-table-scroll"
              >
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10 border-b">
                    <TableRow>
                      <TableHead className="w-[280px] pl-4">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center hover:text-foreground transition-colors font-medium"
                        >
                          Name
                        </button>
                      </TableHead>
                      {columnVisibility.region && (
                        <TableHead className="w-[120px]">
                          <button
                            onClick={() => handleSort('region_focus')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Region
                          </button>
                        </TableHead>
                      )}
                      {columnVisibility.focus && (
                        <TableHead className="w-[120px]">
                          <button
                            onClick={() => handleSort('stage_focus')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Focus
                          </button>
                        </TableHead>
                      )}
                      {columnVisibility.industry && (
                        <TableHead className="w-[120px]">
                          <button
                            onClick={() => handleSort('industry_focus')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Industry
                          </button>
                        </TableHead>
                      )}
                      {/* {columnVisibility.type && (
                        <TableHead className="w-[90px]">
                          <button
                            onClick={() => handleSort('submission_type')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Type
                          </button>
                        </TableHead>
                      )} */}
                      {columnVisibility.programType && (
                        <TableHead className="w-[100px]">
                          <button
                            onClick={() => handleSort('program_type')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Program
                          </button>
                        </TableHead>
                      )}
                      {columnVisibility.equity && (
                        <TableHead className="w-[100px]">
                          <button
                            onClick={() => handleSort('equity_taken')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Equity
                          </button>
                        </TableHead>
                      )}
                      {columnVisibility.funding && (
                        <TableHead className="w-[110px]">
                          <button
                            onClick={() => handleSort('funding_provided')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Funding
                          </button>
                        </TableHead>
                      )}
                      {columnVisibility.requirements && (
                        <TableHead className="w-[140px]">
                          <button
                            onClick={() => handleSort('required_documents')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Requirements
                          </button>
                        </TableHead>
                      )}
                      <TableHead className="text-right w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccelerators.map((accelerator) => (
                      <TableRow
                        key={accelerator.id}
                        className="cursor-pointer hover:bg-sidebar-accent/30 hover:text-sidebar-accent-foreground/80 transition-colors duration-200"
                        onClick={() => {
                          playClickSound()
                          onAcceleratorClick?.(accelerator)
                        }}
                        onMouseEnter={() => onAcceleratorHover?.(accelerator)}
                        onMouseLeave={() => onAcceleratorLeave?.()}
                      >
                        <TableCell className="font-medium p-2 pl-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {accelerator.website ? (
                                <a
                                  href={accelerator.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-foreground hover:text-foreground hover:underline"
                                >
                                  {accelerator.name}
                                </a>
                              ) : (
                                <span className="font-medium">
                                  {accelerator.name}
                                </span>
                              )}
                            </div>
                            {accelerator.notes && (
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {accelerator.notes}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        {columnVisibility.region && (
                          <TableCell className="p-2">
                            <div className="flex flex-wrap gap-1">
                              {accelerator.region_focus
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
                              {accelerator.region_focus &&
                                accelerator.region_focus.length > 2 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge className="rounded-sm bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs cursor-help">
                                        +{accelerator.region_focus.length - 2}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-background text-foreground border border-border rounded-sm shadow-md px-3 py-2 before:hidden after:hidden [&>svg]:hidden [&>*[role='presentation']]:hidden">
                                      <div className="space-y-1">
                                        {accelerator.region_focus
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
                              {accelerator.stage_focus
                                ?.slice(0, 2)
                                .map((stage) => (
                                  <Badge
                                    key={stage}
                                    className={`rounded-sm ${getStageColor(stage)} text-xs`}
                                  >
                                    {stage}
                                  </Badge>
                                ))}
                              {accelerator.stage_focus &&
                                accelerator.stage_focus.length > 2 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge className="rounded-sm bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs cursor-help">
                                        +{accelerator.stage_focus.length - 2}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-background text-foreground border border-border rounded-sm shadow-md px-3 py-2 before:hidden after:hidden [&>svg]:hidden [&>*[role='presentation']]:hidden">
                                      <div className="space-y-1">
                                        {accelerator.stage_focus
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
                              {accelerator.industry_focus
                                ?.slice(0, 2)
                                .map((industry) => (
                                  <Badge
                                    key={industry}
                                    className={`rounded-sm ${getIndustryColor(industry)} text-xs`}
                                  >
                                    {industry}
                                  </Badge>
                                ))}
                              {accelerator.industry_focus &&
                                accelerator.industry_focus.length > 2 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge className="rounded-sm bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs cursor-help">
                                        +{accelerator.industry_focus.length - 2}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-background text-foreground border border-border rounded-sm shadow-md px-3 py-2 before:hidden after:hidden [&>svg]:hidden [&>*[role='presentation']]:hidden">
                                      <div className="space-y-1">
                                        {accelerator.industry_focus
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
                        {/* {columnVisibility.type && (
                          <TableCell className="p-2">
                            <Badge
                              className={`rounded-sm text-xs ${getSubmissionTypeColor(accelerator.submission_type)}`}
                            >
                              {capitalizeFirst(accelerator.submission_type)}
                            </Badge>
                          </TableCell>
                        )} */}
                        {columnVisibility.programType &&
                          accelerator.program_type && (
                            <TableCell className="p-2">
                              <Badge
                                className={`rounded-sm text-xs ${getStageColor(capitalizeFirst(accelerator.program_type))}`}
                              >
                                {capitalizeFirst(accelerator.program_type)}
                              </Badge>
                            </TableCell>
                          )}
                        {columnVisibility.equity &&
                          accelerator.equity_taken && (
                            <TableCell className="p-2">
                              <Badge
                                className={`rounded-sm ${getEquityColor()} text-xs`}
                              >
                                {getEquityDisplay(accelerator.equity_taken)}
                              </Badge>
                            </TableCell>
                          )}
                        {columnVisibility.funding &&
                          accelerator.funding_provided && (
                            <TableCell className="p-2">
                              <Badge
                                className={`rounded-sm ${getFundingColor()} text-xs`}
                              >
                                {getFundingDisplay(
                                  accelerator.funding_provided,
                                )}
                              </Badge>
                            </TableCell>
                          )}
                        {columnVisibility.requirements && (
                          <TableCell className="p-2">
                            <div className="flex flex-wrap gap-1">
                              {accelerator.required_documents
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
                              {accelerator.required_documents &&
                                accelerator.required_documents.length > 2 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge className="rounded-sm bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs cursor-help">
                                        +
                                        {accelerator.required_documents.length -
                                          2}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-background text-foreground border border-border rounded-sm shadow-md px-3 py-2 before:hidden after:hidden [&>svg]:hidden [&>*[role='presentation']]:hidden">
                                      <div className="space-y-1">
                                        {accelerator.required_documents
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
                        {/* Render other cells with badges and tooltips */}
                        <TableCell className="text-right p-2">
                          <div
                            className="flex justify-end mr-[6.5px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {accelerator.submission_type === 'form' && (
                              <ValidationGate
                                requirements={
                                  VALIDATION_PRESETS.BASIC_APPLICATION
                                }
                                onValidationPass={() =>
                                  handleApplyForm(
                                    accelerator.id,
                                    accelerator.name,
                                  )
                                }
                              >
                                <Button
                                  size="sm"
                                  disabled={
                                    submittingAccelerators.has(
                                      accelerator.id,
                                    ) ||
                                    (queueStatus
                                      ? !queueStatus.canSubmitMore
                                      : false)
                                  }
                                  onMouseEnter={() =>
                                    setHoveredButton(`apply-${accelerator.id}`)
                                  }
                                  onMouseLeave={() => setHoveredButton(null)}
                                  className={`rounded-sm w-8 h-8 disabled:opacity-50 disabled:cursor-not-allowed ${isQuotaReached
                                      ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-pointer'
                                      : queueStatus &&
                                        !queueStatus.canSubmitMore
                                        ? 'bg-gray-50 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
                                        : queueStatus &&
                                          queueStatus.availableSlots === 0
                                          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800'
                                          : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800'
                                    }`}
                                  title={
                                    isQuotaReached
                                      ? `You have reached your monthly submission limit of ${subscription?.monthly_submissions_limit}.`
                                      : queueStatus &&
                                        !queueStatus.canSubmitMore
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
                                      submittingAccelerators.has(accelerator.id)
                                        ? animations.autorenew
                                        : isQuotaReached
                                          ? animations.cross
                                          : queueStatus &&
                                            !queueStatus.canSubmitMore
                                            ? animations.cross
                                            : queueStatus &&
                                              queueStatus.availableSlots === 0
                                              ? animations.hourglass
                                              : animations.takeoff
                                    }
                                    size={14}
                                    className=""
                                    isHovered={
                                      hoveredButton ===
                                      `apply-${accelerator.id}` &&
                                      !submittingAccelerators.has(
                                        accelerator.id,
                                      ) &&
                                      !isQuotaReached &&
                                      queueStatus?.canSubmitMore !== false
                                    }
                                    customColor={
                                      isQuotaReached
                                        ? ([0.918, 0.435, 0.071] as [
                                          number,
                                          number,
                                          number,
                                        ])
                                        : undefined
                                    }
                                  />
                                </Button>
                              </ValidationGate>
                            )}
                            {accelerator.submission_type === 'email' &&
                              accelerator.application_email && (
                                <ValidationGate
                                  requirements={
                                    VALIDATION_PRESETS.BASIC_APPLICATION
                                  }
                                  onValidationPass={() =>
                                    handleSendEmail(
                                      accelerator.application_email,
                                    )
                                  }
                                >
                                  <Button
                                    size="sm"
                                    onMouseEnter={() =>
                                      setHoveredButton(
                                        `email-${accelerator.id}`,
                                      )
                                    }
                                    onMouseLeave={() => setHoveredButton(null)}
                                    className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-800 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-800 rounded-sm px-3 text-sm h-8 cursor-pointer"
                                  >
                                    Email
                                  </Button>
                                </ValidationGate>
                              )}
                            {accelerator.submission_type === 'other' && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleLearnMore(accelerator.application_url)
                                }
                                onMouseEnter={() =>
                                  setHoveredButton(`learn-${accelerator.id}`)
                                }
                                onMouseLeave={() => setHoveredButton(null)}
                                className="bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900/40 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-sm px-3 text-sm h-8 cursor-pointer"
                              >
                                Learn
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {showUpgradeBanner && bannerContent && (
                <Link
                  href={`/dashboard/${startupId}/settings/billing`}
                  className="w-full"
                >
                  {/* Banner content */}
                </Link>
              )}
              {paginationData &&
                paginationData.totalCount > paginationData.limit && (
                  <div className="flex items-center justify-between border-t border-border px-4 py-2 bg-background">
                    <div className="flex-1 text-sm text-muted-foreground">
                      <span className="hidden md:inline">
                        Showing {offset + 1} to {offset + accelerators.length}{' '}
                        of {paginationData.totalCount} accelerators
                      </span>
                      <span className="md:hidden">
                        Page {paginationData.currentPage} of{' '}
                        {Math.ceil(
                          paginationData.totalCount / paginationData.limit,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        onClick={() => {
                          playClickSound()
                          onPreviousPage()
                        }}
                        disabled={offset === 0}
                      >
                        <span className="sr-only">Previous page</span>
                        <ChevronLeftIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        onClick={() => {
                          playClickSound()
                          onNextPage()
                        }}
                        disabled={!paginationData.hasMore}
                      >
                        <span className="sr-only">Next page</span>
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
})

export default AcceleratorsTable
