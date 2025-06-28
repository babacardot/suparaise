import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, startupId } = await request.json()

    if (!userId || !startupId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)('get_queue_status', {
      p_user_id: userId,
      p_startup_id: startupId,
    })

    if (error) {
      console.error('Error fetching queue status:', error)
      return NextResponse.json(
        { error: 'Failed to fetch queue status' },
        { status: 500 },
      )
    }

    if (data && typeof data === 'object' && 'error' in data) {
      return NextResponse.json({ error: data.error }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Queue status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
