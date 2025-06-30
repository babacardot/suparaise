'use client'

import React, { useState, useEffect } from 'react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Settings } from 'lucide-react'
import { cn } from '@/lib/actions/utils'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import Image from 'next/image'

// Sound utility functions
const playSound = (soundFile: string) => {
  try {
    const audio = new Audio(soundFile)
    audio.volume = 0.3
    audio.play().catch((error) => {
      console.log('Could not play sound:', error)
    })
  } catch (error) {
    console.log('Error loading sound:', error)
  }
}

const playClickSound = () => {
  playSound('/sounds/light.mp3')
}

const playCompletionSound = () => {
  playSound('/sounds/completion.mp3')
}

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: 'connected' | 'available' | 'coming_soon'
  isPremium?: boolean
}

const integrations: Integration[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description:
      'Connect your Gmail for automated email outreach to angels and funds.',
    icon: (
      <Image
        src="/integrations/gmail.webp"
        alt="Gmail"
        className="h-full w-full object-cover"
        width={48}
        height={48}
      />
    ),
    status: 'coming_soon',
  },
  {
    id: 'slack',
    name: 'Slack',
    description:
      'Get real-time notifications about funding opportunities and responses.',
    icon: (
      <Image
        src="/integrations/slack.webp"
        alt="Slack"
        className="h-full w-full object-cover"
        width={48}
        height={48}
      />
    ),
    status: 'coming_soon',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description:
      'Link your LinkedIn to reach out to angels without leaving Suparaise.',
    icon: (
      <Image
        src="/integrations/linkedin.webp"
        alt="LinkedIn"
        className="h-full w-full object-cover"
        width={48}
        height={48}
      />
    ),
    status: 'coming_soon',
    isPremium: true,
  },
  {
    id: 'drive',
    name: 'Drive',
    description: 'Sync your Google Drive for document sharing.',
    icon: (
      <Image
        src="/integrations/drive.webp"
        alt="Google Drive"
        className="h-full w-full object-cover"
        width={48}
        height={48}
      />
    ),
    status: 'coming_soon',
    isPremium: true,
  },
]

