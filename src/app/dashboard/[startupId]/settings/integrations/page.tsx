import React from 'react'
import type { Metadata } from 'next'
import { generateStartupMetadata } from '@/lib/utils/metadata'
import SettingsLayout from '@/components/settings/settings-layout'
import IntegrationSettings from '@/components/settings/integration-settings'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ startupId: string }>
}): Promise<Metadata> {
  const { startupId } = await params

  return generateStartupMetadata({
    startupId,
    pageTitle: 'Integrations',
    description: 'Connect and manage third-party integrations.',
    fallbackTitle: 'Integrations | Suparaise',
  })
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
