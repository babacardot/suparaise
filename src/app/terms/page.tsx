import { Header } from '@/components/design/header'
import { Footer } from '@/components/design/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Suparaise | Terms',
  description: 'Read the terms and conditions for using our services.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20">
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_10%,transparent_0%,var(--background)_75%)]"></div>

          <div className="mx-auto max-w-4xl px-6 py-16">
            {/* Header Section */}
            <div className="text-start mb-16">
              <h1 className="text-5xl font-bold tracking-tight mb-6">
                Terms and conditions
              </h1>
              <p className="text-lg text-muted-foreground max-w-5xl">
                Please read these terms carefully before using our service. By
                using Suparaise, you agree to these terms.
              </p>
            </div>

            {/* Content Sections */}
            <div className="space-y-12">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">
                      Acceptance of terms
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    By accessing and using Suparaise (&ldquo;Service&rdquo;),
                    you accept and agree to be bound by the terms and provision
                    of this agreement. If you do not agree to abide by the
                    above, please do not use this service nor create an account.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">
                      Description of service
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Suparaise is an AI agent powered platform that automates
                    venture capital fundraising processes, including form
                    submissions and outreach. Our service helps founders
                    streamline their fundraising efforts through the use of
                    browser automation.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">
                      User responsibilities
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    You are responsible for maintaining the confidentiality of
                    your account and password and for restricting access to your
                    computer. You agree to accept responsibility for all
                    activities that occur under your account or password.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">Prohibited uses</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    You may not use our service for any illegal or unauthorized
                    purpose nor may you, in the use of the Service, violate any
                    laws in your jurisdiction. You must not transmit any harmful
                    or disruptive content.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">
                      Limitation of liability
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    In no event shall Suparaise be liable for any indirect,
                    incidental, special, consequential, or punitive damages,
                    including without limitation, loss of profits, data, use,
                    goodwill, or other intangible losses.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">Changes to terms</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We reserve the right to modify these terms at any time. We
                    will always post the most current version on our website. By
                    continuing to use the Service after changes become
                    effective, you agree to be bound by the revised terms.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">Contact</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    If you have any questions about these terms and conditions,
                    please contact us through our website or reach out to our
                    support team from the dashboard or via email at{' '}
                    <a
                      href="mailto:hello@suparaise.com"
                      className="text-primary"
                    >
                      hello@suparaise.com
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Footer info */}
            <div className="mt-20 pt-8 border-t border-border text-end">
              <p className="text-sm text-muted-foreground">June 15, 2024</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
