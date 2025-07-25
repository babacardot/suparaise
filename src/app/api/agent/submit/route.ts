import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getFormSpecialistByType,
  type SmartDataMapping,
} from '@/lib/specialists'

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Browser Use API configuration
const BROWSER_USE_API_KEY = process.env.BROWSERUSE_API_KEY!
const BROWSER_USE_BASE_URL = 'https://api.browser-use.com/api/v1'

// Define types for better readability and type safety
type Founder = {
  firstName: string
  lastName: string
  role: string
  email?: string
  phone?: string
  linkedin?: string
  bio?: string
  githubUrl?: string
  personalWebsiteUrl?: string
  twitterUrl?: string
}

type DataPayloadField = {
  value: string | number | boolean | readonly string[] | undefined
  label_hints: string[]
}

type DataPayload = {
  [key: string]: DataPayloadField
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

// Enhanced Browser Use API Client with screenshot and media support
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

  async createTask(
    task: string,
    options: {
      llm_model?: string
      max_agent_steps?: number
      use_adblock?: boolean
      use_proxy?: boolean
      proxy_country_code?: string
      allowed_domains?: string[]
      save_browser_data?: boolean
      structured_output_json?: string
      browser_viewport_width?: number
      browser_viewport_height?: number
      highlight_elements?: boolean
      enable_public_share?: boolean
    } = {},
  ) {
    const payload = {
      task,
      llm_model: options.llm_model || 'gpt-4.1',
      max_agent_steps: options.max_agent_steps || 100,
      use_adblock: options.use_adblock ?? true,
      use_proxy: options.use_proxy ?? true,
      proxy_country_code: options.proxy_country_code || 'us',
      allowed_domains: options.allowed_domains,
      save_browser_data: options.save_browser_data ?? false,
      structured_output_json: options.structured_output_json,
      browser_viewport_width: options.browser_viewport_width || 1920,
      browser_viewport_height: options.browser_viewport_height || 1080,
      highlight_elements: options.highlight_elements ?? true,
      enable_public_share: options.enable_public_share ?? true, // Enable for live monitoring
    }

    return this.makeRequest('/run-task', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getTaskStatus(taskId: string) {
    return this.makeRequest(`/task/${taskId}/status`)
  }

  async getTaskDetails(taskId: string) {
    return this.makeRequest(`/task/${taskId}`)
  }

  async getTaskScreenshots(taskId: string) {
    return this.makeRequest(`/task/${taskId}/screenshots`)
  }

  async getTaskMedia(taskId: string) {
    return this.makeRequest(`/task/${taskId}/media`)
  }

  async stopTask(taskId: string) {
    return this.makeRequest(`/stop-task?task_id=${taskId}`, {
      method: 'PUT',
    })
  }

  async pauseTask(taskId: string) {
    return this.makeRequest(`/pause-task?task_id=${taskId}`, {
      method: 'PUT',
    })
  }

  async resumeTask(taskId: string) {
    return this.makeRequest(`/resume-task?task_id=${taskId}`, {
      method: 'PUT',
    })
  }

  async waitForCompletion(
    taskId: string,
    pollInterval: number = 3000,
    maxWaitTime: number = 600000,
  ): Promise<{
    status: string
    output: string
    session_id?: string
    steps?: unknown[]
    live_url?: string
  }> {
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      const details = await this.getTaskDetails(taskId)
      const status = details.status

      if (status === 'finished') {
        return details
      } else if (status === 'failed' || status === 'stopped') {
        throw new Error(`Task ${taskId} ended with status: ${status}`)
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval))
    }

    throw new Error(`Task ${taskId} timed out after ${maxWaitTime}ms`)
  }

  // Enhanced monitoring with step-by-step progress
  async monitorTaskWithProgress(
    taskId: string,
    onProgress?: (step: unknown) => void,
    pollInterval: number = 2000,
  ): Promise<{
    status: string
    output: string
    session_id?: string
    steps?: unknown[]
  }> {
    let lastStepCount = 0

    while (true) {
      const details = await this.getTaskDetails(taskId)
      const status = details.status
      const steps = details.steps || []

      // Report new steps if callback provided
      if (onProgress && steps.length > lastStepCount) {
        for (let i = lastStepCount; i < steps.length; i++) {
          onProgress(steps[i])
        }
        lastStepCount = steps.length
      }

      if (status === 'finished') {
        return details
      } else if (status === 'failed' || status === 'stopped') {
        throw new Error(`Task ${taskId} ended with status: ${status}`)
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval))
    }
  }
}

