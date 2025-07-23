'use server'

import { Browserbase } from '@browserbasehq/sdk'
import {
  executeVCSubmission,
  type AgentSettings,
  type StartupData,
  type FounderData,
  type TargetData,
} from './agent'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'

type SubmissionStatus = Database['public']['Enums']['submission_status']

// Define proper interfaces for the RPC response data
interface StartupRpcData {
  name: string
  website?: string
  industry?: string
  location?: string
  descriptionShort?: string
  descriptionMedium?: string
  descriptionLong?: string
  foundedYear?: number
  employeeCount?: number
  fundingRound?: string
  fundingAmountSought?: number
  preMoneyValuation?: number
  currentRunway?: number
  mrr?: number
  arr?: number
  revenueModel?: string
  tractionSummary?: string
  marketSummary?: string
  keyCustomers?: string
  competitors?: string
  legalStructure?: string
  isIncorporated?: boolean
  incorporationCountry?: string
  incorporationCity?: string
  operatingCountries?: string[]
  pitchDeckUrl?: string
  logoUrl?: string
  businessPlanUrl?: string
  financialProjectionsUrl?: string
}

interface FounderRpcData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  role?: string
  bio?: string
  linkedin?: string
  githubUrl?: string
  personalWebsiteUrl?: string
  twitterUrl?: string
}

interface AgentSettingsRpcData {
  preferredTone?: 'professional' | 'enthusiastic' | 'concise' | 'detailed'
  enableDebugMode?: boolean
  enableStealth?: boolean
  customInstructions?: string
}

/**
 * Start a new Browserbase session for Stagehand
 */
export async function startStagehandSession() {
  try {
    const browserbase = new Browserbase()
    const session = await browserbase.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      // Increase timeout for multi-step forms
      timeout: 600, // 10 minutes
      browserSettings: {
        blockAds: true,
        viewport: {
          width: 1920,
          height: 1080,
        },
      },
    })

    const debugUrl = await browserbase.sessions.debug(session.id)

    return {
      sessionId: session.id,
      debugUrl: debugUrl.debuggerFullscreenUrl,
    }
  } catch (error) {
    console.error('Error starting Browserbase session:', error)
    throw new Error('Failed to start browser session')
  }
}

/**
 * Execute a VC application submission using Stagehand
 */
