import { createClient } from '@/lib/supabase/server'
import FundsPageClient from './FundsPageClient'
import { FundsFilters as FundsFiltersType } from '@/components/dashboard/funds/funds-filters'
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
    pageTitle: 'Funds',
    description: 'Browse and apply to venture capital funds.',
    fallbackTitle: 'Funds | Suparaise',
  })
}

// Ensure no caching and always fetch with current auth
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
  tags?: string[]
  notes?: string
  form_type?: 'contact' | 'typeform' | 'google' | 'generic'
  visibility_level?: 'FREE' | 'PRO' | 'MAX'
  created_at: string
  updated_at: string
  submission_status?: 'pending' | 'in_progress' | 'completed' | 'failed'
  submission_started_at?: string
  queue_position?: number
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
  totalApplicationsCount?: {
    total_applications: number
  }
}

export default async function FundsPage({
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
  const filters: FundsFiltersType = {
    search: (resolvedSearchParams.search as string) || '',
    submissionTypes: getArray(resolvedSearchParams.submissionTypes),
    stageFocus: getArray(resolvedSearchParams.stageFocus),
    industryFocus: getArray(resolvedSearchParams.industryFocus),
    regionFocus: getArray(resolvedSearchParams.regionFocus),
    requiredDocuments: getArray(resolvedSearchParams.requiredDocuments),
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
            totalApplicationsCount: responseData.totalApplicationsCount,
          }
          : null
      }
      initialFilters={filters}
      initialSortConfig={sortConfig}
    />
  )
}
