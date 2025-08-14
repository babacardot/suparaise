'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser } from '@/lib/contexts/user-context'
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Button as ExpandButton } from '@/components/design/button-expand'
import { ArrowRight } from 'lucide-react'
import { Json } from '@/lib/types/database'
import Spinner from '@/components/ui/spinner'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useToast } from '@/lib/hooks/use-toast'
import { generateRandomCompanyName } from '@/lib/actions/utils'
import {
  FounderData,
  StartupData,
  OnboardingDialogProps,
  ValidationResult,
  FileUploadProps,
  FounderFieldErrors,
  StartupFieldErrors,
} from './onboarding-types'
import {
  TeamStep,
  CompanyStep,
  FundraisingStep,
  ReviewStep,
} from './onboarding-steps'
// import { SmartIngestModal } from './ingest-modal'

// Welcome Step Component
const WelcomeStep = ({
  isFirstStartup = true,
}: {
  isFirstStartup?: boolean
}) => {
  const welcomeContent = isFirstStartup
    ? {
      title: 'Welcome to suparaise.com',
      subtitle:
        "We're about to help you get meeting with investors, but first, we need to understand your startup as well as you do. Your detailed input is what will make our agents successful.",
      image: '/random/onboarding.svg',
      statusText: 'Onboarding',
    }
    : {
      title: 'Ready to launch another venture ?',
      subtitle:
        "Let's set up a new profile. This will help our agents represent this venture accurately to investors. You can always change this later.",
      image: '/random/test_your_app.svg',
      statusText: 'New venture',
    }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full space-y-6 text-center relative"
    >
      <div
        className="absolute top-0 left-0 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-sm px-3 py-1 text-xs font-medium select-none"
        onCopy={(e) => e.preventDefault()}
      >
        {isFirstStartup
          ? '3 steps process · 5 minutes'
          : '3 steps process · 5 minutes'}
      </div>

      <div className="relative w-32 h-32 sm:w-48 sm:h-48 mt-8">
        <Image
          src={welcomeContent.image}
          alt={welcomeContent.title}
          fill
          className="object-contain"
          priority
        />
      </div>

      <div
        className="space-y-4 px-4 sm:px-0 select-none"
        onCopy={(e) => e.preventDefault()}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 text-center">
          {welcomeContent.title}
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl text-center">
          {welcomeContent.subtitle}
        </p>
      </div>

      <div
        className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 select-none"
        onCopy={(e) => e.preventDefault()}
      >
        <div className="w-2 h-2 bg-blue-500 rounded-sm animate-pulse"></div>
        <span>{welcomeContent.statusText}</span>
      </div>
    </motion.div>
  )
}

