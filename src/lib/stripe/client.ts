import Stripe from 'stripe'
import { loadStripe, type Stripe as StripeJS } from '@stripe/stripe-js'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
  appInfo: {
    name: 'Suparaise',
    version: '1.0.0',
  },
})

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
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID!,
  yearly: process.env.STRIPE_YEARLY_PRICE_ID!,
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly Pro',
    description: 'Full access to Suparaise AI agents',
    price: 29,
    interval: 'month' as const,
    features: [
      'Unlimited AI agent runs',
      'Priority support',
      'Advanced targeting',
      'Custom instructions',
      'Analytics dashboard',
    ],
  },
  yearly: {
    name: 'Yearly Pro',
    description: 'Full access to Suparaise AI agents',
    price: 290,
    interval: 'year' as const,
    features: [
      'Unlimited AI agent runs',
      'Priority support',
      'Advanced targeting',
      'Custom instructions',
      'Analytics dashboard',
      '2 months free',
    ],
  },
}
