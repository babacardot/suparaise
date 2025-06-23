import React from 'react'
import { createClient } from '@/lib/supabase/server'
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
      title: `${startupName} | Applications`,
      description: `Track and manage your applications.`,
    }
  } catch {
    return {
      title: 'Suparaise | Applications',
      description: 'Track and manage your applications.',
    }
  }
}

export default async function ApplicationsPage() {
  return (
    <div className="space-y-6 hide-scrollbar">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight mt-1.5">
          Applications
        </h1>
      </div>
    </div>
  )
}
