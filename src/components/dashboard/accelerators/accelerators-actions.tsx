'use client'

import React from 'react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Accelerator = {
  id: string
  name: string
  website?: string
  application_url?: string
  application_email?: string
  submission_type: 'form' | 'email' | 'other'
  program_type?: 'in-person' | 'remote' | 'hybrid'
  program_duration?: string
  location?: string
  is_remote_friendly?: boolean
  batch_size?: string
  batches_per_year?: number
  next_application_deadline?: string
  stage_focus?: string[]
  industry_focus?: string[]
  region_focus?: string[]
  equity_taken?: string
  funding_provided?: string
  acceptance_rate?: string
  form_complexity?: 'simple' | 'standard' | 'comprehensive'
  required_documents?: string[]
  program_fee?: number
  is_active?: boolean
  notes?: string
  tags?: string[]
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
}

type AcceleratorsActionsProps = {
  accelerator: Accelerator | null
  submissions: Submission[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default React.memo(function AcceleratorsActions({
  accelerator,
  submissions,
  isOpen,
  onOpenChange,
}: AcceleratorsActionsProps) {
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

  const getTagColor = () => {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
  }

  const getEquityColor = (equity: string) => {
    if (equity === '0%')
      return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    if (equity === '1 — 3%')
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    if (equity === '4 — 6%')
      return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    if (equity === '7 — 10%')
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
    if (equity === '10% +')
      return 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
    if (equity === 'variable')
      return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
  }

  const getFundingColor = (funding: string) => {
    if (funding === '0 — 25K')
      return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    if (funding === '25K — 50K')
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    if (funding === '50K — 100K')
      return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    if (funding === '100K — 250K')
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
    if (funding === '250K — 500K')
      return 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
    if (funding === '500K +')
      return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
  }

  const getRequiredDocumentColor = (doc: string) => {
    if (doc === 'pitch_deck')
      return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
    if (doc === 'video')
      return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    if (doc === 'financial_projections')
      return 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
    if (doc === 'traction_data')
      return 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
    if (doc === 'business_plan')
      return 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
    return 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
  }

  const getRequirementLabel = (value: string) => {
    const labels: Record<string, string> = {
      pitch_deck: 'Deck',
      video: 'Video',
      financial_projections: 'Financials',
      business_plan: 'Business Plan',
      traction_data: 'Traction',
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

  if (!accelerator) return null

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full p-0 sm:m-4 h-full sm:h-[calc(100%-2rem)] rounded-sm sm:rounded-sm border-0 sm:border shadow-lg bg-background overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-200">
        <Card className="border-0 shadow-none rounded-sm sm:rounded-sm h-full flex flex-col">
          <CardHeader className="sticky top-0 z-10 bg-background border-b px-4 -py-8 flex flex-row items-center justify-between flex-shrink-0">
            <SheetTitle className="text-base font-medium">
              {accelerator.name}
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
              <div
                className="flex items-center justify-between"
                style={{ marginTop: '-15px' }}
              >
                <span className="text-muted-foreground">Type</span>
                <Badge
                  className={`rounded-sm text-[10px] font-normal ${getSubmissionTypeColor(accelerator.submission_type)}`}
                >
                  {capitalizeFirst(accelerator.submission_type)}
                </Badge>
              </div>

              {accelerator.form_complexity && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Complexity</span>
                  <Badge
                    className={`rounded-sm text-[10px] font-normal ${getComplexityColor(accelerator.form_complexity)}`}
                  >
                    {capitalizeFirst(accelerator.form_complexity)}
                  </Badge>
                </div>
              )}

              {accelerator.program_type && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <Badge className={`rounded-sm text-[10px] font-normal`}>
                    {capitalizeFirst(accelerator.program_type)}
                  </Badge>
                </div>
              )}

              {accelerator.notes && (
                <div className="space-y-2">
                  <span className="text-muted-foreground">Description</span>
                  <p className="text-xs text-black dark:text-white pt-2">
                    {accelerator.notes}
                  </p>
                </div>
              )}

              <Separator />

              {accelerator.stage_focus &&
                accelerator.stage_focus.length > 0 && (
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground pt-1">Focus</span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                      {accelerator.stage_focus.map((stage) => (
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

              {accelerator.industry_focus &&
                accelerator.industry_focus.length > 0 && (
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground pt-1">Industry</span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                      {accelerator.industry_focus.map((industry) => (
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

              {accelerator.region_focus &&
                accelerator.region_focus.length > 0 && (
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground pt-1">Region</span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                      {accelerator.region_focus.map((region) => (
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

              {accelerator.required_documents &&
                accelerator.required_documents.length > 0 && (
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground pt-1">
                      Requirements
                    </span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                      {accelerator.required_documents.map((doc) => (
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

              {accelerator.equity_taken && (
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground pt-1">Equity</span>
                  <Badge
                    className={`rounded-sm text-[10px] ${getEquityColor(accelerator.equity_taken)}`}
                  >
                    {accelerator.equity_taken}
                  </Badge>
                </div>
              )}

              {accelerator.funding_provided && (
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground pt-1">Funding</span>
                  <Badge
                    className={`rounded-sm text-[10px] ${getFundingColor(accelerator.funding_provided)}`}
                  >
                    {accelerator.funding_provided}
                  </Badge>
                </div>
              )}

              {accelerator.tags && accelerator.tags.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground pt-1">Tags</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[220px]">
                    {accelerator.tags.map((tag) => (
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

              {submissions.length > 0 && (
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
