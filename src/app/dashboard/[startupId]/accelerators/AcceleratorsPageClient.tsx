'use client'

import React, { useState, useEffect, useCallback, useMemo, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import AcceleratorsTableWrapper from '@/components/dashboard/accelerators/accelerators-table-wrapper'
import SecureAcceleratorsWrapper from '@/components/dashboard/accelerators/secure-accelerators-wrapper'
import AcceleratorsFilters, {
  AcceleratorsFilters as AcceleratorsFiltersType,
} from '@/components/dashboard/accelerators/accelerators-filters'

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
  tags?: string[]
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

interface AcceleratorsPageClientProps {
  startupId: string
  initialAccelerators: Accelerator[]
  initialPaginationData: {
    totalCount: number
    hasMore: boolean
    currentPage: number
    limit: number
  } | null
  initialFilters: AcceleratorsFiltersType
  initialSortConfig: { key: string | null; direction: 'asc' | 'desc' }
}

const COLUMN_VISIBILITY_STORAGE_KEY = 'accelerators-table-columns'

export default function AcceleratorsPageClient({
  startupId,
  initialAccelerators,
  initialPaginationData,
  initialFilters,
  initialSortConfig,
}: AcceleratorsPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [accelerators, setAccelerators] =
    useState<Accelerator[]>(initialAccelerators)
  const [paginationData, setPaginationData] = useState(initialPaginationData)
  const [totalSubmissions, setTotalSubmissions] = useState<number>(0)

  useEffect(() => {
    setAccelerators(initialAccelerators)
    setPaginationData(initialPaginationData)
  }, [initialAccelerators, initialPaginationData])

  // Fetch total submissions count for this startup
  useEffect(() => {
    const fetchTotalSubmissions = async () => {
      try {
        const supabase = createSupabaseBrowserClient()

        const { data, error } = await supabase.rpc(
          'get_total_applications_count',
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

  const [filters, setFilters] = useState<AcceleratorsFiltersType>({
    ...initialFilters,
    equityRanges: (initialFilters.equityRanges || []).map((r) =>
      r.replace('-', ' — '),
    ),
    fundingRanges: (initialFilters.fundingRanges || []).map((r) =>
      r.replace('-', ' — '),
    ),
  })
  const [sortConfig, setSortConfig] = useState(initialSortConfig)

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
    () => {
      const defaultVisibility = {
        region: true,
        focus: false,
        industry: true,
        requirements: false,
        type: false,
        programType: false,
        equity: true,
        funding: false,
      }

      if (typeof window !== 'undefined') {
        try {
          const savedVisibilityJSON = localStorage.getItem(
            COLUMN_VISIBILITY_STORAGE_KEY,
          )
          if (savedVisibilityJSON) {
            const savedVisibility = JSON.parse(savedVisibilityJSON)
            return { ...defaultVisibility, ...savedVisibility }
          }
        } catch (error) {
          console.warn('Failed to load saved column visibility:', error)
        }
      }
      return defaultVisibility
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

  // Removed prefetch to avoid impacting initial load

  const startTransition = useTransition()[1]
  const updateUrl = useCallback(
    (newParams: URLSearchParams) => {
      startTransition(() => {
        router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })
      })
    },
    [pathname, router, startTransition],
  )

  const handleFiltersChange = useCallback(
    (newFilters: AcceleratorsFiltersType) => {
      setFilters(newFilters)
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', '1')

      const filtersForUrl = { ...newFilters }
      if (filtersForUrl.equityRanges) {
        filtersForUrl.equityRanges = filtersForUrl.equityRanges.map((r) =>
          r.replace(' — ', '-'),
        )
      }
      if (filtersForUrl.fundingRanges) {
        filtersForUrl.fundingRanges = filtersForUrl.fundingRanges.map((r) =>
          r.replace(' — ', '-'),
        )
      }

      Object.entries(filtersForUrl).forEach(([key, value]) => {
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
    const clearedFilters: AcceleratorsFiltersType = {
      search: '',
      submissionTypes: [],
      stageFocus: [],
      industryFocus: [],
      regionFocus: [],
      requiredDocuments: [],
      programTypes: [],
      equityRanges: [],
      fundingRanges: [],
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
      <AcceleratorsTableWrapper
        accelerators={accelerators}
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
      accelerators,
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
    <SecureAcceleratorsWrapper>
      <div className="h-full flex flex-col overflow-hidden hide-scrollbar">
        <div className="flex-shrink-0 pb-4">
          <h1 className="text-3xl font-bold tracking-tight mt-1.5">
            Accelerators
          </h1>
        </div>
        <AcceleratorsFilters
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
    </SecureAcceleratorsWrapper>
  )
}
