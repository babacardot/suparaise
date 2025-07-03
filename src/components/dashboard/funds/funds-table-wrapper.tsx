'use client'

import React from 'react'
import FundsTable from './funds-table'
import { FundsFilters } from './funds-filters'

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
  created_at: string
  updated_at: string
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
  isLoading: boolean
  onPreviousPage: () => void
  onNextPage: () => void
  filters: FundsFilters
  onFiltersChange: (filters: FundsFilters) => void
  sortConfig: { key: string | null; direction: 'asc' | 'desc' }
  onSortChange: (key: string) => void
}

const FundsTableWrapper = React.memo(function FundsTableWrapper({
  targets,
  startupId,
  paginationData,
  offset,
  isLoading,
  onPreviousPage,
  onNextPage,
  filters,
  onFiltersChange,
  sortConfig,
  onSortChange,
}: FundsTableWrapperProps) {
  return (
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
        filters={filters}
        onFiltersChange={onFiltersChange}
        startupId={startupId}
        paginationData={paginationData}
        offset={offset}
        isLoading={isLoading}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        sortConfig={sortConfig}
        onSortChange={onSortChange}
      />
    </div>
  )
})

export default FundsTableWrapper
