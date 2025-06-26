'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

// Define required field categories
export interface ValidationRequirements {
    founder?: {
        firstName?: boolean
        lastName?: boolean
        email?: boolean
        bio?: boolean
        role?: boolean
    }
    company?: {
        name?: boolean
        industry?: boolean
        location?: boolean
        descriptionShort?: boolean
        descriptionMedium?: boolean
        fundingRound?: boolean
        legalStructure?: boolean
        employeeCount?: boolean
        foundedYear?: boolean
    }
    financial?: {
        fundingAmountSought?: boolean
        preMoneyValuation?: boolean
        investmentInstrument?: boolean
    }
    documents?: {
        pitchDeck?: boolean
        logo?: boolean
    }
}

interface MissingField {
    category: 'founder' | 'company' | 'financial' | 'documents'
    field: string
    label: string
    settingsPage: 'profile' | 'company'
}

interface ValidationGateProps {
    children: React.ReactNode
    requirements: ValidationRequirements
    actionName?: string
    className?: string
    variant?: 'button' | 'wrapper'
    onValidationPass?: () => void
    disabled?: boolean
}

const FIELD_LABELS: Record<string, { label: string; page: 'profile' | 'company' }> = {
    // Founder fields
    firstName: { label: 'First name', page: 'profile' },
    lastName: { label: 'Last name', page: 'profile' },
    email: { label: 'Email', page: 'profile' },
    bio: { label: 'Bio', page: 'profile' },
    role: { label: 'Role', page: 'profile' },

    // Company fields
    name: { label: 'Company name', page: 'company' },
    industry: { label: 'Industry', page: 'company' },
    location: { label: 'Location', page: 'company' },
    descriptionShort: { label: 'One-liner', page: 'company' },
    descriptionMedium: { label: 'Elevator pitch', page: 'company' },
    fundingRound: { label: 'Funding stage', page: 'company' },
    legalStructure: { label: 'Legal structure', page: 'company' },
    employeeCount: { label: 'Team size', page: 'company' },
    foundedYear: { label: 'Founded year', page: 'company' },

    // Financial fields
    fundingAmountSought: { label: 'Funding amount', page: 'company' },
    preMoneyValuation: { label: 'Pre-money valuation', page: 'company' },
    investmentInstrument: { label: 'Investment type', page: 'company' },

    // Document fields
    pitchDeck: { label: 'Pitch deck', page: 'company' },
    logo: { label: 'Company logo', page: 'company' },
}

export function ValidationGate({
    children,
    requirements,
    actionName = 'this action',
    className = '',
    variant = 'button',
    onValidationPass,
    disabled = false,
}: ValidationGateProps) {
    const { user, supabase, currentStartupId } = useUser()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [missingFields, setMissingFields] = useState<MissingField[]>([])
    const [isValid, setIsValid] = useState(false)
    const [showDetails, setShowDetails] = useState(false)


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

            const missing: MissingField[] = []
            const founder = founderData?.[0] // Get the first founder (main user)

            // Check founder requirements
            if (requirements.founder) {
                Object.entries(requirements.founder).forEach(([field, required]) => {
                    if (required && (!founder || !founder[field] || founder[field].toString().trim() === '')) {
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
                })
            }

            // Check company requirements
            if (requirements.company) {
                Object.entries(requirements.company).forEach(([field, required]) => {
                    if (required && (!startupData || !startupData[field] || startupData[field].toString().trim() === '')) {
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
                })
            }

            // Check financial requirements
            if (requirements.financial) {
                Object.entries(requirements.financial).forEach(([field, required]) => {
                    if (required && (!startupData || !startupData[field] || startupData[field] === 0)) {
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
                })
            }

            // Check document requirements
            if (requirements.documents) {
                Object.entries(requirements.documents).forEach(([field, required]) => {
                    if (required && (!startupData || !startupData[`${field}Url`])) {
                        const fieldInfo = FIELD_LABELS[field]
                        if (fieldInfo) {
                            missing.push({
                                category: 'documents',
                                field,
                                label: fieldInfo.label,
                                settingsPage: fieldInfo.page,
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
    }, [user, currentStartupId, requirements, supabase, toast])

    // Check validation on mount and when requirements change
    useEffect(() => {
        if (user && currentStartupId) {
            checkValidation()
        }
    }, [user, currentStartupId, requirements, checkValidation, isValid])

    const handleClick = () => {
        if (disabled) return

        if (isValid) {
            onValidationPass?.()
        } else {
            setShowDetails(true)
        }
    }

    const getCategoryIcon = (category: MissingField['category']) => {
        switch (category) {
            case 'founder':
                return '👤'
            case 'company':
                return '🏢'
            case 'financial':
                return '💰'
            case 'documents':
                return '📄'
            default:
                return '📋'
        }
    }

    const getCategoryName = (category: MissingField['category']) => {
        switch (category) {
            case 'founder':
                return 'Founder Profile'
            case 'company':
                return 'Company Details'
            case 'financial':
                return 'Financial Information'
            case 'documents':
                return 'Documents'
            default:
                return 'Requirements'
        }
    }

    const groupedMissingFields = missingFields.reduce((acc, field) => {
        if (!acc[field.category]) {
            acc[field.category] = []
        }
        acc[field.category].push(field)
        return acc
    }, {} as Record<string, MissingField[]>)

    if (variant === 'wrapper' && !isValid) {
        return (
            <div className={`relative ${className}`}>
                <div className="opacity-50 pointer-events-none">
                    {children}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-sm">
                    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
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
                        {React.cloneElement(children as React.ReactElement<{ disabled?: boolean; className?: string }>, {
                            disabled: disabled || loading || !isValid,
                            className: `${(children as React.ReactElement<{ disabled?: boolean; className?: string }>).props?.className || ''} ${!isValid && !disabled
                                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border-amber-200 dark:border-amber-800'
                                : ''
                                }`,
                        })}
                    </div>
                </PopoverTrigger>

                {!isValid && (
                    <PopoverContent className="w-80 p-0" align="start">
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <h4 className="font-medium text-sm">Complete your profile to {actionName}</h4>
                            </div>

                            <div className="space-y-3">
                                {Object.entries(groupedMissingFields).map(([category, fields]) => (
                                    <div key={category}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs">{getCategoryIcon(category as MissingField['category'])}</span>
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {getCategoryName(category as MissingField['category'])}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 ml-6">
                                            {fields.map((field) => (
                                                <Badge
                                                    key={field.field}
                                                    variant="outline"
                                                    className="text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                                                >
                                                    {field.label}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-3" />

                            <div className="flex gap-2">
                                <Link href={`/dashboard/${currentStartupId}/settings`}>
                                    <Button size="sm" className="text-xs">
                                        Complete your onboarding
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDetails(false)}
                                    className="text-xs"
                                >
                                    Close
                                </Button>
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
            bio: true,
        },
        company: {
            name: true,
            industry: true,
            descriptionShort: true,
            descriptionMedium: true,
            fundingRound: true,
        },
    } as ValidationRequirements,

    // Comprehensive application requirements
    FULL_APPLICATION: {
        founder: {
            firstName: true,
            lastName: true,
            email: true,
            bio: true,
            role: true,
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
        },
        financial: {
            fundingAmountSought: true,
            investmentInstrument: true,
        },
        documents: {
            pitchDeck: true,
        },
    } as ValidationRequirements,

    // Agent requirements
    AGENT_READY: {
        founder: {
            firstName: true,
            lastName: true,
            email: true,
        },
        company: {
            name: true,
            industry: true,
            descriptionShort: true,
            fundingRound: true,
        },
    } as ValidationRequirements,
} as const 