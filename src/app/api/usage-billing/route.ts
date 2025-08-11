import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    // Get usage billing data from profiles table directly
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(
        `
        usage_billing_enabled,
        monthly_estimated_usage_cost,
        actual_usage_cost,
        last_invoice_date,
        monthly_usage_submissions_count,
        total_usage_submissions,
        monthly_submissions_used,
        monthly_submissions_limit,
        permission_level,
        is_subscribed,
        stripe_customer_id
      `,
      )
      .eq('id', user.id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch usage billing data' },
        { status: 500 },
      )
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      usageBillingEnabled: profile.usage_billing_enabled || false,
      currentMonthUsageCost: profile.monthly_estimated_usage_cost || 0,
      actualUsageCost: profile.actual_usage_cost || 0,
      lastInvoiceDate: profile.last_invoice_date,
      monthlyUsageSubmissionsCount:
        profile.monthly_usage_submissions_count || 0,
      totalUsageSubmissions: profile.total_usage_submissions || 0,
      monthlySubmissionsUsed: profile.monthly_submissions_used || 0,
      monthlySubmissionsLimit: profile.monthly_submissions_limit || 0,
      permissionLevel: profile.permission_level,
      isSubscribed: profile.is_subscribed,
      stripeCustomerId: profile.stripe_customer_id,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
