'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useMemo, useState, useEffect } from 'react'
import { twMerge } from 'tailwind-merge'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import Spinner from '@/components/ui/spinner'
import { useUser } from '@/lib/contexts/user-context'

interface ActivityWidgetParams {
  startupId: string
  days?: number
}

export interface RunMetricsPeriod {
  timestamp: Date
  run_count: number
}

interface ActivityWidgetProps {
  className?: string
}

const fetchActivityWidget = async ({
  startupId,
  days = 270,
}: ActivityWidgetParams): Promise<{
  periods: Array<{
    timestamp: Date
    run_count: number
  }>
}> => {
  if (!startupId) {
    console.error('Missing startupId parameter')
    return { periods: [] }
  }
  const supabase = createSupabaseBrowserClient()
  try {
    const { data, error } = await supabase.rpc('fetch_daily_run_grid_data', {
      p_startup_id: startupId,
      p_days: days,
    })

    if (error) {
      console.error('Error fetching run activity widget:', error)
      return { periods: [] }
    }

    const rawData = data as Array<{
      date: string
      run_count: string | number
    }>

    const periods = rawData.map((item) => ({
      timestamp: new Date(item.date),
      run_count:
        typeof item.run_count === 'string'
          ? parseInt(item.run_count, 10)
          : item.run_count,
    }))

    return { periods }
  } catch (error) {
    console.error('Error in fetchActivityWidget:', error)
    return { periods: [] }
  }
}

const generateFullPeriodGrid = (
  periods: RunMetricsPeriod[],
  days = 270,
): RunMetricsPeriod[] => {
  const today = new Date()
  const endDate = new Date(today)
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - (days - 1))
  const startDayOfWeek = startDate.getDay()
  if (startDayOfWeek !== 0) {
    startDate.setDate(startDate.getDate() - startDayOfWeek)
  }

  const fullGrid: RunMetricsPeriod[] = []
  const periodsMap = new Map(
    periods.map((period) => [
      period.timestamp.toISOString().split('T')[0],
      period,
    ]),
  )

  const totalDays =
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    if (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0]
      const existingPeriod = periodsMap.get(dateKey)
      fullGrid.push(
        existingPeriod || {
          timestamp: currentDate,
          run_count: 0,
        },
      )
    }
  }

  return fullGrid
}

function getIntensityClass(count: number): string {
  if (count === 0)
    return 'bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-700/80'
  if (count >= 1 && count < 2)
    return 'bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/60'
  if (count >= 2 && count < 4)
    return 'bg-blue-200 dark:bg-blue-800/60 hover:bg-blue-300 dark:hover:bg-blue-700/80'
  if (count >= 4 && count < 6)
    return 'bg-blue-300 dark:bg-blue-700/80 hover:bg-blue-400 dark:hover:bg-blue-600/90'
  if (count >= 6 && count < 8)
    return 'bg-blue-400 dark:bg-blue-600/90 hover:bg-blue-500 dark:hover:bg-blue-500'
  if (count >= 8 && count < 10)
    return 'bg-blue-500 dark:bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-400'
  return 'bg-blue-600 dark:bg-blue-400 hover:bg-blue-700 dark:hover:bg-blue-300' // 10+
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function ActivityWidget({ className = '' }: ActivityWidgetProps) {
  const { currentStartupId } = useUser()
  const [runMetrics, setRunMetrics] = useState<{
    periods: RunMetricsPeriod[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      if (!currentStartupId) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      const data = await fetchActivityWidget({
        startupId: currentStartupId,
      })
      setRunMetrics(data)
      setIsLoading(false)
    }

    fetchActivity()
  }, [currentStartupId])

  const { grid, totalRuns } = useMemo(() => {
    if (!runMetrics?.periods) {
      return { grid: [], totalRuns: 0 }
    }
    const fullPeriodPeriods = generateFullPeriodGrid(runMetrics.periods, 270)

    const gridItems = fullPeriodPeriods
      .map((period: RunMetricsPeriod, i: number) => {
        const activeClass = getIntensityClass(period.run_count)
        const dateStr = period.timestamp.toISOString().split('T')[0]
        if (!dateStr) return null

        return (
          <Tooltip key={i} delayDuration={0}>
            <TooltipTrigger
              className={twMerge(
                'h-3 w-3 rounded-sm transition-all cursor-pointer border border-transparent hover:border-blue-400/50 dark:hover:border-blue-500/50',
                activeClass,
              )}
            />
            <TooltipContent className="text-sm bg-background border border-border shadow-md">
              {period.run_count > 0 && (
                <div className="font-medium text-foreground">
                  {period.run_count} {period.run_count === 1 ? 'run' : 'runs'}
                </div>
              )}
              <div className="text-muted-foreground">{formatDate(dateStr)}</div>
            </TooltipContent>
          </Tooltip>
        )
      })
      .filter(Boolean)

    const total = fullPeriodPeriods.reduce(
      (sum: number, period: RunMetricsPeriod) => sum + period.run_count,
      0,
    )

    return { grid: gridItems, totalRuns: total }
  }, [runMetrics?.periods])

  return (
    <Card
      className={twMerge(
        'h-full flex-col justify-between rounded-sm',
        className,
      )}
    >
      {isLoading ? (
        <div className="flex h-full flex-col items-center justify-center p-6">
          <Spinner />
        </div>
      ) : (
        <>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Runs</CardTitle>
            <div className="flex items-center gap-2">
              <h2 className="text-sm text-muted-foreground">Last 270 days</h2>
              {totalRuns > 0 && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {totalRuns} {totalRuns === 1 ? 'run' : 'runs'}
                  </span>
                </>
              )}
            </div>
          </CardHeader>
          <TooltipProvider>
            <CardContent className="bg-background/50 dark:bg-background/30 mx-4 mb-2 flex flex-row gap-x-1 rounded-sm p-4">
              <div className="hidden flex-col font-mono text-[9px] text-muted-foreground xl:flex gap-2">
                {[null, 'Mon', null, 'Wed', null, 'Fri', null].map((day, i) => (
                  <div
                    key={i}
                    className="h-3 flex items-center justify-start leading-none w-6"
                  >
                    {day && <span>{day}</span>}
                  </div>
                ))}
              </div>
              <div className="grid grid-flow-col grid-cols-[repeat(39,minmax(0,1fr))] grid-rows-[repeat(7,minmax(0,1fr))] gap-2">
                {grid}
              </div>
            </CardContent>
          </TooltipProvider>
          <CardContent className="pt-0 mx-2 pb-4">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800/60" />
                  <div className="w-3 h-3 rounded-sm bg-blue-100 dark:bg-blue-900/40" />
                  <div className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-800/60" />
                  <div className="w-3 h-3 rounded-sm bg-blue-300 dark:bg-blue-700/80" />
                  <div className="w-3 h-3 rounded-sm bg-blue-400 dark:bg-blue-600/90" />
                  <div className="w-3 h-3 rounded-sm bg-blue-500 dark:bg-blue-500" />
                  <div className="w-3 h-3 rounded-sm bg-blue-600 dark:bg-blue-400" />
                </div>
                <span className="text-xs text-muted-foreground">More</span>
              </div>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}
