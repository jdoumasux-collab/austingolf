import Link from "next/link"
import { courses, properties } from "@/lib/domain"

/**
 * Derived, never hardcoded: this sentence is a factual claim about dataset scope,
 * so it has to move when the projection moves. It previously read "15 courses"
 * and silently became false the moment the projection grew.
 *
 * The noun is generic because the projected properties are no longer all resorts:
 * Barton Creek is a resort, Clay/Kizer is a municipal complex. "resort properties"
 * would now be false for half of them.
 */
const SCOPE = `${courses.length} courses and ${
  properties.length === 1 ? "one multi-course property" : `${properties.length} multi-course properties`
}`

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-cream">
      <div className="ag-shell flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <div className="flex items-baseline gap-1.5">
            <span className="ag-display text-lg leading-none text-ink">Austin</span>
            <span className="ag-display text-lg leading-none text-green">Golf</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Independent coverage of golf in Central Texas — what each course
            actually is, and who it suits.
          </p>
        </div>

        <nav aria-label="Footer" className="flex gap-12">
          <div>
            <h2 className="ag-label text-ink-soft">Courses</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <Link href="/courses/explore" className="text-ink transition-colors hover:text-green-deep">
                  Explore all
                </Link>
              </li>
              <li>
                <Link href="/courses/explore?view=map" className="text-ink transition-colors hover:text-green-deep">
                  Map
                </Link>
              </li>
              <li>
                <Link href="/courses#find-the-right-round" className="text-ink transition-colors hover:text-green-deep">
                  Find the right round
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="ag-shell border-t border-border/70 py-5">
        <p className="text-xs leading-relaxed text-ink-soft">
          Prototype V1. Course facts are drawn from a limited verified dataset of{" "}
          {SCOPE}; unverified details are shown as unknown rather than guessed. No
          pricing or tee-time data.
        </p>
      </div>
    </footer>
  )
}
