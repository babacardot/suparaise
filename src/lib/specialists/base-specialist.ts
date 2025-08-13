import {
  FormSpecialist,
  FormType,
  SmartDataMapping,
  BrowserUseConfig,
} from './types'

export abstract class BaseFormSpecialist implements FormSpecialist {
  abstract readonly type: FormType
  abstract readonly name: string
  abstract readonly description: string

  abstract canHandle(url: string): boolean
  abstract buildInstruction(
    targetUrl: string,
    targetName: string,
    smartData: SmartDataMapping,
  ): string

  // Default Browser Use configuration - can be overridden by specialists
  getBrowserConfig(): Partial<BrowserUseConfig> {
    return {
      max_agent_steps: 60,
      use_adblock: true,
      use_proxy: true,
      proxy_country_code: 'us',
      save_browser_data: false,
      browser_viewport_width: 1920,
      browser_viewport_height: 1080,
      highlight_elements: false,
      enable_public_share: true, // Browser Use feature for live monitoring
    }
  }

  // Helper method to format data lines for instructions
  protected formatDataLines(smartData: SmartDataMapping): string[] {
    const dataLines: string[] = []
    Object.entries(smartData.primary_data).forEach(([key, value]) => {
      if (value && value.trim()) {
        dataLines.push(`${key}: "${value}"`)
      }
    })
    return dataLines
  }

  // Helper method to get industry options
  protected getIndustryOptions(
    smartData: SmartDataMapping,
    limit: number = 5,
  ): string {
    return smartData.industry_variations.slice(0, limit).join(', ')
  }

  // Helper method to get location options
  protected getLocationOptions(
    smartData: SmartDataMapping,
    limit: number = 5,
  ): string {
    return smartData.location_variations.slice(0, limit).join(', ')
  }

  // Global guidance appended to all specialist instructions
  protected getGlobalGuidelines(smartData: SmartDataMapping): string {
    const deckUrl = smartData.primary_data.asset_cloud_drive || ''
    const companyCountry =
      smartData.primary_data.incorporation_country ||
      smartData.primary_data.company_country ||
      smartData.primary_data.location ||
      smartData.location_variations[0] ||
      ''
    const revenueText =
      smartData.primary_data.monthly_revenue ||
      smartData.primary_data.revenue ||
      smartData.primary_data.annual_revenue ||
      ''
    return `
**GLOBAL GUIDELINES:**
- Optional fields: If a field is marked optional or has no asterisk (*), you may skip it. For questions like "Is there anything else you'd like to share with us?", always skip.
- Pitch deck/presentation uploads: If an upload box is optional, skip uploading. You cannot upload local files or use Google Drive/OneDrive/Webcam integrations. Prefer sharing the deck via a URL field near the upload control when available. Use this URL if needed: ${deckUrl || '[no deck url provided]'}.
- "How did you hear about us" (or similar): Choose "Google search" / "Internet search" / "Search". If selecting "Other" reveals a follow-up, answer with "Search".
- Founder nationality: If asked for founder nationality/citizenship, use the company's country (${companyCountry || 'company country not provided'}).
- Terms & Conditions: Always accept any terms, conditions, privacy consents, or declarations required to submit. Do NOT opt into newsletters or marketing emails; leave such opt-ins unchecked.
- Revenue questions: If asked "Are you revenue generating?", answer "Yes" only if a provided revenue value is greater than 1; otherwise answer "No". If a numeric revenue amount is required and not available, input 0. Context revenue: ${revenueText || 'n/a'}.`
  }

  // Helper method to build plan identifier for easy console recognition
  protected buildPlanIdentifier(
    smartData: SmartDataMapping,
    targetName: string,
  ): string {
    const planLevel = smartData.userPlan?.permission_level || 'FREE'
    const companyName = smartData.primary_data.company_name || 'COMPANY'
    const targetType = smartData.targetType || 'FUND'

    return `${planLevel} / ${companyName} / ${targetName} ${targetType}`
  }

  // Helper method to build core data section
  protected buildCoreDataSection(smartData: SmartDataMapping): string {
    const toneInstruction = smartData.preferredTone
      ? `\n**TONE OF VOICE:** Maintain a "${smartData.preferredTone}" tone.`
      : ''
    const customInstructions = smartData.customInstructions
      ? `\n**ADDITIONAL INSTRUCTIONS:** ${smartData.customInstructions}`
      : ''

    return `**STARTUP DATA:**
${this.formatDataLines(smartData).join('\n')}
${toneInstruction}
${customInstructions}

**INDUSTRY OPTIONS:** ${this.getIndustryOptions(smartData)}
**LOCATION OPTIONS:** ${this.getLocationOptions(smartData)}

**DESCRIPTIONS:**
- Short: "${smartData.description_by_length.short}"
- Medium: "${smartData.description_by_length.medium}"
- Long: "${smartData.description_by_length.long}"
${smartData.knowledge_base_section}`
  }

  // Validation helper
  protected validateInstruction(instruction: string): {
    isValid: boolean
    issues: string[]
  } {
    const issues: string[] = []

    if (instruction.length < 100) {
      issues.push('Instruction too short - may lack necessary guidance')
    }

    if (instruction.length > 3000) {
      issues.push('Instruction too long - may impact performance')
    }

    if (!instruction.includes('SUCCESS CRITERIA')) {
      issues.push('Missing success criteria section')
    }

    return {
      isValid: issues.length === 0,
      issues,
    }
  }
}
