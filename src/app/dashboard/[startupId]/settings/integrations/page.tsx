import React from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import SettingsLayout from '@/components/settings/settings-layout'
import IntegrationSettings from '@/components/settings/integration-settings'

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
      title: `${startupName} | Integrations`,
      description: `Manage your integrations.`,
    }
  } catch {
    return {
      title: 'Suparaise | Integrations',
      description: 'Manage your integrations.',
    }
  }
}

export default function IntegrationsPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SettingsLayout>
        <IntegrationSettings />
      </SettingsLayout>
    </div>
  )
}
