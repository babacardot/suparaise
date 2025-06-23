import React from 'react'

export default async function ApplicationsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">VC Applications</h1>
                <p className="text-muted-foreground">
                    Track your venture capital funding applications.
                </p>
            </div>

            <div className="rounded-sm border p-8 text-center">
                <h3 className="text-lg font-semibold">No applications yet</h3>
                <p className="text-muted-foreground mt-2">
                    Start your first VC application to see your progress here.
                </p>
            </div>
        </div>
    )
} 