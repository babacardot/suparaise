'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { AnimatedGroup } from '@/components/ui/animated-group'
import Image from 'next/image'
import { Variants } from 'framer-motion'
import { useTheme } from 'next-themes'

const transitionVariants: { item: Variants } = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
}

export interface CustomerLogo {
  srcLight: string
  srcDark: string
  alt: string
  height: number
  width: number
}

interface CustomersSectionProps {
  customers: CustomerLogo[]
  className?: string
}

export function CustomersSection({
  customers = [],
  className,
}: CustomersSectionProps) {
  const { resolvedTheme } = useTheme()

  return (
    <section
      className={`bg-background pb-16 pt-16 md:pb-32 ${className ?? ''}`}
    >
      <div className="group relative m-auto max-w-5xl px-6">
        <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-150">
          <Link
            href="/"
            className="block text-sm font-bold duration-150 hover:opacity-75 text-green-300 dark:text-white"
          >
            <span>Meet our early customers</span>
            <ChevronRight className="ml-1 inline-block size-3" />
          </Link>
        </div>
        <AnimatedGroup
          variants={transitionVariants}
          className="group-hover:blur-xs mx-auto mt-12 grid max-w-2xl grid-cols-4 items-center gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14"
        >
          {customers.map((logo, index) => (
            <div key={index} className="flex">
              <Image
                className="mx-auto h-auto w-fit"
                src={
                  resolvedTheme === 'dark' && logo.srcDark
                    ? logo.srcDark
                    : logo.srcLight
                }
                alt={logo.alt}
                height={logo.height}
                width={logo.width}
              />
            </div>
          ))}
        </AnimatedGroup>
      </div>
    </section>
  )
}
