"use client"

/**
 * Zero-result state (§12).
 *
 * Explains the specific conflict and offers a named relaxation that preserves
 * the originating intent. Criteria are never silently broadened, and where a
 * filter failed because of thin verification rather than a real "No", the
 * coverage note says so — Unknown must not masquerade as No.
 */

import { AlertCircle } from "lucide-react"
import type { FactualFilterId, FinderResults, FinderState } from "@/lib/finder"
import { stateHeading } from "@/lib/finder"

type Props = {
  state: FinderState
  conflict: NonNullable<FinderResults["conflict"]>
  onRelax: (id: FactualFilterId) => void
  onRelaxMany: (ids: FactualFilterId[]) => void
  onClearFilters: () => void
}

/**
 * Recovery counts include Property results where a Property is a useful answer,
 * so the noun stays truthful rather than calling a resort a "course".
 */
const resultNoun = (n: number) => `${n} result${n === 1 ? "" : "s"}`

/** "A and B" / "A, B and C" — reads as prose rather than a filter dump. */
function joinLabels(labels: string[]) {
  if (labels.length <= 1) return labels[0] ?? ""
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`
}

export function NoResults({
  state,
  conflict,
  onRelax,
  onRelaxMany,
  onClearFilters,
}: Props) {
  const heading = stateHeading(state)

  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-clay" />
        <div>
          <h3 className="ag-display text-lg text-ink">
            No course matches every filter
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            {conflict.scopeCount > 0 ? (
              <>
                {conflict.scopeCount} course
                {conflict.scopeCount === 1 ? " matches" : "s match"}{" "}
                <strong className="font-semibold text-ink">{heading.label}</strong>
                {conflict.scopeCount === 1
                  ? ", but it does not satisfy every filter you have applied."
                  : ", but none of them also satisfy every filter you have applied."}
              </>
            ) : (
              <>Nothing in the prototype set matches this combination.</>
            )}
          </p>
        </div>
      </div>

      {conflict.relaxations.length ? (
        <div className="mt-5 border-t border-border pt-5">
          <p className="ag-label text-ink-soft">
            Keep {heading.label} and relax one filter
          </p>
          <ul className="mt-3 flex list-none flex-col gap-2.5 p-0">
            {conflict.relaxations.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onRelax(r.id)}
                  className="w-full rounded-lg border border-input bg-background p-3.5 text-left transition-colors hover:border-green"
                >
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-sm font-semibold text-ink">
                      Drop &ldquo;{r.label}&rdquo;
                    </span>
                    <span className="text-sm text-green-deep">{resultNoun(r.count)}</span>
                  </span>
                  {/* Names why the criterion failed, so a gap never reads as a No. */}
                  {r.coverageNote ? (
                    <span className="mt-1 block text-xs leading-snug text-ink-muted">
                      {r.coverageNote}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/*
        Tier 2 (§12). Reached only when no single relaxation recovers anything.
        The hierarchy deliberately leads with what the golfer keeps, names the
        conflicting constraints second, and gives the count third — so this
        reads as preserving a goal, not as executing set arithmetic. Nothing is
        relaxed until the golfer chooses it.
      */}
      {conflict.combinedRelaxations.length ? (
        <div className="mt-5 border-t border-border pt-5">
          <p className="ag-label text-ink-soft">
            No single filter unlocks a result
          </p>
          <ul className="mt-3 flex list-none flex-col gap-2.5 p-0">
            {conflict.combinedRelaxations.map((r) => (
              <li key={r.ids.join("+")}>
                <button
                  type="button"
                  onClick={() => onRelaxMany(r.ids)}
                  className="w-full rounded-lg border border-input bg-background p-3.5 text-left transition-colors hover:border-green"
                >
                  <span className="block text-sm font-semibold text-ink">
                    Keep {heading.label}
                  </span>
                  <span className="mt-1 block text-sm leading-snug text-ink-soft">
                    {resultNoun(r.count)} if{" "}
                    <span className="text-ink">{joinLabels(r.labels)}</span>{" "}
                    {r.labels.length > 1 ? "are" : "is"} relaxed.
                  </span>
                  {r.coverageNotes.map((note) => (
                    <span
                      key={note}
                      className="mt-1.5 block text-xs leading-snug text-ink-muted"
                    >
                      {note}
                    </span>
                  ))}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onClearFilters}
        className="mt-5 text-sm font-semibold text-green-deep underline underline-offset-4"
      >
        Clear all filters, keep {heading.label}
      </button>
    </div>
  )
}
