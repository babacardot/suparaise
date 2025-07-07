import React from 'react'
import type { Metadata } from 'next'
import { generateStartupMetadata } from '@/lib/utils/metadata'
import SettingsLayout from '@/components/settings/settings-layout'
import ProfileSettings from '@/components/settings/founder-settings'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ startupId: string }>
}): Promise<Metadata> {
  const { startupId } = await params

  return generateStartupMetadata({
    startupId,
    pageTitle: 'Founder',
    description: 'Manage your settings.',
    fallbackTitle: 'Founder | Suparaise',
  })
}

export default function SettingsPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SettingsLayout>
        <ProfileSettings />
      </SettingsLayout>
    </div>
  )
}
