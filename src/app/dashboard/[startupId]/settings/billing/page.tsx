import React from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import SettingsLayout from '../components/settings-layout'
import BillingSettings from '../components/billing-settings'

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
      title: `${startupName} | Billing`,
      description: `Manage your subscription and billing information.`,
    }
  } catch {
    return {
      title: 'Suparaise | Billing',
      description: 'Manage your subscription and billing information.',
    }
  }
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
