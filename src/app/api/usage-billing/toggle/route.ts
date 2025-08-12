import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type ToggleUsageBillingResponse = {
  success: boolean
  usageBillingEnabled: boolean
  message: string
  error?: string
}

export async function POST(req: NextRequest) {
  try {
    const { enable, meterId, spendLimit } = await req.json()

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

    // Call the database function to toggle usage billing with spend limit
    // Note: Using string assertion since the function isn't in generated types yet
    const { data, error } = await supabase.rpc(
      'toggle_usage_billing' as 'get_user_usage_billing',
      {
        p_user_id: user.id,
        p_enable: enable,
        p_meter_id: meterId || null,
        p_spend_limit: spendLimit || 50.0,
      } as never,
    )

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to toggle usage billing' },
        { status: 500 },
      )
    }

    // Type assertion for the response data
    const result = data as ToggleUsageBillingResponse

    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      usageBillingEnabled: result?.usageBillingEnabled ?? enable,
      message:
        result?.message ||
        (enable
          ? 'Usage billing enabled successfully'
          : 'Usage billing disabled successfully'),
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
