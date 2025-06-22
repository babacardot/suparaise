import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Home</h1>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-sm border p-6">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <h3 className="text-xl font-bold tracking-tight">
                            Manage Funds
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Browse and manage your target VC funds. Find the perfect match for your startup.
                        </p>
                        <Link href="/dashboard/funds">
                            <Button>View Funds</Button>
                        </Link>
                    </div>
                </div>
                <div className="rounded-sm border p-6">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <h3 className="text-xl font-bold tracking-tight">
                            Track Applications
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Monitor your application submissions and track their progress.
                        </p>
                        <Link href="/dashboard/applications">
                            <Button>View Applications</Button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="flex flex-1 items-center justify-center rounded-sm border border-dashed shadow-sm">
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        Welcome to Suparaise
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        You have no startup profiles yet. Get started by creating a new
                        profile for your startup.
                    </p>
                    <Link href="/dashboard/setup" className="mt-4">
                        <Button>Get Started</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
} 