/**
 * Course Page module 10 — the handoff to a published Course Guide.
 *
 * Rendered only when a Guide actually exists for the course. The Course Page
 * decides that by asking the Guide registry, so the seventeen prototype courses
 * without a Guide render nothing at all rather than a disabled link, a "coming
 * soon" line, or a route that 404s.
 *
 * Restrained by design. This is one link, not a promotional card: the Course
 * Page's job is still to help a golfer choose, and a large editorial teaser here
 * would compete with the access and tee information the page exists to deliver.
 * It also states what the Guide is and is not — a reader who wants a verdict on
 * conditions should not follow this link expecting one.
 */

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CourseGuideLink({
  slug,
  courseName,
}: {
  slug: string
  courseName: string
}) {
  return (
    <Link
      href={`/courses/${slug}/guide`}
      className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-cream px-4 py-4 hover:border-green/40 sm:px-5"
    >
      <span>
        <span className="ag-label block text-green-deep">
          Researched Course Guide
        </span>
        <span className="ag-display mt-1.5 block text-lg text-ink">
          Understanding {courseName}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
          History, design lineage and what to know before you go — researched from
          documented sources, not a firsthand review.
        </span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="size-5 shrink-0 text-green-deep transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  )
}
