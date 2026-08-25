/**
 * Guide notes and sources.
 *
 * The brief asks for two things that pull against each other: make sourcing
 * genuinely checkable, and do not make the page feel like an academic paper. The
 * resolution is to publish what a reader can act on — who published it, whether
 * it is primary or supporting, what it is relied on for, and a working link —
 * and to publish nothing from the internal ledger. No confidence grades, no
 * claim types, no PUBLISH / DO NOT PUBLISH statuses.
 *
 * Numbering matches the inline `[[Sn]]` markers in the prose, and each entry
 * carries the `#source-{id}` anchor those markers target.
 */

import { ArrowUpRight } from "lucide-react"
import type { GuideSource } from "@/lib/guide"

export function GuideSources({
  sources,
  guideNote,
}: {
  sources: GuideSource[]
  guideNote: string
}) {
  return (
    <section aria-labelledby="sources-heading" className="scroll-mt-8">
      <h2
        id="sources-heading"
        className="ag-display text-2xl leading-snug text-ink sm:text-[1.75rem]"
      >
        Guide notes and sources
      </h2>

      <p className="mt-4 font-sans text-sm leading-relaxed text-ink-soft">
        {guideNote}
      </p>

      <ol className="mt-6 flex list-none flex-col gap-4 p-0">
        {sources.map((source, i) => (
          <li
            key={source.id}
            id={`source-${source.id}`}
            className="scroll-mt-8 border-t border-border pt-4 font-sans"
          >
            <div className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-xs font-semibold text-ink-muted"
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink text-pretty">
                  {source.title}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {source.publisher}
                  {" · "}
                  {source.sourceClass === "primary"
                    ? "Primary source"
                    : "Supporting source"}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft text-pretty">
                  {source.approvedUse}
                </p>
                {/*
                  A short "View source" label rather than the raw URL. Source
                  URLs here include long unbroken paths — the National Register
                  PDF among them — which overflow a 390px viewport when printed
                  as link text, and a sources list is the likeliest place for a
                  Guide to break the document horizontally. The accessible name
                  still names the specific source.
                */}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-green-deep hover:underline"
                >
                  View source
                  <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  <span className="sr-only">
                    : {source.title} (opens in a new tab)
                  </span>
                </a>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
