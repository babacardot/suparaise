'use client'

import { useState, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Plus, X, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Database } from '@/lib/types/database'

type FounderRole = Database['public']['Enums']['founder_role']
type IndustryType = Database['public']['Enums']['industry_type']

interface FounderData {
    fullName: string
    role: FounderRole
    bio: string
    email: string
    linkedin: string
    githubUrl: string
    personalWebsiteUrl: string
}

interface StartupData {
    name: string
    website: string
    industry: IndustryType | null
    location: string
    descriptionShort: string
    descriptionMedium: string
    descriptionLong: string
    tractionSummary: string
    marketSummary: string
    mrr: number
    arr: number
    employeeCount: number
    logoFile: File | null
    pitchDeckFile: File | null
}

interface OnboardingDialogProps {
    isOpen: boolean
    userId: string
    onComplete: () => void
}

const FOUNDER_ROLES: FounderRole[] = [
    'Founder',
    'Co-founder',
    'CEO',
    'CTO',
    'COO',
    'CPO',
    'CMO',
    'Lead Engineer',
    'Product Manager',
    'Designer',
    'Sales Lead',
    'Marketing Lead',
    'Advisor',
    'Legal Counsel',
    'Other'
]

const INDUSTRIES: IndustryType[] = [
    'B2B SaaS',
    'Fintech',
    'Healthtech',
    'AI/ML',
    'Deep tech',
    'Climate tech',
    'Consumer',
    'E-commerce',
    'Marketplace',
    'Edtech',
    'Gaming',
    'Web3',
    'Developer tools',
    'Cybersecurity',
    'Logistics',
    'Agritech',
    'Other'
]

