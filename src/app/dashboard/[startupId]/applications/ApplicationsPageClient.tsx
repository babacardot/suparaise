'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import ApplicationsTable from '@/components/dashboard/applications/applications-table'
import ApplicationsActions from '@/components/dashboard/applications/applications-actions'
import ApplicationsFilters, {
    ApplicationsFilters as ApplicationsFiltersType,
} from '@/components/dashboard/applications/applications-filters'
import { format } from 'date-fns'

type SubmissionStatus = 'pending' | 'in_progress' | 'completed' | 'failed'
type SubmissionType = 'Fund' | 'Angel' | 'Accelerator'

type ApplicationSubmission = {
    submission_id: string
    startup_id: string
    submitted_to_name: string
    submitted_to_type: SubmissionType
    submission_date: string
    status: SubmissionStatus
    agent_notes?: string
    queue_position?: number
    queued_at?: string
    started_at?: string
    website_url?: string
    entity_id: string
    application_url?: string
    submission_type?: 'form' | 'email' | 'other'
    form_complexity?: 'simple' | 'standard' | 'comprehensive'
    stage_focus?: string[]
    industry_focus?: string[]
    region_focus?: string[]
    required_documents?: string[]
    created_at: string
    updated_at: string
}

interface PaginationData {
    totalCount: number
    hasMore: boolean
    currentPage: number
    limit: number
}

interface ApplicationsPageClientProps {
    startupId: string
    initialSubmissions: ApplicationSubmission[]
    initialPaginationData: PaginationData | null
    initialFilters: Omit<ApplicationsFiltersType, 'dateRange'> & { dateFrom?: string, dateTo?: string }
    initialSortConfig: { key: string | null; direction: 'asc' | 'desc' }
}

