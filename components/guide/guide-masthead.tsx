/**
 * Guide masthead — identity, provenance and the route back to the Course Page.
 *
 * This is the page's trust surface. Before any prose, a reader learns three
 * things: that this is researched editorial rather than firsthand evaluation,
 * when the research was last done, and where the maintained structured facts
 * live. Putting the Review status here rather than in a footnote is the point —
 * the honest disclosure has to arrive before the reading, not after it.
 *
 * What it does not do is expose Evidence Ledger mechanics. No confidence codes,
 * no claim types, no internal status strings.
 */

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Course } from "@/lib/domain"
import type { Guide } from "@/lib/guide"

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
})

function formatMonth(iso: string) {
  // Parsed as UTC noon so a date-only string cannot slip a month backwards in
  // a negative-offset timezone — "2026-08-01" must not render as July.
  const d = new Date(`${iso}T12:00:00Z`)
  return DATE_FORMAT.format(d)
}

export function GuideMasthead({
  course,
  guide,
}: {
  course: Course
  guide: Guide
}) {
  return (
    <header>
      <Link
        href={`/courses/${course.slug}`}
        className="inline-flex min-h-11 items-center gap-1.5 font-sans text-sm font-semibold text-green-deep hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {course.name}
      </Link>

      <p className="ag-label mt-3 text-green-deep">Course Guide</p>

      <h1 className="ag-display mt-2 text-3xl leading-[1.15] text-ink sm:text-[2.5rem]">
        {course.name}
      </h1>

      {/*
        The dek carries the editorial thesis. It is serif and generously sized
        because it is the argument the Guide goes on to make, not a subtitle.
      */}
      <p className="mt-4 font-serif text-lg leading-[1.55] text-ink-soft text-pretty sm:text-xl">
        {guide.dek}
      </p>

      {/*
        Provenance strip. Deliberately plain sentences rather than badges: a row
        of pills would invite the eye to read them as ratings, which is the one
        thing a Guide must never appear to carry.
      */}
      <dl className="mt-6 flex flex-col gap-2 border-t border-border pt-5 font-sans text-sm sm:flex-row sm:flex-wrap sm:gap-x-8">
        <div className="flex gap-2">
          <dt className="text-ink-muted">Type</dt>
          <dd className="font-semibold text-ink">Researched Course Guide</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-muted">Research updated</dt>
          <dd className="font-semibold text-ink">
            {formatMonth(guide.researchUpdated)}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-muted">AustinGolf Review</dt>
          <dd className="font-semibold text-ink">Not published</dd>
        </div>
      </dl>

      <p className="mt-3 font-sans text-xs leading-relaxed text-ink-muted">
        This Guide is researched from documented sources. AustinGolf has not
        played {course.shortName ?? course.name}, so it makes no judgment about
        current conditions, difficulty or value.{" "}
        <Link
          href={`/courses/${course.slug}`}
          className="font-semibold text-green-deep hover:underline"
        >
          The Course Page
        </Link>{" "}
        remains the place for verified tees, access and facilities.
      </p>
    </header>
  )
}
