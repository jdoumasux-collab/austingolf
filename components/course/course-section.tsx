/**
 * Shared Course Page section wrapper.
 *
 * Every module renders through this so heading hierarchy stays correct by
 * construction: the page owns the single `h1`, and each module is an `h2` inside
 * a labelled `section` landmark. Building it once also means no module can
 * accidentally ship a heading that only *looks* like a heading.
 */

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function CourseSection({
  id,
  title,
  intro,
  children,
  className,
}: {
  id: string
  title: string
  /** One factual line of orientation. Never filler — omit it instead. */
  intro?: ReactNode
  children: ReactNode
  className?: string
}) {
  const headingId = `${id}-heading`
  return (
    <section aria-labelledby={headingId} className={cn("mt-10 first:mt-0", className)}>
      <h2 id={headingId} className="ag-display text-xl text-ink sm:text-2xl">
        {title}
      </h2>
      {intro ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{intro}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  )
}

/**
 * The provenance line used under verified modules.
 *
 * Kept as one component so the trust language is identical everywhere and cannot
 * drift into implying more verification than the dataset holds.
 */
export function VerifiedNote({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-xs leading-snug text-ink-muted">{children}</p>
}