export function OnboardingDialog({ isOpen, userId, onComplete }: OnboardingDialogProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [founders, setFounders] = useState<FounderData[]>([{
        fullName: '',
        role: 'Founder',
        bio: '',
        email: '',
        linkedin: '',
        githubUrl: '',
        personalWebsiteUrl: ''
    }])

    const [startup, setStartup] = useState<StartupData>({
        name: '',
        website: '',
        industry: null,
        location: '',
        descriptionShort: '',
        descriptionMedium: '',
        descriptionLong: '',
        tractionSummary: '',
        marketSummary: '',
        mrr: 0,
        arr: 0,
        employeeCount: 1,
        logoFile: null,
        pitchDeckFile: null
    })

    const logoInputRef = useRef<HTMLInputElement>(null)
    const pitchDeckInputRef = useRef<HTMLInputElement>(null)
    const supabase = createSupabaseBrowserClient()

    const addFounder = () => {
        setFounders([...founders, {
            fullName: '',
            role: 'Co-founder',
            bio: '',
            email: '',
            linkedin: '',
            githubUrl: '',
            personalWebsiteUrl: ''
        }])
    }

    const removeFounder = (index: number) => {
        if (founders.length > 1) {
            setFounders(founders.filter((_, i) => i !== index))
        }
    }

    const updateFounder = (index: number, field: keyof FounderData, value: string) => {
        const updatedFounders = [...founders]
        updatedFounders[index] = { ...updatedFounders[index], [field]: value }
        setFounders(updatedFounders)
    }

    const handleFileUpload = (type: 'logo' | 'pitchDeck', file: File) => {
        if (type === 'logo') {
            setStartup({ ...startup, logoFile: file })
        } else {
            setStartup({ ...startup, pitchDeckFile: file })
        }
    }

    const uploadFile = async (file: File, bucket: string, path: string) => {
        const { error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(path)

        return publicUrl
    }

    const submitData = async () => {
        setLoading(true)
        try {
            // Upload files if they exist
            let logoUrl = ''
            let pitchDeckUrl = ''

            if (startup.logoFile) {
                logoUrl = await uploadFile(
                    startup.logoFile,
                    'startup-assets',
                    `${userId}/logo-${Date.now()}`
                )
            }

            if (startup.pitchDeckFile) {
                pitchDeckUrl = await uploadFile(
                    startup.pitchDeckFile,
                    'startup-assets',
                    `${userId}/pitch-deck-${Date.now()}`
                )
            }

            // Create startup
            const startupData = {
                user_id: userId,
                name: startup.name,
                website: startup.website,
                industry: startup.industry,
                location: startup.location,
                description_short: startup.descriptionShort,
                description_medium: startup.descriptionMedium,
                description_long: startup.descriptionLong,
                traction_summary: startup.tractionSummary,
                market_summary: startup.marketSummary,
                mrr: startup.mrr,
                arr: startup.arr,
                employee_count: startup.employeeCount,
                logo_url: logoUrl,
                pitch_deck_url: pitchDeckUrl
            }

            const { data: startupResponse, error: startupError } = await supabase
                .rpc('create_startup', { p_startup_data: startupData })

            if (startupError) throw startupError

            const createdStartup = startupResponse as { id: string }

            // Create founders
            for (const founder of founders) {
                if (founder.fullName.trim()) {
                    const { error: founderError } = await supabase
                        .from('founders')
                        .insert({
                            startup_id: createdStartup.id,
                            full_name: founder.fullName,
                            role: founder.role,
                            bio: founder.bio || null,
                            email: founder.email || null,
                            linkedin: founder.linkedin || null,
                            github_url: founder.githubUrl || null,
                            personal_website_url: founder.personalWebsiteUrl || null
                        })

                    if (founderError) throw founderError
                }
            }

            onComplete()
        } catch (error) {
            console.error('Error submitting onboarding data:', error)
            alert('There was an error saving your information. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const canProceedFromStep = (step: number) => {
        switch (step) {
            case 1:
                return founders[0].fullName.trim() && founders[0].role
            case 2:
                return startup.name.trim() && startup.descriptionShort.trim()
            case 3:
                return true // All fields in step 3 are optional
            default:
                return true
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-2xl">Welcome to Suparaise!</DialogTitle>
                    <DialogDescription>
                        Let&apos;s set up your startup profile to get started with fundraising automation.
                    </DialogDescription>
                </DialogHeader>

                {/* Progress indicator */}
                <div className="flex items-center justify-between mb-6">
                    {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center">
                            <div className={`rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium ${step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-600'
                                }`}>
                                {step < currentStep ? <Check className="h-4 w-4" /> : step}
                            </div>
                            {step < 4 && (
                                <div className={`h-1 w-16 mx-2 ${step < currentStep ? 'bg-primary' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1: Team Information */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Tell us about your team</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Start by adding information about yourself and your co-founders.
                            </p>
                        </div>

                        {founders.map((founder, index) => (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">
                                        {index === 0 ? 'You (Primary Founder)' : `Co-founder ${index}`}
                                    </CardTitle>
                                    {index > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFounder(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor={`founder-${index}-name`}>Full Name *</Label>
                                            <Input
                                                id={`founder-${index}-name`}
                                                value={founder.fullName}
                                                onChange={(e) => updateFounder(index, 'fullName', e.target.value)}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`founder-${index}-role`}>Role *</Label>
                                            <select
                                                id={`founder-${index}-role`}
                                                className="w-full p-2 border border-input rounded-md"
                                                value={founder.role}
                                                onChange={(e) => updateFounder(index, 'role', e.target.value)}
                                            >
                                                {FOUNDER_ROLES.map((role) => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor={`founder-${index}-email`}>Email</Label>
                                            <Input
                                                id={`founder-${index}-email`}
                                                type="email"
                                                value={founder.email}
                                                onChange={(e) => updateFounder(index, 'email', e.target.value)}
                                                placeholder="john@company.com"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`founder-${index}-linkedin`}>LinkedIn</Label>
                                            <Input
                                                id={`founder-${index}-linkedin`}
                                                value={founder.linkedin}
                                                onChange={(e) => updateFounder(index, 'linkedin', e.target.value)}
                                                placeholder="https://linkedin.com/in/johndoe"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor={`founder-${index}-bio`}>Bio</Label>
                                        <Textarea
                                            id={`founder-${index}-bio`}
                                            value={founder.bio}
                                            onChange={(e) => updateFounder(index, 'bio', e.target.value)}
                                            placeholder="Brief background and experience..."
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <Button
                            variant="outline"
                            onClick={addFounder}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Co-founder
                        </Button>
                    </div>
                )}

                {/* Step 2: Basic Company Info */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Company basics</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Tell us about your startup and what you&apos;re building.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="company-name">Company Name *</Label>
                                    <Input
                                        id="company-name"
                                        value={startup.name}
                                        onChange={(e) => setStartup({ ...startup, name: e.target.value })}
                                        placeholder="Acme Inc."
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="company-website">Website</Label>
                                    <Input
                                        id="company-website"
                                        value={startup.website}
                                        onChange={(e) => setStartup({ ...startup, website: e.target.value })}
                                        placeholder="https://acme.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="industry">Industry</Label>
                                    <select
                                        id="industry"
                                        className="w-full p-2 border border-input rounded-md"
                                        value={startup.industry || ''}
                                        onChange={(e) => setStartup({ ...startup, industry: e.target.value as IndustryType })}
                                    >
                                        <option value="">Select an industry</option>
                                        {INDUSTRIES.map((industry) => (
                                            <option key={industry} value={industry}>{industry}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={startup.location}
                                        onChange={(e) => setStartup({ ...startup, location: e.target.value })}
                                        placeholder="San Francisco, CA"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="one-liner">One-liner (Elevator Pitch) *</Label>
                                <Input
                                    id="one-liner"
                                    value={startup.descriptionShort}
                                    onChange={(e) => setStartup({ ...startup, descriptionShort: e.target.value })}
                                    placeholder="We help companies automate their fundraising process using AI"
                                    maxLength={150}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {startup.descriptionShort.length}/150 characters
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="description">Company Description</Label>
                                <Textarea
                                    id="description"
                                    value={startup.descriptionLong}
                                    onChange={(e) => setStartup({ ...startup, descriptionLong: e.target.value })}
                                    placeholder="Provide a detailed description of your company, what problem you solve, and how you solve it..."
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label>Company Logo</Label>
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                                        onClick={() => logoInputRef.current?.click()}
                                    >
                                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                        <p className="text-sm text-gray-600">
                                            {startup.logoFile ? startup.logoFile.name : 'Click to upload your logo'}
                                        </p>
                                        <input
                                            ref={logoInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleFileUpload('logo', file)
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Detailed Information */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Additional details</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                This information will help us better match you with relevant VCs.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="employee-count">Team Size</Label>
                                    <Input
                                        id="employee-count"
                                        type="number"
                                        min="1"
                                        value={startup.employeeCount}
                                        onChange={(e) => setStartup({ ...startup, employeeCount: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="mrr">Monthly Recurring Revenue ($)</Label>
                                    <Input
                                        id="mrr"
                                        type="number"
                                        min="0"
                                        value={startup.mrr}
                                        onChange={(e) => setStartup({ ...startup, mrr: parseFloat(e.target.value) || 0 })}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="arr">Annual Recurring Revenue ($)</Label>
                                    <Input
                                        id="arr"
                                        type="number"
                                        min="0"
                                        value={startup.arr}
                                        onChange={(e) => setStartup({ ...startup, arr: parseFloat(e.target.value) || 0 })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="traction">Traction Summary</Label>
                                <Textarea
                                    id="traction"
                                    value={startup.tractionSummary}
                                    onChange={(e) => setStartup({ ...startup, tractionSummary: e.target.value })}
                                    placeholder="Key metrics, growth numbers, user adoption, partnerships, etc."
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="market">Market Summary</Label>
                                <Textarea
                                    id="market"
                                    value={startup.marketSummary}
                                    onChange={(e) => setStartup({ ...startup, marketSummary: e.target.value })}
                                    placeholder="Market size, target customers, competitive landscape, etc."
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label>Pitch Deck</Label>
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                                    onClick={() => pitchDeckInputRef.current?.click()}
                                >
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-600">
                                        {startup.pitchDeckFile ? startup.pitchDeckFile.name : 'Click to upload your pitch deck (PDF)'}
                                    </p>
                                    <input
                                        ref={pitchDeckInputRef}
                                        type="file"
                                        accept=".pdf,.ppt,.pptx"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleFileUpload('pitchDeck', file)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Review & Submit */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Review your information</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Please review all the information before submitting.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Company Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><strong>Name:</strong> {startup.name}</div>
                                        <div><strong>Website:</strong> {startup.website || 'Not provided'}</div>
                                        <div><strong>Industry:</strong> {startup.industry || 'Not provided'}</div>
                                        <div><strong>Location:</strong> {startup.location || 'Not provided'}</div>
                                        <div className="col-span-2"><strong>One-liner:</strong> {startup.descriptionShort}</div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Team</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {founders.map((founder, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Badge variant="outline">{founder.role}</Badge>
                                                <span className="text-sm">{founder.fullName}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>

                    {currentStep < 4 ? (
                        <Button
                            onClick={nextStep}
                            disabled={!canProceedFromStep(currentStep)}
                        >
                            Next
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={submitData}
                            disabled={loading}
                        >
                            {loading ? 'Setting up...' : 'Complete Setup'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
} 