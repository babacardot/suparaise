import React from 'react'
import type { Metadata } from 'next'
import { generateStartupMetadata } from '@/lib/utils/metadata'
import SettingsLayout from '@/components/settings/settings-layout'
import BillingSettings from '@/components/settings/billing-settings'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ startupId: string }>
}): Promise<Metadata> {
  const { startupId } = await params

  return generateStartupMetadata({
    startupId,
    pageTitle: 'Billing',
    description: 'Manage your subscription and billing information.',
    fallbackTitle: 'Billing | Suparaise',
  })
}

export default function BillingPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SettingsLayout>
        <BillingSettings />
      </SettingsLayout>
    </div>
  )
}
