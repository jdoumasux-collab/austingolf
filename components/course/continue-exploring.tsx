/**
 * Module 11 — continue exploring.
 *
 * Links are supplied by `continuations`, which composes existing Finder state.
 * Nothing here ranks or filters, so there is no second recommendation engine to
 * keep in sync with the Finder.
 */

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Continuation } from "@/lib/course-page"

export function ContinueExploring({ items }: { items: Continuation[] }) {
  if (!items.length) return null

  return (
    <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
      {items.map((c) => (
        <li key={c.href}>
          <Link
            href={c.href}
            className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-green/40 hover:bg-green-wash"
          >
            <span>
              <span className="block text-sm font-semibold text-ink">{c.label}</span>
              <span className="mt-0.5 block text-xs text-ink-muted">{c.note}</span>
            </span>
            <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-green-deep" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