export async function executeStagehandSubmission(params: {
  submissionId: string
  userId: string
  startupId: string
  targetId: string
  targetType: 'fund' | 'angel' | 'accelerator'
  sessionId?: string
}) {
  const { submissionId, userId, startupId, targetId, targetType, sessionId } =
    params

  try {
    const supabase = await createClient()

    // Get startup data
    const { data: startupData, error: startupError } = await supabase.rpc(
      'get_user_startup_data',
      {
        p_user_id: userId,
        p_startup_id: startupId,
      },
    )

    if (startupError || !startupData) {
      throw new Error('Failed to fetch startup data')
    }

    // Get founders data
    const { data: foundersData, error: foundersError } = await supabase.rpc(
      'get_startup_founders',
      {
        p_user_id: userId,
        p_startup_id: startupId,
      },
    )

    if (foundersError || !foundersData) {
      throw new Error('Failed to fetch founders data')
    }

    // Get agent settings
    const { data: agentSettingsData, error: settingsError } =
      await supabase.rpc('get_user_agent_settings', {
        p_user_id: userId,
        p_startup_id: startupId,
      })

    if (settingsError) {
      throw new Error('Failed to fetch agent settings')
    }

    // Get target data based on type
    let targetData:
      | Database['public']['Tables']['targets']['Row']
      | Database['public']['Tables']['angels']['Row']
      | Database['public']['Tables']['accelerators']['Row']
      | null = null

    if (targetType === 'fund') {
      const { data } = await supabase
        .from('targets')
        .select('*')
        .eq('id', targetId)
        .single()
      targetData = data
    } else if (targetType === 'angel') {
      const { data } = await supabase
        .from('angels')
        .select('*')
        .eq('id', targetId)
        .single()
      targetData = data
    } else if (targetType === 'accelerator') {
      const { data } = await supabase
        .from('accelerators')
        .select('*')
        .eq('id', targetId)
        .single()
      targetData = data
    }

    if (!targetData) {
      throw new Error('Target not found')
    }

    // Type assertions with safe casting through unknown
    const typedStartupData = startupData as unknown as StartupRpcData
    const typedFoundersData = foundersData as unknown as FounderRpcData[]
    const typedAgentSettings =
      agentSettingsData as unknown as AgentSettingsRpcData

    // Convert data to the format expected by the agent
    const startup: StartupData = {
      name: typedStartupData.name,
      website: typedStartupData.website,
      industry: typedStartupData.industry,
      location: typedStartupData.location,
      description_short: typedStartupData.descriptionShort,
      description_medium: typedStartupData.descriptionMedium,
      description_long: typedStartupData.descriptionLong,
      founded_year: typedStartupData.foundedYear,
      employee_count: typedStartupData.employeeCount,
      funding_round: typedStartupData.fundingRound,
      funding_amount_sought: typedStartupData.fundingAmountSought,
      pre_money_valuation: typedStartupData.preMoneyValuation,
      current_runway: typedStartupData.currentRunway,
      mrr: typedStartupData.mrr,
      arr: typedStartupData.arr,
      revenue_model: typedStartupData.revenueModel,
      traction_summary: typedStartupData.tractionSummary,
      market_summary: typedStartupData.marketSummary,
      key_customers: typedStartupData.keyCustomers,
      competitors: typedStartupData.competitors,
      legal_structure: typedStartupData.legalStructure,
      is_incorporated: typedStartupData.isIncorporated,
      incorporation_country: typedStartupData.incorporationCountry,
      incorporation_city: typedStartupData.incorporationCity,
      operating_countries: typedStartupData.operatingCountries || [],
      pitch_deck_url: typedStartupData.pitchDeckUrl,
      logo_url: typedStartupData.logoUrl,
      business_plan_url: typedStartupData.businessPlanUrl,
      financial_projections_url: typedStartupData.financialProjectionsUrl,
    }

    const founders: FounderData[] = Array.isArray(typedFoundersData)
      ? typedFoundersData.map((founder) => ({
          first_name: founder.firstName,
          last_name: founder.lastName,
          email: founder.email,
          phone: founder.phone,
          role: founder.role,
          bio: founder.bio,
          linkedin: founder.linkedin,
          github_url: founder.githubUrl,
          personal_website_url: founder.personalWebsiteUrl,
          twitter_url: founder.twitterUrl,
        }))
      : []

    // Handle different target types for building TargetData
    let target: TargetData

    if ('first_name' in targetData && 'last_name' in targetData) {
      // Angel investor
      target = {
        name: `${targetData.first_name} ${targetData.last_name}`,
        website:
          targetData.linkedin || targetData.personal_website || undefined,
        application_url: targetData.application_url || '',
        submission_type: targetData.submission_type || 'email',
        stage_focus: targetData.stage_focus || [],
        industry_focus: targetData.industry_focus || [],
        region_focus: targetData.region_focus || [],
        required_documents: targetData.required_documents || [],
        notes: targetData.notes || undefined,
      }
    } else {
      // VC fund or accelerator
      target = {
        name: targetData.name,
        website: targetData.website || undefined,
        application_url: targetData.application_url || '',
        submission_type: targetData.submission_type || 'form',
        stage_focus: targetData.stage_focus || [],
        industry_focus: targetData.industry_focus || [],
        region_focus: targetData.region_focus || [],
        required_documents: targetData.required_documents || [],
        notes: targetData.notes || undefined,
      }
    }

    const settings: AgentSettings = {
      preferred_tone: typedAgentSettings?.preferredTone || 'professional',
      debug_mode: typedAgentSettings?.enableDebugMode || false,
      stealth: typedAgentSettings?.enableStealth !== false, // Default to true
      custom_instructions: typedAgentSettings?.customInstructions || '',
    }

    // Execute the submission using Stagehand
    const result = await executeVCSubmission(
      target,
      startup,
      founders,
      settings,
      sessionId,
    )

    // Update the submission in the database
    const finalStatus: SubmissionStatus = result.success
      ? result.status === 'completed'
        ? 'completed'
        : 'in_progress'
      : 'failed'

    // Update based on submission type
    if (targetType === 'fund') {
      await supabase.rpc('update_submission_status', {
        p_submission_id: submissionId,
        p_new_status: finalStatus,
        p_agent_notes: result.message,
      })
    } else if (targetType === 'angel') {
      await supabase.rpc('update_angel_submission_status', {
        p_submission_id: submissionId,
        p_new_status: finalStatus,
        p_agent_notes: result.message,
      })
    } else if (targetType === 'accelerator') {
      await supabase.rpc('update_accelerator_submission_status', {
        p_submission_id: submissionId,
        p_new_status: finalStatus,
        p_agent_notes: result.message,
      })
    }

    // Update session data if available
    if (result.session_id) {
      await supabase.rpc('update_submission_with_session_data', {
        p_submission_id: submissionId,
        p_submission_type: targetType,
        p_new_status: finalStatus,
        p_agent_notes: result.message,
        p_session_id: result.session_id,
        p_session_replay_url: result.session_replay_url || '',
        p_screenshots_taken: result.screenshots_taken,
        p_debug_data: result.debug_data
          ? JSON.stringify(result.debug_data)
          : null,
      })
    }

    return {
      success: result.success,
      status: result.status,
      message: result.message,
      sessionId: result.session_id,
      sessionReplayUrl: result.session_replay_url,
      screenshotsTaken: result.screenshots_taken,
    }
  } catch (error) {
    console.error('Error executing Stagehand submission:', error)

    // Update submission status to failed
    const supabase = await createClient()
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    try {
      if (targetType === 'fund') {
        await supabase.rpc('update_submission_status', {
          p_submission_id: submissionId,
          p_new_status: 'failed' as SubmissionStatus,
          p_agent_notes: errorMessage,
        })
      } else if (targetType === 'angel') {
        await supabase.rpc('update_angel_submission_status', {
          p_submission_id: submissionId,
          p_new_status: 'failed' as SubmissionStatus,
          p_agent_notes: errorMessage,
        })
      } else if (targetType === 'accelerator') {
        await supabase.rpc('update_accelerator_submission_status', {
          p_submission_id: submissionId,
          p_new_status: 'failed' as SubmissionStatus,
          p_agent_notes: errorMessage,
        })
      }
    } catch (updateError) {
      console.error(
        'Failed to update submission status after error:',
        updateError,
      )
    }

    throw new Error(errorMessage)
  }
}

