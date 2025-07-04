import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign up | Suparaise',
  description: 'Create an account to automate fundraising.',
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
