'use client'

import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useUser } from '@/lib/contexts/user-context'
import Image from 'next/image'

interface MobileUpgradeCardProps {
  className?: string
  startupId: string
}

export function MobileUpgradeCard({
  className = '',
  startupId,
}: MobileUpgradeCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { subscription } = useUser()

  // Determine if user is on MAX plan
  const isMaxUser = subscription?.permission_level === 'MAX'

  return (
    <div className={className}>
      {isMaxUser ? (
        // Enterprise Upgrade Card for MAX users
        <a
          href="mailto:hello@suparaise.com?subject=Enterprise Plan Inquiry&body=Hi! I'm currently on the MAX plan and would like to learn more about your Enterprise offerings and custom pricing."
          className="block group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Card className="rounded-sm w-full h-32 hover:shadow-md border overflow-hidden transition-all duration-200 hover:scale-[1.02] relative">
            <div className="absolute inset-0">
              <Image
                src="/random/600x600.webp"
                alt="Enterprise upgrade background"
                fill
                className="object-cover opacity-20 dark:opacity-30"
              />
            </div>
            <CardContent className="px-4 pt-1 pb-2 h-full flex flex-col relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-medium px-2 py-1 rounded-sm">
                    Enterprise
                  </span>
                </div>
                <motion.div
                  animate={
                    isHovered
                      ? { x: [0, 4, 0], rotate: [0, 5, 0] }
                      : { x: 0, rotate: 0 }
                  }
                  transition={{
                    duration: 0.5,
                    repeat: isHovered ? Infinity : 0,
                    repeatDelay: 1,
                  }}
                  className="text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                ></motion.div>
              </div>
              <h3 className="font-bold mb-2 text-foreground text-xs">
                Ready to scale ?
              </h3>
              <p className="text-[10px] text-muted-foreground leading-tight">
                500+ applications • 25 parallel submissions • Unlimited queue •
                Dedicated support
              </p>
            </CardContent>
          </Card>
        </a>
      ) : (
        // MAX Upgrade Card for non-MAX users
        <a
          href={`/dashboard/${startupId}/settings/billing`}
          className="block group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Card className="rounded-sm w-full h-32 hover:shadow-md border overflow-hidden transition-all duration-200 hover:scale-[1.02] relative">
            <div className="absolute inset-0">
              <Image
                src="/random/600x600.webp"
                alt="MAX upgrade background"
                fill
                className="object-cover opacity-20 dark:opacity-30"
              />
            </div>
            <CardContent className="px-4 pt-1 pb-2 h-full flex flex-col relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-medium px-2 py-1 rounded-sm">
                    Max
                  </span>
                </div>
                <motion.div
                  animate={
                    isHovered
                      ? { x: [0, 4, 0], rotate: [0, 5, 0] }
                      : { x: 0, rotate: 0 }
                  }
                  transition={{
                    duration: 0.5,
                    repeat: isHovered ? Infinity : 0,
                    repeatDelay: 1,
                  }}
                  className="text-muted-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors"
                ></motion.div>
              </div>
              <h3 className="font-bold mb-2 text-foreground text-xs">
                Ready for maximum outreach?
              </h3>
              <p className="text-[10px] text-muted-foreground leading-tight">
                All funds • 50 applications monthly • 5x faster with concurrent
                processing • Priority support
              </p>
            </CardContent>
          </Card>
        </a>
      )}
    </div>
  )
}
