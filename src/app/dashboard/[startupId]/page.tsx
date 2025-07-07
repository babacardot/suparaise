import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { generateStartupMetadata } from '@/lib/utils/metadata'

interface DashboardPageProps {
  params: Promise<{ startupId: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ startupId: string }>
}): Promise<Metadata> {
  const { startupId } = await params

  return generateStartupMetadata({
    startupId,
    pageTitle: 'Home',
    description: 'Automate fundraising with agents.',
    fallbackTitle: 'Home | Suparaise',
  })
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  // Await the async params
  const { startupId } = await params

  // Redirect to home by default
  redirect(`/dashboard/${startupId}/home`)
}
