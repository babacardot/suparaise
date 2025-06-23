import type React from 'react'
import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/actions/utils'

interface SkeletonProps {
  className?: string
  gridSize?: number // Size of grid cells in pixels
}

export function Skeleton({
  className = '',
  gridSize = 16, // Default grid size based on the image
}: SkeletonProps) {
  const { theme } = useTheme() // Get the current theme

  // Determine colors based on theme (making grid less visible)
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  const bgColor = isDark ? 'hsl(210 4% 15%)' : '#f8f9fa'
  const gridColor = isDark
    ? 'rgba(80, 80, 80, 0.2)'
    : 'rgba(230, 230, 230, 0.4)' // Less visible grid
  const overlayColor = isDark
    ? 'rgba(60, 60, 60, 0.5)'
    : 'rgba(255, 255, 255, 0.7)' // Subtle overlay

  useEffect(() => {
    // Inject necessary styles dynamically
    const styleId = 'skeleton-dynamic-styles'
    let styleElement = document.getElementById(styleId)

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    const style = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .7; }
    }

    /* We need a unique class or data attribute if multiple skeletons
       with different gridSizes exist, otherwise this affects all grids.
       For simplicity, keeping .skeleton-grid for now. */
    .skeleton-grid {
      /* CSS variables are defined inline on the element now */
      background-image:
        linear-gradient(to right, transparent, transparent),
        linear-gradient(90deg, rgba(0,0,0,0) 0%, var(--overlay-color) 100%),
        linear-gradient(var(--grid-color) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
      background-size:
        100% 100%,
        100% 100%,
        var(--grid-size) var(--grid-size),
        var(--grid-size) var(--grid-size);
      background-position: 0 0, 0 0, 0 0, 0 0;
      background-blend-mode: normal, overlay, normal, normal;
      mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.3) 100%);
      -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.3) 100%);
    }
    `
    styleElement.textContent = style

    // No cleanup needed for static styles like keyframes
  }, []) // Run only once to inject static parts

  return (
    <div
      className={cn('skeleton', className)}
      style={{
        position: 'relative',
        minHeight: '1rem',
        backgroundColor: bgColor,
        borderRadius: '0.325rem',
        overflow: 'hidden',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    >
      <div
        className="skeleton-grid"
        style={
          {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            '--grid-size': `${gridSize}px`,
            '--grid-color': gridColor,
            '--overlay-color': overlayColor,
          } as React.CSSProperties
        }
      />
    </div>
  )
}
