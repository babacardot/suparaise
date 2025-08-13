'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TotalApplicationsWidgetProps {
  totalApplications: number
  usageSubmissionsThisMonth?: number
}

export function TotalApplicationsWidget({
  totalApplications,
  usageSubmissionsThisMonth = 0,
}: TotalApplicationsWidgetProps) {
  return (
    <Card className="rounded-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-base md:text-lg font-medium">
          Submissions
        </CardTitle>
        {usageSubmissionsThisMonth > 0 && (
          <Badge
            variant="outline"
            className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
          >
            +{usageSubmissionsThisMonth} usage
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pb-0.5">
        <div className="flex justify-start items-end gap-2">
          <div className="text-3xl md:text-4xl font-bold">
            {totalApplications}
          </div>
          {usageSubmissionsThisMonth > 0 && (
            <div className="text-xs md:text-sm text-foreground/80 pb-1">
              ({totalApplications - usageSubmissionsThisMonth} plan +{' '}
              {usageSubmissionsThisMonth} usage)
            </div>
          )}
        </div>
        <p className="text-xs text-foreground/80 mt-7">
          Across all opportunities
        </p>
      </CardContent>
    </Card>
  )
}
