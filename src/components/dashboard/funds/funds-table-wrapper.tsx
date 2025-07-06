'use client'

import React, { useState, useCallback } from 'react'
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
}: FundsTableWrapperProps) {
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null)
  const [isActionsOpen, setIsActionsOpen] = useState(false)

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
  const mockSubmissions = selectedTarget ? [] : []

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
        />
      </div>

      <FundsActions
        target={selectedTarget}
        submissions={mockSubmissions}
        isOpen={isActionsOpen}
        onOpenChange={handleOpenChange}
      />
    </>
  )
})

export default FundsTableWrapper
