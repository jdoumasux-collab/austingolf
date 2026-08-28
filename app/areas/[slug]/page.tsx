/**
 * AREA detail — one reusable, data-driven template for every Area.
 *
 * There are no per-Area page implementations (§5): the model in `lib/areas.ts`
 * supplies the orientation copy and the canonical region, and this template
 * renders whatever it is handed. Adding or retiring an Area is a data change.
 *
 * Trust posture matches Collections and the rest of the app:
 *  - Membership comes from `areaCourses` → `regionCourses`, the same canonical
 *    geography the landing map and the Explorer use, so this page never disagrees
 *    with them and no course is reclassified.
 *  - Area → Course links are neutral (`/courses/{slug}`, no `from=`). Geography
 *    is "where", not an editorial intent, so it carries no per-course reasoning —
 *    the same reason path-based Collections link neutrally.
 *  - Courses are ordered closest-to-downtown first, using the existing verified
 *    coordinates, so the ordering is a real geographic fact rather than a guess.
 *  - An unknown slug is a hard not-found; a valid Area with no members explains
 *    itself rather than rendering a blank grid.
 */

import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight, Map } from "lucide-react"
import { CourseCard } from "@/components/cards/course-card"
import {
  areaCourses,
  areaExploreHref,
  areaRelatedCollections,
  areas,
  getArea,
} from "@/lib/areas"
import { DOWNTOWN, courseCountLabel, distanceMiles } from "@/lib/domain"

export function generateStaticParams() {
  return areas.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const area = getArea(slug)
  // Bare title only; the root layout template appends "| AustinGolf".
  if (!area) return { title: "Area not found" }
  return {
    title: area.region.label,
    description: area.region.blurb,
  }
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const area = getArea(slug)
  if (!area) notFound()

  // Closest-to-downtown first — a real geographic ordering from verified coords.
  const courses = [...areaCourses(area)].sort(
    (a, b) => distanceMiles(a, DOWNTOWN) - distanceMiles(b, DOWNTOWN),
  )
  const exploreHref = areaExploreHref(area)
  const relatedCollections = areaRelatedCollections(area)

  return (
    <div className="ag-shell py-10 sm:py-14">
      {/* Back to the hub, matching the Collection / Course Page back-link pattern. */}
      <Link
        href="/areas"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-green-deep"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        All areas
      </Link>

      <header className="mt-6 max-w-2xl">
        <p className="ag-label text-green-deep">Area</p>
        <h1 className="ag-display mt-2.5 text-3xl text-ink sm:text-4xl">
          {area.region.label}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink">
          {area.region.blurb}
        </p>
        {area.intro ? (
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            {area.intro}
          </p>
        ) : null}
      </header>

      {courses.length > 0 ? (
        <section aria-labelledby="area-courses" className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 id="area-courses" className="ag-display text-2xl text-ink">
              Courses here
            </h2>
            <span className="text-sm text-ink-soft">
              {courseCountLabel(courses.length)}
            </span>
          </div>

          <ul className="mt-6 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <li key={course.id}>
                <CourseCard
                  course={course}
                  href={`/courses/${course.slug}`}
                  context="geographic"
                />
              </li>
            ))}
          </ul>

          {/* Into the corresponding Explorer state (this Area's filter), where filters live. */}
          <div className="mt-8">
            <Link
              href={exploreHref}
              className="group inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-green hover:text-green-deep"
            >
              <Map aria-hidden="true" className="size-4" />
              Open this area in the Course Finder
            </Link>
          </div>
        </section>
      ) : (
        /* Valid Area, no members: explain rather than render a void. */
        <section className="mt-10 rounded-xl border border-border bg-card px-6 py-10 text-center">
          <p className="text-base leading-relaxed text-ink-soft">
            No courses in the prototype set currently sit in this area.
          </p>
          <Link
            href="/courses/explore"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-deep transition-colors hover:text-green"
          >
            Browse all courses instead
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </section>
      )}

      {/*
        Related Collections — the Area ↔ Collection cross-link (§6). Only shown
        where the model declares a genuine relationship (e.g. Resort Corridor ↔
        Resort Golf), keeping "where" and "which courses fit a context" distinct
        but connected rather than duplicated.
      */}
      {relatedCollections.length > 0 ? (
        <section aria-labelledby="area-collections" className="mt-14">
          <h2 id="area-collections" className="ag-display text-2xl text-ink">
            Related collections
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Editorial ways into the golf here — grouped by the kind of round
            rather than the map.
          </p>
          <ul className="mt-6 grid list-none grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border p-0 sm:grid-cols-2 lg:grid-cols-3">
            {relatedCollections.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/collections/${c.slug}`}
                  className="group flex h-full flex-col bg-card p-5 transition-colors hover:bg-green-wash sm:p-6"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="ag-display text-lg leading-snug text-ink">
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
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
