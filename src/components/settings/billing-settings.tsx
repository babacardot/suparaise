'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Check, Crown } from 'lucide-react'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import { SUBSCRIPTION_PLANS, STRIPE_PRICE_IDS } from '@/lib/stripe/client'
import { cn } from '@/lib/actions/utils'

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

// Skeleton loading component that mimics the form layout
function BillingSettingsSkeleton() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold -mt-2 mb-2">Billing</h2>
        <p className="text-muted-foreground">
          Manage your subscription and billing information.
        </p>
      </div>

      <Separator className="flex-shrink-0" />

      <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
        <div className="space-y-6 pr-2">
          {/* Current Plan Skeleton */}
          <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
            <Skeleton className="h-4 w-80" />
          </div>

          {/* Subscription Plans Skeleton */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Pro Plan Skeleton */}
            <Card className="relative border-2 border-green-200 dark:border-green-800">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <Skeleton className="h-6 w-24" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20" />
                  <div className="text-right">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-4 w-16 mt-1" />
                  </div>
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-64" />
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <ul className="space-y-2 mb-6 flex-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-40" />
                    </li>
                  ))}
                </ul>
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>

            {/* Max Plan Skeleton */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <Skeleton className="h-6 w-16" />
                  <div className="text-right">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-4 w-16 mt-1" />
                  </div>
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-64" />
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <ul className="space-y-2 mb-6 flex-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-40" />
                    </li>
                  ))}
                </ul>
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BillingSettings() {
  const { user, subscription, subscriptionLoading, isSubscribed } = useUser()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Plan features for display
  const planFeatures = {
    pro_monthly: [
      '50 runs per month',
      'Access to 1,200 global funds',
      '3 parallel submissions',
      'Smart queuing system',
      'Agent customization',
      'Standard support',
    ],
    max_monthly: [
      '120 runs per month',
      'Access to 2,000+ global funds',
      '5 parallel submissions',
      'Advanced application tracking',
      'Integrations',
      'Priority support',
    ],
  }

  const handleSubscribe = async (
    plan: 'pro_monthly' | 'pro_yearly' | 'max_monthly' | 'max_yearly',
  ) => {
    playClickSound()
    setIsLoading(true)
    try {
      const priceId = STRIPE_PRICE_IDS[plan]

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          plan,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Subscription error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to start subscription process. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div></div>
  }

  if (subscriptionLoading) {
    return <BillingSettingsSkeleton />
  }

  const subscriptionStatus = subscription?.subscription_status
  const periodEndDate = subscription?.subscription_current_period_end
    ? new Date(subscription.subscription_current_period_end)
    : null

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold -mt-2 mb-2">Billing</h2>
        <p className="text-muted-foreground">
          Manage your subscription and billing information.
        </p>
      </div>

      <Separator className="flex-shrink-0" />

      <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
        <div className="space-y-6 pr-2">
          {/* Current Plan */}
          <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold -mt-1">Current plan</h3>
                {isSubscribed && subscription?.permission_level && (
                  <Badge
                    className={cn(
                      'border',
                      subscription.permission_level === 'MAX'
                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    )}
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    {subscription.permission_level}
                  </Badge>
                )}
              </div>
            </div>

            {isSubscribed ? (
              <p className="text-muted-foreground">
                Your subscription is {subscriptionStatus}
                {periodEndDate &&
                  ` and renews on ${periodEndDate.toLocaleDateString()}`}
              </p>
            ) : (
              <div className="space-y-2 -mt-2">
                <p className="text-muted-foreground">
                  You&apos;re on the free plan.
                </p>
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro for 50 runs per month, access to 1,200 global
                  funds, and advanced features.
                </p>
              </div>
            )}
          </div>

          {/* Subscription Plans */}
          {!isSubscribed && (
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Pro Plan */}
              <Card className="relative border-2 border-green-200 dark:border-green-800">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 text-sm font-medium px-3 py-1 rounded-sm">
                    Recommended
                  </span>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {SUBSCRIPTION_PLANS.pro_monthly.name}
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ${SUBSCRIPTION_PLANS.pro_monthly.price}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per month
                      </div>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {SUBSCRIPTION_PLANS.pro_monthly.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  <ul className="space-y-2 mb-6 flex-1">
                    {planFeatures.pro_monthly.map(
                      (feature: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ),
                    )}
                  </ul>
                  <Button
                    onClick={() => handleSubscribe('pro_monthly')}
                    disabled={isLoading}
                    className="w-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800"
                    variant="outline"
                  >
                    {isLoading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Start Pro
                  </Button>
                </CardContent>
              </Card>

              {/* Max Plan */}
              <Card className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {SUBSCRIPTION_PLANS.max_monthly.name}
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ${SUBSCRIPTION_PLANS.max_monthly.price}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per month
                      </div>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {SUBSCRIPTION_PLANS.max_monthly.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  <ul className="space-y-2 mb-6 flex-1">
                    {planFeatures.max_monthly.map(
                      (feature: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ),
                    )}
                  </ul>
                  <Button
                    onClick={() => handleSubscribe('max_monthly')}
                    disabled={isLoading}
                    className="w-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 hover:text-teal-800 dark:hover:text-teal-200 border border-teal-200 dark:border-teal-800"
                    variant="outline"
                  >
                    {isLoading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Go Max
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Subscription Management */}
          {isSubscribed && (
            <Card>
              <CardHeader>
                <CardTitle>Manage Subscription</CardTitle>
                <CardDescription>
                  Update payment method, view invoices, or cancel your
                  subscription.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" disabled>
                  Manage billing
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Coming soon
                  </Badge>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
