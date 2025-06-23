'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Check, Crown } from 'lucide-react'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import { SUBSCRIPTION_PLANS, STRIPE_PRICE_IDS } from '@/lib/stripe/client'

interface BillingData {
    is_subscribed: boolean
    subscription_status: string | null
    subscription_current_period_end: string | null
    stripe_customer_id: string | null
}

export default function BillingPage() {
    const { user, supabase } = useUser()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [billingData, setBillingData] = useState<BillingData | null>(null)
    const [dataLoading, setDataLoading] = useState(true)

    useEffect(() => {
        const fetchBillingData = async () => {
            if (!user) return

            setDataLoading(true)
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('is_subscribed, subscription_status, subscription_current_period_end, stripe_customer_id')
                    .eq('id', user.id)
                    .single()

                if (error) throw error

                setBillingData(data)
            } catch (error) {
                console.error('Error fetching billing data:', error)
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to load billing information.',
                })
            } finally {
                setDataLoading(false)
            }
        }

        fetchBillingData()
    }, [user, supabase, toast])

    const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
        setIsLoading(true)
        try {
            const priceId = plan === 'monthly' ? STRIPE_PRICE_IDS.monthly : STRIPE_PRICE_IDS.yearly

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
        return <div>Loading...</div>
    }

    if (dataLoading) {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="flex-shrink-0 pb-4">
                    <h2 className="text-2xl font-semibold -mt-2 mb-2">Billing</h2>
                    <p className="text-muted-foreground">
                        Manage your subscription and billing information.
                    </p>
                </div>
                <Separator className="flex-shrink-0" />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        )
    }

    const isSubscribed = billingData?.is_subscribed
    const subscriptionStatus = billingData?.subscription_status
    const periodEndDate = billingData?.subscription_current_period_end
        ? new Date(billingData.subscription_current_period_end)
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

            <div className="flex-1 overflow-auto pt-6 max-h-[60vh] hide-scrollbar">
                <div className="space-y-6 pr-2">
                    {/* Current Plan */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Current Plan
                                {isSubscribed && (
                                    <Badge className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                                        <Crown className="h-3 w-3 mr-1" />
                                        Pro
                                    </Badge>
                                )}
                            </CardTitle>
                            <CardDescription>
                                {isSubscribed
                                    ? `Your subscription is ${subscriptionStatus}${periodEndDate ? ` and renews on ${periodEndDate.toLocaleDateString()}` : ''}`
                                    : 'You are currently on the free plan'
                                }
                            </CardDescription>
                        </CardHeader>
                        {!isSubscribed && (
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Upgrade to Pro to unlock unlimited AI agent runs and advanced features.
                                </p>
                            </CardContent>
                        )}
                    </Card>

                    {/* Subscription Plans */}
                    {!isSubscribed && (
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Monthly Plan */}
                            <Card className="relative">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        {SUBSCRIPTION_PLANS.monthly.name}
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">${SUBSCRIPTION_PLANS.monthly.price}</div>
                                            <div className="text-sm text-muted-foreground">per month</div>
                                        </div>
                                    </CardTitle>
                                    <CardDescription>
                                        {SUBSCRIPTION_PLANS.monthly.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 mb-6">
                                        {SUBSCRIPTION_PLANS.monthly.features.map((feature, index) => (
                                            <li key={index} className="flex items-center gap-2 text-sm">
                                                <Check className="h-4 w-4 text-green-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        onClick={() => handleSubscribe('monthly')}
                                        disabled={isLoading}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Subscribe Monthly
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Yearly Plan */}
                            <Card className="relative border-primary">
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <Badge className="bg-primary text-primary-foreground">
                                        Best Value
                                    </Badge>
                                </div>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        {SUBSCRIPTION_PLANS.yearly.name}
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">${SUBSCRIPTION_PLANS.yearly.price}</div>
                                            <div className="text-sm text-muted-foreground">per year</div>
                                            <div className="text-xs text-green-600">Save $58/year</div>
                                        </div>
                                    </CardTitle>
                                    <CardDescription>
                                        {SUBSCRIPTION_PLANS.yearly.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 mb-6">
                                        {SUBSCRIPTION_PLANS.yearly.features.map((feature, index) => (
                                            <li key={index} className="flex items-center gap-2 text-sm">
                                                <Check className="h-4 w-4 text-green-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        onClick={() => handleSubscribe('yearly')}
                                        disabled={isLoading}
                                        className="w-full"
                                    >
                                        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Subscribe Yearly
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
                                    Update payment method, view invoices, or cancel your subscription.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" disabled>
                                    Manage Billing
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                        Coming Soon
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