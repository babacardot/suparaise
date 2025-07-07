'use client'

import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useUser } from '@/lib/contexts/user-context'

// We need to export this as a client component for Next.js 15
export default function FundsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const startupId = params.startupId as string
  const { getStartupMetadata } = useUser()
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
        const startupMetadata = await getStartupMetadata(startupId)
        const startupName = startupMetadata?.name || 'Company'

        setMetadata({
          title: `${startupName} | Funds | Suparaise`,
          description: 'Search and apply to funds.',
        })
      } catch {
        // Keep default metadata on error
      }
    }

    updateMetadata()
  }, [startupId, getStartupMetadata])

  // Update document title
  useEffect(() => {
    document.title = metadata.title
  }, [metadata.title])

  return <>{children}</>
}
