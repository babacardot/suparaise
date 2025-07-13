import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import type { ValidationRequirements } from '@/components/ui/validation-gate'

// Basic types for validation purposes
type FounderData = {
  [key: string]: unknown
}

type StartupData = {
  [key: string]: unknown
}

interface UseValidationOptions {
  requirements: ValidationRequirements
  autoCheck?: boolean
}

interface UseValidationReturn {
  isValid: boolean
  missingFields: Array<{
    category: 'founder' | 'company' | 'financial' | 'documents'
    field: string
    label: string
    settingsPage: 'profile' | 'company'
  }>
  loading: boolean
  checkValidation: () => Promise<void>
  executeIfValid: (action: () => void, fallback?: () => void) => void
}

const FIELD_LABELS: Record<
  string,
  { label: string; page: 'profile' | 'company' }
> = {
  // Founder fields
  firstName: { label: 'First name', page: 'profile' },
  lastName: { label: 'Last name', page: 'profile' },
  email: { label: 'Email', page: 'profile' },
  phone: { label: 'Phone', page: 'profile' },
  bio: { label: 'Bio', page: 'profile' },
  role: { label: 'Role', page: 'profile' },
  linkedin: { label: 'LinkedIn', page: 'profile' },
  githubUrl: { label: 'Github', page: 'profile' },
  personalWebsiteUrl: { label: 'Personal website', page: 'profile' },

  // Company fields
  name: { label: 'Company name', page: 'company' },
  website: { label: 'Website', page: 'company' },
  industry: { label: 'Industry', page: 'company' },
  location: { label: 'Location', page: 'company' },
  descriptionShort: { label: 'One-liner', page: 'company' },
  descriptionMedium: { label: 'Elevator pitch', page: 'company' },
  descriptionLong: { label: 'Full description', page: 'company' },
  fundingRound: { label: 'Funding stage', page: 'company' },
  legalStructure: { label: 'Legal structure', page: 'company' },
  employeeCount: { label: 'Team size', page: 'company' },
  foundedYear: { label: 'Founded year', page: 'company' },
  revenueModel: { label: 'Revenue model', page: 'company' },
  currentRunway: { label: 'Runway', page: 'company' },
  keyCustomers: { label: 'Key customers', page: 'company' },
  competitors: { label: 'Competitors', page: 'company' },
  isIncorporated: { label: 'Incorporation status', page: 'company' },
  incorporationCountry: { label: 'Incorporation country', page: 'company' },
  incorporationCity: { label: 'Incorporation city', page: 'company' },
  operatingCountries: { label: 'Operating countries', page: 'company' },
  tractionSummary: { label: 'Traction', page: 'company' },
  marketSummary: { label: 'Market', page: 'company' },

  // Financial fields
  fundingAmountSought: { label: 'Funding amount', page: 'company' },
  preMoneyValuation: { label: 'Pre-money valuation', page: 'company' },
  investmentInstrument: { label: 'Instrument', page: 'company' },
  mrr: { label: 'MRR', page: 'company' },
  arr: { label: 'ARR', page: 'company' },

  // Document fields
  pitchDeckUrl: { label: 'Deck', page: 'company' },
  logoUrl: { label: 'Company logo', page: 'company' },
  introVideoUrl: { label: 'Demo video', page: 'company' },
}

// Helper function to check if a field value is empty
const isFieldEmpty = (value: unknown): boolean => {
  return (
    !value ||
    (typeof value === 'string' && value.trim() === '') ||
    (typeof value === 'number' && value === 0) ||
    value === null ||
    value === undefined ||
    (Array.isArray(value) && value.length === 0)
  )
}