export function OnboardingDialog({
  isOpen,
  userId,
  onComplete,
  isFirstStartup = true,
  onCancel,
}: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(0) // Start with welcome step (0)
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationAttempted, setValidationAttempted] = useState(false)
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false)
  // const [showIngestModal, setShowIngestModal] = useState(false)

  // Track which fields were actually pre-filled from OAuth
  const [prefilledFields, setPrefilledFields] = useState({
    linkedin: false,
    twitter: false,
  })

  // File upload states
  const [logoUploadProgress, setLogoUploadProgress] = useState(0)
  const [logoUploadStatus, setLogoUploadStatus] = useState<
    'idle' | 'uploading' | 'completed' | 'failed'
  >('idle')
  const [pitchDeckUploadProgress, setPitchDeckUploadProgress] = useState(0)
  const [pitchDeckUploadStatus, setPitchDeckUploadStatus] = useState<
    'idle' | 'uploading' | 'completed' | 'failed'
  >('idle')

  const [founders, setFounders] = useState<FounderData[]>([
    {
      firstName: '',
      lastName: '',
      role: 'Founder',
      bio: '',
      email: '',
      phone: '',
      linkedin: '',
      githubUrl: '',
      personalWebsiteUrl: '',
      twitterUrl: '',
    },
  ])

  const [startup, setStartup] = useState<StartupData>({
    name: '',
    website: '',
    industry: null,
    location: '',
    isIncorporated: false,
    incorporationCity: '',
    incorporationCountry: '',
    operatingCountries: [],
    legalStructure: null,
    investmentInstrument: null,
    fundingRound: null,
    fundingAmountSought: 0,
    preMoneyValuation: 0,
    descriptionShort: '',
    descriptionMedium: '',
    descriptionLong: '',
    tractionSummary: '',
    marketSummary: '',
    mrr: 0,
    arr: 0,
    employeeCount: 1,
    foundedYear: new Date().getFullYear(),
    revenueModel: null,
    currentRunway: 0,
    keyCustomers: '',
    competitors: '',
    competitorsList: [],
    googleDriveUrl: '',
    logoFile: null,
    pitchDeckFile: null,
    introVideoFile: null,
  })

  const logoInputRef = useRef<HTMLInputElement>(null)
  const pitchDeckInputRef = useRef<HTMLInputElement>(null)

  // Use UserContext instead of creating new supabase client
  const { user, supabase, refreshStartups, selectStartupById } = useUser()
  const { toast } = useToast()

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

  const playNavigationSound = () => {
    playSound('/sounds/light.mp3')
  }

  const playCompletionSound = () => {
    playSound('/sounds/completion.mp3')
  }

  useEffect(() => {
    const prefillFounderData = async () => {
      if (user) {
        setFounders((currentFounders) => {
          if (
            currentFounders.length > 0 &&
            !currentFounders[0].firstName &&
            !currentFounders[0].lastName &&
            !currentFounders[0].email
          ) {
            const newFounders = [...currentFounders]
            const firstFounder = { ...newFounders[0] }

            // Only prefill email for first startup to avoid conflicts
            if (isFirstStartup) {
              firstFounder.email = user.email || ''
            }

            type UserMetadata = {
              [key: string]: unknown
              first_name?: string
              last_name?: string
              full_name?: string
              name?: string
              linkedin_url?: string
              twitter_url?: string
            }
            const meta = (user.user_metadata || {}) as UserMetadata
            const toStr = (v: unknown) => (typeof v === 'string' ? v : '')
            const metaFirst = toStr(meta.first_name).trim()
            const metaLast = toStr(meta.last_name).trim()
            if (metaFirst || metaLast) {
              firstFounder.firstName = metaFirst
              firstFounder.lastName = metaLast
            } else {
              const fullName = toStr(meta.full_name || meta.name || '')
              if (fullName) {
                const nameParts = fullName.split(' ')
                firstFounder.firstName = nameParts[0] || ''
                firstFounder.lastName = nameParts.slice(1).join(' ') || ''
              }
            }

            // Pre-populate LinkedIn URL if available from OAuth
            if (toStr(meta.linkedin_url) && !firstFounder.linkedin) {
              firstFounder.linkedin = toStr(meta.linkedin_url)
              setPrefilledFields((prev) => ({ ...prev, linkedin: true }))
            }

            // Pre-populate Twitter URL if available from OAuth
            if (toStr(meta.twitter_url) && !firstFounder.twitterUrl) {
              firstFounder.twitterUrl = toStr(meta.twitter_url)
              setPrefilledFields((prev) => ({ ...prev, twitter: true }))
            }

            newFounders[0] = firstFounder
            return newFounders
          }
          return currentFounders
        })
      }
    }

    if (isOpen) {
      prefillFounderData()
    }
  }, [isOpen, user, isFirstStartup])

  // Auto-advance from welcome step - longer for first startup, shorter for additional ones
  useEffect(() => {
    if (currentStep === 0 && isOpen) {
      const timer = setTimeout(
        () => {
          setCurrentStep(1)
        },
        isFirstStartup ? 7000 : 5000,
      ) // 10s for first startup, 8s for additional ones

      return () => clearTimeout(timer)
    }
  }, [currentStep, isOpen, isFirstStartup])

  // Handle dialog cancellation
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  // Handle close button click - show confirmation for additional startups
  const handleCloseAttempt = () => {
    playNavigationSound()
    if (!isFirstStartup) {
      setShowExitConfirmation(true)
    } else {
      handleCancel()
    }
  }

  // Confirm exit
  const handleConfirmExit = () => {
    playNavigationSound()
    setShowExitConfirmation(false)
    handleCancel()
  }

  // Cancel exit
  const handleCancelExit = () => {
    playNavigationSound()
    setShowExitConfirmation(false)
  }

  // Handle dialog open change (only for first startup - allows outside clicks to close)
  const handleOpenChange = (open: boolean) => {
    if (!open && isFirstStartup && onCancel) {
      handleCancel()
    }
  }

  // Enhanced validation functions
  const isValidLinkedInUrl = (url: string): boolean => {
    if (!url.trim()) return true // Empty URLs are optional
    try {
      const urlObj = new URL(url)
      return (
        (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
        (urlObj.hostname === 'linkedin.com' ||
          urlObj.hostname === 'www.linkedin.com') &&
        urlObj.pathname.startsWith('/in/')
      )
    } catch {
      return false
    }
  }

  const isValidTwitterUrl = (url: string): boolean => {
    if (!url.trim()) return true // Empty URLs are optional
    try {
      const urlObj = new URL(url)
      return (
        (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
        (urlObj.hostname === 'x.com' ||
          urlObj.hostname === 'www.x.com' ||
          urlObj.hostname === 'twitter.com' ||
          urlObj.hostname === 'www.twitter.com') &&
        urlObj.pathname.length > 1 // Must have a username path
      )
    } catch {
      return false
    }
  }

  const isValidGitHubUrl = (url: string): boolean => {
    if (!url.trim()) return true // Empty URLs are optional
    try {
      const urlObj = new URL(url)
      return (
        (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
        (urlObj.hostname === 'github.com' ||
          urlObj.hostname === 'www.github.com') &&
        urlObj.pathname.length > 1 // Must have a username path
      )
    } catch {
      return false
    }
  }

  const isValidPhoneNumber = (phone: string): boolean => {
    if (!phone.trim()) return true // Phone is now optional
    // Remove all non-digit characters to check length
    const digitsOnly = phone.replace(/\D/g, '')
    // International phone numbers should have at least 7 digits and at most 15 digits
    return digitsOnly.length >= 7 && digitsOnly.length <= 15
  }

  const isValidWebsiteUrl = (url: string): boolean => {
    if (!url.trim()) return true // Empty URLs are optional
    try {
      const urlObj = new URL(url)
      return (
        (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
        urlObj.hostname.includes('.') && // Must have a domain
        urlObj.hostname.length > 3 // Minimum domain length
      )
    } catch {
      return false
    }
  }

  // Enhanced field validation with much more relaxed required field checking
  const validateStep = (step: number): ValidationResult => {
    const errors: string[] = []

    switch (step) {
      case 0:
        // Welcome step has no validation
        break
      case 1:
        // Only validate essential founder info - much more relaxed
        founders.forEach((founder, index) => {
          const founderLabel = index === 0 ? 'You' : `Co-founder ${index}`

          // First name, last name, email and phone are required
          if (!founder.firstName.trim())
            errors.push(`First name for ${founderLabel} is required`)
          if (!founder.lastName.trim())
            errors.push(`Last name for ${founderLabel} is required`)
          if (!founder.email.trim())
            errors.push(`Email for ${founderLabel} is required`)
          if (!founder.phone.trim())
            errors.push(`Phone number for ${founderLabel} is required`)

          // Validate format only if provided - much more lenient
          if (
            founder.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(founder.email)
          ) {
            errors.push(`Email for ${founderLabel} is invalid`)
          }
          if (founder.phone && !isValidPhoneNumber(founder.phone)) {
            errors.push(`Phone number for ${founderLabel} format is invalid`)
          }
          if (founder.linkedin && !isValidLinkedInUrl(founder.linkedin)) {
            errors.push(`LinkedIn URL for ${founderLabel} format is invalid`)
          }
          if (founder.twitterUrl && !isValidTwitterUrl(founder.twitterUrl)) {
            errors.push(`X URL for ${founderLabel} format is invalid`)
          }
          if (founder.githubUrl && !isValidGitHubUrl(founder.githubUrl)) {
            errors.push(`GitHub URL for ${founderLabel} format is invalid`)
          }
          if (
            founder.personalWebsiteUrl &&
            !isValidWebsiteUrl(founder.personalWebsiteUrl)
          ) {
            errors.push(`Personal website URL for ${founderLabel} is invalid`)
          }

          // Check for duplicate emails within the current form
          const duplicateIndex = founders.findIndex(
            (otherFounder, otherIndex) =>
              otherIndex !== index &&
              otherFounder.email.trim().toLowerCase() ===
              founder.email.trim().toLowerCase(),
          )
          if (duplicateIndex !== -1) {
            errors.push(
              `Email for ${founderLabel} is already used by another founder in this startup`,
            )
          }

          // For non-first startups, warn if using the user's email (which likely conflicts)
          if (
            !isFirstStartup &&
            founder.email.trim().toLowerCase() ===
            (user?.email || '').toLowerCase()
          ) {
            errors.push(
              `${founderLabel} cannot use the same email as your account for additional startups. Please use a different email address.`,
            )
          }
        })
        break

      case 2:
        // Much more relaxed company validation - only essential fields
        if (!startup.name.trim()) errors.push('Company name is required')
        if (!startup.website.trim()) errors.push('Company website is required')
        if (!startup.descriptionShort.trim())
          errors.push('One-liner is required')
        if (!startup.googleDriveUrl.trim())
          errors.push('Cloud storage / Docsend URL is required')
        // Removed: elevator pitch, full description, industry, location, founded year, legal structure

        // Validate website URL format
        if (startup.website && !isValidWebsiteUrl(startup.website)) {
          errors.push('Company website URL is invalid')
        }
        if (
          startup.googleDriveUrl &&
          !isValidWebsiteUrl(startup.googleDriveUrl)
        ) {
          errors.push('Cloud storage URL is invalid')
        }
        break

      case 3:
        // Much more relaxed fundraising validation - only critical fields
        if (!startup.fundingRound) errors.push('Funding round is required')
        // Removed: investment instrument, operating countries, revenue model, runway,
        // pre-money valuation, funding amount, team size, traction, market
        break

      case 4:
        // Final validation - all previous required steps must be valid
        const step1Validation = validateStep(1)
        const step2Validation = validateStep(2)
        const step3Validation = validateStep(3)
        errors.push(
          ...step1Validation.errors,
          ...step2Validation.errors,
          ...step3Validation.errors,
        )
        break
    }

    return { isValid: errors.length === 0, errors }
  }

  // Create field-specific error objects for step components
  const getFounderFieldErrors = (): FounderFieldErrors[] => {
    return founders.map((founder) => {
      const errors: FounderFieldErrors = {}

      // Required field errors - only show if validation has been attempted
      if (validationAttempted) {
        if (!founder.firstName.trim())
          errors.firstName = 'First name is required'
        if (!founder.lastName.trim()) errors.lastName = 'Last name is required'
        if (!founder.email.trim()) errors.email = 'Email is required'
        // Removed: phone is no longer required
      }

      // Format validation - show immediately when user types invalid data
      if (
        founder.email &&
        founder.email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(founder.email)
      ) {
        errors.email = 'Invalid email format'
      }
      if (
        founder.phone &&
        founder.phone.trim() &&
        !isValidPhoneNumber(founder.phone)
      ) {
        errors.phone = 'Invalid phone format'
      }
      if (
        founder.linkedin &&
        founder.linkedin.trim() &&
        !isValidLinkedInUrl(founder.linkedin)
      ) {
        errors.linkedin = 'Invalid LinkedIn URL format'
      }
      if (
        founder.twitterUrl &&
        founder.twitterUrl.trim() &&
        !isValidTwitterUrl(founder.twitterUrl)
      ) {
        errors.twitterUrl = 'Invalid X/Twitter URL format'
      }
      if (
        founder.githubUrl &&
        founder.githubUrl.trim() &&
        !isValidGitHubUrl(founder.githubUrl)
      ) {
        errors.githubUrl = 'Invalid GitHub URL format'
      }
      if (
        founder.personalWebsiteUrl &&
        founder.personalWebsiteUrl.trim() &&
        !isValidWebsiteUrl(founder.personalWebsiteUrl)
      ) {
        errors.personalWebsiteUrl = 'Invalid website URL'
      }

      return errors
    })
  }

  const getStartupFieldErrors = (): StartupFieldErrors => {
    const errors: StartupFieldErrors = {}

    // Required field errors - only show if validation has been attempted
    if (validationAttempted) {
      if (!startup.name.trim()) errors.name = 'Company name is required'
      if (!startup.website.trim())
        errors.website = 'Company website is required'
      if (!startup.descriptionShort.trim())
        errors.descriptionShort = 'One-liner is required'
      if (!startup.googleDriveUrl.trim())
        errors.googleDriveUrl = 'Cloud storage / Docsend URL is required'
      // Removed: elevator pitch, full description, industry, location requirements
    }

    // Format validation - show immediately when user types invalid data
    if (
      startup.website &&
      startup.website.trim() &&
      !isValidWebsiteUrl(startup.website)
    ) {
      errors.website = 'Invalid website URL'
    }
    if (
      startup.googleDriveUrl &&
      startup.googleDriveUrl.trim() &&
      !isValidWebsiteUrl(startup.googleDriveUrl)
    ) {
      errors.googleDriveUrl = 'Invalid Cloud storage URL'
    }

    return errors
  }

  const handleFileUpload = async (type: 'logo' | 'pitchDeck', file: File) => {
    // File size validation
    const maxSize = 5 * 1024 * 1024 // 5MB for others
    if (file.size > maxSize) {
      const maxSizeText = '5MB'
      alert(`File size must be less than ${maxSizeText}`)
      return
    }

    // File type validation
    if (type === 'logo') {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (
        !['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(fileExtension || '')
      ) {
        alert('Logo must be PNG, JPG, JPEG, SVG, or WebP format')
        return
      }
    } else if (type === 'pitchDeck') {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (!['pdf', 'ppt', 'pptx'].includes(fileExtension || '')) {
        alert('Pitch deck must be PDF, PPT, or PPTX format')
        return
      }
    }

    // Set upload status and progress based on type
    if (type === 'logo') {
      setLogoUploadStatus('uploading')
      setLogoUploadProgress(0)
    } else if (type === 'pitchDeck') {
      setPitchDeckUploadStatus('uploading')
      setPitchDeckUploadProgress(0)
    }

    // Simulate progress
    const progressInterval = setInterval(() => {
      if (type === 'logo') {
        setLogoUploadProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(progressInterval)
            setLogoUploadStatus('completed')
            return 100
          }
          const increment = Math.random() * 15
          return Math.min(oldProgress + increment, 95)
        })
      } else if (type === 'pitchDeck') {
        setPitchDeckUploadProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(progressInterval)
            setPitchDeckUploadStatus('completed')
            return 100
          }
          const increment = Math.random() * 15
          return Math.min(oldProgress + increment, 95)
        })
      }
    }, 100)

    // Update state with file
    if (type === 'logo') {
      setStartup({ ...startup, logoFile: file })
    } else if (type === 'pitchDeck') {
      setStartup({ ...startup, pitchDeckFile: file })
    }

    // Complete the progress
    const completionTime = 800
    setTimeout(() => {
      if (type === 'logo') {
        setLogoUploadProgress(100)
        setLogoUploadStatus('completed')
      } else if (type === 'pitchDeck') {
        setPitchDeckUploadProgress(100)
        setPitchDeckUploadStatus('completed')
      }
      clearInterval(progressInterval)
    }, completionTime)
  }

  const handleLogoRemove = () => {
    setStartup({ ...startup, logoFile: null })
    setLogoUploadStatus('idle')
    setLogoUploadProgress(0)
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  const handlePitchDeckRemove = () => {
    setStartup({ ...startup, pitchDeckFile: null })
    setPitchDeckUploadStatus('idle')
    setPitchDeckUploadProgress(0)
    if (pitchDeckInputRef.current) {
      pitchDeckInputRef.current.value = ''
    }
  }

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path)

    return publicUrl
  }

  const submitData = async () => {
    // Final validation before submission
    const validation = validateStep(4)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    // Play completion sound on successful validation
    playCompletionSound()

    setValidationErrors([])
    setLoading(true)
    try {
      // Upload files if they exist
      let logoUrl = ''
      let pitchDeckUrl = ''

      if (startup.logoFile) {
        logoUrl = await uploadFile(
          startup.logoFile,
          'logos',
          `${userId}/logo-${Date.now()}`,
        )
      }

      if (startup.pitchDeckFile) {
        pitchDeckUrl = await uploadFile(
          startup.pitchDeckFile,
          'decks',
          `${userId}/pitch-deck-${Date.now()}`,
        )
      }

      // Consolidate all data into a single object for the RPC call
      const submissionData = {
        user_id: userId,
        name: startup.name,
        website: startup.website,
        industry: startup.industry,
        location: startup.location,
        is_incorporated: startup.isIncorporated,
        incorporation_city: startup.incorporationCity,
        incorporation_country: startup.incorporationCountry,
        operating_countries: startup.operatingCountries.join(','),
        legal_structure: startup.legalStructure,
        investment_instrument: startup.investmentInstrument,
        funding_round: startup.fundingRound,
        funding_amount_sought: startup.fundingAmountSought,
        pre_money_valuation: startup.preMoneyValuation,
        description_short: startup.descriptionShort,
        description_medium: startup.descriptionMedium,
        description_long: startup.descriptionLong,
        traction_summary: startup.tractionSummary,
        market_summary: startup.marketSummary,
        mrr: startup.mrr,
        arr: startup.arr,
        employee_count: startup.employeeCount,
        founded_year: startup.foundedYear,
        revenue_model: startup.revenueModel,
        current_runway: startup.currentRunway,
        key_customers: startup.keyCustomers,
        competitors: startup.competitors,
        logo_url: logoUrl,
        pitch_deck_url: pitchDeckUrl,
        intro_video_url: '',
        google_drive_url: startup.googleDriveUrl,
        founders: founders.filter(
          (f) => f.firstName.trim() && f.lastName.trim(),
        ),
      }

      const { data, error } = await supabase.rpc(
        'create_startup_and_founders',
        {
          p_data: submissionData as unknown as Json,
        },
      )

      if (error) throw error

      const newStartup = data as { id: string } | null

      // Refresh startups in context and navigate to new startup
      await refreshStartups()

      // If we have a new startup ID, select it
      if (newStartup?.id) {
        selectStartupById(newStartup.id)
      }

      onComplete()
    } catch (error) {
      console.error('Error submitting onboarding data:', error)

      // Show more specific error messages
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message: string }).message
        if (errorMessage.includes('409') || errorMessage.includes('conflict')) {
          toast({
            variant: 'destructive',
            title: 'Email already in use',
            description:
              'This email is already associated with another startup. Please use a different email address.',
          })
        } else {
          toast({
            variant: 'destructive',
            title: 'Submission failed',
            description:
              errorMessage ||
              'There was an error saving your information. Please try again.',
          })
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Submission failed',
          description:
            'There was an error saving your information. Please try again.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const skipOnboarding = async () => {
    // Only allow skipping for first-time users
    if (!isFirstStartup) return

    playNavigationSound()
    setLoading(true)
    try {
      // Generate a creative company name using our utility
      const companyName = generateRandomCompanyName()

      // Use the dedicated skip function with the generated name
      const { data, error } = await supabase.rpc(
        'create_minimal_startup_for_skip',
        {
          p_user_id: userId,
          p_company_name: companyName,
        },
      )

      if (error) throw error

      const newStartup = data as { id: string } | null

      // Refresh startups in context and navigate to new startup
      await refreshStartups()

      // If we have a new startup ID, select it
      if (newStartup?.id) {
        selectStartupById(newStartup.id)
      }

      // Play completion sound on successful skip
      playCompletionSound()

      onComplete()
    } catch (error) {
      console.error('Error skipping onboarding:', error)
      toast({
        variant: 'destructive',
        title: 'Skip failed',
        description:
          'There was an error skipping onboarding. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    // Skip validation for welcome step
    if (currentStep === 0) {
      setCurrentStep(1)
      // Scroll to top of dialog content
      const dialogContent = document.querySelector('[data-slot="dialog-content"]')
      if (dialogContent) {
        const scrollContainer = dialogContent.querySelector('.scrollbar-hide')
        if (scrollContainer) {
          scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
      return
    }

    setValidationAttempted(true)
    const validation = validateStep(currentStep)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    // Play navigation sound on successful step advancement
    playNavigationSound()

    setValidationErrors([])
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      setValidationAttempted(false) // Reset for next step

      // Scroll to top of dialog content after state update
      setTimeout(() => {
        const dialogContent = document.querySelector('[data-slot="dialog-content"]')
        if (dialogContent) {
          const scrollContainer = dialogContent.querySelector('.scrollbar-hide')
          if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }
      }, 100)
    }
  }

  const prevStep = () => {
    // Play navigation sound when going back
    playNavigationSound()

    setValidationErrors([])
    setValidationAttempted(false) // Reset validation state when going back
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedFromStep = (step: number) => {
    // Welcome step can always proceed
    if (step === 0) return true

    const validation = validateStep(step)
    return validation.isValid
  }

  // Create file upload props objects
  const logoUploadProps: FileUploadProps = {
    type: 'logo',
    file: startup.logoFile,
    uploadStatus: logoUploadStatus,
    uploadProgress: logoUploadProgress,
    onUpload: handleFileUpload,
    onRemove: handleLogoRemove,
    inputRef: logoInputRef,
  }

  const pitchDeckUploadProps: FileUploadProps = {
    type: 'pitchDeck',
    file: startup.pitchDeckFile,
    uploadStatus: pitchDeckUploadStatus,
    uploadProgress: pitchDeckUploadProgress,
    onUpload: handleFileUpload,
    onRemove: handlePitchDeckRemove,
    inputRef: pitchDeckInputRef,
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return 'Welcome'
      case 1:
        return 'Team Information'
      case 2:
        return 'Company Information'
      case 3:
        return 'Fundraising Details'
      case 4:
        return 'Review & Submit'
      default:
        return 'Onboarding'
    }
  }

  // Handle skip button click - show confirmation modal
  const handleSkipAttempt = () => {
    playNavigationSound()
    setShowSkipConfirmation(true)
  }

  // Confirm skip
  const handleConfirmSkip = () => {
    playNavigationSound()
    setShowSkipConfirmation(false)
    skipOnboarding()
  }

  // Cancel skip
  const handleCancelSkip = () => {
    playNavigationSound()
    setShowSkipConfirmation(false)
  }

  // // Handle ingest data from modal
  // const handleIngestData = (ingestedData: Partial<StartupData>) => {
  //   setStartup({ ...startup, ...ingestedData })
  //   playNavigationSound()
  //   setShowIngestModal(false)
  // }

  return (
    <>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <Dialog
        open={isOpen}
        onOpenChange={isFirstStartup ? handleOpenChange : undefined}
      >
        <DialogContent
          showCloseButton={!isFirstStartup}
          onCloseClick={!isFirstStartup ? handleCloseAttempt : undefined}
          variant="slide-up"
          className="max-w-2xl w-full mx-4 md:mx-auto max-h-[90vh] md:max-h-[85vh] flex flex-col"
          data-slot="dialog-content"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>
              Onboarding - Step {currentStep} of 4: {getStepTitle()}
            </DialogTitle>
            <DialogDescription>
              Complete your startup profile to get started with Suparaise
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-y-auto px-4 py-2 md:p-2 space-y-8 scrollbar-hide">
            {/* Validation Errors - Only show for non-welcome steps */}
            {currentStep > 0 && validationErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 rounded-sm p-4 mb-4"
              >
                <h4 className="text-red-800 font-medium mb-2">
                  Please fix the following errors:
                </h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1 h-1 bg-red-400 rounded-sm mr-2"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Render current step with animations */}
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <WelcomeStep isFirstStartup={isFirstStartup} />
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="team"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <TeamStep
                    founders={founders}
                    setFounders={setFounders}
                    fieldErrors={getFounderFieldErrors()}
                    isFirstStartup={isFirstStartup}
                    prefilledFields={prefilledFields}
                  />
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="company"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <CompanyStep
                    startup={startup}
                    setStartup={setStartup}
                    logoUploadProps={logoUploadProps}
                    pitchDeckUploadProps={pitchDeckUploadProps}
                    fieldErrors={getStartupFieldErrors()}
                  // showIngestModal={showIngestModal}
                  // setShowIngestModal={setShowIngestModal}
                  // onIngestData={handleIngestData}
                  />
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="fundraising"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <FundraisingStep
                    startup={startup}
                    setStartup={setStartup}
                    fieldErrors={getStartupFieldErrors()}
                  />
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <ReviewStep startup={startup} founders={founders} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation - Hide during welcome step */}
          {currentStep > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col sm:flex-row sm:justify-between pt-6 border-t gap-4 sm:gap-0"
            >
              {/* Left side buttons */}
              <div className="flex flex-col sm:flex-row gap-3 order-2 sm:order-1">
                {/* Skip button - only on step 1 for first startup */}
                {currentStep === 1 && isFirstStartup && (
                  <Button
                    variant="outline"
                    onClick={handleSkipAttempt}
                    disabled={loading}
                    className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-800 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-800"
                  >
                    Skip for now
                  </Button>
                )}
                {/* Previous button - only from step 2 onwards */}
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={loading}
                    className="bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:text-pink-800 dark:hover:text-pink-200 border border-pink-200 dark:border-pink-800"
                  >
                    Previous
                  </Button>
                )}
              </div>

              {/* Right side buttons */}
              <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
                {/* Smart Ingest button - show on company step (step 2) */}
                {/* {currentStep === 2 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      playNavigationSound()
                      setShowIngestModal(true)
                    }}
                    disabled={loading}
                    className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-800 dark:hover:text-purple-200 border border-purple-200 dark:border-purple-800"
                  >
                    Ingest
                  </Button>
                )} */}

                {currentStep < 4 ? (
                  <ExpandButton
                    onClick={nextStep}
                    disabled={!canProceedFromStep(currentStep) || loading}
                    className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800"
                    Icon={ArrowRight}
                    iconPlacement="right"
                    justify="end"
                  >
                    Next
                  </ExpandButton>
                ) : (
                  <ExpandButton
                    onClick={submitData}
                    disabled={loading}
                    className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800"
                  >
                    {loading ? <Spinner className="h-3 w-3" /> : 'Submit'}
                  </ExpandButton>
                )}
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* Skip Confirmation Dialog */}
      {showSkipConfirmation && (
        <Dialog
          open={showSkipConfirmation}
          onOpenChange={(open) => !open && handleCancelSkip()}
        >
          <DialogContent
            showCloseButton={false}
            variant="slide-up"
            className="max-w-md w-full mx-4 md:mx-auto"
          >
            <DialogHeader>
              <DialogTitle>Skip onboarding ?</DialogTitle>
              <DialogDescription>
                Take a quick look around the platform before setting up your
                profile.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCancelSkip}
                className="order-2 sm:order-1"
              >
                Continue onboarding
              </Button>
              <ExpandButton
                onClick={handleConfirmSkip}
                disabled={loading}
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-800 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-800 order-1 sm:order-2"
                Icon={ArrowRight}
                iconPlacement="right"
                justify="end"
              >
                {loading ? <Spinner className="h-3 w-3" /> : 'Skip'}
              </ExpandButton>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Exit Confirmation Dialog */}
      {showExitConfirmation && (
        <Dialog
          open={showExitConfirmation}
          onOpenChange={(open) => !open && handleCancelExit()}
        >
          <DialogContent
            showCloseButton={false}
            variant="slide-up"
            className="max-w-md w-full mx-4 md:mx-auto"
          >
            <DialogHeader>
              <DialogTitle>Cancel ?</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel registering this new company ?
                All progress will be lost.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCancelExit}
                className="order-2 sm:order-1"
              >
                No
              </Button>
              <ExpandButton
                onClick={handleConfirmExit}
                className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-800 dark:hover:text-red-200 border border-red-200 dark:border-red-800 order-1 sm:order-2"
                Icon={ArrowRight}
                iconPlacement="right"
                justify="end"
              >
                Yes
              </ExpandButton>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Smart Ingest Modal */}
      {/* {showIngestModal && (
        <SmartIngestModal
          isOpen={showIngestModal}
          onClose={() => setShowIngestModal(false)}
          onIngest={handleIngestData}
          currentData={startup}
        />
      )} */}
    </>
  )
}
