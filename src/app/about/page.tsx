import { Header } from '@/components/design/header'
import { Footer } from '@/components/design/footer'
import { BackgroundText } from '@/components/design/background-text'
import { About } from '@/components/design/about'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Suparaise | About us',
  description:
    'Learn about our mission to automate fundraising for founders using AI agents.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20">
        <About />
      </main>

      <Footer />
      <BackgroundText />
    </div>
  )
}
