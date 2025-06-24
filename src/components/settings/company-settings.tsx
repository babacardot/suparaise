'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PencilIcon, CheckIcon, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/actions/utils'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import Spinner from '@/components/ui/spinner'

// Import industry constants from onboarding types
import {
  INDUSTRIES,
  LEGAL_STRUCTURES,
  FUNDING_ROUNDS,
  IndustryType,
  LegalStructure,
  InvestmentStage,
} from '@/components/onboarding/onboarding-types'

// Helper function to format field names for display
const formatFieldName = (fieldName: string): string => {
  const fieldLabels: Record<string, string> = {
    name: 'Company name',
    website: 'Website',
    industry: 'Industry',
    location: 'Location',
    descriptionShort: 'One-liner',
    descriptionMedium: 'Elevator pitch',
    descriptionLong: 'Full description',
    fundingRound: 'Funding stage',
    legalStructure: 'Legal structure',
    employeeCount: 'Team size',
    foundedYear: 'Founded year',
    revenueModel: 'Revenue model',
    currentRunway: 'Runway',
    keyCustomers: 'Key customers',
    competitors: 'Competitors',
    logoUrl: 'Logo',
  }
  return fieldLabels[fieldName] || fieldName
}

// Skeleton loading component that mimics the form layout
function CompanySettingsSkeleton() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold -mt-2 mb-2">Company</h2>
        <p className="text-muted-foreground">
          Tell us about your startup, what you&apos;re building and why it
          matters.
        </p>
      </div>

      <Separator className="flex-shrink-0" />

      <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
        <div className="space-y-6 pr-2">
          {/* Company Logo Skeleton */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-x-2">
              <Skeleton className="h-8 w-24 inline-block" />
              <Skeleton className="h-8 w-16 inline-block" />
            </div>
          </div>

          {/* Basic Information Skeleton */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-20 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>

          {/* Company Details Skeleton */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-8">
            <Separator className="my-8" />
            <div className="space-y-3 p-6 bg-muted/50 border border-border/50 rounded-sm">
              <Skeleton className="h-7 w-36" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
              </div>
              <Skeleton className="h-9 w-[160px] mt-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CompanySettings() {
  const { user, supabase, currentStartupId, startups } = useUser()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [logoUploading, setLogoUploading] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [startupDeleteConfirmation, setStartupDeleteConfirmation] = useState('')
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    industry: null as IndustryType | null,
    location: '',
    descriptionShort: '',
    descriptionMedium: '',
    descriptionLong: '',
    fundingRound: null as InvestmentStage | null,
    legalStructure: null as LegalStructure | null,
    employeeCount: 0,
    foundedYear: new Date().getFullYear(),
    revenueModel: '',
    currentRunway: 0,
    keyCustomers: '',
    competitors: '',
    logoUrl: null as string | null,
  })

  // Fetch startup data when component mounts or startup changes
  useEffect(() => {
    const fetchStartupData = async () => {
      if (!user || !currentStartupId) return

      setDataLoading(true)
      try {
        const { data, error } = await supabase.rpc('get_user_startup_data', {
          p_user_id: user.id,
          p_startup_id: currentStartupId,
        })

        if (error) throw error

        if (data && Object.keys(data).length > 0 && !data.error) {
          setFormData({
            name: data.name || '',
            website: data.website || '',
            industry: data.industry || null,
            location: data.location || '',
            descriptionShort: data.descriptionShort || '',
            descriptionMedium: data.descriptionMedium || '',
            descriptionLong: data.descriptionLong || '',
            fundingRound: data.fundingRound || null,
            legalStructure: data.legalStructure || null,
            employeeCount: data.employeeCount || 0,
            foundedYear: data.foundedYear || new Date().getFullYear(),
            revenueModel: data.revenueModel || '',
            currentRunway: data.currentRunway || 0,
            keyCustomers: data.keyCustomers || '',
            competitors: data.competitors || '',
            logoUrl: data.logoUrl || null,
          })
        }
      } catch (error) {
        console.error('Error fetching startup data:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load company data.',
        })
      } finally {
        setDataLoading(false)
      }
    }

    fetchStartupData()
  }, [user, currentStartupId, supabase, toast])

  if (!user) {
    return <div>Loading...</div>
  }

  if (dataLoading) {
    return <CompanySettingsSkeleton />
  }

  const handleInputChange = (
    field: string,
    value:
      | string
      | IndustryType
      | LegalStructure
      | InvestmentStage
      | number
      | null,
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

      const { data, error } = await supabase.rpc('update_user_startup_data', {
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
        title: 'Company updated',
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

  const handleLogoUpload = async (file: File) => {
    if (!currentStartupId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No startup selected.',
      })
      return
    }

    // File size validation (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Logo must be less than 5MB.',
      })
      return
    }

    // File type validation
    const allowedTypes = [
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/svg+xml',
      'image/webp',
    ]
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Logo must be PNG, JPG, JPEG, SVG, or WebP format.',
      })
      return
    }

    setLogoUploading(true)

    try {
      // Upload to Supabase Storage
      const fileName = `${user.id}/logo-${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('logos').getPublicUrl(fileName)

      // Update the startup record with new logo URL
      const { data, error } = await supabase.rpc('update_user_startup_data', {
        p_user_id: user.id,
        p_startup_id: currentStartupId,
        p_data: { logoUrl: publicUrl },
      })

      if (error) throw error

      if (data?.error) {
        throw new Error(data.error)
      }

      void data // Used for error checking above

      // Update local state
      setFormData((prev) => ({ ...prev, logoUrl: publicUrl }))

      toast({
        title: 'Logo updated',
        description: 'Your company logo has been updated successfully.',
      })
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Failed to upload logo. Please try again.',
      })
    } finally {
      setLogoUploading(false)
    }
  }

  const handleLogoRemove = async () => {
    if (!currentStartupId) return

    try {
      const { error } = await supabase.rpc('update_user_startup_data', {
        p_user_id: user.id,
        p_startup_id: currentStartupId,
        p_data: { logoUrl: null },
      })

      if (error) throw error

      setFormData((prev) => ({ ...prev, logoUrl: null }))

      toast({
        title: 'Logo removed',
        description: 'Your company logo has been removed.',
      })
    } catch (error) {
      console.error('Error removing logo:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove logo. Please try again.',
      })
    }
  }

  const handleStartupDelete = async () => {
    if (!currentStartupId || !user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase.rpc('soft_delete_startup', {
        p_user_id: user.id,
        p_startup_id: currentStartupId,
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      toast({
        title: 'Startup deleted',
        description: `The startup "${formData.name}" has been deleted.`,
      })

      // Reload the page to refresh the user's startups and context
      window.location.reload()
    } catch (error) {
      console.error('Error deleting startup:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete startup. Please try again.',
      })
    } finally {
      setIsLoading(false)
      setStartupDeleteConfirmation('')
    }
  }

  const companyInitial = formData.name?.charAt(0)?.toUpperCase() || 'C'

  const handleAccountDelete = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.rpc('soft_delete_user_account', {
        p_user_id: user.id,
      })

      if (error) throw error

      if (data?.error) {
        throw new Error(data.error)
      }

      toast({
        title: 'Account Deactivated',
        description:
          'Your account has been deactivated. All data has been preserved.',
      })

      // Sign out the user
      await supabase.auth.signOut({ scope: 'global' })
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to deactivate account. Please try again.',
      })
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold -mt-2 mb-2">Company</h2>
        <p className="text-muted-foreground">
          Tell us about your startup, what you&apos;re building and why it
          matters.
        </p>
      </div>

      <Separator className="flex-shrink-0" />

      <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
        <div className="space-y-6 pr-2">
          {/* Company Logo */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 rounded-sm">
              <AvatarImage
                src={
                  formData.logoUrl ||
                  `https://avatar.vercel.sh/${encodeURIComponent(
                    formData.name.toLowerCase() ||
                      currentStartupId ||
                      'suparaise',
                  )}.png?size=80`
                }
                alt="Company logo"
              />
              <AvatarFallback className="rounded-sm text-lg">
                {companyInitial}
              </AvatarFallback>
            </Avatar>
            <div className="space-x-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleLogoUpload(file)
                }}
                disabled={logoUploading}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoInputRef.current?.click()}
                disabled={logoUploading}
                className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm"
              >
                {logoUploading ? (
                  <>
                    <Spinner className="h-3 w-3 mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>{formData.logoUrl ? 'Update' : 'Update'}</>
                )}
              </Button>
              {formData.logoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogoRemove}
                  className="bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:text-pink-800 dark:hover:text-pink-200 border border-pink-200 dark:border-pink-800 rounded-sm"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Company name</Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={cn(
                      'rounded-sm pr-8',
                      editingField !== 'name' && 'bg-muted',
                    )}
                    readOnly={editingField !== 'name'}
                    placeholder="Enter your company name"
                  />
                  {editingField !== 'name' ? (
                    <button
                      onClick={() => handleFieldEdit('name')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFieldSave('name')}
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
                    onChange={(e) =>
                      handleInputChange('website', e.target.value)
                    }
                    className={cn(
                      'rounded-sm pr-8',
                      editingField !== 'website' && 'bg-muted',
                    )}
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="foundedYear">Founded year</Label>
                <div className="relative">
                  <Input
                    id="foundedYear"
                    type="number"
                    value={formData.foundedYear}
                    onChange={(e) =>
                      handleInputChange(
                        'foundedYear',
                        parseInt(e.target.value) || new Date().getFullYear(),
                      )
                    }
                    className={cn(
                      'rounded-sm pr-8',
                      editingField !== 'foundedYear' && 'bg-muted',
                    )}
                    readOnly={editingField !== 'foundedYear'}
                    min="1900"
                    max={new Date().getFullYear()}
                    placeholder="2023"
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
                <Label htmlFor="industry">Industry</Label>
                <div className="relative">
                  <select
                    id="industry"
                    className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                    value={formData.industry || ''}
                    onChange={async (e) => {
                      const newValue = e.target.value as IndustryType
                      handleInputChange('industry', newValue)
                      await handleFieldSave('industry')
                    }}
                    disabled={isLoading}
                  >
                    <option value="">Select an industry</option>
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange('location', e.target.value)
                    }
                    className={cn(
                      'rounded-sm pr-8',
                      editingField !== 'location' && 'bg-muted',
                    )}
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

              <div className="space-y-2">
                <Label htmlFor="employeeCount">Team size</Label>
                <div className="relative">
                  <select
                    id="employeeCount"
                    className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                    value={formData.employeeCount}
                    onChange={async (e) => {
                      const newValue = parseInt(e.target.value) || 1
                      handleInputChange('employeeCount', newValue)
                      await handleFieldSave('employeeCount')
                    }}
                    disabled={isLoading}
                  >
                    <option value={1}>Just me</option>
                    <option value={2}>2 people</option>
                    <option value={3}>3 people</option>
                    <option value={4}>4 people</option>
                    <option value={5}>5 people</option>
                    <option value={10}>6-10 people</option>
                    <option value={20}>11-20 people</option>
                    <option value={50}>21-50 people</option>
                    <option value={100}>51-100 people</option>
                    <option value={200}>100+ people</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionShort">One-liner</Label>
              <div className="relative">
                <Input
                  id="descriptionShort"
                  value={formData.descriptionShort}
                  onChange={(e) =>
                    handleInputChange('descriptionShort', e.target.value)
                  }
                  className={cn(
                    'rounded-sm pr-8',
                    editingField !== 'descriptionShort' && 'bg-muted',
                  )}
                  readOnly={editingField !== 'descriptionShort'}
                  placeholder="Brief description of what your company does"
                />
                {editingField !== 'descriptionShort' ? (
                  <button
                    onClick={() => handleFieldEdit('descriptionShort')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleFieldSave('descriptionShort')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                    disabled={isLoading}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionMedium">Elevator pitch</Label>
              <div className="relative">
                <Textarea
                  id="descriptionMedium"
                  value={formData.descriptionMedium}
                  onChange={(e) =>
                    handleInputChange('descriptionMedium', e.target.value)
                  }
                  className={cn(
                    'rounded-sm pr-8 min-h-[80px]',
                    editingField !== 'descriptionMedium' && 'bg-muted',
                  )}
                  readOnly={editingField !== 'descriptionMedium'}
                  placeholder="Describe what your company does, the problem you solve, and your solution..."
                  rows={3}
                />
                {editingField !== 'descriptionMedium' ? (
                  <button
                    onClick={() => handleFieldEdit('descriptionMedium')}
                    className="absolute right-2 top-2 text-blue-500 hover:text-blue-600"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleFieldSave('descriptionMedium')}
                    className="absolute right-2 top-2 text-green-500 hover:text-green-600"
                    disabled={isLoading}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionLong">Full description</Label>
              <div className="relative">
                <Textarea
                  id="descriptionLong"
                  value={formData.descriptionLong}
                  onChange={(e) =>
                    handleInputChange('descriptionLong', e.target.value)
                  }
                  className={cn(
                    'rounded-sm pr-8 min-h-[120px]',
                    editingField !== 'descriptionLong' && 'bg-muted',
                  )}
                  readOnly={editingField !== 'descriptionLong'}
                  placeholder="Detailed description of your company, market opportunity, solution, and business model..."
                  rows={5}
                />
                {editingField !== 'descriptionLong' ? (
                  <button
                    onClick={() => handleFieldEdit('descriptionLong')}
                    className="absolute right-2 top-2 text-blue-500 hover:text-blue-600"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleFieldSave('descriptionLong')}
                    className="absolute right-2 top-2 text-green-500 hover:text-green-600"
                    disabled={isLoading}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenueModel">Revenue model</Label>
              <div className="relative">
                <Input
                  id="revenueModel"
                  value={formData.revenueModel}
                  onChange={(e) =>
                    handleInputChange('revenueModel', e.target.value)
                  }
                  className={cn(
                    'rounded-sm pr-8',
                    editingField !== 'revenueModel' && 'bg-muted',
                  )}
                  readOnly={editingField !== 'revenueModel'}
                  placeholder="Subscription, Commission, Freemium..."
                />
                {editingField !== 'revenueModel' ? (
                  <button
                    onClick={() => handleFieldEdit('revenueModel')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleFieldSave('revenueModel')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                    disabled={isLoading}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fundingRound">Funding stage</Label>
                <div className="relative">
                  <select
                    id="fundingRound"
                    className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                    value={formData.fundingRound || ''}
                    onChange={async (e) => {
                      const newValue = e.target.value as InvestmentStage
                      handleInputChange('fundingRound', newValue)
                      await handleFieldSave('fundingRound')
                    }}
                    disabled={isLoading}
                  >
                    <option value="">Select funding stage</option>
                    {FUNDING_ROUNDS.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="legalStructure">Legal structure</Label>
                <div className="relative">
                  <select
                    id="legalStructure"
                    className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                    value={formData.legalStructure || ''}
                    onChange={async (e) => {
                      const newValue = e.target.value as LegalStructure
                      handleInputChange('legalStructure', newValue)
                      await handleFieldSave('legalStructure')
                    }}
                    disabled={isLoading}
                  >
                    <option value="">Select legal structure</option>
                    {LEGAL_STRUCTURES.map((structure) => (
                      <option key={structure} value={structure}>
                        {structure}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeCount">Team size</Label>
              <div className="relative">
                <select
                  id="employeeCount"
                  className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                  value={formData.employeeCount}
                  onChange={async (e) => {
                    const newValue = parseInt(e.target.value) || 1
                    handleInputChange('employeeCount', newValue)
                    await handleFieldSave('employeeCount')
                  }}
                  disabled={isLoading}
                >
                  <option value={1}>Just me</option>
                  <option value={2}>2 people</option>
                  <option value={3}>3 people</option>
                  <option value={4}>4 people</option>
                  <option value={5}>5 people</option>
                  <option value={10}>6-10 people</option>
                  <option value={20}>11-20 people</option>
                  <option value={50}>21-50 people</option>
                  <option value={100}>51-100 people</option>
                  <option value={200}>100+ people</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentRunway">Runway</Label>
              <div className="relative">
                <select
                  id="currentRunway"
                  className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                  value={formData.currentRunway}
                  onChange={async (e) => {
                    const newValue = parseInt(e.target.value) || 0
                    handleInputChange('currentRunway', newValue)
                    await handleFieldSave('currentRunway')
                  }}
                  disabled={isLoading}
                >
                  <option value={0}>No runway</option>
                  <option value={3}>3 months</option>
                  <option value={6}>6 months</option>
                  <option value={9}>9 months</option>
                  <option value={12}>12 months</option>
                  <option value={15}>15 months</option>
                  <option value={18}>18 months</option>
                  <option value={24}>24 months</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyCustomers">Key customers</Label>
              <div className="relative">
                <Textarea
                  id="keyCustomers"
                  value={formData.keyCustomers}
                  onChange={(e) =>
                    handleInputChange('keyCustomers', e.target.value)
                  }
                  className={cn(
                    'rounded-sm pr-8 min-h-[80px]',
                    editingField !== 'keyCustomers' && 'bg-muted',
                  )}
                  readOnly={editingField !== 'keyCustomers'}
                  placeholder="Notable customers, enterprise clients, early adopters..."
                  rows={3}
                />
                {editingField !== 'keyCustomers' ? (
                  <button
                    onClick={() => handleFieldEdit('keyCustomers')}
                    className="absolute right-2 top-2 text-blue-500 hover:text-blue-600"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleFieldSave('keyCustomers')}
                    className="absolute right-2 top-2 text-green-500 hover:text-green-600"
                    disabled={isLoading}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitors">Competitors</Label>
              <div className="relative">
                <Textarea
                  id="competitors"
                  value={formData.competitors}
                  onChange={(e) =>
                    handleInputChange('competitors', e.target.value)
                  }
                  className={cn(
                    'rounded-sm pr-8 min-h-[80px]',
                    editingField !== 'competitors' && 'bg-muted',
                  )}
                  readOnly={editingField !== 'competitors'}
                  placeholder="Direct and indirect competitors, and how you differentiate..."
                  rows={3}
                />
                {editingField !== 'competitors' ? (
                  <button
                    onClick={() => handleFieldEdit('competitors')}
                    className="absolute right-2 top-2 text-blue-500 hover:text-blue-600"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleFieldSave('competitors')}
                    className="absolute right-2 top-2 text-green-500 hover:text-green-600"
                    disabled={isLoading}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-8">
            <Separator className="my-8" />
            <div className="space-y-6">
              <div className="space-y-3 p-6 bg-pink-50/50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-800/50 rounded-sm">
                <h2 className="text-xl font-semibold text-pink-600 dark:text-pink-400">
                  Delete company
                </h2>
                <p className="text-sm text-pink-600/80 dark:text-pink-400/80">
                  Permanently delete{' '}
                  <span className="font-semibold">{formData.name} </span>
                  and all its associated data. This action cannot be undone.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="bg-pink-600 hover:bg-pink-700 dark:bg-pink-900 dark:hover:bg-pink-800 text-white rounded-sm"
                      disabled={startups.length <= 1}
                    >
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure ?</DialogTitle>
                      <DialogDescription>
                        This action will permanently delete this company and all
                        its data from our servers. This cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 pt-0">
                      <Label
                        htmlFor="startup-confirm"
                        className="text-sm font-medium"
                      >
                        Please type{' '}
                        <span className="font-semibold text-red-500 pt-1">
                          {formData.name || 'CONFIRM'}
                        </span>{' '}
                        to confirm
                      </Label>
                      <Input
                        id="startup-confirm"
                        className="rounded-sm"
                        placeholder={formData.name || 'CONFIRM'}
                        value={startupDeleteConfirmation}
                        onChange={(e) =>
                          setStartupDeleteConfirmation(e.target.value)
                        }
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        disabled={
                          isLoading ||
                          startupDeleteConfirmation !==
                            (formData.name || 'CONFIRM')
                        }
                        className="bg-destructive hover:bg-destructive/90 disabled:opacity-50"
                        onClick={handleStartupDelete}
                      >
                        {isLoading && <Spinner className="h-3 w-3 mr-2" />}
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3 p-6 bg-red-50/50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 rounded-sm">
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
                  Delete account
                </h2>
                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                  Permanently delete your account and all associated data. This
                  action cannot be undone. Any active subscriptions will be
                  cancelled.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800 text-white rounded-sm"
                    >
                      Delete account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure ?</DialogTitle>
                      <DialogDescription>
                        This action will permanently delete your account. All
                        your startup data will be preserved for a short period
                        before being deleted.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 pt-0">
                      <Label htmlFor="confirm" className="text-sm font-medium">
                        Please type{' '}
                        <span className="font-semibold pt-1 text-red-500">
                          DELETE
                        </span>{' '}
                        to confirm
                      </Label>
                      <Input
                        id="confirm"
                        className="rounded-sm"
                        placeholder="DELETE"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        disabled={deleteConfirmation !== 'DELETE'}
                        className="bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
                        onClick={handleAccountDelete}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
