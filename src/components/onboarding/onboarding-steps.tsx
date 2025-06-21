'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, X, ChevronDown, FileUp, FileIcon, Building2 } from 'lucide-react'
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
  FileUploadProps,
  FounderFieldErrors,
  StartupFieldErrors,
  FOUNDER_ROLES,
  INDUSTRIES,
  LEGAL_STRUCTURES,
  FUNDING_ROUNDS,
  INVESTMENT_INSTRUMENTS,
} from './onboarding-types'

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
}

interface CompanyStepProps {
  startup: StartupData
  setStartup: (startup: StartupData) => void
  logoUploadProps: FileUploadProps
  pitchDeckUploadProps: FileUploadProps
  videoUploadProps: FileUploadProps
  fieldErrors: StartupFieldErrors
}

interface FundraisingStepProps {
  startup: StartupData
  setStartup: (startup: StartupData) => void
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
      return 'bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-400'
    case 'jpg':
    case 'jpeg':
      return 'bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-400'
    case 'svg':
      return 'bg-purple-100 text-purple-500 dark:bg-purple-900 dark:text-purple-400'
    case 'webp':
      return 'bg-orange-100 text-orange-500 dark:bg-orange-900 dark:text-orange-400'
    case 'pdf':
      return 'bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-400'
    case 'ppt':
    case 'pptx':
      return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'webm':
      return 'bg-indigo-100 text-indigo-500 dark:bg-indigo-900 dark:text-indigo-400'
    default:
      return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
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

// File Upload Component
const FileUploadComponent: React.FC<
  FileUploadProps & {
    accept: string
    maxSize: string
    description: string
    label: string
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
  label,
}) => {
  return (
    <div className="space-y-2">
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
      {!file && (
        <div className="flex flex-col space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={uploadStatus === 'uploading'}
            className="w-full"
          >
            <FileUp className="mr-2 h-4 w-4" />
            {uploadStatus === 'uploading' ? 'Uploading...' : label}
          </Button>
          <p className="text-xs text-muted-foreground text-start">
            {description} (max {maxSize})
          </p>
        </div>
      )}
      {file && (
        <div className="border rounded-sm p-4 relative">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-sm ${getFileTypeColor(file.name)}`}>
              <FileIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {uploadStatus === 'uploading'
                  ? `${formatFileSize((uploadProgress / 100) * file.size)} of ${formatFileSize(file.size)}`
                  : formatFileSize(file.size)}
              </p>
            </div>
          </div>
          {uploadStatus === 'uploading' && (
            <div className="mt-2 w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-1.5 transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
          {uploadStatus === 'failed' && (
            <button
              onClick={() => onUpload(type, file)}
              className="mt-2 text-sm text-red-500 hover:underline"
            >
              Try again
            </button>
          )}
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

// Step 1: Team Information
export const TeamStep: React.FC<TeamStepProps> = ({
  founders,
  setFounders,
  fieldErrors,
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
      },
    ])
  }

  const removeFounder = (index: number) => {
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
          Start by adding information about yourself and your co-founders.
        </p>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`founder-${index}-fname`}>First name *</Label>
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
              <div className="space-y-2">
                <Label htmlFor={`founder-${index}-lname`}>Last name *</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`founder-${index}-role`}>Role *</Label>
                <div className="relative">
                  <select
                    id={`founder-${index}-role`}
                    className="w-full p-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
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
              <div className="space-y-2">
                <Label htmlFor={`founder-${index}-email`}>Email *</Label>
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
                {fieldErrors[index]?.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors[index].email}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`founder-${index}-phone`}>Phone *</Label>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor={`founder-${index}-linkedin`}>LinkedIn *</Label>
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
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`founder-${index}-github`}>GitHub *</Label>
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
              <div className="space-y-2">
                <Label htmlFor={`founder-${index}-website`}>Website *</Label>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor={`founder-${index}-bio`}>Bio</Label>
              <Textarea
                id={`founder-${index}-bio`}
                value={founder.bio}
                onChange={(e) => updateFounder(index, 'bio', e.target.value)}
                placeholder="Former Google engineer with 8 years in ML. Built 3 products from 0 to 1M users, currently building a new startup: Happy AI."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={addFounder} className="w-full">
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
  videoUploadProps,
  fieldErrors,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Tell us about your company
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          In order for our agents to be able to perfectly describe your company,
          we need to know more about it.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Name *</Label>
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
          <div className="space-y-2">
            <Label htmlFor="company-website">Website</Label>
            <Input
              id="company-website"
              value={startup.website}
              onChange={(e) =>
                setStartup({ ...startup, website: e.target.value })
              }
              placeholder="https://happy.ai"
              autoComplete="url"
              className={
                fieldErrors.website ? 'border-red-500 focus:border-red-500' : ''
              }
            />
            {fieldErrors.website && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.website}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Headquarters *</Label>
          <Input
            id="location"
            value={startup.location}
            onChange={(e) =>
              setStartup({ ...startup, location: e.target.value })
            }
            placeholder="Austin, TX"
            autoComplete="country"
            required
            className={
              fieldErrors.location ? 'border-red-500 focus:border-red-500' : ''
            }
          />
          {fieldErrors.location && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.location}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry *</Label>
          <div className="relative">
            <select
              id="industry"
              className={`w-full p-2 border rounded-sm appearance-none bg-transparent text-sm ${
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
              required
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
            <p className="text-sm text-red-600 mt-1">{fieldErrors.industry}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="legal-structure">Legal structure</Label>
          <div className="relative">
            <select
              id="legal-structure"
              className="w-full p-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
              value={startup.legalStructure || ''}
              onChange={(e) =>
                setStartup({
                  ...startup,
                  legalStructure: e.target.value as LegalStructure,
                })
              }
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
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Is your company incorporated?</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="incorporated"
                  checked={startup.isIncorporated === true}
                  onChange={() =>
                    setStartup({ ...startup, isIncorporated: true })
                  }
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="incorporated"
                  checked={startup.isIncorporated === false}
                  onChange={() =>
                    setStartup({ ...startup, isIncorporated: false })
                  }
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {startup.isIncorporated && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="incorporation-city">Incorporation City</Label>
                <Input
                  id="incorporation-city"
                  value={startup.incorporationCity}
                  onChange={(e) =>
                    setStartup({
                      ...startup,
                      incorporationCity: e.target.value,
                    })
                  }
                  placeholder="Dover"
                  autoComplete="address-level2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="incorporation-country">
                  Incorporation Country
                </Label>
                <div className="relative">
                  <select
                    id="incorporation-country"
                    className="w-full p-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                    value={startup.incorporationCountry}
                    onChange={(e) =>
                      setStartup({
                        ...startup,
                        incorporationCountry: e.target.value,
                      })
                    }
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
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="operating-countries">
              Countries where you operate
            </Label>
            <div className="border border-input rounded-sm p-3 max-h-32 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-2 gap-2">
                {COUNTRIES.map((country) => (
                  <label
                    key={country}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={startup.operatingCountries.includes(country)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setStartup({
                            ...startup,
                            operatingCountries: [
                              ...startup.operatingCountries,
                              country,
                            ],
                          })
                        } else {
                          setStartup({
                            ...startup,
                            operatingCountries:
                              startup.operatingCountries.filter(
                                (c) => c !== country,
                              ),
                          })
                        }
                      }}
                    />
                    <span>{country}</span>
                  </label>
                ))}
              </div>
            </div>
            {startup.operatingCountries.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Selected: {startup.operatingCountries.join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="one-liner">One-liner *</Label>
          <Input
            id="one-liner"
            value={startup.descriptionShort}
            onChange={(e) =>
              setStartup({ ...startup, descriptionShort: e.target.value })
            }
            placeholder="AI workflow automation that saves teams 20+ hours weekly."
            maxLength={150}
            required
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
          <p className="text-xs text-muted-foreground mt-1">
            {startup.descriptionShort.length}/150 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="elevator-pitch">Elevator pitch</Label>
          <Textarea
            id="elevator-pitch"
            value={startup.descriptionMedium}
            onChange={(e) =>
              setStartup({ ...startup, descriptionMedium: e.target.value })
            }
            placeholder="We're building AI-powered workflow automation that helps teams save 20+ hours per week. Our platform connects scattered tools and automates repetitive tasks without any coding required."
            rows={3}
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {startup.descriptionMedium.length}/300 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full-description">Full description</Label>
          <Textarea
            id="full-description"
            value={startup.descriptionLong}
            onChange={(e) =>
              setStartup({ ...startup, descriptionLong: e.target.value })
            }
            placeholder="Modern teams use 50+ different tools daily, creating chaos and wasted time. Our AI platform intelligently connects these tools, learns team patterns, and automates complex workflows. Unlike traditional automation tools that require technical setup, our solution works out-of-the-box with natural language commands..."
            rows={5}
          />
        </div>

        <div className="space-y-6">
          <FileUploadComponent
            {...logoUploadProps}
            accept=".jpg,.jpeg,.png,.svg,.webp"
            maxSize="5MB"
            description="PNG, JPG, JPEG, SVG, or WebP"
            label="Upload company logo"
          />

          <FileUploadComponent
            {...pitchDeckUploadProps}
            accept=".pdf,.ppt,.pptx"
            maxSize="5MB"
            description="PDF, PPT, or PPTX"
            label="Upload pitch deck"
          />

          <FileUploadComponent
            {...videoUploadProps}
            accept=".mp4,.mov,.avi,.webm"
            maxSize="100MB"
            description="MP4, MOV, AVI, or WebM"
            label="Upload product video"
          />
        </div>
      </div>
    </div>
  )
}

// Step 3: Fundraising
export const FundraisingStep: React.FC<FundraisingStepProps> = ({
  startup,
  setStartup,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Tell us about your current fundraising round
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          This information will help our agents better respond to VCs forms and
          increase your chances of success.
        </p>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="funding-round">What round are you raising?</Label>
          <div className="relative">
            <select
              id="funding-round"
              className="w-full p-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
              value={startup.fundingRound || ''}
              onChange={(e) =>
                setStartup({
                  ...startup,
                  fundingRound: e.target.value as InvestmentStage,
                })
              }
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
        <div className="space-y-2">
          <Label htmlFor="investment-instrument">
            What type of investment are you seeking?
          </Label>
          <div className="relative">
            <select
              id="investment-instrument"
              className="w-full p-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
              value={startup.investmentInstrument || ''}
              onChange={(e) =>
                setStartup({
                  ...startup,
                  investmentInstrument: e.target.value as InvestmentInstrument,
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
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="funding-amount">
              How much are you raising? (USD)
            </Label>
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
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pre-money-valuation">
              Pre-money valuation (USD)
            </Label>
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
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee-count">Team size</Label>
              <div className="relative">
                <select
                  id="employee-count"
                  className="w-full p-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                  value={startup.employeeCount}
                  onChange={(e) =>
                    setStartup({
                      ...startup,
                      employeeCount: parseInt(e.target.value) || 1,
                    })
                  }
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
              <Label htmlFor="mrr">Monthly recurring revenue (USD)</Label>
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
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arr">Annual recurring revenue (USD)</Label>
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
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="traction">Traction</Label>
            <Textarea
              id="traction"
              value={startup.tractionSummary}
              onChange={(e) =>
                setStartup({ ...startup, tractionSummary: e.target.value })
              }
              placeholder="Key metrics, growth numbers, user adoption, partnerships, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="market">Market</Label>
            <Textarea
              id="market"
              value={startup.marketSummary}
              onChange={(e) =>
                setStartup({ ...startup, marketSummary: e.target.value })
              }
              placeholder="Market size, target customers, competitive landscape, etc."
              rows={3}
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Review your information</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Please review all the information before submitting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Basic Info
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {startup.name}
                    </div>
                    <div>
                      <span className="font-medium">Website:</span>{' '}
                      {startup.website || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium">Industry:</span>{' '}
                      {startup.industry || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>{' '}
                      {startup.location || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Legal Structure
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Structure:</span>{' '}
                      {startup.legalStructure || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium">Incorporated:</span>{' '}
                      {startup.isIncorporated ? 'Yes' : 'No'}
                    </div>
                    {startup.isIncorporated && (
                      <>
                        <div>
                          <span className="font-medium">Inc. City:</span>{' '}
                          {startup.incorporationCity || 'Not provided'}
                        </div>
                        <div>
                          <span className="font-medium">Inc. Country:</span>{' '}
                          {startup.incorporationCountry || 'Not provided'}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Assets
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Logo:</span>
                      {startup.logoFile ? (
                        <Badge variant="secondary" className="text-xs">
                          {startup.logoFile.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">
                          Not uploaded
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Pitch deck:</span>
                      {startup.pitchDeckFile ? (
                        <Badge variant="secondary" className="text-xs">
                          {startup.pitchDeckFile.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">
                          Not uploaded
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Product video:</span>
                      {startup.introVideoFile ? (
                        <Badge variant="secondary" className="text-xs">
                          {startup.introVideoFile.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">
                          Not uploaded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {startup.operatingCountries.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Operating Countries
                </h4>
                <div className="flex flex-wrap gap-1">
                  {startup.operatingCountries.map((country, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t space-y-3">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  One-liner
                </h4>
                <p className="text-sm">
                  {startup.descriptionShort || 'Not provided'}
                </p>
              </div>
              {startup.descriptionMedium && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Elevator Pitch
                  </h4>
                  <p className="text-sm">{startup.descriptionMedium}</p>
                </div>
              )}
              {startup.descriptionLong && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Full Description
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {startup.descriptionLong}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {founders.map((founder, index) => (
                <div
                  key={index}
                  className="border-l-4 border-primary/20 pl-4 pb-4 last:pb-0"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {founder.role}
                    </Badge>
                    <span className="font-medium text-sm">
                      {founder.firstName} {founder.lastName}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {founder.email && (
                      <div>
                        <span className="font-medium">Email:</span>{' '}
                        {founder.email}
                      </div>
                    )}
                    {founder.phone && (
                      <div>
                        <span className="font-medium">Phone:</span>{' '}
                        {founder.phone}
                      </div>
                    )}
                    {founder.linkedin && (
                      <div>
                        <span className="font-medium">LinkedIn:</span>{' '}
                        {founder.linkedin}
                      </div>
                    )}
                    {founder.githubUrl && (
                      <div>
                        <span className="font-medium">GitHub:</span>{' '}
                        {founder.githubUrl}
                      </div>
                    )}
                    {founder.personalWebsiteUrl && (
                      <div>
                        <span className="font-medium">Website:</span>{' '}
                        {founder.personalWebsiteUrl}
                      </div>
                    )}
                  </div>
                  {founder.bio && (
                    <div className="mt-2">
                      <h5 className="font-medium text-xs text-muted-foreground mb-1">
                        Bio
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        {founder.bio}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fundraising */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Fundraising</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Round Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Round:</span>{' '}
                    {startup.fundingRound || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">Instrument:</span>{' '}
                    {startup.investmentInstrument || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span>{' '}
                    {startup.fundingAmountSought > 0
                      ? `$${formatCurrency(startup.fundingAmountSought)}`
                      : 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">Valuation:</span>{' '}
                    {startup.preMoneyValuation > 0
                      ? `$${formatCurrency(startup.preMoneyValuation)}`
                      : 'Not specified'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Metrics
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Team size:</span>{' '}
                    {startup.employeeCount === 1
                      ? 'Just me'
                      : `${startup.employeeCount} people`}
                  </div>
                  <div>
                    <span className="font-medium">MRR:</span>{' '}
                    {startup.mrr > 0
                      ? `$${formatCurrency(startup.mrr)}`
                      : 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">ARR:</span>{' '}
                    {startup.arr > 0
                      ? `$${formatCurrency(startup.arr)}`
                      : 'Not specified'}
                  </div>
                </div>
              </div>

              {startup.tractionSummary && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Traction
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {startup.tractionSummary}
                  </p>
                </div>
              )}

              {startup.marketSummary && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Market
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {startup.marketSummary}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
