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
import {
  PencilIcon,
  CheckIcon,
  ChevronDown,
  Plus,
  X,
  Check,
  ChevronsUpDown,
} from 'lucide-react'
import { cn } from '@/lib/actions/utils'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import Spinner from '@/components/ui/spinner'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'

// Import industry constants from onboarding types
import {
  INDUSTRIES,
  LEGAL_STRUCTURES,
  FUNDING_ROUNDS,
  INVESTMENT_INSTRUMENTS,
  REVENUE_MODELS,
  IndustryType,
  LegalStructure,
  InvestmentStage,
  InvestmentInstrument,
  RevenueModelType,
} from '@/components/onboarding/onboarding-types'

// Get all countries from react-phone-number-input library
import * as RPNInput from 'react-phone-number-input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'

const COUNTRIES = RPNInput.getCountries()
  .map(
    (countryCode) =>
      new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) ||
      countryCode,
  )
  .sort()

// Sound utility functions
const playSound = (soundFile: string) => {
  try {
    const audio = new Audio(soundFile)
    audio.volume = 0.3
    audio.play().catch((error) => {
      console.log('Could not play sound:', error)
    })
  } catch (error) {
    console.log('Error loading sound:', error)
  }
}

const playClickSound = () => {
  playSound('/sounds/light.mp3')
}

const playCompletionSound = () => {
  playSound('/sounds/completion.mp3')
}

// Badge colors for operating countries
const getBadgeColor = (index: number) => {
  const colors = [
    'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/40',
    'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/40',
    'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/40',
    'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800 dark:hover:bg-orange-900/40',
    'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800 dark:hover:bg-pink-900/40',
    'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/40',
    'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800 dark:hover:bg-yellow-900/40',
    'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/40',
  ]
  return colors[index % colors.length]
}

const formatCurrency = (value: number) => {
  if (value === 0) return ''
  return new Intl.NumberFormat('en-US').format(value)
}

const handleNumericChange = (
  setter: (value: number) => void,
  value: string,
) => {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
  setter(numericValue)
}

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
    isIncorporated: 'Incorporation status',
    incorporationCountry: 'Incorporation country',
    incorporationCity: 'Incorporation city',
    operatingCountries: 'Operating countries',
    investmentInstrument: 'Investment type',
    fundingAmountSought: 'Funding amount',
    preMoneyValuation: 'Pre-money valuation',
    mrr: 'MRR',
    arr: 'ARR',
    tractionSummary: 'Traction',
    marketSummary: 'Market',
    pitchDeckUrl: 'Pitch deck',
    introVideoUrl: 'Demo',
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
            <Skeleton className="h-20 w-20 rounded-sm" />
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

