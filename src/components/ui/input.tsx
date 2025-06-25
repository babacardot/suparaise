import * as React from 'react'

import { cn } from '@/lib/actions/utils'

interface InputProps extends React.ComponentProps<'input'> {
  leftAddon?: string
  rightAddon?: string
}

function Input({
  className,
  type,
  leftAddon,
  rightAddon,
  ...props
}: InputProps) {
  // If no addons, render the original input
  if (!leftAddon && !rightAddon) {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-background dark:bg-background border-input flex h-9 w-full min-w-0 rounded-sm border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className,
        )}
        {...props}
      />
    )
  }

  // Render input with addons
  return (
    <div className="relative flex rounded-sm shadow-xs">
      {leftAddon && (
        <span className="pointer-events-none z-20 absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-muted-foreground">
          {leftAddon}
        </span>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-background dark:bg-background border-input flex h-9 w-full min-w-0 border px-3 py-1 text-base shadow-none transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          leftAddon && 'ps-6',
          rightAddon && '-me-px z-10 rounded-e-none',
          !rightAddon && 'rounded-sm',
          !leftAddon && 'rounded-sm',
          className,
        )}
        {...props}
      />
      {rightAddon && (
        <span className="inline-flex items-center rounded-e-sm border border-input bg-background px-3 text-sm text-muted-foreground">
          {rightAddon}
        </span>
      )}
    </div>
  )
}

export { Input }
export type { InputProps }
