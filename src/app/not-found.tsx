'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FuzzyText } from '@/components/design/fuzzy-text'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="max-w-2xl mx-auto px-6 text-center">
        {/* Fuzzy 404 Text */}
        <div className="mb-8 flex justify-center">
          <FuzzyText
            fontSize="clamp(4rem, 12vw, 10rem)"
            fontWeight={900}
            enableHover={true}
            baseIntensity={0.15}
            hoverIntensity={0.4}
            className="text-primary"
          >
            404
          </FuzzyText>
        </div>

        {/* Main heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like this page got lost in the fundraising process. Don&apos;t
          worry, we&apos;ll help you get back on track.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Help text */}
        <div className="mt-12 p-6 rounded-lg bg-muted/50 border">
          <p className="text-sm text-muted-foreground">
            If you think this is an error, please{' '}
            <a
              href="mailto:support@suparaise.com"
              className="text-primary hover:underline font-medium"
            >
              contact our support team
            </a>{' '}
            and we&apos;ll help you out.
          </p>
        </div>
      </div>

      {/* Decorative background gradient */}
      <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"></div>
    </div>
  )
}
