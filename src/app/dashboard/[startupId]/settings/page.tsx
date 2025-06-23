import React from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import SettingsLayout from './components/settings-layout'
import ProfileSettings from './components/profile-settings'

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
      title: `${startupName} | Profile`,
      description: `Manage your business settings.`,
    }
  } catch {
    return {
      title: 'Suparaise | Profile',
      description: 'Manage your business settings.',
    }
  }
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
