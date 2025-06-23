'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { PencilIcon, CheckIcon, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/actions/utils'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'

// Helper function to format field names for display
const formatFieldName = (fieldName: string): string => {
  const fieldLabels: Record<string, string> = {
    agentName: 'Agent name',
    submissionDelay: 'Submission delay',
    retryAttempts: 'Retry attempts',
    maxSteps: 'Max steps per task',
    maxParallelSubmissions: 'Max parallel submissions',
    autoSubmit: 'Auto-submit',
    requireReview: 'Require review',
    skipComplexForms: 'Skip complex forms',
    skipVideoRequirements: 'Skip video requirements',
    maxFormFields: 'Max form fields',
    enableDebugMode: 'Debug mode',
    customInstructions: 'Custom instructions',
    preferredTone: 'Communication tone',
    targetFundStages: 'Target fund stages',
    targetFundTypes: 'Target fund types',
    browserProvider: 'Browser provider',
    timeoutMinutes: 'Task timeout',
    enableStealth: 'Stealth mode',
  }
  return fieldLabels[fieldName] || fieldName
}

export default function AgentSettings() {
  const { user, supabase, currentStartupId } = useUser()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  const [formData, setFormData] = useState({
    agentName: 'Suparaise Agent',
    submissionDelay: 30, // seconds between submissions
    retryAttempts: 3,
    maxSteps: 50, // maximum steps per task
    maxParallelSubmissions: 3,
    autoSubmit: false,
    requireReview: true,
    skipComplexForms: false,
    skipVideoRequirements: true,
    maxFormFields: 25, // skip forms with more than this many fields
    enableDebugMode: false,
    customInstructions: '',
    preferredTone: 'professional' as
      | 'professional'
      | 'enthusiastic'
      | 'concise'
      | 'detailed',
    targetFundStages: [] as string[],
    targetFundTypes: [] as string[],
    browserProvider: 'Local' as 'Local' | 'Hyperbrowser',
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
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 pb-4">
          <h2 className="text-2xl font-semibold -mt-2 mb-2">Agent</h2>
          <p className="text-muted-foreground">
            Customize how your AI agents represent you to investors.
          </p>
        </div>
        <Separator className="flex-shrink-0" />
      </div>
    )
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
        title: 'Agent settings updated',
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

  const fundStages = [
    'Pre-Seed',
    'Seed',
    'Series A',
    'Series B',
    'Series C+',
    'Growth',
    'Late Stage',
  ]
  const fundTypes = [
    'Venture Capital',
    'Angel Group',
    'Corporate VC',
    'Accelerator',
    'Government Grant',
    'Family Office',
    'Strategic Investor',
  ]

  const toggleFundStage = (stage: string) => {
    setFormData((prev) => ({
      ...prev,
      targetFundStages: prev.targetFundStages.includes(stage)
        ? prev.targetFundStages.filter((s) => s !== stage)
        : [...prev.targetFundStages, stage],
    }))
  }

  const toggleFundType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      targetFundTypes: prev.targetFundTypes.includes(type)
        ? prev.targetFundTypes.filter((t) => t !== type)
        : [...prev.targetFundTypes, type],
    }))
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold -mt-2 mb-2">Agent</h2>
        <p className="text-muted-foreground">
          Customize how your AI agents represent you to investors.
        </p>
      </div>

      <Separator className="flex-shrink-0" />

      <div className="flex-1 overflow-auto pt-6 max-h-[62vh] hide-scrollbar">
        <div className="space-y-6 pr-2">
          {/* Basic Agent Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agentName">Agent name</Label>
              <div className="relative">
                <Input
                  id="agentName"
                  value={formData.agentName}
                  onChange={(e) =>
                    handleInputChange('agentName', e.target.value)
                  }
                  className={cn(
                    'rounded-sm pr-8',
                    editingField !== 'agentName' && 'bg-muted',
                  )}
                  readOnly={editingField !== 'agentName'}
                  placeholder="Give your agent a name"
                />
                {editingField !== 'agentName' ? (
                  <button
                    onClick={() => handleFieldEdit('agentName')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleFieldSave('agentName')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                    disabled={isLoading}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="submissionDelay">
                  Delay between submissions (seconds)
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
                <Label htmlFor="retryAttempts">Retry attempts on failure</Label>
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
                  Max parallel submissions
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
                <Label htmlFor="timeoutMinutes">Task timeout (minutes)</Label>
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

          {/* Automation Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Automation Preferences</h3>
            <p className="text-sm text-muted-foreground">
              Control how autonomous you want the agent to be.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border rounded-sm hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="autoSubmit"
                  checked={formData.autoSubmit}
                  onCheckedChange={(checked) =>
                    handleInputChange('autoSubmit', checked)
                  }
                />
                <div className="grid gap-1.5 leading-none flex-1">
                  <Label htmlFor="autoSubmit" className="font-medium">
                    Auto-submit applications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically submit applications without manual review
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-sm hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="requireReview"
                  checked={formData.requireReview}
                  onCheckedChange={(checked) =>
                    handleInputChange('requireReview', checked)
                  }
                />
                <div className="grid gap-1.5 leading-none flex-1">
                  <Label htmlFor="requireReview" className="font-medium">
                    Require review before submission
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show filled forms for approval before submitting
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-sm hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="skipComplexForms"
                  checked={formData.skipComplexForms}
                  onCheckedChange={(checked) =>
                    handleInputChange('skipComplexForms', checked)
                  }
                />
                <div className="grid gap-1.5 leading-none flex-1">
                  <Label htmlFor="skipComplexForms" className="font-medium">
                    Skip complex forms
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Skip forms with more than {formData.maxFormFields} fields
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-sm hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="skipVideoRequirements"
                  checked={formData.skipVideoRequirements}
                  onCheckedChange={(checked) =>
                    handleInputChange('skipVideoRequirements', checked)
                  }
                />
                <div className="grid gap-1.5 leading-none flex-1">
                  <Label
                    htmlFor="skipVideoRequirements"
                    className="font-medium"
                  >
                    Skip video requirements
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Skip applications that require video submissions
                  </p>
                </div>
              </div>

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
                    Enable stealth mode
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
                    Enable debug mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Save detailed logs and screenshots for troubleshooting
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Target Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Target Preferences</h3>
            <p className="text-sm text-muted-foreground">
              Configure which types of funding opportunities to target.
            </p>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Funding stages
                </Label>
                <div className="flex flex-wrap gap-2">
                  {fundStages.map((stage) => (
                    <Badge
                      key={stage}
                      variant={
                        formData.targetFundStages.includes(stage)
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => toggleFundStage(stage)}
                    >
                      {stage}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Fund types
                </Label>
                <div className="flex flex-wrap gap-2">
                  {fundTypes.map((type) => (
                    <Badge
                      key={type}
                      variant={
                        formData.targetFundTypes.includes(type)
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => toggleFundType(type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Communication Style */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Style</h3>
            <p className="text-sm text-muted-foreground">
              Customize how the agent communicates in applications.
            </p>

            <div className="space-y-2">
              <Label htmlFor="preferredTone">Communication tone</Label>
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

          {/* Technical Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Technical Settings</h3>
            <p className="text-sm text-muted-foreground">
              Advanced configuration for the AI agent.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxSteps">Max steps per task</Label>
                <div className="relative">
                  <Input
                    id="maxSteps"
                    type="number"
                    value={formData.maxSteps}
                    onChange={(e) =>
                      handleInputChange(
                        'maxSteps',
                        parseInt(e.target.value) || 50,
                      )
                    }
                    className={cn(
                      'rounded-sm pr-8',
                      editingField !== 'maxSteps' && 'bg-muted',
                    )}
                    readOnly={editingField !== 'maxSteps'}
                    min="10"
                    max="200"
                    placeholder="50"
                  />
                  {editingField !== 'maxSteps' ? (
                    <button
                      onClick={() => handleFieldEdit('maxSteps')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFieldSave('maxSteps')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                      disabled={isLoading}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="browserProvider">Browser provider</Label>
                <div className="relative">
                  <select
                    id="browserProvider"
                    className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                    value={formData.browserProvider}
                    onChange={async (e) => {
                      const newValue = e.target
                        .value as typeof formData.browserProvider
                      handleInputChange('browserProvider', newValue)
                      await handleFieldSave('browserProvider')
                    }}
                    disabled={isLoading}
                  >
                    <option value="Local">Local (Playwright)</option>
                    <option value="Hyperbrowser">Hyperbrowser (Cloud)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.browserProvider === 'Local'
                    ? 'Uses local Playwright instance'
                    : 'Uses cloud browsers with proxy support'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
