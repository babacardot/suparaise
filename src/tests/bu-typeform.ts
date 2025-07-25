/**
 * Comprehensive test file for Browser Use form filling functionality
 * This mirrors the actual implementation in route.ts
 *
 * Required environment variables:
 * - BROWSERUSE_API_KEY: Your Browser Use API key
 * - ANTHROPIC_API_KEY: Your Anthropic API key for AI assistance
 *
 * FORM STATE PERSISTENCE ISSUE & SOLUTIONS:
 * ========================================
 *
 * PROBLEM: When testing forms repeatedly, you may encounter:
 * - Forms appearing pre-filled with previous data
 * - "Already submitted" messages
 * - Cached form states that prevent fresh submissions
 *
 * ROOT CAUSES:
 * - Browser cookies and localStorage persistence
 * - Typeform's submission tracking
 * - Session state caching by form providers
 *
 * SOLUTIONS IMPLEMENTED:
 * 1. **URL Cache Busting**: Each test run uses unique URL parameters
 * 2. **Session Clearing**: save_browser_data: false prevents data persistence
 * 3. **Form State Detection**: Agent detects and handles pre-filled forms
 * 4. **Fresh Session Instructions**: Agent refreshes pages and clears fields
 * 5. **Randomized Parameters**: Unique timestamps and random IDs per test
 *
 * To run this test:
 * 1. Set up the required environment variables in your .env file
 * 2. Run: pnpm run agent:test
 */

import { config } from 'dotenv'
config()

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
}

// Browser Use API configuration
const BROWSER_USE_API_KEY = process.env.BROWSERUSE_API_KEY!
const BROWSER_USE_BASE_URL = 'https://api.browser-use.com/api/v1'

// Utility function to create fresh URLs to prevent form caching
const createFreshUrl = (baseUrl: string): string => {
  const url = new URL(baseUrl)
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(7)

  // Add cache-busting parameters
  url.searchParams.set('test_session', timestamp.toString())
  url.searchParams.set('cache_bust', randomId)
  url.searchParams.set('_t', timestamp.toString()) // Additional timestamp param

  return url.toString()
}

