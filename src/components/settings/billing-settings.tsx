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
import { useParams, useSearchParams } from 'next/navigation'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { motion } from 'framer-motion'
import Image from 'next/image'

import Spinner from '../ui/spinner'

// Sound utility functions
const playSound = (soundFile: string) => {
  try {
    const audio = new Audio(soundFile)
    audio.volume = 0.4
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

      <Separator className="flex-shrink-0 max-w-[98.7%]" />

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
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successPlan, setSuccessPlan] = useState<string>('')
  const params = useParams()
  const searchParams = useSearchParams()
  const startupId = params.startupId as string

  // Check for success parameter from Stripe redirect
  React.useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const plan = searchParams.get('plan')

    if (success === 'true' && plan) {
      setShowSuccessModal(true)
      setSuccessPlan(plan)
      playSound('/sounds/completion.mp3')
    } else if (canceled === 'true') {
      toast({
        title: 'Payment canceled',
        variant: 'info',
        description: 'No charges were made. You can try again anytime.',
      })
    }

    // Clean up URL parameters
    if (success || canceled) {
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      url.searchParams.delete('canceled')
      url.searchParams.delete('plan')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams, toast])

  // Plan features for display
  const planFeatures = {
    pro_monthly: [
      '50 runs per month',
      'Access to 1,200 global funds',
      '3 parallel submissions',
      'Smart queuing system',
      'Agent customization',
    ],
    max_monthly: [
      '125 runs per month',
      'Access to 2,000+ global funds',
      '5 parallel submissions',
      'Advanced application tracking',
      'Developer mode',
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
          startupId,
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

  const handleManageBilling = async () => {
    playClickSound()
    setIsPortalLoading(true)
    try {
      // Build return URL based on current context
      const currentUrl = window.location.origin + window.location.pathname

      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: currentUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session')
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url
    } catch (error) {
      console.error('Portal error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to open billing portal. Please try again.',
      })
    } finally {
      setIsPortalLoading(false)
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
    <div className="h-full flex flex-col overflow-hidden select-none">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold -mt-2 mb-2">Billing</h2>
        <p className="text-muted-foreground">
          Manage your subscription and billing information.
        </p>
      </div>

      <Separator className="flex-shrink-0 max-w-[98.7%]" />

      <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
        <div className="space-y-6 pr-2">
          {/* Current Plan */}
          <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900/30 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-sm p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-sm bg-white dark:bg-zinc-800 shadow-sm">
                  <Crown className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">Current plan</h3>
                  {isSubscribed && subscription?.permission_level && (
                    <Badge
                      className={cn(
                        'border text-xs font-medium',
                        subscription.permission_level === 'MAX'
                          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                      )}
                    >
                      {subscription.permission_level}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {isSubscribed ? (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Your subscription is{' '}
                  <span className="font-medium text-foreground">
                    {subscriptionStatus}
                  </span>
                  {periodEndDate &&
                    ` and renews on ${periodEndDate.toLocaleDateString()}`}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  You&apos;re on the{' '}
                  <span className="font-medium text-foreground">free plan</span>
                  .
                </p>
                <p className="text-xs text-muted-foreground">
                  Subscribe for more runs, expanded access, and advanced
                  features.
                </p>
              </div>
            )}
          </div>

          {/* Subscription Management - moved above pricing for Pro+ users */}
          {isSubscribed && (
            <Card className={cn(
              "p-6 shadow-lg border-l-4",
              subscription?.permission_level === 'MAX'
                ? "border-l-amber-500 dark:border-l-amber-400"
                : "border-l-blue-500 dark:border-l-blue-400"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold leading-none tracking-tight">
                    Manage subscription
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2">
                    Update your payment details, view invoices, or cancel
                    subscription.
                  </p>
                </div>
                <div>
                  <Button
                    onClick={handleManageBilling}
                    disabled={isPortalLoading}
                    className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm px-6 py-2 text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
                  >
                    {isPortalLoading && <Spinner className="h-4 w-4 mr-2" />}
                    {isPortalLoading ? 'Opening...' : 'Manage Billing'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Subscription Plans & Upgrades */}
          {!isSubscribed ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pro Plan */}
              <Card className="relative border-2 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 text-sm font-medium px-4 py-1.5 rounded-sm shadow-sm">
                    Recommended
                  </span>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xl font-semibold">
                      {SUBSCRIPTION_PLANS.pro_monthly.name}
                    </span>
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
                    className="w-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 font-medium py-2.5 rounded-sm shadow-sm hover:shadow transition-all duration-200"
                    variant="outline"
                  >
                    {isLoading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {isLoading ? 'Processing...' : 'Start Pro'}
                  </Button>
                </CardContent>
              </Card>

              {/* Max Plan */}
              <Card className="relative shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xl font-semibold">
                      {SUBSCRIPTION_PLANS.max_monthly.name}
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ${SUBSCRIPTION_PLANS.max_monthly.price}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per month
                      </div>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-sm">
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
                    className="w-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 hover:text-teal-800 dark:hover:text-teal-200 border border-teal-200 dark:border-teal-800 font-medium py-2.5 rounded-sm shadow-sm hover:shadow transition-all duration-200"
                    variant="outline"
                  >
                    {isLoading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {isLoading ? 'Processing...' : 'Go Max'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : subscription?.permission_level === 'PRO' ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Max Plan */}
              <Card className="relative shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xl font-semibold">
                      {SUBSCRIPTION_PLANS.max_monthly.name}
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ${SUBSCRIPTION_PLANS.max_monthly.price}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per month
                      </div>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-sm">
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
                    className="w-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 hover:text-teal-800 dark:hover:text-teal-200 border border-teal-200 dark:border-teal-800 font-medium py-2.5 rounded-sm shadow-sm hover:shadow transition-all duration-200"
                    variant="outline"
                  >
                    {isLoading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {isLoading ? 'Processing...' : 'Go Max'}
                  </Button>
                </CardContent>
              </Card>
              {/* Enterprise Plan */}
              <Card className="relative shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xl font-semibold">Enterprise</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold">Custom</div>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-sm mt-5">
                    Volume discounts available
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-full flex-1">
                  <ul className="space-y-2 mb-6 flex-1">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      500+ fund applications per month
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Up to 25 parallel submissions
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Premium support
                    </li>
                  </ul>
                  <Button
                    asChild
                    className="w-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-800 dark:hover:text-purple-200 border border-purple-200 dark:border-purple-800 font-medium py-2.5 rounded-sm shadow-sm hover:shadow transition-all duration-200"
                    variant="outline"
                  >
                    <a href="mailto:hello@suparaise.com">Contact Sales</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : subscription?.permission_level === 'MAX' ? (
            <div className="relative flex flex-col rounded-sm border p-8 w-full shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="text-left">
                  <h3 className="text-2xl font-semibold">Enterprise</h3>
                  <p className="text-sm text-muted-foreground mt-4">
                    Volume discounts available
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold">Custom</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                  500+ fund applications per month
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                  Up to 25 parallel submissions
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                  Premium support
                </div>
              </div>

              <Button
                asChild
                className="w-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-800 dark:hover:text-purple-200 border border-purple-200 dark:border-purple-800 font-medium py-2.5 rounded-sm shadow-sm hover:shadow transition-all duration-200"
                variant="outline"
              >
                <a href="mailto:hello@suparaise.com">Contact Sales</a>
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-4 text-center"
          >
            <div className="relative w-40 h-40 -mb-2">
              <Image
                src={
                  successPlan.includes('max')
                    ? '/random/max.svg'
                    : '/random/going_live.svg'
                }
                alt="Subscription activated"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Welcome to {successPlan.includes('max') ? 'Max' : 'Pro'}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400 max-w-md">
                Your subscription is now active.
                <br />
                Here are the new features you have unlocked:
              </p>
            </div>

            <div className="w-full rounded-sm border bg-zinc-50 dark:bg-zinc-900/30 p-4 text-left">
              <ul className="space-y-2 text-sm">
                {successPlan.includes('max') ? (
                  <>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      125 runs per month
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      Access to 2,000+ global funds
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      5 parallel submissions
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      Advanced application tracking
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      Developer mode
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      Priority support
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      50 runs per month
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      Access to 1,200+ global funds
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      3 parallel submissions
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      Background runs
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      Agent customization
                    </li>
                  </>
                )}
              </ul>
            </div>

            <Button
              onClick={() => setShowSuccessModal(false)}
              size="lg"
              className="w-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm font-medium py-3 shadow-sm hover:shadow transition-all duration-200"
              variant="outline"
            >
              Continue
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
