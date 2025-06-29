'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function TopBanner() {
  const pathname = usePathname()

  // Show on landing page and auth pages
  const allowedPaths = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/verify',
  ]
  if (!allowedPaths.includes(pathname)) return null

  return (
    <div
      className={`absolute top-0 left-0 right-0 z-[100] w-full transition-all duration-300 bg-gradient-to-r from-iconBg-home/30 to-iconBg-browser/30 dark:from-darkIconBg-home/30 dark:to-darkIconBg-browser/30`}
    >
      <Link
        href="https://www.producthunt.com/products/suparaise"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-transparent hover:bg-[#2a2f3d]/5 dark:hover:bg-white/5 transition-all duration-300 cursor-pointer"
      >
        <div className="max-w-7xl mx-auto px-4 h-6 flex items-center justify-end pr-12">
          <span className="text-xs text-black/80 dark:text-white/80 font-medium tracking-wide pointer-events-none transition-all duration-300">
            <span className="font-semibold">
              We&apos;re live on Product Hunt |{' '}
            </span>
            <span className="font-bold">Support us!</span>
          </span>
        </div>
      </Link>
    </div>
  )
}
