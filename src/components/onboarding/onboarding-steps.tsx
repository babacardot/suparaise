'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import {
  Plus,
  X,
  ChevronDown,
  ChevronsUpDown,
  Check,
  Wand2,
} from 'lucide-react'
import PhoneNumberInput from '@/components/design/phone-number-input'
import * as RPNInput from 'react-phone-number-input'
import {
  FounderData,
  StartupData,
  FounderRole,
  IndustryType,
  LegalStructure,
  InvestmentStage,
  InvestmentInstrument,
  RevenueModelType,
  FileUploadProps,
  FounderFieldErrors,
  StartupFieldErrors,
  FOUNDER_ROLES,
  INDUSTRIES,
  LEGAL_STRUCTURES,
  FUNDING_ROUNDS,
  INVESTMENT_INSTRUMENTS,
  REVENUE_MODELS,
} from './onboarding-types'
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
import { cn } from '@/lib/actions/utils'
import Image from 'next/image'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import { useToast } from '@/lib/hooks/use-toast'
// import { SmartIngestModal } from './ingest-modal'

// Sound utility functions
const playSound = (soundFile: string) => {
  try {
    const audio = new Audio(soundFile)
    audio.volume = 0.4
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

// Get all countries from react-phone-number-input library
const COUNTRIES = RPNInput.getCountries()
  .map(
    (countryCode) =>
      new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) ||
      countryCode,
  )
  .sort()

interface TeamStepProps {
  founders: FounderData[]
  setFounders: (founders: FounderData[]) => void
  fieldErrors: FounderFieldErrors[]
  prefilledFields?: {
    linkedin: boolean
    twitter: boolean
  }
}

interface CompanyStepProps {
  startup: StartupData
  setStartup: (startup: StartupData) => void
  logoUploadProps: FileUploadProps
  pitchDeckUploadProps: FileUploadProps
  // videoUploadProps: FileUploadProps // Temporarily commented out
  fieldErrors: StartupFieldErrors
  // showIngestModal: boolean
  // setShowIngestModal: (show: boolean) => void
  // onIngestData: (data: Partial<StartupData>) => void
}

interface FundraisingStepProps {
  startup: StartupData
  setStartup: (startup: StartupData) => void
  fieldErrors: StartupFieldErrors
}

interface ReviewStepProps {
  startup: StartupData
  founders: FounderData[]
}

// File upload utilities
const getFileTypeColor = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'png':
      return 'bg-green-500 text-white dark:bg-green-600'
    case 'jpg':
    case 'jpeg':
      return 'bg-blue-500 text-white dark:bg-blue-600'
    case 'svg':
      return 'bg-purple-500 text-white dark:bg-purple-600'
    case 'webp':
      return 'bg-orange-500 text-white dark:bg-orange-600'
    case 'pdf':
      return 'bg-red-500 text-white dark:bg-red-600'
    case 'ppt':
    case 'pptx':
      return 'bg-yellow-500 text-white dark:bg-yellow-600'
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'webm':
      return 'bg-indigo-500 text-white dark:bg-indigo-600'
    case 'xls':
    case 'xlsx':
      return 'bg-emerald-500 text-white dark:bg-emerald-600'
    case 'doc':
    case 'docx':
      return 'bg-cyan-500 text-white dark:bg-cyan-600'
    default:
      return 'bg-gray-500 text-white dark:bg-gray-600'
  }
}

const getFileTypeText = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'webp':
      return 'IMG'
    case 'pdf':
      return 'PDF'
    case 'ppt':
    case 'pptx':
      return 'PPT'
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'webm':
      return 'VID'
    case 'xls':
    case 'xlsx':
      return 'XLS'
    case 'doc':
    case 'docx':
      return 'DOC'
    default:
      return 'FILE'
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 KB'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(0)) + ' ' + sizes[i]
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
    <div className="space-y-3">
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

// File Upload Component
const FileUploadComponent: React.FC<
  FileUploadProps & {
    accept: string
    maxSize: string
    description: string
  }
