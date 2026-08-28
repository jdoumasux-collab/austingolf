/**
 * COLLECTION detail — one reusable, data-driven template for every Collection.
 *
 * There are deliberately no per-Collection page implementations: the model in
 * `lib/collections.ts` supplies the editorial copy and the membership predicate,
 * and this template renders whatever it is handed. Adding or retiring a
 * Collection is a data change, never a new file.
 *
 * Trust posture matches the rest of the app:
 *  - Membership comes from `collectionCourses`, the same predicate the Finder
 *    uses, so this page and its canonical Explorer link never disagree (§5).
 *  - Editorial (intent) Collections pass each card that intent's own approved
 *    reason and carry `from` into the Course Page; geographic Collections orient
 *    neutrally and carry no intent, because they earned no per-course language.
 *  - An unknown slug is a hard not-found, and an empty (but valid) Collection
 *    explains itself rather than rendering a blank grid.
 */

import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { CourseCard } from "@/components/cards/course-card"
import {
  collectionCardContext,
  collectionCourseHref,
  collectionCourses,
  collectionExploreHref,
  collectionReason,
  collections,
  getCollection,
} from "@/lib/collections"
import { courseCountLabel } from "@/lib/domain"
import { collectionRelatedAreas, areaCourses } from "@/lib/areas"

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collection = getCollection(slug)
  // Bare title only; the root layout template appends "| AustinGolf".
  if (!collection) return { title: "Collection not found" }
  return {
    title: collection.title,
    description: collection.dek,
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collection = getCollection(slug)
  if (!collection) notFound()

  const courses = collectionCourses(collection)
  const context = collectionCardContext(collection)
  const exploreHref = collectionExploreHref(collection)
  // Cross-link integration: the reciprocal of the Area page's "Related
  // collections". Only Areas that already assert a relationship to this
  // Collection appear, so the pairing is symmetric and invents nothing.
  const relatedAreas = collectionRelatedAreas(collection.slug)

  return (
    <div className="ag-shell py-10 sm:py-14">
      {/* Back to the hub, matching the Course Page back-link pattern. */}
      <Link
        href="/collections"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-green-deep"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        All collections
      </Link>

      <header className="mt-6 max-w-2xl">
        <p className="ag-label text-green-deep">Collection</p>
        <h1 className="ag-display mt-2.5 text-3xl text-ink sm:text-4xl">
          {collection.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink">{collection.dek}</p>
        {collection.intro ? (
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            {collection.intro}
          </p>
        ) : null}

        {/* Why/when to use this Collection — the editorial judgment itself. */}
        <div className="mt-6 rounded-xl border border-green/25 bg-green-wash px-5 py-4">
          <p className="ag-label text-green-deep">When to use this</p>
          <p className="mt-2 text-base leading-relaxed text-ink">
            {collection.rationale}
          </p>
        </div>
      </header>

      {courses.length > 0 ? (
        <section aria-labelledby="collection-courses" className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2
              id="collection-courses"
              className="ag-display text-2xl text-ink"
            >
              In this collection
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
                  href={collectionCourseHref(collection, course)}
                  reason={collectionReason(collection, course)}
                  context={context}
                />
              </li>
            ))}
          </ul>

          {/* Optional link into the corresponding Explorer state, where filters live. */}
          <div className="mt-8">
            <Link
              href={exploreHref}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-green-deep transition-colors hover:text-green"
            >
              Open this in the Course Finder to filter further
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </section>
      ) : (
        /* Valid Collection, no members yet: explain rather than render a void. */
        <section className="mt-10 rounded-xl border border-border bg-card px-6 py-10 text-center">
          <p className="text-base leading-relaxed text-ink-soft">
            No courses in the prototype set currently qualify for this
            collection.
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
        Related areas — the reciprocal of the Area page's "Related collections".
        Rendered only when a genuine, already-asserted pairing exists, so most
        Collections show nothing here rather than a manufactured relationship.
      */}
      {relatedAreas.length > 0 ? (
        <section aria-labelledby="collection-areas" className="mt-12 border-t border-border pt-8">
          <h2 id="collection-areas" className="ag-display text-2xl text-ink">
            Related areas
          </h2>
          <ul className="mt-6 grid list-none grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border p-0 sm:grid-cols-2 lg:grid-cols-3">
            {relatedAreas.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/areas/${a.slug}`}
                  className="group flex h-full flex-col bg-card p-5 transition-colors hover:bg-green-wash"
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
                    {courseCountLabel(areaCourses(a).length)}
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
