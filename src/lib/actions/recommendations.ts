'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface DismissRecommendationResult {
  success: boolean
  error?: string
}

export const dismissRecommendationAction = async (
  startupId: string,
  recommendationKey: string,
): Promise<DismissRecommendationResult> => {
  const supabase = await createClient()

  try {
    const { error } = await supabase.rpc('dismiss_startup_recommendation', {
      p_startup_id: startupId,
      p_recommendation_key: recommendationKey,
    })

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath(`/dashboard/${startupId}/home`)
    return { success: true }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.'
    console.error('Error dismissing recommendation:', errorMessage)
    return { success: false, error: errorMessage }
  }
}
