import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Suparaise | Sign up',
    description: 'Create an account to automate fundraising.',
}

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
} 