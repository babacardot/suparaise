import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId, startupId } = await request.json()

    if (!userId || !startupId) {
      return NextResponse.json(
        { error: 'Missing userId or startupId' },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    // Call the get_queue_status RPC function
    const { data: queueStatus, error: queueError } = await supabase.rpc(
      'get_queue_status',
      {
        p_user_id: userId,
        p_startup_id: startupId,
      },
    )

    if (queueError) {
      console.error('Error fetching queue status:', queueError)
      return NextResponse.json(
        { error: 'Failed to fetch queue status' },
        { status: 500 },
      )
    }

    return NextResponse.json(queueStatus)
  } catch (error) {
    console.error('Queue status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
