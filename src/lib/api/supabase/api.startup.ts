import { createClient } from '@supabase/supabase-js'
import { Database } from '../../types/database'
import { Startup } from '../../types/index'

// Create a Supabase client for server-side operations (agent)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and Service Key must be provided for agent operations.')
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

export async function getStartupDataForUser(userId: string): Promise<Startup | null> {
  try {
    // Direct RPC call to get_startup_data_by_user_id function
    const { data, error } = await supabase.rpc('get_startup_data_by_user_id', {
      p_user_id: userId
    })

    if (error) {
      console.error('Error fetching startup data:', error)
      return null
    }

    if (!data) {
      console.log(`No startup data found for user ${userId}`)
      return null
    }

    return data as Startup
  } catch (error) {
    console.error('Unexpected error fetching startup data:', error)
    return null
  }
} 