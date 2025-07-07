'use client'

import React from 'react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'

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

type ApplicationsActionsProps = {
    submission: ApplicationSubmission | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onRetry?: (submission: ApplicationSubmission) => void
    isRetrying?: boolean
}

export default React.memo(function ApplicationsActions({
    submission,
    isOpen,
    onOpenChange,
    onRetry,
    isRetrying = false,
}: ApplicationsActionsProps) {
    const getSubmissionTypeColor = (type: string) => {
        switch (type) {
            case 'form':
                return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            case 'email':
                return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
            case 'other':
                return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
            default:
                return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
        }
    }

    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case 'simple':
                return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
            case 'standard':
                return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
            case 'comprehensive':
                return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            default:
                return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            case 'failed':
                return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            case 'in_progress':
                return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
            default:
                return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
        }
    }

    const getTypeColor = (type: SubmissionType) => {
        switch (type) {
            case 'Fund':
                return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            case 'Angel':
                return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
            case 'Accelerator':
                return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
            default:
                return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
        }
    }

    const getStageColor = (stage: string) => {
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
    }

    const getIndustryColor = (industry: string) => {
        // Industries with a strong physical or hardware component
        if (
            [
                'Deep tech',
                'Healthtech',
                'Climate tech',
                'PropTech',
                'Logistics',
            ].includes(industry)
        ) {
            return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
        }
        // Default blue for software/digital industries
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
    }

    const getRegionColor = (region: string) => {
        // Global and Emerging Markets - Sky
        if (['Global', 'Emerging Markets'].includes(region)) {
            return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
        }
        // North America - Green
        if (region === 'North America') {
            return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
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
            return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
        }
        // Asia - Orange
        if (
            ['Asia', 'East Asia', 'South Asia', 'South East Asia'].includes(region)
        ) {
            return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
        }
        // Latin America - Pink
        if (['LATAM', 'South America'].includes(region)) {
            return 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
        }
        // Africa, Middle East, and EMEA - Teal
        if (['Africa', 'Middle East', 'EMEA'].includes(region)) {
            return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
        }
        // Oceania - Cyan
        if (region === 'Oceania') {
            return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
        }
        // Default
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
    }

    const getRequiredDocumentColor = (doc: string) => {
        if (doc === 'pitch_deck')
            return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
        if (doc === 'video')
            return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        if (doc === 'financial_projections')
            return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
        if (doc === 'traction_data')
            return 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
        if (doc === 'business_plan')
            return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
    }

    const getRequirementLabel = (value: string) => {
        const labels: Record<string, string> = {
            pitch_deck: 'Deck',
            video: 'Video',
            financial_projections: 'Financials',
            business_plan: 'Business Plan',
            traction_data: 'Traction',
        }
        return labels[value] || value.replace(/_/g, ' ')
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const capitalizeFirst = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    const formatTimeline = () => {
        if (!submission) return []

        const timeline = []

        // Submission date
        timeline.push({
            date: submission.submission_date,
            label: 'Submitted',
            status: 'completed'
        })

        // Queued date
        if (submission.queued_at) {
            timeline.push({
                date: submission.queued_at,
                label: 'Queued',
                status: 'completed'
            })
        }

        // Started date
        if (submission.started_at) {
            timeline.push({
                date: submission.started_at,
                label: 'Started',
                status: 'completed'
            })
        }

        // Current status
        if (submission.status === 'completed') {
            timeline.push({
                date: submission.updated_at,
                label: 'Completed',
                status: 'completed'
            })
        } else if (submission.status === 'failed') {
            timeline.push({
                date: submission.updated_at,
                label: 'Failed',
                status: 'failed'
            })
        }

        return timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }

    if (!submission) return null

    const timeline = formatTimeline()

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md w-full p-0 sm:m-4 h-full sm:h-[calc(100%-2rem)] rounded-sm sm:rounded-sm border-0 sm:border shadow-lg bg-background overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-200">
                <Card className="border-0 shadow-none rounded-sm sm:rounded-sm h-full flex flex-col">
                    <CardHeader className="sticky top-0 z-10 bg-background border-b px-4 -py-8 flex flex-row items-center justify-between flex-shrink-0">
                        <SheetTitle className="text-base font-medium">
                            {submission.submitted_to_name}
                        </SheetTitle>
                        <button
                            onMouseDown={() => onOpenChange(false)}
                            className="text-muted-foreground hover:text-foreground sm:hidden"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 overflow-auto flex-1 text-xs">
                        <div className="space-y-3 pl-4 pr-2 sm:px-0">
                            {/* Basic Info */}
                            <div
                                className="flex items-center justify-between"
                                style={{ marginTop: '-15px' }}
                            >
                                <span className="text-muted-foreground">Type</span>
                                <Badge
                                    className={`rounded-sm text-[10px] font-normal ${getTypeColor(submission.submitted_to_type)}`}
                                >
                                    {submission.submitted_to_type}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <Badge
                                    className={`rounded-sm text-[10px] font-normal ${getStatusColor(submission.status)}`}
                                >
                                    {capitalizeFirst(submission.status.replace('_', ' '))}
                                </Badge>
                            </div>

                            {submission.submission_type && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Method</span>
                                    <Badge
                                        className={`rounded-sm text-[10px] font-normal ${getSubmissionTypeColor(submission.submission_type)}`}
                                    >
                                        {capitalizeFirst(submission.submission_type)}
                                    </Badge>
                                </div>
                            )}

                            {submission.form_complexity && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Complexity</span>
                                    <Badge
                                        className={`rounded-sm text-[10px] font-normal ${getComplexityColor(submission.form_complexity)}`}
                                    >
                                        {capitalizeFirst(submission.form_complexity)}
                                    </Badge>
                                </div>
                            )}

                            {submission.queue_position && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Queue Position</span>
                                    <span className="text-sm font-medium">#{submission.queue_position}</span>
                                </div>
                            )}

                            {submission.agent_notes && (
                                <div className="space-y-2">
                                    <span className="text-muted-foreground">Agent Notes</span>
                                    <p className="text-xs text-black dark:text-white pt-2 p-2 bg-muted/30 rounded-sm">
                                        {submission.agent_notes}
                                    </p>
                                </div>
                            )}

                            <Separator />

                            {/* Links */}
                            <div className="space-y-2">
                                <span className="text-muted-foreground">Links</span>
                                <div className="space-y-1">
                                    {submission.website_url && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs">Website</span>
                                            <a
                                                href={submission.website_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                                            >
                                                Visit
                                            </a>
                                        </div>
                                    )}
                                    {submission.application_url && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs">Application</span>
                                            <a
                                                href={submission.application_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                                            >
                                                View Form
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Focus Areas */}
                            {submission.stage_focus && submission.stage_focus.length > 0 && (
                                <div className="flex items-start justify-between">
                                    <span className="text-muted-foreground pt-1">Stage Focus</span>
                                    <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                                        {submission.stage_focus.map((stage) => (
                                            <Badge
                                                key={stage}
                                                className={`rounded-sm text-[10px] ${getStageColor(stage)}`}
                                            >
                                                {stage}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {submission.industry_focus && submission.industry_focus.length > 0 && (
                                <div className="flex items-start justify-between">
                                    <span className="text-muted-foreground pt-1">Industry</span>
                                    <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                                        {submission.industry_focus.map((industry) => (
                                            <Badge
                                                key={industry}
                                                className={`rounded-sm text-[10px] ${getIndustryColor(industry)}`}
                                            >
                                                {industry}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {submission.region_focus && submission.region_focus.length > 0 && (
                                <div className="flex items-start justify-between">
                                    <span className="text-muted-foreground pt-1">Region</span>
                                    <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                                        {submission.region_focus.map((region) => (
                                            <Badge
                                                key={region}
                                                className={`rounded-sm text-[10px] ${getRegionColor(region)}`}
                                            >
                                                {region}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {submission.required_documents &&
                                submission.required_documents.length > 0 && (
                                    <div className="flex items-start justify-between">
                                        <span className="text-muted-foreground pt-1">
                                            Requirements
                                        </span>
                                        <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                                            {submission.required_documents.map((doc) => (
                                                <Badge
                                                    key={doc}
                                                    className={`rounded-sm text-[10px] ${getRequiredDocumentColor(doc)}`}
                                                >
                                                    {getRequirementLabel(doc)}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            <Separator />

                            {/* Timeline */}
                            {timeline.length > 0 && (
                                <section>
                                    <h3 className="text-sm font-medium mb-3">Timeline</h3>
                                    <div className="space-y-3">
                                        {timeline.map((event, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${event.status === 'completed'
                                                        ? 'bg-green-500'
                                                        : event.status === 'failed'
                                                            ? 'bg-red-500'
                                                            : 'bg-gray-300'
                                                    }`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-medium">{event.label}</span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {formatDate(event.date)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Actions */}
                            {submission.status === 'failed' && onRetry && (
                                <>
                                    <Separator />
                                    <div className="pt-2">
                                        <Button
                                            onClick={() => onRetry(submission)}
                                            disabled={isRetrying}
                                            className="w-full bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:text-orange-800 dark:hover:text-orange-200 border border-orange-200 dark:border-orange-800 rounded-sm h-8"
                                        >
                                            <LottieIcon
                                                animationData={isRetrying ? animations.autorenew : animations.refresh}
                                                size={14}
                                                className="mr-2"
                                            />
                                            {isRetrying ? 'Retrying...' : 'Retry Submission'}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </SheetContent>
        </Sheet>
    )
}) 