/**
 * Module 5 — what the golf is like.
 *
 * Presented as restrained labelled factual statements, not generated prose. Each
 * row is a projected characteristic plus its own evidence-backed reason, rendered
 * verbatim.
 *
 * This is a deliberate choice of truth over literary polish. Turning these rows
 * into flowing "the golf here is…" narration would read as firsthand observation
 * and would attach conclusions the dataset does not contain — and difficulty in
 * particular is never asserted, because no verified difficulty rating exists.
 */

import { VerifiedNote } from "@/components/course/course-section"
import { characterStatements } from "@/lib/course-page"
import type { Course } from "@/lib/domain"

export function CourseCharacter({ course }: { course: Course }) {
  const statements = characterStatements(course)
  // No verified characteristics means no module. Never a placeholder.
  if (!statements.length) return null

  return (
    <div>
      <ul className="flex list-none flex-col gap-0 divide-y divide-border p-0">
        {statements.map((s) => (
          <li key={s.characteristic} className="py-3 first:pt-0">
            <p className="text-sm font-semibold text-ink">{s.characteristic}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.reason}</p>
          </li>
        ))}
      </ul>
      <VerifiedNote>
        Characteristics are drawn from verified course sources, not from a
        firsthand AustinGolf review.
      </VerifiedNote>
    </div>
  )
}
