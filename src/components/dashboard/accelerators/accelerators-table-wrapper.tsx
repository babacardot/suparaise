'use client'

import React, { useState, useCallback } from 'react'
import AcceleratorsTable from './accelerators-table'
import AcceleratorsActions from './accelerators-actions'

type Accelerator = {
  id: string
  name: string
  website?: string
  application_url?: string
  application_email?: string
  submission_type: 'form' | 'email' | 'other'
  program_type?: 'in-person' | 'remote' | 'hybrid'
  program_duration?: string
  location?: string
  is_remote_friendly?: boolean
  batch_size?: string
  batches_per_year?: number
  next_application_deadline?: string
  stage_focus?: string[]
  industry_focus?: string[]
  region_focus?: string[]
  equity_taken?: string
  funding_provided?: string
  acceptance_rate?: string
  form_complexity?: 'simple' | 'standard' | 'comprehensive'
  required_documents?: string[]
  program_fee?: number
  is_active?: boolean
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
  programType: boolean
  equity: boolean
  funding: boolean
}

interface AcceleratorsTableWrapperProps {
  accelerators: Accelerator[]
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

const AcceleratorsTableWrapper = React.memo(function AcceleratorsTableWrapper({
  accelerators,
  startupId,
  paginationData,
  offset,
  onPreviousPage,
  onNextPage,
  onSortChange,
  columnVisibility,
}: AcceleratorsTableWrapperProps) {
  const [selectedAccelerator, setSelectedAccelerator] =
    useState<Accelerator | null>(null)
  const [isActionsOpen, setIsActionsOpen] = useState(false)

  const handleAcceleratorHover = useCallback(
    (accelerator: Accelerator) => {
      if (!isActionsOpen) {
        setSelectedAccelerator(accelerator)
      }
    },
    [isActionsOpen],
  )

  const handleAcceleratorLeave = useCallback(() => {
    if (!isActionsOpen) {
      setSelectedAccelerator(null)
    }
  }, [isActionsOpen])

  const handleAcceleratorClick = useCallback((accelerator: Accelerator) => {
    setSelectedAccelerator(accelerator)
    setIsActionsOpen(true)
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    setIsActionsOpen(open)
    if (!open) {
      setTimeout(() => {
        setSelectedAccelerator(null)
      }, 300) // Animation duration
    }
  }, [])

  // Mock submissions data
  const mockSubmissions = selectedAccelerator ? [] : []

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
        <AcceleratorsTable
          accelerators={accelerators}
          startupId={startupId}
          paginationData={paginationData}
          offset={offset}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
          onSortChange={onSortChange}
          columnVisibility={columnVisibility}
          onAcceleratorClick={handleAcceleratorClick}
          onAcceleratorHover={handleAcceleratorHover}
          onAcceleratorLeave={handleAcceleratorLeave}
        />
      </div>

      <AcceleratorsActions
        accelerator={selectedAccelerator}
        submissions={mockSubmissions}
        isOpen={isActionsOpen}
        onOpenChange={handleOpenChange}
      />
    </>
  )
})

export default AcceleratorsTableWrapper
