'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import FundsTableWrapper from '@/components/dashboard/funds/funds-table-wrapper'
import SecureFundsWrapper from '@/components/dashboard/funds/secure-funds-wrapper'
import { FundsFilters } from '@/components/dashboard/funds/funds-filters'

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

const PAGE_SIZE = 100
const FILTERS_STORAGE_KEY = 'funds-table-filters'
const SORT_STORAGE_KEY = 'funds-table-sort'

interface GetTargetsSimpleResponse {
  data: Target[]
  totalCount: number
  hasMore: boolean
  currentPage: number
  limit: number
}

export default function FundsPage({
  params,
}: {
  params: Promise<{ startupId: string }>
}) {
  const { startupId } = React.use(params)
  const [targets, setTargets] = useState<Target[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [paginationData, setPaginationData] = useState<{
    totalCount: number
    hasMore: boolean
    currentPage: number
    limit: number
  } | null>(null)

  const [filters, setFilters] = useState<FundsFilters>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY)
        if (savedFilters) {
          const parsed = JSON.parse(savedFilters)
          return {
            search: parsed.search || '',
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
      search: '',
      submissionTypes: [],
      stageFocus: [],
      industryFocus: [],
      regionFocus: [],
      formComplexity: [],
      requiredDocuments: [],
    }
  })

  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSort = localStorage.getItem(SORT_STORAGE_KEY)
        if (savedSort) {
          return JSON.parse(savedSort)
        }
      } catch (error) {
        console.warn('Failed to load saved sort:', error)
      }
    }
    return { key: 'name', direction: 'asc' }
  })

  const supabase = createSupabaseBrowserClient()

  // Debounced search effect to avoid too many API calls
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [filters.search])

  const fetchTargets = useCallback(
    async (currentOffset: number) => {
      setIsLoading(true)

      const rpcParams = {
        p_offset: currentOffset,
        p_limit: PAGE_SIZE,
        p_sort_by: sortConfig.key ?? 'name',
        p_sort_direction: sortConfig.direction,
        p_search: debouncedSearch?.trim() || undefined,
        p_submission_types:
          filters.submissionTypes.length > 0
            ? filters.submissionTypes
            : undefined,
        p_stage_focus:
          filters.stageFocus.length > 0 ? filters.stageFocus : undefined,
        p_industry_focus:
          filters.industryFocus.length > 0 ? filters.industryFocus : undefined,
        p_region_focus:
          filters.regionFocus.length > 0 ? filters.regionFocus : undefined,
        p_form_complexity:
          filters.formComplexity.length > 0
            ? filters.formComplexity
            : undefined,
        p_required_documents:
          filters.requiredDocuments.length > 0
            ? filters.requiredDocuments
            : undefined,
      }

      try {
        const { data, error } = await supabase.rpc(
          'get_targets_simple',
          rpcParams,
        )

        if (error) {
          console.error('Error fetching targets:', error)
          setTargets([])
          return
        }

        if (data) {
          const {
            data: targetsData,
            totalCount,
            hasMore,
            currentPage,
            limit,
          } = data as unknown as GetTargetsSimpleResponse

          setTargets(targetsData || [])
          setPaginationData({
            totalCount,
            hasMore,
            currentPage,
            limit,
          })
        }
      } catch (error) {
        console.error('Error fetching targets:', error)
        setTargets([])
      } finally {
        setIsLoading(false)
      }
    },
    [
      supabase,
      debouncedSearch,
      filters.submissionTypes,
      filters.stageFocus,
      filters.industryFocus,
      filters.regionFocus,
      filters.formComplexity,
      filters.requiredDocuments,
      sortConfig,
    ],
  )

  useEffect(() => {
    fetchTargets(offset)
  }, [offset, fetchTargets])

  useEffect(() => {
    setOffset(0)
  }, [
    debouncedSearch,
    filters.submissionTypes,
    filters.stageFocus,
    filters.industryFocus,
    filters.regionFocus,
    filters.formComplexity,
    filters.requiredDocuments,
    sortConfig,
  ])

  const handleFiltersChange = useCallback((newFilters: FundsFilters) => {
    setFilters(newFilters)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters))
      } catch (error) {
        console.warn('Failed to save filters:', error)
      }
    }
  }, [])

  const handleSortChange = useCallback((key: string) => {
    setSortConfig((prevConfig) => {
      const newDirection =
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc'
      const newSortConfig = { key, direction: newDirection as 'asc' | 'desc' }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(newSortConfig))
        } catch (error) {
          console.warn('Failed to save sort config:', error)
        }
      }
      return newSortConfig
    })
  }, [])

  const handlePreviousPage = () => {
    const newOffset = Math.max(0, offset - PAGE_SIZE)
    setOffset(newOffset)
  }

  const handleNextPage = () => {
    if (paginationData?.hasMore) {
      setOffset(offset + PAGE_SIZE)
    }
  }

  if (isLoading && !targets.length) {
    return (
      <SecureFundsWrapper>
        <div className="h-full flex flex-col overflow-hidden hide-scrollbar">
          <div className="flex-shrink-0 pb-4">
            <h1 className="text-3xl font-bold tracking-tight mt-1.5">Funds</h1>
          </div>
        </div>
      </SecureFundsWrapper>
    )
  }

  return (
    <SecureFundsWrapper>
      <div className="h-full flex flex-col overflow-hidden hide-scrollbar">
        <div className="flex-shrink-0 pb-4">
          <h1 className="text-3xl font-bold tracking-tight mt-1.5">Funds</h1>
        </div>
        <div className="flex-1 overflow-hidden hide-scrollbar">
          <FundsTableWrapper
            targets={targets}
            startupId={startupId}
            paginationData={paginationData}
            offset={offset}
            isLoading={isLoading}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
          />
        </div>
      </div>
    </SecureFundsWrapper>
  )
}
