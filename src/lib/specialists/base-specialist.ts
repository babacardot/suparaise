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
      max_agent_steps: 50,
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
