/**
 * COURSES landing page (§5, Gen2 §11).
 *
 * Gen2 composition, in descending decision value: identity + utility, the six
 * pathways, geography, orientation, then editorial. Each module is visually
 * distinct so the page reads as a sequence of different kinds of help rather
 * than a uniform stack of card grids (Gen2 §11, §19).
 */

import Link from "next/link"
import { Map } from "lucide-react"
import { AtAGlance } from "@/components/landing/at-a-glance"
import { ExploreByArea } from "@/components/landing/explore-by-area"
import { FindTheRightRound } from "@/components/landing/find-the-right-round"
import { Guides } from "@/components/landing/guides"
import { Hero } from "@/components/landing/hero"
import { consumerRegions, courses } from "@/lib/domain"

export const metadata = {
  // Gen2 §10: the root layout supplies "| AustinGolf" via its title template.
  title: "Austin Golf Courses",
  description:
    "Find the right Austin golf course by area, access and the kind of round you need.",
}

export default function CoursesPage() {
  return (
    <>
      <Hero courseCount={courses.length} areaCount={consumerRegions.length} />
      <FindTheRightRound />
      <ExploreByArea />
      <AtAGlance />
      <Guides />

      {/* Final return to the utility (§5.4). */}
      <section className="ag-shell py-12 sm:py-16">
        <div className="rounded-xl border border-green/25 bg-card px-6 py-8 text-center sm:px-10 sm:py-10">
          <h2 className="ag-display text-2xl text-ink sm:text-3xl">
            Ready to pick a course?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink-soft">
            Browse the full prototype set, or start from the map if geography is
            the deciding factor.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/courses/explore"
              className="rounded-lg bg-green px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-green-deep"
            >
              Explore all courses
            </Link>
            <Link
              href="/courses/explore?view=map"
              className="flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-5 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-green hover:text-green-deep"
            >
              <Map aria-hidden="true" className="size-4" />
              Explore map
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
