/**
 * Find the Right Round (§5.3, Gen2 §5, §15).
 *
 * Gen1 exposed the recommendation taxonomy: two oversized cards plus a row of
 * classification pills. Gen2 makes this a curated decision aid instead — the six
 * locked pathways at roughly equal visual weight, scannable together without
 * meaningful scrolling.
 *
 * `Beginner Friendly` is absent (Gen2 §4): "methodology pending" is an internal
 * product condition, not consumer content. `Hill Country Experience` and
 * `Practice Destination` remain valid internal classifications and still drive
 * Quick Paths and the orientation layer — they just do not compete for the
 * primary decision interface.
 *
 * Each pathway carries enough meaning to be understood, and deliberately stops
 * short of becoming a mini Course Card (§15).
 */

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { courseCountLabel, courses, primaryPathways } from "@/lib/domain"
import { collectionForClassification } from "@/lib/collections"

const countFor = (id: string) =>
  courses.filter((c) => c.recommendations.some((r) => r.classification === id)).length

export function FindTheRightRound() {
  return (
    <section
      id="find-the-right-round"
      aria-labelledby="ftrr-heading"
      className="ag-shell scroll-mt-20 py-14 sm:py-20"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="max-w-xl">
          <p className="ag-label text-green-deep">Decision support</p>
          <h2
            id="ftrr-heading"
            className="ag-display mt-2.5 text-3xl text-ink sm:text-4xl"
          >
            Find the right round
          </h2>
        </div>
        <p className="max-w-sm text-base leading-relaxed text-ink-soft">
          Start from what the day has to do, not from a filter. Every pathway
          shows our reasoning, so you can see why a course is on the list.
        </p>
      </div>

      {/* Six pathways, equal weight, one scan. */}
      <ul className="mt-8 grid list-none grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border p-0 sm:grid-cols-2 lg:grid-cols-3">
        {primaryPathways.map((c) => {
          // Cross-link integration: lead to the canonical editorial Collection
          // when this pathway has one; otherwise keep the intent Explorer state
          // (so "Great for Groups" and "Golf Trip", which have no Collection,
          // stay on the Finder — locked IA §3).
          const collection = collectionForClassification(c.id)
          const href = collection
            ? `/collections/${collection.slug}`
            : `/courses/explore?intent=${encodeURIComponent(c.id)}`
          return (
          <li key={c.id}>
            <Link
              href={href}
              className="group flex h-full flex-col bg-card p-5 transition-colors hover:bg-green-wash sm:p-6"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="ag-display text-xl leading-snug text-ink">
                  {c.label}
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-green transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </span>
              <span className="mt-2 text-sm leading-relaxed text-ink-soft">
                {c.orientation}
              </span>
              <span className="ag-label mt-4 text-green-deep">
                {courseCountLabel(countFor(c.id))}
              </span>
            </Link>
          </li>
          )
        })}
      </ul>
    </section>
  )
}
