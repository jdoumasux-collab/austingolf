import Link from "next/link"
import { MapPin, Building2, Flag, Layers, BookOpen } from "lucide-react"
import {
  groupHits,
  TYPE_LABEL,
  type GlobalSearchHit,
  type GlobalSearchType,
} from "@/lib/global-search"

/**
 * Server-rendered results for /search. Groups hits by type so the mix of
 * content is legible, and links every row to its canonical destination (§8).
 * Presentation only — all matching/ranking lives in lib/global-search.
 */
export function SearchResults({ hits }: { hits: GlobalSearchHit[] }) {
  const groups = groupHits(hits)

  return (
    <div className="mt-10 flex flex-col gap-10">
      {groups.map((group) => (
        <section key={group.type} aria-label={TYPE_LABEL[group.type]}>
          <h2 className="ag-label flex items-baseline gap-2 text-ink-soft">
            <span>{TYPE_LABEL[group.type]}</span>
            <span aria-hidden="true" className="text-ink-soft/60">
              {group.hits.length}
            </span>
          </h2>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {group.hits.map((hit) => (
              <li key={hit.id}>
                <Link
                  href={hit.href}
                  className="group flex items-center gap-3 py-3 transition-colors hover:bg-green-wash/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
                >
                  <TypeIcon type={hit.type} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink group-hover:text-green-deep">
                      {hit.title}
                    </span>
                    {hit.descriptor ? (
                      <span className="mt-0.5 block truncate text-sm text-ink-soft">{hit.descriptor}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function TypeIcon({ type }: { type: GlobalSearchType }) {
  const cls = "size-4 shrink-0 text-green"
  if (type === "property") return <Building2 aria-hidden="true" className={cls} />
  if (type === "area") return <MapPin aria-hidden="true" className={cls} />
  if (type === "collection") return <Layers aria-hidden="true" className={cls} />
  if (type === "guide") return <BookOpen aria-hidden="true" className={cls} />
  return <Flag aria-hidden="true" className={cls} />
}
