'use client'

import React, { useState, useCallback, useEffect } from 'react'
import AngelsTable from './angels-table'
import AngelsActions from './angels-actions'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

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
}

interface ColumnVisibility {
  region: boolean
  focus: boolean
  industry: boolean
  check_size: boolean
  investment_approach: boolean
  type: boolean
}

interface AngelsTableWrapperProps {
  angels: Angel[]
  startupId: string
  paginationData: {
    totalCount: number
    hasMore: boolean
    currentPage: number
    limit: number
  } | null
  offset: number
  onPreviousPage: () => void
  onNextPage: () => void
  onSortChange: (key: string) => void
  columnVisibility: ColumnVisibility
}

const AngelsTableWrapper = React.memo(function AngelsTableWrapper({
  angels,
  startupId,
  paginationData,
  offset,
  onPreviousPage,
  onNextPage,
  onSortChange,
  columnVisibility,
}: AngelsTableWrapperProps) {
  const [selectedAngel, setSelectedAngel] = useState<Angel | null>(null)
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(false)

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!selectedAngel) {
        setSubmissions([])
        return
      }

      setLoadingSubmissions(true)
      try {
        const supabase = createSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('angel_submissions')
          .select('id, status, submission_date')
          .eq('startup_id', startupId)
          .eq('angel_id', selectedAngel.id)
          .order('submission_date', { ascending: false })

        if (error) {
          console.error('Error fetching submissions:', error)
          setSubmissions([])
        } else {
          setSubmissions(data as Submission[])
        }
      } catch (error) {
        console.error('Submission fetch error:', error)
        setSubmissions([])
      } finally {
        setLoadingSubmissions(false)
      }
    }

    if (isActionsOpen && selectedAngel) {
      fetchSubmissions()
    }
  }, [isActionsOpen, selectedAngel, startupId])

  const handleAngelHover = useCallback(
    (angel: Angel) => {
      if (!isActionsOpen) {
        setSelectedAngel(angel)
      }
    },
    [isActionsOpen],
  )

  const handleAngelLeave = useCallback(() => {
    if (!isActionsOpen) {
      setSelectedAngel(null)
    }
  }, [isActionsOpen])

  const handleAngelClick = useCallback((angel: Angel) => {
    setSelectedAngel(angel)
    setIsActionsOpen(true)
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    setIsActionsOpen(open)
    if (!open) {
      setTimeout(() => {
        setSelectedAngel(null)
      }, 300) // Animation duration
    }
  }, [])

  return (
    <>
      <div
        className="h-full"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
      >
        <AngelsTable
          angels={angels}
          startupId={startupId}
          paginationData={paginationData}
          offset={offset}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
          onSortChange={onSortChange}
          columnVisibility={columnVisibility}
          onAngelClick={handleAngelClick}
          onAngelHover={handleAngelHover}
          onAngelLeave={handleAngelLeave}
        />
      </div>

      <AngelsActions
        angel={selectedAngel}
        submissions={submissions}
        isOpen={isActionsOpen}
        onOpenChange={handleOpenChange}
        loading={loadingSubmissions}
      />
    </>
  )
})

export default AngelsTableWrapper