const MultiSelectCountries: React.FC<{
  selected: string[]
  onChange: (selected: string[]) => void
}> = ({ selected, onChange }) => {
  const [open, setOpen] = useState(false)

  const handleSelect = (country: string) => {
    const newSelected = selected.includes(country)
      ? selected.filter((c) => c !== country)
      : [...selected, country]
    onChange(newSelected)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <span className="truncate">
            {selected.length > 0
              ? `${selected.length} countr${
                  selected.length > 1 ? 'ies' : 'y'
                } selected`
              : 'Select countries...'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        side="bottom"
        sideOffset={4}
        onWheel={(e) => {
          e.stopPropagation()
        }}
      >
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search country..." />
          <CommandList
            className="max-h-48 [&>div]:overflow-y-auto [&>div]:scroll-smooth"
            onWheel={(e) => {
              e.stopPropagation()
              const target = e.currentTarget.querySelector('[cmdk-list-sizer]')
              if (target) {
                target.scrollTop += e.deltaY
              }
            }}
          >
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((country) => (
                <CommandItem
                  key={country}
                  value={country}
                  onSelect={() => handleSelect(country)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selected.includes(country) ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {country}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Competitor Input Component
const CompetitorInput: React.FC<{
  competitors: string[]
  onChange: (competitors: string[]) => void
}> = ({ competitors, onChange }) => {
  const [inputValue, setInputValue] = useState('')

  const addCompetitor = () => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue && !competitors.includes(trimmedValue)) {
      onChange([...competitors, trimmedValue])
      setInputValue('')
    }
  }

  const removeCompetitor = (competitorToRemove: string) => {
    playClickSound()
    onChange(competitors.filter((c) => c !== competitorToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCompetitor()
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type competitor name and press Enter..."
        />
        <Button
          type="button"
          variant="outline"
          onClick={addCompetitor}
          disabled={!inputValue.trim()}
          className="shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {competitors.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {competitors.map((competitor, index) => (
            <Badge
              key={competitor}
              className={`rounded-sm px-2 py-0.5 border ${getBadgeColor(index)}`}
            >
              {competitor}
              <button
                onClick={() => removeCompetitor(competitor)}
                className="ml-1.5"
                aria-label={`Remove ${competitor}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CompanySettings() {
  const { user, supabase, currentStartupId, startups, refreshStartups } =
    useUser()
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
    revenueModel: null as RevenueModelType | null,
    currentRunway: 0,
    keyCustomers: '',
    competitors: '',
    competitorsList: [],
    logoUrl: null as string | null,
    isIncorporated: false,
    incorporationCountry: '',
    incorporationCity: '',
    operatingCountries: [] as string[],
    investmentInstrument: null as InvestmentInstrument | null,
    fundingAmountSought: 0,
    preMoneyValuation: 0,
    mrr: 0,
    arr: 0,
    tractionSummary: '',
    marketSummary: '',
    pitchDeckUrl: null as string | null,
    introVideoUrl: null as string | null,
  })

  // File upload states
  const [pitchDeckUploading, setPitchDeckUploading] = useState(false)
  const [videoUploading, setVideoUploading] = useState(false)
  const pitchDeckInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

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
            revenueModel: data.revenueModel || null,
            currentRunway: data.currentRunway || 0,
            keyCustomers: data.keyCustomers || '',
            competitors: data.competitors || '',
            competitorsList: data.competitors
              ? data.competitors.split(', ').filter(Boolean)
              : [],
            logoUrl: data.logoUrl || null,
            isIncorporated: data.isIncorporated || false,
            incorporationCountry: data.incorporationCountry || '',
            incorporationCity: data.incorporationCity || '',
            operatingCountries: Array.isArray(data.operatingCountries)
              ? data.operatingCountries
              : typeof data.operatingCountries === 'string'
                ? data.operatingCountries.split(',').filter(Boolean)
                : [],
            investmentInstrument: data.investmentInstrument || null,
            fundingAmountSought: data.fundingAmountSought || 0,
            preMoneyValuation: data.preMoneyValuation || 0,
            mrr: data.mrr || 0,
            arr: data.arr || 0,
            tractionSummary: data.tractionSummary || '',
            marketSummary: data.marketSummary || '',
            pitchDeckUrl: data.pitchDeckUrl || null,
            introVideoUrl: data.introVideoUrl || null,
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
  }, [user, currentStartupId, supabase, toast, startups])

  if (!user) {
    return <div></div>
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
      | InvestmentInstrument
      | RevenueModelType
      | number
      | boolean
      | string[]
      | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFieldEdit = (field: string) => {
    playClickSound()
    setEditingField(field)
    setTimeout(() => {
      document.getElementById(field)?.focus()
    }, 0)
  }

  const validateUrl = (url: string, field: string): boolean => {
    if (!url.trim()) return true // Empty URLs are allowed

    // Check if URL starts with https://
    if (!url.startsWith('https://')) {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: `${formatFieldName(field)} must start with https://`,
      })
      return false
    }

    // Basic URL validation
    try {
      new URL(url)
      return true
    } catch {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: `Please enter a valid ${formatFieldName(field)} URL`,
      })
      return false
    }
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

    // Validate URLs for website field
    if (field === 'website') {
      const fieldValue = formData[field as keyof typeof formData] as string
      if (!validateUrl(fieldValue, field)) {
        return // Don't save if validation fails
      }
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

      // If updating company name, refresh startups data so startup-switcher reflects the change
      if (field === 'name') {
        try {
          await refreshStartups()
        } catch (refreshError) {
          console.error('Error refreshing startups:', refreshError)
          // Don't show error to user since the main update succeeded
        }
      }

      setEditingField(null)
      playCompletionSound()
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

      // Refresh startups data so all components (incl. this one via useEffect) reflect the new logo
      try {
        await refreshStartups()
      } catch (refreshError) {
        console.error('Error refreshing startups:', refreshError)
        // Don't show error to user since the main update succeeded
      }

      playCompletionSound()
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

    setLogoUploading(true)
    try {
      const { data, error } = await supabase.rpc('update_user_startup_data', {
        p_user_id: user.id,
        p_startup_id: currentStartupId,
        p_data: { logoUrl: null },
      })

      if (error) throw error

      if (data?.error) {
        throw new Error(data.error)
      }

      // Clean up the logo file from storage
      try {
        const { data: files, error: listError } = await supabase.storage
          .from('logos')
          .list(user.id)

        if (!listError && files && files.length > 0) {
          const filePaths = files.map((file) => `${user.id}/${file.name}`)
          await supabase.storage.from('logos').remove(filePaths)
        }
      } catch (storageError) {
        console.error('Could not clean up logo files:', storageError)
        // Don't show error to user since the main update succeeded
      }

      // Refresh startups data so all components (incl. this one via useEffect) reflect the logo removal
      try {
        await refreshStartups()
      } catch (refreshError) {
        console.error('Error refreshing startups:', refreshError)
        // Don't show error to user since the main update succeeded
      }

      playCompletionSound()
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
    } finally {
      setLogoUploading(false)
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

      playCompletionSound()
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

  // Helper function to get logo URL, similar to getAvatarUrl in nav-user.tsx
  const getLogoUrl = () => {
    // Use logoUrl if available
    if (formData.logoUrl) {
      return formData.logoUrl
    }

    // Default fallback
    return `https://avatar.vercel.sh/${encodeURIComponent(
      formData.name?.toLowerCase() || currentStartupId || 'suparaise',
    )}.png?size=80`
  }

  const logoUrl = getLogoUrl()
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

      playCompletionSound()
      toast({
        title: 'Account deleted',
        description: 'Your account has been deleted successfully.',
      })

      // Sign out the user
      await supabase.auth.signOut({ scope: 'global' })
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
      })
    }
  }

  const handlePitchDeckUpload = async (file: File) => {
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
        description: 'Pitch deck must be less than 5MB.',
      })
      return
    }

    // File type validation
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Pitch deck must be PDF, PPT, or PPTX format.',
      })
      return
    }

    setPitchDeckUploading(true)

    try {
      const fileName = `${user.id}/pitch-deck-${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('decks')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('decks').getPublicUrl(fileName)

      const { data, error } = await supabase.rpc('update_user_startup_data', {
        p_user_id: user.id,
        p_startup_id: currentStartupId,
        p_data: { pitchDeckUrl: publicUrl },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      setFormData((prev) => ({ ...prev, pitchDeckUrl: publicUrl }))

      playCompletionSound()
      toast({
        title: 'Pitch deck uploaded',
        description: 'Your pitch deck has been uploaded successfully.',
      })
    } catch (error) {
      console.error('Error uploading pitch deck:', error)
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Failed to upload pitch deck. Please try again.',
      })
    } finally {
      setPitchDeckUploading(false)
    }
  }

  const handleVideoUpload = async (file: File) => {
    if (!currentStartupId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No startup selected.',
      })
      return
    }

    // File size validation (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Video must be less than 100MB.',
      })
      return
    }

    // File type validation
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Video must be MP4, MOV, AVI, or WebM format.',
      })
      return
    }

    setVideoUploading(true)

    try {
      const fileName = `${user.id}/video-${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('videos').getPublicUrl(fileName)

      const { data, error } = await supabase.rpc('update_user_startup_data', {
        p_user_id: user.id,
        p_startup_id: currentStartupId,
        p_data: { introVideoUrl: publicUrl },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      setFormData((prev) => ({ ...prev, introVideoUrl: publicUrl }))

      playCompletionSound()
      toast({
        title: 'Video uploaded',
        description: 'Your demo video has been uploaded successfully.',
      })
    } catch (error) {
      console.error('Error uploading video:', error)
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Failed to upload video. Please try again.',
      })
    } finally {
      setVideoUploading(false)
    }
  }

  const handlePitchDeckRemove = async () => {
    if (!currentStartupId) return

    try {
      const { error } = await supabase.rpc('update_user_startup_data', {
        p_user_id: user.id,
        p_startup_id: currentStartupId,
        p_data: { pitchDeckUrl: null },
      })

      if (error) throw error

      setFormData((prev) => ({ ...prev, pitchDeckUrl: null }))

      playCompletionSound()
      toast({
        title: 'Pitch deck removed',
        description: 'Your pitch deck has been removed.',
      })
    } catch (error) {
      console.error('Error removing pitch deck:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove pitch deck. Please try again.',
      })
    }
  }

  const handleVideoRemove = async () => {
    if (!currentStartupId) return

    try {
      const { error } = await supabase.rpc('update_user_startup_data', {
        p_user_id: user.id,
        p_startup_id: currentStartupId,
        p_data: { introVideoUrl: null },
      })

      if (error) throw error

      setFormData((prev) => ({ ...prev, introVideoUrl: null }))

      playCompletionSound()
      toast({
        title: 'Video removed',
        description: 'Your demo video has been removed.',
      })
    } catch (error) {
      console.error('Error removing video:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove video. Please try again.',
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
            <Avatar key={logoUrl} className="h-20 w-20 rounded-sm">
              <AvatarImage src={logoUrl} alt="Company logo" />
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
                onClick={() => {
                  playClickSound()
                  logoInputRef.current?.click()
                }}
                disabled={logoUploading}
                className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm"
              >
                {logoUploading ? (
                  <>
                    <Spinner className="h-3 w-3 mr-2" />
                  </>
                ) : (
                  <>{formData.logoUrl ? 'Update' : 'Upload'}</>
                )}
              </Button>
              {formData.logoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    playClickSound()
                    handleLogoRemove()
                  }}
                  disabled={logoUploading}
                  className="bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:text-pink-800 dark:hover:text-pink-200 border border-pink-200 dark:border-pink-800 rounded-sm"
                >
                  {logoUploading ? (
                    <>
                      <Spinner className="h-3 w-3 mr-2" />
                      Removing...
                    </>
                  ) : (
                    'Remove'
                  )}
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
                      editingField !== 'name' && 'dark:bg-muted',
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
                      editingField !== 'website' && 'dark:bg-muted',
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
                      editingField !== 'foundedYear' && 'dark:bg-muted',
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
                      editingField !== 'location' && 'dark:bg-muted',
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
                <Textarea
                  id="descriptionShort"
                  value={formData.descriptionShort}
                  onChange={(e) =>
                    handleInputChange('descriptionShort', e.target.value)
                  }
                  className={cn(
                    'rounded-sm pr-8 min-h-[60px]',
                    editingField !== 'descriptionShort' && 'dark:bg-muted',
                  )}
                  readOnly={editingField !== 'descriptionShort'}
                  placeholder="Brief description of what your company does"
                  rows={2}
                  enableAI={editingField === 'descriptionShort'}
                  aiFieldType="description-short"
                  aiContext={{
                    companyName: formData.name,
                    industry: formData.industry || undefined,
                  }}
                  onAIEnhance={(enhancedText) =>
                    handleInputChange('descriptionShort', enhancedText)
                  }
                />
                {editingField !== 'descriptionShort' ? (
                  <button
                    onClick={() => handleFieldEdit('descriptionShort')}
                    className="absolute right-2 top-2 text-blue-500 hover:text-blue-600"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleFieldSave('descriptionShort')}
                    className="absolute right-2 top-2 text-green-500 hover:text-green-600"
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
                    editingField !== 'descriptionMedium' && 'dark:bg-muted',
                  )}
                  readOnly={editingField !== 'descriptionMedium'}
                  placeholder="Describe what your company does, the problem you solve, and your solution..."
                  rows={3}
                  enableAI={editingField === 'descriptionMedium'}
                  aiFieldType="description-medium"
                  aiContext={{
                    companyName: formData.name,
                    industry: formData.industry || undefined,
                  }}
                  onAIEnhance={(enhancedText) =>
                    handleInputChange('descriptionMedium', enhancedText)
                  }
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
                    editingField !== 'descriptionLong' && 'dark:bg-muted',
                  )}
                  readOnly={editingField !== 'descriptionLong'}
                  placeholder="Detailed description of your company, market opportunity, solution, and business model..."
                  rows={5}
                  enableAI={editingField === 'descriptionLong'}
                  aiFieldType="description-long"
                  aiContext={{
                    companyName: formData.name,
                    industry: formData.industry || undefined,
                  }}
                  onAIEnhance={(enhancedText) =>
                    handleInputChange('descriptionLong', enhancedText)
                  }
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
                <select
                  id="revenueModel"
                  className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                  value={formData.revenueModel || ''}
                  onChange={async (e) => {
                    const newValue = e.target.value as RevenueModelType
                    handleInputChange('revenueModel', newValue)
                    await handleFieldSave('revenueModel')
                  }}
                  disabled={isLoading}
                >
                  <option value="">Select a revenue model</option>
                  {REVENUE_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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

            <div className="grid gap-4 md:grid-cols-2">
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
            </div>
          </div>

          {/* Incorporation Information */}
          <div className="space-y-4">
            <div className="space-y-4">
              <Label>Is your company incorporated?</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={async () => {
                    if (formData.isIncorporated) {
                      playClickSound()
                      handleInputChange('isIncorporated', false)
                      // Save without toast or completion sound
                      try {
                        const updateData = { isIncorporated: false }
                        const { data, error } = await supabase.rpc(
                          'update_user_startup_data',
                          {
                            p_user_id: user.id,
                            p_startup_id: currentStartupId,
                            p_data: updateData,
                          },
                        )
                        if (error) throw error
                        if (data?.error) throw new Error(data.error)
                      } catch (error) {
                        console.error(
                          'Error saving incorporation status:',
                          error,
                        )
                      }
                    }
                  }}
                  disabled={isLoading}
                  className={cn(
                    'flex items-center justify-center rounded-sm border-2 px-4 py-3 text-sm font-medium transition-all',
                    !formData.isIncorporated
                      ? 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/30 text-zinc-800 dark:text-zinc-300'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted',
                  )}
                >
                  No
                </button>
                <button
                  onClick={async () => {
                    if (!formData.isIncorporated) {
                      playClickSound()
                      handleInputChange('isIncorporated', true)
                      // Save without toast or completion sound
                      try {
                        const updateData = { isIncorporated: true }
                        const { data, error } = await supabase.rpc(
                          'update_user_startup_data',
                          {
                            p_user_id: user.id,
                            p_startup_id: currentStartupId,
                            p_data: updateData,
                          },
                        )
                        if (error) throw error
                        if (data?.error) throw new Error(data.error)
                      } catch (error) {
                        console.error(
                          'Error saving incorporation status:',
                          error,
                        )
                      }
                    }
                  }}
                  disabled={isLoading}
                  className={cn(
                    'flex items-center justify-center rounded-sm border-2 px-4 py-3 text-sm font-medium transition-all',
                    formData.isIncorporated
                      ? 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/30 text-zinc-800 dark:text-zinc-400'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted',
                  )}
                >
                  Yes
                </button>
              </div>
            </div>

            {formData.isIncorporated && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incorporationCountry">
                    Incorporation country
                  </Label>
                  <div className="relative">
                    <select
                      id="incorporationCountry"
                      className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                      value={formData.incorporationCountry}
                      onChange={async (e) => {
                        handleInputChange(
                          'incorporationCountry',
                          e.target.value,
                        )
                        await handleFieldSave('incorporationCountry')
                      }}
                      disabled={isLoading}
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incorporationCity">Incorporation city</Label>
                  <div className="relative">
                    <Input
                      id="incorporationCity"
                      value={formData.incorporationCity}
                      onChange={(e) =>
                        handleInputChange('incorporationCity', e.target.value)
                      }
                      className={cn(
                        'rounded-sm pr-8',
                        editingField !== 'incorporationCity' && 'dark:bg-muted',
                      )}
                      readOnly={editingField !== 'incorporationCity'}
                      placeholder="Paris"
                    />
                    {editingField !== 'incorporationCity' ? (
                      <button
                        onClick={() => handleFieldEdit('incorporationCity')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFieldSave('incorporationCity')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                        disabled={isLoading}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="operating-countries">
                Countries where you operate
              </Label>
              <MultiSelectCountries
                selected={formData.operatingCountries}
                onChange={async (selected) => {
                  handleInputChange('operatingCountries', selected)
                  await handleFieldSave('operatingCountries')
                }}
              />
              {formData.operatingCountries.length > 0 && (
                <div className="pt-2">
                  <div className="flex flex-wrap gap-1">
                    {formData.operatingCountries.map((country, index) => (
                      <Badge
                        key={country}
                        className={`rounded-sm px-2 py-0.5 border ${getBadgeColor(index)}`}
                      >
                        {country}
                        <button
                          onClick={async () => {
                            const newCountries =
                              formData.operatingCountries.filter(
                                (c) => c !== country,
                              )
                            handleInputChange(
                              'operatingCountries',
                              newCountries,
                            )
                            await handleFieldSave('operatingCountries')
                          }}
                          className="ml-1.5"
                          aria-label={`Remove ${country}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Investment & Financial Information */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="investmentInstrument">Investment type</Label>
                <div className="relative">
                  <select
                    id="investmentInstrument"
                    className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                    value={formData.investmentInstrument || ''}
                    onChange={async (e) => {
                      const newValue = e.target.value as InvestmentInstrument
                      handleInputChange('investmentInstrument', newValue)
                      await handleFieldSave('investmentInstrument')
                    }}
                    disabled={isLoading}
                  >
                    <option value="">Select an instrument</option>
                    {INVESTMENT_INSTRUMENTS.map((instrument) => (
                      <option key={instrument} value={instrument}>
                        {instrument}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fundingAmountSought">Funding amount</Label>
                <Input
                  id="fundingAmountSought"
                  type="text"
                  inputMode="numeric"
                  value={formatCurrency(formData.fundingAmountSought)}
                  onChange={(e) =>
                    handleNumericChange(
                      (val) => handleInputChange('fundingAmountSought', val),
                      e.target.value,
                    )
                  }
                  onBlur={() => handleFieldSave('fundingAmountSought')}
                  placeholder="500,000"
                  leftAddon="$"
                  rightAddon="USD"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="preMoneyValuation">Pre-money valuation</Label>
                <Input
                  id="preMoneyValuation"
                  type="text"
                  inputMode="numeric"
                  value={formatCurrency(formData.preMoneyValuation)}
                  onChange={(e) =>
                    handleNumericChange(
                      (val) => handleInputChange('preMoneyValuation', val),
                      e.target.value,
                    )
                  }
                  onBlur={() => handleFieldSave('preMoneyValuation')}
                  placeholder="5,000,000"
                  leftAddon="$"
                  rightAddon="USD"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mrr">MRR</Label>
                <Input
                  id="mrr"
                  type="text"
                  inputMode="numeric"
                  value={formatCurrency(formData.mrr)}
                  onChange={(e) =>
                    handleNumericChange(
                      (val) => handleInputChange('mrr', val),
                      e.target.value,
                    )
                  }
                  onBlur={() => handleFieldSave('mrr')}
                  placeholder="25,000"
                  leftAddon="$"
                  rightAddon="USD"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="arr">ARR</Label>
              <Input
                id="arr"
                type="text"
                inputMode="numeric"
                value={formatCurrency(formData.arr)}
                onChange={(e) =>
                  handleNumericChange(
                    (val) => handleInputChange('arr', val),
                    e.target.value,
                  )
                }
                onBlur={() => handleFieldSave('arr')}
                placeholder="300,000"
                leftAddon="$"
                rightAddon="USD"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Traction & Market */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tractionSummary">Traction</Label>
              <div className="relative">
                <Textarea
                  id="tractionSummary"
                  value={formData.tractionSummary}
                  onChange={(e) =>
                    handleInputChange('tractionSummary', e.target.value)
                  }
                  className={cn(
                    'rounded-sm pr-8 min-h-[80px]',
                    editingField !== 'tractionSummary' && 'dark:bg-muted',
                  )}
                  readOnly={editingField !== 'tractionSummary'}
                  placeholder="Key metrics, growth numbers, user adoption, partnerships, etc."
                  rows={3}
                  enableAI={editingField === 'tractionSummary'}
                  aiFieldType="traction"
                  aiContext={{
                    companyName: formData.name,
                    industry: formData.industry || undefined,
                  }}
                  onAIEnhance={(enhancedText) =>
                    handleInputChange('tractionSummary', enhancedText)
                  }
                />
                {editingField !== 'tractionSummary' ? (
                  <button
                    onClick={() => handleFieldEdit('tractionSummary')}
                    className="absolute right-2 top-2 text-blue-500 hover:text-blue-600"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleFieldSave('tractionSummary')}
                    className="absolute right-2 top-2 text-green-500 hover:text-green-600"
                    disabled={isLoading}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketSummary">Market</Label>
              <div className="relative">
                <Textarea
                  id="marketSummary"
                  value={formData.marketSummary}
                  onChange={(e) =>
                    handleInputChange('marketSummary', e.target.value)
                  }
                  className={cn(
                    'rounded-sm pr-8 min-h-[80px]',
                    editingField !== 'marketSummary' && 'dark:bg-muted',
                  )}
                  readOnly={editingField !== 'marketSummary'}
                  placeholder="Market size, target customers, competitive landscape, etc."
                  rows={3}
                  enableAI={editingField === 'marketSummary'}
                  aiFieldType="market"
                  aiContext={{
                    companyName: formData.name,
                    industry: formData.industry || undefined,
                  }}
                  onAIEnhance={(enhancedText) =>
                    handleInputChange('marketSummary', enhancedText)
                  }
                />
                {editingField !== 'marketSummary' ? (
                  <button
                    onClick={() => handleFieldEdit('marketSummary')}
                    className="absolute right-2 top-2 text-blue-500 hover:text-blue-600"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleFieldSave('marketSummary')}
                    className="absolute right-2 top-2 text-green-500 hover:text-green-600"
                    disabled={isLoading}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
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
                    editingField !== 'keyCustomers' && 'dark:bg-muted',
                  )}
                  readOnly={editingField !== 'keyCustomers'}
                  placeholder="Notable customers, enterprise clients, early adopters..."
                  rows={3}
                  enableAI={editingField === 'keyCustomers'}
                  aiFieldType="customers"
                  aiContext={{
                    companyName: formData.name,
                    industry: formData.industry || undefined,
                  }}
                  onAIEnhance={(enhancedText) =>
                    handleInputChange('keyCustomers', enhancedText)
                  }
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
              <CompetitorInput
                competitors={formData.competitorsList || []}
                onChange={async (competitors) => {
                  handleInputChange('competitorsList', competitors)
                  handleInputChange('competitors', competitors.join(', '))
                  await handleFieldSave('competitors')
                }}
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Pitch Deck Upload */}
              <div className="space-y-2">
                <Label>Deck</Label>
                <input
                  ref={pitchDeckInputRef}
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  className="hidden"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0]
                    if (selectedFile) handlePitchDeckUpload(selectedFile)
                  }}
                  disabled={pitchDeckUploading}
                />
                {!formData.pitchDeckUrl ? (
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 dark:bg-muted border-2 border-dashed border-border rounded-sm flex items-center justify-center">
                      <LottieIcon
                        animationData={animations.fileplus}
                        size={32}
                        loop={false}
                        autoplay={false}
                      />
                    </div>
                    <div className="space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          playClickSound()
                          pitchDeckInputRef.current?.click()
                        }}
                        disabled={pitchDeckUploading}
                        className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm"
                      >
                        {pitchDeckUploading ? (
                          <>
                            <Spinner className="h-3 w-3 mr-2" />
                          </>
                        ) : (
                          'Upload'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-sm flex items-center justify-center">
                      <LottieIcon
                        animationData={animations.fileplus}
                        size={32}
                        loop={false}
                        autoplay={false}
                      />
                    </div>
                    <div className="space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          playClickSound()
                          pitchDeckInputRef.current?.click()
                        }}
                        disabled={pitchDeckUploading}
                        className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm"
                      >
                        {pitchDeckUploading ? (
                          <>
                            <Spinner className="h-3 w-3 mr-2" />
                          </>
                        ) : (
                          'Update'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          playClickSound()
                          handlePitchDeckRemove()
                        }}
                        className="bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:text-pink-800 dark:hover:text-pink-200 border border-pink-200 dark:border-pink-800 rounded-sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  PDF, PPT, or PPTX (max 5MB)
                </p>
              </div>

              {/* Video Upload */}
              <div className="space-y-2">
                <Label>Demo</Label>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept=".mp4,.mov,.avi,.webm"
                  className="hidden"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0]
                    if (selectedFile) handleVideoUpload(selectedFile)
                  }}
                  disabled={videoUploading}
                />
                {!formData.introVideoUrl ? (
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 dark:bg-muted border-2 border-dashed border-border rounded-sm flex items-center justify-center">
                      <LottieIcon
                        animationData={animations.fileplus}
                        size={32}
                        loop={false}
                        autoplay={false}
                      />
                    </div>
                    <div className="space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          playClickSound()
                          videoInputRef.current?.click()
                        }}
                        disabled={videoUploading}
                        className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm"
                      >
                        {videoUploading ? (
                          <>
                            <Spinner className="h-3 w-3 mr-2" />
                          </>
                        ) : (
                          'Upload'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-sm flex items-center justify-center">
                      <LottieIcon
                        animationData={animations.fileplus}
                        size={32}
                        loop={false}
                        autoplay={false}
                      />
                    </div>
                    <div className="space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          playClickSound()
                          videoInputRef.current?.click()
                        }}
                        disabled={videoUploading}
                        className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm"
                      >
                        {videoUploading ? (
                          <>
                            <Spinner className="h-3 w-3 mr-2" />
                          </>
                        ) : (
                          'Update'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          playClickSound()
                          handleVideoRemove()
                        }}
                        className="bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:text-pink-800 dark:hover:text-pink-200 border border-pink-200 dark:border-pink-800 rounded-sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  MP4, MOV, AVI, or WebM (max 100MB)
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone - Only show when user has more than 1 startup */}
          {startups.length > 1 && (
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
                      >
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you sure ?</DialogTitle>
                        <DialogDescription>
                          This action will permanently delete this company and
                          all its data from our servers. This cannot be undone.
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
                          onClick={() => {
                            playClickSound()
                            handleStartupDelete()
                          }}
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
                    Delete your account and all associated data. This action
                    cannot be undone. Any active subscriptions will be
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
                          This action will delete your account and all your
                          startup data. This cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2 pt-0">
                        <Label
                          htmlFor="confirm"
                          className="text-sm font-medium"
                        >
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
                          onChange={(e) =>
                            setDeleteConfirmation(e.target.value)
                          }
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          variant="destructive"
                          disabled={deleteConfirmation !== 'DELETE'}
                          className="bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
                          onClick={() => {
                            playClickSound()
                            handleAccountDelete()
                          }}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          )}

          {/* Account deletion is always available (for single startup users) */}
          {startups.length === 1 && (
            <div className="mt-8">
              <Separator className="my-8" />
              <div className="space-y-3 p-6 bg-red-50/50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 rounded-sm">
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
                  Delete account
                </h2>
                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                  Delete your account and all associated data. This action
                  cannot be undone. Any active subscriptions will be cancelled.
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
                        This action will delete your account and all your
                        startup data. This cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 pt-0">
                      <Label htmlFor="confirm" className="text-sm font-medium">
                        Please type{' '}
                        <span className="font-semibold text-red-500">
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
                        onClick={() => {
                          playClickSound()
                          handleAccountDelete()
                        }}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
