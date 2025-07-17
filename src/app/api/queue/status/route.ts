import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type SubmissionDetails = {
  id: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  agent_notes: string | null
  hyperbrowser_job_id: string | null
  error?: string
}

async function getJobStatus(jobId: string) {
  const apiKey = process.env.HYPERBROWSER_API_KEY
  if (!apiKey) {
    throw new Error('HYPERBROWSER_API_KEY is not set')
  }

  const response = await fetch(
    `https://api.hyperbrowser.ai/api/task/claude-computer-use/${jobId}`,
    {
      headers: {
        'X-API-KEY': apiKey,
      },
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(
      `Hyperbrowser status check failed for job ${jobId}:`,
      errorText,
    )
    throw new Error(`Hyperbrowser API error: ${response.statusText}`)
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

    // 1. Get submission details from our DB
    const { data, error: detailsError } = await supabase.rpc(
      'get_submission_details',
      { p_submission_id: submissionId },
    )
    const submissionDetails = data as SubmissionDetails

    if (detailsError || (submissionDetails && submissionDetails.error)) {
      console.error(
        'Error fetching submission details:',
        detailsError || submissionDetails.error,
      )
      return NextResponse.json(
        { error: 'Failed to fetch submission details' },
        { status: 500 },
      )
    }

    if (!submissionDetails) {
      return NextResponse.json(
        { error: 'Submission not found or access denied' },
        { status: 404 },
      )
    }

    // If status is already final, return it right away
    if (
      submissionDetails.status === 'completed' ||
      submissionDetails.status === 'failed'
    ) {
      return NextResponse.json(submissionDetails)
    }

    const jobId = submissionDetails.hyperbrowser_job_id
    if (!jobId) {
      return NextResponse.json(
        { error: 'Submission is missing a job ID' },
        { status: 400 },
      )
    }

    // 2. Get the latest job status from Hyperbrowser API
    const jobStatusResult = await getJobStatus(jobId)
    const hyperbrowserStatus = jobStatusResult.status.toLowerCase()

    // If the job is still running on Hyperbrowser, return our current DB status
    if (['pending', 'in_progress', 'running'].includes(hyperbrowserStatus)) {
      return NextResponse.json({
        id: submissionDetails.id,
        status: 'in_progress',
        agent_notes: 'Agent is currently processing the application.',
      })
    }

    // 3. If the job is finished, update our database
    const finalStatus =
      hyperbrowserStatus === 'completed' ? 'completed' : 'failed'
    const finalNotes =
      jobStatusResult.output ||
      jobStatusResult.error ||
      'Agent finished with no output.'

    const { error: updateError } = await supabase.rpc(
      'update_submission_status',
      {
        p_submission_id: submissionId,
        p_new_status: finalStatus,
        p_agent_notes: finalNotes,
      },
    )

    if (updateError) {
      console.error('Error updating final submission status:', updateError)
      // Return the status from Hyperbrowser even if DB update fails, so client knows the final state
      return NextResponse.json(
        {
          id: submissionId,
          status: finalStatus,
          agent_notes: finalNotes,
          error: 'Failed to save final status to database.',
        },
        { status: 500 },
      )
    }

    // Return the final, updated status
    return NextResponse.json({
      id: submissionId,
      status: finalStatus,
      agent_notes: finalNotes,
    })
  } catch (error) {
    console.error('Queue status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
