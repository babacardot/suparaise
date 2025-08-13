import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const BROWSER_USE_API_KEY = process.env.BROWSERUSE_API_KEY!
const BROWSER_USE_BASE_URL = 'https://api.browser-use.com/api/v1'
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET!
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

type SubmissionOutcome = 'completed' | 'admin_review'

type TaskResultPayload = {
  status: string
  output?: string
  error_reason?: string
}

const analyzeSubmissionOutcome = async (
  taskResult: TaskResultPayload,
): Promise<SubmissionOutcome> => {
  try {
    const summary = taskResult.output || ''
    const errorReason = taskResult.error_reason || ''
    let thinking = ''
    try {
      thinking = JSON.parse(taskResult.output || '{}').thinking || ''
    } catch {
      // Ignore if output is not JSON
    }

    const prompt = `You are an expert analyst for a VC fundraising automation platform. Your job is to determine the final outcome of a web automation task that filled out an application form.
Based on the provided agent logs, summary, and error messages, you must decide if the submission was truly 'completed' or needs 'admin_review'.

**Analysis Data:**
- **Agent's Final Status:** ${taskResult.status}
- **Agent's Summary / Output:** ${summary}
- **Agent's Error Reason:** ${errorReason}
- **Agent's Reasoning Log:** ${thinking}

**Instructions:**
1. Read all the provided data carefully.
2. Look for DEFINITIVE evidence of success, such as "application submitted successfully", "thank you for your application", "submission received", "confirmation email sent".
3. ONLY mark as 'completed' if there is CLEAR, UNAMBIGUOUS evidence that the form was successfully submitted and confirmed.
4. If there is ANY uncertainty, ambiguity, error messages, timeouts, or if the outcome is unclear, mark as 'admin_review'.
5. The agent's own 'finished' status is NOT sufficient - focus on the actual submission outcome.
6. Your response MUST be a single word: either \`completed\` or \`admin_review\`. Do not provide any other text or explanation.

**Final Verdict: completed or admin_review? (completed/admin_review):**`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const resultText =
      response.content[0].type === 'text'
        ? response.content[0].text.trim().toLowerCase()
        : 'failed'

    if (resultText === 'completed') {
      return 'completed'
    }
    return 'admin_review'
  } catch (error) {
    console.error('AI submission analysis failed:', error)
    // Default to admin_review if AI analysis encounters an error
    return 'admin_review'
  }
}

type BrowserUseResult = {
  success: boolean
  summary?: string
  fields_completed?: string[]
  errors?: string[]
  task_id?: string
  session_id?: string
  screenshots_taken: number
  error_reason?: string
  failed_field_label?: string
  failed_field_value?: string
  output?: string
  live_url?: string
  screenshot_urls?: string[]
}

class BrowserUseClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, baseUrl: string = BROWSER_USE_BASE_URL) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(
        `Browser Use API error (${response.status}): ${errorData}`,
      )
    }

    return response.json()
  }

  async getTaskDetails(taskId: string) {
    return this.makeRequest(`/task/${taskId}`)
  }

  async getTaskScreenshots(taskId: string) {
    return this.makeRequest(`/task/${taskId}/screenshots`)
  }
}

