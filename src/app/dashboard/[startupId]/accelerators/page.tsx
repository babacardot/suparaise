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
    pageTitle: 'Accelerators',
    description: 'Browse and apply to accelerators.',
    fallbackTitle: 'Accelerators | Suparaise',
  })
}

export default async function ApplicationsPage() {
  return (
    <div className="space-y-6 hide-scrollbar">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight mt-1.5">
          Accelerators
        </h1>
      </div>
    </div>
  )
}
