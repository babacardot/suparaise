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
// Optimized sound utility functions - don't block UI
const playSound = (soundFile: string) => {
  setTimeout(() => {
    try {
      const audio = new Audio(soundFile)
      audio.volume = 0.4
      audio.play().catch(() => {})
    } catch {}
  }, 0)
}

const playNopeSound = () => playSound('/sounds/nope.mp3')
const playLightSound = () => playSound('/sounds/light.mp3')

// Helper function to format field names for display
const formatFieldName = (fieldName: string): string => {
  const fieldLabels: Record<string, string> = {
    submissionDelay: 'Submission delay',
    maxParallelSubmissions: 'Parallel submissions',
    enableDebugMode: 'Debug mode',
    customInstructions: 'Instructions',
    preferredTone: 'Tone',
    model: 'Model',
    enableStealth: 'Stealth',
    enableAutopilot: 'Autopilot mode',
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
  model?: 'claude-4-sonnet' | 'gpt-5' | 'deepseek-r1-0528' | 'gemini-2.5-pro'
  enableStealth?: boolean
  enableAutopilot?: boolean
  permissionLevel?: 'FREE' | 'PRO' | 'MAX' | 'ENTERPRISE'
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
        <h2 className="text-2xl font-semibold mt-3 md:-mt-2 mb-2">Agents</h2>
        <p className="text-muted-foreground">
          Customize how agents represent you to investors.
        </p>
      </div>

      <Separator className="flex-shrink-0 max-w-[98.7%]" />

      <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
        <div className="space-y-6 pr-2">
          {/* Basic Agents Settings Skeleton */}
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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
  const [isCustomizationExpanded, setIsCustomizationExpanded] = useState(false)

  const [formData, setFormData] = useState({
    submissionDelay: 300, // seconds between submissions (5 minutes for FREE users)
    maxParallelSubmissions: 1,
    enableDebugMode: false,
    customInstructions: '',
    preferredTone: 'professional' as
      | 'professional'
      | 'enthusiastic'
      | 'concise'
      | 'detailed',
    model: 'claude-4-sonnet' as
      | 'claude-4-sonnet'
      | 'gpt-5'
      | 'deepseek-r1-0528'
      | 'gemini-2.5-pro',
    enableStealth: true, // avoid detection
    enableAutopilot: false, // AI automatic selection and submission
    permissionLevel: 'FREE' as 'FREE' | 'PRO' | 'MAX' | 'ENTERPRISE', // user's subscription level
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
        playNopeSound()
        toast({
          variant: 'info',
          title: 'Feature locked',
          description:
            'Developer mode is only available for MAX users. Please upgrade your plan.',
        })
        return
      }
    }

    // Check permissions for autopilot mode (ENTERPRISE only)
    if (field === 'enableAutopilot') {
      if (!isEnterpriseFeatureAvailable()) {
        playNopeSound()
        toast({
          variant: 'info',
          title: 'Feature locked',
          description:
            'Autopilot mode is only available for Enterprise users. Please upgrade your plan.',
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

    if (field === 'model') {
      if (!isProPlusFeatureAvailable()) {
        toast({
          variant: 'info',
          title: 'Feature locked',
          description:
            'Model selection is only available for PRO and MAX users. Please upgrade your plan.',
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
      { value: 30, label: '30 seconds', tier: 'PRO' },
      { value: 300, label: '5 minutes', tier: 'FREE' },
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
    formData.permissionLevel === 'PRO' ||
    formData.permissionLevel === 'MAX' ||
    formData.permissionLevel === 'ENTERPRISE'
  const isAdvancedFeatureAvailable = () =>
    formData.permissionLevel === 'MAX' ||
    formData.permissionLevel === 'ENTERPRISE'
  const isEnterpriseFeatureAvailable = () =>
    formData.permissionLevel === 'ENTERPRISE'

  const showCustomizationInline =
    formData.permissionLevel === 'PRO' ||
    formData.permissionLevel === 'MAX' ||
    formData.permissionLevel === 'ENTERPRISE'

  return (
    <div className="h-full flex flex-col overflow-hidden select-none">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold mt-3 md:-mt-2 mb-2">Agents</h2>
        <p className="text-muted-foreground">
          Customize how agents represent you to investors.
        </p>
      </div>

      <Separator className="flex-shrink-0 max-w-[98.7%]" />

      <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
        <div className="space-y-6 pr-2">
          {/* Advanced Features */}
          <div className="space-y-4">
            <div className="group relative p-4 border rounded-sm transition-all duration-200 border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10">
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
                    <span className="block mt-1 text-blue-600 dark:text-blue-400 font-medium">
                      Always enabled for optimal performance.
                    </span>
                  </p>
                </div>
                <div className="relative inline-flex h-5 w-9 items-center rounded-sm bg-blue-600 cursor-not-allowed opacity-75">
                  <span className="inline-block h-3 w-3 transform rounded-sm bg-white translate-x-5" />
                </div>
              </div>
            </div>

            <div
              className={cn(
                'group relative p-4 border rounded-sm transition-all duration-200',
                !isAdvancedFeatureAvailable()
                  ? 'bg-muted/30 border-muted'
                  : 'hover:border-amber-200 dark:hover:border-amber-800 hover:bg-amber-50/50 dark:hover:bg-amber-950/20',
                formData.enableDebugMode &&
                  isAdvancedFeatureAvailable() &&
                  'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10',
              )}
            >
              {!isAdvancedFeatureAvailable() && (
                <span className="absolute top-2 right-4 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded">
                  MAX
                </span>
              )}
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
                      Analytics
                    </Label>
                  </div>
                  <p
                    className={cn(
                      'text-xs leading-relaxed',
                      !isAdvancedFeatureAvailable()
                        ? 'text-muted-foreground'
                        : 'text-foreground/80',
                    )}
                  >
                    Access detailed logs, screenshots, and insights to optimize
                    your agent performance.
                    {!isAdvancedFeatureAvailable() && (
                      <span className="block mt-1 text-amber-600 dark:text-amber-400">
                        Upgrade to MAX to access this feature.
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={async (e) => {
                    // If user lacks access, provide feedback and do not proceed
                    if (!isAdvancedFeatureAvailable()) {
                      e.preventDefault()
                      playNopeSound()
                      toast({
                        variant: 'info',
                        title: 'Feature locked',
                        description:
                          'Developer mode is only available for MAX users. Please upgrade your plan.',
                      })
                      return
                    }
                    const newValue = !formData.enableDebugMode
                    handleInputChange('enableDebugMode', newValue)
                    await handleFieldSave('enableDebugMode', newValue)
                  }}
                  disabled={!isAdvancedFeatureAvailable()}
                  className={cn(
                    'relative inline-flex h-5 w-9 items-center rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
                    formData.enableDebugMode && isAdvancedFeatureAvailable()
                      ? 'bg-amber-600'
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

            <div
              className={cn(
                'group relative p-4 border rounded-sm transition-all duration-200',
                !isEnterpriseFeatureAvailable()
                  ? 'bg-muted/30 border-muted'
                  : 'hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50/50 dark:hover:bg-purple-950/20',
                formData.enableAutopilot &&
                  isEnterpriseFeatureAvailable() &&
                  'border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/10',
              )}
            >
              {!isEnterpriseFeatureAvailable() && (
                <span className="absolute top-2 right-4 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-1.5 py-0.5 rounded">
                  ENT
                </span>
              )}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Label
                      htmlFor="enableAutopilot"
                      className={cn(
                        'font-medium text-sm',
                        !isEnterpriseFeatureAvailable() &&
                          'text-muted-foreground',
                      )}
                    >
                      Autopilot
                    </Label>
                  </div>
                  <p
                    className={cn(
                      'text-xs leading-relaxed',
                      !isEnterpriseFeatureAvailable()
                        ? 'text-muted-foreground'
                        : 'text-foreground/80',
                    )}
                  >
                    AI automatically applies to best-matched funds based on your
                    profile.
                    {!isEnterpriseFeatureAvailable() && (
                      <span className="block mt-1 text-purple-600 dark:text-purple-400">
                        Upgrade to Enterprise to access this feature.
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={async (e) => {
                    // If user lacks access, provide feedback and do not proceed
                    if (!isEnterpriseFeatureAvailable()) {
                      e.preventDefault()
                      playNopeSound()
                      toast({
                        variant: 'info',
                        title: 'Feature locked',
                        description:
                          'Autopilot mode is only available for Enterprise users. Please upgrade your plan.',
                      })
                      return
                    }
                    const newValue = !formData.enableAutopilot
                    handleInputChange('enableAutopilot', newValue)
                    await handleFieldSave('enableAutopilot', newValue)
                  }}
                  disabled={!isEnterpriseFeatureAvailable()}
                  className={cn(
                    'relative inline-flex h-5 w-9 items-center rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
                    formData.enableAutopilot && isEnterpriseFeatureAvailable()
                      ? 'bg-purple-600'
                      : 'bg-gray-200 dark:bg-gray-700',
                    !isEnterpriseFeatureAvailable() &&
                      'opacity-50 cursor-not-allowed',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-3 w-3 transform rounded-sm bg-white transition-transform',
                      formData.enableAutopilot && isEnterpriseFeatureAvailable()
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
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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
                      const newValue = parseInt(e.target.value) || 300
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
                  Concurrent submissions
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

          {/* Style Customization */}
          <div className="space-y-3">
            {showCustomizationInline ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="model">Model</Label>
                  <div className="relative">
                    <select
                      id="model"
                      className={cn(
                        'w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm',
                        !isProPlusFeatureAvailable() &&
                          'bg-muted/50 text-muted-foreground cursor-not-allowed',
                      )}
                      value={formData.model}
                      onChange={async (e) => {
                        if (!isProPlusFeatureAvailable()) return
                        const newValue = e.target.value as typeof formData.model
                        handleInputChange('model', newValue)
                        await handleFieldSave('model', newValue)
                      }}
                      disabled={isLoading || !isProPlusFeatureAvailable()}
                    >
                      <option value="claude-4-sonnet">claude-4-sonnet</option>
                      <option value="gpt-5">gpt-5</option>
                      <option value="deepseek-r1-0528">deepseek-r1-0528</option>
                      <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="preferredTone">Tone</Label>
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
                  <Label htmlFor="customInstructions">Instructions</Label>
                  <div className="relative">
                    <Textarea
                      id="customInstructions"
                      value={formData.customInstructions}
                      onChange={(e) =>
                        handleInputChange('customInstructions', e.target.value)
                      }
                      onBlur={() => handleFieldSave('customInstructions')}
                      className={cn(
                        'rounded-sm pr-8 min-h[100px] select-auto',
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
            ) : (
              <>
                <button
                  onClick={() => {
                    playLightSound()
                    setIsCustomizationExpanded(!isCustomizationExpanded)
                  }}
                  className="flex items-center gap-2 w-full text-left hover:text-foreground transition-colors"
                >
                  {isCustomizationExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="font-medium text-sm">
                    Advanced customization
                  </span>
                  {!isProPlusFeatureAvailable() && (
                    <span className="text-xs -translate-x-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded ml-auto">
                      PRO
                    </span>
                  )}
                </button>

                {isCustomizationExpanded && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-3">
                      <Label htmlFor="model">Model</Label>
                      <div className="relative">
                        <select
                          id="model"
                          className={cn(
                            'w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm',
                            !isProPlusFeatureAvailable() &&
                              'bg-muted/50 text-muted-foreground cursor-not-allowed',
                          )}
                          value={formData.model}
                          onChange={async (e) => {
                            if (!isProPlusFeatureAvailable()) return
                            const newValue = e.target
                              .value as typeof formData.model
                            handleInputChange('model', newValue)
                            await handleFieldSave('model', newValue)
                          }}
                          disabled={isLoading || !isProPlusFeatureAvailable()}
                        >
                          <option value="claude-4-sonnet">
                            claude-4-sonnet
                          </option>
                          <option value="gpt-5">gpt-5</option>
                          <option value="deepseek-r1-0528">
                            deepseek-r1-0528
                          </option>
                          <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="preferredTone">Tone</Label>
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
                      <Label htmlFor="customInstructions">Instructions</Label>
                      <div className="relative">
                        <Textarea
                          id="customInstructions"
                          value={formData.customInstructions}
                          onChange={(e) =>
                            handleInputChange(
                              'customInstructions',
                              e.target.value,
                            )
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
                            handleInputChange(
                              'customInstructions',
                              enhancedText,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
