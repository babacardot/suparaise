import React from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { generateStartupMetadata } from '@/lib/utils/metadata'
import AngelsPageClient from './AngelsPageClient'
import { AngelsFilters } from '@/components/dashboard/angels/angels-filters'

export const revalidate = 0

const PAGE_SIZE = 100

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
    | '1K — 10K'
    | '10K — 25K'
    | '25K — 50K'
    | '50K — 100K'
    | '100K — 250K'
    | '250K — 500K'
    | '500K — 1M'
    | '1M +'
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

type GetAngelsSimpleResponse = {
  data: Angel[]
  totalCount: number
  hasMore: boolean
  currentPage: number
  limit: number
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ startupId: string }>
}): Promise<Metadata> {
  const { startupId } = await params

  return generateStartupMetadata({
    startupId,
    pageTitle: 'Angels',
    description: 'Browse and connect with angel investors.',
    fallbackTitle: 'Angels | Suparaise',
  })
}

// Helper to parse array from search params
const getArray = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return [value]
  return []
}

export default async function AngelsPage({
  params,
  searchParams,
}: {
  params: Promise<{ startupId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { startupId } = await params
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()

  const page = Number(resolvedSearchParams.page || 1)
  const offset = (page - 1) * PAGE_SIZE
  const sortBy = (resolvedSearchParams.sortBy as string) || 'name'
  const sortDirection = (resolvedSearchParams.sortDirection as string) || 'asc'

  const filters: AngelsFilters = {
    search: (resolvedSearchParams.search as string) || '',
    submissionTypes: getArray(resolvedSearchParams.submissionTypes),
    stageFocus: getArray(resolvedSearchParams.stageFocus),
    industryFocus: getArray(resolvedSearchParams.industryFocus),
    regionFocus: getArray(resolvedSearchParams.regionFocus),
    checkSizes: getArray(resolvedSearchParams.checkSizes),
    investmentApproaches: getArray(resolvedSearchParams.investmentApproaches),
    submissionFilter:
      (resolvedSearchParams.submissionFilter as
        | 'all'
        | 'hide_submitted'
        | 'only_submitted') || 'all',
  }

  const rpcParams = {
    p_limit: PAGE_SIZE,
    p_offset: offset,
    p_sort_by: sortBy,
    p_sort_direction: sortDirection,
    p_search: filters.search.trim() || undefined,
    p_submission_types:
      filters.submissionTypes.length > 0 ? filters.submissionTypes : undefined,
    p_stage_focus:
      filters.stageFocus.length > 0 ? filters.stageFocus : undefined,
    p_industry_focus:
      filters.industryFocus.length > 0 ? filters.industryFocus : undefined,
    p_region_focus:
      filters.regionFocus.length > 0 ? filters.regionFocus : undefined,
    p_check_sizes:
      filters.checkSizes.length > 0 ? filters.checkSizes : undefined,
    p_investment_approaches:
      filters.investmentApproaches.length > 0
        ? filters.investmentApproaches
        : undefined,
    p_startup_id: startupId,
    p_submission_filter: filters.submissionFilter,
  }

  const { data, error } = await supabase.rpc('get_angels_simple', rpcParams)

  if (error) {
    console.error('Error fetching angels:', error)
    // Handle error appropriately
  }

  const responseData = data as GetAngelsSimpleResponse | null
  const initialAngels = responseData?.data || []
  const paginationData = responseData
    ? {
        totalCount: responseData.totalCount,
        hasMore: responseData.hasMore,
        currentPage: responseData.currentPage,
        limit: responseData.limit,
      }
    : null

  const initialSortConfig = {
    key: sortBy,
    direction: sortDirection as 'asc' | 'desc',
  }

  return (
    <AngelsPageClient
      startupId={startupId}
      initialAngels={initialAngels}
      initialPaginationData={paginationData}
      initialFilters={filters}
      initialSortConfig={initialSortConfig}
    />
  )
}
