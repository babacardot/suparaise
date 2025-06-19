import {
  createSupabaseBrowserClient,
  createSupabaseServerClient,
} from '@/lib/supabase/client'
import { Target } from '@/lib/types'

/**
 * Get all VC targets
 */
export async function getTargets(): Promise<Target[]> {
  console.log('Fetching targets from Supabase...')

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.rpc('get_all_targets')

  if (error) {
    console.error('Error fetching targets via RPC:', error)
    throw new Error('Could not fetch targets from Supabase.')
  }

  console.log(`✅ Found ${Array.isArray(data) ? data.length : 0} targets.`)
  return (data as Target[]) || []
}

/**
 * Get all VC targets (public data)
 */
export async function getAllTargets(): Promise<Target[]> {
  return getTargets()
}

/**
 * Get target by ID
 */
export async function getTargetById(targetId: string): Promise<Target | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.rpc('get_target_by_id', {
    p_target_id: targetId,
  })

  if (error) {
    console.error('Error fetching target via RPC:', error)
    return null
  }

  return data as Target
}

/**
 * Search targets by name or focus areas
 */
export async function searchTargets(query: string): Promise<Target[]> {
  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase.rpc('search_targets', {
    p_query: query,
  })

  if (error) {
    console.error('Error searching targets via RPC:', error)
    return []
  }

  return (data as Target[]) || []
}

/**
 * Filter targets by stage and industry focus
 */
export async function filterTargets(filters: {
  stages?: string[]
  industries?: string[]
  regions?: string[]
}): Promise<Target[]> {
  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase.rpc('filter_targets', {
    p_stages: filters.stages,
    p_industries: filters.industries,
    p_regions: filters.regions,
  })

  if (error) {
    console.error('Error filtering targets via RPC:', error)
    return []
  }

  return (data as Target[]) || []
}
