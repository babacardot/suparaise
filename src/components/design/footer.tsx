'use client'

import React from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { XIcon } from '@/components/icons/XIcon'
import { PHIcon } from '@/components/icons/PHIcon'
import { GitHubIcon } from '@/components/icons/GitHubIcon'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'

export const Footer = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <footer className="border-t bg-background rounded-sm">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <Link
              href="/privacy"
              prefetch={true}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              prefetch={true}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="https://twitter.com/suparaise"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#000000] dark:hover:text-[#FFFFFF] transition-colors"
              aria-label="Follow us on X"
            >
              <XIcon className="h-5 w-5" />
            </Link>
            <Link
              href="https://github.com/princemuichkine"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#6f42c1] dark:hover:text-[#6f42c1] transition-colors"
              aria-label="Follow us on GitHub"
            >
              <GitHubIcon className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.producthunt.com/posts/suparaise"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#DA552F] dark:hover:text-[#DA552F] transition-colors"
              aria-label="Check us out on Product Hunt"
            >
              <PHIcon className="h-6 w-6 translate-y-0.25" />
            </Link>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} suparaise.com — All rights reserved.
          </p>
          <button
            onClick={toggleTheme}
            className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors [&_svg]:fill-current"
            aria-label={
              mounted
                ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
                : 'Toggle theme'
            }
          >
            <LottieIcon
              animationData={
                theme === 'dark' ? animations.sun : animations.point
              }
              size={16}
              loop={false}
              autoplay={false}
              initialFrame={0}
              className="text-muted-foreground hover:text-foreground transition-colors"
            />
          </button>
        </div>
      </div>
    </footer>
  )
}
