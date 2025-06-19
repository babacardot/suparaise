import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.')
}

// Browser client for client-side components
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Server client for server-side components
export async function createSupabaseServerClient() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Legacy client for backward compatibility (use browser client instead)
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

export async function getStartupDataForUser(userId: string) {
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
  return data
}

export async function getTargets() {
  console.log('Fetching targets from Supabase...')
  
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from('targets').select('*')

  if (error) {
    console.error('Error fetching targets:', error)
    throw new Error('Could not fetch targets from Supabase.')
  }
  console.log(`✅ Found ${data.length} targets.`)
  return data
}
