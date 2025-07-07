'use client'

import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { XIcon } from '@/components/icons/XIcon'
import { PHIcon } from '@/components/icons/PHIcon'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'

interface ResourcesSectionProps {
  className?: string
}

export function ResourcesSection({ className = '' }: ResourcesSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const resources = [
    {
      icon: XIcon,
      title: 'Follow us on X',
      description: 'Get the latest updates',
      link: 'https://x.com/suparaise',
      cardColor: '',
      hoverColor: 'hover:text-[#000000] dark:hover:text-[#FFFFFF]',
      iconSize: 'w-6 h-6',
    },
    {
      icon: PHIcon,
      title: 'Product Hunt',
      description: 'Support our launch',
      link: 'https://producthunt.com/posts/suparaise',
      cardColor: '',
      hoverColor: 'hover:text-[#DA552F] dark:hover:text-[#DA552F]',
      iconSize: 'w-6 h-6',
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
    <div className={`${className}`}>
      <div className="flex gap-4 justify-start">
        {resources.map((item, index) => {
          return (
            <a
              key={index}
              href={item.link}
              target={item.isInternal ? '_self' : '_blank'}
              rel="noopener noreferrer"
              className="block group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Card
                className={`rounded-sm w-40 h-32 ${item.cardColor} hover:shadow-md border overflow-hidden transition-all duration-200 hover:scale-[1.02]`}
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
          )
        })}
      </div>
    </div>
  )
}
