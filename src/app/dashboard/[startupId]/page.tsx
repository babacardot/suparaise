import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface DashboardPageProps {
  params: Promise<{ startupId: string }>
}

export async function generateMetadata({
  params,
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
      title: `${startupName} | Home`,
      description: `Automate fundraising with agents.`,
    }
  } catch {
    return {
      title: 'Suparaise | Home',
      description: 'Automate fundraising with agents.',
    }
  }
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  // Await the async params
  const { startupId } = await params

  // Redirect to home by default
  redirect(`/dashboard/${startupId}/home`)
}