const findSubmission = async (taskId: string) => {
  const tables = ['submissions', 'angel_submissions', 'accelerator_submissions']
  for (const table of tables) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('id, startup_id')
      .eq('session_id', taskId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116: "exact one row not found"
      console.error(`Error searching in ${table} for task ${taskId}:`, error)
    }
    if (data) {
      return { ...data, table }
    }
  }
  return null
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${INTERNAL_API_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { taskId } = await request.json()
  if (!taskId) {
    return NextResponse.json({ error: 'Missing taskId' }, { status: 400 })
  }

  const browserUseClient = new BrowserUseClient(BROWSER_USE_API_KEY)
  let result: BrowserUseResult
  let taskStatus: string = 'failed' // Default to failed

  try {
    const submissionInfo = await findSubmission(taskId)
    if (!submissionInfo) {
      throw new Error(`No submission found for task ID ${taskId}`)
    }

    const { id: submissionId, startup_id: startupId, table } = submissionInfo

    const taskResult = await browserUseClient.getTaskDetails(taskId)
    taskStatus = taskResult.status

    let screenshotUrls: string[] = []
    if (taskStatus === 'finished' || taskStatus === 'failed') {
      try {
        const screenshots = await browserUseClient.getTaskScreenshots(taskId)
        screenshotUrls = screenshots.screenshots || []
      } catch (e) {
        console.warn(`Could not retrieve screenshots for task ${taskId}:`, e)
      }
    }

    let parsedOutput
    try {
      parsedOutput = JSON.parse(taskResult.output || '{}')
    } catch {
      parsedOutput = {
        thinking: 'Task result was not valid JSON.',
        success: false,
        summary: taskResult.output || 'Task completed with non-JSON output.',
        fields_completed: [],
        errors:
          taskStatus === 'failed'
            ? ['Task failed to complete']
            : ['Invalid output'],
      }
    }

    const finalStatus = await analyzeSubmissionOutcome(taskResult)

    result = {
      success: finalStatus === 'completed',
      summary: parsedOutput.summary || taskResult.output,
      fields_completed: parsedOutput.fields_completed || [],
      errors: parsedOutput.errors || [],
      task_id: taskId,
      session_id: taskResult.session_id || taskId,
      screenshots_taken: screenshotUrls.length,
      output: taskResult.output,
      live_url: taskResult.live_url,
      screenshot_urls: screenshotUrls,
      error_reason:
        taskStatus === 'failed'
          ? taskResult.error_reason || 'Task failed'
          : undefined,
    }

    // Create brief summary for email notifications
    const briefSummary = result.success
      ? 'Application successfully submitted'
      : 'Application submission requires admin review'

    // Update submission record with final data
    const { error: updateError } = await supabaseAdmin
      .from(table)
      .update({
        status: finalStatus,
        agent_notes: briefSummary,
        screenshots_taken: result.screenshots_taken,
        debug_data: {
          task_id: taskId,
          final_analysis: finalStatus,
          brief_summary: briefSummary,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId)

    if (updateError) {
      throw new Error(
        `Failed to update submission ${submissionId}: ${updateError.message}`,
      )
    }

    console.log(
      `✅ Processed result for task ${taskId}, submission ${submissionId} in table ${table}. Status: ${finalStatus}`,
    )

    // Only send customer emails for successful submissions
    if (finalStatus === 'completed') {
      const emailPayload = {
        emailType: 'agent_completion_customer',
        submissionId: submissionId,
      }
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify(emailPayload),
      }).catch((e) =>
        console.warn(
          `Failed to send completion email for submission ${submissionId}:`,
          e,
        ),
      )
    }

    // Admin email - send appropriate email based on outcome
    const adminEmailType =
      finalStatus === 'admin_review'
        ? 'agent_admin_review'
        : 'agent_completion_admin'
    const adminEmailPayload = {
      emailType: adminEmailType,
      submissionId: submissionId,
    }
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(adminEmailPayload),
    }).catch((e) =>
      console.warn(
        `Failed to send admin ${adminEmailType} email for submission ${submissionId}:`,
        e,
      ),
    )

    // Asynchronously trigger the queue processor to start the next job
    fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-queue`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ startup_id: startupId }),
      },
    ).catch((e) =>
      console.error(
        `Failed to trigger queue processor for startup ${startupId}:`,
        e,
      ),
    )

    return NextResponse.json({ success: true, message: 'Result processed.' })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error(`Failed to process result for task ${taskId}:`, errorMessage)

    // Attempt to mark submission for admin review if we have the ID
    const submissionInfo = await findSubmission(taskId)
    if (submissionInfo) {
      await supabaseAdmin
        .from(submissionInfo.table)
        .update({
          status: 'admin_review',
          agent_notes: `Failed to process result: ${errorMessage}`,
        })
        .eq('id', submissionInfo.id)
    }

    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 },
    )
  }
}
