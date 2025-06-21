'use client'

import { useState, useRef, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from '@/components/ui/dialog'
import { Button as ExpandButton } from '@/components/design/button-expand'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Json } from '@/lib/types/database'
import Spinner from '@/components/ui/spinner'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
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

// Welcome Step Component
const WelcomeStep = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full space-y-6 text-center"
    >
      <div className="relative w-48 h-48 mt-8">
        <Image
          src="/random/okra_onboarding.svg"
          alt="Welcome to Suparaise"
          fill
          className="object-contain"
          priority
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome to suparaise.com
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
          We&apos;ll help you create your startup profile and connect with the
          right investors. Let&apos;s get started with some basic information
          about you and your company.
        </p>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span>Onboarding</span>
      </div>
    </motion.div>
  )
}

export function OnboardingDialog({
  isOpen,
  userId,
  onComplete,
}: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(0) // Start with welcome step (0)
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationAttempted, setValidationAttempted] = useState(false)

  // File upload states
  const [logoUploadProgress, setLogoUploadProgress] = useState(0)
  const [logoUploadStatus, setLogoUploadStatus] = useState<
    'idle' | 'uploading' | 'completed' | 'failed'
  >('idle')
  const [pitchDeckUploadProgress, setPitchDeckUploadProgress] = useState(0)
  const [pitchDeckUploadStatus, setPitchDeckUploadStatus] = useState<
    'idle' | 'uploading' | 'completed' | 'failed'
  >('idle')
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const [videoUploadStatus, setVideoUploadStatus] = useState<
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
    logoFile: null,
    pitchDeckFile: null,
    introVideoFile: null,
  })

  const logoInputRef = useRef<HTMLInputElement>(null)
  const pitchDeckInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const supabase = createSupabaseBrowserClient()

  // Auto-advance from welcome step after 10 seconds
  useEffect(() => {
    if (currentStep === 0 && isOpen) {
      const timer = setTimeout(() => {
        setCurrentStep(1)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [currentStep, isOpen])

  // URL validation function
  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true // Empty URLs are optional
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  // Enhanced field validation with proper required field checking
  const validateStep = (step: number): ValidationResult => {
    const errors: string[] = []

    switch (step) {
      case 0:
        // Welcome step has no validation
        break
      case 1:
        // Validate all founders - all fields except bio are required
        founders.forEach((founder, index) => {
          const founderLabel = index === 0 ? 'You' : `Co-founder ${index}`

          // Required fields for all founders
          if (!founder.firstName.trim())
            errors.push(`First name for ${founderLabel} is required`)
          if (!founder.lastName.trim())
            errors.push(`Last name for ${founderLabel} is required`)
          if (!founder.email.trim())
            errors.push(`Email for ${founderLabel} is required`)
          if (!founder.phone.trim())
            errors.push(`Phone for ${founderLabel} is required`)
          if (!founder.linkedin.trim())
            errors.push(`LinkedIn for ${founderLabel} is required`)
          if (!founder.githubUrl.trim())
            errors.push(`GitHub for ${founderLabel} is required`)
          if (!founder.personalWebsiteUrl.trim())
            errors.push(`Website for ${founderLabel} is required`)

          // Validate URL formats and email format
          if (
            founder.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(founder.email)
          ) {
            errors.push(`Email for ${founderLabel} is invalid`)
          }
          if (founder.linkedin && !isValidUrl(founder.linkedin)) {
            errors.push(`LinkedIn URL for ${founderLabel} is invalid`)
          }
          if (founder.githubUrl && !isValidUrl(founder.githubUrl)) {
            errors.push(`GitHub URL for ${founderLabel} is invalid`)
          }
          if (
            founder.personalWebsiteUrl &&
            !isValidUrl(founder.personalWebsiteUrl)
          ) {
            errors.push(`Website URL for ${founderLabel} is invalid`)
          }
        })
        break

      case 2:
        if (!startup.name.trim()) errors.push('Company name is required')
        if (!startup.descriptionShort.trim())
          errors.push('One-liner is required')
        if (!startup.industry) errors.push('Industry is required')
        if (!startup.location.trim())
          errors.push('Headquarters location is required')

        // Validate company website URL
        if (startup.website && !isValidUrl(startup.website)) {
          errors.push('Company website URL is invalid')
        }
        break

      case 3:
        // Step 3 is optional, no validation needed
        break

      case 4:
        // Final validation - all previous required steps must be valid
        const step1Validation = validateStep(1)
        const step2Validation = validateStep(2)
        errors.push(...step1Validation.errors, ...step2Validation.errors)
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
        if (!founder.phone.trim()) errors.phone = 'Phone is required'
        if (!founder.linkedin.trim()) errors.linkedin = 'LinkedIn is required'
        if (!founder.githubUrl.trim()) errors.githubUrl = 'GitHub is required'
        if (!founder.personalWebsiteUrl.trim())
          errors.personalWebsiteUrl = 'Website is required'
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
        founder.linkedin &&
        founder.linkedin.trim() &&
        !isValidUrl(founder.linkedin)
      ) {
        errors.linkedin = 'Invalid LinkedIn URL'
      }
      if (
        founder.githubUrl &&
        founder.githubUrl.trim() &&
        !isValidUrl(founder.githubUrl)
      ) {
        errors.githubUrl = 'Invalid GitHub URL'
      }
      if (
        founder.personalWebsiteUrl &&
        founder.personalWebsiteUrl.trim() &&
        !isValidUrl(founder.personalWebsiteUrl)
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
      if (!startup.descriptionShort.trim())
        errors.descriptionShort = 'One-liner is required'
      if (!startup.industry) errors.industry = 'Industry is required'
      if (!startup.location.trim())
        errors.location = 'Headquarters location is required'
    }

    // Format validation - show immediately when user types invalid data
    if (
      startup.website &&
      startup.website.trim() &&
      !isValidUrl(startup.website)
    ) {
      errors.website = 'Invalid website URL'
    }

    return errors
  }

  const handleFileUpload = async (
    type: 'logo' | 'pitchDeck' | 'introVideo',
    file: File,
  ) => {
    // File size validation
    const maxSize = type === 'introVideo' ? 100 * 1024 * 1024 : 5 * 1024 * 1024 // 100MB for video, 5MB for others
    if (file.size > maxSize) {
      const maxSizeText = type === 'introVideo' ? '100MB' : '5MB'
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
    } else if (type === 'introVideo') {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (!['mp4', 'mov', 'avi', 'webm'].includes(fileExtension || '')) {
        alert('Intro video must be MP4, MOV, AVI, or WebM format')
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
    } else if (type === 'introVideo') {
      setVideoUploadStatus('uploading')
      setVideoUploadProgress(0)
    }

    // Simulate progress
    const progressInterval = setInterval(
      () => {
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
        } else if (type === 'introVideo') {
          setVideoUploadProgress((oldProgress) => {
            if (oldProgress >= 100) {
              clearInterval(progressInterval)
              setVideoUploadStatus('completed')
              return 100
            }
            const increment = Math.random() * 10 // Slower for video
            return Math.min(oldProgress + increment, 90)
          })
        }
      },
      type === 'introVideo' ? 200 : 100,
    ) // Slower progress for video

    // Update state with file
    if (type === 'logo') {
      setStartup({ ...startup, logoFile: file })
    } else if (type === 'pitchDeck') {
      setStartup({ ...startup, pitchDeckFile: file })
    } else if (type === 'introVideo') {
      setStartup({ ...startup, introVideoFile: file })
    }

    // Complete the progress
    const completionTime = type === 'introVideo' ? 1500 : 800
    setTimeout(() => {
      if (type === 'logo') {
        setLogoUploadProgress(100)
        setLogoUploadStatus('completed')
      } else if (type === 'pitchDeck') {
        setPitchDeckUploadProgress(100)
        setPitchDeckUploadStatus('completed')
      } else if (type === 'introVideo') {
        setVideoUploadProgress(100)
        setVideoUploadStatus('completed')
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

  const handleVideoRemove = () => {
    setStartup({ ...startup, introVideoFile: null })
    setVideoUploadStatus('idle')
    setVideoUploadProgress(0)
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
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

    setValidationErrors([])
    setLoading(true)
    try {
      // Upload files if they exist
      let logoUrl = ''
      let pitchDeckUrl = ''
      let introVideoUrl = ''

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
          'pitch_decks',
          `${userId}/pitch-deck-${Date.now()}`,
        )
      }

      if (startup.introVideoFile) {
        introVideoUrl = await uploadFile(
          startup.introVideoFile,
          'intro_videos',
          `${userId}/intro-video-${Date.now()}`,
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
        logo_url: logoUrl,
        pitch_deck_url: pitchDeckUrl,
        intro_video_url: introVideoUrl,
        founders: founders.filter(
          (f) => f.firstName.trim() && f.lastName.trim(),
        ),
      }

      const { error } = await supabase.rpc('create_startup_and_founders', {
        p_data: submissionData as unknown as Json,
      })

      if (error) throw error

      onComplete()
    } catch (error) {
      console.error('Error submitting onboarding data:', error)
      alert('There was an error saving your information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    // Skip validation for welcome step
    if (currentStep === 0) {
      setCurrentStep(1)
      return
    }

    setValidationAttempted(true)
    const validation = validateStep(currentStep)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    setValidationErrors([])
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      setValidationAttempted(false) // Reset for next step
    }
  }

  const prevStep = () => {
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

  const videoUploadProps: FileUploadProps = {
    type: 'introVideo',
    file: startup.introVideoFile,
    uploadStatus: videoUploadStatus,
    uploadProgress: videoUploadProgress,
    onUpload: handleFileUpload,
    onRemove: handleVideoRemove,
    inputRef: videoInputRef,
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
      <Dialog open={isOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-3xl max-h-[90vh] flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=open]:slide-in-from-bottom-1/2 data-[state=open]:duration-500 data-[state=closed]:duration-300"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>
              Onboarding - Step {currentStep} of 4: {getStepTitle()}
            </DialogTitle>
            <DialogDescription>
              Complete your startup profile to get started with Suparaise
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-y-auto p-2 space-y-8 scrollbar-hide">
            {/* Validation Errors - Only show for non-welcome steps */}
            {currentStep > 0 && validationErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
              >
                <h4 className="text-red-800 font-medium mb-2">
                  Please fix the following errors:
                </h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
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
                  <WelcomeStep />
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
                    videoUploadProps={videoUploadProps}
                    fieldErrors={getStartupFieldErrors()}
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
                  <FundraisingStep startup={startup} setStartup={setStartup} />
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
              className="flex justify-between pt-6 border-t"
            >
              {currentStep > 1 && (
                <ExpandButton
                  variant="outline"
                  onClick={prevStep}
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </ExpandButton>
              )}
              {currentStep < 4 ? (
                <ExpandButton
                  onClick={nextStep}
                  disabled={!canProceedFromStep(currentStep) || loading}
                  className="ml-auto"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </ExpandButton>
              ) : (
                <ExpandButton onClick={submitData} disabled={loading}>
                  {loading ? <Spinner /> : 'Submit'}
                </ExpandButton>
              )}
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
