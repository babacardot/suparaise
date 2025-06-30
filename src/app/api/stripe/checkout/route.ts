import { NextRequest, NextResponse } from 'next/server'
import { getServerStripe, STRIPE_PRICE_IDS } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { priceId, plan } = await req.json()

    // Get the authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // Initialize Stripe
    const stripe = getServerStripe()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile using RPC function
    const { data: profileResult, error: profileError } = await supabase.rpc(
      'get_or_create_stripe_customer',
      {
        p_user_id: user.id,
        p_email: user.email || '',
        p_full_name: undefined,
        p_stripe_customer_id: undefined,
      },
    )

    if (profileError || !profileResult) {
      console.error('Error getting profile:', profileError)
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 },
      )
    }

    // Type assertion for the RPC result
    interface RPCResult {
      success: boolean
      error?: string
      profile?: {
        stripe_customer_id?: string
        full_name?: string
      }
    }

    const result = profileResult as unknown as RPCResult
    if (!result.success) {
      console.error('Error getting profile:', result.error)
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 },
      )
    }

    const profile = result.profile
    let customerId = profile?.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: profile?.full_name || undefined,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id

      // Update profile with customer ID using RPC function
      const { data: updateResult, error: updateError } = await supabase.rpc(
        'get_or_create_stripe_customer',
        {
          p_user_id: user.id,
          p_email: user.email || '',
          p_full_name: profile?.full_name || undefined,
          p_stripe_customer_id: customerId,
        },
      )

      if (updateError || !updateResult) {
        console.error('Error updating customer ID:', updateError)
        return NextResponse.json(
          { error: 'Failed to update customer' },
          { status: 500 },
        )
      }

      const updateResultTyped = updateResult as unknown as RPCResult
      if (!updateResultTyped.success) {
        console.error('Error updating customer ID:', updateResultTyped.error)
        return NextResponse.json(
          { error: 'Failed to update customer' },
          { status: 500 },
        )
      }
    }

    // Validate price ID
    const validPriceIds = Object.values(STRIPE_PRICE_IDS)
    if (!validPriceIds.includes(priceId)) {
      console.error(
        'Invalid price ID received:',
        priceId,
        'Valid IDs:',
        validPriceIds,
      )
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${req.nextUrl.origin}/dashboard?canceled=true`,
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: plan,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    )
  }
}
