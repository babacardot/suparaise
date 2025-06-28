import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database'

export async function POST(request: NextRequest) {
  try {
    const { startupId, targetId, userId } = await request.json()

    if (!startupId || !targetId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      )
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 },
      )
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke(
      'submit-application',
      {
        body: {
          startupId,
          targetId,
          userId,
        },
      },
    )

    if (error) {
      console.error('Edge function error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to submit application' },
        { status: 500 },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
