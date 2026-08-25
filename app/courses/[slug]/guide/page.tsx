/**
 * Course Guide — /courses/[slug]/guide
 *
 * The "Understand & Prepare" product. Nested under the course rather than living
 * at /guides/[slug] because the Guide is about a course and is subordinate to
 * it: the URL states the hierarchy, and it leaves /courses/[slug]/review
 * available for the firsthand Review product without any restructuring. The
 * Review is not built here.
 *
 * Only courses with a published Guide generate a route. Everything else 404s
 * rather than rendering an empty editorial shell, which is the same discipline
 * the Course Page applies to its own modules.
 *
 * Layout is a single narrow column. There is no sidebar, no card grid and no
 * placeholder hero — the page is for reading, and the one visual element the
 * Course Page uses to hold a photography slot (`BrandedImage`) is deliberately
 * absent, because a generated graphic above civil-rights prose would read as a
 * documentary photograph.
 */

import { notFound } from "next/navigation"
import { ContinueExploring } from "@/components/course/continue-exploring"
import { GuideMasthead } from "@/components/guide/guide-masthead"
import { GuideSection } from "@/components/guide/guide-section"
import { GuideMeasure } from "@/components/guide/guide-shell"
import { GuideSources } from "@/components/guide/guide-sources"
import { getGuide, guideSlugs } from "@/content/guides"
import { guideContinuations } from "@/lib/continuations"
import { getCourse } from "@/lib/domain"

export function generateStaticParams() {
  return guideSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const course = getCourse(slug)
  const guide = getGuide(slug)
  if (!course || !guide) return { title: "Guide not found" }
  // Bare title: the root layout's `%s | AustinGolf` template supplies the brand.
  return {
    title: `${course.name} Course Guide`,
    description: guide.dek,
  }
}

export default async function CourseGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const course = getCourse(slug)
  const guide = getGuide(slug)
  if (!course || !guide) notFound()

  const nextSteps = guideContinuations(course)

  return (
    <article className="pb-16">
      <GuideMeasure className="pt-5">
        <GuideMasthead course={course} guide={guide} />
      </GuideMeasure>

      {/*
        `gap-12` between sections rather than margins on the sections themselves,
        so a Guide with two sections and a Guide with nine both get identical
        rhythm and no content file can introduce spacing.
      */}
      <GuideMeasure className="mt-12 flex flex-col gap-12">
        {guide.sections.map((section) => (
          <GuideSection
            key={section.id}
            section={section}
            course={course}
            sources={guide.sources}
          />
        ))}

        <hr className="ag-rule" />

        <GuideSources sources={guide.sources} guideNote={guide.guideNote} />

        <nav aria-labelledby="guide-next-heading">
          <h2
            id="guide-next-heading"
            className="ag-display text-2xl leading-snug text-ink sm:text-[1.75rem]"
          >
            Continue exploring
          </h2>
          <div className="mt-5">
            {/*
              Reuses the Course Page's continuation component so the two products
              handle "where next" identically. The links themselves come from
              `guideContinuations`, which validates each Finder state against the
              real Finder before rendering it.
            */}
            <ContinueExploring items={nextSteps} />
          </div>
        </nav>
      </GuideMeasure>
    </article>
  )
}
