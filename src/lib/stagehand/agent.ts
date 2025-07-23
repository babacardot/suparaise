/**
 * Stagehand Agent for VC Fundraising Automation
 * This module provides the core automation functionality for filling out VC application forms
 */

import { Stagehand } from '@browserbasehq/stagehand'

// Types for our agent operations
export type StartupData = {
  // Company Info
  name: string
  website?: string
  industry?: string
  location?: string
  description_short?: string
  description_medium?: string
  description_long?: string
  founded_year?: number
  employee_count?: number

  // Funding Info
  funding_round?: string
  funding_amount_sought?: number
  pre_money_valuation?: number
  current_runway?: number

  // Financial Metrics
  mrr?: number
  arr?: number
  revenue_model?: string

  // Business Details
  traction_summary?: string
  market_summary?: string
  key_customers?: string
  competitors?: string

  // Legal Structure
  legal_structure?: string
  is_incorporated?: boolean
  incorporation_country?: string
  incorporation_city?: string
  operating_countries?: string[]

  // Assets
  pitch_deck_url?: string
  logo_url?: string
  business_plan_url?: string
  financial_projections_url?: string
}

export type FounderData = {
  first_name: string
  last_name: string
  email: string
  phone?: string
  role?: string
  bio?: string
  linkedin?: string
  github_url?: string
  personal_website_url?: string
  twitter_url?: string
}

export type TargetData = {
  name: string
  website?: string
  application_url: string
  submission_type: 'form' | 'email' | 'other'
  stage_focus?: string[]
  industry_focus?: string[]
  region_focus?: string[]
  required_documents?: string[]
  notes?: string
}

export type AgentSettings = {
  preferred_tone: 'professional' | 'enthusiastic' | 'concise' | 'detailed'
  debug_mode: boolean
  stealth: boolean
  custom_instructions: string
}

export type SubmissionResult = {
  success: boolean
  status: 'completed' | 'failed' | 'partial'
  message: string
  screenshots_taken: number
  debug_data?: Record<string, unknown>
  session_id: string
  session_replay_url?: string
}

export class StagehandVCAgent {
  private stagehand: Stagehand
  private isInitialized = false
  private settings: AgentSettings
  private screenshotCount = 0

  constructor(settings: AgentSettings, browserbaseSessionId?: string) {
    this.settings = settings

    this.stagehand = new Stagehand({
      env: 'BROWSERBASE',
      apiKey: process.env.BROWSERBASE_API_KEY,
      projectId: process.env.BROWSERBASE_PROJECT_ID,
      verbose: settings.debug_mode ? 2 : 1,
      logger: settings.debug_mode ? console.log : undefined,
      browserbaseSessionID: browserbaseSessionId,
      browserbaseSessionCreateParams: {
        projectId: process.env.BROWSERBASE_PROJECT_ID!,
        // Increase timeout for multi-step forms
        timeout: 600, // 10 minutes
        browserSettings: {
          blockAds: true,
          viewport: {
            width: 1920,
            height: 1080,
          },
          // Enable stealth mode if configured
          ...(settings.stealth && {
            fingerprint: {
              browsers: ['chrome'],
              devices: ['desktop'],
              locales: ['en-US'],
              operatingSystems: ['windows', 'macos'],
            },
          }),
        },
      },
    })
  }

  /**
   * Initialize the Stagehand agent
   */
  async init(): Promise<void> {
    if (this.isInitialized) return

    await this.stagehand.init()
    this.isInitialized = true
  }

  /**
   * Get the current browser session ID
   */
  getSessionId(): string | undefined {
    return this.stagehand.browserbaseSessionID
  }

  /**
   * Take a screenshot for debugging
   */
  private async takeScreenshot(description: string): Promise<void> {
    if (!this.settings.debug_mode) return

    try {
      this.screenshotCount++
      await this.stagehand.page.screenshot({
        path: `debug-screenshot-${this.screenshotCount}-${description.replace(/\s+/g, '-')}.png`,
        fullPage: true,
      })
    } catch (error) {
      console.warn('Failed to take screenshot:', error)
    }
  }

