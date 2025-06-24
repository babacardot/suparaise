import Stripe from 'stripe'
import { loadStripe, type Stripe as StripeJS } from '@stripe/stripe-js'

// Server-side Stripe instance - only initialize on server
let _stripe: Stripe | null = null

export const getServerStripe = () => {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be called on the server side')
  }

  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-05-28.basil',
      appInfo: {
        name: 'Suparaise',
        version: '1.0.0',
      },
    })
  }

  return _stripe
}

// Client-side Stripe instance
let stripePromise: Promise<StripeJS | null> | null = null

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Price IDs - these will be configured in Stripe dashboard
export const STRIPE_PRICE_IDS = {
  pro_monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!,
  pro_yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID!,
  max_monthly: process.env.NEXT_PUBLIC_STRIPE_MAX_MONTHLY_PRICE_ID!,
  max_yearly: process.env.NEXT_PUBLIC_STRIPE_MAX_YEARLY_PRICE_ID!,
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    description: 'Get started with agentic fundraising',
    price: 0,
    interval: 'month' as const,
    tier: 'starter' as const,
    features: [
      '3 funds applications per month',
      'Access to 100+ funds',
      'Claude 3.7 sonnet',
    ],
  },
  pro_monthly: {
    name: 'Pro',
    description: 'For startups actively fundraising',
    price: 25,
    interval: 'month' as const,
    tier: 'pro' as const,
    features: [
      '100 runs per month',
      'Access to 2000+ funds',
      'Claude 4 sonnet',
      'Agent personalization',
      'Standard support',
    ],
  },
  pro_yearly: {
    name: 'Pro Yearly',
    description: 'For startups actively fundraising',
    price: 300, // 25 * 12
    interval: 'year' as const,
    tier: 'pro' as const,
    features: [
      '100 runs per month',
      'Access to 2000+ funds',
      'Claude 4 sonnet',
      'Agent personalization',
      'Standard support',
      '2 months free',
    ],
  },
  max_monthly: {
    name: 'Max',
    description: 'For startups that need meetings now',
    price: 120,
    interval: 'month' as const,
    tier: 'max' as const,
    features: [
      '500 runs per month',
      'Full fund database',
      'Claude 4 sonnet',
      'Agent personalization',
      'Integrations',
      'Priority support',
    ],
  },
  max_yearly: {
    name: 'Max Yearly',
    description: 'For startups that need meetings now',
    price: 1440, // 120 * 12
    interval: 'year' as const,
    tier: 'max' as const,
    features: [
      '500 runs per month',
      'Full fund database',
      'Claude 4 sonnet',
      'Agent personalization',
      'Integrations',
      'Priority support',
      '2 months free',
    ],
  },
}
