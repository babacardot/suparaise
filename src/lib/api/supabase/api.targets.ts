import { createClient } from '@supabase/supabase-js'
import { Database } from '../../types/database'
import { Target } from '../../types/index'

// Create a Supabase client for server-side operations (agent)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY! ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Supabase URL and Service Key must be provided for agent operations.',
  )
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

export async function getTargets(): Promise<Target[]> {
  try {
    // Direct RPC call to get_all_targets function
    const { data, error } = await supabase.rpc('get_all_targets')

    if (error) {
      console.error('Error fetching targets:', error)
      return []
    }

    if (!data) {
      console.log('No targets found in database')
      return []
    }

    return data as Target[]
  } catch (error) {
    console.error('Unexpected error fetching targets:', error)
    return []
  }
}