// Smart data processing - build intelligence outside the agent context
function buildSmartDataMapping(dataPayload: DataPayload): SmartDataMapping {
  // Extract and clean core data
  const primary_data: Record<string, string> = {}

  Object.entries(dataPayload).forEach(([key, field]) => {
    if (field.value && String(field.value).trim()) {
      primary_data[key] = String(field.value).trim()
    }
  })

  // Pre-compute industry variations to reduce agent decision complexity
  const industry = primary_data.company_industry || ''
  const industry_variations = [
    industry,
    // AI/ML variations
    ...(industry.toLowerCase().includes('ai')
      ? [
          'Artificial Intelligence',
          'Machine Learning',
          'Technology',
          'Software',
        ]
      : []),
    // SaaS variations
    ...(industry.toLowerCase().includes('saas')
      ? ['SaaS', 'Software', 'Technology', 'Cloud']
      : []),
    // Fintech variations
    ...(industry.toLowerCase().includes('fintech')
      ? ['Financial Technology', 'Finance', 'Financial Services']
      : []),
    // Default fallbacks
    'Technology',
    'Software',
    'Tech',
    'Other',
  ].filter((v, i, arr) => arr.indexOf(v) === i) // Remove duplicates

  // Pre-compute location variations
  const location = primary_data.company_location || ''
  const location_variations = [
    location,
    // Country variations
    ...(location.includes('United States') ? ['USA', 'US', 'America'] : []),
    ...(location.includes('United Kingdom')
      ? ['UK', 'Britain', 'England']
      : []),
    ...(location.includes('Germany') ? ['Deutschland', 'DE'] : []),
    ...(location.includes('Canada') ? ['CA'] : []),
    'Other',
  ].filter((v, i, arr) => arr.indexOf(v) === i)

  // Pre-organized descriptions by length
  const description_by_length = {
    short:
      primary_data.company_description_short || primary_data.company_name || '',
    medium:
      primary_data.company_description_medium ||
      primary_data.company_description_short ||
      '',
    long:
      primary_data.company_description_long ||
      primary_data.company_description_medium ||
      '',
  }

  return {
    primary_data,
    industry_variations,
    location_variations,
    description_by_length,
  }
}

// Note: All specialist logic has been moved to the dedicated specialists directory
// This keeps the route.ts file clean and focused on request handling

