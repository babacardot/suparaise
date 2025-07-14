import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/next'
import { UserProvider } from '@/lib/contexts/user-context'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://suparaise.com'),
  title: {
    default: 'Suparaise',
    template: '%s | Suparaise',
  },
  description:
    'Automate your startup fundraising with AI agents that reach out to investors for you, on autopilot',
  keywords: [
    // English - Core Fundraising Terms
    'vc funding',
    'venture capital funding',
    'startup fundraising',
    'investment funding',
    'fundraising automation',
    'vc application automation',
    'startup funding platform',
    'investor outreach automation',
    'funding rounds',
    'seed funding',
    'series a funding',
    'series b funding',
    'series c funding',
    'pre seed funding',
    'venture capital applications',
    'startup investment',
    'company funding',
    'fundraising software',
    'ai fundraising',
    'automated vc applications',
    'startup funding tools',
    'investment automation',
    'venture capital outreach',
    'angel investors',
    'angel funding',
    'private equity funding',

    // English - Startup & Business Terms
    'startup accelerator',
    'startup incubator',
    'startup pitch deck',
    'business plan automation',
    'startup valuation',
    'equity financing',
    'debt financing',
    'growth capital',
    'working capital',
    'capital raising',
    'fundraising strategy',
    'investor relations',
    'due diligence automation',
    'startup grants',
    'government funding',
    'crowdfunding automation',
    'pitch automation',
    'startup ecosystem',
    'venture capital firms',
    'investment banks',
    'family offices',

    // English - Tech & Automation Terms
    'ai agents',
    'artificial intelligence fundraising',
    'machine learning funding',
    'automation platform',
    'saas fundraising',
    'tech startup funding',
    'fintech funding',
    'startup automation tools',
    'digital transformation funding',
    'startup software',
    'fundraising crm',
    'investor database',
    'startup analytics',
    'funding pipeline management',
    'investor tracking software',

    // French - Fundraising Terms
    'financement startup',
    'levée de fonds',
    'capital risque',
    'investissement startup',
    'financement participatif',
    'business angels',
    'capital développement',
    'amorçage startup',
    'série a financement',
    'série b financement',
    'préamorçage',
    'capital innovation',
    'fonds investissement',
    'venture capital france',
    'financement innovation',
    'automatisation levée fonds',
    'plateforme financement',
    'investisseurs privés',

    // French - Business Terms
    'création entreprise',
    'entrepreneuriat',
    'startup française',
    'incubateur startup',
    'accélérateur startup',
    'pitch deck automatisé',
    'plan affaires',
    'évaluation startup',
    'financement equity',
    'financement dette',
    'capital croissance',
    'fonds roulement',
    'stratégie financement',
    'relations investisseurs',
    'due diligence',

    // Spanish - Fundraising Terms
    'financiación startup',
    'capital riesgo',
    'inversión startup',
    'ronda financiación',
    'financiación semilla',
    'serie a financiación',
    'serie b financiación',
    'presemilla',
    'capital desarrollo',
    'fondos inversión',
    'venture capital españa',
    'inversores privados',
    'automatización financiación',
    'plataforma financiación',
    'inversores ángel',
    'financiación participativa',
    'capital innovación',
    'fondos venture capital',

    // Spanish - Business Terms
    'creación empresa',
    'emprendimiento',
    'startup española',
    'incubadora startup',
    'aceleradora startup',
    'pitch deck automatizado',
    'plan negocios',
    'valoración startup',
    'financiación equity',
    'financiación deuda',
    'capital crecimiento',
    'capital trabajo',
    'estrategia financiación',
    'relaciones inversores',
    'diligencia debida',

    // Industry Specific Terms
    'biotech funding',
    'healthtech funding',
    'fintech investment',
    'edtech funding',
    'proptech investment',
    'cleantech funding',
    'deeptech investment',
    'mobility funding',
    'foodtech investment',
    'retailtech funding',
    'agtech investment',
    'spacetech funding',
    'cybersecurity funding',
    'blockchain funding',
    'web3 funding',
    'crypto startup funding',

    // Stage & Round Specific
    'pre seed round',
    'seed round',
    'series a round',
    'series b round',
    'series c round',
    'bridge funding',
    'mezzanine financing',
    'convertible notes',
    'safe investment',
    'equity crowdfunding',
    'revenue based financing',
    'venture debt',
    'growth equity',
    'late stage funding',
    'ipo preparation',
    'exit strategy',
    'acquisition funding',
  ],
  authors: [{ name: 'Suparaise Team' }],
  creator: 'Suparaise',
  publisher: 'Suparaise',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://suparaise.com',
    title: 'Suparaise',
    description:
      'Automate your startup fundraising with AI agents that reach out to investors for you, on autopilot',
    siteName: 'Suparaise',
    images: [
      {
        url: '/banner.png',
        width: 1200,
        height: 600,
        alt: 'Suparaise | AI-Powered Fundraising Automation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suparaise | AI-Powered Fundraising Automation',
    description:
      'Automate your startup fundraising with AI agents that reach out to investors for you, on autopilot',
    images: ['/banner.png'],
    creator: '@suparaise',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // TODO: Add your Google verification code
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: 'https://suparaise.com',
  },
  category: 'technology',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Suparaise',
    description: 'Agents that apply to funds for you, on autopilot.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    logo: 'https://suparaise.com/apple-touch-icon.png',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free plan available with paid tiers for advanced features',
    },
    provider: {
      '@type': 'Organization',
      name: 'Suparaise',
      url: 'https://suparaise.com',
      logo: 'https://suparaise.com/apple-touch-icon.png',
    },
    url: 'https://suparaise.com',
    sameAs: [
      'https://x.com/suparaise',
      'https://linkedin.com/company/suparaise',
    ],
    author: {
      '@type': 'Organization',
      name: 'lomi.',
    },
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#000000" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange={false}
            storageKey="suparaise-theme"
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </UserProvider>
        <Analytics />
      </body>
    </html>
  )
}
