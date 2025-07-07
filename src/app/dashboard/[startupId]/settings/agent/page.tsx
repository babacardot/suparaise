import React from 'react'
import type { Metadata } from 'next'
import { generateStartupMetadata } from '@/lib/utils/metadata'
import SettingsLayout from '@/components/settings/settings-layout'
import AgentSettings from '@/components/settings/agent-settings'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ startupId: string }>
}): Promise<Metadata> {
  const { startupId } = await params

  return generateStartupMetadata({
    startupId,
    pageTitle: 'Agent',
    description: 'Configure your AI agent preferences.',
    fallbackTitle: 'Agent | Suparaise',
  })
}

export default function AgentSettingsPage() {
  return (
    <SettingsLayout>
      <AgentSettings />
    </SettingsLayout>
  )
}
