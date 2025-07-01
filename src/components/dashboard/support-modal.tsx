'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Button as ExpandButton } from '@/components/design/button-expand'
import { Textarea } from '@/components/ui/textarea'
import { ImagePlus, FileIcon, X, ArrowRight, Eraser } from 'lucide-react'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebar } from '@/components/ui/sidebar'

const categories = [
  { value: 'account', label: 'Account issues' },
  { value: 'billing', label: 'Billing' },
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
        className={`rounded-sm bg-background text-foreground p-2 cursor-pointer border border-sidebar-border hover:border-sidebar-border/50 transition-colors duration-200 flex items-center justify-between ${isOpen ? 'border-sidebar-border/50' : ''
          }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm">
          {value
            ? options.find((opt: SelectOption) => opt.value === value)?.label ||
            ''
            : 'Select category'}
        </span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
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
        <div className="rounded-sm absolute top-full left-0 w-full bg-background border border-sidebar-border mt-1 z-10 shadow-lg">
          {options.map((option: SelectOption) => (
            <div
              key={option.value}
              className="p-2 hover:bg-sidebar-accent cursor-pointer text-sm transition-colors duration-150"
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
  children: React.ReactNode // The trigger element
}

export default function SupportModal({ isOpen, onClose, children }: SupportModalProps) {
  const { currentStartupId } = useUser()
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isMobile } = useSidebar()

  const { user, supabase } = useUser()
  const { toast } = useToast()

  // Sound utility function
  const playClickSound = () => {
    try {
      const audio = new Audio('/sounds/light.mp3')
      audio.volume = 0.4
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
    setUploadProgress(0)
    setIsUploading(false)
  }

  const handleClear = () => {
    playClickSound()
    setCategory('')
    setMessage('')
    setImage(null)
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

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
          resetForm()
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-96 p-0 bg-sidebar border-sidebar-border rounded-sm max-h-[80vh] overflow-y-auto"
        side={isMobile ? 'bottom' : 'right'}
        align="center"
        sideOffset={18}
      >
        <div className="px-3 py-3">
          <div className="space-y-3">
            <div>
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
              <div className="relative">
                <Textarea
                  placeholder="Describe your issue or question in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="min-h-[120px] max-h-[175px] text-sm placeholder:text-sm pr-8 bg-background text-foreground resize-none rounded-sm w-full select-auto overflow-y-auto"
                  style={{
                    resize: 'vertical',
                    minHeight: '120px',
                    maxHeight: '175px',
                    transformOrigin: 'bottom',
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-sm absolute bottom-2 right-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-6 w-6"
                  onClick={() => {
                    playClickSound()
                    fileInputRef.current?.click()
                  }}
                >
                  <ImagePlus className="h-3 w-3" />
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
              <div className="border border-sidebar-border rounded-sm p-2 relative bg-background max-w-full overflow-hidden">
                <div className="flex items-center space-x-2">
                  <div
                    className={`rounded-sm p-1 flex-shrink-0 ${image.type.includes('png')
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}
                  >
                    <FileIcon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-medium truncate w-full">
                      {image.name}
                    </p>
                    <p className="text-xs text-sidebar-foreground/70">
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
                    className="text-sidebar-foreground/70 hover:text-sidebar-foreground flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                {isUploading && (
                  <div className="rounded-sm mt-2 w-full bg-sidebar-border h-1 overflow-hidden">
                    <div
                      className="bg-blue-500 h-1 transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <div className="flex space-x-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="px-2 rounded-sm w-8 h-8 transition-all duration-250 ease-out hover:bg-sidebar-accent active:scale-95"
                disabled={isSubmitting}
              >
                <Eraser className="h-3.5 w-3.5" />
              </Button>

              <ExpandButton
                onClick={handleSubmit}
                disabled={!category || !message || isSubmitting}
                className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm shadow-none px-3 py-1 h-8 text-xs disabled:opacity-50 disabled:hover:bg-green-50 disabled:dark:hover:bg-green-900/30 [&>div>svg]:h-3 [&>div>svg]:w-3"
                Icon={ArrowRight}
                iconPlacement="right"
                size="sm"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </ExpandButton>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
