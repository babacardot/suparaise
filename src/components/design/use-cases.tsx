import Link from 'next/link'
import { Button } from '@/components/ui/button'

export type Scenario = {
  id: string
  title: string
  subtitle: string
  pains: string[]
  howItWorks: string[]
}

// Server component rendering the use-cases content
export const UseCases = ({ scenarios }: { scenarios: Scenario[] }) => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_10%,transparent_0%,var(--background)_75%)]"></div>
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Use cases
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Practical scenarios that show how Suparaise helps founders get more
            investor meetings with less manual work.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-sidebar-accent transition-colors duration-200"
            >
              <Link href="#technical-pre-seed">Fundraising is time-consuming</Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-sidebar-accent transition-colors duration-200"
            >
              <Link href="#international-us">International founders</Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-sidebar-accent transition-colors duration-200"
            >
              <Link href="#busy-ceo">Busy CEOs</Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-sidebar-accent transition-colors duration-200"
            >
              <Link href="#post-rejection-expansion">After rejections</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-12">
          {scenarios.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <div className="rounded-sm border p-6 bg-card">
                <h2 className="text-2xl font-semibold mb-1">{s.title}</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {s.subtitle}
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold mb-2">Challenges</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">
                      {s.pains.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Solution</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">
                      {s.howItWorks.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}

export default UseCases
