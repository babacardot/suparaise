'use client'

import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { XIcon } from '@/components/icons/XIcon'
import { PHIcon } from '@/components/icons/PHIcon'
import { GitHubIcon } from '@/components/icons/GitHubIcon'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'
import Image from 'next/image'

interface ResourcesSectionProps {
  className?: string
  startupId: string
}

export function ResourcesSection({ className = '', startupId }: ResourcesSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const resources = [
    {
      icon: XIcon,
      title: 'Follow us on X',
      description: 'Get the latest updates',
      link: 'https://x.com/suparaise',
      cardColor: '',
      hoverColor: 'hover:text-[#000000] dark:hover:text-[#FFFFFF]',
      iconSize: 'w-5 h-5 mb-1',
    },
    {
      icon: PHIcon,
      title: 'Support our launch',
      description: 'Upvote us on PH',
      link: 'https://producthunt.com/posts/suparaise',
      cardColor: '',
      hoverColor: 'hover:text-[#DA552F] dark:hover:text-[#DA552F]',
      iconSize: 'w-6 h-6',
    },
    {
      icon: GitHubIcon,
      title: 'Follow us on Github',
      description: 'Support our development',
      link: 'https://github.com/princemuichkine',
      cardColor: '',
      hoverColor: 'hover:text-[#6f42c1] dark:hover:text-[#6f42c1]',
      iconSize: 'w-5 h-5 mb-1',
    },

    {
      icon: 'lottie',
      title: 'About us',
      description: 'Learn more about our goals',
      link: 'https://suparaise.com/about',
      cardColor: '',
      hoverColor: 'hover:text-foreground',
      iconSize: 'w-5 h-5',
      isInternal: true,
    },
  ]

  return (
    <div className={`${className} relative`}>
      <div className="flex gap-4">
        {resources.map((item, index) => {
          return (
            <div
              key={index}
              className="flex-none w-40"
            >
              <a
                href={item.link}
                target={item.isInternal ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className="block group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Card
                  className={`rounded-sm w-full h-32 ${item.cardColor} hover:shadow-md border overflow-hidden transition-all duration-200 hover:scale-[1.02]`}
                >
                  <CardContent className="px-3 pt-1 pb-2 h-full flex flex-col">
                    <div className={`flex items-start ${item.icon === 'lottie' ? 'mb-2' : 'mb-3.5'}`}>
                      <motion.div
                        animate={
                          hoveredIndex === index
                            ? {
                              rotate: [0, 5, -5, 0],
                              scale: [1, 1.05, 1],
                            }
                            : {
                              rotate: 0,
                              scale: 1,
                            }
                        }
                        transition={{
                          duration: hoveredIndex === index ? 1.5 : 0.3,
                          repeat: hoveredIndex === index ? Infinity : 0,
                          repeatDelay: hoveredIndex === index ? 2 : 0,
                          ease: 'easeInOut',
                        }}
                        className={`text-muted-foreground transition-colors ${item.hoverColor}`}
                      >
                        {item.icon === 'lottie' ? (
                          <LottieIcon animationData={animations.star} size={24} />
                        ) : (
                          <item.icon className={item.iconSize} />
                        )}
                      </motion.div>
                    </div>
                    <h3 className="font-semibold mb-2 text-foreground text-xs">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </a>
            </div>
          )
        })}

        {/* Spacer to maintain layout */}
        <div className="flex-grow"></div>
      </div>

      {/* MAX Upgrade Card - Positioned to extend beyond container */}
      <div className="absolute top-0 left-[calc(4*10rem+4*1rem)] right-0 lg:right-[calc(-41.8%-1rem)]">
        <a
          href={`/dashboard/${startupId}/settings/billing`}
          className="block group h-full"
          onMouseEnter={() => setHoveredIndex(resources.length)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <Card className="rounded-sm w-full h-32 hover:shadow-md border overflow-hidden transition-all duration-200 hover:scale-[1.02] relative">
            <div className="absolute inset-0">
              <Image
                src="/random/600x600.webp"
                alt="MAX upgrade background"
                fill
                className="object-cover opacity-30"
              />
            </div>
            <CardContent className="px-4 pt-3 pb-2 h-full flex flex-col relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                    Go MAX
                  </span>
                </div>
                <motion.div
                  animate={
                    hoveredIndex === resources.length
                      ? { x: [0, 4, 0], rotate: [0, 5, 0] }
                      : { x: 0, rotate: 0 }
                  }
                  transition={{
                    duration: 0.5,
                    repeat: hoveredIndex === resources.length ? Infinity : 0,
                    repeatDelay: 1,
                  }}
                  className="text-muted-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors"
                >
                </motion.div>
              </div>
              <h3 className="font-bold mb-2 text-foreground text-sm">
                Need more runs and more funds?
              </h3>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Access 2,000+ funds • 125 runs per month • 5 parallel submissions • Priority support
              </p>

            </CardContent>
          </Card>
        </a>
      </div>
    </div>
  )
}
