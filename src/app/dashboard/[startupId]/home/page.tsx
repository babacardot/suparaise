import React from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import HomePageClient from './HomePageClient'
import { SubmissionData } from '@/components/dashboard/home/submissions-widget'
import { Recommendation } from '@/components/dashboard/home/recommendation-modal'

// Type definitions for our RPC responses
type StartupMetadata = {
  name?: string
  id?: string
}

type DashboardData = {
  profile?: {
    monthly_submissions_used?: number
    monthly_submissions_limit?: number
    permission_level?: string
  }
  startup?: {
    name?: string
    pitch_deck_url?: string
    updated_at?: string
  }
  submission_counts?: {
    total_applications?: number
    fund_submissions?: number
    angel_submissions?: number
    accelerator_submissions?: number
  }
  recent_submissions?: Array<{
    submission_id: string
    submitted_to_name: string
    submitted_to_type: 'Fund' | 'Angel' | 'Accelerator'
    submitted_at: string
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
    website_url?: string
    entity_id: string
  }>
  recommendations?: Recommendation[] | null
  error?: string
  success?: boolean
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ startupId: string }>
}): Promise<Metadata> {
  const { startupId } = await params
  const supabase = await createClient()

  try {
    const { data: metaData } = await supabase.rpc('get_startup_metadata', {
      p_startup_id: startupId,
    })

    const metadata = metaData as StartupMetadata
    const startupName = metadata?.name || 'Company'

    return {
      title: `${startupName} | Home | Suparaise`,
      description: `Welcome to the ${startupName} dashboard.`,
    }
  } catch (error) {
    console.error('Error fetching startup metadata:', error)
    return {
      title: 'Home | Suparaise',
      description: 'Automate fundraising with agents.',
    }
  }
}

async function getDashboardData(startupId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    const { data: dashboardData, error } = await supabase.rpc(
      'get_dashboard_data',
      {
        p_startup_id: startupId,
      },
    )

    clearTimeout(timeoutId)

    if (error) {
      console.error('Error fetching dashboard data:', error)
      return {
        profile: null,
        startup: null,
        totalApplications: 0,
        recommendations: null,
        recentSubmissions: [],
      }
    }

    const typedData = dashboardData as DashboardData

    if (typedData?.error) {
      console.error('Dashboard RPC error:', typedData.error)
      return {
        profile: null,
        startup: null,
        totalApplications: 0,
        recommendations: null,
        recentSubmissions: [],
      }
    }

    // Transform and validate recent submissions to match SubmissionData interface
    const recentSubmissions: SubmissionData[] = (
      typedData.recent_submissions || []
    ).filter((submission): submission is SubmissionData =>
      Boolean(
        submission.submission_id &&
          submission.submitted_to_name &&
          submission.submitted_to_type &&
          submission.submitted_at &&
          submission.status &&
          submission.entity_id,
      ),
    )

    return {
      profile: typedData.profile || null,
      startup: typedData.startup || null,
      totalApplications: typedData.submission_counts?.total_applications || 0,
      recommendations: typedData.recommendations || null,
      recentSubmissions,
    }
  } catch (error) {
    console.error('Error in getDashboardData:', error)
    // Return fallback data instead of null to prevent crashes
    return {
      profile: null,
      startup: null,
      totalApplications: 0,
      recommendations: null,
      recentSubmissions: [],
    }
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ startupId: string }>
}) {
  const { startupId } = await params
  const data = await getDashboardData(startupId)

  // getDashboardData now always returns an object, never null
  return (
    <HomePageClient
      startupId={startupId}
      submissionsUsed={data?.profile?.monthly_submissions_used ?? 0}
      submissionsLimit={data?.profile?.monthly_submissions_limit ?? 3}
      totalApplications={data?.totalApplications ?? 0}
      recommendations={data?.recommendations ?? null}
      recentSubmissions={data?.recentSubmissions ?? []}
    />
  )
}
