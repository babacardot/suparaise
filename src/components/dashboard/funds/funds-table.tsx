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
  form_type?: 'contact' | 'typeform' | 'google' | 'generic'
  visibility_level?: 'FREE' | 'PRO' | 'MAX'
  created_at: string
  updated_at: string
  submission_status?: 'pending' | 'in_progress' | 'completed' | 'failed'
  submission_started_at?: string
  queue_position?: number
  submission_id?: string
  agent_notes?: string
}

interface FundsTableProps {
  targets: Target[]
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
  onTargetClick?: (target: Target) => void
  onTargetHover?: (target: Target) => void
  onTargetLeave?: () => void
  onTargetUpdate?: (targetId: string, updates: Partial<Target>) => void
}

interface ColumnVisibility {
  region: boolean
  focus: boolean
  industry: boolean
  requirements: boolean
  type: boolean
}

const FundsTable = React.memo(function FundsTable({
  targets,
  startupId,
  paginationData,
  offset,
  onPreviousPage,
  onNextPage,
  onSortChange,
  columnVisibility,
  onTargetClick,
  onTargetHover,
  onTargetLeave,
  onTargetUpdate,
}: FundsTableProps) {
  const { user, subscription } = useUser()
  const { toast } = useToast()
  const [hoveredButton, setHoveredButton] = React.useState<string | null>(null)
  const [submittingTargets, setSubmittingTargets] = React.useState<Set<string>>(
    new Set(),
  )
  const [pollingSubmissions, setPollingSubmissions] = React.useState<
    Set<string>
  >(new Set())
  const playClickSound = React.useCallback(() => {
    try {
      const audio = new Audio('/sounds/light.mp3')
      audio.volume = 0.4
      void audio.play().catch(() => {})
    } catch {}
  }, [])
  // Scroll management: reset to top on page change
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null)
  const previousPageRef = React.useRef<number | null>(null)
  React.useEffect(() => {
    const currentPage = Number(paginationData?.currentPage ?? 1)
    if (
      previousPageRef.current !== null &&
      previousPageRef.current !== currentPage
    ) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0
      }
    }
    previousPageRef.current = currentPage
  }, [paginationData?.currentPage])

  const isQuotaReached =
    subscription &&
    subscription.monthly_submissions_used >=
      subscription.monthly_submissions_limit

  const [queueStatus, setQueueStatus] = React.useState<{
    maxParallel: number
    maxQueue: number
    currentInProgress: number
    currentQueued: number
    availableSlots: number
    availableQueueSlots: number
    canSubmitMore: boolean
  } | null>(null)

  const showUpgradeBanner = React.useMemo(() => {
    const level = subscription?.permission_level
    const page = Number(paginationData?.currentPage)
    if (!level || !page) return false

    // With 150 free funds and 100 per page, free results can appear on pages 1 and 2
    if (level === 'FREE' && (page === 1 || page === 2)) return true
    if (level === 'PRO' && page > 1) return true

    return false
  }, [subscription?.permission_level, paginationData?.currentPage])

  const bannerContent = React.useMemo(() => {
    const level = subscription?.permission_level
    if (level === 'FREE') {
      return {
        text: 'Upgrade to Pro to unlock 20 applications per month, accelerators, and faster processing.',
      }
    }
    if (level === 'PRO') {
      return {
        text: 'Upgrade to Max for 50 monthly applications, full database access, advanced agent capabilities, and analytics.',
      }
    }
    return null
  }, [subscription?.permission_level])

  // Memoize the filtered targets to prevent unnecessary recalculations
  // Defer heavy table rendering when inputs change to keep page switches snappy
  const deferredTargets = React.useDeferredValue(targets)
  const filteredTargets = React.useMemo(
    () => deferredTargets,
    [deferredTargets],
  )

  const handleSort = React.useCallback(
    (key: string) => {
      playClickSound()
      onSortChange(key)
    },
    [onSortChange, playClickSound],
  )

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

  // Poll for status of in-progress submissions
  React.useEffect(() => {
    const submissionsToPoll = filteredTargets.filter(
      (t) => t.submission_status === 'in_progress' && t.submission_id,
    )

    if (submissionsToPoll.length === 0) {
      return
    }

    const poll = async (submissionId: string) => {
      try {
        const response = await fetch('/api/submission/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submissionId }),
        })

        if (response.ok) {
          const data = await response.json()
          if (
            data.status === 'completed' ||
            data.status === 'failed' ||
            data.status !== 'in_progress'
          ) {
            onTargetUpdate?.(data.id, {
              submission_status: data.status,
              agent_notes: data.agent_notes,
            })
            // Stop polling for this submission
            setPollingSubmissions((prev) => {
              const newSet = new Set(prev)
              newSet.delete(submissionId)
              return newSet
            })
          }
        }
      } catch (error) {
        console.error(`Polling failed for submission ${submissionId}:`, error)
      }
    }

    const intervalIds = submissionsToPoll.map((target) => {
      if (pollingSubmissions.has(target.submission_id!)) {
        return null // Already polling this one
      }
      setPollingSubmissions((prev) => new Set(prev).add(target.submission_id!))
      return setInterval(() => poll(target.submission_id!), 5000) // Poll every 5 seconds
    })

    return () => {
      intervalIds.forEach((id) => {
        if (id) clearInterval(id)
      })
    }
  }, [filteredTargets, onTargetUpdate, pollingSubmissions])

  // Memoize color functions to prevent recreation on every render
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
    // Global and Emerging Markets - Sky
    if (['Global', 'Emerging Markets'].includes(region)) {
      return 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
    }
    // North America - Green (includes country-level variants)
    if (['North America', 'United States', 'Canada'].includes(region)) {
      return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
    }
    // Europe - Purple (includes common country-level variants)
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
    // Asia - Orange (includes country-level variants)
    if (
      [
        'Asia',
        'East Asia',
        'South Asia',
        'South East Asia',
        'India',
        'China',
        'Japan',
      ].includes(region)
    ) {
      return 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
    }
    // Latin America - Pink
    if (['LATAM', 'South America'].includes(region)) {
      return 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800'
    }
    // Africa, Middle East, and EMEA - Teal (includes country-level variants)
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
    // Australia - Cyan
    if (['Australia'].includes(region)) {
      return 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800'
    }
    // Default
    return 'bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
  }, [])

  const getRegionIconColor = React.useCallback((region: string) => {
    // Global and Emerging Markets - Sky
    if (['Global', 'Emerging Markets'].includes(region)) {
      return [0.08, 0.55, 0.82] as [number, number, number] // sky-600
    }
    // North America - Green (includes country-level variants)
    if (['North America', 'United States', 'Canada'].includes(region)) {
      return [0.133, 0.773, 0.369] as [number, number, number] // green-600
    }
    // Europe - Purple (includes common country-level variants)
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
      return [0.583, 0.278, 0.824] as [number, number, number] // purple-600
    }
    // Asia - Orange (includes country-level variants)
    if (
      [
        'Asia',
        'East Asia',
        'South Asia',
        'South East Asia',
        'India',
        'China',
        'Japan',
      ].includes(region)
    ) {
      return [0.918, 0.435, 0.071] as [number, number, number] // orange-600
    }
    // Latin America - Pink
    if (['LATAM', 'South America'].includes(region)) {
      return [0.925, 0.314, 0.604] as [number, number, number] // pink-600
    }
    // Africa, Middle East, and EMEA - Teal (includes country-level variants)
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
      return [0.059, 0.735, 0.616] as [number, number, number] // teal-600
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
    // Industries with a strong physical/hardware or deep science component
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
          customColor: [1.0, 0.451, 0.102] as [number, number, number], // orange-600
        }
      case 'video':
        return {
          label: 'Demo',
          animation: animations.ratio,
          color:
            'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
          customColor: [0.924, 0.314, 0.604] as [number, number, number], // pink-600
        }
      case 'financials':
        return {
          label: 'Financials',
          animation: animations.cash,
          color:
            'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
          customColor: [0.059, 0.735, 0.467] as [number, number, number], // emerald-600
        }
      case 'business_plan':
        return {
          label: 'Business Plan',
          animation: animations.work,
          color:
            'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
          customColor: [0.08, 0.55, 0.82] as [number, number, number], // sky-600
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

  // const capitalizeFirst = React.useCallback((str: string) => {
  //   return str.charAt(0).toUpperCase() + str.slice(1)
  // }, [])

  // Extract the first sentence (ending with ., !, or ?) for lightweight table display
  const extractFirstSentence = React.useCallback((text: string) => {
    const trimmed = (text || '').trim()
    if (!trimmed) return ''
    const match = trimmed.match(/(.+?[.!?])(\s|$)/)
    return match ? match[1] : trimmed
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

      if (isQuotaReached) {
        toast({
          title: 'Limit reached',
          description: `You have used ${subscription?.monthly_submissions_used} of your ${subscription?.monthly_submissions_limit} monthly submissions.`,
          variant: 'default',
        })
        return
      }

      if (submittingTargets.has(targetId)) {
        return // Already submitting
      }

      playClickSound()
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

          // Update target state to reflect new submission status immediately
          onTargetUpdate?.(targetId, {
            submission_status:
              result.status === 'queued' ? 'pending' : 'in_progress',
            queue_position: result.queuePosition,
            submission_started_at:
              result.status === 'queued' ? undefined : new Date().toISOString(),
          })

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
    [
      user?.id,
      startupId,
      submittingTargets,
      toast,
      queueStatus,
      onTargetUpdate,
      subscription,
      isQuotaReached,
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
    (applicationUrl: string) => {
      playClickSound()
      window.open(applicationUrl, '_blank')
    },
    [playClickSound],
  )

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
        <div className="flex-1 min-h-0">
          {filteredTargets.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-sm border border-dashed shadow-sm min-h-[75vh]">
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
            <div className="h-full rounded-sm border overflow-hidden flex flex-col max-h-[75vh]">
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-auto hide-scrollbar"
                data-scroll-preserve="funds-table-scroll"
              >
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10 border-b">
                    <TableRow>
                      <TableHead className="w-[260px] pl-4">
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
                            onClick={() => handleSort('region')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Region
                          </button>
                        </TableHead>
                      )}
                      {columnVisibility.focus && (
                        <TableHead className="w-[120px]">
                          <button
                            onClick={() => handleSort('focus')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Focus
                          </button>
                        </TableHead>
                      )}
                      {columnVisibility.industry && (
                        <TableHead className="w-[120px]">
                          <button
                            onClick={() => handleSort('industry')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Industry
                          </button>
                        </TableHead>
                      )}
                      {/* {columnVisibility.type && (
                        <TableHead className="w-[90px]">
                          <button
                            onClick={() => handleSort('type')}
                            className="flex items-center hover:text-foreground transition-colors font-medium"
                          >
                            Type
                          </button>
                        </TableHead>
                      )} */}
                      {columnVisibility.requirements && (
                        <TableHead className="w-[140px]">
                          <button
                            onClick={() => handleSort('requirements')}
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
                    {filteredTargets.map((target) => (
                      <TableRow
                        key={target.id}
                        className="cursor-pointer hover:bg-sidebar-accent/30 hover:text-sidebar-accent-foreground/80 transition-colors duration-200"
                        onClick={() => {
                          playClickSound()
                          onTargetClick?.(target)
                        }}
                        onMouseEnter={() => onTargetHover?.(target)}
                        onMouseLeave={() => onTargetLeave?.()}
                      >
                        <TableCell className="font-medium p-2 pl-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {target.website &&
                              subscription?.permission_level &&
                              ['PRO', 'MAX', 'ENTERPRISE'].includes(
                                subscription.permission_level,
                              ) ? (
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
                                {extractFirstSentence(target.notes)}
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
                                    className={`rounded-sm ${getIndustryColor(industry)} text-xs`}
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
                        {/* {columnVisibility.type && (
                          <TableCell className="p-2">
                            <Badge
                              className={`rounded-sm text-xs ${getSubmissionTypeColor(target.submission_type)}`}
                            >
                              {capitalizeFirst(target.submission_type)}
                            </Badge>
                          </TableCell>
                        )} */}
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

                        <TableCell className="text-right p-2">
                          <div
                            className="flex justify-end mr-[6.5px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {target.submission_type === 'form' &&
                              !target.submission_status && (
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
                                    className={`rounded-sm w-8 h-8 disabled:opacity-50 disabled:cursor-not-allowed ${
                                      isQuotaReached
                                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-pointer'
                                        : queueStatus &&
                                            !queueStatus.canSubmitMore
                                          ? 'bg-gray-50 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800' // Queue is full, show gray
                                          : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800' // Otherwise, show green
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
                                        submittingTargets.has(target.id)
                                          ? animations.autorenew // Show spinner when this specific one is being submitted
                                          : isQuotaReached
                                            ? animations.cross
                                            : queueStatus &&
                                                !queueStatus.canSubmitMore
                                              ? animations.cross // Show cross if no more submissions are possible at all
                                              : animations.takeoff // Default "apply" icon if submissions are possible (direct or queued)
                                      }
                                      size={14}
                                      className=""
                                      isHovered={
                                        hoveredButton ===
                                          `apply-${target.id}` &&
                                        !submittingTargets.has(target.id) &&
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
                            {target.submission_type === 'form' &&
                              target.submission_status && (
                                <div className="flex items-center justify-center w-8 h-8">
                                  {target.submission_status ===
                                  'in_progress' ? (
                                    <LottieIcon
                                      animationData={animations.hourglass}
                                      size={14}
                                      customColor={
                                        [0.918, 0.435, 0.071] as [
                                          number,
                                          number,
                                          number,
                                        ]
                                      } // orange-600
                                    />
                                  ) : target.submission_status === 'pending' &&
                                    target.queue_position ? (
                                    <span className="text-xs font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-sm px-1.5 py-0.5">
                                      {target.queue_position}
                                    </span>
                                  ) : target.submission_status ===
                                    'completed' ? (
                                    <LottieIcon
                                      animationData={animations.check}
                                      size={14}
                                      customColor={
                                        [0.133, 0.773, 0.369] as [
                                          number,
                                          number,
                                          number,
                                        ]
                                      } // green-600
                                    />
                                  ) : target.submission_status === 'failed' ? (
                                    <LottieIcon
                                      animationData={animations.cross}
                                      size={14}
                                      customColor={
                                        [0.924, 0.314, 0.604] as [
                                          number,
                                          number,
                                          number,
                                        ]
                                      } // red-600
                                    />
                                  ) : target.submission_status === 'pending' ? (
                                    <LottieIcon
                                      animationData={animations.hourglass}
                                      size={14}
                                      customColor={
                                        [0.918, 0.435, 0.071] as [
                                          number,
                                          number,
                                          number,
                                        ]
                                      } // orange-600
                                    />
                                  ) : null}
                                </div>
                              )}
                            {target.submission_type === 'email' &&
                              target.application_email &&
                              !target.submission_status && (
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
                                    className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-800 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-800 rounded-sm px-3 text-sm h-8 cursor-pointer"
                                  >
                                    Email
                                  </Button>
                                </ValidationGate>
                              )}
                            {target.submission_type === 'email' &&
                              target.submission_status && (
                                <div className="flex items-center justify-center w-8 h-8">
                                  {target.submission_status === 'completed' ? (
                                    <LottieIcon
                                      animationData={animations.check}
                                      size={14}
                                      customColor={
                                        [0.133, 0.773, 0.369] as [
                                          number,
                                          number,
                                          number,
                                        ]
                                      } // green-600
                                    />
                                  ) : target.submission_status === 'failed' ? (
                                    <LottieIcon
                                      animationData={animations.cross}
                                      size={14}
                                      customColor={
                                        [0.924, 0.314, 0.604] as [
                                          number,
                                          number,
                                          number,
                                        ]
                                      } // red-600
                                    />
                                  ) : target.submission_status === 'pending' ||
                                    target.submission_status ===
                                      'in_progress' ? (
                                    <LottieIcon
                                      animationData={animations.hourglass}
                                      size={14}
                                      customColor={
                                        [0.918, 0.435, 0.071] as [
                                          number,
                                          number,
                                          number,
                                        ]
                                      } // orange-600
                                    />
                                  ) : null}
                                </div>
                              )}
                            {target.submission_type === 'other' &&
                              !target.submission_status && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleLearnMore(target.application_url)
                                  }
                                  onMouseEnter={() =>
                                    setHoveredButton(`learn-${target.id}`)
                                  }
                                  onMouseLeave={() => setHoveredButton(null)}
                                  className="bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900/40 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-sm px-3 text-sm h-8 cursor-pointer"
                                >
                                  Learn
                                </Button>
                              )}
                            {target.submission_type === 'other' &&
                              target.submission_status && (
                                <div className="flex items-center justify-center w-8 h-8">
                                  {target.submission_status === 'completed' ? (
                                    <LottieIcon
                                      animationData={animations.check}
                                      size={14}
                                      customColor={
                                        [0.133, 0.773, 0.369] as [
                                          number,
                                          number,
                                          number,
                                        ]
                                      } // green-600
                                    />
                                  ) : target.submission_status === 'failed' ? (
                                    <LottieIcon
                                      animationData={animations.cross}
                                      size={14}
                                      customColor={
                                        [0.924, 0.314, 0.604] as [
                                          number,
                                          number,
                                          number,
                                        ]
                                      } // red-600
                                    />
                                  ) : target.submission_status === 'pending' ||
                                    target.submission_status ===
                                      'in_progress' ? (
                                    <LottieIcon
                                      animationData={animations.hourglass}
                                      size={14}
                                      customColor={
                                        [0.918, 0.435, 0.071] as [
                                          number,
                                          number,
                                          number,
                                        ]
                                      } // orange-600
                                    />
                                  ) : null}
                                </div>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Upgrade Banner */}
              {showUpgradeBanner && bannerContent && (
                <Link
                  href={`/dashboard/${startupId}/settings/billing`}
                  className="w-full"
                >
                  <div className="relative overflow-hidden border-t border-border p-4 sm:p-6 min-h-[1.5rem] max-h-[1.5rem] flex items-center cursor-pointer hover:bg-muted/20 transition-colors">
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-[0.1] z-0"
                      style={{
                        backgroundImage: `url('/random/600x600.webp')`,
                      }}
                    />
                    <div className="absolute inset-0 z-10" />
                    <div className="relative z-20 flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <LottieIcon
                          animationData={animations.takeoff}
                          size={28}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {bannerContent.text}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
              {/* Pagination Controls */}
              {paginationData &&
                paginationData.totalCount > paginationData.limit && (
                  <div className="flex items-center justify-between border-t border-border px-4 py-2 bg-background">
                    <div className="flex-1 text-sm text-muted-foreground">
                      <span className="hidden md:inline">
                        Showing {offset + 1} to {offset + targets.length} of{' '}
                        {paginationData.totalCount} funds
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

export default FundsTable
