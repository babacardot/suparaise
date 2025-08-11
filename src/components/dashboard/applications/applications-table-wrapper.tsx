'use client'

import React, { useState, useCallback } from 'react'
import ApplicationsTable from './applications-table'
import ApplicationsActions from './applications-actions'

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

interface ColumnVisibility {
  status: boolean
  type: boolean
  date: boolean
  notes: boolean
}

interface ApplicationsTableWrapperProps {
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
  onRetrySubmission: (submission: ApplicationSubmission) => Promise<void>
  isRetrying: boolean
  columnVisibility: ColumnVisibility
}

const ApplicationsTableWrapper = React.memo(function ApplicationsTableWrapper({
  submissions,
  startupId,
  paginationData,
  offset,
  onPreviousPage,
  onNextPage,
  onSortChange,
  onRetrySubmission,
  isRetrying,
  columnVisibility,
}: ApplicationsTableWrapperProps) {
  const [selectedSubmission, setSelectedSubmission] =
    useState<ApplicationSubmission | null>(null)
  const [isActionsOpen, setIsActionsOpen] = useState(false)

  const handleSubmissionHover = useCallback(
    (submission: ApplicationSubmission) => {
      if (!isActionsOpen) {
        setSelectedSubmission(submission)
      }
    },
    [isActionsOpen],
  )

  const handleSubmissionLeave = useCallback(() => {
    if (!isActionsOpen) {
      setSelectedSubmission(null)
    }
  }, [isActionsOpen])

  const handleSubmissionClick = useCallback(
    (submission: ApplicationSubmission) => {
      setSelectedSubmission(submission)
      setIsActionsOpen(true)
    },
    [],
  )

  const handleOpenChange = useCallback((open: boolean) => {
    setIsActionsOpen(open)
    if (!open) {
      setTimeout(() => {
        setSelectedSubmission(null)
      }, 300) // Animation duration
    }
  }, [])

  return (
    <>
      <div
        className="h-full"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
      >
        <ApplicationsTable
          submissions={submissions}
          startupId={startupId}
          paginationData={paginationData}
          offset={offset}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
          onSortChange={onSortChange}
          onSubmissionClick={handleSubmissionClick}
          onSubmissionHover={handleSubmissionHover}
          onSubmissionLeave={handleSubmissionLeave}
          columnVisibility={columnVisibility}
        />
      </div>

      <ApplicationsActions
        submission={selectedSubmission}
        isOpen={isActionsOpen}
        onOpenChange={handleOpenChange}
        onRetry={onRetrySubmission}
        isRetrying={isRetrying}
      />
    </>
  )
})

export default ApplicationsTableWrapper
