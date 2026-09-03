/**
 * Course Page — Course Page Product Contract v1.0.
 *
 * ONE shared modular page for every access profile. There are no per-course and
 * no per-profile templates: each module decides for itself whether the projection
 * can answer its question, and returns nothing when it cannot. That is what lets
 * a municipal pitch & putt, a resort course and a private club run through the
 * same composition without special-casing any of them.
 *
 * Module order follows the golfer's questions:
 *   1  identity + immediate access      what is this, and can I play it
 *   2  orientation / why it fits        why am I looking at this
 *   3  decision support                 what makes it worth the round
 *   4  at a glance                      the verified basics
 *   5  what the golf is like            character, from verified sources
 *   6  tees & playing options           gated scorecard data
 *   7  practice & facilities            verified features only
 *   8  playing this course              access explained, real actions only
 *   9  property context                 relationship without co-location
 *  10  AustinGolf Guide                 handoff, only where a Guide exists
 *  11  continue exploring               back into the Finder
 *
 * Module 10 is conditional rather than absent as of the Course Guide run: it
 * renders only when the Guide registry holds a published Guide for this course,
 * so courses without one show nothing instead of a dead link. The firsthand
 * AustinGolf Review is still unrepresented — no Review exists, and implying one
 * would claim editorial that has not been done.
 */

