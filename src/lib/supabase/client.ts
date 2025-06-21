import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.')
}

// Create a singleton instance of the Supabase client
const supabaseSingleton = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
)

// Browser client for client-side components
export function createSupabaseBrowserClient() {
  return supabaseSingleton
}

// Legacy client for backward compatibility (use browser client instead)
export const supabase = supabaseSingleton
