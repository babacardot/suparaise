import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function FundsPage() {
    // Mock data - replace with real data from Supabase
    const funds = [
        {
            id: 1,
            name: 'Andreessen Horowitz',
            website: 'a16z.com',
            stages: ['Seed', 'Series A', 'Series B'],
            industries: ['B2B SaaS', 'AI/ML', 'Fintech'],
            regions: ['United States', 'Global'],
            description: 'Leading venture capital firm investing in bold entrepreneurs building the future.',
        },
        {
            id: 2,
            name: 'Sequoia Capital',
            website: 'sequoiacap.com',
            stages: ['Seed', 'Series A', 'Series B', 'Growth'],
            industries: ['Consumer', 'Enterprise', 'Healthcare'],
            regions: ['United States', 'China', 'India'],
            description: 'Partner with companies from idea to IPO and beyond.',
        },
        {
            id: 3,
            name: 'Y Combinator',
            website: 'ycombinator.com',
            stages: ['Pre-seed', 'Seed'],
            industries: ['All stages'],
            regions: ['Global'],
            description: 'The world&apos;s most powerful startup accelerator.',
        },
    ]

    const getStageColor = (stage: string) => {
        const colors = {
            'Pre-seed': 'bg-purple-100 text-purple-800',
            'Seed': 'bg-blue-100 text-blue-800',
            'Series A': 'bg-green-100 text-green-800',
            'Series B': 'bg-yellow-100 text-yellow-800',
            'Growth': 'bg-red-100 text-red-800',
            'All stages': 'bg-gray-100 text-gray-800',
        }
        return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Funds</h1>
                <div className="flex gap-2">
                    <Input placeholder="Search funds..." className="w-64" />
                    <Button variant="outline">Filter</Button>
                </div>
            </div>

            <div className="grid gap-4">
                {funds.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-sm border border-dashed shadow-sm p-8">
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h3 className="text-2xl font-bold tracking-tight">
                                No Funds Available
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                We&apos;re constantly adding new VC funds to our database.
                            </p>
                            <Button className="mt-4">Suggest a Fund</Button>
                        </div>
                    </div>
                ) : (
                    funds.map((fund) => (
                        <Card key={fund.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{fund.name}</CardTitle>
                                        <CardDescription>{fund.website}</CardDescription>
                                    </div>
                                    <Button>Apply</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    {fund.description}
                                </p>

                                <div>
                                    <h4 className="text-sm font-medium mb-2">Investment Stages</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {fund.stages.map((stage) => (
                                            <Badge key={stage} variant="secondary" className={getStageColor(stage)}>
                                                {stage}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-2">Industries</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {fund.industries.map((industry) => (
                                            <Badge key={industry} variant="outline">
                                                {industry}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-2">Regions</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {fund.regions.map((region) => (
                                            <Badge key={region} variant="outline">
                                                {region}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
} 