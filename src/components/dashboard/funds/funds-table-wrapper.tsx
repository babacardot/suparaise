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
}

const FILTERS_STORAGE_KEY = 'funds-table-filters'

const FundsTableWrapper = React.memo(function FundsTableWrapper({
  targets,
}: FundsTableWrapperProps) {
  // Initialize filters from localStorage if available
  const [filters, setFilters] = React.useState<FundsFilters>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY)
        if (savedFilters) {
          const parsed = JSON.parse(savedFilters)
          // Ensure backward compatibility - add requiredDocuments if missing
          return {
            submissionTypes: parsed.submissionTypes || [],
            stageFocus: parsed.stageFocus || [],
            industryFocus: parsed.industryFocus || [],
            regionFocus: parsed.regionFocus || [],
            formComplexity: parsed.formComplexity || [],
            requiredDocuments: parsed.requiredDocuments || [],
          }
        }
      } catch (error) {
        console.warn('Failed to load saved filters:', error)
      }
    }
    return {
      submissionTypes: [],
      stageFocus: [],
      industryFocus: [],
      regionFocus: [],
      formComplexity: [],
      requiredDocuments: [],
    }
  })

  // Persist filters to localStorage whenever they change
  const handleFiltersChange = React.useCallback((newFilters: FundsFilters) => {
    setFilters(newFilters)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters))
      } catch (error) {
        console.warn('Failed to save filters:', error)
      }
    }
  }, [])

  return (
    <div
      className="h-full"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
    >
      <FundsTable
        targets={targets}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  )
})

export default FundsTableWrapper
