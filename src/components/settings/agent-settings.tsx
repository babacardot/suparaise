'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
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
                  <Input
                    id="submissionDelay"
                    type="number"
                    value={formData.submissionDelay}
                    onChange={(e) =>
                      handleInputChange(
                        'submissionDelay',
                        parseInt(e.target.value) || 30,
                      )
                    }
                    className={cn(
                      'rounded-sm pr-8',
                      editingField !== 'submissionDelay' && 'bg-muted',
                    )}
                    readOnly={editingField !== 'submissionDelay'}
                    min="10"
                    max="300"
                    placeholder="30"
                  />
                  {editingField !== 'submissionDelay' ? (
                    <button
                      onClick={() => handleFieldEdit('submissionDelay')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFieldSave('submissionDelay')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                      disabled={isLoading}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retryAttempts">Retry attempts</Label>
                <div className="relative">
                  <Input
                    id="retryAttempts"
                    type="number"
                    value={formData.retryAttempts}
                    onChange={(e) =>
                      handleInputChange(
                        'retryAttempts',
                        parseInt(e.target.value) || 3,
                      )
                    }
                    className={cn(
                      'rounded-sm pr-8',
                      editingField !== 'retryAttempts' && 'bg-muted',
                    )}
                    readOnly={editingField !== 'retryAttempts'}
                    min="1"
                    max="10"
                    placeholder="3"
                  />
                  {editingField !== 'retryAttempts' ? (
                    <button
                      onClick={() => handleFieldEdit('retryAttempts')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFieldSave('retryAttempts')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                      disabled={isLoading}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxParallelSubmissions">
                  Parallel submissions
                </Label>
                <div className="relative">
                  <Input
                    id="maxParallelSubmissions"
                    type="number"
                    value={formData.maxParallelSubmissions}
                    onChange={(e) =>
                      handleInputChange(
                        'maxParallelSubmissions',
                        parseInt(e.target.value) || 3,
                      )
                    }
                    className={cn(
                      'rounded-sm pr-8',
                      editingField !== 'maxParallelSubmissions' && 'bg-muted',
                    )}
                    readOnly={editingField !== 'maxParallelSubmissions'}
                    min="1"
                    max="10"
                    placeholder="3"
                  />
                  {editingField !== 'maxParallelSubmissions' ? (
                    <button
                      onClick={() => handleFieldEdit('maxParallelSubmissions')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFieldSave('maxParallelSubmissions')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                      disabled={isLoading}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeoutMinutes">Task timeout</Label>
                <div className="relative">
                  <Input
                    id="timeoutMinutes"
                    type="number"
                    value={formData.timeoutMinutes}
                    onChange={(e) =>
                      handleInputChange(
                        'timeoutMinutes',
                        parseInt(e.target.value) || 10,
                      )
                    }
                    className={cn(
                      'rounded-sm pr-8',
                      editingField !== 'timeoutMinutes' && 'bg-muted',
                    )}
                    readOnly={editingField !== 'timeoutMinutes'}
                    min="5"
                    max="60"
                    placeholder="10"
                  />
                  {editingField !== 'timeoutMinutes' ? (
                    <button
                      onClick={() => handleFieldEdit('timeoutMinutes')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFieldSave('timeoutMinutes')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                      disabled={isLoading}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border rounded-sm hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="enableStealth"
                  checked={formData.enableStealth}
                  onCheckedChange={(checked) =>
                    handleInputChange('enableStealth', checked)
                  }
                />
                <div className="grid gap-1.5 leading-none flex-1">
                  <Label htmlFor="enableStealth" className="font-medium">
                    Stealth mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Use built-in patches to avoid bot detection
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-sm hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="enableDebugMode"
                  checked={formData.enableDebugMode}
                  onCheckedChange={(checked) =>
                    handleInputChange('enableDebugMode', checked)
                  }
                />
                <div className="grid gap-1.5 leading-none flex-1">
                  <Label htmlFor="enableDebugMode" className="font-medium">
                    Debug mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Save detailed logs and screenshots for troubleshooting
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Style */}
          <div className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor="preferredTone">Tone</Label>
              <div className="relative">
                <select
                  id="preferredTone"
                  className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                  value={formData.preferredTone}
                  onChange={async (e) => {
                    const newValue = e.target
                      .value as typeof formData.preferredTone
                    handleInputChange('preferredTone', newValue)
                    await handleFieldSave('preferredTone')
                  }}
                  disabled={isLoading}
                >
                  <option value="professional">Professional</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
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
