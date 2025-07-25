import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type SubmissionDetails = {
  id: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  agent_notes: string | null
  session_id: string | null
  error?: string
}

async function getBrowserUseTaskStatus(taskId: string) {
  const apiKey = process.env.BROWSERUSE_API_KEY
  if (!apiKey) {
    throw new Error('BROWSERUSE_API_KEY is not set')
  }

  const response = await fetch(
    `https://api.browser-use.com/api/v1/task/${taskId}/status`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(
      `Browser Use status check failed for task ${taskId}:`,
      errorText,
    )
    throw new Error(`Browser Use API error: ${response.statusText}`)
  }

  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    const { submissionId } = await request.json()

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Missing submissionId' },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    // 1. Get the submission details from our database
    const { data: submissionDetails, error: submissionError } =
      await supabase.rpc('get_submission_details', {
        p_submission_id: submissionId,
      })

    if (submissionError || !submissionDetails) {
      return NextResponse.json(
        { error: 'Failed to fetch submission details' },
        { status: 500 },
      )
    }

    const submission = submissionDetails as SubmissionDetails

    // If there's no session_id, return our current DB status
    if (!submission.session_id) {
      return NextResponse.json({
        submissionId,
        status: submission.status,
        agentNotes: submission.agent_notes,
        lastChecked: new Date().toISOString(),
      })
    }

    const taskId = submission.session_id

    try {
      // 2. Get the latest task status from Browser Use API
      const browserUseStatus = await getBrowserUseTaskStatus(taskId)
      const taskStatus = browserUseStatus.toLowerCase()

      // If the task is still running on Browser Use, return our current DB status
      if (
        [
          'pending',
          'in_progress',
          'running',
          'initializing',
          'started',
        ].includes(taskStatus)
      ) {
        return NextResponse.json({
          submissionId,
          status: submission.status,
          agentNotes: submission.agent_notes,
          lastChecked: new Date().toISOString(),
          browserUseStatus: taskStatus,
        })
      }

      // If the task is finished or failed, update our database
      const finalStatus: 'completed' | 'failed' =
        taskStatus === 'finished' ? 'completed' : 'failed'

      // Update the submission status in our database
      const { error: updateError } = await supabase.rpc(
        'update_submission_status',
        {
          p_submission_id: submissionId,
          p_new_status: finalStatus,
          p_agent_notes:
            submission.agent_notes || `Task ${finalStatus} via Browser Use`,
        },
      )

      if (updateError) {
        console.error('Failed to update submission status:', updateError)
        // Continue anyway - we'll return the status from Browser Use
      }

      // Return the status from Browser Use even if DB update fails, so client knows the final state
      return NextResponse.json({
        submissionId,
        status: finalStatus,
        agentNotes:
          submission.agent_notes || `Task ${finalStatus} via Browser Use`,
        lastChecked: new Date().toISOString(),
        browserUseStatus: taskStatus,
        sessionUrl: `https://cloud.browser-use.com/task/${taskId}`,
      })
    } catch (browserUseError) {
      console.error('Browser Use API error:', browserUseError)

      // If Browser Use API fails, return our current DB status
      return NextResponse.json({
        submissionId,
        status: submission.status,
        agentNotes: submission.agent_notes,
        lastChecked: new Date().toISOString(),
        error: 'Failed to check Browser Use status',
      })
    }
  } catch (error) {
    console.error('Submission status check error:', error)
    return NextResponse.json(
      {
        error: 'Failed to check submission status',
        submissionId: request.body
          ? JSON.parse(await request.text()).submissionId
          : undefined,
      },
      { status: 500 },
    )
  }
}
