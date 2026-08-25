/**
 * COURSES hero + Find Your Austin Course utility (§5.1, §5.2, Gen2 §12–§14).
 *
 * Gen2 raises the emotional hierarchy the mockup asks for — PLACE / GOLF /
 * AUSTIN first, then UTILITY / SEARCH / DISCOVERY — without letting the opening
 * screen become a search application. The identity band is a deep ink field
 * with a branded contour treatment; the utility rail sits directly beneath it
 * and is visible without scrolling.
 *
 * No named-course imagery and no stock photography (§12): the atmosphere is
 * explicitly AustinGolf's own visual language, not a claim about a course.
 */

import Link from "next/link"
import { ArrowRight, Map } from "lucide-react"
import { ContourField } from "@/components/brand/contour-field"
import { CourseSearch } from "@/components/search/course-search"
import { QuickPaths } from "@/components/landing/quick-paths"

export function Hero({
  courseCount,
  areaCount,
}: {
  courseCount: number
  areaCount: number
}) {
  return (
    <section className="border-b border-border">
      {/* Identity band. Deep ink separates the masthead from every other section. */}
      <div className="relative isolate overflow-hidden bg-ink">
        <ContourField className="absolute inset-0 h-full w-full opacity-70" />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 12% 108%, color-mix(in oklab, var(--green) 34%, transparent) 0%, transparent 62%)",
          }}
        />

        <div className="ag-shell relative py-14 sm:py-20 lg:py-24">
          <p className="ag-label text-sand">Austin &amp; Central Texas</p>

          <h1 className="ag-display mt-4 max-w-3xl text-4xl leading-[1.05] text-background sm:text-5xl lg:text-6xl">
            Where to play golf in Austin
          </h1>

          {/*
            "Regions" — not "areas". The Finder's Area filter exposes the
            dataset's eleven detailed area labels, so calling these six
            groupings "areas" made the two counts look contradictory. Naming
            them regions matches the geography module and keeps both true.
          */}
          <p className="mt-5 max-w-xl text-base leading-relaxed text-background/70 sm:text-lg">
            Limestone, live oak and a river running through it. We cover{" "}
            {courseCount} courses across {areaCount} regions of the metro — and
            we tell you which one suits the round you actually have in mind.
          </p>

          <p className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-background/60">
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="h-px w-8 bg-sand/50" />
              Independent. No paid placement.
            </span>
            <span>No pricing or tee-time data.</span>
          </p>
        </div>
      </div>

      {/*
        Utility rail. Search stays a primary utility (§13) and arrives
        immediately, but it no longer has to carry the whole opening screen.
      */}
      <div className="border-b border-border bg-cream">
        <div className="ag-shell py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="md:flex-1">
              <CourseSearch />
            </div>
            <div className="flex shrink-0 gap-3">
              <Link
                href="/courses/explore"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green px-5 py-3.5 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-green-deep md:flex-none"
              >
                Explore all courses
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/courses/explore?view=map"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-input bg-background px-5 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-green hover:text-green-deep md:flex-none"
              >
                <Map aria-hidden="true" className="size-4" />
                View map
              </Link>
            </div>
          </div>

          {/* Quick Paths stay lightweight shortcuts, not content modules (§14). */}
          <QuickPaths />
        </div>
      </div>
    </section>
  )
}
