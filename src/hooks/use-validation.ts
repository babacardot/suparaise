import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import type { ValidationRequirements } from '@/components/ui/validation-gate'

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
  }>
  loading: boolean
  checkValidation: () => Promise<void>
  executeIfValid: (action: () => void, fallback?: () => void) => void
}

const FIELD_LABELS: Record<string, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email',
  bio: 'Bio',
  role: 'Role',
  name: 'Company name',
  industry: 'Industry',
  location: 'Location',
  descriptionShort: 'One-liner',
  descriptionMedium: 'Elevator pitch',
  fundingRound: 'Funding stage',
  legalStructure: 'Legal structure',
  employeeCount: 'Team size',
  foundedYear: 'Founded year',
  fundingAmountSought: 'Funding amount',
  preMoneyValuation: 'Pre-money valuation',
  investmentInstrument: 'Investment type',
  pitchDeck: 'Pitch deck',
  logo: 'Company logo',
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
        }
      )

      if (founderError) throw founderError

      // Fetch startup data
      const { data: startupData, error: startupError } = await supabase.rpc(
        'get_user_startup_data',
        {
          p_user_id: user.id,
          p_startup_id: currentStartupId,
        }
      )

      if (startupError) throw startupError

      const missing: Array<{
        category: 'founder' | 'company' | 'financial' | 'documents'
        field: string
        label: string
      }> = []
      const founder = founderData?.[0]

      // Check founder requirements
      if (requirements.founder) {
        Object.entries(requirements.founder).forEach(([field, required]) => {
          if (
            required &&
            (!founder ||
              !founder[field] ||
              founder[field].toString().trim() === '')
          ) {
            const label = FIELD_LABELS[field]
            if (label) {
              missing.push({
                category: 'founder',
                field,
                label,
              })
            }
          }
        })
      }

      // Check company requirements
      if (requirements.company) {
        Object.entries(requirements.company).forEach(([field, required]) => {
          if (
            required &&
            (!startupData ||
              !startupData[field] ||
              startupData[field].toString().trim() === '')
          ) {
            const label = FIELD_LABELS[field]
            if (label) {
              missing.push({
                category: 'company',
                field,
                label,
              })
            }
          }
        })
      }

      // Check financial requirements
      if (requirements.financial) {
        Object.entries(requirements.financial).forEach(([field, required]) => {
          if (
            required &&
            (!startupData || !startupData[field] || startupData[field] === 0)
          ) {
            const label = FIELD_LABELS[field]
            if (label) {
              missing.push({
                category: 'financial',
                field,
                label,
              })
            }
          }
        })
      }

      // Check document requirements
      if (requirements.documents) {
        Object.entries(requirements.documents).forEach(([field, required]) => {
          if (required && (!startupData || !startupData[`${field}Url`])) {
            const label = FIELD_LABELS[field]
            if (label) {
              missing.push({
                category: 'documents',
                field,
                label,
              })
            }
          }
        })
      }

      setMissingFields(missing)
      setIsValid(missing.length === 0)
    } catch (error) {
      console.error('Error checking validation:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to validate requirements.',
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
          variant: 'destructive',
          title: 'Profile incomplete',
          description: `Please complete: ${missingFieldNames}`,
        })
      }
    }
  }

  useEffect(() => {
    if (autoCheck && user && currentStartupId) {
      checkValidation()
    }
  }, [user, currentStartupId, requirements, autoCheck, checkValidation])

  return {
    isValid,
    missingFields,
    loading,
    checkValidation,
    executeIfValid,
  }
} 