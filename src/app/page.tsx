import { HeroSection } from '@/components/design/hero'
import Testimonials from '@/components/design/testimonials'
import Pricing from '@/components/design/pricing'
import { Footer } from '@/components/design/footer'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <Testimonials />
      <Pricing />
      <Footer />
    </>
  )
}