export function useValidation({
  requirements,
  autoCheck = true,
}: UseValidationOptions): UseValidationReturn {
  const { user, supabase, currentStartupId } = useUser()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [missingFields, setMissingFields] = useState<
    Array<{
      category: 'founder' | 'company' | 'financial' | 'documents'
      field: string
      label: string
      settingsPage: 'profile' | 'company'
    }>
  >([])

  const checkValidation = useCallback(async () => {
    if (!user || !currentStartupId) return

    setLoading(true)
    try {
      // Fetch founder data
      const { data: founderData, error: founderError } = await supabase.rpc(
        'get_startup_founders',
        {
          p_user_id: user.id,
          p_startup_id: currentStartupId,
        },
      )

      if (founderError) throw founderError

      // Fetch startup data
      const { data: startupData, error: startupError } = await supabase.rpc(
        'get_user_startup_data',
        {
          p_user_id: user.id,
          p_startup_id: currentStartupId,
        },
      )

      if (startupError) throw startupError

      const missing: Array<{
        category: 'founder' | 'company' | 'financial' | 'documents'
        field: string
        label: string
        settingsPage: 'profile' | 'company'
      }> = []

      const founders = founderData as FounderData[]
      const startup = startupData as StartupData

      const founder = founders?.[0] // Get the first founder (main user)

      // Check founder requirements
      if (requirements.founder) {
        Object.entries(requirements.founder).forEach(([field, required]) => {
          if (required) {
            const value = founder?.[field]

            if (isFieldEmpty(value)) {
              const fieldInfo = FIELD_LABELS[field]
              if (fieldInfo) {
                missing.push({
                  category: 'founder',
                  field,
                  label: fieldInfo.label,
                  settingsPage: fieldInfo.page,
                })
              }
            }
          }
        })
      }

      // Check company requirements
      if (requirements.company) {
        Object.entries(requirements.company).forEach(([field, required]) => {
          if (required) {
            const value = startup?.[field]

            if (isFieldEmpty(value)) {
              const fieldInfo = FIELD_LABELS[field]
              if (fieldInfo) {
                missing.push({
                  category: 'company',
                  field,
                  label: fieldInfo.label,
                  settingsPage: fieldInfo.page,
                })
              }
            }
          }
        })
      }

      // Check financial requirements
      if (requirements.financial) {
        Object.entries(requirements.financial).forEach(([field, required]) => {
          if (required) {
            const value = startup?.[field]

            if (isFieldEmpty(value)) {
              const fieldInfo = FIELD_LABELS[field]
              if (fieldInfo) {
                missing.push({
                  category: 'financial',
                  field,
                  label: fieldInfo.label,
                  settingsPage: fieldInfo.page,
                })
              }
            }
          }
        })
      }

      // Check document requirements (map to company category)
      if (requirements.documents) {
        Object.entries(requirements.documents).forEach(([field, required]) => {
          if (required) {
            const value = startup?.[field]

            if (isFieldEmpty(value)) {
              const fieldInfo = FIELD_LABELS[field]
              if (fieldInfo) {
                missing.push({
                  category: 'company', // Map documents to company category
                  field,
                  label: fieldInfo.label,
                  settingsPage: fieldInfo.page,
                })
              }
            }
          }
        })
      }

      setMissingFields(missing)
      setIsValid(missing.length === 0)
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        Object.keys(error).length === 0
      ) {
        console.warn(
          'Caught an empty error object during validation. Suppressing toast.',
        )
        return
      }
      console.error('Error checking validation:', error)
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : 'Failed to validate requirements.'

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }, [toast, requirements, user, currentStartupId, supabase])

  const executeIfValid = (action: () => void, fallback?: () => void) => {
    if (isValid) {
      action()
    } else {
      if (fallback) {
        fallback()
      } else {
        const missingFieldNames = missingFields.map((f) => f.label).join(', ')
        toast({
          variant: 'info',
          title: 'Profile incomplete',
          description: `Please complete: ${missingFieldNames}`,
        })
      }
      // the validation gate, which is where this will be triggered from.
      checkValidation().then(() => {
        // After re-checking, if now valid, run the action
        if (isValid) {
          action()
        }
      })
    }
  }

  // Effect to run validation check automatically
  useEffect(() => {
    // We check user and currentStartupId here as well to prevent unnecessary runs
    if (autoCheck && user && currentStartupId) {
      checkValidation()
    }
  }, [user, currentStartupId, autoCheck, checkValidation])

  return {
    isValid,
    missingFields,
    loading,
    checkValidation,
    executeIfValid,
  }
}
