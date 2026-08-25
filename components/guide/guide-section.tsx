/**
 * Guide narrative section, and the block dispatcher.
 *
 * The page owns the single `h1`; every section is an `h2` inside a labelled
 * `section` landmark, so heading hierarchy is correct by construction and no
 * content file can introduce a heading level. This mirrors `CourseSection`
 * without reusing it — that component carries Course Page spacing and an
 * Inter-based title, and forcing editorial prose through it would have made the
 * Guide look like a Course Page module.
 */

import type { Course } from "@/lib/domain"
import type { GuideBlock, GuideSection as GuideSectionData, GuideSource } from "@/lib/guide"
import { BeforeYouGo, EvidenceCallout, GuideFacts, GuidePullquote } from "@/components/guide/guide-blocks"
import { GuideFigure } from "@/components/guide/guide-figure"
import { GuideProse } from "@/components/guide/guide-prose"

function GuideBlockView({
  block,
  course,
  sources,
}: {
  block: GuideBlock
  course: Course
  sources: GuideSource[]
}) {
  switch (block.kind) {
    case "prose":
      return <GuideProse body={block.body} sources={sources} />
    case "evidence":
      return (
        <EvidenceCallout
          label={block.label}
          value={block.value}
          attribution={block.attribution}
        />
      )
    case "figure":
      return <GuideFigure media={block.media} />
    case "pullquote":
      return <GuidePullquote text={block.text} attribution={block.attribution} />
    case "facts":
      return (
        <GuideFacts course={course} fields={block.fields} note={block.note} />
      )
    case "beforeYouGo":
      return <BeforeYouGo items={block.items} />
  }
}

export function GuideSection({
  section,
  course,
  sources,
}: {
  section: GuideSectionData
  course: Course
  sources: GuideSource[]
}) {
  const headingId = `${section.id}-heading`
  return (
    <section aria-labelledby={headingId} className="scroll-mt-8">
      {section.kicker ? (
        <p className="ag-label text-green-deep">{section.kicker}</p>
      ) : null}
      <h2
        id={headingId}
        className="ag-display mt-1.5 text-2xl leading-snug text-ink sm:text-[1.75rem]"
      >
        {section.heading}
      </h2>
      <div className="mt-5 flex flex-col gap-5">
        {section.blocks.map((block, i) => (
          <GuideBlockView
            key={i}
            block={block}
            course={course}
            sources={sources}
          />
        ))}
      </div>
    </section>
  )
}
