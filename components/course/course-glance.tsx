/**
 * Module 4 — course at a glance.
 *
 * A curated 4–6 fact summary. Facts are supplied by `glanceFacts`, which only
 * emits values the projection verifies, so this renders whatever it receives
 * without reserving empty cells for missing data.
 *
 * Rating and slope are deliberately absent: they are governed by the tee
 * publication gate and belong to module 6, where the gate is enforced.
 */

import { ExternalLink } from "lucide-react"
import { VerifiedNote } from "@/components/course/course-section"
import { glanceFacts, walkingFact } from "@/lib/course-page"
import type { Course } from "@/lib/domain"

export function CourseGlance({ course }: { course: Course }) {
  // Walking is appended last and always present: for a walker, an omitted
  // walking row reads as "not allowed", so unknown is stated as unconfirmed.
  const facts = [...glanceFacts(course), walkingFact(course)]

  return (
    <div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-0 sm:grid-cols-3">
        {facts.map((f) => (
          <div key={f.label} className="border-b border-border py-3">
            <dt className="text-xs text-ink-muted">{f.label}</dt>
            <dd
              className={
                f.value === "Not confirmed"
                  ? "mt-0.5 text-sm text-ink-muted"
                  : "mt-0.5 text-sm font-medium text-ink"
              }
            >
              {f.value}
            </dd>
          </div>
        ))}
      </dl>

      {course.sourceUrl ? (
        <a
          href={course.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-deep hover:underline"
        >
          Course website
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      ) : null}

      <VerifiedNote>
        Facts shown are limited to the verified AustinGolf dataset.
      </VerifiedNote>
    </div>
  )
}
