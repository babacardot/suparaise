import { Header } from '@/components/design/header'
import { Footer } from '@/components/design/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy | Suparaise',
  description: 'Learn how we protect your privacy and handle your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20">
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_10%,transparent_0%,var(--background)_75%)]"></div>

          <div className="mx-auto max-w-4xl px-6 py-16 select-none">
            {/* Header Section */}
            <div className="text-start mb-16">
              <h1 className="text-5xl font-bold tracking-tight mb-6">
                Privacy policy
              </h1>
              <p className="text-lg text-muted-foreground max-w-5xl">
                Your privacy is important to us. This policy explains how we
                collect, use, and protect your information.
              </p>
            </div>

            {/* Content Sections */}
            <div className="space-y-12">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">
                      Information we collect
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We collect information you provide directly to us, such as
                    when you create an account, submit your startup information,
                    or contact us for support. This includes personal details,
                    business information, and communication preferences.
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground leading-relaxed text-lg">
                    <li>
                      Account and profile: name, email, password (hashed), and
                      basic startup profile details you choose to provide.
                    </li>
                    <li>
                      Startup content: application answers, descriptions, links,
                      and documents you upload to enable submissions.
                    </li>
                    <li>
                      Usage and device data: limited technical information (such
                      as browser type, timestamps, and interactions) to secure
                      and improve the Service.
                    </li>
                    <li>
                      Communications: messages you send to support and
                      operational emails we exchange with you.
                    </li>
                    <li>
                      Billing metadata: limited payment-related details from our
                      payment processor (e.g., last four digits, card brand,
                      billing country) for subscription management.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">Payments and billing information</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We use a third-party payment processor to
                    handle payments. Payment method details are processed and stored
                    by the processor, not by Suparaise. We receive limited
                    information related to your transactions (for example, the last
                    four digits of a card, card brand, and billing country) to help
                    us manage your subscription. For information about refunds or
                    credits, please refer to our Terms.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">
                      How we use your information
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We use the information we collect to provide, maintain, and
                    improve our services, process transactions, and communicate
                    with you about your account and our services. This enables
                    us to deliver personalized and effective fundraising
                    automation.
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground leading-relaxed text-lg">
                    <li>Operate core features, including agentic form filling.</li>
                    <li>Personalize responses and submissions based on your inputs.</li>
                    <li>Provide support, account notices, and service updates.</li>
                    <li>Monitor, prevent, and address abuse, fraud, and outages.</li>
                    <li>Improve the Service, including quality and reliability.</li>
                    <li>Comply with legal, tax, and regulatory obligations.</li>
                  </ul>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">AI and automated processing</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Some features rely on automated systems and AI models to
                    perform tasks you instruct (for example, drafting application
                    responses and filling forms). These systems process the
                    content you provide to deliver the requested functionality.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">
                      Information sharing
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We do not sell your personal information. We share
                    information in limited cases, including with: (a) service
                    providers acting on our behalf (for hosting, database,
                    messaging, analytics, and payments); (b) to comply with law
                    or legal process; (c) to protect rights, safety, and the
                    integrity of the Service; or (d) in connection with a
                    corporate transaction. Service providers are bound by
                    appropriate confidentiality and security obligations.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">Data security</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We implement measures designed to protect your information,
                    including encryption in transit, access controls, least-
                    privilege practices, logging, and regular backups. No method
                    of transmission or storage is 100% secure, but we work to
                    safeguard your data and review our controls periodically.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">Data retention</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We retain information for as long as necessary to provide
                    the Service, comply with legal obligations, resolve
                    disputes, and enforce agreements. When no longer needed, we
                    take steps to delete or de-identify information in a
                    reasonable timeframe.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">Your rights</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Depending on your location, you may have rights over your
                    personal information, including to access, correct, delete,
                    restrict or object to processing, and request portability.
                    You may also withdraw consent where processing is based on
                    consent. Contact us to exercise these rights; we will
                    respond consistent with applicable laws.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">
                      Cookies and tracking
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We use cookies and similar technologies to operate and
                    improve the Service. You can control cookies through your
                    browser settings. Disabling certain cookies may affect core
                    functionality.
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground leading-relaxed text-lg">
                    <li>Essential: required for core features and security.</li>
                    <li>Functional: remember preferences and improve experience.</li>
                    <li>Analytics: help us understand usage and performance.</li>
                  </ul>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">Data location and transfers</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We may process and store information in the country where you
                    live or in other countries where we or our service providers
                    operate. Where required, we use appropriate safeguards for
                    cross-border transfers, such as contractual commitments.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">
                      Changes to this policy
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
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20 rounded-sm"></div>
                <div className="pl-8">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold">Contact</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    If you have any questions about this privacy policy, please
                    contact us through our website or reach out to our support
                    team for assistance from the dashboard or via email at{' '}
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
