/**
 * Austin Golf Explained (§5.4, Gen2 §17).
 *
 * The orientation layer: how Austin golf actually works, for someone who does
 * not yet know the market. Gen2 strengthens this into an editorial ledger rather
 * than another grid of tiles, because the job here is to orient at a glance and
 * then hand off — not to compete with the discovery modules above it.
 *
 * Every count is derived from the dataset. The labels are the consumer concepts
 * from Gen2 §17: Austin Munis, Daily-Fee Golf, Hill Country Golf, Resort Golf,
 * Short & Casual Golf.
 */

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { courseCountLabel, glanceGroups } from "@/lib/domain"
import { collectionForClassification, collectionForQuickPath } from "@/lib/collections"

/**
 * Cross-link integration: resolve a glance row to its canonical editorial
 * Collection via the row's own `source` provenance, falling back to the
 * Explorer `href` when the row is a structured access category (Daily-Fee),
 * which has no Collection and stays on the Finder per the locked IA.
 */
function glanceHref(g: ReturnType<typeof glanceGroups>[number]): string {
  const collection =
    g.source.kind === "path"
      ? collectionForQuickPath(g.source.id)
      : g.source.kind === "intent"
        ? collectionForClassification(g.source.classification)
        : undefined
  return collection ? `/collections/${collection.slug}` : g.href
}

export function AtAGlance() {
  const groups = glanceGroups()

  return (
    <section
      id="austin-golf-explained"
      aria-labelledby="glance-heading"
      className="scroll-mt-20 bg-sand-soft/60 py-14 sm:py-20"
    >
      <div className="ag-shell">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="max-w-xl">
            <p className="ag-label text-green-deep">Orientation</p>
            <h2
              id="glance-heading"
              className="ag-display mt-2.5 text-3xl text-ink sm:text-4xl"
            >
              Austin golf, explained
            </h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-ink-soft">
            Five kinds of golf day, and roughly what each one means here. Enough
            to know where you are before you start narrowing.
          </p>
        </div>

        {/* Ledger rows: label, count, what it means, and a route in. */}
        <ul className="mt-8 flex list-none flex-col p-0">
          {groups.map((g) => (
            <li key={g.label} className="border-t border-ink/12 last:border-b">
              <Link
                href={glanceHref(g)}
                className="group flex flex-wrap items-baseline gap-x-6 gap-y-1.5 py-5 transition-colors hover:bg-background/50"
              >
                <span className="ag-display w-full text-xl text-ink sm:w-64 sm:shrink-0">
                  {g.label}
                </span>
                <span className="flex-1 text-sm leading-relaxed text-ink-soft">
                  {g.blurb}
                </span>
                <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-green-deep">
                  {courseCountLabel(g.count)}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
