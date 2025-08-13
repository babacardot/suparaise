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
    name: 'Core',
    price: 'Free',
    priceSuffix: '',
    description: 'Get started with agentic fundraising',
    features: [
      '2 applications per month',
      'Access to 75 curated funds',
      'Claude 4 sonnet',
    ],
    buttonText: '',
    href: '/signup',
    permissionLevel: 'FREE',
  },
  {
    name: 'Pro',
    price: 29,
    priceSuffix: '/mo',
    description: 'For startups actively raising their first round',
    features: [
      '20 applications per month',
      'Access to 500+ global funds',
      '3x faster with concurrent processing',
      'Background runs',
      'Agent customization',
    ],
    buttonText: 'Start free trial',
    href: '/signup',
    popular: true,
    permissionLevel: 'PRO',
  },
  {
    name: 'Max',
    price: 79,
    priceSuffix: '/mo',
    description: 'For startups that need meetings now',
    features: [
      '50 applications per month',
      'Full database access',
      '5x faster with concurrent processing',
      'Detailed submission analytics',
      'Full application transparency',
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
      '10x faster processing',
      'Autopilot mode',
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
      audio.volume = 0.4
      audio.play().catch(() => {
        // Silently handle audio play errors (autoplay policies, etc.)
      })
    }
  }

  return (
    <section id="pricing" className="bg-background pt-10 pb-20 select-none">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-sm">Pricing</div>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter">
            Simple, transparent pricing
          </h2>
          <p className="text-center mt-5 opacity-75 text-foreground/80 leading-relaxed text-md max-w-3xl mx-auto">
            Choose the plan that fits your needs.
          </p>

          <div className="grid gap-4 lg:grid-cols-3 mt-12 w-full max-w-6xl">
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
                  <p className="text-foreground/80 text-sm mt-2">
                    {tier.description}
                  </p>
                </div>

                <div className="flex items-baseline mt-6">
                  {typeof tier.price === 'number' && (
                    <span className="text-lg font-semibold">$</span>
                  )}
                  <span className="text-4xl font-semibold">{tier.price}</span>
                  <span className="text-foreground/80 ml-1">
                    {tier.priceSuffix}
                  </span>
                </div>

                <ul className="flex flex-col gap-3 mt-6 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check
                        className={`size-4 shrink-0 mt-0.5 ${
                          tier.permissionLevel === 'MAX'
                            ? 'text-amber-700 dark:text-amber-300'
                            : tier.permissionLevel === 'ENTERPRISE'
                              ? 'text-purple-700 dark:text-purple-300'
                              : 'text-green-700 dark:text-green-300'
                        }`}
                      />
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
                    className={`mt-6 w-full ${
                      tier.popular
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800'
                        : tier.permissionLevel === 'MAX'
                          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-800 dark:hover:text-amber-200 border border-amber-200 dark:border-amber-800'
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

          {/* Context: why usage-based and Pro matter */}
          <div className="w-full max-w-4xl mt-4 mx-auto ">
            <div className="rounded-sm border bg-zinc-50 dark:bg-zinc-900/30 p-4 text-sm ">
              <p className="leading-relaxed">
                Founders typically submit between 20 and 50 applications per
                round to secure 4 to 8 meetings. Each manual submission can take
                anywhere from 15 to 45 minutes of deep work — that&apos;s{' '}
                <span className="font-bold">12 to 45 hours</span> per raise.
              </p>
              <p className="leading-relaxed mt-2">
                With <span className="font-bold">Pro</span>, get 20 high-quality
                applications running in the background while you focus on
                building your business.
              </p>
              <p className="block md:hidden h-2" />
              <p className="leading-relaxed mt-0">
                You think you&apos;ll need more? You can always continue to
                apply with{' '}
                <span className="font-bold">usage-based billing</span>.
                {/* <span className="font-bold">usage-based billing</span> at $2.49
                per additional run. */}
              </p>
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
                    <span className="text-foreground/80 ml-1">
                      {tier.priceSuffix}
                    </span>
                  </div>
                  <p className="text-foreground/80 text-sm mt-2">
                    {tier.description}
                  </p>
                </div>

                <div className="flex-1 mb-8">
                  <ul className="grid grid-cols-1 gap-4">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="size-4 shrink-0 mt-0.5 text-purple-700 dark:text-purple-300" />
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

          <p className="text-foreground/80 text-sm mt-4">
            All plans include SSL encryption, automated Captcha solving, stealth
            mode, and can be cancelled anytime.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Pricing
