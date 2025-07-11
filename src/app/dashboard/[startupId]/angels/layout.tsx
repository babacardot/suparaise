'use client'

import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useUser } from '@/lib/contexts/user-context'

// We need to export this as a client component for Next.js 15
export default function AngelsLayout({
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
    title: 'Angels | Suparaise',
    description: 'Search and apply to angel investors.',
  })

  useEffect(() => {
    const updateMetadata = async () => {
      if (!startupId) return

      try {
        const startupMetadata = await getStartupMetadata(startupId)
        const startupName = startupMetadata?.name || 'Company'

        setMetadata({
          title: `${startupName} | Angels | Suparaise`,
          description: 'Search and apply to angel investors.',
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
