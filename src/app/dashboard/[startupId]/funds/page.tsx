import { createClient } from '@/lib/supabase/server'
import FundsPageClient from './FundsPageClient'
import { FundsFilters as FundsFiltersType } from '@/components/dashboard/funds/funds-filters'
import React from 'react'

const PAGE_SIZE = 100

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
  limit: number
}

// Helper to parse array from search params
const getArray = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return [value]
  return []
}

interface GetTargetsSimpleResponse {
  data: Target[]
  totalCount: number
  hasMore: boolean
  currentPage: number
  limit: number
}

export default async function FundsPage({
  params,
  searchParams,
}: {
  params: { startupId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  const startupId = params.startupId

  // Parse filters from searchParams
  const filters: FundsFiltersType = {
    search: (searchParams.search as string) || '',
    submissionTypes: getArray(searchParams.submissionTypes),
    stageFocus: getArray(searchParams.stageFocus),
    industryFocus: getArray(searchParams.industryFocus),
    regionFocus: getArray(searchParams.regionFocus),
    requiredDocuments: getArray(searchParams.requiredDocuments),
    submissionFilter:
      (searchParams.submissionFilter as
        | 'all'
        | 'hide_submitted'
        | 'only_submitted') || 'all',
  }

  // Parse sort from searchParams
  const sortDirection: 'asc' | 'desc' =
    (searchParams.sortDirection as string) === 'desc' ? 'desc' : 'asc'
  const sortConfig = {
    key: (searchParams.sortBy as string) || 'name',
    direction: sortDirection,
  }

  // Parse pagination from searchParams
  const page = parseInt((searchParams.page as string) || '1', 10)
  const offset = (page - 1) * PAGE_SIZE

  const rpcParams = {
    p_offset: offset,
    p_limit: PAGE_SIZE,
    p_sort_by: sortConfig.key,
    p_sort_direction: sortConfig.direction,
    p_search: filters.search.trim() || undefined,
    p_submission_types:
      filters.submissionTypes.length > 0 ? filters.submissionTypes : undefined,
    p_stage_focus:
      filters.stageFocus.length > 0 ? filters.stageFocus : undefined,
    p_industry_focus:
      filters.industryFocus.length > 0 ? filters.industryFocus : undefined,
    p_region_focus:
      filters.regionFocus.length > 0 ? filters.regionFocus : undefined,
    p_required_documents:
      filters.requiredDocuments.length > 0
        ? filters.requiredDocuments
        : undefined,
    p_startup_id: startupId,
    p_submission_filter: filters.submissionFilter,
  }

  const { data, error } = await supabase.rpc('get_targets_simple', rpcParams)

  if (error) {
    // console.error('Error fetching targets:', error)
    // You might want to render an error state here
  }

  const responseData = data as unknown as GetTargetsSimpleResponse

  return (
    <FundsPageClient
      startupId={startupId}
      initialTargets={responseData?.data || []}
      initialPaginationData={
        responseData
          ? {
              totalCount: responseData.totalCount,
              hasMore: responseData.hasMore,
              currentPage: responseData.currentPage,
              limit: responseData.limit,
            }
          : null
      }
      initialFilters={filters}
      initialSortConfig={sortConfig}
    />
  )
}