// Browser Use API Client (copied from route.ts)
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
    } = {},
  ) {
    const payload = {
      task,
      llm_model: options.llm_model || 'gpt-4.1',
      max_agent_steps: options.max_agent_steps || 50,
      use_adblock: options.use_adblock ?? true,
      use_proxy: options.use_proxy ?? true,
      proxy_country_code: options.proxy_country_code || 'us',
      allowed_domains: options.allowed_domains,
      save_browser_data: options.save_browser_data ?? false,
      structured_output_json: options.structured_output_json,
      browser_viewport_width: options.browser_viewport_width || 1280,
      browser_viewport_height: options.browser_viewport_height || 720,
      highlight_elements: options.highlight_elements ?? true,
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

  async stopTask(taskId: string) {
    return this.makeRequest(`/stop-task?task_id=${taskId}`, {
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
}

// Smart data processing - matches route.ts optimized approach
function buildSmartDataMapping(dataPayload: DataPayload): {
  primary_data: Record<string, string>
  industry_variations: string[]
  location_variations: string[]
  description_by_length: { short: string; medium: string; long: string }
} {
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

// Optimized form filling instruction - matches route.ts new approach
function buildOptimizedInstruction(
  targetUrl: string,
  targetName: string,
  smartData: ReturnType<typeof buildSmartDataMapping>,
): string {
  // Convert smart data to readable format for the AI
  const dataLines: string[] = []
  Object.entries(smartData.primary_data).forEach(([key, value]) => {
    if (value && value.trim()) {
      dataLines.push(`${key}: "${value}"`)
    }
  })

  return `You are a form-filling automation agent. Navigate to ${targetUrl} and complete the application form for ${targetName}.

**STARTUP DATA:**
${dataLines.slice(0, 15).join('\n')} // Limit to essential fields to control tokens

**INDUSTRY OPTIONS (try in order):** ${smartData.industry_variations.slice(0, 5).join(', ')}
**LOCATION OPTIONS (try in order):** ${smartData.location_variations.slice(0, 5).join(', ')}

**DESCRIPTIONS BY LENGTH:**
- Short: "${smartData.description_by_length.short}"
- Medium: "${smartData.description_by_length.medium}" 
- Long: "${smartData.description_by_length.long}"

**EXECUTION STRATEGY:**

**1. Navigation & Assessment**
- Navigate to the URL and take initial screenshot
- If form is pre-filled or shows "already submitted", refresh or find "Start Over"
- Locate the application form (look for "Apply Now", "Start Application" buttons)

**2. Critical Dropdown Handling**
- ALWAYS click dropdown first to see all options
- Scan options thoroughly before deciding
- Priority: Exact match → Close match → Category match → "Other" → First option
- NEVER leave typed text - must select from dropdown options
- 90% of failures happen when dropdowns have typed text instead of selections

**3. Form Filling Strategy**
- Use exact data provided above - NO improvisation
- For industry: Try provided variations in order until one works
- For location: Try provided variations in order until one works  
- For descriptions: Match field length (short/medium/long) to appropriate description
- For dropdowns: Follow critical handling protocol above
- Take screenshots at major steps for debugging

**4. Submission Process**
- Progress through multi-step forms systematically
- Handle "Next", "Continue", "Submit" buttons appropriately
- Capture final confirmation screens
- If errors occur, attempt resolution then document

**SUCCESS CRITERIA:**
- Form successfully submitted with confirmation
- Maximum fields completed accurately using provided data
- All dropdowns show selected values (not typed text)
- Professional responses using exact descriptions provided

Complete the application systematically and submit successfully.`
}

// Comprehensive test function using Browser Use

// Comprehensive test function using Browser Use
const testBrowserUseFormFilling = async () => {
  console.log('🚀 Starting Comprehensive Browser Use Form Filling Test...')

  // Validate API key
  if (!BROWSER_USE_API_KEY) {
    throw new Error('BROWSERUSE_API_KEY environment variable is required')
  }

  // Mock startup data (comprehensive like in route.ts)
  const mockStartup = {
    name: 'TestStartup Inc',
    website: 'https://teststartup.com',
    description_short: 'We build innovative AI solutions for modern businesses',
    description_medium:
      'TestStartup Inc creates AI-powered automation tools that help businesses streamline operations and boost productivity by 40%.',
    description_long:
      'TestStartup Inc is a cutting-edge technology company focused on developing AI-powered solutions for modern businesses. Our platform combines machine learning with intuitive interfaces to automate repetitive tasks, provide actionable insights from complex data, and improve overall operational efficiency. We serve mid-market companies looking to scale their operations without proportionally increasing headcount.',
    location: 'San Francisco, CA',
    industry: 'Cloud',
    founded_year: 2024,
    employee_count: 8,
    funding_amount_sought: 200000,
    revenue_model: 'SaaS Subscription',
    funding_round: 'Seed',
    market_summary:
      'The AI automation market is projected to reach $15.7B by 2027, growing at 23% CAGR. Our TAM includes 50,000+ mid-market companies.',
    traction_summary:
      'We have 120+ beta customers, $25K MRR with 30% month-over-month growth, and have saved customers over 10,000 hours collectively.',
    mrr: 25000,
    arr: 300000,
    is_incorporated: true,
    legal_structure: 'Delaware C-Corp',
    competitors: 'Zapier, UiPath, Automation Anywhere',
    pre_money_valuation: 8000000,
    investment_instrument: 'SAFE',
    pitch_deck_url: 'https://example.com/deck.pdf',
    intro_video_url: 'https://example.com/demo.mp4',
  }

  const mockFounders: Founder[] = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@teststartup.com',
      role: 'CEO & Co-Founder',
      bio: 'Former Principal Engineer at Google with 12 years building distributed systems. Led the team that scaled Search infrastructure to handle 8B+ daily queries.',
      linkedin: 'https://linkedin.com/in/johndoe-ceo',
      githubUrl: 'https://github.com/johndoe',
      personalWebsiteUrl: 'https://johndoe.dev',
      twitterUrl: 'https://twitter.com/johndoe',
      phone: '+1-555-0123',
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@teststartup.com',
      role: 'CTO & Co-Founder',
      bio: 'Former Staff ML Engineer at OpenAI, contributed to GPT-3 training infrastructure. PhD in Computer Science from Stanford.',
      linkedin: 'https://linkedin.com/in/janesmith-cto',
    },
  ]

  // Create comprehensive data payload like in route.ts
  const dataPayload: DataPayload = {
    company_name: {
      value: mockStartup.name,
      label_hints: ['Company Name', 'Startup Name', 'Name', 'Business Name'],
    },
    company_website: {
      value: mockStartup.website,
      label_hints: ['Website', 'URL', 'Company Website', 'Homepage'],
    },
    company_description_short: {
      value: mockStartup.description_short,
      label_hints: [
        'Short Description',
        'Elevator Pitch',
        'Summary',
        'One-liner',
        'Brief Description',
        'Company Summary',
        'What does your company do?',
        'Tagline',
        'Brief Summary',
        'Company in one sentence',
      ],
    },
    company_description_medium: {
      value: mockStartup.description_medium,
      label_hints: ['Elevator Pitch', 'Brief Description', 'Company Overview'],
    },
    company_description_long: {
      value: mockStartup.description_long,
      label_hints: [
        'Detailed Description',
        'Tell us about your company',
        'Full Description',
        'Company Description',
        'Business Description',
      ],
    },
    company_industry: {
      value: mockStartup.industry,
      label_hints: ['Industry', 'Sector', 'Market', 'Category', 'Vertical'],
    },
    company_location: {
      value: mockStartup.location,
      label_hints: ['Location', 'Headquarters', 'City', 'Country', 'Address'],
    },
    company_founded_year: {
      value: mockStartup.founded_year,
      label_hints: [
        'Founded Year',
        'Year Founded',
        'Founding Date',
        'Founded',
        'Year',
        'Established',
      ],
    },
    company_team_size: {
      value: mockStartup.employee_count,
      label_hints: [
        'Team Size',
        'Employee Count',
        'Number of Employees',
        'Staff Size',
      ],
    },
    company_funding_amount_sought: {
      value: mockStartup.funding_amount_sought,
      label_hints: [
        'Funding Amount Sought',
        'Raising',
        'Ask Amount',
        'Investment Amount',
      ],
    },
    lead_founder_name: {
      value: `${mockFounders[0].firstName} ${mockFounders[0].lastName}`,
      label_hints: [
        'Lead Founder Name',
        'Your Name',
        "Founder's Name",
        'CEO Name',
      ],
    },
    lead_founder_email: {
      value: mockFounders[0].email,
      label_hints: [
        'Contact Email',
        'Your Email',
        "Founder's Email",
        'Email Address',
      ],
    },
    company_traction: {
      value: mockStartup.traction_summary,
      label_hints: ['Traction', 'Key Metrics', 'Progress', 'Milestones'],
    },
    company_revenue_model: {
      value: mockStartup.revenue_model,
      label_hints: ['Revenue Model', 'Business Model', 'Monetization'],
    },
    company_funding_stage: {
      value: mockStartup.funding_round,
      label_hints: [
        'Funding Stage',
        'Funding Round',
        'Stage',
        'Investment Stage',
      ],
    },
  }

  // Test with a real VC form URL - use fresh URL to prevent form state caching
  const baseTestUrl =
    'https://rm531z4dws8.typeform.com/to/NNZmuM7H?typeform-source=www.breega.com'
  const testUrl = createFreshUrl(baseTestUrl)
  const testTargetName = 'Breega Capital'

  console.log(`🔄 Using fresh session URL: ${testUrl}`)

  // Initialize Browser Use client
  console.log('🔧 Initializing Browser Use client...')
  const browserUseClient = new BrowserUseClient(BROWSER_USE_API_KEY)
  let taskId: string | null = null
  let result: BrowserUseResult

  try {
    // Build optimized task instruction using new approach
    const smartData = buildSmartDataMapping(dataPayload)
    const taskInstruction = buildOptimizedInstruction(
      testUrl,
      testTargetName,
      smartData,
    )

    console.log(
      '📝 Task instruction length:',
      taskInstruction.length,
      'characters',
    )

    // Optimized structured output schema with thinking field (matches route.ts)
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

    // Create optimized Browser Use task - focused on speed and cost efficiency (matches route.ts)
    console.log('🚀 Creating optimized Browser Use task with fresh session...')
    const taskResponse = await browserUseClient.createTask(taskInstruction, {
      llm_model: 'claude-sonnet-4-20250514',
      max_agent_steps: 50, // Reduced steps for focused execution
      use_adblock: true,
      use_proxy: true,
      proxy_country_code: 'us',
      allowed_domains: [new URL(testUrl).hostname],
      save_browser_data: false, // Critical: Don't save cookies/localStorage between sessions
      structured_output_json: JSON.stringify(outputSchema),
      browser_viewport_width: 1920,
      browser_viewport_height: 1080,
      highlight_elements: false, // Reduce visual processing overhead
    })

    taskId = taskResponse.id
    console.log(`🎯 Browser Use task created with ID: ${taskId}`)

    // Monitor task progress
    console.log('⏳ Waiting for task completion...')
    let pollCount = 0
    const maxPolls = 60 // 3 minutes at 3-second intervals

    while (pollCount < maxPolls) {
      const status = await browserUseClient.getTaskStatus(taskId!)
      console.log(`📊 Task status (${pollCount + 1}/${maxPolls}): ${status}`)

      if (
        status === 'finished' ||
        status === 'failed' ||
        status === 'stopped'
      ) {
        break
      }

      await new Promise((resolve) => setTimeout(resolve, 3000))
      pollCount++
    }

    // Wait for task completion with proper timeout
    const taskResult = await browserUseClient.waitForCompletion(
      taskId!,
      3000,
      300000,
    ) // 5 minutes max

    // Extract session ID if available
    const sessionId = taskResult.session_id || taskId

    // Parse the optimized structured output (matches route.ts)
    let parsedOutput
    try {
      parsedOutput = JSON.parse(taskResult.output || '{}')
      if (parsedOutput.thinking) {
        console.log(
          `🧠 Agent thinking: ${parsedOutput.thinking.substring(0, 100)}...`,
        )
      }
    } catch {
      console.warn('Failed to parse structured output, using fallback')
      parsedOutput = {
        thinking: 'Task executed without structured output',
        success: taskResult.status === 'finished',
        summary: taskResult.output || 'Task completed efficiently',
        fields_completed: [],
        errors:
          taskResult.status === 'failed' ? ['Task failed to complete'] : [],
        screenshots_taken: taskResult.steps?.length || 0,
      }
    }

    console.log(
      `🎥 Session recording available at: https://cloud.browser-use.com/task/${taskId}`,
    )

    result = {
      success: parsedOutput.success && taskResult.status === 'finished',
      summary: parsedOutput.summary || taskResult.output,
      fields_completed: parsedOutput.fields_completed || [],
      errors: parsedOutput.errors || [],
      task_id: taskId || undefined,
      session_id: sessionId || undefined,
      screenshots_taken: taskResult.steps?.length || 0,
      output: taskResult.output,
    }

    console.log('✅ Test completed!')
    console.log(
      `🎥 Session recording: https://cloud.browser-use.com/task/${taskId}`,
    )
    console.log('📊 Results:', JSON.stringify(result, null, 2))

    return {
      success: true,
      taskId,
      sessionId,
      sessionUrl: `https://cloud.browser-use.com/task/${taskId}`,
      fieldsCompleted: parsedOutput.fields_completed?.length || 0,
      result,
    }
  } catch (error) {
    console.error('❌ Test failed:', error)

    result = {
      success: false,
      error_reason: error instanceof Error ? error.message : 'Unknown error',
      task_id: taskId || undefined,
      session_id: taskId || 'unknown',
      screenshots_taken: 0,
    }

    if (taskId) {
      console.log(
        `🎥 Session recording (with error): https://cloud.browser-use.com/task/${taskId}`,
      )
    }

    throw error
  } finally {
    // Clean up task if needed
    if (browserUseClient && taskId) {
      try {
        // Note: We don't stop the task here as we want to see the full execution
        console.log('🔚 Task completed')
      } catch {
        console.warn(
          'Note: Task cleanup not performed to preserve session recording',
        )
      }
    }
  }
}

// Export for potential CLI usage
export { testBrowserUseFormFilling }

// Run test if this file is executed directly
if (require.main === module) {
  testBrowserUseFormFilling().catch(console.error)
}
