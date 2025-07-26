import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getFormSpecialistByType,
  type SmartDataMapping,
} from '@/lib/specialists'
import { getOrCreateBrowserProfileForStartup } from '@/lib/browser-profiles'

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
}

type DataPayload = {
  [key: string]: DataPayloadField
}

// Minimal Browser Use API Client for task creation
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
      webhook_url?: string
      profile_id?: string
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
      enable_public_share: options.enable_public_share ?? true,
      webhook_url: options.webhook_url,
      profile_id: options.profile_id,
    }

    return this.makeRequest('/run-task', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }
}

// Define types for better readability and type safety
type AgentSettings = {
  customInstructions?: string
  preferredTone?: string
}

type StartupData = {
  kpis?: string
  risks?: string
  unfairAdvantage?: string
  useOfFunds?: string
}

// Smart data processing - build intelligence outside the agent context
function buildSmartDataMapping(
  dataPayload: DataPayload,
  startupData: StartupData | null,
  agentSettings: AgentSettings | null,
): SmartDataMapping {
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

  // Build the new knowledge base section
  const knowledge_base_items = [
    {
      title: 'Key Performance Indicators (KPIs)',
      content: startupData?.kpis,
    },
    { title: 'Challenges & Risks', content: startupData?.risks },
    {
      title: 'Our Unfair Advantage',
      content: startupData?.unfairAdvantage,
    },
    { title: 'How We Plan to Use Funds', content: startupData?.useOfFunds },
  ]

  const knowledge_base_section =
    knowledge_base_items.filter((item) => item.content).length > 0
      ? `
**AGENT KNOWLEDGE BASE:**
${knowledge_base_items
  .filter((item) => item.content)
  .map((item) => `**${item.title}:**\n${item.content}`)
  .join('\n\n')}`
      : ''

  return {
    primary_data,
    industry_variations,
    location_variations,
    description_by_length,
    knowledge_base_section,
    customInstructions: agentSettings?.customInstructions,
    preferredTone: agentSettings?.preferredTone,
  }
}

// Note: All specialist logic has been moved to the dedicated specialists directory
// This keeps the route.ts file clean and focused on request handling

export async function POST(request: NextRequest) {
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
    const [
      { data: startup, error: startupError },
      { data: target, error: targetError },
      { data: founders, error: foundersError },
      { data: agentSettings, error: agentSettingsError },
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
      supabaseAdmin.rpc('get_user_agent_settings', {
        p_user_id: userId,
        p_startup_id: startupId,
      }),
    ])

    if (
      startupError ||
      targetError ||
      foundersError ||
      agentSettingsError
    ) {
      console.error('❌ Failed to fetch Supabase data:', {
        startupError,
        targetError,
        foundersError,
        agentSettingsError,
      })
      return NextResponse.json(
        { error: 'Failed to fetch required data from Supabase.' },
        { status: 500 },
      )
    }

    // Process founder data to get the lead founder
    const leadFounder: Founder | undefined = (founders as Founder[])?.[0]

    // 2. Create a structured data payload for the agent
    const dataPayload: DataPayload = {
      company_name: {
        value: startup.name,
      },
      company_website: {
        value: startup.website,
      },
      company_description_short: {
        value: startup.description_short,
      },
      company_description_medium: {
        value: startup.description_medium,
      },
      company_description_long: {
        value: startup.description_long,
      },
      company_industry: {
        value: startup.industry,
      },
      company_location: {
        value: startup.location,
      },
      company_founded_year: {
        value: startup.founded_year || undefined,
      },
      company_incorporation_status: {
        value: startup.is_incorporated,
      },
      company_legal_structure: {
        value: startup.legal_structure,
      },
      company_team_size: {
        value: startup.employee_count,
      },
      company_revenue_model: {
        value: startup.revenue_model,
      },
      company_funding_stage: {
        value: startup.funding_round,
      },
      company_funding_amount_sought: {
        value: startup.funding_amount_sought,
      },
      company_pre_money_valuation: {
        value: startup.pre_money_valuation,
      },
      company_investment_instrument: {
        value: startup.investment_instrument,
      },
      company_competitors: {
        value: startup.competitors,
      },
      company_traction: {
        value: startup.traction_summary,
      },
      company_market: {
        value: startup.market_summary,
      },
      lead_founder_name: {
        value: leadFounder
          ? `${leadFounder.firstName} ${leadFounder.lastName}`
          : undefined,
      },
      lead_founder_email: {
        value: leadFounder?.email,
      },
      lead_founder_phone: {
        value: leadFounder?.phone,
      },
      lead_founder_linkedin: {
        value: leadFounder?.linkedin,
      },
      founder_background: {
        value: leadFounder?.bio,
      },
      lead_founder_github: {
        value: leadFounder?.githubUrl,
      },
      lead_founder_twitter: {
        value: leadFounder?.twitterUrl,
      },
      metrics_mrr: {
        value: startup.mrr,
      },
      metrics_arr: {
        value: startup.arr,
      },
      team_founders: {
        value: (founders as Founder[])
          .map((f: Founder) => `${f.firstName} ${f.lastName} (${f.role})`)
          .join(', '),
      },
      asset_pitch_deck: {
        value: startup.pitch_deck_url,
      },
      asset_demo_video: {
        value: startup.intro_video_url,
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

    const { submission_id: submissionId, status, queue_position } = queueData

    // If the submission was queued, return immediately
    if (status === 'queued') {
      return NextResponse.json({
        success: true,
        status: 'queued',
        queuePosition: queue_position,
        targetName: target.name,
        submissionId,
      })
    }

    // 4. Get or create a browser profile for the user
    const browserProfile = await getOrCreateBrowserProfileForStartup(
      startupId,
      startup.name || 'startup',
    )

    // 5. Initialize Browser Use client and create task
    const browserUseClient = new BrowserUseClient(BROWSER_USE_API_KEY)
    const smartData = buildSmartDataMapping(
      dataPayload,
      startup as StartupData,
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
      profile_id: browserProfile.profile_id, // Use the user-specific profile
      ...specialistBrowserConfig,
      allowed_domains: target.application_url
        ? [new URL(target.application_url).hostname]
        : undefined,
      webhook_url: webhookUrl,
    })

    const taskId = taskResponse.id
    const liveUrl =
      taskResponse.live_url || `https://cloud.browser-use.com/task/${taskId}`

    // 6. Update submission with task ID for webhook tracking
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
    
    // Update status to 'in_progress' right away
    await supabaseAdmin
      .from('submissions')
      .update({ status: 'in_progress' })
      .eq('id', submissionId)

    // 7. Return immediate success response
    return NextResponse.json({
      success: true,
      status: 'in_progress',
      targetName: target.name,
      submissionId,
      task_id: taskId,
      session_replay_url: liveUrl,
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
