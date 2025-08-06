import Image from 'next/image'
import { useEffect, useState } from 'react'

export function ProductHuntBadge({
  size = 'default',
}: {
  size?: 'default' | 'small'
}) {
  // Initialize state as light by default to avoid SSR issues
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Set initial theme and observe theme changes
  useEffect(() => {
    // Set initial theme after mount
    const isDark = document.documentElement.classList.contains('dark')
    setCurrentTheme(isDark ? 'dark' : 'light')
    setMounted(true)

    // Use MutationObserver for instant reaction to class changes on <html>
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          // Update state based on the new class state
          const isDark = document.documentElement.classList.contains('dark')
          setCurrentTheme(isDark ? 'dark' : 'light')
        }
      })
    })

    // Start observing the <html> element
    observer.observe(document.documentElement, { attributes: true })

    // Cleanup: disconnect observer on unmount
    return () => {
      observer.disconnect()
    }
  }, []) // Empty dependency array: run only once on mount

  const dimensions =
    size === 'small'
      ? { width: 200, height: 40, displayWidth: '200px', displayHeight: '40px' }
      : { width: 250, height: 54, displayWidth: '410px', displayHeight: '80px' }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className="inline-block bg-muted animate-pulse rounded-sm"
        style={{
          width: dimensions.displayWidth,
          height: dimensions.displayHeight,
        }}
      />
    )
  }

  return (
    <a
      href="https://www.producthunt.com/posts/suparaise?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-suparaise"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block"
    >
      <Image
        src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=720260&theme=${currentTheme}&t=1736800231403`}
        alt="Suparaise - Agents that apply to funds for you, on autopilot | Product Hunt"
        width={dimensions.width}
        height={dimensions.height}
        style={{
          width: dimensions.displayWidth,
          height: dimensions.displayHeight,
        }}
      />
    </a>
  )
}
