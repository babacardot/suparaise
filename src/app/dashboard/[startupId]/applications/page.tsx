import React from 'react'
import type { Metadata } from 'next'
import { generateStartupMetadata } from '@/lib/utils/metadata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ startupId: string }>
}): Promise<Metadata> {
  const { startupId } = await params

  return generateStartupMetadata({
    startupId,
    pageTitle: 'Applications',
    description: 'Track and manage your investor applications.',
    fallbackTitle: 'Applications | Suparaise',
  })
}

export default async function ApplicationsPage() {
  return (
    <div className="space-y-6 hide-scrollbar select-none">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight mt-1.5">
          Applications
        </h1>
      </div>
    </div>
  )
}
