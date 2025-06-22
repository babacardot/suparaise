import { redirect } from 'next/navigation'

interface DashboardPageProps {
    params: Promise<{ startupId: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
    // Await the async params
    const { startupId } = await params

    // Redirect to home by default
    redirect(`/dashboard/${startupId}/home`)
} 