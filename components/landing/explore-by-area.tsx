/**
 * Explore by Area (§5.4, Gen2 §6, §16).
 *
 * Geography is a core AustinGolf decision variable, so this module has to *feel*
 * geographic rather than render as six more category cards. The left panel is a
 * schematic spatial surface plotting every verified course coordinate with
 * downtown as the anchor; the right rail is the simplified consumer geography.
 *
 * Two rules are doing real work here:
 *
 *  - Gen2 §6. The six regions are a presentation abstraction. Each one expands
 *    into the detailed dataset areas it covers and filters through the existing
 *    Area category, so the underlying geography is never overwritten.
 *  - Gen2 §16. The production map provider stays out of scope; this is the
 *    same provider-free approach the Finder map uses.
 */

import Link from "next/link"
import { Map } from "lucide-react"
import {
  DOWNTOWN,
  consumerRegions,
  courses,
  projectToPanel,
  regionCentroid,
  regionCourses,
} from "@/lib/domain"

export function ExploreByArea() {
  const downtown = projectToPanel(DOWNTOWN)

  return (
    <section
      id="explore-by-area"
      aria-labelledby="area-heading"
      className="scroll-mt-20 border-y border-border bg-cream py-14 sm:py-20"
    >
      <div className="ag-shell">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="max-w-xl">
            <p className="ag-label text-green-deep">Geography</p>
            <h2
              id="area-heading"
              className="ag-display mt-2.5 text-3xl text-ink sm:text-4xl"
            >
              Explore by area
            </h2>
            {/*
              "the good land is west" ranked the regions against each other.
              Terrain is an observable fact; which land is "good" is a quality
              verdict the dataset does not carry — and one that quietly
              devalued the municipal and east-side courses.
            */}
            <p className="mt-3 text-base leading-relaxed text-ink-soft">
              Austin golf is a geography problem before it is a taste problem.
              The city core holds the municipal courses, the terrain climbs to
              the west, and the open-access volume sits north and east.
            </p>
          </div>
          <Link
            href="/courses/explore?view=map"
            className="flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-green hover:text-green-deep"
          >
            <Map aria-hidden="true" className="size-4" />
            Open full map
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/*
            Schematic surface. Decorative and summarising only — it is not the
            interactive Finder map, so it carries no controls of its own and the
            region list beside it is the accessible route to the same states.
          */}
          <div
            aria-hidden="true"
            className="relative isolate min-h-64 overflow-hidden rounded-xl border border-border bg-background lg:col-span-3 lg:min-h-[26rem]"
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
                opacity: 0.5,
              }}
            />

            {/* Every verified course point, so the density is honest. */}
            {courses.map((c) => {
              const p = projectToPanel(c)
              return (
                <span
                  key={c.id}
                  className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green ring-2 ring-background"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                />
              )
            })}

            {/* Downtown anchor: the reference point everything else is read against. */}
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${downtown.x}%`, top: `${downtown.y}%` }}
            >
              <span className="block size-3 rounded-full border-2 border-ink bg-background" />
            </span>
            <span
              className="ag-label absolute -translate-x-1/2 whitespace-nowrap text-ink"
              style={{ left: `${downtown.x}%`, top: `calc(${downtown.y}% + 0.75rem)` }}
            >
              Downtown
            </span>

            {/* Region labels anchored to the centroid of their real courses. */}
            {consumerRegions.map((r) => {
              const p = regionCentroid(r)
              return (
                <span
                  key={r.id}
                  className="absolute max-w-28 -translate-x-1/2 -translate-y-1/2 text-center text-[0.6875rem] font-semibold leading-tight text-ink-soft"
                  style={{ left: `${p.x}%`, top: `calc(${p.y}% - 1.5rem)` }}
                >
                  {r.label}
                </span>
              )
            })}

            <p className="ag-label absolute bottom-3 left-4 text-ink-soft/70">
              Schematic · not to scale
            </p>
          </div>

          {/*
            Consumer geography. Cross-link integration: each region now leads to
            its canonical Area page (Area.slug === region.id, and every region
            publishes as an Area), which is the durable geographic destination.
            "Open full map" above remains the Explorer/map companion.
          */}
          <ul className="grid list-none grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border p-0 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
            {consumerRegions.map((r) => {
              const count = regionCourses(r).length
              return (
                <li key={r.id}>
                  <Link
                    href={`/areas/${r.id}`}
                    className="flex h-full items-baseline justify-between gap-3 bg-card px-4 py-3.5 transition-colors hover:bg-green-wash"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-ink">
                        {r.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-ink-soft">
                        {r.blurb}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-green-deep">
                      {count}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
