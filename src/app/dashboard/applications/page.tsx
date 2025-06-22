import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ApplicationsPage() {
    // Mock data - replace with real data from Supabase
    const applications = [
        {
            id: 1,
            fundName: 'Andreessen Horowitz',
            status: 'pending',
            submittedAt: '2024-01-15',
            nextAction: 'Waiting for review',
        },
        {
            id: 2,
            fundName: 'Sequoia Capital',
            status: 'in_progress',
            submittedAt: '2024-01-10',
            nextAction: 'Follow-up meeting scheduled',
        },
        {
            id: 3,
            fundName: 'Y Combinator',
            status: 'completed',
            submittedAt: '2024-01-05',
            nextAction: 'Application accepted',
        },
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'in_progress':
                return 'bg-blue-100 text-blue-800'
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'failed':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Applications</h1>
                <Button>New Application</Button>
            </div>

            <div className="grid gap-4">
                {applications.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-sm border border-dashed shadow-sm p-8">
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h3 className="text-2xl font-bold tracking-tight">
                                No Applications Yet
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Start applying to VC funds to see your applications here.
                            </p>
                            <Button className="mt-4">Browse Funds</Button>
                        </div>
                    </div>
                ) : (
                    applications.map((application) => (
                        <Card key={application.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{application.fundName}</CardTitle>
                                    <Badge className={getStatusColor(application.status)}>
                                        {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('_', ' ')}
                                    </Badge>
                                </div>
                                <CardDescription>
                                    Submitted on {new Date(application.submittedAt).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {application.nextAction}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
} 