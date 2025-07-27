import { NextRequest, NextResponse } from 'next/server'
import { getServerStripe } from '@/lib/stripe/client'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  // Verify environment variables at runtime
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 },
    )
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event

  try {
    const stripe = getServerStripe()
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    console.error('Webhook signature verification failed.', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 },
    )
  }

  // Handle subscription events and usage billing events by calling Edge Function
  if (
    event.type.startsWith('customer.subscription.') ||
    event.type.startsWith('invoice.payment_') ||
    event.type.startsWith('billing.meter.') ||
    event.type === 'invoice.finalized'
  ) {
    try {
      let subscriptionData: {
        customerId: string
        eventType: string
        subscriptionId?: string
        status?: string
        currentPeriodEnd?: string
        planName?: string
        priceId?: string
        usageAmount?: number
        meteringData?: object
      } = {
        customerId: '',
        eventType: event.type,
      }

      // Handle subscription events
      if (event.type.startsWith('customer.subscription.')) {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const subscriptionId = subscription.id
        const status = subscription.status

        // Handle current_period_end which exists on active subscriptions
        const subscriptionWithPeriod = subscription as Stripe.Subscription & {
          current_period_end?: number
        }
        const currentPeriodEnd = subscriptionWithPeriod.current_period_end
          ? new Date(subscriptionWithPeriod.current_period_end * 1000)
          : new Date()

        // Get plan name from metadata or line items
        const planName = subscription.metadata?.plan
        const priceId = subscription.items?.data?.[0]?.price?.id

        subscriptionData = {
          ...subscriptionData,
          customerId,
          subscriptionId,
          status,
          currentPeriodEnd: currentPeriodEnd.toISOString(),
          planName,
          priceId,
        }
      }
      // Handle invoice events
      else if (
        event.type.startsWith('invoice.payment_') ||
        event.type === 'invoice.finalized'
      ) {
        const invoice = event.data.object as Stripe.Invoice
        subscriptionData.customerId = invoice.customer as string

        // For usage billing invoices, extract usage amount
        if (invoice.lines?.data) {
          const usageLineItem = invoice.lines.data.find(
            (line) =>
              line.description?.includes('usage') &&
              line.metadata?.usage_billing === 'true',
          )

          if (usageLineItem && usageLineItem.amount) {
            subscriptionData.usageAmount = usageLineItem.amount / 100 // Convert from cents
          }
        }
      }
      // Handle billing meter events
      else if (event.type.startsWith('billing.meter.')) {
        const meterEvent = event.data.object as unknown as Record<
          string,
          unknown
        >
        // For billing meter events, customer ID might be in different location
        subscriptionData.customerId =
          (meterEvent.customer_id as string) ||
          (meterEvent.stripe_customer_id as string) ||
          ((meterEvent.payload as Record<string, unknown>)
            ?.stripe_customer_id as string) ||
          ''
        subscriptionData.meteringData = meterEvent
      }

      console.log('Calling Edge Function with:', subscriptionData)

      // Call the Edge Function
      const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/handle-subscription`
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify(subscriptionData),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Edge Function error:', result)
        return NextResponse.json(
          { error: 'Failed to process subscription' },
          { status: 500 },
        )
      }

      console.log('Edge Function success:', result)
      return NextResponse.json({ received: true, result })
    } catch (error) {
      console.error('Error calling Edge Function:', error)
      return NextResponse.json(
        { error: 'Failed to process subscription' },
        { status: 500 },
      )
    }
  }

  // For non-subscription events, just log and return success
  console.log(`Unhandled event type: ${event.type}`)
  return NextResponse.json({ received: true })
}
