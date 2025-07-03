'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Button as ExpandButton } from '@/components/design/button-expand'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight, Eraser } from 'lucide-react'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebar } from '@/components/ui/sidebar'

type Sentiment =
  | 'very_positive'
  | 'positive'
  | 'negative'
  | 'very_negative'
  | 'null'

const emojis: { [key in Sentiment]: string } = {
  very_positive: '🤩',
  positive: '🙂',
  negative: '🙁',
  very_negative: '🤬',
  null: '',
}

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode // The trigger element
}

export default function FeedbackModal({
  isOpen,
  onClose,
  children,
}: FeedbackModalProps) {
  const { currentStartupId } = useUser()
  const [message, setMessage] = useState('')
  const [sentiment, setSentiment] = useState<Sentiment>('null')
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

    if (!message.trim()) {
      toast({
        variant: 'info',
        title: 'Missing information',
        description: 'Please enter your feedback message.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { error: feedbackError } = await supabase.rpc('create_feedback', {
        p_user_id: user.id,
        p_sentiment: sentiment,
        p_message: message,
        p_startup_id: currentStartupId || null,
      })

      if (feedbackError) {
        console.error('Error submitting feedback:', feedbackError)
        toast({
          variant: 'destructive',
          title: 'Submission error',
          description:
            'There was a problem submitting your feedback. Please try again later.',
        })
      } else {
        toast({
          title: 'Feedback submitted',
          duration: 2000,
          variant: 'success',
          description: 'Thank you for your feedback! We appreciate your input.',
        })
        resetForm()
        onClose()
      }
    } catch (error) {
      console.error('Error in feedback submission:', error)
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
    setMessage('')
    setSentiment('null')
  }

  const handleClear = () => {
    playClickSound()
    setMessage('')
    setSentiment('null')
  }

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
        className="w-96 p-0 bg-sidebar border-sidebar-border rounded-sm"
        side={isMobile ? 'bottom' : 'right'}
        align="center"
        sideOffset={18}
      >
        <div className="px-3 py-3">
          <Textarea
            placeholder="Tell us what you think about this page."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px] max-h-[135px] mb-3 text-sm placeholder:text-sm bg-background text-foreground rounded-sm resize-none select-auto overflow-y-auto"
            style={{
              resize: 'vertical',
              minHeight: '100px',
              maxHeight: '135px',
              transformOrigin: 'bottom',
            }}
          />

          <div className="flex items-center justify-between">
            <div className="flex space-x-2 mr-3">
              {(Object.keys(emojis) as Sentiment[])
                .filter((key) => key !== 'null')
                .map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      playClickSound()
                      setSentiment(key)
                    }}
                    className={`text-xl w-8 h-8 rounded-sm transition-all duration-200 hover:bg-sidebar-accent border ${
                      sentiment === key
                        ? 'bg-sidebar-accent border-sidebar-border shadow-sm scale-105'
                        : 'border-transparent hover:border-sidebar-border/30'
                    }`}
                  >
                    {emojis[key]}
                  </button>
                ))}
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
                disabled={!message.trim() || isSubmitting}
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

        <div className="text-xs text-sidebar-foreground/70 px-3 py-2 border-t border-sidebar-border">
          Your feedback helps us improve the platform.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
