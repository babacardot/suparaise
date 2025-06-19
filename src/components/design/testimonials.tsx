'use client'

import React from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'

interface Testimonial {
  text: string
  image: string
  name: string
  role: string
}

export const TestimonialsColumn = (props: {
  className?: string
  testimonials: Testimonial[]
  duration?: number
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          y: '-50%',
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        className="flex flex-col gap-6 pb-6 bg-background"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div
                  className="p-10 rounded-sm border shadow-lg shadow-primary/10 max-w-xs w-full"
                  key={i}
                >
                  <div>{text}</div>
                  <div className="flex items-center gap-2 mt-5">
                    <Image
                      width={40}
                      height={40}
                      src={image}
                      alt={name}
                      className="h-10 w-10 rounded-sm"
                    />
                    <div className="flex flex-col">
                      <div className="font-medium tracking-tight leading-5">
                        {name}
                      </div>
                      <div className="leading-5 opacity-60 tracking-tight">
                        {role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  )
}

const testimonials = [
  {
    text: "Suparaise saved me 40+ hours of manual form filling. I applied to 50 VCs in a single afternoon instead of weeks. The AI perfectly captured our startup's essence and did the job as if it was me.",
    image: 'https://picsum.photos/seed/sarah/200/200',
    name: 'Sarah Chen',
    role: 'CEO, TechFlow',
  },
  {
    text: 'Finally, a tool that understands the fundraising struggle. Suparaise automated all our pre-seed applications while I focused on building our product.',
    image: 'https://picsum.photos/seed/marcus/200/200',
    name: 'Marcus Rodriguez',
    role: 'Co-founder, DataVault',
  },
  {
    text: "The AI agent filled out complex VC forms with remarkable accuracy. It even customized our pitch for each firm's investment thesis. Game-changer!",
    image: 'https://picsum.photos/seed/priya/200/200',
    name: 'Priya Patel',
    role: 'Founder, GreenTech Solutions',
  },
  {
    text: 'We raised our pre-seed round 3x faster using Suparaise. The automated outreach feature connected us with VCs we never would have discovered manually.',
    image: 'https://picsum.photos/seed/james/200/200',
    name: 'James Wilson',
    role: 'CEO, FinanceAI',
  },
  {
    text: 'I was sceptical about the accuracy of the agent but then I started receiving meeting requests from VCs and emails. It actually did the job as if it was me.',
    image: 'https://picsum.photos/seed/emily/200/200',
    name: 'Emily Zhang',
    role: 'Founder, HealthTech Pro',
  },
  {
    text: 'Suparaise streamlined our entire fundraising process. From form filling to follow-ups, everything was automated perfectly. Highly recommend!',
    image: 'https://picsum.photos/seed/david/200/200',
    name: 'David Kim',
    role: 'CEO, CloudScale',
  },
  {
    text: 'The AI understood our B2B SaaS model and tailored each application accordingly based on the information I provided. We secured meetings with top-tier VCs in record time.',
    image: 'https://picsum.photos/seed/rachel/200/200',
    name: 'Rachel Thompson',
    role: 'Founder, SalesFlow',
  },
  {
    text: 'Suparaise had already a very complete list of all the VCs and funds in the world so it made easy for us to apply to all of them in record time. No manual work was required at all.',
    image: 'https://picsum.photos/seed/alex/200/200',
    name: 'Alex Martinez',
    role: 'CEO, NextGen Robotics',
  },
]

const firstColumn = testimonials.slice(0, 3)
const secondColumn = testimonials.slice(3, 6)
const thirdColumn = testimonials.slice(6, 9)

const Testimonials = () => {
  return (
    <section className="bg-background my-20 relative">
      <div className="mx-auto max-w-5xl px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-sm">Testimonials</div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5">
            What founders say
          </h2>
          <p className="text-center mt-5 opacity-75">
            See how Suparaise is transforming the fundraising journey for
            startups.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  )
}

export default Testimonials
