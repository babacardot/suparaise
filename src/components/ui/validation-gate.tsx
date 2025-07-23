'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import Link from 'next/link'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import { useValidation } from '@/lib/hooks/use-validation'
import { useUser } from '@/lib/contexts/user-context'

// Define required field categories
export interface ValidationRequirements {
  founder?: {
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    phone?: boolean
    bio?: boolean
    role?: boolean
    linkedin?: boolean
    githubUrl?: boolean
    personalWebsiteUrl?: boolean
  }
  company?: {
    name?: boolean
    website?: boolean
    industry?: boolean
    location?: boolean
    descriptionShort?: boolean
    descriptionMedium?: boolean
    descriptionLong?: boolean
    fundingRound?: boolean
    legalStructure?: boolean
    employeeCount?: boolean
    foundedYear?: boolean
    revenueModel?: boolean
    currentRunway?: boolean
    keyCustomers?: boolean
    competitors?: boolean
    isIncorporated?: boolean
    incorporationCountry?: boolean
    incorporationCity?: boolean
    operatingCountries?: boolean
    tractionSummary?: boolean
    marketSummary?: boolean
  }
  financial?: {
    fundingAmountSought?: boolean
    preMoneyValuation?: boolean
    investmentInstrument?: boolean
    mrr?: boolean
    arr?: boolean
  }
  documents?: {
    pitchDeckUrl?: boolean
    logoUrl?: boolean
    introVideoUrl?: boolean
  }
}

interface ValidationGateProps {
  children: React.ReactNode
  requirements: ValidationRequirements
  className?: string
  variant?: 'button' | 'wrapper'
  onValidationPass?: () => void
  disabled?: boolean
}

