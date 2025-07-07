'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SubmissionsQuotaWidgetProps {
  submissionsUsed: number
  submissionsLimit: number
}

export function SubmissionsQuotaWidget({
  submissionsUsed,
  submissionsLimit,
}: SubmissionsQuotaWidgetProps) {
  const percentage =
    submissionsLimit > 0 ? (submissionsUsed / submissionsLimit) * 100 : 0
  const submissionsLeft = submissionsLimit - submissionsUsed

  return (
    <Card className="rounded-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Quota</CardTitle>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="flex justify-start">
          <div className="text-4xl font-bold">
            {submissionsUsed} / {submissionsLimit}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-sm h-2.5 dark:bg-gray-700 mt-3">
          <div
            className="bg-green-600 dark:bg-green-500 h-2.5 rounded-sm"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-end mt-1">
          <p className="text-xs text-muted-foreground">
            {submissionsLeft} remaining
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
