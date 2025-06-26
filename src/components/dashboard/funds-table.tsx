'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/design/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import {
  ExternalLink,
  Mail,
  FileText,
  Video,
  AlertCircle,
  DollarSign,
  BarChart,
  Users,
} from 'lucide-react'
import {
  ValidationGate,
  VALIDATION_PRESETS,
} from '@/components/ui/validation-gate'

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
  notes?: string
  created_at: string
  updated_at: string
}

interface FundsTableProps {
  targets: Target[]
}

export default function FundsTable({ targets }: FundsTableProps) {
  const [hoveredButton, setHoveredButton] = React.useState<string | null>(null)

  const getSubmissionTypeColor = (type: string) => {
    switch (type) {
      case 'form':
        return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
      case 'email':
        return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
      case 'other':
        return 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
      default:
        return 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
      case 'standard':
        return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
      case 'comprehensive':
        return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
    }
  }

  const getDocumentBadge = (docType: string) => {
    switch (docType) {
      case 'pitch_deck':
        return {
          label: 'Deck',
          icon: <FileText className="h-3 w-3 mr-1" />,
          color:
            'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
        }
      case 'video':
        return {
          label: 'Video',
          icon: <Video className="h-3 w-3 mr-1" />,
          color:
            'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800',
        }
      case 'financial_projections':
        return {
          label: 'Financials',
          icon: <DollarSign className="h-3 w-3 mr-1" />,
          color:
            'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
        }
      case 'traction_data':
        return {
          label: 'Traction',
          icon: <BarChart className="h-3 w-3 mr-1" />,
          color:
            'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800',
        }
      case 'team_bios':
        return {
          label: 'Team',
          icon: <Users className="h-3 w-3 mr-1" />,
          color:
            'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
        }
      default:
        return {
          label: docType.replace('_', ' '),
          icon: <FileText className="h-3 w-3 mr-1" />,
          color:
            'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800',
        }
    }
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const handleApplyForm = (applicationUrl: string) => {
    window.open(applicationUrl, '_blank')
  }

  const handleSendEmail = (email: string | undefined) => {
    if (!email) return
    window.open(`mailto:${email}`, '_blank')
  }

  const handleLearnMore = (applicationUrl: string) => {
    window.open(applicationUrl, '_blank')
  }

  if (targets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No funds available at the moment.
        </p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        <div className="flex-1 min-h-0">
          <div className="h-full rounded-sm border overflow-hidden">
            <div
              className="h-full overflow-auto hide-scrollbar"
              data-scroll-preserve="funds-table-scroll"
            >
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 border-b">
                  <TableRow>
                    <TableHead className="w-[180px]">Name</TableHead>
                    <TableHead className="w-[70px]">Type</TableHead>
                    <TableHead className="w-[100px]">Stage</TableHead>
                    <TableHead className="w-[100px]">Industry</TableHead>
                    <TableHead className="w-[90px]">Complexity</TableHead>
                    <TableHead className="w-[110px]">Requirements</TableHead>
                    <TableHead className="w-[60px]">X</TableHead>
                    <TableHead className="w-[60px]">Y</TableHead>
                    <TableHead className="w-[60px]">Z</TableHead>
                    <TableHead className="text-right w-[120px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targets.map((target) => (
                    <TableRow key={target.id}>
                      <TableCell className="font-medium p-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{target.name}</span>
                            {target.website && (
                              <a
                                href={target.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          {target.notes && (
                            <p className="text-xs text-muted-foreground leading-relaxed max-w-[160px]">
                              {target.notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <Badge
                          className={`rounded-sm text-xs ${getSubmissionTypeColor(target.submission_type)}`}
                        >
                          {target.submission_type === 'form' && (
                            <FileText className="h-3 w-3 mr-1" />
                          )}
                          {target.submission_type === 'email' && (
                            <Mail className="h-3 w-3 mr-1" />
                          )}
                          {target.submission_type === 'other' && (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {target.submission_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {target.stage_focus?.slice(0, 2).map((stage) => (
                            <Badge
                              key={stage}
                              className="rounded-sm bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs"
                            >
                              {stage}
                            </Badge>
                          ))}
                          {target.stage_focus &&
                            target.stage_focus.length > 2 && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge className="rounded-sm bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs cursor-help">
                                    +{target.stage_focus.length - 2}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    {target.stage_focus
                                      .slice(2)
                                      .map((stage) => (
                                        <div key={stage} className="text-xs">
                                          {stage}
                                        </div>
                                      ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {target.industry_focus
                            ?.slice(0, 2)
                            .map((industry) => (
                              <Badge
                                key={industry}
                                className="rounded-sm bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs"
                              >
                                {industry}
                              </Badge>
                            ))}
                          {target.industry_focus &&
                            target.industry_focus.length > 2 && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge className="rounded-sm bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs cursor-help">
                                    +{target.industry_focus.length - 2}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    {target.industry_focus
                                      .slice(2)
                                      .map((industry) => (
                                        <div key={industry} className="text-xs">
                                          {industry}
                                        </div>
                                      ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {target.form_complexity && (
                            <Badge
                              className={`rounded-sm text-xs ${getComplexityColor(target.form_complexity)}`}
                            >
                              {capitalizeFirst(target.form_complexity)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {target.required_documents
                            ?.slice(0, 2)
                            .map((docType) => {
                              const docBadge = getDocumentBadge(docType)
                              return (
                                <Badge
                                  key={docType}
                                  className={`rounded-sm text-xs ${docBadge.color}`}
                                >
                                  {docBadge.icon}
                                  {docBadge.label}
                                </Badge>
                              )
                            })}
                          {target.required_documents &&
                            target.required_documents.length > 2 && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge className="rounded-sm bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs cursor-help">
                                    +{target.required_documents.length - 2}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    {target.required_documents
                                      .slice(2)
                                      .map((docType) => {
                                        const docBadge =
                                          getDocumentBadge(docType)
                                        return (
                                          <div
                                            key={docType}
                                            className="text-xs flex items-center gap-1"
                                          >
                                            {docBadge.icon}
                                            {docBadge.label}
                                          </div>
                                        )
                                      })}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="text-xs text-muted-foreground">
                          {/* Placeholder for X column */}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="text-xs text-muted-foreground">
                          {/* Placeholder for Y column */}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="text-xs text-muted-foreground">
                          {/* Placeholder for Z column */}
                        </div>
                      </TableCell>
                      <TableCell className="text-right p-2">
                        <div className="flex justify-end">
                          {target.submission_type === 'form' && (
                            <ValidationGate
                              requirements={
                                VALIDATION_PRESETS.BASIC_APPLICATION
                              }
                              onValidationPass={() =>
                                handleApplyForm(target.application_url)
                              }
                            >
                              <Button
                                size="sm"
                                onMouseEnter={() =>
                                  setHoveredButton(`apply-${target.id}`)
                                }
                                onMouseLeave={() => setHoveredButton(null)}
                                className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm px-3 text-sm h-8"
                              >
                                <LottieIcon
                                  animationData={animations.takeoff}
                                  size={14}
                                  className="mr-1"
                                  isHovered={
                                    hoveredButton === `apply-${target.id}`
                                  }
                                />
                                Apply
                              </Button>
                            </ValidationGate>
                          )}
                          {target.submission_type === 'email' &&
                            target.application_email && (
                              <ValidationGate
                                requirements={
                                  VALIDATION_PRESETS.BASIC_APPLICATION
                                }
                                onValidationPass={() =>
                                  handleSendEmail(target.application_email)
                                }
                              >
                                <Button
                                  size="sm"
                                  onMouseEnter={() =>
                                    setHoveredButton(`email-${target.id}`)
                                  }
                                  onMouseLeave={() => setHoveredButton(null)}
                                  className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-800 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-800 rounded-sm px-3 text-sm h-8"
                                >
                                  <LottieIcon
                                    animationData={animations.mailopen}
                                    size={14}
                                    className="mr-1"
                                    isHovered={
                                      hoveredButton === `email-${target.id}`
                                    }
                                  />
                                  Send Email
                                </Button>
                              </ValidationGate>
                            )}
                          {target.submission_type === 'other' && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleLearnMore(target.application_url)
                              }
                              onMouseEnter={() =>
                                setHoveredButton(`learn-${target.id}`)
                              }
                              onMouseLeave={() => setHoveredButton(null)}
                              className="bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900/40 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-sm px-3 text-sm h-8"
                            >
                              <LottieIcon
                                animationData={animations.info}
                                size={14}
                                className="mr-1"
                                isHovered={
                                  hoveredButton === `learn-${target.id}`
                                }
                              />
                              Learn More
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