import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { BrandedImage } from "@/components/brand/branded-image"
import { AccessBadge } from "@/components/course/access-badge"
import { ContinueExploring } from "@/components/course/continue-exploring"
import { CourseCharacter } from "@/components/course/course-character"
import { CourseFacilities } from "@/components/course/course-facilities"
import { CourseGlance } from "@/components/course/course-glance"
import { CourseGuideLink } from "@/components/course/course-guide-link"
import { CourseSection } from "@/components/course/course-section"
import { CourseTees } from "@/components/course/course-tees"
import { PlayingThisCourse } from "@/components/course/playing-this-course"
import { PropertyContext } from "@/components/course/property-context"
import { DecisionSupport } from "@/components/course/decision-support"
import { hasGuide } from "@/content/guides"
import {
  characterStatements,
  continuations,
  displayReasons,
  facilityFeatures,
  propertyRelation,
  teeView,
} from "@/lib/course-page"
import {
  courses,
  exceptionalFormatLabel,
  getCourse,
  getParentProperty,
  neutralOrientation,
  reasonForIntent,
  sharedPointNote,
} from "@/lib/domain"
import { arrivalIntent } from "@/lib/finder"

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const course = getCourse(slug)
  // Gen2 §10: bare titles only. The root layout's `%s | AustinGolf` template
  // supplies the brand, so appending it here produced "… | AustinGolf | AustinGolf".
  if (!course) return { title: "Course not found" }
  // `neutralOrientation` is intentionally null when the dataset holds no
  // differentiating fact, so it is appended only when present — interpolating it
  // unconditionally would put the string "null" in the meta description.
  const orientation = neutralOrientation(course)
  return {
    title: course.name,
    description: [`${course.name} in ${course.area}.`, orientation]
      .filter(Boolean)
      .join(" "),
  }
}

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { slug } = await params
  const { from } = await searchParams
  const course = getCourse(slug)
  if (!course) notFound()

  const property = getParentProperty(course)
  const relation = propertyRelation(course, property)
  const format = exceptionalFormatLabel(course)
  const pointNote = sharedPointNote(course)

  /**
   * Gen2 §3 — contextual reasoning is bound to how the golfer got here.
   *
   * A direct or known-item arrival has no decision to explain, so it gets
   * neutral AustinGolf orientation. Only an arrival from a discovery intent may
   * show that intent's rationale. This is why the page never reaches for the
   * strongest reason in the dataset: doing so let Falconhead answer a Great for
   * Groups question nobody had asked.
   *
   * Facts are identical in both cases; only the framing changes.
   */
  const intent = arrivalIntent(from)
  const arrivalReason = intent ? reasonForIntent(course, intent) : null

  const reasons = displayReasons(course, intent)
  const tees = teeView(course)
  const hasCharacter = characterStatements(course).length > 0
  const hasFacilities = facilityFeatures(course).length > 0
  const nextSteps = continuations(course, intent, relation)
  const guidePublished = hasGuide(course.slug)

  // Back returns to the originating Finder state when we arrived from discovery.
  const backHref =
    from && from.startsWith("/courses/explore") ? from : "/courses/explore"
  const backLabel = from ? "Back to results" : "Explore all courses"

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

      {/* ---------------------------------- module 1: identity + access */}
      <header className="ag-shell pt-3">
        {property ? (
          <p className="ag-label text-green-deep">
            <Link href={`/properties/${property.slug}`} className="hover:underline">
              {property.name}
            </Link>
          </p>
        ) : null}

        <h1 className="ag-display mt-1.5 text-3xl leading-tight text-ink sm:text-4xl">
          {course.name}
        </h1>

        {/*
          Access sits beside the name, not further down the page. Decision
          significance decides prominence: an exceptional format (Butler's 9-hole
          pitch & putt) changes what the round *is*, so it is emphasised, while
          "18 · Regulation" — true of 17 of 18 courses — stays in module 4.
        */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-2">
          {course.accessType ? (
            <AccessBadge profile={course.accessProfile} label={course.accessType} />
          ) : null}
          {format ? (
            <span className="rounded-full border border-green/30 bg-green-wash px-2.5 py-1 text-xs font-semibold text-green-deep">
              {format}
            </span>
          ) : null}
          <span className="text-sm text-ink-soft">{course.area}</span>
        </div>
      </header>

      {/*
        Gen2 §20 — the branded fallback keeps its place in the layout without
        dominating it. It reserves the future photography slot as a slim band
        rather than a large abstract block, and will earn the full immersive
        hero treatment once approved course photography exists.
      */}
      <div className="ag-shell mt-6">
        <div className="overflow-hidden rounded-xl border border-border">
          <BrandedImage
            seedKey={course.id}
            variant="hero"
            alt={`AustinGolf placeholder graphic for ${course.name}`}
            className="aspect-[16/6] w-full sm:aspect-[40/7]"
          />
        </div>
      </div>

      <div className="ag-shell grid grid-cols-1 gap-x-10 gap-y-10 py-9 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* ------------------------- module 2: contextual orientation */}
          <section aria-labelledby="orientation-heading">
            {/*
              The heading names the decision being answered when there is one, so
              the rationale can never read as a free-floating universal verdict.
            */}
            <h2 id="orientation-heading" className="ag-label text-ink-soft">
              {arrivalReason
                ? `Why it fits ${arrivalReason.classification}`
                : "Orientation"}
            </h2>
            {/*
              `neutralOrientation` returns null when no fact *differentiates* this
              course from the others, which is the right answer on a grid of cards
              but would leave this section empty. A single page has no cross-card
              repetition problem, so it falls back to the plain operating-context
              line.
            */}
            <p className="mt-2.5 text-lg leading-relaxed text-ink">
              {arrivalReason
                ? arrivalReason.whyItFits
                : (neutralOrientation(course) ??
                  `${course.operatingContext} golf in ${course.area}.`)}
            </p>

            {/*
              Format expectation (Master v1.15). Courses whose layout defies the
              default "regulation 18" model carry a sourced sentence saying what
              kind of round it actually is — a par-3 pitch & putt, a par-30 nine,
              a short-game course, a full-length nine misread as executive. It is
              arrival-independent (the format is true however you got here) and
              states format + purpose only, never a quality/difficulty/value
              verdict, so it sits apart from the orientation line rather than
              replacing it.
            */}
            {course.formatExpectation ? (
              <p className="mt-4 rounded-lg border border-green/25 bg-green-wash px-4 py-3 text-base leading-relaxed text-ink">
                <span className="ag-label mb-1 block text-green-deep">
                  What to expect
                </span>
                {course.formatExpectation}
              </p>
            ) : null}

            {/* Derived map-precision caveat, never the internal geo_note text. */}
            {pointNote ? (
              <p className="mt-4 rounded-lg border border-border bg-cream px-4 py-3 text-sm leading-relaxed text-ink-soft">
                {pointNote}
              </p>
            ) : null}
          </section>

          {/* ----------------------------- module 3: decision support */}
          {reasons.length ? (
            <CourseSection
              id="fit"
              title="Why golfers choose it"
              className="mt-9"
              intro="Verified reasons this course suits a particular round, not a score or ranking."
            >
              <DecisionSupport reasons={reasons} intent={intent} />
            </CourseSection>
          ) : null}

          {/* ------------------------- module 5: what the golf is like */}
          {hasCharacter ? (
            <CourseSection id="character" title="What the golf is like">
              <CourseCharacter course={course} />
            </CourseSection>
          ) : null}

          {/* ----------------------- module 6: tees & playing options */}
          {tees.kind !== "absent" ? (
            <CourseSection
              id="tees"
              title="Tees and playing options"
              intro={
                tees.kind === "table"
                  ? "Verified tee sets. Where a course publishes separate ratings for different audiences, each is listed on its own row."
                  : undefined
              }
            >
              <CourseTees view={tees} />
            </CourseSection>
          ) : null}

          {/* --------------------- module 7: practice & facilities */}
          {hasFacilities ? (
            <CourseSection id="facilities" title="Practice and facilities">
              <CourseFacilities course={course} />
            </CourseSection>
          ) : null}

          {/*
            ------------------------------- module 10: AustinGolf Guide

            Present only where a Guide has actually been published. `hasGuide`
            reads the Guide registry, so a course with no Guide renders nothing
            here — no disabled state and no dead link. A firsthand AustinGolf
            Review remains a separate product on its own future route and is
            deliberately not represented.
          */}
          {guidePublished ? (
            <CourseSection id="guide" title="Go deeper">
              <CourseGuideLink
                slug={course.slug}
                courseName={course.shortName ?? course.name}
              />
            </CourseSection>
          ) : null}

        </div>

        {/*
          Access, facts and property context travel together in the sidebar
          because they are the "can I play it, and what is it" cluster. On mobile
          this stacks after the reasoning, which is the order a golfer reads in.
        */}
        <aside className="flex flex-col gap-8 lg:sticky lg:top-6 lg:self-start">
          {/* --------------------- module 8: playing this course */}
          <CourseSection id="access" title="Playing this course">
            <PlayingThisCourse course={course} />
          </CourseSection>

          {/* ------------------------- module 4: course at a glance */}
          <CourseSection id="glance" title="Course at a glance">
            <CourseGlance course={course} />
          </CourseSection>

          {/* --------------------------- module 9: property context */}
          {relation ? (
            <CourseSection id="property" title="Part of a larger property">
              <PropertyContext relation={relation} course={course} />
            </CourseSection>
          ) : null}
        </aside>

        {/*
          ------------------------------ module 11: continue exploring

          Placed after the sidebar in the DOM, not inside the main column, so the
          single-column reading order is reasons → tees → access → next steps.
          When this sat in the main column it rendered *before* "Playing this
          course" on any viewport under 1024px, inviting the golfer to leave for
          another course before being told whether this one can be played at all.
        */}
        <CourseSection
          id="next"
          title="Continue exploring"
          className="lg:col-span-2"
        >
          <ContinueExploring items={nextSteps} />
        </CourseSection>
      </div>
    </article>
  )
}
