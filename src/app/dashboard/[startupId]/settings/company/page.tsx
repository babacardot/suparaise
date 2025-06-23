import React from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import SettingsLayout from '../components/settings-layout'
import CompanySettings from '../components/company-settings'

export async function generateMetadata({
    params
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
            title: `${startupName} | Company`,
            description: `Manage your company information.`,
        }
    } catch {
        return {
            title: 'Suparaise | Company',
            description: 'Manage your company information.',
        }
    }
}

export default function CompanySettingsPage() {
    return (
        <SettingsLayout>
            <CompanySettings />
        </SettingsLayout>
    )
} 