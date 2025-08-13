'use client'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as React from 'react'

import { cn } from '@/lib/actions/utils'

type CheckboxProps = React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> & {
  // When variant is 'usage', the checked state renders blue styling instead of green
  variant?: 'default' | 'usage'
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant = 'default', ...props }, ref) => {
  const colorClasses =
    variant === 'usage'
      ? 'data-[state=checked]:border-blue-200 data-[state=indeterminate]:border-blue-200 data-[state=checked]:bg-blue-50 data-[state=indeterminate]:bg-blue-50 data-[state=checked]:text-blue-700 data-[state=indeterminate]:text-blue-700 dark:data-[state=checked]:border-blue-800 dark:data-[state=indeterminate]:border-blue-800 dark:data-[state=checked]:bg-blue-900/30 dark:data-[state=indeterminate]:bg-blue-900/30 dark:data-[state=checked]:text-blue-300 dark:data-[state=indeterminate]:text-blue-300'
      : 'data-[state=checked]:border-green-200 data-[state=indeterminate]:border-green-200 data-[state=checked]:bg-green-50 data-[state=indeterminate]:bg-green-50 data-[state=checked]:text-green-700 data-[state=indeterminate]:text-green-700 dark:data-[state=checked]:border-green-800 dark:data-[state=indeterminate]:border-green-800 dark:data-[state=checked]:bg-green-900/30 dark:data-[state=indeterminate]:bg-green-900/30 dark:data-[state=checked]:text-green-300 dark:data-[state=indeterminate]:text-green-300'

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'peer size-4 shrink-0 rounded-sm border border-input shadow-sm shadow-black/5 outline-offset-2 focus-visible:outline focus-visible:outline-ring/70 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
        colorClasses,
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {props.checked === 'indeterminate' ? (
          <svg
            width="9"
            height="9"
            viewBox="0 0 9 9"
            fill="currentcolor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.75 4.5C0.75 4.08579 1.08579 3.75 1.5 3.75H7.5C7.91421 3.75 8.25 4.08579 8.25 4.5C8.25 4.91421 7.91421 5.25 7.5 5.25H1.5C1.08579 5.25 0.75 4.91421 0.75 4.5Z"
            />
          </svg>
        ) : (
          <svg
            width="9"
            height="9"
            viewBox="0 0 9 9"
            fill="currentcolor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.53547 0.62293C8.88226 0.849446 8.97976 1.3142 8.75325 1.66099L4.5083 8.1599C4.38833 8.34356 4.19397 8.4655 3.9764 8.49358C3.75883 8.52167 3.53987 8.45309 3.3772 8.30591L0.616113 5.80777C0.308959 5.52987 0.285246 5.05559 0.563148 4.74844C0.84105 4.44128 1.31533 4.41757 1.62249 4.69547L3.73256 6.60459L7.49741 0.840706C7.72393 0.493916 8.18868 0.396414 8.53547 0.62293Z"
            />
          </svg>
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
