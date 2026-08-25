/**
 * Module 7 — practice & golf facilities.
 *
 * Renders only the verified features already present in the approved projection.
 *
 * Scope note: Run 1 intentionally did not migrate `Course_Features_v1`, because
 * the Finder filters on curated feature names and importing the master set would
 * change filter behaviour. This module therefore reads the existing curated
 * features only, and coverage is thin — five of eighteen courses. Where a course
 * has none, the module is omitted rather than implying the facilities are absent.
 */

import { VerifiedNote } from "@/components/course/course-section"
import { facilityFeatures } from "@/lib/course-page"
import type { Course } from "@/lib/domain"

export function CourseFacilities({ course }: { course: Course }) {
  const features = facilityFeatures(course)
  if (!features.length) return null

  return (
    <div>
      <ul className="flex list-none flex-wrap gap-2 p-0">
        {features.map((f) => (
          <li
            key={f.feature}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-ink"
          >
            {f.feature}
            {/* Only qualify the value when it says more than "available". */}
            {f.value !== "available" ? (
              <span className="ml-1.5 text-ink-muted">{f.value}</span>
            ) : null}
          </li>
        ))}
      </ul>
      <VerifiedNote>
        Only individually verified facilities are listed. Absence here does not
        mean a facility is unavailable.
      </VerifiedNote>
    </div>
  )
}
