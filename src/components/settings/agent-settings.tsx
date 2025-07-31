'use client'

import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/actions/utils'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'

// Helper function to format field names for display
const formatFieldName = (fieldName: string): string => {
  const fieldLabels: Record<string, string> = {
    submissionDelay: 'Submission delay',
    maxParallelSubmissions: 'Parallel submissions',
    enableDebugMode: 'Debug mode',
    customInstructions: 'Instructions',
    preferredTone: 'Tone',
    enableStealth: 'Stealth',
  }
  return fieldLabels[fieldName] || fieldName
}

// Type definitions for agent settings response
type AgentSettingsResponse = {
  submissionDelay?: number
  maxParallelSubmissions?: number
  enableDebugMode?: boolean
  customInstructions?: string
  preferredTone?: 'professional' | 'enthusiastic' | 'concise' | 'detailed'
  enableStealth?: boolean
  permissionLevel?: 'FREE' | 'PRO' | 'MAX'
  error?: string
}

// Type guard to check if data is a valid agent settings response
const isAgentSettingsResponse = (
  data: unknown,
): data is AgentSettingsResponse => {
  return typeof data === 'object' && data !== null && !Array.isArray(data)
}

// Skeleton loading component that mimics the form layout
function AgentSettingsSkeleton() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold -mt-2 mb-2">Agents</h2>
        <p className="text-muted-foreground">
          Customize how agents represent you to investors.
        </p>
      </div>

      <Separator className="flex-shrink-0 max-w-[98.7%]" />

      <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
        <div className="space-y-6 pr-2">
          {/* Basic Agents Settings Skeleton */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          </div>

          {/* Preferences Skeleton */}
          <div className="space-y-3">
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 border rounded-sm"
                >
                  <Skeleton className="h-4 w-4" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Style Skeleton */}
          <div className="space-y-3">
            <div className="space-y-3">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-9 w-full" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgentSettings() {
  const { user, supabase, currentStartupId } = useUser()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [dataLoading, setDataLoading] = useState(true)
  const [isKnowledgeBaseExpanded, setIsKnowledgeBaseExpanded] = useState(false)

  const [formData, setFormData] = useState({
    submissionDelay: 30, // seconds between submissions
    maxParallelSubmissions: 1,
    enableDebugMode: false,
    customInstructions: '',
    preferredTone: 'professional' as
      | 'professional'
      | 'enthusiastic'
      | 'concise'
      | 'detailed',
    enableStealth: true, // avoid detection
    permissionLevel: 'FREE' as 'FREE' | 'PRO' | 'MAX', // user's subscription level
    // Knowledge base fields
    kpis: '',
    risks: '',
    unfairAdvantage: '',
    useOfFunds: '',
  })

  // Fetch agent settings when component mounts or startup changes
  // Optimized to only depend on essential values that actually change
  useEffect(() => {
    const fetchAgentSettings = async () => {
      if (!user?.id || !currentStartupId) return

      setDataLoading(true)
      try {
        const { data, error } = await supabase.rpc('get_user_agent_settings', {
          p_user_id: user.id,
          p_startup_id: currentStartupId,
        })

        if (error) {
          console.error('Error fetching agent settings:', error)
          // Continue with defaults if no settings found
        } else if (
          data &&
          isAgentSettingsResponse(data) &&
          Object.keys(data).length > 0 &&
          !data.error
        ) {
          setFormData((prev) => ({
            ...prev,
            ...data,
            permissionLevel: data.permissionLevel || 'FREE',
          }))
        }
      } catch (error) {
        console.error('Error fetching agent settings:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load agent settings. Using defaults.',
        })
      } finally {
        setDataLoading(false)
      }
    }

    fetchAgentSettings()
    // Only depend on values that actually matter for the fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentStartupId]) // Intentionally omitting supabase and toast - they are stable references

  if (!user) {
    return <div></div>
  }

  if (dataLoading) {
    return <AgentSettingsSkeleton />
  }

  const handleInputChange = (
    field: string,
    value: string | boolean | number | string[],
  ) => {
    // Check permissions for debug mode (MAX only)
    if (field === 'enableDebugMode') {
      if (!isAdvancedFeatureAvailable()) {
        toast({
          variant: 'info',
          title: 'Feature locked',
          description:
            'Developer mode is only available for MAX users. Please upgrade your plan.',
        })
        return
      }
    }

    if (field === 'preferredTone' || field === 'customInstructions') {
      if (!isProPlusFeatureAvailable()) {
        toast({
          variant: 'info',
          title: 'Feature locked',
          description:
            'This feature is only available for PRO and MAX users. Please upgrade your plan.',
        })
        return
      }
    }

    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFieldSave = async (
    field: string,
    value?: string | boolean | number,
  ) => {
    if (!currentStartupId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No startup selected.',
      })
      return
    }

    setIsLoading(true)
    try {
      const valueToSave =
        value !== undefined ? value : formData[field as keyof typeof formData]
      const updateData = { [field]: valueToSave }

      const { data, error } = await supabase.rpc('update_user_agent_settings', {
        p_user_id: user.id,
        p_startup_id: currentStartupId,
        p_data: updateData,
      })

      if (error) throw error

      if (isAgentSettingsResponse(data) && data.error) {
        throw new Error(data.error)
      }

      toast({
        title: 'Agents settings updated',
        variant: 'success',
        description: `${formatFieldName(field)} has been updated successfully.`,
      })
    } catch (error) {
      console.error(`Error saving ${field}:`, error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to update ${formatFieldName(field)}. Please try again.`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions for permission-based features
  const getMaxParallelOptions = () => {
    const standardOptions = [
      { value: 1, label: '1 submission', tier: 'FREE' },
      { value: 3, label: '3 submissions', tier: 'PRO' },
      { value: 5, label: '5 submissions', tier: 'MAX' },
    ]

    // Enterprise options that can be set from database
    const enterpriseOptions = [
      { value: 15, label: '15 submissions', tier: 'ENTERPRISE' },
      { value: 25, label: '25 submissions', tier: 'ENTERPRISE' },
      { value: 35, label: '35 submissions', tier: 'ENTERPRISE' },
    ]

    // Always include standard options
    const availableOptions = [...standardOptions]

    // If current value is an enterprise option, include it in the dropdown
    const currentValue = formData.maxParallelSubmissions
    const enterpriseOption = enterpriseOptions.find(
      (opt) => opt.value === currentValue,
    )
    if (
      enterpriseOption &&
      !availableOptions.find((opt) => opt.value === currentValue)
    ) {
      availableOptions.push(enterpriseOption)
      // Sort by value to maintain logical order
      availableOptions.sort((a, b) => a.value - b.value)
    }

    return availableOptions
  }

  const getSubmissionDelayOptions = () => {
    const allOptions = [
      { value: 0, label: 'No delay', tier: 'MAX' },
      { value: 15, label: '15 seconds', tier: 'PRO' },
      { value: 30, label: '30 seconds', tier: 'FREE' },
    ]

    return allOptions
  }

  const isOptionAllowed = (tier: string) => {
    if (tier === 'FREE') return true
    if (tier === 'PRO')
      return (
        formData.permissionLevel === 'PRO' || formData.permissionLevel === 'MAX'
      )
    if (tier === 'MAX') return formData.permissionLevel === 'MAX'
    if (tier === 'ENTERPRISE') {
      // Enterprise options are only allowed if the current value is already set to that value
      // This allows users with enterprise settings from the database to see their current option
      const currentValue = formData.maxParallelSubmissions
      return currentValue >= 15 // Enterprise starts at 15 parallel submissions
    }
    return false
  }

  const isProPlusFeatureAvailable = () =>
    formData.permissionLevel === 'PRO' || formData.permissionLevel === 'MAX'
  const isAdvancedFeatureAvailable = () => formData.permissionLevel === 'MAX'

  return (
    <div className="h-full flex flex-col overflow-hidden select-none">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold -mt-2 mb-2">Agents</h2>
        <p className="text-muted-foreground">
          Customize how agents represent you to investors.
        </p>
      </div>

      <Separator className="flex-shrink-0 max-w-[98.7%]" />

      <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
        <div className="space-y-6 pr-2">
          {/* Advanced Features */}
          <div className="space-y-4">
            <div
              className={cn(
                'group relative p-4 border rounded-sm transition-all duration-200',
                'hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/20',
                formData.enableStealth &&
                  'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10',
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Label
                      htmlFor="enableStealth"
                      className="font-medium text-sm"
                    >
                      Stealth
                    </Label>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Use advanced patches to mimic human behavior patterns, avoid
                    bot detection, and ensure natural interaction with investor
                    portals.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const newValue = !formData.enableStealth
                    handleInputChange('enableStealth', newValue)
                    await handleFieldSave('enableStealth', newValue)
                  }}
                  className={cn(
                    'relative inline-flex h-5 w-9 items-center rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    formData.enableStealth
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-3 w-3 transform rounded-sm bg-white transition-transform',
                      formData.enableStealth
                        ? 'translate-x-5'
                        : 'translate-x-1',
                    )}
                  />
                </button>
              </div>
            </div>

            <div
              className={cn(
                'group relative p-4 border rounded-sm transition-all duration-200',
                !isAdvancedFeatureAvailable()
                  ? 'bg-muted/30 border-muted'
                  : 'hover:border-orange-200 dark:hover:border-orange-800 hover:bg-orange-50/50 dark:hover:bg-orange-950/20',
                formData.enableDebugMode &&
                  isAdvancedFeatureAvailable() &&
                  'border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-950/10',
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Label
                      htmlFor="enableDebugMode"
                      className={cn(
                        'font-medium text-sm',
                        !isAdvancedFeatureAvailable() &&
                          'text-muted-foreground',
                      )}
                    >
                      Developer mode
                    </Label>
                    {!isAdvancedFeatureAvailable() && (
                      <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded">
                        MAX
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-xs leading-relaxed',
                      !isAdvancedFeatureAvailable()
                        ? 'text-muted-foreground/60'
                        : 'text-muted-foreground',
                    )}
                  >
                    Access detailed logs, screenshots, and insights to optimize
                    your agent performance.
                    {!isAdvancedFeatureAvailable() && (
                      <span className="block mt-1 text-orange-600 dark:text-orange-400">
                        Upgrade to MAX to access this feature
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const newValue = !formData.enableDebugMode
                    handleInputChange('enableDebugMode', newValue)
                    await handleFieldSave('enableDebugMode', newValue)
                  }}
                  disabled={!isAdvancedFeatureAvailable()}
                  className={cn(
                    'relative inline-flex h-5 w-9 items-center rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
                    formData.enableDebugMode && isAdvancedFeatureAvailable()
                      ? 'bg-orange-600'
                      : 'bg-gray-200 dark:bg-gray-700',
                    !isAdvancedFeatureAvailable() &&
                      'opacity-50 cursor-not-allowed',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-3 w-3 transform rounded-sm bg-white transition-transform',
                      formData.enableDebugMode && isAdvancedFeatureAvailable()
                        ? 'translate-x-5'
                        : 'translate-x-1',
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Basic Agents Settings */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="submissionDelay">
                  Delay between submissions
                </Label>
                <div className="relative">
                  <select
                    id="submissionDelay"
                    className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                    value={formData.submissionDelay}
                    onChange={async (e) => {
                      const newValue = parseInt(e.target.value) || 30
                      const selectedOption = getSubmissionDelayOptions().find(
                        (opt) => opt.value === newValue,
                      )

                      if (
                        selectedOption &&
                        !isOptionAllowed(selectedOption.tier)
                      ) {
                        toast({
                          variant: 'info',
                          title: 'Feature locked',
                          description: `This option requires ${selectedOption.tier} plan. Please upgrade to access it.`,
                        })
                        return
                      }

                      handleInputChange('submissionDelay', newValue)
                      await handleFieldSave('submissionDelay', newValue)
                    }}
                    disabled={isLoading}
                  >
                    {getSubmissionDelayOptions().map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={!isOptionAllowed(option.tier)}
                        style={{
                          color: !isOptionAllowed(option.tier)
                            ? '#9ca3af'
                            : 'inherit',
                        }}
                      >
                        {option.label}
                        {!isOptionAllowed(option.tier) && ` [${option.tier}]`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="maxParallelSubmissions">
                  Parallel submissions
                </Label>
                <div className="relative">
                  <select
                    id="maxParallelSubmissions"
                    className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                    value={formData.maxParallelSubmissions}
                    onChange={async (e) => {
                      const newValue = parseInt(e.target.value) || 2
                      const selectedOption = getMaxParallelOptions().find(
                        (opt) => opt.value === newValue,
                      )

                      if (
                        selectedOption &&
                        !isOptionAllowed(selectedOption.tier)
                      ) {
                        toast({
                          variant: 'info',
                          title: 'Feature locked',
                          description: `This option requires ${selectedOption.tier} plan. Please upgrade to access it.`,
                        })
                        return
                      }

                      handleInputChange('maxParallelSubmissions', newValue)
                      await handleFieldSave('maxParallelSubmissions', newValue)
                    }}
                    disabled={isLoading}
                  >
                    {getMaxParallelOptions().map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={!isOptionAllowed(option.tier)}
                        style={{
                          color: !isOptionAllowed(option.tier)
                            ? '#9ca3af'
                            : 'inherit',
                        }}
                      >
                        {option.label}
                        {!isOptionAllowed(option.tier) && ` [${option.tier}]`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Style */}
          <div className="space-y-3">
            <div className="space-y-3">
              <Label htmlFor="preferredTone">
                Tone
                {!isProPlusFeatureAvailable() && (
                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                    PRO
                  </span>
                )}
              </Label>
              <div className="relative">
                <select
                  id="preferredTone"
                  className={cn(
                    'w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm',
                    !isProPlusFeatureAvailable() &&
                      'bg-muted/50 text-muted-foreground cursor-not-allowed',
                  )}
                  value={formData.preferredTone}
                  onChange={async (e) => {
                    if (!isProPlusFeatureAvailable()) {
                      return
                    }
                    const newValue = e.target
                      .value as typeof formData.preferredTone
                    handleInputChange('preferredTone', newValue)
                    await handleFieldSave('preferredTone', newValue)
                  }}
                  disabled={isLoading || !isProPlusFeatureAvailable()}
                >
                  <option value="professional">Professional</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="customInstructions">
                Instructions
                {!isProPlusFeatureAvailable() && (
                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                    PRO
                  </span>
                )}
              </Label>
              <div className="relative">
                <Textarea
                  id="customInstructions"
                  value={formData.customInstructions}
                  onChange={(e) =>
                    handleInputChange('customInstructions', e.target.value)
                  }
                  onBlur={() => handleFieldSave('customInstructions')}
                  className={cn(
                    'rounded-sm pr-8 min-h-[100px] select-auto',
                    !isProPlusFeatureAvailable() &&
                      'dark:bg-muted cursor-not-allowed text-muted-foreground',
                  )}
                  placeholder={
                    isProPlusFeatureAvailable()
                      ? "Any specific instructions for how the agent should fill out forms or communicate. For example: 'Always mention our flagship product when describing the solution' or 'Emphasize our B2B SaaS experience'..."
                      : 'Always mention our flagship product when describing the solution. Emphasize our B2B SaaS experience...'
                  }
                  rows={4}
                  disabled={!isProPlusFeatureAvailable()}
                  enableAI={isProPlusFeatureAvailable()}
                  aiFieldType="instructions"
                  aiContext={{
                    companyName: user?.user_metadata?.companyName || '',
                  }}
                  onAIEnhance={(enhancedText) =>
                    handleInputChange('customInstructions', enhancedText)
                  }
                />
              </div>
            </div>
          </div>

          {/* Agent Knowledge Base */}
          <div className="space-y-3">
            <button
              onClick={() =>
                setIsKnowledgeBaseExpanded(!isKnowledgeBaseExpanded)
              }
              className="flex items-center gap-2 w-full text-left hover:text-foreground transition-colors"
            >
              {isKnowledgeBaseExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="font-medium text-sm">Agent context</span>
            </button>

            {isKnowledgeBaseExpanded && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                <p className="text-xs text-muted-foreground">
                  Provide detailed answers to these key questions to give your
                  agent a deep, contextual understanding of your startup.
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="kpis" className="text-sm font-medium">
                      About your key performance indicators
                    </Label>
                    <Textarea
                      id="kpis"
                      value={formData.kpis}
                      onChange={(e) =>
                        handleInputChange('kpis', e.target.value)
                      }
                      onBlur={() => handleFieldSave('kpis')}
                      className="rounded-sm min-h-[80px]"
                      placeholder="e.g., Customer Acquisition Cost (CAC), Customer Lifetime Value (LTV), Churn Rate..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risks" className="text-sm font-medium">
                      About your current challenges
                    </Label>
                    <Textarea
                      id="risks"
                      value={formData.risks}
                      onChange={(e) =>
                        handleInputChange('risks', e.target.value)
                      }
                      onBlur={() => handleFieldSave('risks')}
                      className="rounded-sm min-h-[80px]"
                      placeholder="e.g., Market competition, regulatory hurdles, technological challenges, key dependencies..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="unfairAdvantage"
                      className="text-sm font-medium"
                    >
                      About your unfair advantage
                    </Label>
                    <Textarea
                      id="unfairAdvantage"
                      value={formData.unfairAdvantage}
                      onChange={(e) =>
                        handleInputChange('unfairAdvantage', e.target.value)
                      }
                      onBlur={() => handleFieldSave('unfairAdvantage')}
                      className="rounded-sm min-h-[80px]"
                      placeholder="e.g., Proprietary technology, exclusive partnerships, unique data access, world-class team expertise..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="useOfFunds" className="text-sm font-medium">
                      About your use of funds
                    </Label>
                    <Textarea
                      id="useOfFunds"
                      value={formData.useOfFunds}
                      onChange={(e) =>
                        handleInputChange('useOfFunds', e.target.value)
                      }
                      onBlur={() => handleFieldSave('useOfFunds')}
                      className="rounded-sm min-h-[80px]"
                      placeholder="e.g., 40% for product development, 30% for sales & marketing, 20% for hiring key personnel, 10% for operational expenses..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
