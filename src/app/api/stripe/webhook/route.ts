import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error('Webhook signature verification failed.', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 },
    )
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const subscriptionId = subscription.id
      const status = subscription.status
      // @ts-expect-error - Stripe types might be inconsistent
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

      // Update user subscription status using RPC function
      const { data: result, error } = await supabase.rpc(
        'update_subscription_status',
        {
          p_stripe_customer_id: customerId,
          p_subscription_id: subscriptionId,
          p_status: status,
          p_current_period_end: currentPeriodEnd.toISOString(),
          p_is_subscribed: status === 'active',
        },
      )

      if (error || !result?.success) {
        console.error('Error updating subscription:', error || result?.error)
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 },
        )
      }

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer as string

      // Cancel subscription using RPC function
      const { data: result, error } = await supabase.rpc(
        'cancel_subscription',
        {
          p_stripe_customer_id: customerId,
        },
      )

      if (error || !result?.success) {
        console.error('Error canceling subscription:', error || result?.error)
        return NextResponse.json(
          { error: 'Failed to cancel subscription' },
          { status: 500 },
        )
      }

      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object
      const customerId = invoice.customer as string

      // Mark subscription as active using RPC function
      const { data: result, error } = await supabase.rpc(
        'handle_payment_success',
        {
          p_stripe_customer_id: customerId,
        },
      )

      if (error || !result?.success) {
        console.error('Error updating payment success:', error || result?.error)
        return NextResponse.json(
          { error: 'Failed to update payment success' },
          { status: 500 },
        )
      }

      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const customerId = invoice.customer as string

      // Mark subscription as past due using RPC function
      const { data: result, error } = await supabase.rpc(
        'handle_payment_failure',
        {
          p_stripe_customer_id: customerId,
        },
      )

      if (error || !result?.success) {
        console.error('Error updating payment failure:', error || result?.error)
        return NextResponse.json(
          { error: 'Failed to update payment failure' },
          { status: 500 },
        )
      }

      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
