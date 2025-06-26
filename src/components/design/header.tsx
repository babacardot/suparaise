'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { cn } from '@/lib/actions/utils'
import { useScroll } from 'motion/react'
import { useTheme } from 'next-themes'

interface MenuItem {
  name: string
  href: string
  isGreen?: boolean
}

const menuItems: MenuItem[] = [
  { name: 'Features', href: '#features' },
  { name: 'How it works', href: '#how-it-works' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'About', href: '#about' },
]

const authItems: MenuItem[] = [
  { name: 'Login', href: '/login', isGreen: true },
  { name: 'Sign up', href: '/signup' },
]

export const Header = () => {
  const [scrolled, setScrolled] = React.useState(false)

  const { scrollYProgress } = useScroll()

  const playClickSound = () => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/light.mp3')
      audio.volume = 0.3
      audio.play().catch(() => {
        // Silently handle audio play errors (autoplay policies, etc.)
      })
    }
  }

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setScrolled(latest > 0.05)
    })
    return () => unsubscribe()
  }, [scrollYProgress])

  return (
    <header>
      <nav
        className={cn(
          'fixed z-20 w-full border-b transition-colors duration-150',
          scrolled && 'bg-background/50 backdrop-blur-3xl',
        )}
      >
        <div className="mx-auto max-w-5xl px-6 transition-all duration-300">
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo />
              </Link>

              {/* Desktop Menu */}
              <div className="hidden lg:block">
                <ul className="flex gap-8 text-sm">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mobile Menu */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative z-20 -m-1 -mr-2 cursor-pointer p-2 flex items-center justify-center"
                    >
                      <Menu className="size-7" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="top"
                    className="bg-card text-foreground h-screen w-screen p-0 duration-300 flex flex-col border-none"
                  >
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                    {/* Close button positioned exactly where menu icon was */}
                    <div className="absolute top-3 right-6 z-50 lg:top-4">
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative z-20 -m-1 -mr-2 cursor-pointer p-2 flex items-center justify-center text-foreground hover:bg-muted"
                        >
                          <X className="size-7" />
                          <span className="sr-only">Close menu</span>
                        </Button>
                      </SheetClose>
                    </div>

                    {/* Menu content */}
                    <div className="flex flex-col items-start justify-start px-6 pt-20 pb-6 h-full">
                      {/* Navigation items */}
                      <div className="flex flex-col gap-8 text-left">
                        {[...menuItems, ...authItems].map((item, index) => (
                          <SheetClose asChild key={index}>
                            <Link
                              href={item.href}
                              className={`text-3xl font-semibold transition-colors duration-200 ${
                                item.name === 'Login'
                                  ? 'text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200'
                                  : item.isGreen
                                    ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
                                    : 'text-foreground hover:text-muted-foreground'
                              }`}
                            >
                              {item.name}
                            </Link>
                          </SheetClose>
                        ))}
                      </div>

                      {/* Quote */}
                      <div className="mt-16">
                        <p className="text-sm text-muted-foreground max-w-md leading-relaxed italic font-medium">
                          Our AI agents automatically fill out application forms
                          and send personalized outreach to hundreds of relevant
                          funds, while you focus on what matters: building and
                          scaling your business.
                        </p>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex lg:gap-2 lg:space-y-0">
              <Button
                asChild
                variant="outline"
                size="default"
                onClick={playClickSound}
                className="rounded-sm px-4 text-sm h-[37px] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Link href="/login" prefetch={true}>
                  <span>Login</span>
                </Link>
              </Button>
              <Button
                asChild
                size="default"
                onClick={playClickSound}
                className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm px-4 text-sm"
              >
                <Link href="/signup" prefetch={true}>
                  <span>Sign up</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

const Logo = ({ className }: { className?: string }) => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Image
          src="/lb.webp" // Neutral logo for SSR
          alt="Suparaise logo"
          className="h-8 w-auto"
          width={32}
          height={32}
          priority
          style={{ width: 'auto', height: '32px' }}
        />
        <span className="text-xl font-semibold text-foreground">Suparaise</span>
      </div>
    )
  }

  // Determine which logo to use based on resolved theme
  const logoSrc = resolvedTheme === 'dark' ? '/tw.webp' : '/tb.webp'

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Image
        key={logoSrc} // Force re-render when logo changes
        src={logoSrc}
        alt="Suparaise logo"
        className="h-8 w-auto transition-opacity duration-200"
        width={32}
        height={32}
        priority
        style={{ width: 'auto', height: '32px' }}
      />
      <span className="text-xl font-semibold text-foreground transition-colors duration-200">
        Suparaise
      </span>
    </div>
  )
}
