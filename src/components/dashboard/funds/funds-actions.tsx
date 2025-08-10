'use client'

import React from 'react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Target = {
  id: string
  name: string
  website?: string
  application_url: string
  application_email?: string
  submission_type: 'form' | 'email' | 'other'
  stage_focus?: string[]
  industry_focus?: string[]
  region_focus?: string[]
  form_complexity?: 'simple' | 'standard' | 'comprehensive'
  question_count_range?: '1-5' | '6-10' | '11-20' | '21+'
  required_documents?: string[]
  tags?: string[]
  notes?: string
  visibility_level?: 'FREE' | 'PRO' | 'MAX'
  created_at: string
  updated_at: string
}

type Submission = {
  id: string
  submission_date: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  agent_notes?: string
  queue_position?: number
  queued_at?: string
  started_at?: string
  updated_at?: string
}

type FundsActionsProps = {
  target: Target | null
  submissions: Submission[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default React.memo(function FundsActions({
  target,
  submissions,
  isOpen,
  onOpenChange,
}: FundsActionsProps) {
  // const getSubmissionTypeColor = (type: string) => {
  //   switch (type) {
  //     case 'form':
  //       return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
  //     case 'email':
  //       return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
  //     case 'other':
  //       return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
  //     default:
  //       return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
  //   }
  // }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
      case 'standard':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
      case 'comprehensive':
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'All':
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
      case 'Pre-seed':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
      case 'Seed':
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
      case 'Series A':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
      case 'Series B':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
      case 'Series C':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
      case 'Growth':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
    }
  }

  const getIndustryColor = (industry: string) => {
    // Physical/hardware/deep science industries
    if (
      [
        'Deep tech',
        'Healthcare',
        'Medtech',
        'Climate',
        'Environment',
        'Proptech',
        'Logistics',
        'Agriculture',
        'Automotive',
        'Robotics',
        'Biotechnology',
        'Construction',
        'Energy',
        'Hardware',
        'Manufacturing',
        'Mining',
        'Advanced Materials',
        'Biofuels',
        'Nanotechnology',
        'Real estate',
        'IoT',
        'Telecommunications',
        'Transportation',
        'Aerospace',
        'Pharmaceuticals',
      ].includes(industry)
    ) {
      return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
    }
    // Default blue for software/digital/service industries
    return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
  }

  const getRegionColor = (region: string) => {
    // Global and Emerging Markets - Sky
    if (['Global', 'Emerging Markets'].includes(region)) {
      return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
    }
    // North America - Green (includes country-level variants)
    if (['North America', 'United States', 'Canada'].includes(region)) {
      return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
    }
    // Europe - Purple (includes common country-level variants)
    if (
      [
        'Europe',
        'Western Europe',
        'Eastern Europe',
        'Continental Europe',
        'UK',
        'France',
        'Netherlands',
        'Sweden',
      ].includes(region)
    ) {
      return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
    }
    // Asia - Orange (includes country-level variants)
    if (
      [
        'Asia',
        'East Asia',
        'South Asia',
        'South East Asia',
        'India',
        'China',
        'Japan',
        'Korea',
      ].includes(region)
    ) {
      return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
    }
    // Latin America - Pink
    if (['LATAM', 'South America'].includes(region)) {
      return 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border border-pink-200 dark:border-pink-800'
    }
    // Africa, Middle East, and EMEA - Teal (includes country-level variants)
    if (
      [
        'Africa',
        'Middle East',
        'EMEA',
        'Nigeria',
        'Kenya',
        'Egypt',
        'Senegal',
        'South Africa',
      ].includes(region)
    ) {
      return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
    }
    // Oceania - Cyan (includes country-level variants)
    if (['Oceania', 'Australia'].includes(region)) {
      return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800'
    }
    // Default
    return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
  }

  const getTagColor = () => {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
  }

  const getRequiredDocumentColor = (doc: string) => {
    if (doc === 'pitch_deck')
      return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
    if (doc === 'video')
      return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800'
    if (doc === 'financials')
      return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
    if (doc === 'business_plan')
      return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
    return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
  }

  const getRequirementLabel = (value: string) => {
    const labels: Record<string, string> = {
      pitch_deck: 'Deck',
      video: 'Demo',
      financials: 'Financials',
      business_plan: 'Business Plan',
    }
    return labels[value] || value.replace(/_/g, ' ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const formatTimeline = () => {
    if (!submissions || submissions.length === 0) return []

    const latestSubmission = submissions[0]
    const timeline = []

    // Submission date
    timeline.push({
      date: latestSubmission.submission_date,
      label: 'Submitted',
    })

    // Queued date
    if (latestSubmission.queued_at) {
      timeline.push({
        date: latestSubmission.queued_at,
        label: `Queued (#${latestSubmission.queue_position || ''})`,
      })
    }

    // Started date
    if (latestSubmission.started_at) {
      timeline.push({
        date: latestSubmission.started_at,
        label: 'Started',
      })
    }

    // Current status
    if (latestSubmission.status === 'completed') {
      timeline.push({
        date: latestSubmission.updated_at || latestSubmission.submission_date,
        label: 'Completed',
        status: 'completed',
      })
    } else if (latestSubmission.status === 'failed') {
      timeline.push({
        date: latestSubmission.updated_at || latestSubmission.submission_date,
        label: 'Failed',
        status: 'failed',
      })
    } else if (latestSubmission.status === 'in_progress') {
      timeline.push({
        date:
          latestSubmission.started_at ||
          (latestSubmission.updated_at
            ? latestSubmission.updated_at.toString()
            : new Date().toISOString()),
        label: 'In Progress',
        status: 'pending',
      })
    } else if (latestSubmission.status === 'pending') {
      timeline.push({
        date:
          latestSubmission.queued_at ||
          latestSubmission.submission_date.toString() ||
          new Date().toISOString(),
        label: 'Pending',
        status: 'pending',
      })
    }

    return timeline.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
  }

  if (!target) return null

  const timeline = formatTimeline()

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full p-0 sm:m-4 h-full sm:h-[calc(100%-2rem)] rounded-sm sm:rounded-sm border-0 sm:border shadow-lg bg-background overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-200">
        <Card className="border-0 shadow-none rounded-sm sm:rounded-sm h-full flex flex-col">
          <CardHeader className="sticky top-0 z-10 bg-background border-b px-4 -py-8 flex flex-row items-center justify-between flex-shrink-0">
            <SheetTitle className="text-base font-medium">
              {target.name}
            </SheetTitle>
            <button
              onMouseDown={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground sm:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="p-4 space-y-3 overflow-auto flex-1 text-xs">
            <div className="space-y-3 pl-4 pr-2 sm:px-0">
              {/* Basic Info */}
              {/* Type (commented out for now)
              <div
                className="flex items-center justify-between"
                style={{ marginTop: '-15px' }}
              >
                <span className="text-muted-foreground">Type</span>
                <Badge
                  className={`rounded-sm text-[10px] font-normal ${getSubmissionTypeColor(target.submission_type)}`}
                >
                  {capitalizeFirst(target.submission_type)}
                </Badge>
              </div>
              */}

              {target.form_complexity && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Complexity</span>
                  <Badge
                    className={`rounded-sm text-[10px] font-normal ${getComplexityColor(target.form_complexity)}`}
                  >
                    {capitalizeFirst(target.form_complexity)}
                  </Badge>
                </div>
              )}

              {target.notes && (
                <div className="space-y-2">
                  <p className="text-xs text-black dark:text-white pt-0">
                    {target.notes}
                  </p>
                </div>
              )}

              <Separator />

              {/* Focus Areas */}
              {target.stage_focus && target.stage_focus.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground pt-1">Focus</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                    {target.stage_focus.map((stage) => (
                      <Badge
                        key={stage}
                        className={`rounded-sm text-[10px] ${getStageColor(stage)}`}
                      >
                        {stage}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {target.industry_focus && target.industry_focus.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground pt-1">Industry</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                    {target.industry_focus.map((industry) => (
                      <Badge
                        key={industry}
                        className={`rounded-sm text-[10px] ${getIndustryColor(industry)}`}
                      >
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {target.region_focus && target.region_focus.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground pt-1">Region</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                    {target.region_focus.map((region) => (
                      <Badge
                        key={region}
                        className={`rounded-sm text-[10px] ${getRegionColor(region)}`}
                      >
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {target.required_documents &&
                target.required_documents.length > 0 && (
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground pt-1">
                      Requirements
                    </span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                      {target.required_documents.map((doc) => (
                        <Badge
                          key={doc}
                          className={`rounded-sm text-[10px] ${getRequiredDocumentColor(doc)}`}
                        >
                          {getRequirementLabel(doc)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {target.tags && target.tags.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground pt-1">Tags</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                    {target.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className={`rounded-sm text-[10px] ${getTagColor()}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Timeline */}
              {timeline.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Timeline</span>
                  </div>
                  {timeline.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-2 h-2 ml-1 mb-0.5 rounded-full flex-shrink-0 ${
                            index === timeline.length - 1
                              ? event.status === 'completed'
                                ? 'bg-green-500'
                                : event.status === 'failed'
                                  ? 'bg-red-500'
                                  : event.status === 'pending'
                                    ? 'bg-orange-500'
                                    : 'bg-gray-300'
                              : 'bg-transparent'
                          } ${index === timeline.length - 1 ? '' : ''}`}
                        />
                        <span className="text-[10px] font-medium">
                          {event.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(event.date)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </SheetContent>
    </Sheet>
  )
})
