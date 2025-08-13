import { MODEL_CONFIG } from './model-config'

// Define types for better readability and type safety
export type Founder = {
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

type AgentSettings = {
  customInstructions?: string
  preferredTone?: string
}

type StartupForAgent = {
  name: string
  website: string
  description_short: string
  description_medium: string
  description_long: string
  industry: string
  location: string
  founded_year?: number
  is_incorporated: boolean
  legal_structure: string
  employee_count: number
  revenue_model: string
  funding_round: string
  funding_amount_sought: number
  pre_money_valuation: number
  investment_instrument: string
  competitors: string
  traction_summary: string
  market_summary: string
  mrr: number
  arr: number
  pitch_deck_url?: string
  intro_video_url?: string
  google_drive_url?: string
  kpis?: string
  risks?: string
  unfairAdvantage?: string
  useOfFunds?: string
}

type StartupData = {
  kpis?: string
  risks?: string
  unfairAdvantage?: string
  useOfFunds?: string
}

export type SmartDataMapping = {
  primary_data: Record<string, string>
  industry_variations: string[]
  location_variations: string[]
  description_by_length: {
    short: string
    medium: string
    long: string
  }
  knowledge_base_section: string
  customInstructions?: string
  preferredTone?: string
  userPlan?: {
    permission_level: 'FREE' | 'PRO' | 'MAX' | 'ENTERPRISE'
    is_subscribed: boolean
  }
  targetType?: 'FUND' | 'ACCELERATOR'
}

// Minimal Browser Use API Client for task creation
const BROWSER_USE_BASE_URL = 'https://api.browser-use.com/api/v1'

export class BrowserUseClient {
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
      llm_model: options.llm_model || MODEL_CONFIG.default, // Using configured default model
      max_agent_steps: options.max_agent_steps || 60,
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

// Helper function to build the data payload from startup and founder info
function buildDataPayload(
  startup: StartupForAgent,
  founders: Founder[],
): DataPayload {
  const leadFounder: Founder | undefined = founders?.[0]

  return {
    company_name: { value: startup.name },
    company_website: { value: startup.website },
    company_description_short: { value: startup.description_short },
    company_description_medium: { value: startup.description_medium },
    company_description_long: { value: startup.description_long },
    company_industry: { value: startup.industry },
    company_location: { value: startup.location },
    company_founded_year: { value: startup.founded_year || undefined },
    company_incorporation_status: { value: startup.is_incorporated },
    company_legal_structure: { value: startup.legal_structure },
    company_team_size: { value: startup.employee_count },
    company_revenue_model: { value: startup.revenue_model },
    company_funding_stage: { value: startup.funding_round },
    company_funding_amount_sought: { value: startup.funding_amount_sought },
    company_pre_money_valuation: { value: startup.pre_money_valuation },
    company_investment_instrument: { value: startup.investment_instrument },
    company_competitors: { value: startup.competitors },
    company_traction: { value: startup.traction_summary },
    company_market: { value: startup.market_summary },
    lead_founder_name: {
      value: leadFounder
        ? `${leadFounder.firstName} ${leadFounder.lastName}`
        : undefined,
    },
    lead_founder_email: { value: leadFounder?.email },
    lead_founder_phone: { value: leadFounder?.phone },
    lead_founder_linkedin: { value: leadFounder?.linkedin },
    founder_background: { value: leadFounder?.bio },
    lead_founder_github: { value: leadFounder?.githubUrl },
    lead_founder_twitter: { value: leadFounder?.twitterUrl },
    metrics_mrr: { value: startup.mrr },
    metrics_arr: { value: startup.arr },
    team_founders: {
      value: founders
        .map((f: Founder) => `${f.firstName} ${f.lastName} (${f.role})`)
        .join(', '),
    },
    asset_cloud_drive: { value: startup.google_drive_url },
    asset_pitch_deck: {
      value: startup.google_drive_url || startup.pitch_deck_url,
    },
    asset_demo_video: { value: startup.intro_video_url },
  }
}

// Smart data processing - build intelligence outside the agent context
export function buildSmartDataMapping(
  { startup, founders }: { startup: StartupForAgent; founders: Founder[] },
  agentSettings: AgentSettings | null,
): SmartDataMapping {
  const dataPayload = buildDataPayload(startup, founders)
  const primary_data: Record<string, string> = {}

  Object.entries(dataPayload).forEach(([key, field]) => {
    if (field.value && String(field.value).trim()) {
      primary_data[key] = String(field.value).trim()
    }
  })

  // Pre-compute industry variations
  const industry = primary_data.company_industry || ''
  const industry_variations = [
    industry,
    ...(industry.toLowerCase().includes('ai')
      ? [
          'Artificial Intelligence',
          'Machine Learning',
          'Technology',
          'Software',
        ]
      : []),
    ...(industry.toLowerCase().includes('saas')
      ? ['SaaS', 'Software', 'Technology', 'Cloud']
      : []),
    ...(industry.toLowerCase().includes('fintech')
      ? ['Financial Technology', 'Finance', 'Financial Services']
      : []),
    'Technology',
    'Software',
    'Tech',
    'Other',
  ].filter((v, i, arr) => arr.indexOf(v) === i)

  // Pre-compute location variations
  const location = primary_data.company_location || ''
  const location_variations = [
    location,
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

  // Build the new knowledge base section from startup data
  const startupData = startup as StartupData
  const knowledge_base_items = [
    { title: 'Key Performance Indicators (KPIs)', content: startupData?.kpis },
    { title: 'Challenges & Risks', content: startupData?.risks },
    { title: 'Our Unfair Advantage', content: startupData?.unfairAdvantage },
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
