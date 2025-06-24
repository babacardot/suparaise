'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Button as ExpandButton } from '@/components/design/button-expand'
import { Textarea } from '@/components/ui/textarea'
import { ImagePlus, FileIcon, X, ArrowRight } from 'lucide-react'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

const categories = [
  { value: 'account', label: 'Account issues' },
  { value: 'billing', label: 'Billing and payments' },
  { value: 'technical', label: 'Technical support' },
  { value: 'other', label: 'Other' },
]

interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
}

const CustomSelect = ({ value, onChange, options }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={selectRef} className="relative">
      <div
        className={`rounded-sm bg-background dark:bg-[#121317] text-foreground p-3 cursor-pointer border border-border hover:border-foreground/20 transition-colors duration-200 flex items-center justify-between ${isOpen ? 'border-foreground/20' : ''
          }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-medium">
          {value
            ? options.find((opt: SelectOption) => opt.value === value)?.label ||
            ''
            : 'Select category'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {isOpen && (
        <div className="rounded-sm absolute top-full left-0 w-full bg-background dark:bg-[#121317] border border-border mt-1 z-10 shadow-lg">
          {options.map((option: SelectOption) => (
            <div
              key={option.value}
              className="p-3 hover:bg-accent dark:hover:bg-accent/10 cursor-pointer text-sm font-medium transition-colors duration-150"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const { currentStartupId } = useUser()
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user, supabase } = useUser()
  const { toast } = useToast()

  // Sound utility function
  const playClickSound = () => {
    try {
      const audio = new Audio('/sounds/light.mp3')
      audio.volume = 0.3
      audio.play().catch((error) => {
        console.log('Could not play sound:', error)
      })
    } catch (error) {
      console.log('Error loading sound:', error)
    }
  }

  const handleSubmit = async () => {
    playClickSound()

    if (!user) {
      console.error('User not found')
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Unable to identify user. Please try again later.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      let imageUrl: string | null = null

      if (image) {
        // Sanitize the filename
        const sanitizedFileName = image.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const fileName = `${user.id}/${Date.now()}_${sanitizedFileName}`

        const { error: uploadError } = await supabase.storage
          .from('support_request_images')
          .upload(fileName, image)

        if (uploadError) {
          console.error('Error uploading image:', uploadError)
          toast({
            variant: 'destructive',
            title: 'Upload Error',
            description: 'Failed to upload image. Please try again.',
          })
          setIsSubmitting(false)
          return
        }

        const { data: urlData } = await supabase.storage
          .from('support_request_images')
          .getPublicUrl(fileName)

        imageUrl = urlData.publicUrl
      }

      const { error: supportRequestError } = await supabase.rpc(
        'create_support_request',
        {
          p_user_id: user.id,
          p_startup_id: currentStartupId || null,
          p_category: category as
            | 'billing'
            | 'other'
            | 'account'
            | 'technical'
            | 'feature',
          p_subject: 'Support request',
          p_message: message,
          p_image_url: imageUrl || undefined,
        },
      )

      if (supportRequestError) {
        console.error('Error submitting support request:', supportRequestError)
        toast({
          variant: 'destructive',
          title: 'Submission Error',
          description:
            'There was a problem submitting your request. Please try again later.',
        })
      } else {
        toast({
          title: 'Support request submitted',
          duration: 2000,
          description:
            "We've received your request and will get back to you soon.",
        })
        resetForm()
        onClose()
      }
    } catch (error) {
      console.error('Error in support request submission:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again later.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCategory('')
    setMessage('')
    setImage(null)
    setIsSubmitted(false)
    setUploadProgress(0)
    setIsUploading(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
      setIsUploading(true)
      setUploadProgress(0)

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsUploading(false)
            return 100
          }
          return Math.min(prev + 10, 100)
        })
      }, 100)
    }
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  // Add click outside handler like feedback modal
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        if (!isSubmitted) {
          playClickSound()
          resetForm()
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, isSubmitted, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-background border border-border shadow-lg z-50 rounded-sm sm:max-w-md w-full max-w-lg max-h-[90vh] overflow-y-auto"
          ref={formRef}
        >
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Support</h3>
              <p className="text-sm text-muted-foreground">
                Need help? Send us a message and we&apos;ll get back to you.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Category
                </label>
                <CustomSelect
                  value={category}
                  onChange={(value) => {
                    playClickSound()
                    setCategory(value)
                  }}
                  options={categories}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Message
                </label>
                <div className="relative">
                  <Textarea
                    placeholder="Describe your issue or question in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="min-h-[150px] max-h-[300px] text-sm placeholder:text-sm pr-8 bg-white dark:bg-[#121317] text-gray-900 dark:text-gray-100 resize-y rounded-sm w-full"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-sm absolute bottom-2 right-2"
                    onClick={() => {
                      playClickSound()
                      fileInputRef.current?.click()
                    }}
                  >
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {image && (
                <div className="border rounded-sm p-2 relative bg-background max-w-full overflow-hidden">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`rounded-sm p-1.5 flex-shrink-0 ${image.type.includes('png')
                          ? 'bg-green-100 text-green-500'
                          : 'bg-blue-100 text-blue-500'
                        }`}
                    >
                      <FileIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-xs font-medium truncate w-full">
                        {image.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(image.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        playClickSound()
                        setImage(null)
                        setUploadProgress(0)
                        setIsUploading(false)
                      }}
                      className="text-muted-foreground hover:text-foreground flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  {isUploading && (
                    <div className="rounded-sm mt-2 w-full bg-gray-200 dark:bg-gray-700 h-1 overflow-hidden">
                      <div
                        className="bg-blue-500 h-1 transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <ExpandButton
                onClick={handleSubmit}
                disabled={!category || !message || isSubmitting}
                className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 disabled:opacity-50 disabled:hover:bg-green-50 disabled:dark:hover:bg-green-900/30"
                Icon={ArrowRight}
                iconPlacement="right"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-sm h-4 w-4 border-b-2 border-current mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </ExpandButton>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
