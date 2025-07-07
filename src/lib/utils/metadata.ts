import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface StartupMetadata {
  name?: string
  id?: string
}

/**
 * Generate metadata for dashboard pages with startup context
 */
export async function generateStartupMetadata({
  startupId,
  pageTitle,
  description,
  fallbackTitle,
}: {
  startupId: string
  pageTitle: string
  description: string
  fallbackTitle: string
}): Promise<Metadata> {
  try {
    const supabase = await createClient()
    const { data: metaData } = await supabase.rpc('get_startup_metadata', {
      p_startup_id: startupId,
    })

    const metadata = metaData as unknown as StartupMetadata
    const startupName = metadata?.name || 'Company'

    return {
      title: `${startupName} | ${pageTitle} | Suparaise`,
      description,
    }
  } catch (error) {
    console.error('Error fetching startup metadata:', error)
    return {
      title: fallbackTitle,
      description,
    }
  }
}

/**
 * Generate metadata for client-side pages (browser-based)
 */
export function getStartupDisplayName(startupName?: string | null): string {
  return startupName || 'Company'
}