/**
 * Get session debug information
 */
export async function getSessionDebugInfo(sessionId: string) {
  try {
    const browserbase = new Browserbase()
    const debugUrl = await browserbase.sessions.debug(sessionId)

    return {
      sessionId,
      debugUrl: debugUrl.debuggerFullscreenUrl,
    }
  } catch (error) {
    console.error('Error getting session debug info:', error)
    return null
  }
}

/**
 * Create a demo/test submission for development
 */
export async function createTestSubmission() {
  try {
    const session = await startStagehandSession()

    // Example test target
    const testTarget: TargetData = {
      name: 'Test VC Firm',
      application_url: 'https://example.com/apply', // Replace with actual test URL
      submission_type: 'form',
      notes: 'Test submission for development',
    }

    const testStartup: StartupData = {
      name: 'Test Startup Inc',
      website: 'https://teststartup.com',
      industry: 'B2B SaaS',
      location: 'San Francisco, CA',
      description_short: 'We help businesses automate their workflows',
      description_medium:
        'Test Startup is a B2B SaaS platform that helps companies automate their business processes and increase efficiency.',
      founded_year: 2023,
      employee_count: 5,
      funding_round: 'Seed',
      funding_amount_sought: 1000000,
      pre_money_valuation: 5000000,
      mrr: 10000,
      arr: 120000,
      revenue_model: 'Subscription',
    }

    const testFounders: FounderData[] = [
      {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@teststartup.com',
        phone: '+1-555-0123',
        role: 'CEO',
        bio: 'Experienced entrepreneur with 10+ years in SaaS',
        linkedin: 'https://linkedin.com/in/johndoe',
      },
    ]

    const testSettings: AgentSettings = {
      preferred_tone: 'professional',
      debug_mode: true,
      stealth: true,
      custom_instructions: 'This is a test submission for development purposes',
    }

    const result = await executeVCSubmission(
      testTarget,
      testStartup,
      testFounders,
      testSettings,
      session.sessionId,
    )

    return {
      ...result,
      debugUrl: session.debugUrl,
    }
  } catch (error) {
    console.error('Error creating test submission:', error)
    throw error
  }
}