export function ValidationGate({
  children,
  requirements,
  className = '',
  variant = 'button',
  onValidationPass,
  disabled = false,
}: ValidationGateProps) {
  const { currentStartupId } = useUser()
  const [showDetails, setShowDetails] = React.useState(false)
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const { isValid, missingFields, loading } = useValidation({
    requirements,
    autoCheck: true,
  })

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  const handleClick = () => {
    if (disabled) return

    if (isValid) {
      onValidationPass?.()
    }
  }

  const handleMouseEnter = () => {
    if (!isValid) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
      setShowDetails(true)
    }
  }

  const handleMouseLeave = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    hideTimeoutRef.current = setTimeout(() => {
      setShowDetails(false)
    }, 150) // Small delay to prevent flickering
  }

  // Group missing fields by settings page
  const hasProfileMissing = missingFields.some(
    (field) => field.settingsPage === 'profile',
  )
  const hasCompanyMissing = missingFields.some(
    (field) => field.settingsPage === 'company',
  )

  // Format category name with proper capitalization
  const formatCategory = (category: string): string => {
    if (category === 'founder') return 'Founder'
    if (category === 'company') return 'Company'
    if (category === 'financial') return 'Financials'
    return category
  }

  if (variant === 'wrapper' && !isValid) {
    return (
      <div className={`relative ${className}`}>
        <div className="opacity-50 pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-sm">
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <LottieIcon animationData={animations.info} size={16} />
                <span className="text-sm font-medium">Profile incomplete</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (variant === 'button') {
    return (
      <Popover open={showDetails} onOpenChange={setShowDetails}>
        <PopoverTrigger asChild>
          <div
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={className}
          >
            {React.cloneElement(
              children as React.ReactElement<{
                disabled?: boolean
                className?: string
              }>,
              {
                disabled: disabled || loading || !isValid,
                // Keep original styling, don't override with amber when validation fails
              },
            )}
          </div>
        </PopoverTrigger>

        {!isValid && (
          <PopoverContent
            className="w-80 p-0 bg-sidebar border-sidebar-border rounded-sm shadow-lg"
            align="end"
            side="bottom"
            sideOffset={8}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="px-3 py-3">
              <div className="flex items-center gap-2 mb-3">
                <LottieIcon animationData={animations.info} size={16} />
                <h4 className="font-medium text-sm text-sidebar-foreground">
                  Complete your profile
                </h4>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {hasProfileMissing && (
                    <Link
                      href={`/dashboard/${currentStartupId}/settings/profile`}
                      className="group"
                    >
                      <Badge className="rounded-sm px-2.5 py-1 text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800 cursor-pointer transition-all duration-200 flex items-center gap-1.5">
                        Profile
                      </Badge>
                    </Link>
                  )}
                  {hasCompanyMissing && (
                    <Link
                      href={`/dashboard/${currentStartupId}/settings/company`}
                      className="group"
                    >
                      <Badge className="rounded-sm px-2.5 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 cursor-pointer transition-all duration-200 flex items-center gap-1.5">
                        Company
                      </Badge>
                    </Link>
                  )}
                </div>

                {/* Show most critical missing fields */}
                {missingFields.length > 0 && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      {missingFields
                        .filter((field) => field.category !== 'documents')
                        .slice(0, 4) // Show only first 4 most critical
                        .map((field, index) => (
                          <div
                            key={index}
                            className="text-xs text-sidebar-foreground/70 flex items-center gap-1.5"
                          >
                            <div className="w-1 h-1 rounded-full bg-sidebar-foreground/30" />
                            {field.label}
                            <span className="text-sidebar-foreground/50">
                              ({formatCategory(field.category)})
                            </span>
                          </div>
                        ))}
                      {missingFields.filter(
                        (field) => field.category !== 'documents',
                      ).length > 4 && (
                        <div className="text-xs text-sidebar-foreground/50 italic">
                          +
                          {missingFields.filter(
                            (field) => field.category !== 'documents',
                          ).length - 4}{' '}
                          more fields...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-sidebar-foreground/60 px-3 py-2 border-t border-sidebar-border bg-sidebar/30">
              Complete your profile to unlock all features.
            </div>
          </PopoverContent>
        )}
      </Popover>
    )
  }

  return <>{children}</>
}

// Predefined requirement sets for common use cases
export const VALIDATION_PRESETS = {
  // Basic application requirements
  BASIC_APPLICATION: {
    founder: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      // Removed bio, linkedin, githubUrl from mandatory - they will be recommended
    },
    company: {
      name: true,
      industry: true,
      location: true,
      descriptionShort: true,
      descriptionMedium: true,
      fundingRound: true,
      revenueModel: true,
      legalStructure: true,
    },
    financial: {
      fundingAmountSought: true,
      investmentInstrument: true,
      preMoneyValuation: true,
      mrr: true,
      arr: true,
    },
    documents: {
      pitchDeckUrl: true,
    },
  } as ValidationRequirements,

  // Comprehensive application requirements
  FULL_APPLICATION: {
    founder: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      // bio, linkedin, githubUrl are recommended, not mandatory
    },
    company: {
      name: true,
      industry: true,
      location: true,
      descriptionShort: true,
      descriptionMedium: true,
      fundingRound: true,
      legalStructure: true,
      employeeCount: true,
      foundedYear: true,
      revenueModel: true,
    },
    financial: {
      fundingAmountSought: true,
      investmentInstrument: true,
      preMoneyValuation: true,
    },
    documents: {
      pitchDeckUrl: true,
    },
  } as ValidationRequirements,

  // Agent requirements (essential fields for AI agent to work)
  AGENT_READY: {
    founder: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      // linkedin, githubUrl are recommended for better agent performance
    },
    company: {
      name: true,
      industry: true,
      location: true,
      descriptionShort: true,
      descriptionMedium: true,
      fundingRound: true,
      revenueModel: true,
      legalStructure: true,
    },
    financial: {
      fundingAmountSought: true,
      preMoneyValuation: true,
      mrr: true,
      arr: true,
    },
    documents: {
      pitchDeckUrl: true,
    },
  } as ValidationRequirements,
} as const