  /**
   * Navigate to a URL
   */
  async navigate(url: string): Promise<void> {
    await this.takeScreenshot('before-navigation')
    await this.stagehand.page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })
    await this.takeScreenshot('after-navigation')
    await this.stagehand.page.waitForTimeout(3000)
  }

  /**
   * Fill out a VC application form using the provided data
   */
  async fillForm(
    target: TargetData,
    startup: StartupData,
    founders: FounderData[],
  ): Promise<SubmissionResult> {
    try {
      const mainFounder = founders[0]
      if (!mainFounder) {
        throw new Error('At least one founder must be provided')
      }

      await this.takeScreenshot('before-form-fill')

      // Create the agent with appropriate instructions
      const agent = this.stagehand.agent({
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514', // CLAUDE SONNET 4 IS A SUPPORTED MODEL NEVER CHANGE THIS
        instructions: this.buildAgentInstructions(target),
        options: {
          apiKey: process.env.ANTHROPIC_API_KEY,
        },
      })

      // Build comprehensive instruction for the entire application process
      const fillInstruction = this.buildFillInstruction(
        target,
        startup,
        mainFounder,
      )

      // Execute the entire application process with the agent
      if (this.settings.debug_mode) {
        console.log('Starting agent execution for:', startup.name)
        console.log('Initial page URL:', this.stagehand.page.url())
      }

      await agent.execute(
        `Fill out and submit the application form for ${startup.name} using the provided data. Navigate through all steps to complete the entire process.\n\n${fillInstruction}`,
      )

      if (this.settings.debug_mode) {
        console.log('Agent execution completed')
        console.log('Final page URL:', this.stagehand.page.url())
      }

      await this.takeScreenshot('after-form-execution')

      // Wait a bit for any final processing
      await this.stagehand.page.waitForTimeout(3000)

      // Check for success confirmation (final page indicators)
      const successConfirmation = await this.checkSubmissionSuccess()

      return {
        success: true,
        status: successConfirmation ? 'completed' : 'partial',
        message: successConfirmation
          ? 'Multi-step application completed successfully'
          : 'Application process executed - checking final status',
        screenshots_taken: this.screenshotCount,
        session_id: this.getSessionId()!,
        debug_data: this.settings.debug_mode
          ? {
              success_confirmation: successConfirmation,
              final_url: this.stagehand.page.url(),
            }
          : undefined,
      }
    } catch (error) {
      await this.takeScreenshot('error-state')

      return {
        success: false,
        status: 'failed',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        screenshots_taken: this.screenshotCount,
        session_id: this.getSessionId()!,
        debug_data: this.settings.debug_mode
          ? {
              error: error instanceof Error ? error.stack : error,
            }
          : undefined,
      }
    }
  }

  /**
   * Build agent instructions based on settings and tone
   */
  private buildAgentInstructions(target: TargetData): string {
    const toneInstructions = {
      professional:
        'Maintain a professional, business-focused tone in all communications.',
      enthusiastic:
        'Show genuine enthusiasm and passion for the startup and its mission.',
      concise:
        'Keep responses brief and to the point while covering all necessary information.',
      detailed:
        'Provide comprehensive, thorough responses with specific examples and metrics.',
    }

    return `You are an expert assistant for filling out VC application forms for startups.

Your goal is to accurately and completely fill out and submit the application form on the current site using the provided startup data.

Key guidelines:
- ${toneInstructions[this.settings.preferred_tone]}
- Be truthful. If data is unavailable for a field, use "N/A" or leave it blank.
- Handle multi-step forms by navigating through all pages until you reach a final confirmation.
- Prioritize required fields.

${this.settings.custom_instructions ? `Additional instructions: ${this.settings.custom_instructions}` : ''}

Target VC: ${target.name}
${target.notes ? `Special notes for this target: ${target.notes}` : ''}`
  }

  /**
   * Build specific fill instruction for the agent
   */
  private buildFillInstruction(
    target: TargetData,
    startup: StartupData,
    founder: FounderData,
  ): string {
    return `COMPANY INFORMATION FOR ${startup.name}:
- Company Name: ${startup.name}
- Website: ${startup.website || 'N/A'}
- Industry: ${startup.industry || 'N/A'}
- Location: ${startup.location || 'N/A'}
- Founded date (Creation date): 01/01/${startup.founded_year || 'N/A'}
- Employee Count: ${startup.employee_count || 'N/A'}
- Short Description: ${startup.description_short || 'N/A'}
- Medium Description: ${startup.description_medium || 'N/A'}
- Long Description: ${startup.description_long || 'N/A'}

FUNDING INFORMATION:
- Funding Round: ${startup.funding_round || 'N/A'}
- Amount Seeking: ${startup.funding_amount_sought ? `$${startup.funding_amount_sought.toLocaleString()}` : 'N/A'}
- Pre-money Valuation: ${startup.pre_money_valuation ? `$${startup.pre_money_valuation.toLocaleString()}` : 'N/A'}
- Current Runway: ${startup.current_runway ? `${startup.current_runway} months` : 'N/A'}

FINANCIAL METRICS:
- MRR: ${startup.mrr ? `$${startup.mrr.toLocaleString()}` : 'N/A'}
- ARR: ${startup.arr ? `$${startup.arr.toLocaleString()}` : 'N/A'}
- Revenue Model: ${startup.revenue_model || 'N/A'}

FOUNDER INFORMATION:
- Name: ${founder.first_name} ${founder.last_name}
- Email: ${founder.email}
- Phone: ${founder.phone || 'N/A'}
- Role: ${founder.role || 'Founder'}
- LinkedIn: ${founder.linkedin || 'N/A'}
- Bio: ${founder.bio || 'N/A'}

BUSINESS DETAILS:
- Traction: ${startup.traction_summary || 'N/A'}
- Market: ${startup.market_summary || 'N/A'}
- Key Customers: ${startup.key_customers || 'N/A'}
- Competitors: ${startup.competitors || 'N/A'}

LEGAL:
- Legal Structure: ${startup.legal_structure || 'N/A'}
- Incorporated: ${startup.is_incorporated ? 'Yes' : 'No'}
- Incorporation Location: ${startup.incorporation_city}, ${startup.incorporation_country}

INSTRUCTIONS:
- Use this information to fill out ALL form fields across ALL pages/steps
- Match information to appropriate fields based on labels and context
- If information is not provided above, enter "N/A" or leave blank
- For file uploads, indicate files would be uploaded but don't actually upload`
  }

  /**
   * Check if the application process was completed successfully
   */
  private async checkSubmissionSuccess(): Promise<boolean> {
    try {
      // Wait for potential redirect or success message
      await this.stagehand.page.waitForTimeout(3000)

      // Look for common success/completion indicators
      const successIndicators = [
        'thank you',
        'success',
        'submitted',
        'received',
        'application received',
        'application submitted',
        'we will review',
        'confirmation',
        'complete',
        'completed',
        'done',
        'congratulations',
        'next steps',
        'under review',
        "we'll be in touch",
        'hear back',
        'review your application',
      ]

      const pageContent = await this.stagehand.page.content()
      const lowerContent = pageContent.toLowerCase()
      const currentUrl = this.stagehand.page.url()

      // Check content for success indicators
      const hasSuccessContent = successIndicators.some((indicator) =>
        lowerContent.includes(indicator),
      )

      // Check URL for success/completion patterns
      const hasSuccessUrl =
        currentUrl.includes('success') ||
        currentUrl.includes('complete') ||
        currentUrl.includes('confirmation') ||
        currentUrl.includes('thank')

      await this.takeScreenshot('final-page-check')

      return hasSuccessContent || hasSuccessUrl
    } catch {
      return false
    }
  }

  /**
   * Close the agent and clean up resources
   */
  async close(): Promise<void> {
    if (this.isInitialized) {
      await this.stagehand.close()
      this.isInitialized = false
    }
  }

  /**
   * Get session replay URL for debugging
   */
  async getSessionReplayUrl(): Promise<string | undefined> {
    if (!this.getSessionId()) return undefined

    try {
      const apiKey = process.env.BROWSERBASE_API_KEY
      if (!apiKey) return undefined

      const response = await fetch(
        `https://api.browserbase.com/v1/sessions/${this.getSessionId()}/debug`,
        {
          headers: {
            'X-BB-API-Key': apiKey,
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        return data.debuggerFullscreenUrl
      }
    } catch {
      console.warn('Failed to get session replay URL')
    }

    return undefined
  }
}

/**
 * Utility function to create and configure a Stagehand VC agent
 */
export async function createVCAgent(
  settings: AgentSettings,
  sessionId?: string,
): Promise<StagehandVCAgent> {
  const agent = new StagehandVCAgent(settings, sessionId)
  await agent.init()
  return agent
}

/**
 * Main function to execute a VC application submission
 */
export async function executeVCSubmission(
  target: TargetData,
  startup: StartupData,
  founders: FounderData[],
  settings: AgentSettings,
  sessionId?: string,
): Promise<SubmissionResult> {
  const agent = await createVCAgent(settings, sessionId)

  try {
    // First, navigate to the application page
    await agent.navigate(target.application_url)

    // Then fill out the form
    const result = await agent.fillForm(target, startup, founders)

    // Add session replay URL if available
    if (result.success) {
      result.session_replay_url = await agent.getSessionReplayUrl()
    }

    return result
  } finally {
    await agent.close()
  }
}
