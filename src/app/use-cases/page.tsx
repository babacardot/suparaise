import { Metadata } from 'next'
import { Header } from '@/components/design/header'
import { Footer } from '@/components/design/footer'
import { BackgroundText } from '@/components/design/background-text'
import { UseCases } from '@/components/design/use-cases'

export const metadata: Metadata = {
  title: 'Use cases',
  description:
    'Scenario-based guides for how Suparaise helps founders: technical pre-seed, international raises, busy CEOs, and more.',
}

// Renders a use cases hub with scenario-based content and anchor links
const UseCasesPage = () => {
  const scenarios: Array<{
    id: string
    title: string
    subtitle: string
    pains: string[]
    howItWorks: string[]
  }> = [
      {
        id: 'technical-pre-seed',
        title: 'Technical founders raising a pre-seed',
        subtitle: 'You built the product. Let us help get it funded.',
        pains: [
          'You prefer building over writing 50+ investor submissions',
          'Unsure which funds invest in your stage and sector',
          'Context switching kills momentum',
        ],
        howItWorks: [
          'Filter funds by stage, sector, geography',
          'Agents personalize answers using your product and traction',
          'Queue up to 50 submissions as background jobs without any manual work',
        ],
      },
      {
        id: 'international-us',
        title: 'International founders raising in the US',
        subtitle:
          'Identify funds that actually invest in your region and profile.',
        pains: [
          'Hard to know which funds back international teams',
          'Different application expectations by market',
          'Time zone and process friction',
        ],
        howItWorks: [
          'Filter by geo preference, check writing stage, and sector fit',
          'Agents handle your submissions with investor thesis and checks',
          'Track responses and improve your positioning',
        ],
      },
      {
        id: 'busy-ceo',
        title: 'Busy CEOs scaling outreach',
        subtitle: 'Maintain momentum without hiring a consultant.',
        pains: [
          'Limited time for repetitive application work',
          'Need consistent pipeline and reporting',
          'Prefer a founder-led process without extra headcount',
        ],
        howItWorks: [
          'Batch high-fit submissions weekly with saved profiles',
          'Transparent logs and status tracking in your CRM of choice',
          'Review mode for high-priority submissions',
        ],
      },
      {
        id: 'post-rejection-expansion',
        title: 'After 20+ rejections, expand the funnel',
        subtitle: 'Widen the net thoughtfully—without burning out.',
        pains: [
          'Initial target list exhausted with limited replies',
          'Manual expansion is slow and draining',
          'Need to iterate positioning per investor type',
        ],
        howItWorks: [
          'Discover new funds that fit your profile',
          'Agents are aware of rejection patterns and rewrite key answers based on investor thesis',
          'Expand to adjacent, thesis‑aligned funds with staged, prioritized outreach',
        ],
      },
    ]

  return (
    <div className="min-h-screen flex flex-col select-none">
      <Header />
      <main className="flex-1 pt-20">
        <UseCases scenarios={scenarios} />
      </main>
      <Footer />
      <BackgroundText />
    </div>
  )
}

export default UseCasesPage
