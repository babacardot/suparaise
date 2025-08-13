import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getFormSpecialistByType } from '@/lib/specialists'
import { getOrCreateBrowserProfileForStartup } from '@/lib/browser-use/profiles'
import { BrowserUseClient, buildSmartDataMapping } from '@/lib/utils/agent'
import { getModelForComplexity } from '@/lib/utils/model-config'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

/**
 * INTERNAL API: Start Browser Use task execution
 * 
 * This endpoint is called by:
 * 1. /api/agent/submit (for immediate starts)
 * 2. /functions/v1/process-queue (for queued submissions)
 * 
 * It handles the actual Browser Use task creation and execution
 */
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
    // 1. Try to fetch all data needed to start the task for fund submissions
    const { data: fundTaskData, error: fundTaskError } =
      await supabaseAdmin.rpc('get_submission_start_data', {
        p_submission_id: submissionId,
      })
    let taskData = fundTaskData

    // If not a fund submission, fallback to accelerator submission start-data
    if (fundTaskError || !taskData) {
      const { data: accelData, error: accelError } = await supabaseAdmin.rpc(
        'get_accelerator_submission_start_data',
        {
          p_submission_id: submissionId,
        },
      )
      if (accelError || !accelData) {
        console.error(
          `Failed to fetch task data for submission ${submissionId}:`,
          fundTaskError || accelError,
        )
        await supabaseAdmin
          .from('accelerator_submissions')
          .update({
            status: 'failed',
            agent_notes: 'Failed to fetch task data',
          })
          .eq('id', submissionId)
        return NextResponse.json(
          { error: 'Failed to fetch task data' },
          { status: 500 },
        )
      }
      taskData = accelData
    }

    const { startup, target, accelerator, founders, agentSettings, userPlan } = taskData

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
    
    // Add user plan info to smart data for instruction building
    smartData.userPlan = userPlan
    const applicationUrl =
      target?.application_url || accelerator?.application_url
    const entityName = target?.name || accelerator?.name
    const entityFormType = target?.form_type || accelerator?.form_type

    const specialist = getFormSpecialistByType(entityFormType, applicationUrl)
    
    // Add target type to smart data for plan identifier
    smartData.targetType = accelerator ? 'ACCELERATOR' : 'FUND'
    
    const taskInstruction = specialist.buildInstruction(
      applicationUrl,
      entityName,
      smartData,
    )
    const specialistBrowserConfig = specialist.getBrowserConfig?.() || {}
    const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/browser-use/webhook`

    // Determine optimal model based on form complexity
    const formComplexity = specialist.type === 'typeform' ? 'complex' :
                          specialist.type === 'google' || specialist.type === 'airtable' ? 'medium' :
                          'simple'

    const taskResponse = await browserUseClient.createTask(taskInstruction, {
      llm_model: getModelForComplexity(formComplexity), // Dynamic model selection
      max_agent_steps: 60,
      profile_id: browserProfile.profile_id,
      ...specialistBrowserConfig,
      // Ensure proxy is enabled for captcha handling
      use_proxy: true,
      allowed_domains: applicationUrl
        ? [new URL(applicationUrl).hostname]
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
