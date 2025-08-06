'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Button as ExpandButton } from '@/components/design/button-expand'
import { Input } from '@/components/ui/input'
import { ArrowRight, Eraser } from 'lucide-react'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebar } from '@/components/ui/sidebar'

type SuggestionType = 'vc' | 'accelerator' | 'angel'

interface SuggestionModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode // The trigger element
}

export default function SuggestionModal({
  isOpen,
  onClose,
  children,
}: SuggestionModalProps) {
  const { currentStartupId } = useUser()
  const [suggestionType, setSuggestionType] = useState<SuggestionType>('vc')
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  // Validation functions
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidUrl = (url: string): boolean => {
    // Allow URLs with or without protocol
    const urlRegex =
      /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/
    return urlRegex.test(url)
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

    if (!name.trim()) {
      toast({
        variant: 'info',
        title: 'Missing information',
        description: 'Please enter the name of the entity you want to suggest.',
      })
      return
    }

    // Validate website URL if provided
    if (showWebsiteField && website.trim() && !isValidUrl(website.trim())) {
      toast({
        variant: 'info',
        title: 'Invalid website',
        description:
          'Please enter a valid website URL (e.g., https://www.example.com, www.example.com, or example.com).',
      })
      return
    }

    // Validate email if provided
    if (showEmailField && email.trim() && !isValidEmail(email.trim())) {
      toast({
        variant: 'info',
        title: 'Invalid email',
        description:
          'Please enter a valid email address (e.g., name@example.com).',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { error: suggestionError } = await supabase.rpc(
        'create_suggestion',
        {
          p_user_id: user.id,
          p_suggestion_type: suggestionType,
          p_name: name.trim(),
          p_website: website.trim() || undefined,
          p_email: email.trim() || undefined,
          p_description: undefined,
          p_startup_id: currentStartupId || undefined,
        },
      )

      if (suggestionError) {
        console.error('Error submitting suggestion:', suggestionError)
        toast({
          variant: 'destructive',
          title: 'Submission error',
          description:
            'There was a problem submitting your suggestion. Please try again later.',
        })
      } else {
        toast({
          title: 'Suggestion submitted',
          duration: 2000,
          variant: 'success',
          description: `Thank you for suggesting ${suggestionType === 'accelerator' || suggestionType === 'angel' ? 'an' : 'a'} ${suggestionType}! We'll review it soon.`,
        })
        resetForm()
        onClose()
      }
    } catch (error) {
      console.error('Error in suggestion submission:', error)
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
    setName('')
    setWebsite('')
    setEmail('')
    setSuggestionType('vc')
  }

  const handleClear = () => {
    playClickSound()
    resetForm()
  }

  const suggestionTypeLabels = {
    vc: 'Fund',
    accelerator: 'Accelerator',
    angel: 'Angel',
  }

  // Determine which fields to show based on suggestion type
  const showWebsiteField =
    suggestionType === 'vc' || suggestionType === 'accelerator'
  const showEmailField = suggestionType === 'angel'

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-96 p-0 bg-sidebar border-sidebar-border rounded-sm translate-y-1"
        side={isMobile ? 'bottom' : 'right'}
        align="center"
        sideOffset={18}
      >
        <div className="px-3 py-3">
          {/* Suggestion Type Selector */}
          <div className="flex space-x-1 mb-3 p-1 bg-background rounded-sm">
            {(Object.keys(suggestionTypeLabels) as SuggestionType[]).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => {
                    playClickSound()
                    setSuggestionType(type)
                  }}
                  className={`flex-1 px-2 py-1 text-xs rounded-sm transition-all duration-200 ${
                    suggestionType === type
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  {suggestionTypeLabels[type]}
                </button>
              ),
            )}
          </div>

          {/* Name Input - Always shown */}
          <Input
            placeholder={`Name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3 text-sm placeholder:text-sm bg-background text-foreground rounded-sm"
          />

          {/* Website Input - Only for VC Fund and Accelerator */}
          {showWebsiteField && (
            <Input
              placeholder="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="mb-3 text-sm placeholder:text-sm bg-background text-foreground rounded-sm"
            />
          )}

          {/* Email Input - Only for Angel Investor */}
          {showEmailField && (
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-3 text-sm placeholder:text-sm bg-background text-foreground rounded-sm"
            />
          )}

          <div className="flex justify-between items-center">
            <div className="text-xs text-sidebar-foreground/70">
              Suggest{' '}
              {suggestionType === 'accelerator' || suggestionType === 'angel'
                ? 'an'
                : 'a'}{' '}
              {suggestionTypeLabels[suggestionType].toLowerCase()}
            </div>

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
                disabled={!name.trim() || isSubmitting}
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
