import type { Metadata } from 'next'

// This will be overridden by individual page metadata
export const metadata: Metadata = {
  title: 'Suparaise | Auth',
  description: 'Sign in or create an account to access our services.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
