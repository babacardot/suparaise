'use client'

import React from 'react'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/actions/utils'

interface DateRangePickerProps {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
  onClear: () => void
  className?: string
}

export function DateRangePicker({
  date,
  setDate,
  onClear,
  className,
}: DateRangePickerProps) {
  const isDateSet = date?.from || date?.to

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-between h-10 rounded-sm bg-card border-border text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30]',
            className,
          )}
        >
          <div className="flex items-center space-x-2">
            {isDateSet && date ? (
              <span className="text-sm font-medium">
                {date.from && date.to
                  ? `${format(date.from, 'LLL d, y')} - ${format(date.to, 'LLL d, y')}`
                  : date.from
                    ? `From ${format(date.from, 'LLL d, y')}`
                    : date.to
                      ? `To ${format(date.to, 'LLL d, y')}`
                      : ''}
              </span>
            ) : (
              <span className="text-muted-foreground text-sm">Date</span>
            )}
          </div>
          {isDateSet ? (
            <div
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClear()
              }}
              className="translate-x-1.5 w-6 h-6 shrink-0 rounded-sm p-1 transition-colors"
            >
              <LottieIcon
                animationData={animations.cross}
                size={16}
                className="opacity-50 hover:opacity-100"
              />
            </div>
          ) : (
            <LottieIcon
              animationData={animations.arrowDown}
              size={16}
              className="ml-2 shrink-0 opacity-50 hover:opacity-100"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-card text-card-foreground rounded-sm"
        align="start"
      >
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  )
}