export default function ApplicationsPageClient({
    startupId,
    initialSubmissions,
    initialPaginationData,
    initialFilters,
    initialSortConfig,
}: ApplicationsPageClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { user } = useUser()
    const { toast } = useToast()

    const [submissions, setSubmissions] = useState<ApplicationSubmission[]>(initialSubmissions)
    const [paginationData, setPaginationData] = useState(initialPaginationData)
    const [selectedSubmission, setSelectedSubmission] = useState<ApplicationSubmission | null>(null)
    const [isActionsOpen, setIsActionsOpen] = useState(false)
    const [retryingSubmissions, setRetryingSubmissions] = useState<Set<string>>(new Set())

    useEffect(() => {
        setSubmissions(initialSubmissions)
        setPaginationData(initialPaginationData)
    }, [initialSubmissions, initialPaginationData])

    const [filters, setFilters] = useState<ApplicationsFiltersType>({
        search: initialFilters.search || '',
        statusFilter: initialFilters.statusFilter || [],
        typeFilter: initialFilters.typeFilter || [],
        dateRange: {
            from: initialFilters.dateFrom ? new Date(initialFilters.dateFrom) : undefined,
            to: initialFilters.dateTo ? new Date(initialFilters.dateTo) : undefined,
        },
    })
    const [sortConfig, setSortConfig] = useState(initialSortConfig)

    const page = useMemo(
        () => Number(initialPaginationData?.currentPage ?? 1),
        [initialPaginationData],
    )

    const offset = useMemo(
        () => (page - 1) * (paginationData?.limit || 100),
        [page, paginationData],
    )

    // Prefetch the next page to make navigation feel faster
    useEffect(() => {
        if (paginationData?.hasMore) {
            const params = new URLSearchParams(searchParams.toString())
            params.set('page', String(page + 1))
            router.prefetch(`${pathname}?${params.toString()}`)
        }
    }, [page, paginationData, pathname, router, searchParams])

    const updateUrl = useCallback(
        (newParams: URLSearchParams) => {
            router.push(`${pathname}?${newParams.toString()}`, { scroll: false })
        },
        [pathname, router],
    )

    const handleFiltersChange = useCallback(
        (newFilters: ApplicationsFiltersType) => {
            setFilters(newFilters)
            const params = new URLSearchParams(searchParams.toString())
            params.set('page', '1')

            params.delete('search')
            params.delete('statusFilter')
            params.delete('typeFilter')
            params.delete('dateFrom')
            params.delete('dateTo')

            if (newFilters.search?.trim()) {
                params.set('search', newFilters.search.trim())
            }
            if (newFilters.statusFilter.length > 0) {
                newFilters.statusFilter.forEach((status) => params.append('statusFilter', status))
            }
            if (newFilters.typeFilter.length > 0) {
                newFilters.typeFilter.forEach((type) => params.append('typeFilter', type))
            }
            if (newFilters.dateRange?.from) {
                params.set('dateFrom', format(newFilters.dateRange.from, 'yyyy-MM-dd'))
            }
            if (newFilters.dateRange?.to) {
                params.set('dateTo', format(newFilters.dateRange.to, 'yyyy-MM-dd'))
            }

            updateUrl(params)
        },
        [searchParams, updateUrl],
    )

    const handleSortChange = useCallback(
        (key: string) => {
            const newDirection =
                sortConfig.key === key && sortConfig.direction === 'asc'
                    ? 'desc'
                    : 'asc'
            const newSortConfig = { key, direction: newDirection as 'asc' | 'desc' }
            setSortConfig(newSortConfig)

            const params = new URLSearchParams(searchParams.toString())
            params.set('sortBy', newSortConfig.key)
            params.set('sortDirection', newSortConfig.direction)
            updateUrl(params)
        },
        [sortConfig, searchParams, updateUrl],
    )

    const handlePreviousPage = useCallback(() => {
        if (page > 1) {
            const params = new URLSearchParams(searchParams.toString())
            params.set('page', String(page - 1))
            updateUrl(params)
        }
    }, [page, searchParams, updateUrl])

    const handleNextPage = useCallback(() => {
        if (paginationData?.hasMore) {
            const params = new URLSearchParams(searchParams.toString())
            params.set('page', String(page + 1))
            updateUrl(params)
        }
    }, [page, paginationData, searchParams, updateUrl])

    const clearFilters = useCallback(() => {
        const clearedFilters: ApplicationsFiltersType = {
            search: '',
            statusFilter: [],
            typeFilter: [],
            dateRange: {
                from: undefined,
                to: undefined,
            },
        }
        setFilters(clearedFilters)

        const params = new URLSearchParams(searchParams.toString())
        params.delete('search')
        params.delete('statusFilter')
        params.delete('typeFilter')
        params.delete('dateFrom')
        params.delete('dateTo')
        params.set('page', '1')
        updateUrl(params)
    }, [searchParams, updateUrl])

    const handleSubmissionClick = useCallback((submission: ApplicationSubmission) => {
        setSelectedSubmission(submission)
        setIsActionsOpen(true)
    }, [])

    const handleSubmissionHover = useCallback((submission: ApplicationSubmission) => {
        // TODO: Show submission preview tooltip
        console.log('Hovered submission:', submission)
    }, [])

    const handleSubmissionLeave = useCallback(() => {
        // TODO: Hide submission preview tooltip
    }, [])

    const handleRetrySubmission = useCallback(
        async (submission: ApplicationSubmission) => {
            if (!user?.id) {
                toast({
                    title: 'Error',
                    description: 'You must be logged in to retry submissions',
                    variant: 'destructive',
                })
                return
            }

            if (retryingSubmissions.has(submission.submission_id)) {
                return // Already retrying
            }

            setRetryingSubmissions((prev) => new Set(Array.from(prev).concat(submission.submission_id)))

            try {
                const response = await fetch('/api/agent/retry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        startupId,
                        submissionId: submission.submission_id,
                        submissionType: submission.submitted_to_type.toLowerCase(),
                        userId: user.id,
                    }),
                })

                const result = await response.json()

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to retry submission')
                }

                if (result.success) {
                    toast({
                        title: 'Submission retried',
                        description: `Successfully retried application to ${submission.submitted_to_name}`,
                        variant: 'success',
                    })
                    // Close the actions panel and refresh the page
                    setIsActionsOpen(false)
                    setSelectedSubmission(null)
                    window.location.reload()
                } else {
                    toast({
                        title: 'Retry failed',
                        description: result.error || 'Failed to retry submission',
                        variant: 'destructive',
                    })
                }
            } catch (error) {
                console.error('Retry submission error:', error)
                toast({
                    title: 'Error',
                    description:
                        error instanceof Error
                            ? error.message
                            : 'Failed to retry submission',
                    variant: 'destructive',
                })
            } finally {
                setRetryingSubmissions((prev) => {
                    const newSet = new Set(prev)
                    newSet.delete(submission.submission_id)
                    return newSet
                })
            }
        },
        [user?.id, startupId, retryingSubmissions, toast],
    )

    const handleActionsOpenChange = useCallback((open: boolean) => {
        setIsActionsOpen(open)
        if (!open) {
            setSelectedSubmission(null)
        }
    }, [])

    return (
        <div className="h-full flex flex-col overflow-hidden hide-scrollbar">
            <div className="flex-shrink-0 pb-4">
                <h1 className="text-3xl font-bold tracking-tight mt-1.5">
                    Applications
                </h1>
            </div>

            <ApplicationsFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={clearFilters}
            />

            <div className="flex-1 overflow-hidden hide-scrollbar">
                <ApplicationsTable
                    submissions={submissions}
                    startupId={startupId}
                    paginationData={paginationData}
                    offset={offset}
                    onPreviousPage={handlePreviousPage}
                    onNextPage={handleNextPage}
                    onSortChange={handleSortChange}
                    onSubmissionClick={handleSubmissionClick}
                    onSubmissionHover={handleSubmissionHover}
                    onSubmissionLeave={handleSubmissionLeave}
                />
            </div>

            <ApplicationsActions
                submission={selectedSubmission}
                isOpen={isActionsOpen}
                onOpenChange={handleActionsOpenChange}
                onRetry={handleRetrySubmission}
                isRetrying={selectedSubmission ? retryingSubmissions.has(selectedSubmission.submission_id) : false}
            />
        </div>
    )
} 