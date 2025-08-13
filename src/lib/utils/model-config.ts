// LLM Model Configuration for Browser Use agents

export const BROWSER_USE_MODELS = {
  // Cost-optimized models (recommended for most forms)
  'gpt-4.1-mini': { cost: 0.01, performance: 'good', recommended: false },
  'gpt-4o-mini': { cost: 0.01, performance: 'good', recommended: false },
  'gemini-2.5-flash': {
    cost: 0.01,
    performance: 'excellent',
    recommended: true,
  }, // Best price/performance

  // High-performance models (for complex forms)
  'gpt-4.1': { cost: 0.03, performance: 'excellent', recommended: false },
  'gpt-4o': { cost: 0.03, performance: 'excellent', recommended: false },
  'claude-sonnet-4-20250514': {
    cost: 0.03,
    performance: 'excellent',
    recommended: false,
  },

  // Future models (uncomment when available)
  'gpt-5-mini': { cost: 0.005, performance: 'excellent', recommended: true },
  'gemini-2.5-pro': {
    cost: 0.03,
    performance: 'excellent',
    recommended: false,
  },
} as const

export type SupportedModel = keyof typeof BROWSER_USE_MODELS

// Default model configuration
export const MODEL_CONFIG = {
  // Primary model - change this for your default
  default: 'gpt-5-mini' as SupportedModel, // Most cost-effective with excellent performance

  // Alternative models for testing/trials
  alternatives: {
    // Uncomment to easily switch models for testing
    costOptimized: 'gpt-4.1-mini' as SupportedModel,
    balanced: 'gpt-4.1' as SupportedModel,
    premium: 'claude-sonnet-4-20250514' as SupportedModel,
    // futureDefault: 'gpt-5-mini' as SupportedModel, // Uncomment when GPT-5 is available
  },

  // Model selection by form complexity
  byComplexity: {
    simple: 'gemini-2.5-flash' as SupportedModel, // Contact forms, basic submissions
    medium: 'gemini-2.5-flash' as SupportedModel, // Google Forms, Airtable
    complex: 'gpt-4.1' as SupportedModel, // Typeform, multi-step forms
  },
}

// Get model based on form complexity
export const getModelForComplexity = (
  complexity: 'simple' | 'medium' | 'complex',
): SupportedModel => {
  return MODEL_CONFIG.byComplexity[complexity]
}

// Get cost estimate for a model
export const getModelCost = (
  model: SupportedModel,
  steps: number = 50,
): number => {
  const modelInfo = BROWSER_USE_MODELS[model]
  return 0.01 + steps * modelInfo.cost // $0.01 initialization + step costs
}

// Validate if model is supported
export const isModelSupported = (model: string): model is SupportedModel => {
  return model in BROWSER_USE_MODELS
}

// Get recommended models
export const getRecommendedModels = (): SupportedModel[] => {
  return Object.entries(BROWSER_USE_MODELS)
    .filter(([, info]) => info.recommended)
    .map(([model]) => model as SupportedModel)
}
