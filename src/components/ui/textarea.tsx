import * as React from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/actions/utils'

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
  aiContext?: {
    companyName?: string
    industry?: string
    founderName?: string
    role?: string
  }
  onAIEnhance?: (enhancedText: string) => void
}

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
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleAIEnhance = async () => {
    if (!aiFieldType || !value || typeof value !== 'string' || !value.trim()) {
      return
    }

    setIsEnhancing(true)
    try {
      const response = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: value,
          fieldType: aiFieldType,
          context: aiContext,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to enhance text')
      }

      const { enhancedText } = await response.json()

      if (enhancedText && onAIEnhance) {
        onAIEnhance(enhancedText)
      }
    } catch (error) {
      console.error('AI enhancement error:', error)
      // Could add toast notification here
    } finally {
      setIsEnhancing(false)
    }
  }

  const hasContent =
    value && typeof value === 'string' && value.trim().length > 0

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        data-slot="textarea"
        className={cn(
          'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-background dark:bg-background flex field-sizing-content min-h-16 w-full rounded-sm border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          enableAI && hasContent && 'pr-12',
          className,
        )}
        value={value}
        onChange={onChange}
        {...props}
      />

      {enableAI && hasContent && (
        <button
          type="button"
          onClick={handleAIEnhance}
          disabled={isEnhancing}
          className={cn(
            'absolute right-2 top-2 h-8 w-8 rounded-sm bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-sm transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed',
            'hover:shadow-md hover:scale-105 active:scale-95',
          )}
          title="Enhance with AI"
        >
          {isEnhancing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  )
}

export { Textarea }
export type { TextareaProps }
