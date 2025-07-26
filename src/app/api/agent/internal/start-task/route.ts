import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getFormSpecialistByType } from '@/lib/specialists'
import { getOrCreateBrowserProfileForStartup } from '@/lib/browser-profiles'
import { BrowserUseClient, buildSmartDataMapping } from '@/lib/utils/agent'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// This is an internal route, not to be exposed to the public
export async function POST(request: NextRequest) {
  const { submissionId } = await request.json()

  if (!submissionId) {
    return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 })
  }

  // Authenticate the request (e.g., using a secret header)
  const internalAuthToken = request.headers.get('Authorization')?.split(' ')[1]
  if (internalAuthToken !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Fetch all data needed to start the task
    const { data: taskData, error: taskDataError } = await supabaseAdmin.rpc(
      'get_submission_start_data',
      { p_submission_id: submissionId },
    )

    if (taskDataError || !taskData) {
      console.error(
        `Failed to fetch task data for submission ${submissionId}:`,
        taskDataError,
      )
      await supabaseAdmin
        .from('submissions')
        .update({ status: 'failed', agent_notes: 'Failed to fetch task data' })
        .eq('id', submissionId)
      return NextResponse.json(
        { error: 'Failed to fetch task data' },
        { status: 500 },
      )
    }

    const { startup, target, founders, agentSettings } = taskData

    // 2. Get or create a browser profile
    const browserProfile = await getOrCreateBrowserProfileForStartup(
      startup.id,
      startup.name,
    )

    // 3. Initialize Browser Use client and create the task
    const browserUseClient = new BrowserUseClient(
      process.env.BROWSERUSE_API_KEY!,
    )
    const smartData = buildSmartDataMapping(
      { startup, founders },
      agentSettings,
    )
    const specialist = getFormSpecialistByType(
      target.form_type,
      target.application_url,
    )
    const taskInstruction = specialist.buildInstruction(
      target.application_url,
      target.name,
      smartData,
    )
    const specialistBrowserConfig = specialist.getBrowserConfig?.() || {}
    const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/browser-use/webhook`

    const taskResponse = await browserUseClient.createTask(taskInstruction, {
      llm_model: 'claude-sonnet-4-20250514',
      max_agent_steps: 50,
      profile_id: browserProfile.profile_id,
      ...specialistBrowserConfig,
      allowed_domains: target.application_url
        ? [new URL(target.application_url).hostname]
        : undefined,
      webhook_url: webhookUrl,
    })

    const taskId = taskResponse.id
    const liveUrl =
      taskResponse.live_url || `https://cloud.browser-use.com/task/${taskId}`

    // 4. Update the submission with session data
    await supabaseAdmin.rpc('update_submission_session_data', {
      p_submission_id: submissionId,
      p_submission_type: 'fund',
      p_session_id: taskId,
      p_session_replay_url: liveUrl,
      p_screenshots_taken: 0,
      p_debug_data: {
        task_id: taskId,
        live_url: liveUrl,
        webhook_configured: true,
        browser_profile_id: browserProfile.profile_id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Task started successfully.',
      taskId,
      liveUrl,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error starting task'
    console.error(`Error starting task for submission ${submissionId}:`, error)
    await supabaseAdmin
      .from('submissions')
      .update({ status: 'failed', agent_notes: errorMessage })
      .eq('id', submissionId)

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
