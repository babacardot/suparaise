import React from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import SettingsLayout from '../components/settings-layout'
import AgentSettings from '../components/agent-settings'

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
            title: `${startupName} | Agents`,
            description: `Configure agents and automation parameters.`,
        }
    } catch {
        return {
            title: 'Suparaise | Agents',
            description: 'Configure agents and automation parameters.',
        }
    }
}

export default function AgentSettingsPage() {
    return (
        <SettingsLayout>
            <AgentSettings />
        </SettingsLayout>
    )
} 