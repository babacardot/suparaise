import React from 'react'

export default async function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your startup.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Dashboard metrics would go here */}
        <div className="p-6 bg-card text-card-foreground rounded-sm border">
          <h3 className="font-semibold">Total Applications</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>

        <div className="p-6 bg-card text-card-foreground rounded-sm border">
          <h3 className="font-semibold">In Progress</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>

        <div className="p-6 bg-card text-card-foreground rounded-sm border">
          <h3 className="font-semibold">Completed</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>

        <div className="p-6 bg-card text-card-foreground rounded-sm border">
          <h3 className="font-semibold">Success Rate</h3>
          <p className="text-2xl font-bold mt-2">-</p>
        </div>
      </div>
    </div>
  )
}
