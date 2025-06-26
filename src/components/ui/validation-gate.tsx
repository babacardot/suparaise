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
import { useValidation } from '@/hooks/use-validation'
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

  const { isValid, missingFields, loading } = useValidation({
    requirements,
    autoCheck: true,
  })

  const handleClick = () => {
    if (disabled) return

    if (isValid) {
      onValidationPass?.()
    } else {
      setShowDetails(true)
    }
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
          <div onClick={handleClick} className={className}>
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
            className="w-80 p-0 rounded-sm border shadow-lg"
            align="end"
            side="bottom"
            sideOffset={8}
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <LottieIcon animationData={animations.info} size={18} />
                <h4 className="font-semibold text-sm text-foreground">
                  Complete your onboarding
                </h4>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {hasProfileMissing && (
                    <Link
                      href={`/dashboard/${currentStartupId}/settings/profile`}
                    >
                      <Badge className="rounded-sm px-3 py-1.5 text-xs bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-800 cursor-pointer transition-colors">
                        Profile
                      </Badge>
                    </Link>
                  )}
                  {hasCompanyMissing && (
                    <Link
                      href={`/dashboard/${currentStartupId}/settings/company`}
                    >
                      <Badge className="rounded-sm px-3 py-1.5 text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800 cursor-pointer transition-colors">
                        Company
                      </Badge>
                    </Link>
                  )}
                </div>

                {/* Show detailed missing fields for debugging */}
                {missingFields.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2 font-semibold">
                      Missing fields
                    </p>
                    <div className="space-y-1">
                      {missingFields
                        .filter((field) => field.category !== 'documents') // Remove documents from display
                        .map((field, index) => (
                          <div
                            key={index}
                            className="text-xs text-muted-foreground"
                          >
                            • {field.label} ({formatCategory(field.category)})
                          </div>
                        ))}
                    </div>

                    {/* Show recommended fields */}
                    <div className="mt-3 pt-2 border-t border-border/30">
                      <p className="text-xs text-muted-foreground mb-2 font-semibold">
                        Recommended
                      </p>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground/70">
                          · Bio (Founder)
                        </div>
                        <div className="text-xs text-muted-foreground/70">
                          · LinkedIn (Founder)
                        </div>
                        <div className="text-xs text-muted-foreground/70">
                          · Github (Founder)
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
