'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { getDynamicGreeting } from '@/lib/hooks/dynamic-greeting'
import { useUser } from '@/lib/contexts/user-context'
import {
  SubmissionsWidget,
  SubmissionData,
} from '@/components/dashboard/home/submissions-widget'
import { ActivityWidget } from '@/components/dashboard/home/activity-widget'
import { SubmissionsQuotaWidget } from '@/components/dashboard/home/quota-widget'
import { TotalApplicationsWidget } from '@/components/dashboard/home/total-submissions-widget'
import {
  RecommendationModal,
  Recommendation,
} from '@/components/dashboard/home/recommendation-modal'
import { ResourcesSection } from '@/components/dashboard/home/resources-section'
import { MobileUpgradeCard } from '@/components/dashboard/home/mobile-upgrade-card'

interface HomePageClientProps {
  startupId: string
  submissionsUsed: number
  submissionsLimit: number
  totalApplications: number
  recommendations: Recommendation[] | null
  recentSubmissions: SubmissionData[]
}

export default function HomePageClient({
  startupId,
  submissionsUsed,
  submissionsLimit,
  totalApplications,
  recommendations,
  recentSubmissions,
}: HomePageClientProps) {
  const { user } = useUser()
  const founderName = useMemo(() => {
    return user?.user_metadata?.full_name?.split(' ')[0] || 'founder'
  }, [user])

  const { message: greetingMessage } = getDynamicGreeting(founderName)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (recentSubmissions) {
      setIsLoading(false)
    }
  }, [recentSubmissions])

  const hasRecommendations = recommendations && recommendations.length > 0

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex-shrink-0 pb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight mt-1.5">
          {greetingMessage}
        </h1>
        {hasRecommendations && (
          <RecommendationModal
            startupId={startupId}
            initialRecommendations={recommendations}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <TotalApplicationsWidget totalApplications={totalApplications} />
        </div>
        <div className="lg:col-span-2">
          <SubmissionsQuotaWidget
            submissionsUsed={submissionsUsed}
            submissionsLimit={submissionsLimit}
          />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-10 gap-4 items-start mt-4">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <ActivityWidget />
          <ResourcesSection
            className="mt-2 hidden md:block"
            startupId={startupId}
          />
        </div>
        <div className="lg:col-span-3 flex flex-col gap-4">
          <SubmissionsWidget
            submissions={recentSubmissions}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Mobile upgrade card - only shown on mobile */}
      <MobileUpgradeCard className="mt-4 md:hidden" startupId={startupId} />
    </div>
  )
}
