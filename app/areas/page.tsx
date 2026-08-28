/**
 * AREAS hub.
 *
 * A canonical geographic index for Austin golf. Areas answer "where is the
 * golf?" — the counterpart to Collections, which answer "which courses fit a
 * context?". This page explains that organisation briefly and lists every
 * published Area, each linking to its canonical Area page.
 *
 * Layout is reused from the Collections hub (the same bordered gap-px card grid)
 * so Areas reads as part of the existing system, not a new visual language. The
 * counts come from the canonical `regionCourses`, so they match the landing
 * "Explore by area" module exactly.
 *
 * Not in the primary nav yet by design (§7): this exists to give geography a
 * canonical home and support internal linking before the nav migration.
 */

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { areaCourses, areas } from "@/lib/areas"
import { courseCountLabel } from "@/lib/domain"

export const metadata = {
  // Root layout supplies "| AustinGolf" via its title template (Gen2 §10).
  title: "Areas",
  description:
    "Where Austin golf is, by region — the city core, the terrain to the west, and the open-access golf north and east.",
}

export default function AreasPage() {
  // The canonical region set intentionally omits a few outlying courses whose
  // dataset areas are unmapped; disclose that rather than imply full coverage.
  const covered = areas.reduce((n, a) => n + areaCourses(a).length, 0)

  return (
    <section className="ag-shell py-14 sm:py-20">
      <div className="max-w-2xl">
        <p className="ag-label text-green-deep">Areas</p>
        <h1 className="ag-display mt-2.5 text-3xl text-ink sm:text-4xl">
          Austin golf by area
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          Austin golf is a geography problem before it is a taste problem. These
          regions organise the metro by where the golf actually is — the
          municipal courses in the core, the terrain that climbs to the west,
          and the open-access volume north and east. Each links to the courses
          there and to the Course Finder, where you can filter further.
        </p>
      </div>

      <ul className="mt-8 grid list-none grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border p-0 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((a) => {
          const count = areaCourses(a).length
          return (
            <li key={a.slug}>
              <Link
                href={`/areas/${a.slug}`}
                className="group flex h-full flex-col bg-card p-5 transition-colors hover:bg-green-wash sm:p-6"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="ag-display text-xl leading-snug text-ink">
                    {a.region.label}
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-green transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
                <span className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {a.region.blurb}
                </span>
                <span className="ag-label mt-4 text-green-deep">
                  {courseCountLabel(count)}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      {/*
        Honest coverage note. A few outlying courses sit in areas the region set
        does not map, so the region counts do not sum to the full catalogue. The
        Course Finder is the exhaustive index; Areas is the geographic one.
      */}
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-soft">
        These regions cover {courseCountLabel(covered)}. A few outlying courses
        sit beyond them — the{" "}
        <Link
          href="/courses/explore"
          className="font-semibold text-green-deep underline-offset-2 hover:underline"
        >
          Course Finder
        </Link>{" "}
        lists every course, wherever it is.
      </p>
    </section>
  )
}