// Skeleton loading component
function IntegrationSettingsSkeleton() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold -mt-2 mb-2">Integrations</h2>
        <p className="text-muted-foreground">
          Connect external services to supercharge your fundraising automation.
        </p>
      </div>

      <Separator className="flex-shrink-0" />

      <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
        <div className="grid gap-4 md:grid-cols-2 pr-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Skeleton className="h-12 w-12 rounded-sm" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function IntegrationSettings() {
  const { user, subscription } = useUser()
  const { toast } = useToast()
  const [dataLoading, setDataLoading] = useState(true)
  const [connectedIntegrations, setConnectedIntegrations] = useState<
    Set<string>
  >(new Set())
  const [connectingIntegration, setConnectingIntegration] = useState<
    string | null
  >(null)

  // Get permission level and check MAX access
  const permissionLevel = subscription?.permission_level || 'FREE'
  const hasMaxAccess = permissionLevel === 'MAX'

  // Redirect if user doesn't have MAX access
  useEffect(() => {
    if (!hasMaxAccess) {
      toast({
        variant: 'destructive',
        title: 'Access denied',
        description:
          'Integrations are only available for MAX users. Upgrade your plan.',
      })
    }
  }, [hasMaxAccess, toast])

  useEffect(() => {
    // Simulate loading user's connected integrations
    const timer = setTimeout(() => {
      setDataLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [user])

  if (!user) {
    return <div></div>
  }

  if (!hasMaxAccess) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 pb-4">
          <h2 className="text-2xl font-semibold -mt-2 mb-2">Integrations</h2>
          <p className="text-muted-foreground">
            Connect external services to supercharge your fundraising
            automation.
          </p>
        </div>

        <Separator className="flex-shrink-0" />

        <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
          <div className="pr-2">
            <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-sm h-10 w-10">
                        <LottieIcon
                          animationData={animations.star}
                          size={24}
                          customColor={[1.0, 0.75, 0.0]}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          MAX
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Upgrade to unlock
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground max-w-md mb-6">
                      Integrations are only available for MAX users. Upgrade
                      your plan to connect external services and automate your
                      fundraising process on additional channels.
                    </p>

                    {/* Preview of integrations */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm text-muted-foreground">
                        Currently available:
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-sm overflow-hidden">
                          <Image
                            src="/integrations/gmail.webp"
                            alt="Gmail"
                            className="h-full w-full opacity-60 object-cover"
                            width={20}
                            height={20}
                          />
                        </div>
                        <div className="h-5 w-5 rounded-sm overflow-hidden">
                          <Image
                            src="/integrations/slack.webp"
                            alt="Slack"
                            className="h-full w-full opacity-60 object-cover"
                            width={20}
                            height={20}
                          />
                        </div>
                        <div className="h-5 w-5 rounded-sm overflow-hidden">
                          <Image
                            src="/integrations/linkedin.webp"
                            alt="LinkedIn"
                            className="h-full w-full opacity-60 object-cover"
                            width={20}
                            height={20}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          + more coming soon.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-8">
                    <Button
                      onClick={() => {
                        playClickSound()
                        window.location.href = window.location.pathname.replace(
                          '/integrations',
                          '/billing',
                        )
                      }}
                      className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800"
                      variant="outline"
                    >
                      Upgrade
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (dataLoading) {
    return <IntegrationSettingsSkeleton />
  }

  const handleIntegrationToggle = async (
    integrationId: string,
    currentlyConnected: boolean,
  ) => {
    const integration = integrations.find((i) => i.id === integrationId)
    if (!integration) return

    // Check if integration is coming soon
    if (integration.status === 'coming_soon') {
      playClickSound()
      toast({
        title: 'Coming soon',
        description: `${integration.name} integration is not yet available. We're working on it!`,
      })
      return
    }

    // Check if this is a premium feature and user doesn't have access
    if (integration.isPremium && !hasMaxAccess) {
      playClickSound()
      toast({
        variant: 'destructive',
        title: 'Premium feature',
        description: `${integration.name} integration is only available for MAX users. Please upgrade your plan.`,
      })
      return
    }

    setConnectingIntegration(integrationId)
    playClickSound()

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (currentlyConnected) {
        setConnectedIntegrations((prev) => {
          const newSet = new Set(prev)
          newSet.delete(integrationId)
          return newSet
        })
        toast({
          title: 'Integration disconnected',
          description: `${integration.name} has been disconnected from your account.`,
        })
      } else {
        setConnectedIntegrations((prev) => new Set(prev).add(integrationId))
        playCompletionSound()
        toast({
          title: 'Integration connected',
          description: `${integration.name} has been successfully connected to your account.`,
        })
      }
    } catch (error) {
      console.error('Error toggling integration:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${currentlyConnected ? 'disconnect' : 'connect'} ${integration.name}. Please try again.`,
      })
    } finally {
      setConnectingIntegration(null)
    }
  }

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return null // Remove connected badge as green background is enough
      case 'available':
        return null // Remove available badge as requested
      case 'coming_soon':
        return (
          <Badge className="bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800">
            Coming Soon
          </Badge>
        )
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden select-none">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold -mt-2 mb-2">Integrations</h2>
        <p className="text-muted-foreground">
          Connect external services to supercharge your fundraising automation.
        </p>
      </div>

      <Separator className="flex-shrink-0" />

      <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
        <div className="grid gap-4 md:grid-cols-2 pr-2">
          {integrations.map((integration) => {
            const isConnected = connectedIntegrations.has(integration.id)
            const isConnecting = connectingIntegration === integration.id
            const requiresUpgrade = integration.isPremium && !hasMaxAccess
            const isComingSoon = integration.status === 'coming_soon'

            return (
              <Card
                key={integration.id}
                className={cn(
                  'transition-all duration-200',
                  isConnected &&
                    'bg-green-50/50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
                  requiresUpgrade && 'opacity-75',
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          'p-0 rounded-sm w-12 h-12 overflow-hidden flex items-center justify-center',
                          isConnected
                            ? 'bg-green-100 dark:bg-green-900/50'
                            : 'bg-muted',
                        )}
                      >
                        {integration.icon}
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {integration.name}
                        </CardTitle>
                        {getStatusBadge(
                          isConnected ? 'connected' : integration.status,
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleIntegrationToggle(integration.id, isConnected)
                      }
                      disabled={isConnecting || isComingSoon}
                      className={cn(
                        'relative inline-flex h-5 w-9 items-center rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
                        isConnected && !isComingSoon
                          ? 'bg-green-600'
                          : 'bg-gray-200 dark:bg-gray-700',
                        (isConnecting || isComingSoon) &&
                          'opacity-50 cursor-not-allowed',
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-3 w-3 transform rounded-sm bg-white transition-transform',
                          isConnected && !isComingSoon
                            ? 'translate-x-5'
                            : 'translate-x-1',
                        )}
                      />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription className="text-sm mb-3">
                    {integration.description}
                  </CardDescription>

                  {isConnected && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() => {
                          playClickSound()
                          toast({
                            title: 'Integration settings',
                            description: `Configure ${integration.name} integration settings.`,
                          })
                        }}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  )}

                  {isConnecting && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <LottieIcon
                          animationData={animations.autorenew}
                          size={14}
                          className="animate-spin"
                        />
                        Connecting...
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
