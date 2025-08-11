import { Header } from '@/components/design/header'
import { HeroSection } from '@/components/design/hero'
import Testimonials from '@/components/design/testimonials'
import Pricing from '@/components/design/pricing'
import { FaqSection } from '@/components/design/faq'
import { Footer } from '@/components/design/footer'
import { BackgroundText } from '@/components/design/background-text'
import CookieConsent from '@/components/design/tracking-cookie'
import type { Metadata } from 'next'
// import { LandingCustomers } from '@/components/design/landing-customers'

export const metadata: Metadata = {
  title: 'Suparaise',
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
      <BackgroundText />
      <CookieConsent />
    </>
  )
}
