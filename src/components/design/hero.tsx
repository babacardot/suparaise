'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { useUser } from '@/lib/contexts/user-context'
import { Button } from '@/components/ui/button'
import { Button as ExpandButton } from '@/components/design/button-expand'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { ProductHuntBadge } from '@/components/design/product-hunt-badge'

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(4px)',
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
  const { user } = useUser()

  const playClickSound = () => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/light.mp3')
      audio.volume = 0.4
      audio.play().catch(() => {
        // Silently handle audio play errors (autoplay policies, etc.)
      })
    }
  }

  return (
    <>
      <main className="overflow-hidden select-none">
        <section>
          <div className="relative pt-24">
            <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(100%_100%_at_50%_100%,transparent_0%,var(--background)_60%)]"></div>
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
                    {!user && (
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
                    )}
                    <Button
                      key={2}
                      asChild
                      size="lg"
                      variant="outline"
                      onClick={playClickSound}
                      className="rounded-sm px-5 text-base h-[42px] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <Link href="/about" prefetch={true}>
                        <span className="text-nowrap">Learn more</span>
                      </Link>
                    </Button>
                  </div>

                  {/* Product Hunt Badge */}
                  <div className="hidden sm:flex mt-6 -mb-8 translate-x-5 justify-end">
                    <ProductHuntBadge />
                  </div>
                </AnimatedGroup>
              </div>
            </div>

            {/* Portal Image Section */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 1.0,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="hidden md:block relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                <div
                  aria-hidden
                  className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                />
                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-5xl overflow-hidden rounded-3xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                  <Image
                    className="aspect-[15/8] relative rounded-sm dark:hidden"
                    src="/random/portal_w.webp"
                    alt="Portal interface"
                    width={2700}
                    height={1440}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                  <Image
                    className="aspect-[15/8] relative rounded-sm hidden dark:block"
                    src="/random/portal_b.webp"
                    alt="Portal interface"
                    width={2700}
                    height={1440}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </main>
    </>
  )
}
