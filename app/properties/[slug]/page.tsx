/**
 * Property state — any site holding more than one projected course (§10).
 *
 * A Property is a first-class entity, not a fake Course. The page explains that
 * the site contains multiple courses, lists the child courses with their own
 * approved differentiation, and geographically separates a course that sits away
 * from the main campus because the dataset says so (Palmer Lakeside on Lake
 * Travis).
 *
 * This page was written when Barton Creek was the only projected property, and
 * it hardcoded resort language throughout — "Resort property", "lodging on
 * site", "guest-based access", "the main resort campus". Batch 1 added the
 * municipal Clay/Kizer complex, which made all of those false: a city course
 * has no hotel and no guest-access gate. Resort claims are now derived from the
 * master's own property_type instead of assumed from the entity kind.
 */

import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { BrandedImage } from "@/components/brand/branded-image"
import { CourseCard } from "@/components/cards/course-card"
// Arrival intent is resolved by the same helpers the Course Page uses, so the two
// pages cannot drift on what "the golfer arrived with a decision" means.
import {
  type Course,
  distanceMiles,
  getProperty,
  isResortProperty,
  properties,
  propertyKindLabel,
  reasonForIntent,
} from "@/lib/domain"
import { arrivalIntent } from "@/lib/finder"

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const property = getProperty(slug)
  // Gen2 §10: the root layout template appends the brand.
  if (!property) return { title: "Property not found" }
  return {
    title: property.name,
    description: `${property.courses.length} golf courses at ${property.name} in ${property.area}.`,
  }
}

/** Distance from the main campus point, used to separate an off-campus course. */
const OFF_CAMPUS_MILES = 3

export default async function PropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { slug } = await params
  const { from } = await searchParams
  const property = getProperty(slug)
  if (!property) notFound()

  const onCampus: Course[] = []
  const offCampus: Course[] = []
  for (const c of property.courses) {
    const miles = distanceMiles(property, c)
    ;(miles > OFF_CAMPUS_MILES ? offCampus : onCampus).push(c)
  }

  /**
   * Arrival context correction.
   *
   * This page previously hardcoded a "Great for Groups" back link and matched
   * child-course reasons against that same fixed intent, so every visitor was
   * told they had arrived from a groups search whether or not they had. Arrival
   * intent is now read from the actual referring Finder state, exactly as the
   * Course Page does.
   */
  // Resort-only claims (lodging, guest access, "resort campus") are gated on the
  // master's property_type rather than on being a Property at all.
  const isResort = isResortProperty(property)

  const intent = arrivalIntent(from)
  const backHref =
    from && from.startsWith("/courses/explore") ? from : "/courses/explore"
  const backLabel = from ? "Back to results" : "Explore all courses"

  /**
   * A child course's reason, shown only when it answers the arrival intent.
   *
   * Returns null on a neutral arrival. The previous fallback to each course's
   * strongest reason presented unrelated editorial language as though it were
   * the answer to a question the golfer never asked — the same defect the Course
   * Page fixed. The Course Card degrades to its own neutral orientation here.
   */
  const contextualReason = (c: Course) =>
    intent ? reasonForIntent(c, intent) : null

  return (
    <article>
      <div className="ag-shell pt-5">
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-green-deep hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {backLabel}
        </Link>
      </div>

      <header className="ag-shell pt-5">
        <p className="ag-label text-green-deep">{propertyKindLabel(property)}</p>
        <h1 className="ag-display mt-1.5 text-3xl leading-tight text-ink sm:text-4xl">
          {property.name}
        </h1>
        <p className="mt-2.5 text-base text-ink-soft">
          {property.area}
          {property.accessType ? (
            <>
              <span aria-hidden="true"> · </span>
              {property.accessType}
            </>
          ) : null}
          <span aria-hidden="true"> · </span>
          {property.courses.length} golf courses
        </p>
      </header>

      <div className="ag-shell mt-6">
        <div className="overflow-hidden rounded-xl border border-border">
          <BrandedImage
            seedKey={property.id}
            alt={`AustinGolf placeholder graphic for ${property.name}`}
            className="aspect-[16/9] w-full sm:aspect-[24/7]"
          />
        </div>
      </div>

      <div className="ag-shell py-8">
        <div className="max-w-2xl">
          {/*
            Same arrival-context rule as the Course Page: name the decision only
            when the golfer actually arrived with one. "Why it works for a group"
            was hardcoded, so a direct visitor was answered on groups regardless.
          */}
          <h2 className="ag-label text-ink-soft">
            {intent ? `Why it fits ${intent}` : "Orientation"}
          </h2>
          {/*
            The shared, always-true half of this paragraph is the multi-course
            structure. Lodging and guest-based access are resort-only facts, so
            they are stated only for a resort — asserting them for a municipal
            complex would invent an on-site hotel and gate open public golf.
          */}
          <p className="mt-2.5 text-lg leading-relaxed text-ink">
            One {isResort ? "resort" : "site"}, {property.courses.length}{" "}
            distinct golf courses
            {onCampus.length !== property.courses.length ? (
              <> — {onCampus.length} on the main campus</>
            ) : null}
            {isResort ? ", with lodging on site" : ""}. That structure is what
            puts more than one course within reach of a single base.
            {isResort
              ? " Access is guest-based, so confirm course access directly with the resort."
              : " Confirm tee-time availability directly with the course."}
          </p>
          {property.sourceUrl ? (
            <a
              href={property.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-deep hover:underline"
            >
              {isResort ? "Resort website" : "Official website"}
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
          ) : null}
        </div>

        <section aria-labelledby="campus-heading" className="mt-9">
          <h2 id="campus-heading" className="ag-display text-xl text-ink sm:text-2xl">
            {isResort ? "On the main resort campus" : "On the main campus"}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            {onCampus.length} course{onCampus.length === 1 ? "" : "s"} at{" "}
            {property.area}.
          </p>
          <ul className="mt-5 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {onCampus.map((c) => (
              <li key={c.id}>
                <CourseCard
                  course={c}
                  reason={contextualReason(c)}
                  href={`/courses/${c.slug}?from=${encodeURIComponent(`/properties/${property.slug}`)}`}
                />
              </li>
            ))}
          </ul>
        </section>

        {/* Palmer Lakeside is a genuinely separate location, so it is stated as one. */}
        {offCampus.length ? (
          <section aria-labelledby="offcampus-heading" className="mt-10">
            <h2
              id="offcampus-heading"
              className="ag-display text-xl text-ink sm:text-2xl"
            >
              Away from the main campus
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Part of the same {isResort ? "resort" : "property"}, but a separate
              drive. Plan travel time if you are combining it with a round on the
              main campus.
            </p>
            <ul className="mt-5 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {offCampus.map((c) => (
                <li key={c.id}>
                  <CourseCard
                    course={c}
                    reason={contextualReason(c)}
                    href={`/courses/${c.slug}?from=${encodeURIComponent(`/properties/${property.slug}`)}`}
                    distanceLabel={`${distanceMiles(property, c).toFixed(0)} mi from campus`}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  )
}
