import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Check user's onboarding status
  const { data: onboardingStatus, error: onboardingError } = await supabase
    .rpc('check_user_onboarding_status', {
      p_user_id: user.id
    })

  if (onboardingError) {
    console.error('Error checking onboarding status:', onboardingError)
    return <div>Error loading dashboard</div>
  }

  const statusData = onboardingStatus as { needsOnboarding: boolean; hasStartup: boolean }

  // If user needs onboarding (no startups or incomplete startups), the layout will handle it
  // If user has no startups, show startup selection/creation UI
  if (!statusData.hasStartup) {
    // For now, redirect to landing page or show create startup dialog
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-1 items-center justify-center rounded-sm border border-dashed shadow-sm">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              Create Your First Startup
            </h3>
            <p className="text-sm text-muted-foreground">
              Get started by creating your startup profile
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If user has startups, get them and redirect to the most recent one
  const { data: startups, error } = await supabase
    .rpc('get_user_startups_with_status', {
      p_user_id: user.id
    })

  if (error) {
    console.error('Error fetching startups:', error)
    return <div>Error loading startups</div>
  }

  const startupsArray = startups as Array<{ id: string; name: string }>
  if (startupsArray && startupsArray.length > 0) {
    const mostRecentStartup = startupsArray[0]
    redirect(`/dashboard/${mostRecentStartup.id}/home`)
  }

  // Fallback if no startups found
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-1 items-center justify-center rounded-sm border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            No startups found
          </h3>
          <p className="text-sm text-muted-foreground">
            Something went wrong. Please try refreshing the page.
          </p>
        </div>
      </div>
    </div>
  )
}
