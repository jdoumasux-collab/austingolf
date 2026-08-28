import type { Metadata } from "next"
import Link from "next/link"
import { globalSearch } from "@/lib/global-search"
import { SearchResults } from "@/components/search/search-results"

/**
 * Canonical global-search results page (Global Search brief §5).
 *
 * Query pattern: /search?q=lions. Server-rendered from the shared
 * lib/global-search model, so the header combobox and this page always agree.
 * Deliberately lightweight — no faceting, analytics, saved searches or
 * autocomplete infrastructure (§5).
 */

export const metadata: Metadata = {
  title: "Search",
  description: "Search across Austin-area courses, properties, collections, areas and guides.",
}

// A few real entry points for the empty state — all canonical routes.
const SUGGESTIONS = [
  { label: "All courses", href: "/courses" },
  { label: "Collections", href: "/collections" },
  { label: "Areas", href: "/areas" },
  { label: "Guides", href: "/guides" },
]

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const params = await searchParams
  const raw = Array.isArray(params.q) ? params.q[0] : params.q
  const query = (raw ?? "").trim()
  const hasQuery = query.length >= 2
  const hits = hasQuery ? globalSearch(query) : []

  return (
    <main className="ag-shell py-12 md:py-16">
      <div className="max-w-2xl">
        <p className="ag-label text-green-deep">Search</p>
        <h1 className="ag-display mt-2 text-pretty text-3xl md:text-4xl">
          {hasQuery ? (
            <>
              Results for <span className="text-green-deep">&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            "Search AustinGolf"
          )}
        </h1>
        {hasQuery ? (
          <p className="mt-3 text-ink-soft">
            {hits.length} {hits.length === 1 ? "result" : "results"} across courses, properties,
            collections, areas and guides.
          </p>
        ) : (
          <p className="mt-3 leading-relaxed text-ink-soft">
            Find a course, property, collection, area or guide. Type a name in the search box above,
            or start from one of these:
          </p>
        )}
      </div>

      {/* Empty-query state: real starting points, never a fake results shell. */}
      {!hasQuery ? (
        <ul className="mt-6 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="inline-flex rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-green hover:text-green-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : hits.length > 0 ? (
        <SearchResults hits={hits} />
      ) : (
        /* Zero-results state: honest, with concrete next steps. */
        <div className="mt-10 max-w-2xl rounded-lg border border-border bg-card p-6">
          <p className="text-ink">
            Nothing matched <span className="font-medium">&ldquo;{query}&rdquo;</span>.
          </p>
          <p className="mt-2 leading-relaxed text-ink-soft">
            Search covers course and property names, collections, metro areas and guides. Try a
            course name, an area like &ldquo;Round Rock&rdquo;, or browse everything below.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="inline-flex rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-green hover:text-green-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
