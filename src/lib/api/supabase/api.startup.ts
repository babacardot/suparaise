import {
  createSupabaseBrowserClient,
  createSupabaseServerClient,
} from '@/lib/supabase/client'
import { Tables, TablesInsert, TablesUpdate } from '@/lib/types/database'
import { Startup } from '@/lib/types'

type StartupRow = Tables<'startups'>
type StartupInsert = TablesInsert<'startups'>
type StartupUpdate = TablesUpdate<'startups'>

/**
 * Get startup data by user ID (using existing RPC)
 */
export async function getStartupDataForUser(userId: string): Promise<Startup> {
  console.log(`Fetching startup data for user ${userId}...`)

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.rpc('get_startup_data_by_user_id', {
    p_user_id: userId,
  })

  if (error) {
    console.error('Error fetching startup data via RPC:', error)
    throw new Error('Could not fetch startup data from Supabase.')
  }

  if (!data) {
    throw new Error(`No startup found for user ${userId}`)
  }

  console.log('✅ Startup data fetched successfully.')
  return data as Startup
}

/**
 * Get startup by user ID (server-side)
 */
export async function getStartupByUserId(
  userId: string,
): Promise<StartupRow | null> {
  // For now, we can use the existing get_startup_data_by_user_id and extract basic data
  try {
    const startupData = await getStartupDataForUser(userId)
    // Extract basic startup row data from the complex DTO
    return {
      id: startupData.id,
      name: startupData.name,
      website: startupData.website,
      industry: startupData.industry,
      location: startupData.location,
      description_short: startupData.oneLiner,
      description_long: startupData.description,
      description_medium: null, // Not in the DTO
      traction_summary: startupData.traction_summary,
      market_summary: startupData.market_summary,
      mrr: startupData.mrr,
      arr: startupData.arr,
      employee_count: startupData.employee_count,
      logo_url: startupData.logo_url,
      pitch_deck_url: startupData.pitch_deck_url,
      intro_video_url: startupData.intro_video_url,
      user_id: userId, // We know this from the parameter
      created_at: null, // Not in the DTO
      updated_at: null, // Not in the DTO
    } as StartupRow
  } catch {
    return null
  }
}

/**
 * Get startup name only by user ID (lightweight)
 */
export async function getStartupNameByUserId(
  userId: string,
): Promise<string | null> {
  try {
    const startupData = await getStartupDataForUser(userId)
    return startupData.name
  } catch {
    return null
  }
}

/**
 * Get current user's startup (client-side)
 */
export async function getCurrentUserStartup(): Promise<StartupRow | null> {
  const supabase = createSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  return getStartupByUserId(user.id)
}

/**
 * Create a new startup
 */
export async function createStartup(
  startupData: StartupInsert,
): Promise<StartupRow | null> {
  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase.rpc('create_startup', {
    p_startup_data: startupData,
  })

  if (error) {
    console.error('Error creating startup via RPC:', error)
    return null
  }

  return data as StartupRow
}

/**
 * Update startup
 */
export async function updateStartup(
  startupId: string,
  updates: StartupUpdate,
): Promise<StartupRow | null> {
  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase.rpc('update_startup', {
    p_startup_id: startupId,
    p_updates: updates,
  })

  if (error) {
    console.error('Error updating startup via RPC:', error)
    return null
  }

  return data as StartupRow
}
