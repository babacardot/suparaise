import { Header } from '@/components/design/header'
import { HeroSection } from '@/components/design/hero'
import Testimonials from '@/components/design/testimonials'
import Pricing from '@/components/design/pricing'
import { FaqSection } from '@/components/design/faq'
import { Footer } from '@/components/design/footer'
import type { Metadata } from 'next'
// import { LandingCustomers } from '@/components/design/landing-customers'

export const metadata: Metadata = {
  title: 'Suparaise | AI-Powered Fundraising Automation',
  description: 'Automate your startup fundraising with agents.',
}

export default function LandingPage() {
  return (
    <>
      <Header />
      <HeroSection />
      <Testimonials />
      <Pricing />
      <FaqSection />
      <Footer />
    </>
  )
}
