'use client'

import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useUser } from '@/lib/contexts/user-context'

// We need to export this as a client component for Next.js 15
export default function ApplicationsLayout({
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
    title: 'Applications | Suparaise',
    description: 'Track and manage your investor applications.',
  })

  useEffect(() => {
    const updateMetadata = async () => {
      if (!startupId) return

      try {
        const startupMetadata = await getStartupMetadata(startupId)
        const startupName = startupMetadata?.name || 'Company'

        setMetadata({
          title: `${startupName} | Applications | Suparaise`,
          description: 'Track and manage your investor applications.',
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
