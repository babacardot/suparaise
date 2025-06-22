import { redirect } from 'next/navigation'

interface DashboardPageProps {
    params: { startupId: string }
}

export default async function DashboardPage({ params }: DashboardPageProps) {
    // Redirect to home by default
    redirect(`/dashboard/${params.startupId}/home`)
} 