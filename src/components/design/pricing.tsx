'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PricingTier {
  name: string
  price: string | number
  priceSuffix: string
  description: string
  features: string[]
  buttonText: string
  href: string
  popular?: boolean
  permissionLevel: 'FREE' | 'PRO' | 'MAX' | 'ENTERPRISE'
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: 'Free',
    priceSuffix: '',
    description: 'Get started with agentic fundraising',
    features: [
      '3 fund applications per month',
      'Access to 150 pre-screened funds',
      'Claude 4 sonnet',
    ],
    buttonText: '',
    href: '/signup',
    permissionLevel: 'FREE',
  },
  {
    name: 'Pro',
    price: 30,
    priceSuffix: '/mo',
    description: 'For startups actively raising their first funding round',
    features: [
      '50 runs per month',
      'Access to 1,200 global funds',
      '3 parallel submissions',
      'Smart queuing system',
      'Agent customization',
    ],
    buttonText: 'Start free trial',
    href: '/signup',
    popular: true,
    permissionLevel: 'PRO',
  },
  {
    name: 'Max',
    price: 100,
    priceSuffix: '/mo',
    description: 'For startups that need meetings now',
    features: [
      '125 runs per month',
      'Access to 2,000+ global funds',
      '5 parallel submissions',
      'Advanced application tracking',
      'Developer mode',
      'Priority support',
    ],
    buttonText: 'Get started',
    href: '/signup',
    permissionLevel: 'MAX',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    priceSuffix: '',
    description: 'Volume discounts available',
    features: [
      '500+ fund applications per month',
      'Up to 25 parallel submissions',
      'Premium support',
    ],
    buttonText: 'Contact sales',
    href: 'mailto:hello@suparaise.com',
    permissionLevel: 'ENTERPRISE',
  },
]

export const Pricing = () => {
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
    <section id="pricing" className="pt-32 pb-20 select-none">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-sm">Pricing</div>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter">
            Simple, transparent pricing
          </h2>
          <p className="text-center mt-5 opacity-75">
            Choose the plan that fits your needs.
          </p>

          <div className="grid gap-8 lg:grid-cols-3 mt-12 w-full max-w-6xl">
            {pricingTiers.slice(0, 3).map((tier, idx) => (
              <div
                key={idx}
                className={`relative flex flex-col rounded-sm border p-6 ${tier.popular ? 'ring-2 ring-green-200 dark:ring-green-800' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 text-sm font-medium px-3 py-1 rounded-sm">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="text-left">
                  <h3 className="text-xl font-semibold">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {tier.description}
                  </p>
                </div>

                <div className="flex items-baseline mt-6">
                  {typeof tier.price === 'number' && (
                    <span className="text-lg font-semibold">$</span>
                  )}
                  <span className="text-4xl font-semibold">{tier.price}</span>
                  <span className="text-muted-foreground ml-1">
                    {tier.priceSuffix}
                  </span>
                </div>

                <ul className="flex flex-col gap-3 mt-6 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {tier.buttonText && (
                  <Button
                    asChild
                    onClick={
                      tier.permissionLevel === 'PRO' ||
                        tier.permissionLevel === 'MAX'
                        ? playClickSound
                        : undefined
                    }
                    className={`mt-6 w-full ${tier.popular
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800'
                        : tier.permissionLevel === 'MAX'
                          ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 hover:text-teal-800 dark:hover:text-teal-200 border border-teal-200 dark:border-teal-800'
                          : ''
                      }`}
                    variant="outline"
                  >
                    <Link href={tier.href}>{tier.buttonText}</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-0 -mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-sm bg-transparent dark:bg-muted/50 border">
              <div className="w-3 h-3 rounded-full bg-green-500 -mt-0.25"></div>
              <span className="text-sm font-medium">
                $0.60 / per application
              </span>
            </div>
          </div>

          {/* Enterprise Plan - Full Width */}
          <div className="w-full max-w-6xl mt-6">
            {pricingTiers.slice(3).map((tier, idx) => (
              <div
                key={idx + 3}
                className="relative flex flex-col rounded-sm border p-8"
              >
                <div className="text-left mb-8">
                  <h3 className="text-2xl font-semibold">{tier.name}</h3>
                  <div className="flex items-baseline mt-4">
                    <span className="text-4xl font-semibold">{tier.price}</span>
                    <span className="text-muted-foreground ml-1">
                      {tier.priceSuffix}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {tier.description}
                  </p>
                </div>

                <div className="flex-1 mb-8">
                  <ul className="grid grid-cols-1 gap-4">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="size-4 shrink-0 mt-0.5 text-green-700 dark:text-green-300" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-start">
                  {tier.buttonText && (
                    <Button
                      asChild
                      className="w-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-800 dark:hover:text-purple-200 border border-purple-200 dark:border-purple-800"
                      variant="outline"
                    >
                      <Link href={tier.href}>{tier.buttonText}</Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            All plans include SSL encryption, automated Captcha solving, stealth
            mode, GDPR compliance, and can be cancelled anytime.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Pricing
