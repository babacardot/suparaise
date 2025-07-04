import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import React from 'react'

export async function generateMetadata({
    params,
}: {
    params: { startupId: string }
}): Promise<Metadata> {
    const { startupId } = params

    try {
        const supabase = await createClient()
        const { data: startup } = await supabase
            .from('startups')
            .select('name')
            .eq('id', startupId)
            .single()

        const startupName = startup?.name || 'Company'

        return {
            title: `${startupName} | Funds | Suparaise`,
            description: `Search and apply to funds.`,
        }
    } catch {
        return {
            title: 'Funds | Suparaise',
            description: 'Search and apply to funds.',
        }
    }
}

export default function FundsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
} 