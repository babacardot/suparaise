import { NextRequest, NextResponse } from 'next/server'
import { getServerStripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { returnUrl } = body

    // Get the authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to find Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.stripe_customer_id) {
      console.error('Profile error:', profileError)
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Initialize Stripe
    const stripe = getServerStripe()

    // Use provided return URL or default to general billing settings
    const defaultReturnUrl = `${req.nextUrl.origin}/dashboard/settings/billing`
    const finalReturnUrl = returnUrl || defaultReturnUrl

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: finalReturnUrl,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 },
    )
  }
}
