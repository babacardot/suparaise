import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Suparaise | Sign in',
  description:
    'Sign in to your account to automate your fundraising with agents.',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
