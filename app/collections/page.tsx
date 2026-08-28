/**
 * COLLECTIONS hub.
 *
 * A Collection is editorial orientation wrapped around a deterministic slice of
 * the verified course set — used where AustinGolf judgment materially improves
 * the choice, as opposed to a simple structured Explorer filter. This page
 * explains that briefly and lists every published launch Collection.
 *
 * Styling and layout are reused from the landing "Find the right round" module
 * (the same bordered gap-px card grid), so Collections reads as part of the
 * existing system rather than a new visual language.
 */

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { collectionCourses, collections } from "@/lib/collections"
import { courseCountLabel } from "@/lib/domain"

export const metadata = {
  // Root layout supplies "| AustinGolf" via its title template (Gen2 §10).
  title: "Collections",
  description:
    "Curated ways into Austin golf — grouped by setting, access and the kind of round, with AustinGolf's reasoning attached.",
}

export default function CollectionsPage() {
  return (
    <section className="ag-shell py-14 sm:py-20">
      <div className="max-w-2xl">
        <p className="ag-label text-green-deep">Collections</p>
        <h1 className="ag-display mt-2.5 text-3xl text-ink sm:text-4xl">
          Curated ways into Austin golf
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          Collections group the verified course set around a setting, a kind of
          access or the sort of round you are after — with our reasoning
          attached. When the question is a plain filter, like public courses or
          the map, the Course Finder answers it directly instead.
        </p>
      </div>

      <ul className="mt-8 grid list-none grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border p-0 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => {
          const count = collectionCourses(c).length
          return (
            <li key={c.slug}>
              <Link
                href={`/collections/${c.slug}`}
                className="group flex h-full flex-col bg-card p-5 transition-colors hover:bg-green-wash sm:p-6"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="ag-display text-xl leading-snug text-ink">
                    {c.title}
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-green transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
                <span className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {c.dek}
                </span>
                <span className="ag-label mt-4 text-green-deep">
                  {courseCountLabel(count)}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
