import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { enable, meterId } = await req.json()

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

    // Update the profiles table directly for now
    const { error } = await supabase
      .from('profiles')
      .update({
        usage_billing_enabled: enable,
        usage_billing_meter_id: enable ? meterId || null : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to toggle usage billing' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      usageBillingEnabled: enable,
      message: enable
        ? 'Usage billing enabled successfully'
        : 'Usage billing disabled successfully',
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
