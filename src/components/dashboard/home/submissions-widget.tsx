'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { twMerge } from 'tailwind-merge'
import Image from 'next/image'

type SubmissionStatus = 'pending' | 'in_progress' | 'completed' | 'failed'
type SubmittedToType = 'Fund' | 'Angel' | 'Accelerator'

export interface SubmissionData {
  submission_id: string
  submitted_at: string
  submitted_to_name: string
  submitted_to_type: SubmittedToType
  status: SubmissionStatus
  website_url?: string
  entity_id: string
  // Additional detailed fields for enhanced display
  submission_type?: 'form' | 'email' | 'other'
  form_complexity?: 'simple' | 'standard' | 'comprehensive'
  queue_position?: number
  queued_at?: string
  started_at?: string
}

interface SubmissionCardProps {
  className?: string
  submission: SubmissionData
  showDetails?: boolean // New prop to control whether to show additional details
}

const statusStyles: {
  [key in SubmissionStatus]: { badge: string; text: string }
} = {
  pending: {
    badge:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    text: 'text-amber-600 dark:text-amber-400',
  },
  in_progress: {
    badge:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
  },
  completed: {
    badge:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  failed: {
    badge:
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800',
    text: 'text-red-600 dark:text-red-400',
  },
}

const typeStyles: {
  [key in SubmittedToType]: string
} = {
  Fund: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-800',
  Angel:
    'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
  Accelerator:
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800',
}

const SubmissionCard = ({
  className,
  submission,
  showDetails = false,
}: SubmissionCardProps) => {
  const createdAtDate = new Date(submission.submitted_at)
  const displayDate = createdAtDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })
  const displayTime = createdAtDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  })
  const statusStyle = statusStyles[submission.status]
  const typeStyle = typeStyles[submission.submitted_to_type]

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
      case 'standard':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
      case 'comprehensive':
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
    }
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return (
    <Card
      className={twMerge(
        'rounded-sm h-full flex flex-col shadow-sm',
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between bg-transparent pb-4">
        <Badge
          variant="outline"
          className={twMerge('text-xs font-medium py-1.5 px-3', typeStyle)}
        >
          {submission.submitted_to_type}
        </Badge>
        <div className="flex items-center gap-2 text-xs text-foreground/80">
          <span>{displayDate}</span>
          <span className="text-gray-400">•</span>
          <span>{displayTime}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col justify-between gap-y-4 pb-6 flex-1">
        <div className="space-y-3">
          <h3 className="font-semibold text-base md:text-lg leading-tight text-foreground">
            {submission.submitted_to_name}
          </h3>

          {/* Additional details section - only shown when showDetails is true */}
          {showDetails && (
            <div className="space-y-3 text-sm">
              {/* Show complexity badge without "form" suffix */}
              {submission.form_complexity && (
                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={`text-xs rounded-sm ${getComplexityColor(submission.form_complexity)}`}
                  >
                    {capitalizeFirst(submission.form_complexity)}
                  </Badge>
                </div>
              )}

              {/* Queue information */}
              {submission.queue_position && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Queue #{submission.queue_position}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Badge
            variant="outline"
            className={twMerge(
              'text-xs font-medium py-1.5 px-3',
              statusStyle.badge,
            )}
          >
            {capitalizeFirst(submission.status.replace('_', ' '))}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export interface SubmissionsWidgetProps {
  className?: string
  submissions: SubmissionData[]
  isLoading: boolean
}

export function SubmissionsWidget({
  className,
  submissions,
  isLoading,
}: SubmissionsWidgetProps) {
  if (isLoading) {
    return (
      <Card className={twMerge('h-full min-h-[320px] rounded-sm', className)}>
        <div className="flex h-full flex-col items-center justify-center p-6"></div>
      </Card>
    )
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card
        className={twMerge(
          'h-full min-h-[280px] md:min-h-[367px] rounded-sm',
          className,
        )}
      >
        <div className="flex h-full flex-col items-center justify-center p-4 md:p-6 translate-y-10 md:translate-y-20 space-y-4">
          <Image
            src="/placeholder/loading_accounts.webp"
            alt="No submissions found"
            width={200}
            height={200}
            className="object-contain"
          />
        </div>
      </Card>
    )
  }

  // For 1 submission, show a single card filling the space
  if (submissions.length === 1) {
    return (
      <SubmissionCard
        submission={submissions[0]}
        className={twMerge('h-full min-h-[280px] md:min-h-[367px]', className)}
        showDetails={true} // Pass showDetails={true} for single card layout
      />
    )
  }

  // For 2 submissions, show them in a grid layout
  if (submissions.length === 2) {
    return (
      <Card
        className={twMerge(
          'h-full min-h-[280px] md:min-h-[367px] rounded-sm',
          className,
        )}
      >
        <CardContent className="p-3 md:p-4 h-full">
          <div className="grid h-full grid-rows-2 gap-3 md:gap-4">
            {submissions.map((submission: SubmissionData) => (
              <SubmissionCard
                key={submission.submission_id}
                submission={submission}
                className="h-full w-full"
                showDetails={false} // Don't show details for multi-card layout
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // For 3+ submissions, use the stacking layout
  const stackingClassNames = [
    'top-0 left-1/2 -translate-x-1/2 scale-100 z-30',
    'top-5 left-1/2 -translate-x-1/2 scale-95 z-20',
    'top-10 left-1/2 -translate-x-1/2 scale-90 z-10',
  ]

  return (
    <Card
      className={twMerge(
        'relative h-full min-h-[280px] md:min-h-[367px] rounded-sm p-3 md:p-4',
        className,
      )}
    >
      {submissions
        .slice(0, 3)
        .map((submission: SubmissionData, index: number) => (
          <div
            key={submission.submission_id}
            className={twMerge(
              stackingClassNames[index],
              'absolute w-[calc(100%-1.5rem)] md:w-[calc(100%-2rem)]',
            )}
          >
            <SubmissionCard
              submission={submission}
              showDetails={false} // Don't show details for stacked layout
            />
          </div>
        ))}
    </Card>
  )
}
