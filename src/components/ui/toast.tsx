'use client'

import * as React from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/actions/utils'

export type ToastVariant =
  | 'default'
  | 'destructive'
  | 'info'
  | 'success'
  | 'api'
  | 'locked'

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 right-0 z-[100] flex max-h-screen min-w-[260px] max-w-[360px] flex-col-reverse p-4',
      className,
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden border rounded-sm py-1 px-2 pr-4 shadow-lg transition-all cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'border-amber-300/20 bg-amber-50 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full',
        destructive:
          'border-red-300/20 bg-red-50 text-red-700 dark:bg-red-900/80 dark:text-red-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full',
        info: 'border-blue-300/20 bg-blue-50 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full',
        success:
          'border-green-300/20 bg-green-50 text-green-700 dark:bg-green-900/80 dark:text-green-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full',
        api: 'border-cyan-300/20 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/80 dark:text-cyan-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full',
        locked:
          'border-purple-300/20 bg-purple-50 text-purple-700 dark:bg-purple-900/80 dark:text-purple-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface BaseToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {
  variant?: ToastVariant
}

// Create a context to pass the expanded state from Toast to ToastDescription
interface ToastContextValue {
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
  hasTitle: boolean
  setHasTitle: (hasTitle: boolean) => void
  variant?: ToastVariant
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  BaseToastProps
>(({ className, variant, children, ...props }, ref) => {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [hasTitle, setHasTitle] = React.useState(false)

  return (
    <ToastContext.Provider
      value={{ isExpanded, setIsExpanded, hasTitle, setHasTitle, variant }}
    >
      <ToastPrimitives.Root
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        onClick={() => setIsExpanded(!isExpanded)}
        {...props}
      >
        {children}
      </ToastPrimitives.Root>
    </ToastContext.Provider>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-6 shrink-0 items-center justify-center rounded-sm border bg-transparent px-2 text-xs font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-1 top-1.5 rounded-sm p-0.5 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none',
      className,
    )}
    toast-close=""
    onClick={(e) => e.stopPropagation()}
    {...props}
  >
    <Cross2Icon className="h-3 w-3" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => {
  const context = React.useContext(ToastContext)

  // Set has title on mount
  React.useEffect(() => {
    if (context) {
      context.setHasTitle(true)
    }
  }, [context])

  return (
    <ToastPrimitives.Title
      ref={ref}
      className={cn('text-xs font-light truncate max-w-[240px]', className)}
      {...props}
    />
  )
})
ToastTitle.displayName = ToastPrimitives.Title.displayName

interface ToastDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description> {
  expanded?: boolean
}

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  ToastDescriptionProps
>(({ className, expanded = false, children, ...props }, ref) => {
  // Get parent Toast's expanded state using context
  const context = React.useContext(ToastContext)
  const isExpanded = context?.isExpanded ?? expanded
  const hasTitle = context?.hasTitle ?? false
  const variant = context?.variant

  if (!children) return null

  // Determine the appropriate text color based on the variant
  const getDescriptionColor = () => {
    if (!hasTitle) return '' // If no title, use the default color to match title style

    switch (variant) {
      case 'default':
        return 'text-amber-600/90 dark:text-amber-400/90'
      case 'destructive':
        return 'text-red-600/90 dark:text-red-400/90'
      case 'info':
        return 'text-blue-600/90 dark:text-blue-400/90'
      case 'success':
        return 'text-green-600/90 dark:text-green-400/90'
      case 'api':
        return 'text-cyan-600/90 dark:text-cyan-400/90'
      case 'locked':
        return 'text-purple-600/90 dark:text-purple-400/90'
      default:
        return 'text-amber-600/90 dark:text-amber-400/90'
    }
  }

  return (
    <div
      className={cn(
        hasTitle ? 'mt-0.5 text-xs opacity-80' : 'text-xs font-light',
        isExpanded || !hasTitle ? 'block' : 'hidden',
        !hasTitle ? 'max-w-[240px] truncate' : '',
      )}
    >
      <ToastPrimitives.Description
        ref={ref}
        className={cn(
          hasTitle
            ? `text-[10px] leading-relaxed ${getDescriptionColor()}`
            : 'leading-relaxed',
          className,
        )}
        {...props}
      >
        {children}
      </ToastPrimitives.Description>
    </div>
  )
})
ToastDescription.displayName = ToastPrimitives.Description.displayName

const ToastProgressBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: ToastVariant }
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute bottom-0 left-0 right-0 h-[4px] w-full bg-transparent',
      className,
    )}
    style={{ margin: 0, padding: 0 }}
    {...props}
  >
    <div
      className={cn(
        'h-full progress-animation',
        variant === 'default'
          ? 'bg-amber-500'
          : variant === 'destructive'
            ? 'bg-red-500'
            : variant === 'info'
              ? 'bg-blue-500'
              : variant === 'success'
                ? 'bg-green-500'
                : variant === 'api'
                  ? 'bg-cyan-500'
                  : variant === 'locked'
                    ? 'bg-purple-500'
                    : 'bg-amber-500',
      )}
      style={{ margin: 0, padding: 0 }}
    />
  </div>
))
ToastProgressBar.displayName = 'ToastProgressBar'

type ToastActionElement = React.ReactElement<typeof ToastAction>

export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastProgressBar,
  type ToastActionElement,
}
