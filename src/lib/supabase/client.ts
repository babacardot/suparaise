import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database'
import { Startup, Target } from '../types'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.')
}

// Use the generated types for our client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export async function getStartupDataForUser(userId: string): Promise<Startup> {
  console.log(`Fetching startup data for user ${userId}...`)

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
  return data as unknown as Startup
}

export async function getTargets(): Promise<Target[]> {
  console.log('Fetching targets from Supabase...')
  const { data, error } = await supabase.from('targets').select('*')

  if (error) {
    console.error('Error fetching targets:', error)
    throw new Error('Could not fetch targets from Supabase.')
  }
  console.log(`✅ Found ${data.length} targets.`)
  return data as Target[]
}
