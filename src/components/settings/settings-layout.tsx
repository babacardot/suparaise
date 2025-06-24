'use client'

import React, { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import SettingsNav from './settings-nav'
import { Separator } from '@/components/ui/separator'
import { useUser } from '@/lib/contexts/user-context'

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const params = useParams()
  const pathname = usePathname()
  const startupId = params.startupId as string
  const { user, supabase } = useUser()
  const [foundersCount, setFoundersCount] = useState(1)

  // Fetch founders count to determine icon and title
  useEffect(() => {
    const fetchFoundersCount = async () => {
      if (!user || !startupId) return

      try {
        const { data, error } = await supabase.rpc('get_startup_founders', {
          p_user_id: user.id,
          p_startup_id: startupId,
        })

        if (!error && data && Array.isArray(data)) {
          setFoundersCount(data.length)
        }
      } catch (error) {
        console.error('Error fetching founders count:', error)
      }
    }

    fetchFoundersCount()
  }, [user, startupId, supabase])

  const sidebarItems = [
    {
      title: foundersCount > 1 ? 'Founders' : 'Founder',
      href: `/dashboard/${startupId}/settings`,
      icon: foundersCount > 1 ? 'group' : 'profile',
    },
    {
      title: 'Company',
      href: `/dashboard/${startupId}/settings/company`,
      icon: 'work',
    },
    {
      title: 'Agents',
      href: `/dashboard/${startupId}/settings/agent`,
      icon: 'bolt',
    },
    {
      title: 'Billing',
      href: `/dashboard/${startupId}/settings/billing`,
      icon: 'creditCard',
    },
    {
      title: 'Integrations',
      href: `#`,
      icon: 'integration',
    },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 space-y-2 pb-4 mt-1.5">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, company information, and configuration.
        </p>
      </div>

      <Separator className="flex-shrink-0" />

      <div className="flex-1 flex gap-6 pt-6 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <SettingsNav items={sidebarItems} currentPath={pathname} />
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl overflow-hidden">
          <div className="h-full bg-background border rounded-sm overflow-hidden">
            <div className="h-full p-6 overflow-hidden">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
