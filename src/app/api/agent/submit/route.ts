import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function startAgentTask(submissionId: string) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/agent/internal/start-task`
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.INTERNAL_API_SECRET}`,
      },
      body: JSON.stringify({ submissionId }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        `Failed to start internal task: ${errorData.error || response.statusText}`,
      )
    }
    return await response.json()
  } catch (error) {
    console.error(`Error calling internal start-task API:`, error)
    // Mark submission as failed if the internal API call fails
    await supabaseAdmin
      .from('submissions')
      .update({ status: 'failed', agent_notes: 'Internal API error' })
      .eq('id', submissionId)
    throw error // Re-throw to be caught by the main handler
  }
}

export async function POST(request: NextRequest) {
  try {
    const { startupId, targetId, userId } = await request.json()

    if (!startupId || !targetId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      )
    }

    // 1. Fetch target name for response messages
    const { data: target, error: targetError } = await supabaseAdmin
      .from('targets')
      .select('name')
      .eq('id', targetId)
      .single()

    if (targetError) {
      console.error('❌ Failed to fetch target name:', targetError)
      return NextResponse.json(
        { error: 'Failed to fetch target information.' },
        { status: 500 },
      )
    }

    // 2. Queue the submission in the database
    const { data: queueData, error: queueError } = await supabaseAdmin.rpc(
      'queue_submission',
      {
        p_user_id: userId,
        p_startup_id: startupId,
        p_target_id: targetId,
      },
    )

    if (queueError) {
      console.error('❌ Queue submission error:', queueError)
      return NextResponse.json({ error: queueError.message }, { status: 500 })
    }

    const { submission_id: submissionId, status, queue_position } = queueData

    // 3. Handle response based on queue status
    if (status === 'queued') {
      return NextResponse.json({
        success: true,
        status: 'queued',
        queuePosition: queue_position,
        targetName: target.name,
        submissionId,
      })
    }

    // If not queued, it's ready to start immediately.
    // Call the internal API to start the task.
    const taskResponse = await startAgentTask(submissionId)

    // 4. Return immediate success response
    return NextResponse.json({
      success: true,
      status: 'in_progress',
      targetName: target.name,
      submissionId,
      task_id: taskResponse.taskId,
      session_replay_url: taskResponse.liveUrl,
    })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred during submission.'
    console.error('Submission API error:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
