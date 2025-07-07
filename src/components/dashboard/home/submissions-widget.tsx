'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ArrowUpRight } from 'lucide-react'
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
}

interface SubmissionCardProps {
  className?: string
  submission: SubmissionData
}

const statusStyles: {
  [key in SubmissionStatus]: { badge: string; text: string; dot: string }
} = {
  pending: {
    badge:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    text: 'text-yellow-600',
    dot: 'bg-yellow-500',
  },
  in_progress: {
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    text: 'text-blue-600',
    dot: 'bg-blue-500',
  },
  completed: {
    badge:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    text: 'text-green-600',
    dot: 'bg-green-500',
  },
  failed: {
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    text: 'text-red-600',
    dot: 'bg-red-500',
  },
}

const getEntityLink = (type: SubmittedToType, id: string): string => {
  switch (type) {
    case 'Fund':
      return `/dashboard/funds?view=${id}`
    case 'Angel':
      return `/dashboard/angels?view=${id}`
    case 'Accelerator':
      return `/dashboard/accelerators?view=${id}`
    default:
      return '#'
  }
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

  return (
    <Card
      className={twMerge('rounded-sm h-full flex flex-col relative', className)}
    >
      <CardHeader className="flex flex-row items-baseline justify-between bg-transparent pb-4 text-sm text-muted-foreground">
        <Badge
          variant="secondary"
          className="capitalize text-xs font-medium py-1 px-2"
        >
          {submission.submitted_to_type}
        </Badge>
        <div className="flex items-center gap-2">
          <span>{displayDate}</span>
          <span className="text-gray-400">•</span>
          <span>{displayTime}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-1 pb-4 text-lg flex-1">
        <h3 className="font-semibold text-base">
          {submission.submitted_to_name}
        </h3>
        <div className="flex items-center gap-2 text-sm capitalize">
          <div className={twMerge('h-2 w-2 rounded-sm', statusStyle.dot)} />
          <span className={statusStyle.text}>
            {submission.status.replace('_', ' ')}
          </span>
        </div>
      </CardContent>
      <CardFooter className="bg-background/50 dark:bg-background/30 m-2 flex flex-row items-center justify-between rounded-sm p-3 hover:bg-background/60 dark:hover:bg-background/40 transition-colors mt-auto">
        <Link
          href={getEntityLink(
            submission.submitted_to_type,
            submission.entity_id,
          )}
          className="font-medium text-sm text-blue-600 hover:underline"
        >
          Details
        </Link>
        {submission.website_url && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={submission.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visit Website</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardFooter>
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
  const stackingClassNames = [
    'top-0 left-1/2 -translate-x-1/2 scale-100 z-30',
    'top-5 left-1/2 -translate-x-1/2 scale-95 z-20',
    'top-10 left-1/2 -translate-x-1/2 scale-90 z-10',
  ]

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
        <div className="flex h-full flex-col items-center justify-center p-6 space-y-4 mt-20">
          <Image
            src="/placeholder/no_record.webp"
            alt="No submissions found"
            width={200}
            height={200}
            className="object-contain"
          />
        </div>
      </Card>
    )
  }

  return (
    <div className={twMerge('relative h-full min-h-[320px] p-4', className)}>
      {submissions.map((submission: SubmissionData, index: number) => (
        <div
          key={submission.submission_id}
          className={twMerge(
            stackingClassNames[index],
            'absolute w-[calc(100%-2rem)] border border-border/50 transition-all duration-300 will-change-transform hover:z-40 hover:scale-105 hover:-translate-y-2 rounded-sm',
          )}
        >
          <SubmissionCard submission={submission} />
        </div>
      ))}
    </div>
  )
}
