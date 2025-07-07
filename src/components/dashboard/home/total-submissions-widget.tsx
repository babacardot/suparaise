'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TotalApplicationsWidgetProps {
  totalApplications: number
}

export function TotalApplicationsWidget({
  totalApplications,
}: TotalApplicationsWidgetProps) {
  return (
    <Card className="rounded-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Submissions</CardTitle>
      </CardHeader>
      <CardContent className="pb-0.5">
        <div className="flex justify-start">
          <div className="text-4xl font-bold">{totalApplications}</div>
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          Across funds, accelerators, and angels
        </p>
      </CardContent>
    </Card>
  )
}
