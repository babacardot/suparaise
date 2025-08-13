import { SpecialistFactory, FormSpecialist } from './types'
import { TypeformSpecialist } from './typeform-specialist'
import { GoogleFormsSpecialist } from './google-forms-specialist'
import { ContactFormSpecialist } from './contact-form-specialist'
import { AirtableSpecialist } from './airtable-specialist'
import { GenericSpecialist } from './generic-specialist'

export class FormSpecialistFactory implements SpecialistFactory {
  private specialists: FormSpecialist[] = []

  constructor() {
    // Register all available Browser Use specialists
    this.registerSpecialist(new TypeformSpecialist())
    this.registerSpecialist(new GoogleFormsSpecialist())
    this.registerSpecialist(new AirtableSpecialist())
    this.registerSpecialist(new ContactFormSpecialist())
    this.registerSpecialist(new GenericSpecialist()) // Always last as fallback
  }

  registerSpecialist(specialist: FormSpecialist): void {
    // Prevent duplicate registrations
    if (!this.specialists.find((s) => s.type === specialist.type)) {
      this.specialists.push(specialist)
      console.log(`✅ Registered ${specialist.name} (${specialist.type})`)
    }
  }

  getSpecialist(url: string): FormSpecialist {
    // Find the first Browser Use specialist that can handle this URL
    for (const specialist of this.specialists) {
      if (specialist.canHandle(url)) {
        console.log(`🎯 Selected ${specialist.name} (Browser Use) for ${url}`)
        return specialist
      }
    }

    // This should never happen since GenericSpecialist handles everything
    throw new Error(
      'No suitable Browser Use specialist found - this should not happen',
    )
  }

  // Get specialist by explicit form type (from database)
  getSpecialistByFormType(
    formType: string | null,
    fallbackUrl?: string,
  ): FormSpecialist {
    // If we have an explicit form type from database, use it
    if (formType) {
      const specialist = this.specialists.find((s) => s.type === formType)
      if (specialist) {
        console.log(
          `🎯 Selected ${specialist.name} (Browser Use) via database form_type: ${formType}`,
        )
        return specialist
      } else {
        console.warn(
          `⚠️ Unknown form_type '${formType}' from database, falling back to Browser Use URL detection`,
        )
      }
    }

    // Fallback to URL-based detection
    if (fallbackUrl) {
      return this.getSpecialist(fallbackUrl)
    }

    // Last resort: return generic Browser Use specialist
    const genericSpecialist = this.specialists.find((s) => s.type === 'generic')
    if (genericSpecialist) {
      console.log(`🎯 Using Generic Browser Use specialist as fallback`)
      return genericSpecialist
    }

    throw new Error(
      'No suitable Browser Use specialist found - this should not happen',
    )
  }

  getAllSpecialists(): FormSpecialist[] {
    return [...this.specialists] // Return copy to prevent external modification
  }

  // Get specialist by type (useful for testing)
  getSpecialistByType(type: string): FormSpecialist | undefined {
    return this.specialists.find((s) => s.type === type)
  }

  // Get specialist capabilities summary
  getCapabilitiesSummary(): Record<string, string> {
    const summary: Record<string, string> = {}
    this.specialists.forEach((specialist) => {
      summary[specialist.type] = specialist.description
    })
    return summary
  }

  // Validate all specialists are properly configured
  validateSpecialists(): { isValid: boolean; issues: string[] } {
    const issues: string[] = []

    // Check for required specialists
    const requiredTypes = ['typeform', 'google', 'airtable', 'contact', 'generic']
    requiredTypes.forEach((type) => {
      if (!this.specialists.find((s) => s.type === type)) {
        issues.push(`Missing required specialist: ${type}`)
      }
    })

    // Check for duplicate types
    const types = this.specialists.map((s) => s.type)
    const duplicates = types.filter(
      (type, index) => types.indexOf(type) !== index,
    )
    if (duplicates.length > 0) {
      issues.push(`Duplicate specialists found: ${duplicates.join(', ')}`)
    }

    // Ensure generic specialist is last (fallback)
    const lastSpecialist = this.specialists[this.specialists.length - 1]
    if (lastSpecialist.type !== 'generic') {
      issues.push('Generic specialist must be registered last as fallback')
    }

    return {
      isValid: issues.length === 0,
      issues,
    }
  }
}

// Singleton instance for the application
export const specialistFactory = new FormSpecialistFactory()

// Utility functions for easy access
export const getFormSpecialist = (url: string): FormSpecialist => {
  return specialistFactory.getSpecialist(url)
}

export const getFormSpecialistByType = (
  formType: string | null,
  fallbackUrl?: string,
): FormSpecialist => {
  return specialistFactory.getSpecialistByFormType(formType, fallbackUrl)
}

export const getSpecialistCapabilities = (): Record<string, string> => {
  return specialistFactory.getCapabilitiesSummary()
}
