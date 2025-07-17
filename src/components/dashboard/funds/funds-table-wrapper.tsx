'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import FundsTable from './funds-table'
import FundsActions from './funds-actions'

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
  visibility_level?: 'FREE' | 'PRO' | 'MAX'
  created_at: string
  updated_at: string
  submission_status?: 'pending' | 'in_progress' | 'completed' | 'failed'
  submission_started_at?: string
  queue_position?: number
}

type Submission = {
  id: string
  submission_date: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  agent_notes?: string
  queue_position?: number
  queued_at?: string
  started_at?: string
  updated_at?: string
}

interface ColumnVisibility {
  region: boolean
  focus: boolean
  industry: boolean
  requirements: boolean
  type: boolean
}

interface FundsTableWrapperProps {
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
  onTargetUpdate?: (targetId: string, updates: Partial<Target>) => void
}

const FundsTableWrapper = React.memo(function FundsTableWrapper({
  targets,
  startupId,
  paginationData,
  offset,
  onPreviousPage,
  onNextPage,
  onSortChange,
  columnVisibility,
  onTargetUpdate,
}: FundsTableWrapperProps) {
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null)
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])

  // Fetch submissions when target is selected
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!selectedTarget) {
        setSubmissions([])
        return
      }

      try {
        const supabase = createSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('submissions')
          .select(
            'id, status, submission_date, agent_notes, queue_position, queued_at, started_at, updated_at',
          )
          .eq('startup_id', startupId)
          .eq('target_id', selectedTarget.id)
          .order('submission_date', { ascending: false })

        if (error) {
          console.error('Error fetching submissions:', error)
          setSubmissions([])
        } else {
          setSubmissions(data as Submission[])
        }
      } catch (error) {
        console.error('Submission fetch error:', error)
        setSubmissions([])
      }
    }

    fetchSubmissions()
  }, [selectedTarget, startupId])

  const handleTargetHover = useCallback(
    (target: Target) => {
      if (!isActionsOpen) {
        setSelectedTarget(target)
      }
    },
    [isActionsOpen],
  )

  const handleTargetLeave = useCallback(() => {
    if (!isActionsOpen) {
      setSelectedTarget(null)
    }
  }, [isActionsOpen])

  const handleTargetClick = useCallback((target: Target) => {
    setSelectedTarget(target)
    setIsActionsOpen(true)
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    setIsActionsOpen(open)
    if (!open) {
      setTimeout(() => {
        setSelectedTarget(null)
      }, 300) // Animation duration
    }
  }, [])

  // Mock submissions data - this would come from your API in real implementation

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
        <FundsTable
          targets={targets}
          startupId={startupId}
          paginationData={paginationData}
          offset={offset}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
          onSortChange={onSortChange}
          columnVisibility={columnVisibility}
          onTargetClick={handleTargetClick}
          onTargetHover={handleTargetHover}
          onTargetLeave={handleTargetLeave}
          onTargetUpdate={onTargetUpdate}
        />
      </div>

      <FundsActions
        target={selectedTarget}
        submissions={submissions}
        isOpen={isActionsOpen}
        onOpenChange={handleOpenChange}
      />
    </>
  )
})

export default FundsTableWrapper
