// Main exports for the specialist system
export * from './types'
export * from './base-specialist'

// Individual specialists
export * from './typeform-specialist'
export * from './google-forms-specialist'
export * from './contact-form-specialist'
export * from './generic-specialist'

// Factory and utilities
export * from './specialist-factory'

// Convenience imports for common usage
export {
  getFormSpecialist,
  getFormSpecialistByType,
  getSpecialistCapabilities,
} from './specialist-factory'
export type { FormSpecialist, SmartDataMapping, FormType } from './types'
