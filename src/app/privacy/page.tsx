import { Header } from '@/components/design/header'
import { Footer } from '@/components/design/footer'

export default function PrivacyPage() {
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
                Privacy & Security
              </div>
              <h1 className="text-5xl font-bold tracking-tight mb-6">
                Privacy Policy
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your privacy is important to us. This policy explains how we
                collect, use, and protect your information.
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
                      Information We Collect
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We collect information you provide directly to us, such as
                    when you create an account, submit startup information, or
                    contact us for support. This includes personal details,
                    business information, and communication preferences.
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
                      How We Use Your Information
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We use the information we collect to provide, maintain, and
                    improve our services, process transactions, and communicate
                    with you about your account and our services. This enables
                    us to deliver personalized and effective fundraising
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
                      Information Sharing
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We do not sell, trade, or otherwise transfer your personal
                    information to third parties without your consent, except as
                    described in this policy or as required by law. Your data
                    remains confidential and secure.
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
                    <h2 className="text-2xl font-semibold">Data Security</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We implement appropriate security measures to protect your
                    personal information against unauthorized access,
                    alteration, disclosure, or destruction. Our systems use
                    industry-standard encryption and security protocols.
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
                    <h2 className="text-2xl font-semibold">Data Retention</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We retain your information for as long as your account is
                    active or as needed to provide you services, comply with our
                    legal obligations, resolve disputes, and enforce our
                    agreements.
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
                    <h2 className="text-2xl font-semibold">Your Rights</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    You have the right to access, update, or delete your
                    personal information. You may also request that we limit the
                    processing of your personal information. Contact us to
                    exercise these rights.
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
                      Cookies and Tracking
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We use cookies and similar tracking technologies to collect
                    and track information and to improve and analyze our
                    service. You can control cookie preferences through your
                    browser settings.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-full"></div>
                <div className="pl-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      8
                    </div>
                    <h2 className="text-2xl font-semibold">
                      Changes to This Policy
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We may update our Privacy Policy from time to time. We will
                    notify you of any changes by posting the new Privacy Policy
                    on this page and updating the &ldquo;Last updated&rdquo;
                    date.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-full"></div>
                <div className="pl-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      9
                    </div>
                    <h2 className="text-2xl font-semibold">Contact Us</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    If you have any questions about this Privacy Policy, please
                    contact us through our website or reach out to our support
                    team for assistance.
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
