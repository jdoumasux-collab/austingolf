/**
 * Module 3 — decision support.
 *
 * The value is recommendation *plus* explanation, so each reason renders as its
 * classification with the approved editorial sentence beneath it. Badges alone
 * would be badge soup; a sentence alone would lose the pathway link.
 *
 * The list is already capped and ordered by `displayReasons`. The arrival intent
 * leads when there is one, which is why the matching reason is marked rather
 * than reordered silently — the golfer should see their own question answered.
 */

import Link from "next/link"
import type { Recommendation } from "@/lib/domain"

export function DecisionSupport({
  reasons,
  intent,
}: {
  reasons: Recommendation[]
  /** Arrival intent, used only to mark which reason answers it. */
  intent: string | null
}) {
  if (!reasons.length) return null

  return (
    <ul className="flex list-none flex-col gap-3 p-0">
      {reasons.map((r) => {
        const isArrival = r.classification === intent
        return (
          <li
            key={r.classification}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <Link
                href={`/courses/explore?intent=${encodeURIComponent(r.classification)}`}
                className="text-sm font-semibold text-green-deep hover:underline"
              >
                {r.classification}
              </Link>
              {isArrival ? (
                <span className="ag-label text-ink-muted">
                  what you searched for
                </span>
              ) : null}
            </div>
            {/* Approved editorial reasoning, rendered verbatim. */}
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              {r.whyItFits}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
