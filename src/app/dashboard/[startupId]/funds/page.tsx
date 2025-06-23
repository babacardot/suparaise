import React from 'react'
import { createClient } from '@/lib/supabase/server'
import FundsTable from '@/components/dashboard/funds-table'

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
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Funds</h1>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
          Find the right investors and apply with a click.
        </p>
      </div>

      <FundsTable targets={targets} />
    </div>
  )
}
