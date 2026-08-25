/**
 * Guide body prose, and the inline source marker.
 *
 * Serif at 17–18px with relaxed leading is the clearest available signal that
 * this is reading rather than scanning — the Course Page uses Inter at 14–16px
 * for exactly the opposite reason. Both fonts are already loaded, so the
 * editorial voice costs nothing.
 *
 * One component owns paragraph rhythm so reading measure and leading cannot
 * drift between sections or between Guides.
 */

import type { GuideSource } from "@/lib/guide"
import { parseProse } from "@/lib/guide"

/**
 * Inline citation.
 *
 * A real anchor with an explicit accessible name, not a bare superscript glyph:
 * screen-reader users get "Source 3: National Register of Historic Places…"
 * rather than the number "3" with no context.
 *
 * The 24px minimum box satisfies WCAG 2.5.8 target size while the type stays at
 * citation scale — the hit area comes from the box, not from inflating the
 * glyph. At the Guide's relaxed leading a 24px inline box still fits inside the
 * line, so meeting the target size does not open up paragraph rhythm.
 */
function SourceRef({ source, index }: { source: GuideSource; index: number }) {
  return (
    <a
      href={`#source-${source.id}`}
      aria-label={`Source ${index}: ${source.title}`}
      className="ml-0.5 inline-flex min-h-6 min-w-6 -translate-y-0.5 items-center justify-center rounded align-baseline font-sans text-[0.6875rem] font-semibold text-green-deep no-underline hover:bg-sand hover:underline"
    >
      {index}
    </a>
  )
}

export function GuideProse({
  body,
  sources,
}: {
  body: string[]
  sources: GuideSource[]
}) {
  return (
    <div className="flex flex-col gap-5">
      {body.map((paragraph, i) => (
        <p
          key={i}
          className="font-serif text-[1.0625rem] leading-[1.65] text-ink text-pretty sm:text-[1.125rem]"
        >
          {parseProse(paragraph, sources).map((segment, j) =>
            segment.kind === "text" ? (
              segment.text
            ) : (
              <SourceRef
                key={j}
                source={segment.source}
                index={segment.index}
              />
            ),
          )}
        </p>
      ))}
    </div>
  )
}
