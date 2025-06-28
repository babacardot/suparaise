'use client'

import React from 'react'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { useTheme } from 'next-themes'
import Image from "next/image"
import { LottieIcon } from '@/components/design/lottie-icon'
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
    { label: "Applications automated", value: "2500+" },
    { label: "Founders served", value: "1000+" },
    { label: "Success rate", value: "99%" },
    { label: "Meetings booked", value: "500+" },
]

const features = [
    {
        animation: animations.bolt,
        title: "Accuracy",
        description: "The most advanced AI fill out applications exactly as you would, with precision that matches your voice."
    },
    {
        animation: animations.speed,
        title: "Scale",
        description: "Our agents can fill out 25+ applications simultaneously in the time it takes you to complete just one."
    },
    {
        animation: animations.globe,
        title: "Global",
        description: "Access 2,000+ funds, angels, and accelerators from Silicon Valley to Singapore and throughout EMEA."
    }
]

export const About3 = () => {
    const { theme } = useTheme()
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

    // Theme-based image selection
    const heroImageSrc = theme === 'light' ? '/banner.png' : '/banner.png'

    return (
        <section className="relative overflow-hidden">
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
                        <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                            Suparaise automates the entire fundraising process, from application forms to personalized emails.
                            Built by founders who got tired of wasting time on paperwork instead of building their business.
                        </p>
                    </div>

                    {/* Problem Section */}
                    <div className="grid gap-12 lg:grid-cols-2 items-center mb-20">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-semibold mb-4">
                                The struggle
                            </h2>
                            <p className="text-muted-foreground text-md leading-relaxed">
                                You&apos;re spending 40% of your time on mind-numbing tasks: copying the same pitch into countless forms,
                                researching which VCs actually invest in your stage, and crafting personalized outreach emails. Meanwhile, your competitors are shipping features and acquiring customers.
                            </p>
                            <p className="text-muted-foreground text-md leading-relaxed">
                                That is why we created Suparaise: AI agents acting as a dedicated fundraising team. They fill out applications, send personalized outreach, and connect you with relevant investors - with extreme accuracy and scale.
                            </p>
                        </div>

                        {/* Solution Preview */}
                        <div className="relative">
                            <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative overflow-hidden rounded-sm border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                                <Image
                                    src={heroImageSrc}
                                    alt="Suparaise Dashboard Interface"
                                    width={600}
                                    height={400}
                                    className="aspect-[3/2] relative rounded-sm object-cover"
                                    priority
                                />
                            </div>
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
                                    <div className="inline-flex items-center justify-center p-3 rounded-sm bg-primary/10">
                                        <LottieIcon
                                            animationData={feature.animation}
                                            size={24}
                                            loop={true}
                                            autoplay={hoveredIndex === index}
                                            className="text-primary"
                                        />
                                    </div>
                                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
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
                                <h2 className="text-3xl font-semibold mb-4">Our impact in numbers</h2>
                                <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                                    Real numbers from founders who&apos;ve used Suparaise to automate their fundraising process.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                                {achievements.map((stat, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="text-4xl lg:text-5xl font-bold text-primary">
                                            {stat.value}
                                        </div>
                                        <div className="text-muted-foreground font-medium text-sm">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </AnimatedGroup>
            </div>
        </section>
    )
}
