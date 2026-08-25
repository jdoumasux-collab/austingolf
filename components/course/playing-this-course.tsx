/**
 * Module 8 — playing this course.
 *
 * Explains access in human language driven entirely by the LOCKED access profile,
 * and offers only actions the projection actually verifies.
 *
 * Two rules do the heavy lifting here:
 *
 * 1. A private course gets no transactional path. There is no booking button, no
 *    membership enquiry, no "request access" — the page is informational.
 * 2. The absence of a booking URL is not evidence that tee times are unavailable,
 *    so no disabled or placeholder Book button is ever rendered. The dataset holds
 *    no booking URLs at all today, so the only verified action is the course's own
 *    website, where a golfer can act on real availability.
 */

import { ExternalLink } from "lucide-react"
import { VerifiedNote } from "@/components/course/course-section"
import { accessGuidance } from "@/lib/course-page"
import type { Course } from "@/lib/domain"

export function PlayingThisCourse({ course }: { course: Course }) {
  const guidance = accessGuidance(course)

  return (
    <div>
      <div className="rounded-lg border border-border bg-cream p-4">
        <p className="text-sm font-semibold text-ink">{guidance.heading}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          {/* The verified access label, then the explanation of what it means. */}
          {course.accessType ? (
            <span className="font-medium text-ink">{course.accessType}. </span>
          ) : null}
          {guidance.body}
        </p>
      </div>

      {course.sourceUrl ? (
        <a
          href={course.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-green-deep hover:underline"
        >
          Official website
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      ) : null}

      <VerifiedNote>
        AustinGolf holds no pricing, tee-time or availability data. Confirm access
        and conditions with the course.
      </VerifiedNote>
    </div>
  )
}
