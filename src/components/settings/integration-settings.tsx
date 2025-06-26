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
import { Switch } from '@/components/ui/switch'
import { CheckIcon, Settings } from 'lucide-react'
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
      'Connect your Gmail account for automated email outreach to VCs',
    icon: (
      <Image
        src="/integrations/gmail.webp"
        alt="Gmail"
        className="h-6 w-6"
        width={24}
        height={24}
      />
    ),
    status: 'available',
  },
  {
    id: 'slack',
    name: 'Slack',
    description:
      'Get real-time notifications about funding opportunities and responses',
    icon: (
      <Image
        src="/integrations/slack.webp"
        alt="Slack"
        className="h-6 w-6"
        width={24}
        height={24}
      />
    ),
    status: 'available',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description:
      'Sync your LinkedIn profile and find VC contacts automatically',
    icon: (
      <Image
        src="/integrations/linkedin.webp"
        alt="LinkedIn"
        className="h-6 w-6"
        width={24}
        height={24}
      />
    ),
    status: 'available',
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
          {[1, 2, 3].map((i) => (
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

  // Get permission level and check PRO access
  const permissionLevel = subscription?.permission_level || 'FREE'
  const hasProAccess = permissionLevel === 'PRO' || permissionLevel === 'MAX'

  // Redirect if user doesn't have PRO access
  useEffect(() => {
    if (!hasProAccess) {
      toast({
        variant: 'destructive',
        title: 'Access denied',
        description:
          'Integrations are only available for PRO and MAX users. Upgrade your plan.',
      })
    }
  }, [hasProAccess, toast])

  useEffect(() => {
    // Simulate loading user's connected integrations
    const timer = setTimeout(() => {
      setDataLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [user])

  if (!user) {
    return <div>Loading...</div>
  }

  if (!hasProAccess) {
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
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-sm h-6 w-6">
                        <LottieIcon
                          animationData={animations.star}
                          size={24}
                          customColor={[0.2, 0.4, 0.9]}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          PRO+
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Upgrade to unlock
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground max-w-md mb-6">
                      Integrations are only available for PRO and MAX users.
                      Upgrade your plan to connect external services and
                      automate your fundraising process on additional channels.
                    </p>

                    {/* Preview of integrations */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm text-muted-foreground">
                        Currently available:
                      </span>
                      <div className="flex items-center gap-2">
                        <Image
                          src="/integrations/gmail.webp"
                          alt="Gmail"
                          className="h-5 w-5 opacity-60 rounded-sm"
                          width={20}
                          height={20}
                        />
                        <Image
                          src="/integrations/slack.webp"
                          alt="Slack"
                          className="h-5 w-5 opacity-60 rounded-sm"
                          width={20}
                          height={20}
                        />
                        <Image
                          src="/integrations/linkedin.webp"
                          alt="LinkedIn"
                          className="h-5 w-5 opacity-60 rounded-sm"
                          width={20}
                          height={20}
                        />
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

    // Check if this is a premium feature and user doesn't have access
    if (integration.isPremium && !hasProAccess) {
      playClickSound()
      toast({
        variant: 'destructive',
        title: 'Premium feature',
        description: `${integration.name} integration is only available for PRO and MAX users. Please upgrade your plan.`,
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
        return (
          <Badge className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
            <CheckIcon className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )
      case 'available':
        return (
          <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
            Available
          </Badge>
        )
      case 'coming_soon':
        return (
          <Badge className="bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800">
            Coming Soon
          </Badge>
        )
    }
  }

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
          {integrations.map((integration) => {
            const isConnected = connectedIntegrations.has(integration.id)
            const isConnecting = connectingIntegration === integration.id
            const requiresUpgrade = integration.isPremium && !hasProAccess

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
                    <div className="flex items-start space-x-3">
                      <div
                        className={cn(
                          'p-2 rounded-sm',
                          isConnected
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {integration.icon}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">
                            {integration.name}
                          </CardTitle>
                          {integration.isPremium && (
                            <Badge className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                              PRO
                            </Badge>
                          )}
                        </div>
                        {getStatusBadge(
                          isConnected ? 'connected' : integration.status,
                        )}
                      </div>
                    </div>

                    <Switch
                      checked={isConnected}
                      onCheckedChange={() =>
                        handleIntegrationToggle(integration.id, isConnected)
                      }
                      disabled={isConnecting}
                    />
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
