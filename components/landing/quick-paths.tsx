/**
 * Quick Paths (§5.2).
 *
 * Visible without opening a filter panel, and never hidden inside the
 * hamburger menu on mobile (§13). `Under $100` is deliberately absent because
 * pricing coverage is intentionally incomplete in the prototype dataset.
 */

import Link from "next/link"
import { courses, matchesQuickPath, quickPaths } from "@/lib/domain"

export function QuickPaths() {
  // Gen2 §14: shortcuts stay on one line with the utility rail, not a module.
  return (
    <nav
      aria-label="Quick paths"
      className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2"
    >
      <h2 className="ag-label text-ink-soft">Start here</h2>
      <ul className="flex list-none flex-wrap gap-2 p-0">
        {quickPaths.map((path) => {
          const count = courses.filter((c) => matchesQuickPath(path.id, c)).length
          return (
            <li key={path.id}>
              <Link
                href={`/courses/explore?path=${path.id}`}
                className="flex items-baseline gap-2 rounded-full border border-input bg-background px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-green hover:text-green-deep"
              >
                {path.label}
                <span className="text-xs font-normal text-ink-soft">{count}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
