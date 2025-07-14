'use client'

import React from 'react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Angel = {
  id: string
  first_name: string
  last_name: string
  email?: string
  linkedin?: string
  twitter?: string
  personal_website?: string
  location?: string
  bio?: string
  check_size?:
    | '1K — 10K'
    | '10K — 25K'
    | '25K — 50K'
    | '50K — 100K'
    | '100K — 250K'
    | '250K — 500K'
    | '500K — 1M'
    | '1M +'
  stage_focus?: string[]
  industry_focus?: string[]
  region_focus?: string[]
  investment_approach?: 'hands-on' | 'passive' | 'advisory' | 'network-focused'
  previous_exits?: string[]
  domain_expertise?: string[]
  response_time?: '1-3 days' | '1 week' | '2 weeks' | '1 month' | '2+ months'
  submission_type: 'form' | 'email' | 'other'
  application_url?: string
  application_email?: string
  form_complexity?: 'simple' | 'standard' | 'comprehensive'
  required_documents?: string[]
  notable_investments?: string[]
  is_active?: boolean
  notes?: string
  visibility_level?: 'FREE' | 'PRO' | 'MAX'
  created_at: string
  updated_at: string
}

type Submission = {
  id: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  submission_date: string
  agent_notes?: string
  queue_position?: number
}

type AngelsActionsProps = {
  angel: Angel | null
  submissions: Submission[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  loading: boolean
}

export default React.memo(function AngelsActions({
  angel,
  submissions,
  isOpen,
  onOpenChange,
  loading,
}: AngelsActionsProps) {
  const getSubmissionTypeColor = (type: string) => {
    switch (type) {
      case 'form':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'email':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      case 'other':
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
      case 'standard':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'comprehensive':
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'failed':
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
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
    if (
      [
        'Deep tech',
        'Healthtech',
        'Climate tech',
        'PropTech',
        'Logistics',
      ].includes(industry)
    ) {
      return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
    }
    return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
  }

  const getRegionColor = (region: string) => {
    if (['Global', 'Emerging Markets'].includes(region)) {
      return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
    }
    if (region === 'North America') {
      return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    }
    if (
      [
        'Europe',
        'Western Europe',
        'Eastern Europe',
        'Continental Europe',
      ].includes(region)
    ) {
      return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    }
    if (
      ['Asia', 'East Asia', 'South Asia', 'South East Asia'].includes(region)
    ) {
      return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    }
    if (['LATAM', 'South America'].includes(region)) {
      return 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
    }
    if (['Africa', 'Middle East', 'EMEA'].includes(region)) {
      return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
    }
    if (region === 'Oceania') {
      return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
    }
    return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
  }

  const getCheckSizeColor = () => {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
  }

  const getInvestmentApproachColor = () => {
    return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
  }

  const getCheckSizeDisplay = (size: string) => {
    if (!size) return ''
    return size.replace('-', ' — ')
  }

  const getSecondaryBadgeColor = () => {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
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
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  if (!angel) return null

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full p-0 sm:m-4 h-full sm:h-[calc(100%-2rem)] rounded-sm sm:rounded-sm border-0 sm:border shadow-lg bg-background overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-200">
        <Card className="border-0 shadow-none rounded-sm sm:rounded-sm h-full flex flex-col">
          <CardHeader className="sticky top-0 z-10 bg-background border-b px-4 -py-8 flex flex-row items-center justify-between flex-shrink-0">
            <SheetTitle className="text-base font-medium">
              {angel.first_name} {angel.last_name}
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
              <div
                className="flex items-center justify-between"
                style={{ marginTop: '-15px' }}
              >
                <span className="text-muted-foreground">Type</span>
                <Badge
                  className={`rounded-sm text-[10px] font-normal ${getSubmissionTypeColor(angel.submission_type)}`}
                >
                  {capitalizeFirst(angel.submission_type)}
                </Badge>
              </div>

              {angel.form_complexity && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Complexity</span>
                  <Badge
                    className={`rounded-sm text-[10px] font-normal ${getComplexityColor(angel.form_complexity)}`}
                  >
                    {capitalizeFirst(angel.form_complexity)}
                  </Badge>
                </div>
              )}

              {angel.check_size && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Check Size</span>
                  <Badge
                    className={`rounded-sm text-[10px] font-normal ${getCheckSizeColor()}`}
                  >
                    {getCheckSizeDisplay(angel.check_size)}
                  </Badge>
                </div>
              )}

              {angel.bio && (
                <div className="space-y-2">
                  <span className="text-muted-foreground">Bio</span>
                  <p className="text-xs text-black dark:text-white pt-2">
                    {angel.bio}
                  </p>
                </div>
              )}

              <Separator />

              {/* Focus Areas */}
              {angel.stage_focus && angel.stage_focus.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground pt-1">Focus</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                    {angel.stage_focus.map((stage) => (
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

              {angel.industry_focus && angel.industry_focus.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground pt-1">Industry</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                    {angel.industry_focus.map((industry) => (
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

              {angel.region_focus && angel.region_focus.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground pt-1">Region</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                    {angel.region_focus.map((region) => (
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

              {angel.investment_approach && (
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground pt-1">Approach</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                    <Badge
                      className={`rounded-sm text-[10px] ${getInvestmentApproachColor()}`}
                    >
                      {capitalizeFirst(angel.investment_approach)}
                    </Badge>
                  </div>
                </div>
              )}

              {angel.notable_investments &&
                angel.notable_investments.length > 0 && (
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground pt-1">
                      Investments
                    </span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                      {angel.notable_investments.map((inv) => (
                        <Badge
                          key={inv}
                          className={`rounded-sm text-[10px] ${getSecondaryBadgeColor()}`}
                        >
                          {inv}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {angel.previous_exits && angel.previous_exits.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground pt-1">Exits</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                    {angel.previous_exits.map((exit) => (
                      <Badge
                        key={exit}
                        className={`rounded-sm text-[10px] ${getSecondaryBadgeColor()}`}
                      >
                        {exit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {angel.domain_expertise && angel.domain_expertise.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground pt-1">Expertise</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                    {angel.domain_expertise.map((domain) => (
                      <Badge
                        key={domain}
                        className={`rounded-sm text-[10px] ${getSecondaryBadgeColor()}`}
                      >
                        {domain}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Submission History */}
              {!loading && submissions.length > 0 && (
                <section>
                  <h3 className="text-sm font-medium mb-2">History</h3>
                  <div className="space-y-2">
                    {submissions.slice(0, 3).map((submission) => (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-2 rounded-sm bg-muted/30"
                      >
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs font-medium">
                            {formatDate(submission.submission_date)}
                          </span>
                          {submission.queue_position && (
                            <span className="text-[10px] text-muted-foreground">
                              Queue position: {submission.queue_position}
                            </span>
                          )}
                          {submission.agent_notes && (
                            <span className="text-[10px] text-muted-foreground">
                              {submission.agent_notes}
                            </span>
                          )}
                        </div>
                        <Badge
                          className={`rounded-sm text-[10px] font-normal ${getStatusColor(submission.status)}`}
                        >
                          {capitalizeFirst(submission.status.replace('_', ' '))}
                        </Badge>
                      </div>
                    ))}
                    {submissions.length > 3 && (
                      <p className="text-[10px] text-muted-foreground text-center">
                        +{submissions.length - 3} more submissions
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>
          </CardContent>
        </Card>
      </SheetContent>
    </Sheet>
  )
})
