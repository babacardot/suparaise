import { Header } from '@/components/design/header'
import { HeroSection } from '@/components/design/hero'
import Testimonials from '@/components/design/testimonials'
import Pricing from '@/components/design/pricing'
import { FaqSection } from '@/components/design/faq'
import { Footer } from '@/components/design/footer'
// import { LandingCustomers } from '@/components/design/landing-customers'

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
