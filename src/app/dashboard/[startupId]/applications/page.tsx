import React from 'react'
import type { Metadata } from 'next'
import { generateStartupMetadata } from '@/lib/utils/metadata'
import { createClient } from '@/lib/supabase/server'
import ApplicationsPageClient from './ApplicationsPageClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ startupId: string }>
}): Promise<Metadata> {
  const { startupId } = await params

  return generateStartupMetadata({
    startupId,
    pageTitle: 'Applications',
    description: 'Track and manage your investor applications.',
    fallbackTitle: 'Applications | Suparaise',
  })
}

const PAGE_SIZE = 100

type SubmissionStatus = 'pending' | 'in_progress' | 'completed' | 'failed'
type SubmissionType = 'Fund' | 'Angel' | 'Accelerator'

type ApplicationSubmission = {
  submission_id: string
  startup_id: string
  submitted_to_name: string
  submitted_to_type: SubmissionType
  submission_date: string
  status: SubmissionStatus
  agent_notes?: string
  queue_position?: number
  queued_at?: string
  started_at?: string
  website_url?: string
  entity_id: string
  application_url?: string
  submission_type?: 'form' | 'email' | 'other'
  form_complexity?: 'simple' | 'standard' | 'comprehensive'
  stage_focus?: string[]
  industry_focus?: string[]
  region_focus?: string[]
  required_documents?: string[]
  created_at: string
  updated_at: string
}

// Helper to parse array from search params
const getArray = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return [value]
  return []
}

interface GetSubmissionsDetailedResponse {
  submissions: ApplicationSubmission[]
  totalCount: number
  hasMore: boolean
  currentPage: number
  limit: number
}

export default async function ApplicationsPage({
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
  const filters = {
    search: (resolvedSearchParams.search as string) || '',
    statusFilter: getArray(resolvedSearchParams.statusFilter),
    typeFilter: getArray(resolvedSearchParams.typeFilter),
    dateFrom: (resolvedSearchParams.dateFrom as string) || '',
    dateTo: (resolvedSearchParams.dateTo as string) || '',
  }

  // Parse sort from searchParams
  const sortDirection: 'asc' | 'desc' =
    (resolvedSearchParams.sortDirection as string) === 'asc' ? 'asc' : 'desc'
  const sortConfig = {
    key: (resolvedSearchParams.sortBy as string) || 'submission_date',
    direction: sortDirection,
  }

  // Parse pagination from searchParams
  const page = parseInt((resolvedSearchParams.page as string) || '1', 10)
  const offset = (page - 1) * PAGE_SIZE

  const rpcParams = {
    p_startup_id: startupId,
    p_limit: PAGE_SIZE,
    p_offset: offset,
    p_sort_by: sortConfig.key,
    p_sort_direction: sortConfig.direction,
    p_status_filter:
      filters.statusFilter.length > 0 ? filters.statusFilter : undefined,
    p_type_filter:
      filters.typeFilter.length > 0 ? filters.typeFilter : undefined,
    p_date_from: filters.dateFrom
      ? new Date(filters.dateFrom).toISOString().split('T')[0]
      : undefined,
    p_date_to: filters.dateTo
      ? new Date(filters.dateTo).toISOString().split('T')[0]
      : undefined,
  }

  // Fetch submissions data
  const { data: submissionsData, error: submissionsError } = await supabase.rpc(
    'get_all_submissions_detailed',
    rpcParams,
  )

  if (submissionsError) {
    console.error('Error fetching submissions:', submissionsError)
  }

  const responseData =
    submissionsData as unknown as GetSubmissionsDetailedResponse

  return (
    <ApplicationsPageClient
      startupId={startupId}
      initialSubmissions={responseData?.submissions || []}
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
