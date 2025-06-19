import {
  createSupabaseBrowserClient,
  createSupabaseServerClient,
} from '@/lib/supabase/client'
import { Tables } from '@/lib/types/database'

type UserProfile = Tables<'profiles'>

/**
 * Get user profile by ID (server-side)
 */
export async function getProfileById(
  userId: string,
): Promise<UserProfile | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.rpc('get_profile_by_id', {
    p_user_id: userId,
  })

  if (error) {
    console.error('Error fetching profile via RPC:', error)
    return null
  }

  return data as UserProfile
}

/**
 * Get current user profile (client-side)
 */
export async function getCurrentProfile(): Promise<UserProfile | null> {
  const supabase = createSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.rpc('get_profile_by_id', {
    p_user_id: user.id,
  })

  if (error) {
    console.error('Error fetching current profile via RPC:', error)
    return null
  }

  return data as UserProfile
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'full_name'>>,
): Promise<UserProfile | null> {
  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase.rpc('update_profile', {
    p_user_id: userId,
    p_full_name: updates.full_name || undefined,
  })

  if (error) {
    console.error('Error updating profile via RPC:', error)
    return null
  }

  return data as UserProfile
}

/**
 * Get user profile with startup data
 */
export async function getUserProfileWithStartup(userId: string) {
  console.log(`Fetching user profile and startup data for user ${userId}...`)

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.rpc('get_user_profile_with_startup', {
    p_user_id: userId,
  })

  if (error) {
    console.error('Error fetching profile with startup via RPC:', error)
    return null
  }

  return data
}
