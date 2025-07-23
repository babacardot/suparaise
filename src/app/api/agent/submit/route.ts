import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  executeStagehandSubmission,
  startStagehandSession,
} from '@/lib/stagehand/server-actions'

export async function POST(request: NextRequest) {
  try {
    const {
      startupId,
      targetId,
      userId,
      targetType = 'fund',
    } = await request.json()

    if (!startupId || !targetId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      )
    }

    // Validate target type
    if (!['fund', 'angel', 'accelerator'].includes(targetType)) {
      return NextResponse.json(
        { error: 'Invalid target type' },
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

    // Start a new Browserbase session for this submission
    const session = await startStagehandSession()

    // Use the existing queue_submission function to create the submission record
    // For now, we'll pass the session ID as the browserbase_job_id for compatibility
    const { data, error } = await supabase.rpc('queue_submission', {
      p_user_id: userId,
      p_startup_id: startupId,
      p_target_id: targetId,
      p_browserbase_job_id: session.sessionId, // Use session ID for tracking
    })

    if (error) {
      console.error('Database error in agent submission:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to queue submission' },
        { status: 500 },
      )
    }

    const result = data as {
      error?: string
      message?: string
      success?: boolean
      submissionId?: string
      status?: string
    }

    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // If the submission was queued successfully, execute it with Stagehand
    if (result?.success && result?.submissionId) {
      try {
        // Execute the submission asynchronously using Stagehand
        // Note: In production, you might want to run this in a background job queue
        executeStagehandSubmission({
          submissionId: result.submissionId,
          userId,
          startupId,
          targetId,
          targetType: targetType as 'fund' | 'angel' | 'accelerator',
          sessionId: session.sessionId,
        }).catch((error) => {
          // Log errors but don't fail the initial response
          // The submission status will be updated to 'failed' by the executeStagehandSubmission function
          console.error('Stagehand submission execution failed:', error)
        })

        return NextResponse.json({
          success: true,
          message: result.message || 'Submission queued and processing started',
          submissionId: result.submissionId,
          status: result.status || 'in_progress',
          sessionId: session.sessionId,
          debugUrl: session.debugUrl, // Include debug URL for development
        })
      } catch (executionError) {
        console.error('Failed to start Stagehand execution:', executionError)

        // Update the submission status to failed
        await supabase.rpc('update_submission_status', {
          p_submission_id: result.submissionId,
          p_new_status: 'failed',
          p_agent_notes: 'Failed to start agent execution',
        })

        return NextResponse.json(
          {
            error: 'Failed to start agent execution',
            submissionId: result.submissionId,
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: result?.message || 'Submission processed successfully',
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
