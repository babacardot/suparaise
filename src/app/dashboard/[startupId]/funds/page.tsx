import React from 'react'
import { createClient } from '@/lib/supabase/server'
import FundsTableWrapper from '@/components/dashboard/funds/funds-table-wrapper'
import SecureFundsWrapper from '@/components/dashboard/funds/secure-funds-wrapper'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ startupId: string }>
}): Promise<Metadata> {
  const { startupId } = await params

  try {
    const supabase = await createClient()
    const { data: startup } = await supabase
      .from('startups')
      .select('name')
      .eq('id', startupId)
      .single()

    const startupName = startup?.name || 'Company'

    return {
      title: `${startupName} | Funds`,
      description: `Browse and apply to funds.`,
    }
  } catch {
    return {
      title: 'Suparaise | Funds',
      description: 'Browse and apply to funds.',
    }
  }
}

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
  requires_video?: boolean
  notes?: string
  created_at: string
  updated_at: string
}

async function getTargets(): Promise<Target[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_all_targets')

  if (error) {
    console.error('Error fetching targets:', error)
    return []
  }

  // Since RPC returns JSONB, we need to properly cast it
  return (data as Target[]) || []
}

export default async function FundsPage() {
  const targets = await getTargets()

  return (
    <SecureFundsWrapper>
      <div className="h-full flex flex-col overflow-hidden hide-scrollbar">
        <div className="flex-shrink-0 pb-4">
          <h1 className="text-3xl font-bold tracking-tight mt-1.5">Funds</h1>
        </div>
        <div className="flex-1 overflow-hidden hide-scrollbar">
          <FundsTableWrapper targets={targets} />
        </div>
      </div>
    </SecureFundsWrapper>
  )
}
