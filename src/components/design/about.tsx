'use client'

import React from 'react'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { useTheme } from 'next-themes'
import { LottieIcon } from '@/components/design/lottie-icon'
import { Globe } from '@/components/design/globe'
import { animations } from '@/lib/utils/lottie-animations'

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

const achievements = [
  { label: 'Applications automated', value: '25,000+' },
  { label: 'Founders served', value: '1,000+' },
  { label: 'Success rate', value: '97.9%' },
  { label: 'Meetings booked', value: '400+' },
]

const features = [
  {
    animation: animations.bolt,
    title: 'Accuracy',
    description:
      'The most advanced AI models fill out applications exactly as you would, with precision that matches your voice.',
    color: 'green',
    bgClass:
      'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800',
    customColor: [0.133, 0.773, 0.369] as [number, number, number], // Green-500
  },
  {
    animation: animations.speed,
    title: 'Scale',
    description:
      'Our agents can fill out 5 applications simultaneously in the time it takes you to complete just one.',
    color: 'blue',
    bgClass:
      'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800',
    customColor: [0.239, 0.596, 0.965] as [number, number, number], // Blue-500
  },
  {
    animation: animations.globe,
    title: 'Reach',
    description:
      'Apply to funds, accelerators, and angels from Silicon Valley to Singapore and throughout EMEA.',
    color: 'amber',
    bgClass:
      'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800',
    customColor: [0.965, 0.647, 0.125] as [number, number, number], // Amber-500
  },
]

export const About = () => {
  const { theme } = useTheme()
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  return (
    <section className="relative overflow-hidden select-none">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_10%,transparent_0%,var(--background)_75%)]"></div>

      <div className="mx-auto max-w-5xl px-6 py-20">
        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.2,
                },
              },
            },
            ...transitionVariants,
          }}
        >
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Turn months of fundraising into days
            </h1>
            <p className="text-lg text-foreground max-w-4xl mx-auto leading-relaxed">
              Suparaise puts your fundraising on autopilot. Let AI agents handle
              everything from application forms to personalized outreach. Built
              by a founder who got tired of wasting his time on paperwork
              instead of building his business.
            </p>
          </div>

          {/* Problem Section */}
          <div className="grid gap-12 lg:grid-cols-2 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold mb-4">The struggle</h2>
              <p className="text-foreground text-md leading-relaxed">
                Fundraising steals your most valuable resource: time.
                You&apos;re spending weeks on mind-numbing tasks: copying the
                same pitch into countless forms, researching which VCs actually
                invest in your stage, and crafting personalized outreach emails
                that often go unanswered. Each application takes 45 minutes of
                your valuable time - time worth $100+ per hour that should be
                spent building your product and acquiring customers.
              </p>
              <p className="text-foreground text-md leading-relaxed">
                Suparaise changes this. Our agents act as your dedicated
                fundraising team, handling applications and outreach with
                human-level personalization at machine speed and scale. You
                focus on building; we handle the fundraising grind.
              </p>
            </div>

            {/* Globe Component */}
            <div className="relative h-96 lg:h-[500px] mt-10">
              <Globe className="relative" theme={theme} />
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="mb-20">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="text-center space-y-4 p-6 rounded-sm border bg-card hover:shadow-md transition-shadow"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div
                    className={`inline-flex items-center justify-center p-3 rounded-sm ${feature.bgClass}`}
                  >
                    <LottieIcon
                      animationData={feature.animation}
                      size={24}
                      loop={true}
                      autoplay={hoveredIndex === index}
                      customColor={feature.customColor}
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="relative overflow-hidden rounded-sm bg-gradient-to-br from-muted/50 via-background to-muted/30 p-12 border mb-20">
            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-semibold mb-4 text-foreground">
                  Our impact in numbers
                </h2>
                <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                  Real numbers from founders who&apos;ve used Suparaise to
                  automate their fundraising process.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                {achievements.map((stat, index) => {
                  // Split number from symbol for better styling
                  const formatStatValue = (value: string) => {
                    if (value.includes('+')) {
                      const number = value.replace('+', '')
                      return (
                        <>
                          <span className="text-4xl lg:text-5xl font-bold text-primary">
                            {number}
                          </span>
                          <span className="text-2xl lg:text-3xl font-bold text-primary/80 ml-1">
                            +
                          </span>
                        </>
                      )
                    } else if (value.includes('%')) {
                      const number = value.replace('%', '')
                      return (
                        <>
                          <span className="text-4xl lg:text-5xl font-bold text-primary">
                            {number}
                          </span>
                          <span className="text-2xl lg:text-3xl font-bold text-primary/80 ml-1">
                            %
                          </span>
                        </>
                      )
                    }
                    return (
                      <span className="text-4xl lg:text-5xl font-bold text-primary">
                        {value}
                      </span>
                    )
                  }

                  return (
                    <div
                      key={index}
                      className={`space-y-2 ${index > 0 ? 'lg:border-l lg:border-border/40 lg:pl-6' : ''}`}
                    >
                      <div className="flex items-baseline justify-center">
                        {formatStatValue(stat.value)}
                      </div>
                      <div className="text-foreground font-medium text-sm">
                        {stat.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  )
}
