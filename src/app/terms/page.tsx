import { Header } from '@/components/design/header'
import { Footer } from '@/components/design/footer'

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
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center rounded-full bg-muted px-3 py-1 text-sm font-medium mb-4">
                Legal Document
              </div>
              <h1 className="text-5xl font-bold tracking-tight mb-6">
                Terms and Conditions
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Please read these terms carefully before using our service. By
                using Suparaise, you agree to these terms.
              </p>
            </div>

            {/* Content Sections */}
            <div className="space-y-12">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-full"></div>
                <div className="pl-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      1
                    </div>
                    <h2 className="text-2xl font-semibold">
                      Acceptance of Terms
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    By accessing and using Suparaise (&ldquo;Service&rdquo;),
                    you accept and agree to be bound by the terms and provision
                    of this agreement. If you do not agree to abide by the
                    above, please do not use this service.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-full"></div>
                <div className="pl-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      2
                    </div>
                    <h2 className="text-2xl font-semibold">
                      Description of Service
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Suparaise is an AI-powered platform that automates venture
                    capital fundraising processes, including form submissions
                    and outreach activities. Our service helps founders
                    streamline their fundraising efforts through intelligent
                    automation.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-full"></div>
                <div className="pl-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      3
                    </div>
                    <h2 className="text-2xl font-semibold">
                      User Responsibilities
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
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-full"></div>
                <div className="pl-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      4
                    </div>
                    <h2 className="text-2xl font-semibold">Prohibited Uses</h2>
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
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-full"></div>
                <div className="pl-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      5
                    </div>
                    <h2 className="text-2xl font-semibold">
                      Limitation of Liability
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
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-full"></div>
                <div className="pl-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      6
                    </div>
                    <h2 className="text-2xl font-semibold">Changes to Terms</h2>
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
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-full"></div>
                <div className="pl-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      7
                    </div>
                    <h2 className="text-2xl font-semibold">
                      Contact Information
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    If you have any questions about these Terms and Conditions,
                    please contact us through our website or reach out to our
                    support team.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer info */}
            <div className="mt-20 pt-8 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Last updated:{' '}
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
