'use client'

import { useParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import React, { useEffect, useState } from 'react'

// We need to export this as a client component for Next.js 15
export default function FundsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const params = useParams()
    const startupId = params.startupId as string
    const [metadata, setMetadata] = useState<{
        title: string
        description: string
    }>({
        title: 'Funds | Suparaise',
        description: 'Search and apply to funds.',
    })

    useEffect(() => {
        const updateMetadata = async () => {
            if (!startupId) return

            try {
                const supabase = createSupabaseBrowserClient()
                const { data: startup } = await supabase
                    .from('startups')
                    .select('name')
                    .eq('id', startupId)
                    .single()

                const startupName = startup?.name || 'Company'

                setMetadata({
                    title: `${startupName} | Funds | Suparaise`,
                    description: 'Search and apply to funds.',
                })
            } catch {
                // Keep default metadata on error
            }
        }

        updateMetadata()
    }, [startupId])

    // Update document title
    useEffect(() => {
        document.title = metadata.title
    }, [metadata.title])

    return <>{children}</>
} 