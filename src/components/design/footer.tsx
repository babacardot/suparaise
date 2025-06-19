'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { XIcon } from '@/components/icons/XIcon'
import { PHIcon } from '@/components/icons/PHIcon'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'

export const Footer = () => {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <footer className="border-t bg-background rounded-sm">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
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
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Follow us on X"
            >
              <XIcon className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.producthunt.com/posts/suparaise"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Check us out on Product Hunt"
            >
              <PHIcon className="h-5 w-5" />
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
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <LottieIcon
              animationData={animations.point}
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
