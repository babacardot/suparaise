import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type UpdateSpendLimitResponse = {
  success: boolean
  monthlySpendLimit: number
  message: string
  error?: string
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { spendLimit } = await req.json()

    // Validate spend limit
    if (typeof spendLimit !== 'number' || spendLimit < 0 || spendLimit > 1000) {
      return NextResponse.json(
        { error: 'Spend limit must be a number between 0 and 1000' },
        { status: 400 },
      )
    }

    // Call the database function to update spend limit
    // Note: Using string assertion since the function isn't in generated types yet
    const { data, error } = await supabase.rpc(
      'update_spend_limit' as 'get_user_usage_billing',
      {
        p_user_id: user.id,
        p_spend_limit: spendLimit,
      } as never,
    )

    if (error) {
      console.error('Error updating spend limit:', error)
      return NextResponse.json(
        { error: 'Failed to update spend limit' },
        { status: 500 },
      )
    }

    // Type assertion for the response data
    const result = data as UpdateSpendLimitResponse

    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      monthlySpendLimit: spendLimit,
      message: result?.message || 'Spend limit updated successfully',
    })
  } catch (error) {
    console.error('Spend limit update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
