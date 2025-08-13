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
// Removed Badge from current plan display per request
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Check, Crown } from 'lucide-react'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import {
  SUBSCRIPTION_PLANS,
  STRIPE_PRICE_IDS,
  USAGE_BILLING_CONFIG,
} from '@/lib/stripe/client'
import { cn } from '@/lib/actions/utils'
import { useParams, useSearchParams } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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

const playCompletionSound = () => {
  playSound('/sounds/completion.mp3')
}

// Skeleton loading component that mimics the form layout
function BillingSettingsSkeleton() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold mt-3 md:-mt-2 mb-2">Billing</h2>
        <p className="text-foreground/80">
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
  const [loadingPlan, setLoadingPlan] = useState<
    'pro_monthly' | 'max_monthly' | null
  >(null)
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successPlan, setSuccessPlan] = useState<string>('')
  const [usageBillingData, setUsageBillingData] = useState({
    usageBillingEnabled: false,
    currentMonthUsageCost: 0,
    monthlySpendLimit: USAGE_BILLING_CONFIG.defaultSpendLimit,
    monthlyUsageSubmissionsCount: 0,
    totalUsageSubmissions: 0,
    monthlySubmissionsUsed: 0,
    monthlySubmissionsLimit: 0,
  })
  const [usageBillingLoading, setUsageBillingLoading] = useState(false)
  const [showSpendLimitInput, setShowSpendLimitInput] = useState(false)
  const [customSpendLimit, setCustomSpendLimit] = useState('')
  const [showLimitConfigurator, setShowLimitConfigurator] = useState(false)
  const [pendingSpendLimit, setPendingSpendLimit] = useState<number | null>(
    null,
  )
  const params = useParams()
  const searchParams = useSearchParams()
  const startupId = params.startupId as string

  // Lightweight fetch with timeout and auth cookie handling
  const fetchWithTimeout = async (
    input: RequestInfo | URL,
    init: RequestInit = {},
    timeoutMs = 15000,
  ) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(input, {
        ...init,
        signal: controller.signal,
        credentials: 'same-origin',
        cache: 'no-store',
      })
      return res
    } finally {
      clearTimeout(timer)
    }
  }

  // Fetch usage billing data
  React.useEffect(() => {
    const fetchUsageBillingData = async () => {
      if (!user?.id) return

      try {
        const response = await fetch('/api/usage-billing')
        if (!response.ok) return

        const data = await response.json()
        if (data && !data.error) {
          setUsageBillingData({
            usageBillingEnabled: data.usageBillingEnabled || false,
            currentMonthUsageCost: data.monthlyEstimatedUsageCost || 0,
            monthlySpendLimit:
              data.monthlySpendLimit || USAGE_BILLING_CONFIG.defaultSpendLimit,
            monthlyUsageSubmissionsCount:
              data.monthlyUsageSubmissionsCount || 0,
            totalUsageSubmissions: data.totalUsageSubmissions || 0,
            monthlySubmissionsUsed: data.monthlySubmissionsUsed || 0,
            monthlySubmissionsLimit: data.monthlySubmissionsLimit || 0,
          })
        }
      } catch (error) {
        console.error('Error fetching usage billing data:', error)
      }
    }

    fetchUsageBillingData()
  }, [user?.id])

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
      '20 applications per month',
      'Access to 500+ global funds',
      '3x faster with concurrent processing',
      'Background runs',
      'Agent customization',
    ],
    max_monthly: [
      '50 applications per month',
      'Full database access',
      '5x faster with concurrent processing',
      'Detailed submission analytics',
      'Full application transparency',
      'Priority support',
    ],
  }

  const handleSubscribe = async (plan: 'pro_monthly' | 'max_monthly') => {
    playClickSound()
    setLoadingPlan(plan)
    try {
      const priceId = STRIPE_PRICE_IDS[plan]

      const response = await fetchWithTimeout('/api/stripe/checkout', {
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

      if (response.status === 401) {
        toast({
          variant: 'info',
          title: 'Authentication required',
          description: 'Please sign in again to continue.',
        })
        throw new Error('Unauthorized')
      }

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
      setLoadingPlan(null)
    }
  }

  const handleToggleUsageBilling = async (spendLimit?: number) => {
    playClickSound()
    setUsageBillingLoading(true)

    try {
      const response = await fetchWithTimeout('/api/usage-billing/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enable: !usageBillingData.usageBillingEnabled,
          spendLimit: spendLimit || usageBillingData.monthlySpendLimit,
        }),
      })

      const data = await response.json()

      if (response.status === 401) {
        toast({
          variant: 'info',
          title: 'Authentication required',
          description: 'Please sign in again and retry.',
        })
        throw new Error('Unauthorized')
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update usage billing')
      }

      // Update local state
      setUsageBillingData((prev) => ({
        ...prev,
        usageBillingEnabled: !prev.usageBillingEnabled,
        monthlySpendLimit: spendLimit || prev.monthlySpendLimit,
      }))

      // Enter configurator when enabling; exit when disabling
      if (!usageBillingData.usageBillingEnabled) {
        setShowLimitConfigurator(true)
      } else {
        setShowLimitConfigurator(false)
      }

      playCompletionSound()
      toast({
        variant: 'success',
        title: 'Usage billing updated',
        description:
          data.message || 'Usage billing settings updated successfully.',
      })
    } catch (error) {
      console.error('Usage billing error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update usage billing settings.',
      })
    } finally {
      setUsageBillingLoading(false)
    }
  }

  const handleUpdateSpendLimit = async (limit: number) => {
    playClickSound()
    setUsageBillingLoading(true)

    try {
      const response = await fetchWithTimeout(
        '/api/usage-billing/spend-limit',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            spendLimit: limit,
          }),
        },
      )

      const data = await response.json()

      if (response.status === 401) {
        toast({
          variant: 'info',
          title: 'Authentication required',
          description: 'Please sign in again and retry.',
        })
        throw new Error('Unauthorized')
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update spend limit')
      }

      // Update local state
      setUsageBillingData((prev) => ({
        ...prev,
        monthlySpendLimit: limit,
      }))

      setShowSpendLimitInput(false)
      setCustomSpendLimit('')

      playCompletionSound()
      toast({
        variant: 'success',
        title: 'Spend limit updated',
        description: `Monthly spend limit set to $${limit}`,
      })
    } catch (error) {
      console.error('Spend limit error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update spend limit.',
      })
    } finally {
      setUsageBillingLoading(false)
    }
  }

  const handleManageBilling = async () => {
    playClickSound()
    setIsPortalLoading(true)
    try {
      // Build return URL based on current context
      const currentUrl = window.location.origin + window.location.pathname

      const response = await fetchWithTimeout('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: currentUrl,
        }),
      })

      const data = await response.json()

      if (response.status === 401) {
        toast({
          variant: 'info',
          title: 'Authentication required',
          description: 'Please sign in again to manage billing.',
        })
        throw new Error('Unauthorized')
      }

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

  const periodEndDate = subscription?.subscription_current_period_end
    ? new Date(subscription.subscription_current_period_end)
    : null

  return (
    <div className="h-full flex flex-col overflow-hidden select-none">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold mt-3 md:-mt-2 mb-2">Billing</h2>
        <p className="text-foreground/80">
          Manage your subscription and billing information.
        </p>
      </div>

      <Separator className="flex-shrink-0 max-w-[98.7%]" />

      <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
        <div className="space-y-6 pr-2">
          {/* Current Plan */}
          <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900/30 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-sm p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const plan = subscription?.permission_level
                  const wrapperClass = cn(
                    'p-2 rounded-sm shadow-sm border',
                    !plan || plan === 'FREE'
                      ? 'bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800'
                      : plan === 'MAX'
                        ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
                        : plan === 'ENTERPRISE'
                          ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800'
                          : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
                  )
                  const iconClass = cn(
                    'h-5 w-5',
                    !plan || plan === 'FREE'
                      ? 'text-zinc-600 dark:text-zinc-300'
                      : plan === 'MAX'
                        ? 'text-amber-700 dark:text-amber-300'
                        : plan === 'ENTERPRISE'
                          ? 'text-purple-700 dark:text-purple-300'
                          : 'text-blue-700 dark:text-blue-300',
                  )
                  return (
                    <div className={wrapperClass}>
                      <Crown className={iconClass} />
                    </div>
                  )
                })()}
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">Current plan</h3>
                </div>
              </div>
              {isSubscribed && (
                <div>
                  {(() => {
                    const plan = subscription?.permission_level
                    const buttonClass = cn(
                      'rounded-sm px-4 py-2 text-sm font-medium shadow-sm hover:shadow transition-all duration-200',
                      plan === 'MAX'
                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-800 dark:hover:text-amber-200 border border-amber-200 dark:border-amber-800'
                        : plan === 'ENTERPRISE'
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-800 dark:hover:text-purple-200 border border-purple-200 dark:border-purple-800'
                          : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-800 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-800',
                    )
                    return (
                      <Button
                        onClick={handleManageBilling}
                        disabled={isPortalLoading}
                        className={buttonClass}
                      >
                        {isPortalLoading && (
                          <Spinner className="h-3 w-3 mr-2" />
                        )}
                        {isPortalLoading ? 'Opening...' : 'Billing'}
                      </Button>
                    )
                  })()}
                </div>
              )}
            </div>

            {isSubscribed ? (
              <div className="space-y-2">
                <p className="text-sm text-foreground/80">
                  Your{' '}
                  <span className="font-semibold">
                    {subscription?.permission_level || 'PRO'}
                  </span>{' '}
                  subscription is <span className="font-semibold">active</span>
                  {periodEndDate ? (
                    <>
                      {' '}
                      and renews on{' '}
                      <span className="font-semibold">
                        {periodEndDate.toLocaleDateString()}
                      </span>
                      .
                    </>
                  ) : (
                    <>.</>
                  )}
                </p>
                <p className="text-xs text-foreground/80">
                  You can update your payment details, view your invoices, or
                  cancel your subscription anytime.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-foreground/80">
                  You&apos;re on the{' '}
                  <span className="font-medium text-foreground">free plan</span>
                  .
                </p>
                <p className="text-xs text-foreground/80">
                  Subscribe for more runs, expanded access, and advanced
                  features.
                </p>
              </div>
            )}
          </div>

          {/* Usage Billing Toggle - only for Pro+ users - placed below current plan */}
          {isSubscribed &&
            (subscription?.permission_level === 'PRO' ||
              subscription?.permission_level === 'MAX') && (
              <div
                className={cn(
                  'group relative rounded-sm border transition-all duration-200 p-6 shadow-sm',
                  'hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
                  usageBillingData.usageBillingEnabled &&
                    'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10',
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0">
                      <h3 className="font-medium text-base mt-[2px]">
                        Usage billing
                      </h3>
                    </div>
                    {!usageBillingData.usageBillingEnabled && (
                      <p className="text-sm text-foreground/80 mt-4 -mb-1">
                        Continue applying beyond your plan limits.
                      </p>
                    )}
                  </div>
                  <div className="ml-4 self-start">
                    {!usageBillingData.usageBillingEnabled ? (
                      <Button
                        onClick={() => {
                          setPendingSpendLimit(null)
                          setShowSpendLimitInput(false)
                          setCustomSpendLimit('')
                          handleToggleUsageBilling()
                        }}
                        disabled={usageBillingLoading}
                        className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm px-4 py-2 text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
                      >
                        {usageBillingLoading ? (
                          <span className="opacity-70">Enabling…</span>
                        ) : (
                          'Enable'
                        )}
                      </Button>
                    ) : !showLimitConfigurator ? (
                      <Button
                        onClick={() => handleToggleUsageBilling()}
                        disabled={usageBillingLoading}
                        className="bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:text-pink-800 dark:hover:text-pink-200 border border-pink-200 dark:border-pink-800 rounded-sm px-4 py-2 text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
                      >
                        {usageBillingLoading ? (
                          <span className="opacity-70">Disabling…</span>
                        ) : (
                          'Disable'
                        )}
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* Full-width body below header */}
                {usageBillingData.usageBillingEnabled ? (
                  showLimitConfigurator ? (
                    <div className="space-y-2 mt-3">
                      <p className="text-xs text-foreground/80 mb-2">
                        Set monthly spend limit:
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {[10, 20, 50, 100].map((limit) => (
                          <button
                            key={limit}
                            onClick={() => {
                              setPendingSpendLimit(limit)
                              setShowSpendLimitInput(false)
                              setCustomSpendLimit('')
                            }}
                            disabled={usageBillingLoading}
                            className={cn(
                              'px-3 py-1 text-xs rounded border transition-colors',
                              pendingSpendLimit === limit
                                ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                                : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
                              usageBillingLoading &&
                                'opacity-50 cursor-not-allowed',
                            )}
                          >
                            ${limit}
                          </button>
                        ))}
                        {!showSpendLimitInput ? (
                          <button
                            onClick={() => {
                              setShowSpendLimitInput(true)
                              setPendingSpendLimit(null)
                            }}
                            disabled={usageBillingLoading}
                            className={cn(
                              'px-3 py-1 text-xs rounded border transition-colors',
                              'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
                              usageBillingLoading &&
                                'opacity-50 cursor-not-allowed',
                              // make it appear selected when in custom mode with a valid value pending via custom
                              showSpendLimitInput && customSpendLimit
                                ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                                : '',
                            )}
                          >
                            Custom
                          </button>
                        ) : (
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={customSpendLimit}
                            onChange={(e) => {
                              const digitsOnly = e.target.value.replace(
                                /\D/g,
                                '',
                              )
                              if (digitsOnly === '') {
                                setCustomSpendLimit('')
                                return
                              }
                              const parsed = Math.min(
                                1000,
                                parseInt(digitsOnly, 10),
                              )
                              setCustomSpendLimit(String(parsed))
                            }}
                            onFocus={() => setPendingSpendLimit(null)}
                            placeholder="Custom"
                            className="px-3 py-1 text-xs rounded border bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 w-16 focus:w-16 focus:outline-none focus:ring-0"
                          />
                        )}
                        <button
                          onClick={() => {
                            const limit = showSpendLimitInput
                              ? parseFloat(customSpendLimit)
                              : (pendingSpendLimit ?? NaN)
                            if (!Number.isFinite(limit)) return
                            if (limit >= 5 && limit <= 1000) {
                              handleUpdateSpendLimit(limit)
                              setShowLimitConfigurator(false)
                              setPendingSpendLimit(null)
                            }
                          }}
                          disabled={
                            usageBillingLoading ||
                            (!showSpendLimitInput &&
                              pendingSpendLimit === null) ||
                            (showSpendLimitInput && !customSpendLimit)
                          }
                          className={cn(
                            'ml-1 px-3 py-1 text-xs rounded-sm border font-medium shadow-sm hover:shadow transition-all duration-200',
                            'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border-green-200 dark:border-green-800',
                            usageBillingLoading &&
                              'opacity-50 cursor-not-allowed',
                          )}
                        >
                          Set limit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-[6px]">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-foreground">
                          ${usageBillingData.currentMonthUsageCost.toFixed(0)} /
                          ${usageBillingData.monthlySpendLimit.toFixed(0)}
                        </span>
                      </div>
                      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-xs overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all duration-500 ease-out rounded-full',
                            'bg-gradient-to-r from-emerald-500 to-emerald-600',
                          )}
                          style={{
                            width:
                              usageBillingData.monthlySpendLimit > 0
                                ? `${Math.min((usageBillingData.currentMonthUsageCost / usageBillingData.monthlySpendLimit) * 100, 100)}%`
                                : '0%',
                          }}
                        />
                      </div>
                      <div className="flex justify-end">
                        <div className="flex items-center gap-1">
                          {usageBillingData.monthlySubmissionsLimit > 0 &&
                            usageBillingData.monthlySubmissionsUsed <
                              usageBillingData.monthlySubmissionsLimit && (
                              <span className="text-[8px] text-emerald-600 dark:text-emerald-400">
                                Monthly quota is used first before usage billing
                                starts
                              </span>
                            )}
                          {usageBillingData.currentMonthUsageCost > 0 && (
                            <>
                              {usageBillingData.monthlySubmissionsLimit > 0 &&
                                usageBillingData.monthlySubmissionsUsed <
                                  usageBillingData.monthlySubmissionsLimit && (
                                  <span className="text-[8px] text-foreground/80">
                                    ·
                                  </span>
                                )}
                              <span className="text-[8px] text-foreground/80">
                                Usage charges this month
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {!(
                        usageBillingData.monthlySubmissionsLimit > 0 &&
                        usageBillingData.monthlySubmissionsUsed <
                          usageBillingData.monthlySubmissionsLimit
                      ) && (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 space-y-1">
                          <p>
                            Plan quota used:{' '}
                            {usageBillingData.monthlySubmissionsUsed}/
                            {usageBillingData.monthlySubmissionsLimit}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                ) : null}
              </div>
            )}

          {/* Subscription Management card removed; action moved into Current plan */}

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
                      <div className="text-xs text-foreground/80">
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
                    disabled={loadingPlan === 'pro_monthly'}
                    className="w-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 font-medium py-2.5 rounded-sm shadow-sm hover:shadow transition-all duration-200"
                    variant="outline"
                  >
                    {loadingPlan === 'pro_monthly' && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {loadingPlan === 'pro_monthly' ? '' : 'Start Pro'}
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
                      <div className="text-xs text-foreground/80">
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
                          <Check className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                          {feature}
                        </li>
                      ),
                    )}
                  </ul>
                  <Button
                    onClick={() => handleSubscribe('max_monthly')}
                    disabled={loadingPlan === 'max_monthly'}
                    className="w-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-800 dark:hover:text-amber-200 border border-amber-200 dark:border-amber-800 font-medium py-2.5 rounded-sm shadow-sm hover:shadow transition-all duration-200"
                    variant="outline"
                  >
                    {loadingPlan === 'max_monthly' && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {loadingPlan === 'max_monthly' ? '' : 'Go Max'}
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
                      <div className="text-xs text-foreground/80">
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
                          <Check className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                          {feature}
                        </li>
                      ),
                    )}
                  </ul>
                  <Button
                    onClick={() => handleSubscribe('max_monthly')}
                    disabled={loadingPlan === 'max_monthly'}
                    className="w-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-800 dark:hover:text-amber-200 border border-amber-200 dark:border-amber-800 font-medium py-2.5 rounded-sm shadow-sm hover:shadow transition-all duration-200"
                    variant="outline"
                  >
                    {loadingPlan === 'max_monthly' && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {loadingPlan === 'max_monthly' ? '' : 'Go Max'}
                  </Button>
                </CardContent>
              </Card>
              {/* Enterprise Plan */}
              <Card className="relative shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xl translate-y-3 font-semibold">
                      Enterprise
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold"></div>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-sm mt-6">
                    Volume discounts available
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-full flex-1">
                  <ul className="space-y-2 mb-6 flex-1">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                      500+ fund applications per month
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                      Autopilot mode
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                      Up to 25 parallel submissions
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                      Premium support
                    </li>
                  </ul>
                  <Button
                    asChild
                    onClick={playClickSound}
                    className="w-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-800 dark:hover:text-purple-200 border border-purple-200 dark:border-purple-800 font-medium py-2.5 rounded-sm shadow-sm hover:shadow transition-all duration-200"
                    variant="outline"
                  >
                    <a href="mailto:hello@suparaise.com">Contact sales</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : subscription?.permission_level === 'MAX' ? (
            <div className="relative flex flex-col rounded-sm border p-8 w-full shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="text-left">
                  <h3 className="text-2xl font-semibold">Enterprise</h3>
                  <p className="text-sm text-foreground/80 mt-4">
                    Volume discounts available
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="size-4 shrink-0 mt-0.5 text-purple-700 dark:text-purple-300" />
                  500+ fund applications per month
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="size-4 shrink-0 mt-0.5 text-purple-700 dark:text-purple-300" />
                  Autopilot mode
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="size-4 shrink-0 mt-0.5 text-purple-700 dark:text-purple-300" />
                  Up to 25 parallel submissions
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="size-4 shrink-0 mt-0.5 text-purple-700 dark:text-purple-300" />
                  Premium support
                </div>
              </div>

              <Button
                asChild
                onClick={playClickSound}
                className="w-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-800 dark:hover:text-purple-200 border border-purple-200 dark:border-purple-800 font-medium py-2.5 rounded-sm shadow-sm hover:shadow transition-all duration-200"
                variant="outline"
              >
                <a href="mailto:hello@suparaise.com">Contact sales</a>
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent
          className="max-w-md"
          showCloseButton={false}
          variant="slide-up"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Subscription activated</DialogTitle>
            <DialogDescription>
              Your subscription is now active.
            </DialogDescription>
          </DialogHeader>
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
                      50 applications per month
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      Full database access
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      5x faster with concurrent processing
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      Detailed submission analytics
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      Full application transparency
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
                      20 applications per month
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      Access to 500+ global funds
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      3x faster with concurrent processing
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

            {(() => {
              const sp = successPlan.toLowerCase()
              const colorClasses = sp.includes('max')
                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-800 dark:hover:text-amber-200 border border-amber-200 dark:border-amber-800'
                : sp.includes('enterprise')
                  ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-800 dark:hover:text-purple-200 border border-purple-200 dark:border-purple-800'
                  : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-800 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-800'
              return (
                <Button
                  onClick={() => {
                    playCompletionSound()
                    setShowSuccessModal(false)
                  }}
                  size="lg"
                  className={cn(
                    'w-full rounded-sm font-medium py-3 shadow-sm hover:shadow transition-all duration-200',
                    colorClasses,
                  )}
                  variant="outline"
                >
                  Continue
                </Button>
              )
            })()}
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
