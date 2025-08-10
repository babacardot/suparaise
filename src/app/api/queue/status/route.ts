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

    // Enforce a server-side timeout so we don't hang the UI
    const TIMEOUT_MS = 4500
    const timeout = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(
        () => resolve({ data: null, error: new Error('Timeout') }),
        TIMEOUT_MS,
      ),
    )

    // Call the get_queue_status RPC function with timeout protection
    const rpcCall = supabase.rpc('get_queue_status', {
      p_user_id: userId,
      p_startup_id: startupId,
    })

    const raced = (await Promise.race([rpcCall, timeout])) as
      | { data: unknown; error: null }
      | { data: null; error: Error }

    if ('error' in raced && raced.error) {
      // Soft-fallback to permissive defaults to avoid blocking submissions UI
      return NextResponse.json({
        maxParallel: 1,
        maxQueue: 3,
        currentInProgress: 0,
        currentQueued: 0,
        availableSlots: 1,
        availableQueueSlots: 3,
        canSubmitMore: true,
        _fallback: true,
      })
    }

    return NextResponse.json(raced.data)
  } catch (error) {
    console.error('Queue status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
