import React from 'react'
import type { Metadata } from 'next'
import { generateStartupMetadata } from '@/lib/utils/metadata'
import SettingsLayout from '@/components/settings/settings-layout'
import CompanySettings from '@/components/settings/company-settings'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ startupId: string }>
}): Promise<Metadata> {
  const { startupId } = await params

  return generateStartupMetadata({
    startupId,
    pageTitle: 'Company',
    description: 'Manage your company information and profile.',
    fallbackTitle: 'Company | Suparaise',
  })
}

export default function CompanySettingsPage() {
  return (
    <SettingsLayout>
      <CompanySettings />
    </SettingsLayout>
  )
}
