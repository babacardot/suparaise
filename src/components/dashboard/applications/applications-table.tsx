'use client'

import React from 'react'
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
import Image from 'next/image'

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

interface ApplicationsTableProps {
    submissions: ApplicationSubmission[]
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
    onSubmissionClick?: (submission: ApplicationSubmission) => void
    onSubmissionHover?: (submission: ApplicationSubmission) => void
    onSubmissionLeave?: () => void
}

const ApplicationsTable = React.memo(function ApplicationsTable({
    submissions,
    paginationData,
    offset,
    onPreviousPage,
    onNextPage,
    onSortChange,
    onSubmissionClick,
    onSubmissionHover,
    onSubmissionLeave,
}: ApplicationsTableProps) {
    // Memoize color functions
    const getStatusColor = React.useCallback((status: SubmissionStatus) => {
        switch (status) {
            case 'completed':
                return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
            case 'failed':
                return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            case 'in_progress':
                return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            case 'pending':
                return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
            default:
                return 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
        }
    }, [])

    const getTypeColor = React.useCallback((type: SubmissionType) => {
        switch (type) {
            case 'Fund':
                return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            case 'Angel':
                return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
            case 'Accelerator':
                return 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
            default:
                return 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
        }
    }, [])

    const handleSort = React.useCallback(
        (key: string) => {
            onSortChange(key)
        },
        [onSortChange],
    )

    const formatDate = React.useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }, [])

    const capitalizeFirst = React.useCallback((str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1)
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
                <div className="flex-1 min-h-0">
                    {submissions.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center rounded-sm border border-dashed shadow-sm min-h-[75vh]">
                            <div className="flex flex-col items-center gap-6 text-center max-w-md">
                                <div className="relative w-48 h-48">
                                    <Image
                                        src="/placeholder/no_file.webp"
                                        alt="No applications found"
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
                                data-scroll-preserve="applications-table-scroll"
                            >
                                <Table>
                                    <TableHeader className="sticky top-0 bg-background z-10 border-b">
                                        <TableRow>
                                            <TableHead className="w-[180px]">
                                                <button
                                                    onClick={() => handleSort('submitted_to_name')}
                                                    className="flex items-center hover:text-foreground transition-colors font-medium"
                                                >
                                                    Applied To
                                                </button>
                                            </TableHead>
                                            <TableHead className="w-[100px]">
                                                <button
                                                    onClick={() => handleSort('type')}
                                                    className="flex items-center hover:text-foreground transition-colors font-medium"
                                                >
                                                    Type
                                                </button>
                                            </TableHead>
                                            <TableHead className="w-[120px]">
                                                <button
                                                    onClick={() => handleSort('status')}
                                                    className="flex items-center hover:text-foreground transition-colors font-medium"
                                                >
                                                    Status
                                                </button>
                                            </TableHead>
                                            <TableHead className="w-[150px]">
                                                <button
                                                    onClick={() => handleSort('submission_date')}
                                                    className="flex items-center hover:text-foreground transition-colors font-medium"
                                                >
                                                    Submitted
                                                </button>
                                            </TableHead>
                                            <TableHead className="w-[200px]">Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {submissions.map((submission) => (
                                            <TableRow
                                                key={submission.submission_id}
                                                className="cursor-pointer hover:bg-sidebar-accent/30 hover:text-sidebar-accent-foreground/80 transition-colors duration-200"
                                                onClick={() => onSubmissionClick?.(submission)}
                                                onMouseEnter={() => onSubmissionHover?.(submission)}
                                                onMouseLeave={() => onSubmissionLeave?.()}
                                            >
                                                <TableCell className="font-medium p-2">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            {submission.website_url ? (
                                                                <a
                                                                    href={submission.website_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="font-medium text-foreground hover:text-foreground hover:underline"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {submission.submitted_to_name}
                                                                </a>
                                                            ) : (
                                                                <span className="font-medium">
                                                                    {submission.submitted_to_name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {submission.queue_position && (
                                                            <p className="text-[11px] text-muted-foreground">
                                                                Queue position: {submission.queue_position}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <Badge
                                                        className={`rounded-sm text-xs ${getTypeColor(submission.submitted_to_type)}`}
                                                    >
                                                        {submission.submitted_to_type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <Badge
                                                        className={`rounded-sm text-xs ${getStatusColor(submission.status)}`}
                                                    >
                                                        {capitalizeFirst(submission.status.replace('_', ' '))}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium">
                                                            {formatDate(submission.submission_date)}
                                                        </div>
                                                        {submission.started_at && submission.started_at !== submission.submission_date && (
                                                            <div className="text-[11px] text-muted-foreground">
                                                                Started: {formatDate(submission.started_at)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    {submission.agent_notes && (
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                                                                    {submission.agent_notes}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[300px]">
                                                                <div className="text-xs whitespace-pre-wrap">
                                                                    {submission.agent_notes}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Pagination Controls */}
                            {paginationData &&
                                paginationData.totalCount > paginationData.limit && (
                                    <div className="flex items-center justify-between border-t border-border px-4 py-2 bg-background">
                                        <div className="flex-1 text-sm text-muted-foreground">
                                            <span className="hidden md:inline">
                                                Showing {offset + 1} to {offset + submissions.length} of{' '}
                                                {paginationData.totalCount} applications
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
                                                onClick={onPreviousPage}
                                                disabled={offset === 0}
                                            >
                                                <span className="sr-only">Previous page</span>
                                                <ChevronLeftIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0 rounded-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                                onClick={onNextPage}
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

export default ApplicationsTable 