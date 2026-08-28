/**
 * Go Deeper with AustinGolf (§5.4, Gen2 §18).
 *
 * The editorial authority layer: discovery should lead naturally into guides,
 * researched comparisons and explainers, and communicate that AustinGolf brings
 * judgment and context rather than only structured data.
 *
 * The trust constraint is the important part (Gen2 §18, §24). The prototype has
 * no guide bodies and no published firsthand reviews, so nothing here invents an
 * article, a byline, a date or a review status. Each entry states a decision we
 * can actually settle from verified data and routes into the real Finder state
 * that settles it. Review coverage is named as pending rather than implied.
 */

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { collectionForClassification, collectionForQuickPath } from "@/lib/collections"

/*
 * Cross-link integration: each editorial card promises a curated answer, and an
 * editorial Collection IS that answer — so where a card's question maps to a
 * canonical Collection, it now leads there instead of to the raw Explorer
 * filter. `source` records that mapping; the Explorer `href` remains the
 * fallback for cards with no Collection ("Great for Groups"), which stay on the
 * Finder. The trust posture is unchanged: these are settle-from-data questions,
 * not firsthand reviews, and nothing here gains a byline, date or review badge.
 */
const entries = [
  {
    kicker: "Comparison",
    question: "Where should a group of twelve actually play?",
    support:
      "Weighs the open-access courses that can absorb an outing against the resort option, as a property rather than four near-identical course cards.",
    href: "/courses/explore?intent=Great+for+Groups",
    cta: "See group golf",
    source: { kind: "intent", classification: "Great for Groups" } as const,
  },
  {
    kicker: "Comparison",
    question: "Which Austin courses hold up for a low handicap?",
    support:
      "The layouts with enough golf course to stay interesting after the third round, and what specifically makes each one demanding.",
    href: "/courses/explore?intent=Serious+Golf",
    cta: "See serious golf",
    source: { kind: "intent", classification: "Serious Golf" } as const,
  },
  {
    kicker: "Explainer",
    question: "What can you play close to downtown?",
    support:
      "Municipal and daily-fee golf inside the city core, ordered by distance from downtown rather than by reputation.",
    href: "/courses/explore?path=near-downtown",
    cta: "See downtown golf",
    source: { kind: "path", id: "near-downtown" } as const,
  },
] as const

/** Canonical Collection href for an entry, or its Explorer fallback. */
function entryHref(g: (typeof entries)[number]): string {
  const collection =
    g.source.kind === "path"
      ? collectionForQuickPath(g.source.id)
      : collectionForClassification(g.source.classification)
  return collection ? `/collections/${collection.slug}` : g.href
}

export function Guides() {
  return (
    <section
      id="guides"
      aria-labelledby="guides-heading"
      className="ag-shell scroll-mt-20 py-14 sm:py-20"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="max-w-xl">
          <p className="ag-label text-green-deep">Editorial</p>
          <h2
            id="guides-heading"
            className="ag-display mt-2.5 text-3xl text-ink sm:text-4xl"
          >
            Go deeper with AustinGolf
          </h2>
        </div>
        <p className="max-w-sm text-base leading-relaxed text-ink-soft">
          Structured data tells you what a course is. These answer which one to
          play, and say why.
        </p>
      </div>

      <ul className="mt-8 grid list-none grid-cols-1 gap-4 p-0 lg:grid-cols-3">
        {entries.map((g) => (
          <li key={g.href}>
            <Link
              href={entryHref(g)}
              className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-green"
            >
              <span className="ag-label text-green-deep">{g.kicker}</span>
              <span className="ag-display mt-3 text-xl leading-snug text-ink">
                {g.question}
              </span>
              <span className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-soft">
                {g.support}
              </span>
              <span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-green-deep">
                {g.cta}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/*
        Gen2 §18/§24: coverage is stated plainly instead of being implied. No
        course carries a Guide or Review badge it has not earned.
      */}
      <p className="mt-6 rounded-xl border border-dashed border-border bg-cream px-5 py-4 text-sm leading-relaxed text-ink-soft">
        Firsthand course reviews are in progress and none are published yet.
        Until a course has been played and written up by AustinGolf, it carries
        no review — we would rather show you nothing than a rating we cannot
        stand behind.
      </p>
    </section>
  )
}
