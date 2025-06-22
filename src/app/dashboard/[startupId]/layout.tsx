import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface StartupLayoutProps {
    children: React.ReactNode
    params: { startupId: string }
}

async function getStartupByIdAndUser(startupId: string, userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .rpc('get_startup_by_id', {
            p_startup_id: startupId,
            p_user_id: userId
        })

    if (error) {
        console.error('Error fetching startup:', error)
        return null
    }

    return data
}

export default async function StartupLayout({ children, params }: StartupLayoutProps) {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/login')
    }

    // Verify startup belongs to user
    const startup = await getStartupByIdAndUser(params.startupId, user.id)

    if (!startup) {
        notFound()
    }

    return (
        <div className="startup-scoped-dashboard">
            {children}
        </div>
    )
} 