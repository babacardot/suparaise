'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import { Check } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'
import { dismissRecommendationAction } from '@/lib/actions/recommendations'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type Recommendation = {
  key: string
  text: string
}

interface RecommendationModalProps {
  startupId: string
  initialRecommendations: Recommendation[] | null
}

const playOpenSound = () => {
  try {
    const audio = new Audio('/sounds/light.mp3')
    audio.volume = 0.4
    audio.play().catch(console.error)
  } catch (error) {
    console.error('Error loading sound:', error)
  }
}

const playDismissSound = () => {
  try {
    const audio = new Audio('/sounds/completion.mp3')
    audio.volume = 0.4
    audio.play().catch(console.error)
  } catch (error) {
    console.error('Error loading sound:', error)
  }
}

export function RecommendationModal({
  startupId,
  initialRecommendations,
}: RecommendationModalProps) {
  const [recommendations, setRecommendations] = useState(
    initialRecommendations || [],
  )
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setRecommendations(initialRecommendations || [])
  }, [initialRecommendations])

  const handleDismiss = async (recommendationKey: string) => {
    playDismissSound()
    setRecommendations((prev) =>
      prev.filter((rec) => rec.key !== recommendationKey),
    )

    const result = await dismissRecommendationAction(
      startupId,
      recommendationKey,
    )

    if (result.success) {
      toast({
        title: 'Dismissed',
        variant: 'default',
        description: 'We won’t show you this recommendation again.',
        duration: 3000,
      })
    } else {
      setRecommendations(initialRecommendations || [])
      toast({
        title: 'Error',
        description: 'Could not dismiss recommendation. Please try again.',
        variant: 'destructive',
        duration: 3000,
      })
    }
  }

  if (!recommendations || recommendations.length === 0) {
    return null
  }

  return (
    <div className="hidden md:block">
      <DropdownMenu
        open={isOpen}
        onOpenChange={(open) => {
          if (open) {
            playOpenSound()
          }
          setIsOpen(open)
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative size-8 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent mt-2"
          >
            <LottieIcon animationData={animations.notification} size={18} />
            {recommendations.length > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-96 p-0 bg-sidebar border-sidebar-border rounded-sm select-none"
          side="bottom"
          align="end"
          sideOffset={10}
          onCopy={(e) => e.preventDefault()}
        >
          <div className="px-3 py-3">
            <ul className="space-y-2">
              {recommendations.map((rec) => (
                <li
                  key={rec.key}
                  className="flex items-center justify-between text-xs text-sidebar-foreground/80"
                >
                  <span>{rec.text}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(rec.key)}
                    className="h-7 w-7 p-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    aria-label="Dismiss recommendation"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-xs text-sidebar-foreground/70 px-3 py-2 border-t border-sidebar-border">
            Completing these actions will help you stand out.
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
