import Link from 'next/link'
import { XIcon } from '@/components/icons/XIcon'
import { PHIcon } from '@/components/icons/PHIcon'

export const Footer = () => {
    return (
        <footer className="border-t bg-background rounded-sm">
            <div className="mx-auto max-w-5xl px-6 py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                        <Link
                            href="/privacy"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Terms
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="https://twitter.com/suparaise"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Follow us on X"
                        >
                            <XIcon className="h-5 w-5" />
                        </Link>
                        <Link
                            href="https://www.producthunt.com/posts/suparaise"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Check us out on Product Hunt"
                        >
                            <PHIcon className="h-5 w-5" />
                        </Link>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t text-left">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Suparaise. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
} 