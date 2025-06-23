'use client'

import React, { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { PencilIcon, CheckIcon } from 'lucide-react'
import { cn } from '@/lib/actions/utils'

export default function AgentSettings() {
    const [isLoading, setIsLoading] = useState(false)
    const [editingField, setEditingField] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        agentName: 'Suparaise Agent',
        submissionDelay: '30', // seconds between submissions
        retryAttempts: '3',
        autoSubmit: false,
        requireReview: true,
        skipComplexForms: false,
        parallelSubmissions: '5',
        customInstructions: '',
        preferredTone: 'professional',
        targetFunds: [] as string[],
    })

    const handleInputChange = (field: string, value: string | boolean | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleFieldEdit = (field: string) => {
        setEditingField(field)
        setTimeout(() => {
            document.getElementById(field)?.focus()
        }, 0)
    }

    const handleFieldSave = async (field: string) => {
        setIsLoading(true)
        try {
            // TODO: Implement save functionality with Supabase
            console.log(`Saving ${field}:`, formData[field as keyof typeof formData])
            setEditingField(null)
            // Show success toast
        } catch (error) {
            console.error(`Error saving ${field}:`, error)
            // Show error toast
        } finally {
            setIsLoading(false)
        }
    }

    const fundTypes = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth', 'Corporate VC']

    const toggleFundType = (fundType: string) => {
        setFormData(prev => ({
            ...prev,
            targetFunds: prev.targetFunds.includes(fundType)
                ? prev.targetFunds.filter(f => f !== fundType)
                : [...prev.targetFunds, fundType]
        }))
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-shrink-0 pb-4">
                <h2 className="text-2xl font-semibold">Agents</h2>
                <p className="text-muted-foreground">
                    Configure how AI behaves when submitting applications.
                </p>
            </div>

            <Separator className="flex-shrink-0" />

            <div className="flex-1 overflow-auto pt-6 max-h-[62vh] hide-scrollbar">
                <div className="space-y-6 pr-2">
                    {/* Basic Agent Settings */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="agentName">Name</Label>
                            <div className="relative">
                                <Input
                                    id="agentName"
                                    value={formData.agentName}
                                    onChange={(e) => handleInputChange('agentName', e.target.value)}
                                    className={cn("rounded-sm pr-8", editingField !== 'agentName' && "bg-muted")}
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
                                <Label htmlFor="submissionDelay">Delay between submissions (seconds)</Label>
                                <div className="relative">
                                    <Input
                                        id="submissionDelay"
                                        type="number"
                                        value={formData.submissionDelay}
                                        onChange={(e) => handleInputChange('submissionDelay', e.target.value)}
                                        className={cn("rounded-sm pr-8", editingField !== 'submissionDelay' && "bg-muted")}
                                        readOnly={editingField !== 'submissionDelay'}
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
                                        onChange={(e) => handleInputChange('retryAttempts', e.target.value)}
                                        className={cn("rounded-sm pr-8", editingField !== 'retryAttempts' && "bg-muted")}
                                        readOnly={editingField !== 'retryAttempts'}
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

                        <div className="space-y-2">
                            <Label htmlFor="parallelSubmissions">Max parallel submissions</Label>
                            <div className="relative">
                                <Input
                                    id="parallelSubmissions"
                                    type="number"
                                    value={formData.parallelSubmissions}
                                    onChange={(e) => handleInputChange('parallelSubmissions', e.target.value)}
                                    className={cn("rounded-sm pr-8", editingField !== 'parallelSubmissions' && "bg-muted")}
                                    readOnly={editingField !== 'parallelSubmissions'}
                                    placeholder="5"
                                />
                                {editingField !== 'parallelSubmissions' ? (
                                    <button
                                        onClick={() => handleFieldEdit('parallelSubmissions')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                    >
                                        <PencilIcon className="h-3 w-3" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleFieldSave('parallelSubmissions')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                                        disabled={isLoading}
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                    </button>
                                )}
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
                                    onCheckedChange={(checked) => handleInputChange('autoSubmit', checked)}
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
                                    onCheckedChange={(checked) => handleInputChange('requireReview', checked)}
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
                                    onCheckedChange={(checked) => handleInputChange('skipComplexForms', checked)}
                                />
                                <div className="grid gap-1.5 leading-none flex-1">
                                    <Label htmlFor="skipComplexForms" className="font-medium">
                                        Skip complex forms
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Skip forms with more than 20 questions or video requirements
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Target Fund Types */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Target Fund Types</h3>
                        <p className="text-sm text-muted-foreground">
                            Select which types of funds the agent should target.
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {fundTypes.map((fundType) => (
                                <Badge
                                    key={fundType}
                                    variant={formData.targetFunds.includes(fundType) ? "default" : "outline"}
                                    className="cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => toggleFundType(fundType)}
                                >
                                    {fundType}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Communication Style */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Communication Style</h3>
                        <p className="text-sm text-muted-foreground">
                            Customize how the agent communicates in applications.
                        </p>

                        <div className="space-y-2">
                            <Label htmlFor="preferredTone">Preferred tone</Label>
                            <div className="relative">
                                <Input
                                    id="preferredTone"
                                    value={formData.preferredTone}
                                    onChange={(e) => handleInputChange('preferredTone', e.target.value)}
                                    className={cn("rounded-sm pr-8", editingField !== 'preferredTone' && "bg-muted")}
                                    readOnly={editingField !== 'preferredTone'}
                                    placeholder="professional, casual, enthusiastic..."
                                />
                                {editingField !== 'preferredTone' ? (
                                    <button
                                        onClick={() => handleFieldEdit('preferredTone')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                    >
                                        <PencilIcon className="h-3 w-3" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleFieldSave('preferredTone')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                                        disabled={isLoading}
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customInstructions">Custom instructions</Label>
                            <div className="relative">
                                <Textarea
                                    id="customInstructions"
                                    value={formData.customInstructions}
                                    onChange={(e) => handleInputChange('customInstructions', e.target.value)}
                                    className={cn("rounded-sm pr-8 min-h-[100px]", editingField !== 'customInstructions' && "bg-muted")}
                                    readOnly={editingField !== 'customInstructions'}
                                    placeholder="Any specific instructions for how the agent should fill out forms or communicate..."
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