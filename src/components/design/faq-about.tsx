'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Mail } from 'lucide-react'
import { cn } from '@/lib/actions/utils'
import { Button } from '@/components/ui/button'

const faqAboutData = [
  {
    question: 'Can I customize the information sent to each investor ?',
    answer:
      'Absolutely! While our agents handle the automation, you can customize your pitch and responses for different types of investors. Our platform learns your preferences and adapts submissions accordingly, with built-in features that can help you tailor the outreach to each specific investor.',
  },
  {
    question: 'How many VC applications can I submit?',
    answer:
      'The number of applications depends on your plan. Our Starter plan includes 3 applications per month, while our Pro plan offers 50 applications. The Max plan offers 125 applications. If you need more runs, you can always contact us; we can always increase your limit.',
  },
  {
    question: 'What happens if an investor responds to my application ?',
    answer:
      "All investor responses come directly to your email. We don't intercept or handle communications - you maintain direct contact with interested investors from the first response onward.",
  },
  {
    question: 'What types of investors are in your database?',
    answer:
      'Our database includes VCs, angels, accelerators, and incubators from all around the world. We cover early-stage to growth-stage investors across all industries and geographies. We are also constantly updating our database to ensure we have the most up-to-date information.',
  },
  {
    question: 'Do you work with startups at any stage?',
    answer:
      "Suparaise works best for pre-seed to Series A startups. If you're at the idea stage without an MVP, 70% of the investors in our database won't be a good fit yet.",
  },
  {
    question: 'Will Suparaise steal my startup idea ?',
    answer:
      'Absolutely not. We built Suparaise because fundraising is hard and time-consuming. We have our hands already full building this product and no interest in copying your product or using your materials for competitive purposes. We lack both the bandwidth and desire to replicate what you do. Your ideas and data are yours and we will never use them for any other purpose.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      "Yes, you have complete control over your subscription. Cancel anytime directly from your dashboard with no penalties or fees. You'll retain full access until your current billing period ends. You can also permanently delete your account and all associated data from our system at any time.",
  },
]

interface FaqAboutSectionProps extends React.HTMLAttributes<HTMLElement> {
  contactInfo?: {
    title: string
    description: string
    buttonText: string
    onContact?: () => void
  }
}

const FaqAboutSection = React.forwardRef<HTMLElement, FaqAboutSectionProps>(
  ({ className, contactInfo, ...props }, ref) => {
    return (
      <section
        ref={ref}
        id="faq-about"
        className={cn('pt-5 pb-32 select-none', className)}
        {...props}
      >
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex justify-center">
              <div className="border py-1 px-4 rounded-sm">FAQ</div>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter text-gray-900 dark:text-white">
              Frequently asked questions
            </h2>
            <p className="text-center mt-5 opacity-75">
              Detailed answers about features, pricing, and how Suparaise works
              under the hood.
            </p>

            {/* FAQ Items */}
            <div className="max-w-2xl mx-auto space-y-2 mt-12 w-full">
              {faqAboutData.map((item, index) => (
                <FaqAboutItem
                  key={index}
                  question={item.question}
                  answer={item.answer}
                  index={index}
                />
              ))}
            </div>

            {/* Contact Section */}
            {contactInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="max-w-md mx-auto mt-12 p-6 rounded-sm text-center"
              >
                <div className="inline-flex items-center justify-center p-1.5 rounded-sm mb-4">
                  <Mail className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {contactInfo.title}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {contactInfo.description}
                </p>
                <Button size="sm" onClick={contactInfo.onContact}>
                  {contactInfo.buttonText}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    )
  },
)
FaqAboutSection.displayName = 'FaqAboutSection'

// Internal FaqAboutItem component
const FaqAboutItem = React.forwardRef<
  HTMLDivElement,
  {
    question: string
    answer: string
    index: number
  }
>((props, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const { question, answer, index } = props

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.1 }}
      className={cn(
        'group rounded-sm',
        'transition-all duration-200 ease-in-out',
        'border border-border/50',
        isOpen
          ? 'bg-gradient-to-br from-background via-muted/50 to-background'
          : 'hover:bg-muted/50',
      )}
    >
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-6 h-auto justify-between hover:bg-transparent items-start flex-wrap sm:flex-nowrap"
      >
        <h3
          className={cn(
            'text-sm sm:text-base font-medium transition-colors duration-200 text-left leading-relaxed',
            'text-gray-600 dark:text-white',
            'break-words whitespace-normal word-break hyphens-auto flex-1 pr-3',
            isOpen && 'text-gray-900 dark:text-white',
          )}
        >
          {question}
        </h3>
        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1,
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            'p-0.5 rounded-sm flex-shrink-0 mt-1',
            'transition-colors duration-200',
            isOpen ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </Button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: { duration: 0.2, ease: 'easeOut' },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: { duration: 0.2, ease: 'easeIn' },
            }}
          >
            <div className="px-6 pb-4 pt-2">
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-sm text-muted-foreground leading-relaxed text-left"
              >
                {answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})
FaqAboutItem.displayName = 'FaqAboutItem'

export { FaqAboutSection }