> = ({
  type,
  file,
  uploadStatus,
  uploadProgress,
  onUpload,
  onRemove,
  inputRef,
  accept,
  maxSize,
  description,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (type === 'logo' && file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      return () => {
        URL.revokeObjectURL(url)
        setPreviewUrl(null)
      }
    } else {
      setPreviewUrl(null)
    }
  }, [file, type])

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0]
          if (selectedFile) onUpload(type, selectedFile)
        }}
        disabled={uploadStatus === 'uploading'}
      />
      {!file ? (
        <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-3 sm:space-y-0">
          <div className="h-20 w-20 bg-background dark:bg-muted border-2 border-dashed border-border rounded-sm flex items-center justify-center">
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
              onClick={() => inputRef.current?.click()}
              disabled={uploadStatus === 'uploading'}
              className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm"
            >
              {uploadStatus === 'uploading' ? (
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
          <div className="h-20 w-20 rounded-sm flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              type === 'logo' ? (
                <Image
                  src={previewUrl}
                  alt="Logo preview"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-sm object-contain"
                />
              ) : (
                <video
                  src={previewUrl}
                  muted
                  playsInline
                  className="h-20 w-20 rounded-sm object-contain"
                />
              )
            ) : (
              <div
                className={`h-20 w-20 rounded-sm flex items-center justify-center ${getFileTypeColor(file.name)}`}
              >
                <span className="text-xs font-bold">
                  {getFileTypeText(file.name)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {uploadStatus === 'uploading'
                ? `${formatFileSize(
                    (uploadProgress / 100) * file.size,
                  )} of ${formatFileSize(file.size)}`
                : formatFileSize(file.size)}
            </p>
            {uploadStatus === 'uploading' && (
              <div className="mt-2 w-full bg-muted h-1.5 rounded-sm overflow-hidden">
                <div
                  className="bg-primary h-1.5 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            {uploadStatus === 'failed' && (
              <button
                onClick={() => onUpload(type, file)}
                className="text-sm text-red-500 hover:underline"
              >
                Try again
              </button>
            )}
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={uploadStatus === 'uploading'}
                className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm"
              >
                {uploadStatus === 'uploading' ? (
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
                  onRemove()
                }}
                className="bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:text-pink-800 dark:hover:text-pink-200 border border-pink-200 dark:border-pink-800 rounded-sm"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {description} (max {maxSize})
      </p>
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
        <Command>
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

const SingleSelectCountry: React.FC<{
  selected: string
  onChange: (selected: string) => void
  placeholder?: string
}> = ({ selected, onChange, placeholder = 'Select country...' }) => {
  const [open, setOpen] = useState(false)

  const handleSelect = (country: string) => {
    onChange(country === selected ? '' : country)
    setOpen(false)
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
          <span className="truncate">{selected || placeholder}</span>
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
        <Command>
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
                      selected === country ? 'opacity-100' : 'opacity-0',
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

// Step 1: Team Information
export const TeamStep: React.FC<
  TeamStepProps & { isFirstStartup?: boolean }
> = ({
  founders,
  setFounders,
  fieldErrors,
  isFirstStartup = true,
  prefilledFields,
}) => {
  const addFounder = () => {
    setFounders([
      ...founders,
      {
        firstName: '',
        lastName: '',
        role: 'Co-founder',
        bio: '',
        email: '',
        phone: '',
        linkedin: '',
        githubUrl: '',
        personalWebsiteUrl: '',
        twitterUrl: '',
      },
    ])
  }

  const removeFounder = (index: number) => {
    playClickSound()
    if (founders.length > 1) {
      setFounders(founders.filter((_, i) => i !== index))
    }
  }

  const updateFounder = (
    index: number,
    field: keyof FounderData,
    value: string | FounderRole,
  ) => {
    const updatedFounders = [...founders]
    updatedFounders[index] = { ...updatedFounders[index], [field]: value }
    setFounders(updatedFounders)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tell us about your team</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Start with the basics about yourself and any co-founders. You can
          always add more details later as your startup evolves.
        </p>
        {!isFirstStartup && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-sm p-4 mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Since this is an additional company,
              you&apos;ll need to use a different email address.
            </p>
          </div>
        )}
      </div>

      {founders.map((founder, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {index === 0 ? 'You' : 'Co-founder'}
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
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor={`founder-${index}-fname`}>
                  First name <span className="required-asterisk">*</span>
                </Label>
                <Input
                  id={`founder-${index}-fname`}
                  value={founder.firstName}
                  onChange={(e) =>
                    updateFounder(index, 'firstName', e.target.value)
                  }
                  placeholder="Sarah"
                  autoComplete="given-name"
                  required
                  className={
                    fieldErrors[index]?.firstName
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                />
                {fieldErrors[index]?.firstName && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors[index].firstName}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <Label htmlFor={`founder-${index}-lname`}>
                  Last name <span className="required-asterisk">*</span>
                </Label>
                <Input
                  id={`founder-${index}-lname`}
                  value={founder.lastName}
                  onChange={(e) =>
                    updateFounder(index, 'lastName', e.target.value)
                  }
                  placeholder="Chen"
                  autoComplete="family-name"
                  required
                  className={
                    fieldErrors[index]?.lastName
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                />
                {fieldErrors[index]?.lastName && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors[index].lastName}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor={`founder-${index}-role`}>
                  Role <span className="required-asterisk">*</span>
                </Label>
                <div className="relative">
                  <select
                    id={`founder-${index}-role`}
                    className="w-full pl-3 p-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                    value={founder.role}
                    onChange={(e) =>
                      updateFounder(
                        index,
                        'role',
                        e.target.value as FounderRole,
                      )
                    }
                    required
                  >
                    {FOUNDER_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor={`founder-${index}-email`}>
                  Email <span className="required-asterisk">*</span>
                </Label>
                <Input
                  id={`founder-${index}-email`}
                  type="email"
                  value={founder.email}
                  onChange={(e) =>
                    updateFounder(index, 'email', e.target.value)
                  }
                  placeholder="sarah@happy.ai"
                  autoComplete="email"
                  className={
                    fieldErrors[index]?.email
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your company email is preferred.
                </p>
                {fieldErrors[index]?.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors[index].email}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor={`founder-${index}-phone`}>Phone</Label>
                <PhoneNumberInput
                  value={founder.phone}
                  onChange={(value) =>
                    updateFounder(index, 'phone', value || '')
                  }
                  placeholder="Phone number"
                  className={
                    fieldErrors[index]?.phone
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                />
                {fieldErrors[index]?.phone && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors[index].phone}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Optional - helps investors reach you faster
                </p>
              </div>
              <div className="space-y-3">
                <Label htmlFor={`founder-${index}-linkedin`}>LinkedIn</Label>
                <Input
                  id={`founder-${index}-linkedin`}
                  value={founder.linkedin}
                  onChange={(e) =>
                    updateFounder(index, 'linkedin', e.target.value)
                  }
                  placeholder="https://linkedin.com/in/sarahchen"
                  autoComplete="url"
                  className={
                    fieldErrors[index]?.linkedin
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                />
                {fieldErrors[index]?.linkedin && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors[index].linkedin}
                  </p>
                )}
                {/* Show hint if LinkedIn URL was pre-populated */}
                {prefilledFields?.linkedin && index === 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Pre-filled from your profile
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor={`founder-${index}-github`}>Github</Label>
                <Input
                  id={`founder-${index}-github`}
                  value={founder.githubUrl}
                  onChange={(e) =>
                    updateFounder(index, 'githubUrl', e.target.value)
                  }
                  placeholder="https://github.com/sarahchen"
                  autoComplete="url"
                  className={
                    fieldErrors[index]?.githubUrl
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                />
                {fieldErrors[index]?.githubUrl && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors[index].githubUrl}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <Label htmlFor={`founder-${index}-twitter`}>X</Label>
                <Input
                  id={`founder-${index}-twitter`}
                  value={founder.twitterUrl}
                  onChange={(e) =>
                    updateFounder(index, 'twitterUrl', e.target.value)
                  }
                  placeholder="https://x.com/sarahchen"
                  autoComplete="url"
                  className={
                    fieldErrors[index]?.twitterUrl
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                />
                {fieldErrors[index]?.twitterUrl && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors[index].twitterUrl}
                  </p>
                )}
                {/* Show hint if Twitter URL was pre-populated */}
                {prefilledFields?.twitter && index === 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Pre-filled from your profile
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor={`founder-${index}-website`}>
                Personal website
              </Label>
              <Input
                id={`founder-${index}-website`}
                value={founder.personalWebsiteUrl}
                onChange={(e) =>
                  updateFounder(index, 'personalWebsiteUrl', e.target.value)
                }
                placeholder="https://sarahchen.com"
                autoComplete="url"
                className={
                  fieldErrors[index]?.personalWebsiteUrl
                    ? 'border-red-500 focus:border-red-500'
                    : ''
                }
              />
              {fieldErrors[index]?.personalWebsiteUrl && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors[index].personalWebsiteUrl}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Label htmlFor={`founder-${index}-bio`}>Bio</Label>
              <Textarea
                id={`founder-${index}-bio`}
                value={founder.bio}
                onChange={(e) => updateFounder(index, 'bio', e.target.value)}
                placeholder="Former Google engineer with 8 years in ML. Built 3 products from 0 to 1M users, currently building a new startup: Happy AI."
                rows={3}
                enableAI={true}
                aiFieldType="bio"
                aiContext={{
                  founderName:
                    `${founder.firstName} ${founder.lastName}`.trim(),
                  role: founder.role,
                }}
                onAIEnhance={(enhancedText) =>
                  updateFounder(index, 'bio', enhancedText)
                }
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outline"
        onClick={addFounder}
        className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add co-founder
      </Button>
    </div>
  )
}

// Step 2: Company Information
export const CompanyStep: React.FC<CompanyStepProps> = ({
  startup,
  setStartup,
  logoUploadProps,
  pitchDeckUploadProps,
  // videoUploadProps, // Temporarily commented out
  fieldErrors,
  // showIngestModal,
  // setShowIngestModal,
  // onIngestData,
}) => {
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const { toast } = useToast()

  const handleWebsiteAutoFill = async () => {
    if (!startup.website.trim()) {
      return
    }

    setIsAutoFilling(true)
    try {
      const response = await fetch('/api/ai/autofill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteUrl: startup.website,
          context: {
            companyName: startup.name || undefined,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze website')
      }

      const { data } = await response.json()

      // Build an object with only the fields that need updating
      const fieldsToUpdate: Partial<StartupData> = {}
      if (data.name && !startup.name) fieldsToUpdate.name = data.name
      if (data.descriptionShort && !startup.descriptionShort)
        fieldsToUpdate.descriptionShort = data.descriptionShort
      if (data.descriptionMedium && !startup.descriptionMedium)
        fieldsToUpdate.descriptionMedium = data.descriptionMedium
      if (data.descriptionLong && !startup.descriptionLong)
        fieldsToUpdate.descriptionLong = data.descriptionLong
      if (data.industry && !startup.industry)
        fieldsToUpdate.industry = data.industry as IndustryType
      if (data.location && !startup.location)
        fieldsToUpdate.location = data.location
      if (data.foundedYear && !startup.foundedYear)
        fieldsToUpdate.foundedYear = data.foundedYear

      // Only update state if there are changes
      const numUpdatedFields = Object.keys(fieldsToUpdate).length
      if (numUpdatedFields > 0) {
        setStartup({
          ...startup,
          ...fieldsToUpdate,
        })
        toast({
          title: 'Autofill complete',
          variant: 'success',
          description: `Successfully autofilled ${numUpdatedFields} field${
            numUpdatedFields > 1 ? 's' : ''
          }.`,
        })
      } else {
        toast({
          title: 'Nothing to autofill',
          description: 'Your company details are already up to date.',
        })
      }

      playClickSound()
    } catch (error) {
      console.error('Website auto-fill error:', error)
      toast({
        variant: 'destructive',
        title: 'Autofill failed',
        description: `Could not fetch company data. ${
          error instanceof Error ? error.message : String(error)
        }`,
        duration: 9000,
      })
    } finally {
      setIsAutoFilling(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Tell us about your company
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Share what you&apos;re building. Don&apos;t worry about having
          everything perfect - you can refine these details anytime.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="company-name">
              Name <span className="required-asterisk">*</span>
            </Label>
            <Input
              id="company-name"
              value={startup.name}
              onChange={(e) => setStartup({ ...startup, name: e.target.value })}
              placeholder="Happy AI"
              autoComplete="organization"
              required
              className={
                fieldErrors.name ? 'border-red-500 focus:border-red-500' : ''
              }
            />
            {fieldErrors.name && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="company-website">
              Website <span className="required-asterisk">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="company-website"
                value={startup.website}
                onChange={(e) =>
                  setStartup({ ...startup, website: e.target.value })
                }
                placeholder="https://happy.ai"
                autoComplete="url"
                className={
                  fieldErrors.website
                    ? 'border-red-500 focus:border-red-500'
                    : ''
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleWebsiteAutoFill}
                disabled={!startup.website.trim() || isAutoFilling}
                className="shrink-0 px-3 h-9 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-800 dark:hover:text-purple-200 border border-purple-200 dark:border-purple-800"
                title="Auto-fill company information from website"
              >
                {isAutoFilling ? (
                  <Spinner className="h-3 w-3" />
                ) : (
                  <Wand2 className="h-3 w-3" />
                )}
              </Button>
            </div>
            {fieldErrors.website && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.website}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Click on the magic wand to auto-fill your details.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="founded-year">Founded year</Label>
            <Input
              id="founded-year"
              type="number"
              value={startup.foundedYear || ''}
              onChange={(e) =>
                setStartup({
                  ...startup,
                  foundedYear: parseInt(e.target.value) || 0,
                })
              }
              placeholder="2023"
              min="1900"
              max={new Date().getFullYear()}
              className={
                fieldErrors.foundedYear
                  ? 'border-red-500 focus:border-red-500'
                  : ''
              }
            />
            {fieldErrors.foundedYear && (
              <p className="text-sm text-red-600 mt-1">
                {fieldErrors.foundedYear}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional - can update later
            </p>
          </div>
          <div className="space-y-3">
            <Label htmlFor="location">Country</Label>
            <SingleSelectCountry
              selected={startup.location}
              onChange={(country) =>
                setStartup({ ...startup, location: country })
              }
              placeholder="Select country"
            />
            {fieldErrors.location && (
              <p className="text-sm text-red-600 mt-1">
                {fieldErrors.location}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional - where you&apos;re primarily based
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="industry">Industry</Label>
            <div className="relative">
              <select
                id="industry"
                className={`w-full pl-3 p-2 border rounded-sm appearance-none bg-transparent text-sm ${
                  fieldErrors.industry
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-input'
                }`}
                value={startup.industry || ''}
                onChange={(e) =>
                  setStartup({
                    ...startup,
                    industry: e.target.value as IndustryType,
                  })
                }
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
            {fieldErrors.industry && (
              <p className="text-sm text-red-600 mt-1">
                {fieldErrors.industry}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional - helps match with relevant investors
            </p>
          </div>
          <div className="space-y-3">
            <Label htmlFor="legal-structure">Legal structure</Label>
            <div className="relative">
              <select
                id="legal-structure"
                className="w-full pl-3 p-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                value={startup.legalStructure || ''}
                onChange={(e) => {
                  const newValue = e.target.value as LegalStructure
                  const isNotIncorporated = newValue === 'Not yet incorporated'
                  setStartup({
                    ...startup,
                    legalStructure: newValue,
                    isIncorporated: !isNotIncorporated,
                  })
                }}
              >
                <option value="">Select a legal structure</option>
                {LEGAL_STRUCTURES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-xs text-muted-foreground">
              Optional - many early-stage startups don&apos;t have this yet
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Is your company incorporated?</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (startup.isIncorporated) {
                    playClickSound()
                    setStartup({
                      ...startup,
                      isIncorporated: false,
                      legalStructure: 'Not yet incorporated',
                    })
                  }
                }}
                disabled={!startup.isIncorporated}
                className={cn(
                  'flex items-center justify-center rounded-sm border-2 h-9 px-4 text-sm font-medium transition-all',
                  !startup.isIncorporated
                    ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!startup.isIncorporated) {
                    playClickSound()
                    setStartup({
                      ...startup,
                      isIncorporated: true,
                      legalStructure: null,
                    })
                  }
                }}
                disabled={startup.isIncorporated}
                className={cn(
                  'flex items-center justify-center rounded-sm border-2 h-9 px-4 text-sm font-medium transition-all',
                  startup.isIncorporated
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-100 border-green-200 dark:border-green-800'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                Yes
              </button>
            </div>
          </div>

          {startup.isIncorporated && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="incorporation-country">
                  Incorporation country
                </Label>
                <SingleSelectCountry
                  selected={startup.incorporationCountry}
                  onChange={(country) =>
                    setStartup({
                      ...startup,
                      incorporationCountry: country,
                    })
                  }
                  placeholder="Select country"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="incorporation-city">Incorporation city</Label>
                <Input
                  id="incorporation-city"
                  value={startup.incorporationCity}
                  onChange={(e) =>
                    setStartup({
                      ...startup,
                      incorporationCity: e.target.value,
                    })
                  }
                  placeholder="Paris"
                  autoComplete="address-level2"
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="operating-countries">
              Countries where you operate
            </Label>
            <MultiSelectCountries
              selected={startup.operatingCountries}
              onChange={(selected) =>
                setStartup({ ...startup, operatingCountries: selected })
              }
            />
            {startup.operatingCountries.length > 0 && (
              <div className="pt-2">
                <div className="flex flex-wrap gap-1">
                  {startup.operatingCountries.map((country, index) => (
                    <Badge
                      key={country}
                      className={`rounded-sm px-2 py-0.5 border ${getBadgeColor(index)}`}
                    >
                      {country}
                      <button
                        onClick={() => {
                          playClickSound()
                          setStartup({
                            ...startup,
                            operatingCountries:
                              startup.operatingCountries.filter(
                                (c) => c !== country,
                              ),
                          })
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
            <p className="text-xs text-muted-foreground">
              Optional - helps investors understand your market reach
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="one-liner">
            One-liner <span className="required-asterisk">*</span>
          </Label>
          <Textarea
            id="one-liner"
            value={startup.descriptionShort}
            onChange={(e) =>
              setStartup({ ...startup, descriptionShort: e.target.value })
            }
            placeholder="AI workflow automation that saves teams 20+ hours weekly."
            maxLength={100}
            required
            rows={2}
            enableAI={true}
            aiFieldType="description-short"
            aiContext={{
              companyName: startup.name,
              industry: startup.industry || undefined,
            }}
            onAIEnhance={(enhancedText) =>
              setStartup({ ...startup, descriptionShort: enhancedText })
            }
            className={
              fieldErrors.descriptionShort
                ? 'border-red-500 focus:border-red-500'
                : ''
            }
          />
          {fieldErrors.descriptionShort && (
            <p className="text-sm text-red-600 mt-1">
              {fieldErrors.descriptionShort}
            </p>
          )}
          <p className="text-xs text-muted-foreground text-right justify-end mt-1">
            {startup.descriptionShort.length}/100 characters
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="elevator-pitch">Elevator pitch</Label>
          <Textarea
            id="elevator-pitch"
            value={startup.descriptionMedium}
            onChange={(e) =>
              setStartup({ ...startup, descriptionMedium: e.target.value })
            }
            placeholder="We're building AI-powered workflow automation that helps teams save 40+ hours per week. Our platform connects scattered tools and automates repetitive tasks without any coding required."
            rows={3}
            maxLength={300}
            enableAI={true}
            aiFieldType="description-medium"
            aiContext={{
              companyName: startup.name,
              industry: startup.industry || undefined,
            }}
            onAIEnhance={(enhancedText) =>
              setStartup({ ...startup, descriptionMedium: enhancedText })
            }
            className={
              fieldErrors.descriptionMedium
                ? 'border-red-500 focus:border-red-500'
                : ''
            }
          />
          {fieldErrors.descriptionMedium && (
            <p className="text-sm text-red-600 mt-1">
              {fieldErrors.descriptionMedium}
            </p>
          )}
          <p className="text-xs text-muted-foreground text-right justify-end mt-1">
            Optional • {startup.descriptionMedium.length}/300 characters
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="full-description">Full description</Label>
          <Textarea
            id="full-description"
            value={startup.descriptionLong}
            onChange={(e) =>
              setStartup({ ...startup, descriptionLong: e.target.value })
            }
            placeholder="Modern teams use 50+ different tools daily, creating chaos and wasted time. Our AI platform intelligently connects these tools, learns team patterns, and automates complex workflows. Unlike traditional automation tools that require technical setup, our solution works out-of-the-box with natural language commands..."
            rows={5}
            enableAI={true}
            aiFieldType="description-long"
            aiContext={{
              companyName: startup.name,
              industry: startup.industry || undefined,
            }}
            onAIEnhance={(enhancedText) =>
              setStartup({ ...startup, descriptionLong: enhancedText })
            }
            className={
              fieldErrors.descriptionLong
                ? 'border-red-500 focus:border-red-500'
                : ''
            }
          />
          {fieldErrors.descriptionLong && (
            <p className="text-sm text-red-600 mt-1">
              {fieldErrors.descriptionLong}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Optional - can be used for more detailed pitches
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="google-drive-url">Cloud storage / Docsend</Label>
            <Input
              id="google-drive-url"
              value={startup.googleDriveUrl}
              onChange={(e) =>
                setStartup({ ...startup, googleDriveUrl: e.target.value })
              }
              placeholder="https://docs.google.com/..."
              autoComplete="url"
              className={
                fieldErrors.googleDriveUrl
                  ? 'border-red-500 focus:border-red-500'
                  : ''
              }
            />
            <p className="text-xs text-muted-foreground">
              Link to a folder with your pitch deck and any other materials you
              judge relevant for investors.
            </p>
            {fieldErrors.googleDriveUrl && (
              <p className="text-sm text-red-600 mt-1">
                {fieldErrors.googleDriveUrl}
              </p>
            )}
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <div className="space-y-3">
              <Label>Logo</Label>
              <FileUploadComponent
                {...logoUploadProps}
                accept=".jpg,.jpeg,.png,.svg,.webp"
                maxSize="5MB"
                description="PNG, JPG, JPEG, SVG, or WebP"
              />
            </div>

            <div className="relative -mt-3">
              <Badge
                variant="secondary"
                className="absolute top-2 right-2 z-10 text-xs bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800"
              >
                BETA
              </Badge>
              <div className="space-y-3 rounded-sm border bg-cyan-50 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-800 px-4 pt-3 pb-4">
                <Label>Pitch deck</Label>
                <FileUploadComponent
                  {...pitchDeckUploadProps}
                  accept=".pdf,.ppt,.pptx"
                  maxSize="5MB"
                  description="PDF, PPT, or PPTX"
                />
              </div>
            </div>
          </div>

          {/* Temporarily commented out - Demo upload
          <div className="space-y-3">
            <Label>Demo</Label>
            <FileUploadComponent
              {...videoUploadProps}
              accept=".mp4,.mov,.avi,.webm"
              maxSize="100MB"
              description="MP4, MOV, AVI, or WebM"
            />
          </div>
          */}
        </div>
      </div>

      {/* <SmartIngestModal
        isOpen={showIngestModal}
        onClose={() => setShowIngestModal(false)}
        onIngest={onIngestData}
        currentData={startup}
      /> */}
    </div>
  )
}

// Step 3: Fundraising
export const FundraisingStep: React.FC<FundraisingStepProps> = ({
  startup,
  setStartup,
  fieldErrors,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Tell us about your current fundraising round
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Help us understand your fundraising goals. Most fields are optional -
          share what you know and leave the rest for later.
        </p>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="funding-round">
              What round are you raising?{' '}
              <span className="required-asterisk">*</span>
            </Label>
            <div className="relative">
              <select
                id="funding-round"
                className="w-full pl-3 p-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                value={startup.fundingRound || ''}
                onChange={(e) =>
                  setStartup({
                    ...startup,
                    fundingRound: e.target.value as InvestmentStage,
                  })
                }
                required
              >
                <option value="">Select a round</option>
                {FUNDING_ROUNDS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="space-y-3">
            <Label htmlFor="investment-instrument">
              What type of investment are you seeking?
            </Label>
            <div className="relative">
              <select
                id="investment-instrument"
                className="w-full pl-3 p-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                value={startup.investmentInstrument || ''}
                onChange={(e) =>
                  setStartup({
                    ...startup,
                    investmentInstrument: e.target
                      .value as InvestmentInstrument,
                  })
                }
              >
                <option value="">Select an instrument</option>
                {INVESTMENT_INSTRUMENTS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-xs text-muted-foreground">
              Optional - can be determined later with investors
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="revenue-model">Revenue model</Label>
            <div className="relative">
              <select
                id="revenue-model"
                className={`w-full pl-3 p-2 border rounded-sm appearance-none bg-transparent text-sm ${
                  fieldErrors.revenueModel
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-input'
                }`}
                value={startup.revenueModel || ''}
                onChange={(e) =>
                  setStartup({
                    ...startup,
                    revenueModel: e.target.value as RevenueModelType,
                  })
                }
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
            {fieldErrors.revenueModel && (
              <p className="text-sm text-red-600 mt-1">
                {fieldErrors.revenueModel}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional - many startups are still figuring this out
            </p>
          </div>
          <div className="space-y-3">
            <Label htmlFor="current-runway">Runway</Label>
            <div className="relative">
              <select
                id="current-runway"
                className="w-full pl-3 p-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                value={startup.currentRunway}
                onChange={(e) =>
                  setStartup({
                    ...startup,
                    currentRunway: parseInt(e.target.value) || 0,
                  })
                }
              >
                <option value={0}>Select runway</option>
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={9}>9 months</option>
                <option value={12}>12 months</option>
                <option value={15}>15 months</option>
                <option value={18}>18 months</option>
                <option value={21}>21 months</option>
                <option value={24}>24 months</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Optional - how many months of funding you have left
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="funding-amount">How much are you raising?</Label>
            <Input
              id="funding-amount"
              type="text"
              inputMode="numeric"
              value={formatCurrency(startup.fundingAmountSought)}
              onChange={(e) =>
                handleNumericChange(
                  (val) => setStartup({ ...startup, fundingAmountSought: val }),
                  e.target.value,
                )
              }
              placeholder="500,000"
              leftAddon="$"
              rightAddon="USD"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <p className="text-xs text-muted-foreground">
              Optional - can be a range or TBD
            </p>
          </div>
          <div className="space-y-3">
            <Label htmlFor="pre-money-valuation">Pre-money valuation</Label>
            <Input
              id="pre-money-valuation"
              type="text"
              inputMode="numeric"
              value={formatCurrency(startup.preMoneyValuation)}
              onChange={(e) =>
                handleNumericChange(
                  (val) => setStartup({ ...startup, preMoneyValuation: val }),
                  e.target.value,
                )
              }
              placeholder="5,000,000"
              leftAddon="$"
              rightAddon="USD"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <p className="text-xs text-muted-foreground">
              Optional - many early-stage companies don&apos;t have this yet
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <Label htmlFor="employee-count">Team size</Label>
              <div className="relative">
                <select
                  id="employee-count"
                  className="w-full pl-3 p-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                  value={startup.employeeCount}
                  onChange={(e) =>
                    setStartup({
                      ...startup,
                      employeeCount: parseInt(e.target.value) || 1,
                    })
                  }
                >
                  <option value="">Select team size</option>
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
              <p className="text-xs text-muted-foreground">
                Optional - can include advisors/contractors
              </p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="mrr">MRR</Label>
              <Input
                id="mrr"
                type="text"
                inputMode="numeric"
                value={formatCurrency(startup.mrr)}
                onChange={(e) =>
                  handleNumericChange(
                    (val) => setStartup({ ...startup, mrr: val }),
                    e.target.value,
                  )
                }
                placeholder="25,000"
                leftAddon="$"
                rightAddon="USD"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional - if pre-revenue, leave blank
              </p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="arr">ARR</Label>
              <Input
                id="arr"
                type="text"
                inputMode="numeric"
                value={formatCurrency(startup.arr)}
                onChange={(e) =>
                  handleNumericChange(
                    (val) => setStartup({ ...startup, arr: val }),
                    e.target.value,
                  )
                }
                placeholder="300,000"
                leftAddon="$"
                rightAddon="USD"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional - if pre-revenue, leave blank
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="traction">Traction</Label>
            <Textarea
              id="traction"
              value={startup.tractionSummary}
              onChange={(e) =>
                setStartup({ ...startup, tractionSummary: e.target.value })
              }
              placeholder="Key metrics, growth numbers, user adoption, partnerships, etc."
              rows={3}
              enableAI={true}
              aiFieldType="traction"
              aiContext={{
                companyName: startup.name,
                industry: startup.industry || undefined,
              }}
              onAIEnhance={(enhancedText) =>
                setStartup({ ...startup, tractionSummary: enhancedText })
              }
            />
            <p className="text-xs text-muted-foreground">
              Optional - can be updated as you grow
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="market">Market</Label>
            <Textarea
              id="market"
              value={startup.marketSummary}
              onChange={(e) =>
                setStartup({ ...startup, marketSummary: e.target.value })
              }
              placeholder="Market size, target customers, competitive landscape, etc."
              rows={3}
              enableAI={true}
              aiFieldType="market"
              aiContext={{
                companyName: startup.name,
                industry: startup.industry || undefined,
              }}
              onAIEnhance={(enhancedText) =>
                setStartup({ ...startup, marketSummary: enhancedText })
              }
            />
            <p className="text-xs text-muted-foreground">
              Optional - can be refined over time
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="key-customers">Key customers</Label>
            <Textarea
              id="key-customers"
              value={startup.keyCustomers}
              onChange={(e) =>
                setStartup({ ...startup, keyCustomers: e.target.value })
              }
              placeholder="Notable customers, enterprise clients, early adopters..."
              rows={2}
              enableAI={true}
              aiFieldType="customers"
              aiContext={{
                companyName: startup.name,
                industry: startup.industry || undefined,
              }}
              onAIEnhance={(enhancedText) =>
                setStartup({ ...startup, keyCustomers: enhancedText })
              }
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="competitors">Competitors</Label>
            <CompetitorInput
              competitors={startup.competitorsList || []}
              onChange={(competitors) =>
                setStartup({
                  ...startup,
                  competitorsList: competitors,
                  competitors: competitors.join(', '),
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 4: Review & Submit
export const ReviewStep: React.FC<ReviewStepProps> = ({
  startup,
  founders,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Take a moment to ensure everything looks perfect.
        </p>
      </div>

      <div className="space-y-4">
        {/* Company Information */}
        <Card>
          <CardHeader className="-mb-2 pb-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <LottieIcon
                animationData={animations.work}
                size={20}
                loop={false}
                autoplay={false}
              />
              Company
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Name</span>
                <p>{startup.name || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Website
                </span>
                <p>{startup.website || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Industry
                </span>
                <p>{startup.industry || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Country
                </span>
                <p>{startup.location || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Founded year
                </span>
                <p>{startup.foundedYear || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Legal structure
                </span>
                <p>{startup.legalStructure || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Incorporated
                </span>
                <p>{startup.isIncorporated ? 'Yes' : 'No'}</p>
              </div>

              <div>
                <span className="font-medium text-muted-foreground">
                  Revenue model
                </span>
                <p>{startup.revenueModel || 'Not provided'}</p>
              </div>
            </div>

            {startup.isIncorporated &&
              (startup.incorporationCountry || startup.incorporationCity) && (
                <div className="pt-2 border-t">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Inc. country
                      </span>
                      <p>{startup.incorporationCountry || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Inc. city
                      </span>
                      <p>{startup.incorporationCity || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}

            {startup.operatingCountries.length > 0 && (
              <div className="pt-2 border-t">
                <span className="font-medium text-muted-foreground text-sm">
                  Operating countries
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {startup.operatingCountries.map((country, index) => (
                    <Badge
                      key={index}
                      className={`text-xs border ${getBadgeColor(index)}`}
                    >
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t space-y-3">
              <div>
                <span className="font-medium text-muted-foreground text-sm">
                  One-liner
                </span>
                <p className="text-sm break-words whitespace-pre-wrap">
                  {startup.descriptionShort || 'Not provided'}
                </p>
              </div>
              {startup.descriptionMedium && (
                <div>
                  <span className="font-medium text-muted-foreground text-sm">
                    Elevator pitch
                  </span>
                  <p className="text-sm break-words whitespace-pre-wrap">
                    {startup.descriptionMedium}
                  </p>
                </div>
              )}
              {startup.descriptionLong && (
                <div>
                  <span className="font-medium text-muted-foreground text-sm">
                    Full description
                  </span>
                  <p className="text-sm break-words whitespace-pre-wrap">
                    {startup.descriptionLong}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t">
              <span className="font-medium text-muted-foreground text-sm">
                Assets
              </span>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm">Logo</span>
                  {startup.logoFile ? (
                    <Check className="h-3 w-3 pt-1 text-green-500" />
                  ) : (
                    <X className="h-3 w-3 pt-1 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm">Deck</span>
                  {startup.pitchDeckFile ? (
                    <Check className="h-3 w-3 pt-1 text-green-500" />
                  ) : (
                    <X className="h-3 w-3 pt-1 text-muted-foreground" />
                  )}
                </div>
                {startup.googleDriveUrl && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Cloud storage</span>
                    <Check className="h-3 w-3 pt-1 text-green-500" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card>
          <CardHeader className="-mb-2 pb-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <LottieIcon
                animationData={animations.group}
                size={20}
                loop={false}
                autoplay={false}
              />
              Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {founders.map((founder, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-muted/30 rounded-sm"
              >
                <Badge variant="outline" className="text-xs mt-0.5">
                  {founder.role}
                </Badge>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">
                    {founder.firstName} {founder.lastName}
                  </p>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>Email: {founder.email}</p>
                    {founder.phone && <p>Phone: {founder.phone}</p>}
                    {founder.linkedin && <p>LinkedIn: {founder.linkedin}</p>}
                    {founder.githubUrl && <p>Github: {founder.githubUrl}</p>}
                    {founder.twitterUrl && <p>X: {founder.twitterUrl}</p>}
                    {founder.personalWebsiteUrl && (
                      <p>Website: {founder.personalWebsiteUrl}</p>
                    )}
                    {founder.bio && (
                      <p className="mt-1 text-xs leading-relaxed break-words whitespace-pre-wrap text-foreground">
                        {founder.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Fundraising */}
        <Card>
          <CardHeader className="-mb-2 pb-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <LottieIcon
                animationData={animations.cash}
                size={20}
                loop={false}
                autoplay={false}
              />
              Fundraising
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Round</span>
                <p>{startup.fundingRound || 'Not specified'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Instrument
                </span>
                <p>{startup.investmentInstrument || 'Not specified'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Goal</span>
                <p>
                  {startup.fundingAmountSought > 0
                    ? `$${formatCurrency(startup.fundingAmountSought)}`
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Pre-money valuation
                </span>
                <p>
                  {startup.preMoneyValuation > 0
                    ? `$${formatCurrency(startup.preMoneyValuation)}`
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Team size
                </span>
                <p>
                  {startup.employeeCount === 1
                    ? 'Just me'
                    : `${startup.employeeCount} people`}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">MRR</span>
                <p>
                  {startup.mrr > 0
                    ? `$${formatCurrency(startup.mrr)}`
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">ARR</span>
                <p>
                  {startup.arr > 0
                    ? `$${formatCurrency(startup.arr)}`
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Runway
                </span>
                <p>
                  {startup.currentRunway > 0
                    ? `${startup.currentRunway} months`
                    : 'Not specified'}
                </p>
              </div>
            </div>

            {(startup.tractionSummary ||
              startup.marketSummary ||
              startup.keyCustomers ||
              startup.competitors) && (
              <div className="pt-2 border-t space-y-3">
                {startup.tractionSummary && (
                  <div>
                    <span className="font-medium text-muted-foreground text-sm">
                      Traction
                    </span>
                    <p className="text-sm break-words whitespace-pre-wrap">
                      {startup.tractionSummary}
                    </p>
                  </div>
                )}
                {startup.marketSummary && (
                  <div>
                    <span className="font-medium text-muted-foreground text-sm">
                      Market
                    </span>
                    <p className="text-sm break-words whitespace-pre-wrap">
                      {startup.marketSummary}
                    </p>
                  </div>
                )}
                {startup.keyCustomers && (
                  <div>
                    <span className="font-medium text-muted-foreground text-sm">
                      Key customers
                    </span>
                    <p className="text-sm break-words whitespace-pre-wrap">
                      {startup.keyCustomers}
                    </p>
                  </div>
                )}
                {startup.competitorsList &&
                  startup.competitorsList.length > 0 && (
                    <div>
                      <span className="font-medium text-muted-foreground text-sm">
                        Competitors
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {startup.competitorsList.map((competitor, index) => (
                          <Badge
                            key={competitor}
                            className={`rounded-sm px-2 py-0.5 border ${getBadgeColor(index)}`}
                          >
                            {competitor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