export async function POST(request: NextRequest) {
  let browserUseClient: BrowserUseClient | null = null
  let taskId: string | null = null

  try {
    const { startupId, targetId, userId } = await request.json()

    if (!startupId || !targetId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      )
    }

    // Validate Browser Use API key
    if (!BROWSER_USE_API_KEY) {
      return NextResponse.json(
        { error: 'Browser Use API key not configured' },
        { status: 500 },
      )
    }

    // 1. Fetch all necessary data from Supabase in parallel
    console.log('📊 Fetching startup data from Supabase...')
    const [
      { data: startup, error: startupError },
      { data: target, error: targetError },
      { data: founders, error: foundersError },
      { data: commonResponses, error: commonResponsesError },
    ] = await Promise.all([
      supabaseAdmin.rpc('get_user_startup_data', {
        p_user_id: userId,
        p_startup_id: startupId,
      }),
      supabaseAdmin.rpc('get_target_by_id', { p_target_id: targetId }),
      supabaseAdmin.rpc('get_startup_founders', {
        p_user_id: userId,
        p_startup_id: startupId,
      }),
      supabaseAdmin.rpc('get_common_responses', {
        p_startup_id: startupId,
        p_user_id: userId,
      }),
    ])

    if (
      startupError ||
      targetError ||
      foundersError ||
      commonResponsesError ||
      !Array.isArray(commonResponses)
    ) {
      console.error('❌ Failed to fetch Supabase data:', {
        startupError,
        targetError,
        foundersError,
        commonResponsesError,
        commonResponses,
      })
      return NextResponse.json(
        { error: 'Failed to fetch required data from Supabase.' },
        { status: 500 },
      )
    }

    console.log('✅ Successfully fetched startup data:', {
      startupName: startup?.name,
      targetName: target?.name,
      foundersCount: founders?.length || 0,
      commonResponsesCount: commonResponses?.length || 0,
    })

    // Process founder data to get the lead founder
    const leadFounder: Founder | undefined = (founders as Founder[])?.[0]

    // 2. Create a structured data payload for the agent
    const dataPayload: DataPayload = {
      company_name: {
        value: startup.name,
        label_hints: ['Company Name', 'Startup Name', 'Name', 'Business Name'],
      },
      company_website: {
        value: startup.website,
        label_hints: ['Website', 'URL', 'Company Website', 'Homepage'],
      },
      company_description_short: {
        value: startup.description_short,
        label_hints: [
          'Short Description',
          'Tell us about your company',
          'One-liner',
          'Tagline',
          'Brief Summary',
          'Company in one sentence',
        ],
      },
      company_description_medium: {
        value: startup.description_medium,
        label_hints: [
          'Elevator Pitch',
          'Summary',
          'Brief Description',
          'Company Overview',
          'Company Summary',
          'What does your company do?',
        ],
      },
      company_description_long: {
        value: startup.description_long,
        label_hints: [
          'Detailed Description',
          'Full Description',
          'Company Description',
          'Business Description',
        ],
      },
      company_industry: {
        value: startup.industry,
        label_hints: [
          'Industry',
          'Sector',
          'Market',
          'Category',
          'Vertical',
          'Business Type',
          'Field',
          'Domain',
          'Area of Focus',
          'Industry Focus',
          'Business Category',
          'Technology Focus',
          'Market Sector',
          'Business Vertical',
          'Industry Type',
        ],
      },
      company_location: {
        value: startup.location,
        label_hints: ['Location', 'Headquarters', 'City', 'Country', 'Address'],
      },
      company_founded_year: {
        value: startup.founded_year || undefined,
        label_hints: [
          'Founded Year',
          'Year Founded',
          'Founding Date',
          'Founded',
          'Year',
          'Established',
        ],
      },
      company_incorporation_status: {
        value: startup.is_incorporated,
        label_hints: ['Incorporation Status', 'Incorporated?', 'Legal Status'],
      },
      company_legal_structure: {
        value: startup.legal_structure,
        label_hints: ['Legal Structure', 'Entity Type', 'Business Structure'],
      },
      company_team_size: {
        value: startup.employee_count,
        label_hints: [
          'Team Size',
          'Employee Count',
          'Number of Employees',
          'Staff Size',
        ],
      },
      company_revenue_model: {
        value: startup.revenue_model,
        label_hints: ['Revenue Model', 'Business Model', 'Monetization'],
      },
      company_funding_stage: {
        value: startup.funding_round,
        label_hints: [
          'Funding Stage',
          'Funding Round',
          'Stage',
          'Investment Stage',
        ],
      },
      company_funding_amount_sought: {
        value: startup.funding_amount_sought,
        label_hints: [
          'Funding Amount Sought',
          'Raising',
          'Ask Amount',
          'Investment Amount',
        ],
      },
      company_pre_money_valuation: {
        value: startup.pre_money_valuation,
        label_hints: ['Pre-money Valuation', 'Valuation', 'Company Valuation'],
      },
      company_investment_instrument: {
        value: startup.investment_instrument,
        label_hints: ['Investment Instrument', 'Instrument', 'Investment Type'],
      },
      company_competitors: {
        value: startup.competitors,
        label_hints: ['Competitors', 'Competitive Landscape', 'Competition'],
      },
      company_traction: {
        value: startup.traction_summary,
        label_hints: ['Traction', 'Key Metrics', 'Progress', 'Milestones'],
      },
      company_market: {
        value: startup.market_summary,
        label_hints: ['Market', 'Market Size', 'TAM/SAM/SOM', 'Target Market'],
      },
      lead_founder_name: {
        value: leadFounder
          ? `${leadFounder.firstName} ${leadFounder.lastName}`
          : undefined,
        label_hints: ['Founder Name', 'Your Name', "Founder's Name", 'Name'],
      },
      lead_founder_email: {
        value: leadFounder?.email,
        label_hints: [
          'Contact Email',
          'Your Email',
          "Founder's Email",
          'Email Address',
        ],
      },
      lead_founder_phone: {
        value: leadFounder?.phone,
        label_hints: ['Phone Number', 'Contact Number', 'Mobile Number'],
      },
      lead_founder_linkedin: {
        value: leadFounder?.linkedin,
        label_hints: ['LinkedIn Profile', 'LinkedIn URL', 'LinkedIn'],
      },
      founder_background: {
        value: leadFounder?.bio,
        label_hints: ['Founder Background', 'Experience', 'Bio', 'Background'],
      },
      lead_founder_github: {
        value: leadFounder?.githubUrl,
        label_hints: ['GitHub Profile', 'GitHub URL', 'GitHub'],
      },
      lead_founder_twitter: {
        value: leadFounder?.twitterUrl,
        label_hints: [
          'Twitter Profile',
          'X Profile',
          'Twitter URL',
          'Social Media',
        ],
      },
      metrics_mrr: {
        value: startup.mrr,
        label_hints: ['MRR', 'Monthly Recurring Revenue', 'Monthly Revenue'],
      },
      metrics_arr: {
        value: startup.arr,
        label_hints: ['ARR', 'Annual Recurring Revenue', 'Annual Revenue'],
      },
      team_founders: {
        value: (founders as Founder[])
          .map((f: Founder) => `${f.firstName} ${f.lastName} (${f.role})`)
          .join(', '),
        label_hints: [
          'Founders',
          'Co-founder',
          'Team',
          'Who are the founders?',
          'Founding Team',
        ],
      },
      asset_pitch_deck: {
        value: startup.pitch_deck_url,
        label_hints: ['Pitch Deck', 'Deck', 'Presentation', 'Pitch Deck URL'],
      },
      asset_demo_video: {
        value: startup.intro_video_url,
        label_hints: ['Demo Video', 'Product Demo', 'Intro Video', 'Video URL'],
      },
    }

    // 3. Queue the submission in the database
    console.log('🔄 Queuing submission in database...')
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

    console.log('✅ Queue submission result:', queueData)
    const { submission_id: submissionId, status, queue_position } = queueData

    // If the submission was queued, return immediately
    if (status === 'queued') {
      console.log('📋 Submission queued at position:', queue_position)
      return NextResponse.json({
        success: true,
        status: 'queued',
        queuePosition: queue_position,
        targetName: target.name,
        submissionId,
      })
    }

    // 4. Initialize Browser Use client and create task
    console.log(
      '🚀 Starting Enhanced Browser Use form filling for:',
      startup.name,
      'using form_type:',
      target.form_type || 'URL-detected',
    )
    browserUseClient = new BrowserUseClient(BROWSER_USE_API_KEY)

    // Build smart data mapping to reduce agent context complexity
    const smartData = buildSmartDataMapping(dataPayload)

    // Get appropriate Browser Use specialist using database form_type or URL fallback
    const specialist = getFormSpecialistByType(
      target.form_type,
      target.application_url,
    )

    // Build specialized Browser Use instruction using the selected specialist
    const taskInstruction = specialist.buildInstruction(
      target.application_url,
      target.name,
      smartData,
    )

    console.log(
      '📝 Specialized Browser Use task instruction built for:',
      target.name,
      `(${specialist.name})`,
    )

    // Optimized structured output schema with thinking field for better decisions
    const outputSchema = {
      type: 'object',
      properties: {
        thinking: {
          type: 'string',
          description:
            'Step-by-step reasoning about form structure, field mappings, and strategy decisions. This improves decision quality.',
        },
        success: {
          type: 'boolean',
          description: 'Whether the form submission was successful',
        },
        summary: {
          type: 'string',
          description: 'Concise summary of actions and results',
        },
        fields_completed: {
          type: 'array',
          items: { type: 'string' },
          description: 'Form fields filled: field_name = value_used',
        },
        errors: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific errors encountered',
        },
        screenshots_taken: {
          type: 'number',
          description: 'Number of screenshots captured',
        },
      },
      required: ['thinking', 'success', 'summary', 'fields_completed'],
    }

    let result: BrowserUseResult
    let sessionId: string = 'unknown'

    try {
      // Get specialist-specific Browser Use configuration
      const specialistBrowserConfig = specialist.getBrowserConfig?.() || {}

      // Create optimized Browser Use task with specialist configuration
      const taskResponse = await browserUseClient.createTask(taskInstruction, {
        llm_model: 'claude-sonnet-4-20250514',
        max_agent_steps: 50,
        use_adblock: true,
        use_proxy: true,
        proxy_country_code: 'us',
        allowed_domains: target.application_url
          ? [new URL(target.application_url).hostname]
          : undefined,
        save_browser_data: false,
        structured_output_json: JSON.stringify(outputSchema),
        browser_viewport_width: 1920,
        browser_viewport_height: 1080,
        highlight_elements: false,
        enable_public_share: true,
        // Override with specialist-specific configuration
        ...specialistBrowserConfig,
      })

      taskId = taskResponse.id

      // Debug log the entire task response to understand what fields are available
      console.log(
        '🔍 Full Browser Use task response:',
        JSON.stringify(taskResponse, null, 2),
      )

      // Extract live URL with better error handling - check multiple possible field names
      const liveUrl =
        taskResponse.live_url ||
        taskResponse.liveUrl ||
        taskResponse.public_url ||
        taskResponse.publicUrl ||
        taskResponse.share_url ||
        taskResponse.shareUrl ||
        (taskId ? `https://cloud.browser-use.com/task/${taskId}` : null)

      console.log(`🎯 Enhanced Browser Use task created with ID: ${taskId}`)
      if (liveUrl) {
        console.log(`📺 Live monitoring available at: ${liveUrl}`)
      } else {
        console.log(`⚠️ Live monitoring URL not available in task response`)
        console.log(
          `🔍 Available response fields: ${Object.keys(taskResponse).join(', ')}`,
        )
      }

      // Efficient monitoring with minimal logging
      let stepCount = 0
      const taskResult = await browserUseClient.monitorTaskWithProgress(
        taskId!,
        () => {
          stepCount++
          // Only log every 5th step to reduce noise
          if (stepCount % 5 === 0) {
            console.log(`⚡ Step ${stepCount}: Processing...`)
          }
        },
        3000, // 3 second polling for cost efficiency
      )

      // Extract session ID if available
      sessionId = taskResult.session_id || taskId || 'unknown'

      // Fetch screenshots and media after completion
      let screenshotUrls: string[] = []
      try {
        const screenshots = await browserUseClient.getTaskScreenshots(taskId!)
        screenshotUrls = screenshots.screenshots || []
        console.log(`📸 Retrieved ${screenshotUrls.length} screenshots`)
      } catch (e) {
        console.warn('Could not retrieve screenshots:', e)
      }

      // Parse the optimized structured output
      let parsedOutput
      try {
        parsedOutput = JSON.parse(taskResult.output || '{}')
        console.log(
          `🧠 Agent thinking: ${parsedOutput.thinking?.substring(0, 100)}...`,
        )
      } catch {
        console.warn('Failed to parse structured output, using fallback')
        parsedOutput = {
          thinking: 'Task executed without structured output',
          success: taskResult.status === 'finished',
          summary: taskResult.output || 'Task completed efficiently',
          fields_completed: [],
          errors:
            taskResult.status === 'failed' ? ['Task failed to complete'] : [],
          screenshots_taken: stepCount,
        }
      }

      console.log(`📊 Task completed efficiently with ${stepCount} steps`)

      result = {
        success: parsedOutput.success && taskResult.status === 'finished',
        summary: parsedOutput.summary || taskResult.output,
        fields_completed: parsedOutput.fields_completed || [],
        errors: parsedOutput.errors || [],
        task_id: taskId || undefined,
        session_id: sessionId,
        screenshots_taken: parsedOutput.screenshots_taken || stepCount,
        output: taskResult.output,
        live_url: liveUrl,
        screenshot_urls: screenshotUrls,
      }
    } catch (error: unknown) {
      console.error('Enhanced Browser Use error:', error)
      let errorMessage =
        'An unknown error occurred during enhanced form filling.'
      if (error instanceof Error) {
        errorMessage = `Enhanced form filling failed: ${error.message}`
      }

      result = {
        success: false,
        error_reason: errorMessage,
        failed_field_label: 'Unknown',
        failed_field_value: 'Unknown',
        screenshots_taken: 0,
        task_id: taskId || undefined,
        session_id: sessionId,
      }
    }

    // 5. Update submission record with enhanced session data and final status
    if (taskId) {
      console.log('💾 Updating submission with session data...')
      try {
        await supabaseAdmin.rpc('update_submission_session_data', {
          p_submission_id: submissionId,
          p_submission_type: 'fund',
          p_session_id: taskId,
          p_session_replay_url: `https://cloud.browser-use.com/task/${taskId}`,
          p_screenshots_taken: result.screenshots_taken || 0,
          p_debug_data: {
            browser_use_result: result,
            task_id: taskId,
            session_id: sessionId,
            live_url: result.live_url,
            screenshot_urls: result.screenshot_urls,
            enhanced_monitoring: true,
            verbose_logging: true,
          },
        })
        console.log('✅ Session data updated successfully')
      } catch (sessionError) {
        console.error('❌ Failed to update session data:', sessionError)
        // Don't fail the entire request if session update fails
      }
    }

    console.log('📝 Updating submission status...')
    try {
      await supabaseAdmin
        .from('submissions')
        .update({
          status: result.success ? 'completed' : 'failed',
          agent_notes: result.success ? result.summary : result.error_reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', submissionId)
      console.log('✅ Submission status updated successfully')
    } catch (statusUpdateError) {
      console.error('❌ Failed to update submission status:', statusUpdateError)
    }

    // 6. Asynchronously trigger the queue processor to start the next job
    console.log(`Triggering queue processor for startup ${startupId}...`)
    fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-queue`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    ).catch((e) => console.error('Failed to trigger queue processor:', e))

    return NextResponse.json({
      success: true,
      status: result.success ? 'completed' : 'failed',
      targetName: target.name,
      submissionId,
      result,
      task_id: taskId,
      session_id: sessionId,
      session_replay_url: taskId
        ? `https://cloud.browser-use.com/task/${taskId}`
        : null,
      live_url: result.live_url,
      screenshots_taken: result.screenshots_taken,
    })
  } catch (error: unknown) {
    // Clean up task if it was created
    if (browserUseClient && taskId) {
      try {
        await browserUseClient.stopTask(taskId)
      } catch (e) {
        console.warn('Failed to stop Browser Use task during cleanup:', e)
      }
    }

    let errorMessage =
      'An unknown error occurred in the Enhanced Browser Use API.'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    console.error('Enhanced Browser Use submission API error:', error)
    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
      },
      { status: 500 },
    )
  }
}
