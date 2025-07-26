// Specialist system type definitions

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
}

export type FormType = 'typeform' | 'google' | 'contact' | 'generic'

export interface FormSpecialist {
  readonly type: FormType
  readonly name: string
  readonly description: string

  // URL detection for this specialist
  canHandle(url: string): boolean

  // Generate specialized instruction for this form type
  buildInstruction(
    targetUrl: string,
    targetName: string,
    smartData: SmartDataMapping,
  ): string

  // Form-specific browser use configuration overrides
  getBrowserConfig?(): Partial<BrowserUseConfig>
}

export interface BrowserUseConfig {
  llm_model: string
  max_agent_steps: number
  use_adblock: boolean
  use_proxy: boolean
  proxy_country_code: string
  allowed_domains?: string[]
  save_browser_data: boolean
  browser_viewport_width: number
  browser_viewport_height: number
  highlight_elements: boolean
  enable_public_share: boolean
}

// Validation and error types
export interface SpecialistValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Factory interface for dependency injection
export interface SpecialistFactory {
  getSpecialist(url: string): FormSpecialist
  getAllSpecialists(): FormSpecialist[]
  registerSpecialist(specialist: FormSpecialist): void
}
