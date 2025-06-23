'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Button as ExpandButton } from '@/components/design/button-expand'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight, Eraser } from 'lucide-react'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

type Sentiment =
  | 'very_positive'
  | 'positive'
  | 'negative'
  | 'very_negative'
  | 'null'

const emojis: { [key in Sentiment]: string } = {
  very_positive: '😀',
  positive: '🙂',
  negative: '🙁',
  very_negative: '😞',
  null: '',
}

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { currentStartupId } = useUser()
  const [message, setMessage] = useState('')
  const [sentiment, setSentiment] = useState<Sentiment>('null')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        if (!isSubmitted) {
          playClickSound()
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
        variant: 'destructive',
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
          variant: 'default',
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
    setIsSubmitted(false)
  }

  const handleClear = () => {
    playClickSound()
    setMessage('')
    setSentiment('null')
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-background border border-border shadow-lg z-50 rounded-sm sm:max-w-md w-full max-w-lg"
          ref={formRef}
        >
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Help us improve by sharing your thoughts and suggestions.
              </p>
            </div>

            <Textarea
              placeholder="Tell us what you think about this page."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] mb-4 text-sm placeholder:text-sm bg-white dark:bg-[#121317] text-gray-900 dark:text-gray-100 rounded-sm resize-y"
            />

            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                {(Object.keys(emojis) as Sentiment[])
                  .filter((key) => key !== 'null')
                  .map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        playClickSound()
                        setSentiment(key)
                      }}
                      className={`text-lg w-10 h-10 rounded-sm transition-all duration-200 hover:bg-background border ${
                        sentiment === key
                          ? 'bg-background border-border shadow-sm scale-105'
                          : 'border-transparent hover:border-border/30'
                      }`}
                    >
                      {emojis[key]}
                    </button>
                  ))}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleClear}
                  className="px-2 rounded-sm w-8 transition-all duration-250 ease-out hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30] active:scale-95"
                  disabled={isSubmitting}
                >
                  <Eraser className="h-4 w-4" />
                </Button>

                <ExpandButton
                  onClick={handleSubmit}
                  disabled={!message.trim() || isSubmitting}
                  className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm shadow-none px-4 disabled:opacity-50 disabled:hover:bg-green-50 disabled:dark:hover:bg-green-900/30"
                  Icon={ArrowRight}
                  iconPlacement="right"
                  size="default"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </ExpandButton>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 p-2 border-t border-gray-200 dark:border-gray-700">
            Your feedback helps us improve the platform.
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
