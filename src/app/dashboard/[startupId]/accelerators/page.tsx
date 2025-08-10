import { createClient } from '@/lib/supabase/server'
import AcceleratorsPageClient from './AcceleratorsPageClient'
import { AcceleratorsFilters as AcceleratorsFiltersType } from '@/components/dashboard/accelerators/accelerators-filters'
import React from 'react'
import type { Metadata } from 'next'
import { generateStartupMetadata } from '@/lib/utils/metadata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ startupId: string }>
}): Promise<Metadata> {
  const { startupId } = await params

  return generateStartupMetadata({
    startupId,
    pageTitle: 'Accelerators',
    description: 'Browse and apply to accelerators.',
    fallbackTitle: 'Accelerators | Suparaise',
  })
}

const PAGE_SIZE = 100

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
  limit: number
}

// Helper to parse array from search params
const getArray = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return [value]
  return []
}

interface GetAcceleratorsSimpleResponse {
  data: Accelerator[]
  totalCount: number
  hasMore: boolean
  currentPage: number
  limit: number
}

export default async function AcceleratorsPage({
  params,
  searchParams,
}: {
  params: Promise<{ startupId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { startupId } = await params
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()

  // Parse filters from searchParams
  const filters: AcceleratorsFiltersType = {
    search: (resolvedSearchParams.search as string) || '',
    submissionTypes: getArray(resolvedSearchParams.submissionTypes),
    stageFocus: getArray(resolvedSearchParams.stageFocus),
    industryFocus: getArray(resolvedSearchParams.industryFocus),
    regionFocus: getArray(resolvedSearchParams.regionFocus),
    requiredDocuments: getArray(resolvedSearchParams.requiredDocuments),
    programTypes: getArray(resolvedSearchParams.programTypes),
    equityRanges: getArray(resolvedSearchParams.equityRanges),
    fundingRanges: getArray(resolvedSearchParams.fundingRanges),
    submissionFilter:
      (resolvedSearchParams.submissionFilter as
        | 'all'
        | 'hide_submitted'
        | 'only_submitted') || 'all',
  }

  // Parse sort from searchParams
  const sortDirection: 'asc' | 'desc' =
    (resolvedSearchParams.sortDirection as string) === 'desc' ? 'desc' : 'asc'
  const sortConfig = {
    key: (resolvedSearchParams.sortBy as string) || 'name',
    direction: sortDirection,
  }

  // Parse pagination from searchParams
  const page = parseInt((resolvedSearchParams.page as string) || '1', 10)
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
    p_program_types:
      filters.programTypes.length > 0 ? filters.programTypes : undefined,
    p_equity_ranges:
      filters.equityRanges.length > 0 ? filters.equityRanges : undefined,
    p_funding_ranges:
      filters.fundingRanges.length > 0 ? filters.fundingRanges : undefined,
    p_startup_id: startupId,
    p_submission_filter: filters.submissionFilter,
    p_tags: undefined, // Not implemented in filters yet
  }

  const { data, error } = await supabase.rpc(
    'get_accelerators_simple',
    rpcParams,
  )

  if (error) {
    // console.error('Error fetching accelerators:', error)
    // You might want to render an error state here
  }

  const responseData = data as unknown as GetAcceleratorsSimpleResponse

  return (
    <AcceleratorsPageClient
      startupId={startupId}
      initialAccelerators={responseData?.data || []}
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
