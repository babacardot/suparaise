import * as React from 'react'
import { Loader2, Sparkles, PenTool } from 'lucide-react'
import { cn } from '@/lib/actions/utils'
import { Button } from '@/components/ui/button'
import { useToast } from '@/lib/hooks/use-toast'

// Minimum character requirements for AI enhancement
const MIN_CHAR_REQUIREMENTS = {
  // Grammar correction requirements (lower thresholds)
  grammar: {
    bio: 40,
    'description-short': 40,
    'description-medium': 80,
    'description-long': 120,
    traction: 40,
    market: 40,
    customers: 40,
    competitors: 40,
    instructions: 40,
  },
  // Full enhancement requirements (higher thresholds)
  full: {
    bio: 80,
    'description-short': 50,
    'description-medium': 120,
    'description-long': 180,
    traction: 80,
    market: 80,
    customers: 80,
    competitors: 80,
    instructions: 80,
  },
} as const

interface TextareaProps extends React.ComponentProps<'textarea'> {
  enableAI?: boolean
  aiFieldType?:
    | 'bio'
    | 'description-short'
    | 'description-medium'
    | 'description-long'
    | 'traction'
    | 'market'
    | 'customers'
    | 'competitors'
    | 'instructions'
  aiContext?: {
    companyName?: string
    industry?: string
    founderName?: string
    role?: string
  }
  onAIEnhance?: (enhancedText: string) => void
}

type EnhancementType = 'grammar' | 'full'

function Textarea({
  className,
  enableAI = false,
  aiFieldType,
  aiContext,
  onAIEnhance,
  value,
  onChange,
  ...props
}: TextareaProps) {
  const [isEnhancing, setIsEnhancing] = React.useState(false)
  const [enhancementType, setEnhancementType] =
    React.useState<EnhancementType | null>(null)
  const [suggestion, setSuggestion] = React.useState<string>('')
  const [showSuggestion, setShowSuggestion] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Cooldown logic: prevent repeated use within 2 minutes per field and type
  const COOLDOWN_MS = 2 * 60 * 1000
  const [lastUsedAt, setLastUsedAt] = React.useState<{
    grammar?: number
    full?: number
  }>({})

  const getRemainingCooldownMs = (type: EnhancementType) => {
    const last = lastUsedAt[type] || 0
    const elapsed = Date.now() - last
    return elapsed < COOLDOWN_MS ? COOLDOWN_MS - elapsed : 0
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const commitViaBlur = () => {
    // Ensure parent onBlur handlers run to save changes
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.blur()
      }
    }, 0)
  }

  const handleAIEnhance = async (type: EnhancementType) => {
    if (!aiFieldType || !value || typeof value !== 'string' || !value.trim()) {
      return
    }

    // Enforce cooldown per field and enhancement type
    const remaining = getRemainingCooldownMs(type)
    if (remaining > 0) {
      toast({
        variant: 'info',
        title: 'Please wait',
        description: `You can use ${type === 'grammar' ? 'Fix' : 'Enhance'} again in ${formatTime(remaining)} for this field.`,
      })
      return
    }

    setIsEnhancing(true)
    setEnhancementType(type)

    try {
      const response = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: value,
          fieldType: aiFieldType,
          enhancementType: type,
          context: aiContext,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to enhance text')
      }

      const { enhancedText } = await response.json()

      // Start cooldown on successful response regardless of whether text changed
      setLastUsedAt((prev) => ({ ...prev, [type]: Date.now() }))

      if (enhancedText && enhancedText.trim() !== value.trim()) {
        if (type === 'grammar') {
          // For grammar fixes, apply the change directly
          if (onAIEnhance) {
            onAIEnhance(enhancedText)
          }
          // Trigger blur to auto-save via parent onBlur
          commitViaBlur()
        } else {
          // For full enhancements, show the suggestion UI
          setSuggestion(enhancedText)
          setShowSuggestion(true)
        }
      }
    } catch (error) {
      console.error('AI enhancement error:', error)
    } finally {
      setIsEnhancing(false)
      setEnhancementType(null)
    }
  }

  const acceptSuggestion = () => {
    if (onAIEnhance && suggestion) {
      onAIEnhance(suggestion)
    }
    setSuggestion('')
    setShowSuggestion(false)
    // Trigger blur to auto-save via parent onBlur
    commitViaBlur()
  }

  const rejectSuggestion = () => {
    setSuggestion('')
    setShowSuggestion(false)
  }

  const currentLength =
    value && typeof value === 'string' ? value.trim().length : 0
  const grammarMinLength = aiFieldType
    ? MIN_CHAR_REQUIREMENTS.grammar[aiFieldType]
    : 0
  const fullMinLength = aiFieldType
    ? MIN_CHAR_REQUIREMENTS.full[aiFieldType]
    : 0

  const canUseGrammar = currentLength >= grammarMinLength
  const canUseFullEnhancement = currentLength >= fullMinLength
  const isGrammarCoolingDown = getRemainingCooldownMs('grammar') > 0
  const isFullCoolingDown = getRemainingCooldownMs('full') > 0

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          data-slot="textarea"
          className={cn(
            'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-background dark:bg-background flex field-sizing-content min-h-16 w-full rounded-sm border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className,
          )}
          value={value}
          onChange={onChange}
          {...props}
        />
      </div>

      {enableAI && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAIEnhance('grammar')}
              disabled={isEnhancing || !canUseGrammar || isGrammarCoolingDown}
              className="h-7 px-2 text-xs"
            >
              {isEnhancing && enhancementType === 'grammar' ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <PenTool className="h-2.5 w-2.5 mr-1" />
              )}
              Fix
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAIEnhance('full')}
              disabled={
                isEnhancing || !canUseFullEnhancement || isFullCoolingDown
              }
              className="h-7 px-2 text-xs"
            >
              {isEnhancing && enhancementType === 'full' ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Sparkles className="h-2.5 w-2.5 mr-1" />
              )}
              Enhance
            </Button>
          </div>

          {!canUseGrammar && !canUseFullEnhancement && (
            <p className="text-[9px] text-muted-foreground">
              {grammarMinLength - currentLength} more characters needed for
              grammar correction
            </p>
          )}

          {canUseGrammar && !canUseFullEnhancement && (
            <p className="text-[9px] text-muted-foreground">
              {fullMinLength - currentLength} more characters needed for
              enhancement
            </p>
          )}
        </div>
      )}

      {showSuggestion && suggestion && (
        <div className="border border-blue-200 dark:border-blue-800 rounded-sm p-3 bg-blue-50/50 dark:bg-blue-900/20">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {enhancementType === 'grammar'
                ? 'Grammar correction'
                : 'Enhancement'}{' '}
              suggestion
            </h4>
          </div>

          <div className="mb-3">
            <div className="text-xs text-muted-foreground mb-1">Current</div>
            <div className="text-xs p-2 bg-gray-100 dark:bg-gray-800 rounded border italic">
              {value}
            </div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-muted-foreground mb-1">Suggested</div>
            <div className="text-xs p-2 bg-blue-100 dark:bg-blue-900/30 rounded border">
              {suggestion}
            </div>
          </div>

          <div className="flex items-end justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={rejectSuggestion}
              className="h-7 px-3 text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-800 dark:hover:text-red-200 border border-red-200 dark:border-red-800 rounded-sm"
            >
              Reject
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={acceptSuggestion}
              className="h-7 px-3 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-800 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-800 rounded-sm"
            >
              Accept
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { Textarea }
export type { TextareaProps }
