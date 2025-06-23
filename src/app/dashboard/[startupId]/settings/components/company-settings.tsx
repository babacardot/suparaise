'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { PencilIcon, CheckIcon } from 'lucide-react'
import { cn } from '@/lib/actions/utils'

export default function CompanySettings() {
    const [isLoading, setIsLoading] = useState(false)
    const [editingField, setEditingField] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        companyName: '',
        website: '',
        description: '',
        industry: '',
        stage: 'Pre-Seed',
        foundedYear: new Date().getFullYear().toString(),
        employees: '1-10',
        location: '',
        fundingGoal: '',
        previousFunding: '',
        revenue: '',
        keywords: [] as string[],
    })

    const handleInputChange = (field: string, value: string) => {
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


    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-shrink-0 pb-4">
                <h2 className="text-2xl font-semibold">Company</h2>
                <p className="text-muted-foreground">
                    What are you building?
                </p>
            </div>

            <Separator className="flex-shrink-0" />

            <div className="flex-1 overflow-auto pt-6 max-h-[62vh] hide-scrollbar">
                <div className="space-y-6 pr-2">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company name</Label>
                                <div className="relative">
                                    <Input
                                        id="companyName"
                                        value={formData.companyName}
                                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                                        className={cn("rounded-sm pr-8", editingField !== 'companyName' && "bg-muted")}
                                        readOnly={editingField !== 'companyName'}
                                        placeholder="Enter your company name"
                                    />
                                    {editingField !== 'companyName' ? (
                                        <button
                                            onClick={() => handleFieldEdit('companyName')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                        >
                                            <PencilIcon className="h-3 w-3" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleFieldSave('companyName')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                                            disabled={isLoading}
                                        >
                                            <CheckIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <div className="relative">
                                    <Input
                                        id="website"
                                        value={formData.website}
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                        className={cn("rounded-sm pr-8", editingField !== 'website' && "bg-muted")}
                                        readOnly={editingField !== 'website'}
                                        placeholder="https://yourcompany.com"
                                    />
                                    {editingField !== 'website' ? (
                                        <button
                                            onClick={() => handleFieldEdit('website')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                        >
                                            <PencilIcon className="h-3 w-3" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleFieldSave('website')}
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
                            <Label htmlFor="description">Description</Label>
                            <div className="relative">
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className={cn("rounded-sm pr-8 min-h-[100px]", editingField !== 'description' && "bg-muted")}
                                    readOnly={editingField !== 'description'}
                                    placeholder="Describe what your company does, the problem you solve, and your solution..."
                                    rows={4}
                                />
                                {editingField !== 'description' ? (
                                    <button
                                        onClick={() => handleFieldEdit('description')}
                                        className="absolute right-2 top-2 text-blue-500 hover:text-blue-600"
                                    >
                                        <PencilIcon className="h-3 w-3" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleFieldSave('description')}
                                        className="absolute right-2 top-2 text-green-500 hover:text-green-600"
                                        disabled={isLoading}
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="industry">Industry</Label>
                                <div className="relative">
                                    <Input
                                        id="industry"
                                        value={formData.industry}
                                        onChange={(e) => handleInputChange('industry', e.target.value)}
                                        className={cn("rounded-sm pr-8", editingField !== 'industry' && "bg-muted")}
                                        readOnly={editingField !== 'industry'}
                                        placeholder="e.g., FinTech, SaaS, Healthcare"
                                    />
                                    {editingField !== 'industry' ? (
                                        <button
                                            onClick={() => handleFieldEdit('industry')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                        >
                                            <PencilIcon className="h-3 w-3" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleFieldSave('industry')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                                            disabled={isLoading}
                                        >
                                            <CheckIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <div className="relative">
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        className={cn("rounded-sm pr-8", editingField !== 'location' && "bg-muted")}
                                        readOnly={editingField !== 'location'}
                                        placeholder="e.g., San Francisco, CA"
                                    />
                                    {editingField !== 'location' ? (
                                        <button
                                            onClick={() => handleFieldEdit('location')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                        >
                                            <PencilIcon className="h-3 w-3" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleFieldSave('location')}
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

                    {/* Company Metrics */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Metrics</h3>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="stage">Funding stage</Label>
                                <div className="relative">
                                    <Input
                                        id="stage"
                                        value={formData.stage}
                                        onChange={(e) => handleInputChange('stage', e.target.value)}
                                        className={cn("rounded-sm pr-8", editingField !== 'stage' && "bg-muted")}
                                        readOnly={editingField !== 'stage'}
                                        placeholder="Pre-Seed, Seed, Series A..."
                                    />
                                    {editingField !== 'stage' ? (
                                        <button
                                            onClick={() => handleFieldEdit('stage')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                        >
                                            <PencilIcon className="h-3 w-3" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleFieldSave('stage')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                                            disabled={isLoading}
                                        >
                                            <CheckIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="foundedYear">Founded year</Label>
                                <div className="relative">
                                    <Input
                                        id="foundedYear"
                                        value={formData.foundedYear}
                                        onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                                        className={cn("rounded-sm pr-8", editingField !== 'foundedYear' && "bg-muted")}
                                        readOnly={editingField !== 'foundedYear'}
                                        placeholder="2024"
                                    />
                                    {editingField !== 'foundedYear' ? (
                                        <button
                                            onClick={() => handleFieldEdit('foundedYear')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                        >
                                            <PencilIcon className="h-3 w-3" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleFieldSave('foundedYear')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                                            disabled={isLoading}
                                        >
                                            <CheckIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="employees">Team size</Label>
                                <div className="relative">
                                    <Input
                                        id="employees"
                                        value={formData.employees}
                                        onChange={(e) => handleInputChange('employees', e.target.value)}
                                        className={cn("rounded-sm pr-8", editingField !== 'employees' && "bg-muted")}
                                        readOnly={editingField !== 'employees'}
                                        placeholder="1-10, 11-50, 51-200..."
                                    />
                                    {editingField !== 'employees' ? (
                                        <button
                                            onClick={() => handleFieldEdit('employees')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                        >
                                            <PencilIcon className="h-3 w-3" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleFieldSave('employees')}
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
                                <Label htmlFor="fundingGoal">Funding goal</Label>
                                <div className="relative">
                                    <Input
                                        id="fundingGoal"
                                        value={formData.fundingGoal}
                                        onChange={(e) => handleInputChange('fundingGoal', e.target.value)}
                                        className={cn("rounded-sm pr-8", editingField !== 'fundingGoal' && "bg-muted")}
                                        readOnly={editingField !== 'fundingGoal'}
                                        placeholder="e.g., $500K, $2M"
                                    />
                                    {editingField !== 'fundingGoal' ? (
                                        <button
                                            onClick={() => handleFieldEdit('fundingGoal')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                        >
                                            <PencilIcon className="h-3 w-3" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleFieldSave('fundingGoal')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                                            disabled={isLoading}
                                        >
                                            <CheckIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="previousFunding">Previous funding</Label>
                                <div className="relative">
                                    <Input
                                        id="previousFunding"
                                        value={formData.previousFunding}
                                        onChange={(e) => handleInputChange('previousFunding', e.target.value)}
                                        className={cn("rounded-sm pr-8", editingField !== 'previousFunding' && "bg-muted")}
                                        readOnly={editingField !== 'previousFunding'}
                                        placeholder="e.g., $100K pre-seed"
                                    />
                                    {editingField !== 'previousFunding' ? (
                                        <button
                                            onClick={() => handleFieldEdit('previousFunding')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                        >
                                            <PencilIcon className="h-3 w-3" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleFieldSave('previousFunding')}
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
                            <Label htmlFor="revenue">Revenue</Label>
                            <div className="relative">
                                <Input
                                    id="revenue"
                                    value={formData.revenue}
                                    onChange={(e) => handleInputChange('revenue', e.target.value)}
                                    className={cn("rounded-sm pr-8", editingField !== 'revenue' && "bg-muted")}
                                    readOnly={editingField !== 'revenue'}
                                    placeholder="e.g., $10K MRR, $500K ARR"
                                />
                                {editingField !== 'revenue' ? (
                                    <button
                                        onClick={() => handleFieldEdit('revenue')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                    >
                                        <PencilIcon className="h-3 w-3" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleFieldSave('revenue')}
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
            </div>
        </div>
    )
}