'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Mail } from 'lucide-react'
import { cn } from '@/lib/actions/utils'
import { Button } from '@/components/ui/button'

const faqData = [
  {
    question: 'How does Suparaise automate my fundraising process ?',
    answer:
      'Suparaise uses AI agents  to automatically fill out investment application forms on your behalf. Simply provide your startup information once, and our agents will handle the repetitive tasks of applying to multiple funds.',
  },
  {
    question: 'Is my startup data secure ?',
    answer:
      'Yes, we take security seriously. All your data is encrypted in transit and at rest. We never share your information with third parties.',
  },
  {
    question: 'How quickly can I get started ?',
    answer:
      'You can get started immediately! Simply sign up, complete your profile, and select the investors you want to apply to. Our agents will begin automating the process within seconds. No complex setup required.',
  },
  {
    question: 'Can I track which applications have been submitted ?',
    answer:
      "Yes! Our dashboard shows you exactly which investors you've applied to, submission dates, and the data provided by the agents. Full transparency on the outreach.",
  },
  {
    question: 'Do you guarantee meetings or funding success ?',
    answer:
      "We automate the application process, but we cannot guarantee meetings or funding outcomes. Success depends on your startup's fit with investor criteria, market conditions, and timing. We help you reach more investors efficiently.",
  },
  {
    question: 'How accurate are the agents ?',
    answer:
      'Our AI agents are highly accurate when filling out applications based on the information you provide. The quality of outputs directly correlates with the quality of your company information. We include customization features that let you refine your startup information and tailor responses for different investor types and funds, ensuring maximum accuracy for your most important applications.',
  },
  {
    question: 'Can I get a refund if I am not satisfied ?',
    answer:
      'Yes, we offer refunds within 7 days of purchase if our service fails to meet the technical specifications promised or if there are significant technical issues preventing you from using our platform. If you experience other issues, please reach out with details and we will work together to find a solution that works for you.',
  },
]

interface FaqSectionProps extends React.HTMLAttributes<HTMLElement> {
  contactInfo?: {
    title: string
    description: string
    buttonText: string
    onContact?: () => void
  }
}

const FaqSection = React.forwardRef<HTMLElement, FaqSectionProps>(
  ({ className, contactInfo, ...props }, ref) => {
    return (
      <section
        ref={ref}
        id="faq"
        className={cn('pt-20 pb-32 select-none', className)}
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
              Everything you need to know about automating your fundraising with
              Suparaise.
            </p>

            {/* FAQ Items */}
            <div className="max-w-2xl mx-auto space-y-2 mt-12 w-full">
              {faqData.map((item, index) => (
                <FaqItem
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
FaqSection.displayName = 'FaqSection'

// Internal FaqItem component
const FaqItem = React.forwardRef<
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
FaqItem.displayName = 'FaqItem'

export { FaqSection }
