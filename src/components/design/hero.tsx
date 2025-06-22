'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Button as ExpandButton } from '@/components/design/button-expand'
import { AnimatedGroup } from '@/components/ui/animated-group'
const transitionVariants = {
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
        type: 'spring' as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
}

export function HeroSection() {
  const playClickSound = () => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/light.mp3')
      audio.volume = 0.3
      audio.play().catch(() => {
        // Silently handle audio play errors (autoplay policies, etc.)
      })
    }
  }

  return (
    <>
      <main className="overflow-hidden">
        <section>
          <div className="relative pt-24">
            <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"></div>
            <div className="mx-auto max-w-5xl px-6">
              <div className="sm:mx-auto lg:mr-auto">
                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                >
                  <h1 className="mt-8 max-w-3xl text-balance text-5xl font-medium md:text-6xl lg:mt-16">
                    Automate your fundraising efforts
                  </h1>
                  <p className="mt-8 max-w-2xl text-pretty text-lg">
                    Let our agents handle the tedious task of filling out VC
                    application forms and reaching out to funds, so you can
                    focus on building your business.
                  </p>
                  <div className="mt-12 flex items-center gap-2">
                    <ExpandButton
                      key={1}
                      asChild
                      size="lg"
                      onClick={playClickSound}
                      className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm px-4 text-sm"
                      Icon={ChevronRight}
                      iconPlacement="right"
                    >
                      <Link href="/signup" prefetch={true}>
                        <span className="text-nowrap">Get started</span>
                      </Link>
                    </ExpandButton>
                    <Button
                      key={2}
                      asChild
                      size="lg"
                      variant="outline"
                      onClick={playClickSound}
                      className="rounded-sm px-5 text-base"
                    >
                      <Link href="/login" prefetch={true}>
                        <span className="text-nowrap">Login</span>
                      </Link>
                    </Button>
                  </div>
                </AnimatedGroup>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
