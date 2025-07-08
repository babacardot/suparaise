import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { startupId, submissionId, submissionType, userId } =
      await request.json()

    if (!startupId || !submissionId || !submissionType || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      )
    }

    // Validate submission type
    if (!['fund', 'angel', 'accelerator'].includes(submissionType)) {
      return NextResponse.json(
        { error: 'Invalid submission type' },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call the retry_submission function
    const { data, error } = await supabase.rpc('retry_submission', {
      p_user_id: userId,
      p_startup_id: startupId,
      p_submission_id: submissionId,
      p_submission_type: submissionType,
    })

    if (error) {
      console.error('Database error in retry submission:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to retry submission' },
        { status: 500 },
      )
    }

    const result = data as {
      error?: string
      message?: string
      success?: boolean
    }
    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result?.message || 'Submission retry initiated successfully',
      ...result,
    })
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
