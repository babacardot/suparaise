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
    const title = `${startupName} | ${pageTitle} | Suparaise`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: '/banner.png',
            width: 1200,
            height: 600,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/banner.png'],
      },
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
