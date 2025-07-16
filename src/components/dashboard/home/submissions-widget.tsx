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
  agent_notes?: string
}

interface SubmissionCardProps {
  className?: string
  submission: SubmissionData
}

const statusStyles: {
  [key in SubmissionStatus]: { badge: string; text: string }
} = {
  pending: {
    badge:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    text: 'text-amber-600 dark:text-amber-400',
  },
  in_progress: {
    badge:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
  },
  completed: {
    badge:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  failed: {
    badge:
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    text: 'text-red-600 dark:text-red-400',
  },
}

const typeStyles: {
  [key in SubmittedToType]: string
} = {
  Fund: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  Angel:
    'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  Accelerator:
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
}

const SubmissionCard = ({ className, submission }: SubmissionCardProps) => {
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
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{displayDate}</span>
          <span className="text-gray-400">•</span>
          <span>{displayTime}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col justify-between gap-y-4 pb-6 flex-1">
        <div>
          <h3 className="font-semibold text-lg leading-tight text-foreground">
            {submission.submitted_to_name}
          </h3>
          {submission.agent_notes && (
            <p className="text-sm text-muted-foreground mt-2 italic">
              &quot;{submission.agent_notes}&quot;
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <Badge
            variant="outline"
            className={twMerge(
              'text-xs font-medium py-1.5 px-3 translate-y-4',
              statusStyle.badge,
            )}
          >
            {submission.status.replace('_', ' ')}
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
      <Card className={twMerge('h-full min-h-[367px] rounded-sm', className)}>
        <div className="flex h-full flex-col items-center justify-center p-6 space-y-4">
          <Image
            src="/placeholder/loading_accounts.webp"
            alt="No submissions found"
            width={200}
            height={200}
            className="object-contain"
          />
          <p className="text-muted-foreground text-sm">No submissions yet</p>
        </div>
      </Card>
    )
  }

  // For 1 submission, show a single card filling the space
  if (submissions.length === 1) {
    return (
      <SubmissionCard
        submission={submissions[0]}
        className={twMerge('h-full min-h-[367px]', className)}
      />
    )
  }

  // For 2 submissions, show them in a grid layout
  if (submissions.length === 2) {
    return (
      <div
        className={twMerge(
          'grid h-full min-h-[367px] grid-rows-2 gap-4',
          className,
        )}
      >
        {submissions.map((submission: SubmissionData) => (
          <SubmissionCard
            key={submission.submission_id}
            submission={submission}
            className="h-full w-full"
          />
        ))}
      </div>
    )
  }

  // For 3+ submissions, use the stacking layout
  const stackingClassNames = [
    'top-0 left-1/2 -translate-x-1/2 scale-100 z-30',
    'top-5 left-1/2 -translate-x-1/2 scale-95 z-20',
    'top-10 left-1/2 -translate-x-1/2 scale-90 z-10',
  ]

  return (
    <div className={twMerge('relative h-full min-h-[367px] p-4', className)}>
      {submissions
        .slice(0, 3)
        .map((submission: SubmissionData, index: number) => (
          <div
            key={submission.submission_id}
            className={twMerge(
              stackingClassNames[index],
              'absolute w-[calc(100%-2rem)]',
            )}
          >
            <SubmissionCard submission={submission} />
          </div>
        ))}
    </div>
  )
}
