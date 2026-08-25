/**
 * Non-prose Guide blocks.
 *
 * Each one exists because some piece of evidence is load-bearing enough that
 * burying it in a paragraph would lose it, or because a fact belongs to the
 * master record rather than to the Guide.
 */

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { Course } from "@/lib/domain"
import type { CourseFactField, PrepItem } from "@/lib/guide"
import { resolveFact } from "@/lib/guide"

/**
 * A documented fact lifted out of the prose.
 *
 * Attribution is a required prop, not an option, because the whole purpose of
 * pulling a claim into a bordered box is to make its basis visible. A callout
 * without a source would read as AustinGolf's own assertion in the most
 * emphasised position on the page — the opposite of what it is for.
 *
 * Rendered as an `aside` so assistive technology can treat it as complementary
 * to the surrounding narrative rather than as an interruption in it.
 */
export function EvidenceCallout({
  label,
  value,
  attribution,
}: {
  label: string
  value: string
  attribution: string
}) {
  return (
    <aside className="my-1 rounded-lg border border-border border-l-2 border-l-sand bg-cream px-4 py-3.5 sm:px-5">
      <p className="ag-label text-ink-soft">{label}</p>
      <p className="mt-1.5 font-sans text-[0.9375rem] leading-relaxed text-ink text-pretty">
        {value}
      </p>
      <p className="mt-2 font-sans text-xs leading-snug text-ink-muted">
        {attribution}
      </p>
    </aside>
  )
}

export function GuidePullquote({
  text,
  attribution,
}: {
  text: string
  attribution: string
}) {
  return (
    <blockquote className="my-1 border-l-2 border-sand pl-5">
      <p className="font-serif text-lg leading-[1.55] text-ink text-pretty sm:text-xl">
        {text}
      </p>
      <footer className="mt-2 font-sans text-xs leading-snug text-ink-muted">
        {attribution}
      </footer>
    </blockquote>
  )
}

/**
 * Structured facts read from the canonical course record.
 *
 * The Guide names which fields it wants and the values come from the live
 * projection, so a master-data correction reaches every Guide and no Guide can
 * assert a par or yardage the database has since changed. Rows with no value are
 * dropped rather than rendered as an em dash: a Guide showing "Par —" would be
 * presenting a gap in the record as a fact about the course.
 */
export function GuideFacts({
  course,
  fields,
  note,
}: {
  course: Course
  fields: CourseFactField[]
  note?: string
}) {
  const rows = fields
    .map((f) => resolveFact(course, f))
    .filter((r): r is { label: string; value: string } => r !== null)

  if (!rows.length) return null

  return (
    <div className="my-1 rounded-lg border border-border bg-card px-4 py-3.5 sm:px-5">
      <dl className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-baseline justify-between gap-4 font-sans"
          >
            <dt className="text-xs text-ink-muted">{r.label}</dt>
            <dd className="text-sm font-semibold text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
      {note ? (
        <p className="mt-3 font-sans text-xs leading-snug text-ink-muted">{note}</p>
      ) : null}
    </div>
  )
}

/**
 * Practical preparation.
 *
 * Every item that touches something volatile — fees, tee-time availability,
 * maintenance closures — links out rather than copying the value into prose that
 * will outlive it. That is the Evidence Package's volatility rule expressed as a
 * component: the durable explanation lives here, the perishable number stays at
 * its source.
 */
export function BeforeYouGo({ items }: { items: PrepItem[] }) {
  if (!items.length) return null

  return (
    <ul className="flex list-none flex-col gap-4 p-0">
      {items.map((item) => {
        const external = item.href?.startsWith("http")
        return (
          <li key={item.label}>
            <p className="ag-label text-green-deep">{item.label}</p>
            <p className="mt-1.5 font-serif text-[1.0625rem] leading-[1.6] text-ink text-pretty">
              {item.body}
            </p>
            {item.href ? (
              <p className="mt-1.5">
                {external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 font-sans text-sm font-semibold text-green-deep hover:underline"
                  >
                    {item.hrefLabel ?? "Open"}
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-green-deep hover:underline"
                  >
                    {item.hrefLabel ?? "Open"}
                  </Link>
                )}
              </p>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
