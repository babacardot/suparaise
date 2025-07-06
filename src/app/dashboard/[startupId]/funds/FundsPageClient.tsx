'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import FundsTableWrapper from '@/components/dashboard/funds/funds-table-wrapper'
import SecureFundsWrapper from '@/components/dashboard/funds/secure-funds-wrapper'
import FundsFilters, {
  FundsFilters as FundsFiltersType,
} from '@/components/dashboard/funds/funds-filters'

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

interface FundsPageClientProps {
  startupId: string
  initialTargets: Target[]
  initialPaginationData: {
    totalCount: number
    hasMore: boolean
    currentPage: number
    limit: number
  } | null
  initialFilters: FundsFiltersType
  initialSortConfig: { key: string | null; direction: 'asc' | 'desc' }
}

const COLUMN_VISIBILITY_STORAGE_KEY = 'funds-table-columns'

export default function FundsPageClient({
  startupId,
  initialTargets,
  initialPaginationData,
  initialFilters,
  initialSortConfig,
}: FundsPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [targets, setTargets] = useState<Target[]>(initialTargets)
  const [paginationData, setPaginationData] = useState(initialPaginationData)

  useEffect(() => {
    setTargets(initialTargets)
    setPaginationData(initialPaginationData)
  }, [initialTargets, initialPaginationData])

  const [filters, setFilters] = useState<FundsFiltersType>(initialFilters)
  const [sortConfig, setSortConfig] = useState(initialSortConfig)

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
    () => {
      if (typeof window !== 'undefined') {
        try {
          const savedVisibility = localStorage.getItem(
            COLUMN_VISIBILITY_STORAGE_KEY,
          )
          if (savedVisibility) {
            return JSON.parse(savedVisibility)
          }
        } catch (error) {
          console.warn('Failed to load saved column visibility:', error)
        }
      }
      return {
        region: true,
        focus: true,
        industry: true,
        requirements: true,
        type: false,
      }
    },
  )

  const page = useMemo(
    () => Number(initialPaginationData?.currentPage ?? 1),
    [initialPaginationData],
  )
  const offset = useMemo(
    () => (page - 1) * (paginationData?.limit || 100),
    [page, paginationData],
  )

  // Prefetch the next page to make navigation feel faster
  useEffect(() => {
    if (paginationData?.hasMore) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', String(page + 1))
      router.prefetch(`${pathname}?${params.toString()}`)
    }
  }, [page, paginationData, pathname, router, searchParams])

  const updateUrl = useCallback(
    (newParams: URLSearchParams) => {
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false })
    },
    [pathname, router],
  )

  const handleFiltersChange = useCallback(
    (newFilters: FundsFiltersType) => {
      setFilters(newFilters)
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', '1')

      Object.entries(newFilters).forEach(([key, value]) => {
        params.delete(key)
        if (Array.isArray(value)) {
          if (value.length > 0) {
            value.forEach((v) => params.append(key, v))
          }
        } else if (value) {
          params.set(key, String(value))
        }
      })
      updateUrl(params)
    },
    [searchParams, updateUrl],
  )

  const handleSortChange = useCallback(
    (key: string) => {
      const newDirection =
        sortConfig.key === key && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc'
      const newSortConfig = { key, direction: newDirection as 'asc' | 'desc' }
      setSortConfig(newSortConfig)

      const params = new URLSearchParams(searchParams.toString())
      params.set('sortBy', newSortConfig.key)
      params.set('sortDirection', newSortConfig.direction)
      updateUrl(params)
    },
    [sortConfig, searchParams, updateUrl],
  )

  const handlePreviousPage = useCallback(() => {
    if (page > 1) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', String(page - 1))
      updateUrl(params)
    }
  }, [page, searchParams, updateUrl])

  const handleNextPage = useCallback(() => {
    if (paginationData?.hasMore) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', String(page + 1))
      updateUrl(params)
    }
  }, [page, paginationData, searchParams, updateUrl])

  const updateColumnVisibility = useCallback(
    (column: keyof ColumnVisibility, visible: boolean) => {
      const newVisibility = { ...columnVisibility, [column]: visible }
      setColumnVisibility(newVisibility)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            COLUMN_VISIBILITY_STORAGE_KEY,
            JSON.stringify(newVisibility),
          )
        } catch (error) {
          console.warn('Failed to save column visibility:', error)
        }
      }
    },
    [columnVisibility],
  )

  const clearFilters = useCallback(() => {
    const clearedFilters: FundsFiltersType = {
      search: '',
      submissionTypes: [],
      stageFocus: [],
      industryFocus: [],
      regionFocus: [],
      requiredDocuments: [],
      submissionFilter: 'all',
    }
    setFilters(clearedFilters)

    const params = new URLSearchParams(searchParams.toString())
    Object.keys(clearedFilters).forEach((key) => params.delete(key))
    params.set('page', '1')
    updateUrl(params)
  }, [searchParams, updateUrl])

  const tableWrapper = useMemo(
    () => (
      <FundsTableWrapper
        targets={targets}
        startupId={startupId}
        paginationData={paginationData}
        offset={offset}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        onSortChange={handleSortChange}
        columnVisibility={columnVisibility}
      />
    ),
    [
      targets,
      startupId,
      paginationData,
      offset,
      handlePreviousPage,
      handleNextPage,
      handleSortChange,
      columnVisibility,
    ],
  )

  return (
    <SecureFundsWrapper>
      <div className="h-full flex flex-col overflow-hidden hide-scrollbar">
        <div className="flex-shrink-0 pb-4">
          <h1 className="text-3xl font-bold tracking-tight mt-1.5">Funds</h1>
        </div>
        <FundsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={clearFilters}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={updateColumnVisibility}
        />
        <div className="flex-1 overflow-hidden hide-scrollbar">
          {tableWrapper}
        </div>
      </div>
    </SecureFundsWrapper>
  )
}
