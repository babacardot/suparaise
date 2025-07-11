'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import AngelsTableWrapper from '@/components/dashboard/angels/angels-table-wrapper'
import SecureAngelsWrapper from '@/components/dashboard/angels/secure-angels-wrapper'
import AngelsFilters, {
  AngelsFilters as AngelsFiltersType,
} from '@/components/dashboard/angels/angels-filters'

type Angel = {
  id: string
  first_name: string
  last_name: string
  email?: string
  linkedin?: string
  twitter?: string
  personal_website?: string
  location?: string
  bio?: string
  check_size?:
    | '1K-10K'
    | '10K-25K'
    | '25K-50K'
    | '50K-100K'
    | '100K-250K'
    | '250K-500K'
    | '500K-1M'
    | '1M+'
  stage_focus?: string[]
  industry_focus?: string[]
  region_focus?: string[]
  investment_approach?: 'hands-on' | 'passive' | 'advisory' | 'network-focused'
  previous_exits?: string[]
  domain_expertise?: string[]
  response_time?: '1-3 days' | '1 week' | '2 weeks' | '1 month' | '2+ months'
  submission_type: 'form' | 'email' | 'other'
  application_url?: string
  application_email?: string
  form_complexity?: 'simple' | 'standard' | 'comprehensive'
  required_documents?: string[]
  notable_investments?: string[]
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
  check_size: boolean
  investment_approach: boolean
  type: boolean
}

interface AngelsPageClientProps {
  startupId: string
  initialAngels: Angel[]
  initialPaginationData: {
    totalCount: number
    hasMore: boolean
    currentPage: number
    limit: number
  } | null
  initialFilters: AngelsFiltersType
  initialSortConfig: { key: string | null; direction: 'asc' | 'desc' }
}

const COLUMN_VISIBILITY_STORAGE_KEY = 'angels-table-columns'

export default function AngelsPageClient({
  startupId,
  initialAngels,
  initialPaginationData,
  initialFilters,
  initialSortConfig,
}: AngelsPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [angels, setAngels] = useState<Angel[]>(initialAngels)
  const [paginationData, setPaginationData] = useState(initialPaginationData)
  const [totalSubmissions, setTotalSubmissions] = useState<number>(0)

  useEffect(() => {
    setAngels(initialAngels)
    setPaginationData(initialPaginationData)
  }, [initialAngels, initialPaginationData])

  useEffect(() => {
    const fetchTotalSubmissions = async () => {
      try {
        const supabase = createSupabaseBrowserClient()

        const { data, error } = await supabase.rpc(
          'get_total_angel_applications_count',
          {
            p_startup_id: startupId,
          },
        )

        if (!error && data) {
          const responseData = data as unknown as { total_applications: number }
          setTotalSubmissions(responseData.total_applications || 0)
        }
      } catch (error) {
        console.error('Failed to fetch total submissions:', error)
      }
    }

    fetchTotalSubmissions()
  }, [startupId])

  const [filters, setFilters] = useState<AngelsFiltersType>(initialFilters)
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
        check_size: true,
        investment_approach: false,
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
    (newFilters: AngelsFiltersType) => {
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
    const clearedFilters: AngelsFiltersType = {
      search: '',
      submissionTypes: [],
      stageFocus: [],
      industryFocus: [],
      regionFocus: [],
      checkSizes: [],
      investmentApproaches: [],
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
      <AngelsTableWrapper
        angels={angels}
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
      angels,
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
    <SecureAngelsWrapper>
      <div className="h-full flex flex-col overflow-hidden hide-scrollbar">
        <div className="flex-shrink-0 pb-4">
          <h1 className="text-3xl font-bold tracking-tight mt-1.5">Angels</h1>
        </div>
        <AngelsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={clearFilters}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={updateColumnVisibility}
          totalSubmissions={totalSubmissions}
        />
        <div className="flex-1 overflow-hidden hide-scrollbar">
          {tableWrapper}
        </div>
      </div>
    </SecureAngelsWrapper>
  )
}
