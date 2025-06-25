'use client'

import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { PencilIcon, CheckIcon, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/actions/utils'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'

// Helper function to format field names for display
const formatFieldName = (fieldName: string): string => {
  const fieldLabels: Record<string, string> = {
    submissionDelay: 'Submission delay',
    retryAttempts: 'Retry attempts',
    maxParallelSubmissions: 'Parallel submissions',
    enableDebugMode: 'Debug mode',
    customInstructions: 'Custom instructions',
    preferredTone: 'Tone',
    timeoutMinutes: 'Timeout',
    enableStealth: 'Stealth',
  }
  return fieldLabels[fieldName] || fieldName
}

// Skeleton loading component that mimics the form layout
function AgentSettingsSkeleton() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold -mt-2 mb-2">Agents</h2>
        <p className="text-muted-foreground">
          Customize how your AI agents represent you to investors.
        </p>
      </div>

      <Separator className="flex-shrink-0" />

      <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
        <div className="space-y-6 pr-2">
          {/* Basic Agents Settings Skeleton */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          </div>

          {/* Preferences Skeleton */}
          <div className="space-y-2">
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
          <div className="space-y-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-9 w-full" />
            </div>

            <div className="space-y-2">
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
  const [editingField, setEditingField] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  const [formData, setFormData] = useState({
    submissionDelay: 30, // seconds between submissions
    retryAttempts: 3,
    maxParallelSubmissions: 3,
    enableDebugMode: false,
    customInstructions: '',
    preferredTone: 'professional' as
      | 'professional'
      | 'enthusiastic'
      | 'concise'
      | 'detailed',
    timeoutMinutes: 10, // task timeout in minutes
    enableStealth: true, // avoid detection
    permissionLevel: 'FREE' as 'FREE' | 'PRO' | 'MAX', // user's subscription level
  })

  // Fetch agent settings when component mounts or startup changes
  useEffect(() => {
    const fetchAgentSettings = async () => {
      if (!user || !currentStartupId) return

      setDataLoading(true)
      try {
        const { data, error } = await supabase.rpc('get_user_agent_settings', {
          p_user_id: user.id,
          p_startup_id: currentStartupId,
        })

        if (error) {
          console.error('Error fetching agent settings:', error)
          // Continue with defaults if no settings found
        } else if (data && Object.keys(data).length > 0 && !data.error) {
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
  }, [user, currentStartupId, supabase, toast])

  if (!user) {
    return <div>Loading...</div>
  }

  if (dataLoading) {
    return <AgentSettingsSkeleton />
  }

  const handleInputChange = (
    field: string,
    value: string | boolean | number | string[],
  ) => {
    // Check permissions for advanced features
    if (field === 'enableStealth' || field === 'enableDebugMode') {
      if (!isAdvancedFeatureAvailable()) {
        toast({
          variant: 'destructive',
          title: 'Feature locked',
          description:
            'Stealth and debug modes are only available for MAX users. Please upgrade your plan.',
        })
        return
      }
    }

    if (field === 'preferredTone') {
      if (!isToneFeatureAvailable()) {
        toast({
          variant: 'destructive',
          title: 'Feature locked',
          description:
            'Tone selection is only available for PRO and MAX users. Please upgrade your plan.',
        })
        return
      }
    }

    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFieldEdit = (field: string) => {
    setEditingField(field)
    setTimeout(() => {
      document.getElementById(field)?.focus()
    }, 0)
  }

  const handleFieldSave = async (field: string) => {
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
      const updateData = { [field]: formData[field as keyof typeof formData] }

      const { data, error } = await supabase.rpc('update_user_agent_settings', {
        p_user_id: user.id,
        p_startup_id: currentStartupId,
        p_data: updateData,
      })

      if (error) throw error

      if (data?.error) {
        throw new Error(data.error)
      }

      setEditingField(null)
      toast({
        title: 'Agents settings updated',
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
    const baseOptions = [
      { value: 1, label: '1 submission' },
      { value: 2, label: '2 submissions' },
      { value: 3, label: '3 submissions' },
    ]

    if (formData.permissionLevel === 'PRO') {
      return [
        ...baseOptions,
        { value: 4, label: '4 submissions' },
        { value: 5, label: '5 submissions' },
      ]
    } else if (formData.permissionLevel === 'MAX') {
      return [
        ...baseOptions,
        { value: 4, label: '4 submissions' },
        { value: 5, label: '5 submissions' },
        { value: 6, label: '6 submissions' },
        { value: 7, label: '7 submissions' },
        { value: 8, label: '8 submissions' },
        { value: 9, label: '9 submissions' },
        { value: 10, label: '10 submissions' },
      ]
    }

    return [{ value: 1, label: '1 submission' }] // FREE tier
  }

  const isToneFeatureAvailable = () =>
    formData.permissionLevel === 'PRO' || formData.permissionLevel === 'MAX'
  const isAdvancedFeatureAvailable = () => formData.permissionLevel === 'MAX'

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold -mt-2 mb-2">Agents</h2>
        <p className="text-muted-foreground">
          Customize how your AI agents represent you to investors.
        </p>
      </div>

      <Separator className="flex-shrink-0" />

      <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
        <div className="space-y-6 pr-2">
          {/* Basic Agents Settings */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
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
                      handleInputChange('submissionDelay', newValue)
                      await handleFieldSave('submissionDelay')
                    }}
                    disabled={isLoading}
                  >
                    <option value={10}>10 seconds</option>
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={45}>45 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={90}>1.5 minutes</option>
                    <option value={120}>2 minutes</option>
                    <option value={180}>3 minutes</option>
                    <option value={300}>5 minutes</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retryAttempts">Retry attempts</Label>
                <div className="relative">
                  <select
                    id="retryAttempts"
                    className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                    value={formData.retryAttempts}
                    onChange={async (e) => {
                      const newValue = parseInt(e.target.value) || 3
                      handleInputChange('retryAttempts', newValue)
                      await handleFieldSave('retryAttempts')
                    }}
                    disabled={isLoading}
                  >
                    <option value={1}>1 attempt</option>
                    <option value={2}>2 attempts</option>
                    <option value={3}>3 attempts</option>
                    <option value={4}>4 attempts</option>
                    <option value={5}>5 attempts</option>
                    <option value={6}>6 attempts</option>
                    <option value={7}>7 attempts</option>
                    <option value={8}>8 attempts</option>
                    <option value={9}>9 attempts</option>
                    <option value={10}>10 attempts</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxParallelSubmissions">
                  Parallel submissions
                  <span
                    className={cn(
                      'ml-2 text-xs px-1.5 py-0.5 rounded',
                      formData.permissionLevel === 'FREE' &&
                        'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
                      formData.permissionLevel === 'PRO' &&
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                      formData.permissionLevel === 'MAX' &&
                        'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
                    )}
                  >
                    {formData.permissionLevel === 'FREE' && 'Max 1'}
                    {formData.permissionLevel === 'PRO' && 'Max 5'}
                    {formData.permissionLevel === 'MAX' && 'Max 10'}
                  </span>
                </Label>
                <div className="relative">
                  <select
                    id="maxParallelSubmissions"
                    className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                    value={formData.maxParallelSubmissions}
                    onChange={async (e) => {
                      const newValue = parseInt(e.target.value) || 3
                      handleInputChange('maxParallelSubmissions', newValue)
                      await handleFieldSave('maxParallelSubmissions')
                    }}
                    disabled={isLoading}
                  >
                    {getMaxParallelOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeoutMinutes">Task timeout</Label>
                <div className="relative">
                  <select
                    id="timeoutMinutes"
                    className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                    value={formData.timeoutMinutes}
                    onChange={async (e) => {
                      const newValue = parseInt(e.target.value) || 10
                      handleInputChange('timeoutMinutes', newValue)
                      await handleFieldSave('timeoutMinutes')
                    }}
                    disabled={isLoading}
                  >
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={20}>20 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <div className="space-y-4">
              <div
                className={cn(
                  'flex items-center space-x-3 p-3 border rounded-sm transition-colors',
                  !isAdvancedFeatureAvailable()
                    ? 'bg-muted/30 border-muted cursor-not-allowed'
                    : 'hover:bg-muted/50',
                )}
              >
                <Checkbox
                  id="enableStealth"
                  checked={formData.enableStealth}
                  onCheckedChange={(checked) =>
                    handleInputChange('enableStealth', checked)
                  }
                  disabled={!isAdvancedFeatureAvailable()}
                />
                <div className="grid gap-1.5 leading-none flex-1">
                  <Label
                    htmlFor="enableStealth"
                    className={cn(
                      'font-medium',
                      !isAdvancedFeatureAvailable() && 'text-muted-foreground',
                    )}
                  >
                    Stealth mode
                    {!isAdvancedFeatureAvailable() && (
                      <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded">
                        MAX only
                      </span>
                    )}
                  </Label>
                  <p
                    className={cn(
                      'text-sm',
                      !isAdvancedFeatureAvailable()
                        ? 'text-muted-foreground/60'
                        : 'text-muted-foreground',
                    )}
                  >
                    Use built-in patches to avoid bot detection
                    {!isAdvancedFeatureAvailable() && (
                      <span className="block text-xs mt-1 text-orange-600 dark:text-orange-400">
                        Upgrade to MAX to access stealth features
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  'flex items-center space-x-3 p-3 border rounded-sm transition-colors',
                  !isAdvancedFeatureAvailable()
                    ? 'bg-muted/30 border-muted cursor-not-allowed'
                    : 'hover:bg-muted/50',
                )}
              >
                <Checkbox
                  id="enableDebugMode"
                  checked={formData.enableDebugMode}
                  onCheckedChange={(checked) =>
                    handleInputChange('enableDebugMode', checked)
                  }
                  disabled={!isAdvancedFeatureAvailable()}
                />
                <div className="grid gap-1.5 leading-none flex-1">
                  <Label
                    htmlFor="enableDebugMode"
                    className={cn(
                      'font-medium',
                      !isAdvancedFeatureAvailable() && 'text-muted-foreground',
                    )}
                  >
                    Debug mode
                    {!isAdvancedFeatureAvailable() && (
                      <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded">
                        MAX only
                      </span>
                    )}
                  </Label>
                  <p
                    className={cn(
                      'text-sm',
                      !isAdvancedFeatureAvailable()
                        ? 'text-muted-foreground/60'
                        : 'text-muted-foreground',
                    )}
                  >
                    Save detailed logs and screenshots for troubleshooting
                    {!isAdvancedFeatureAvailable() && (
                      <span className="block text-xs mt-1 text-orange-600 dark:text-orange-400">
                        Upgrade to MAX to access debug features
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Style */}
          <div className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor="preferredTone">
                Tone
                {!isToneFeatureAvailable() && (
                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                    PRO+
                  </span>
                )}
              </Label>
              <div className="relative">
                <select
                  id="preferredTone"
                  className={cn(
                    'w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm',
                    !isToneFeatureAvailable() &&
                      'bg-muted/50 text-muted-foreground cursor-not-allowed',
                  )}
                  value={formData.preferredTone}
                  onChange={async (e) => {
                    if (!isToneFeatureAvailable()) {
                      toast({
                        variant: 'destructive',
                        title: 'Feature locked',
                        description:
                          'Tone selection is only available for PRO and MAX users. Please upgrade your plan.',
                      })
                      return
                    }
                    const newValue = e.target
                      .value as typeof formData.preferredTone
                    handleInputChange('preferredTone', newValue)
                    await handleFieldSave('preferredTone')
                  }}
                  disabled={isLoading || !isToneFeatureAvailable()}
                >
                  <option value="professional">Professional</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {!isToneFeatureAvailable() && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Upgrade to PRO or MAX to customize agent tone
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customInstructions">Custom instructions</Label>
              <div className="relative">
                <Textarea
                  id="customInstructions"
                  value={formData.customInstructions}
                  onChange={(e) =>
                    handleInputChange('customInstructions', e.target.value)
                  }
                  className={cn(
                    'rounded-sm pr-8 min-h-[100px]',
                    editingField !== 'customInstructions' && 'bg-muted',
                  )}
                  readOnly={editingField !== 'customInstructions'}
                  placeholder="Any specific instructions for how the agent should fill out forms or communicate. For example: 'Always mention our flagship product when describing the solution' or 'Emphasize our B2B SaaS experience'..."
                  rows={4}
                />
                {editingField !== 'customInstructions' ? (
                  <button
                    onClick={() => handleFieldEdit('customInstructions')}
                    className="absolute right-2 top-2 text-blue-500 hover:text-blue-600"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleFieldSave('customInstructions')}
                    className="absolute right-2 top-2 text-green-500 hover:text-green-600"
                    disabled={isLoading}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
