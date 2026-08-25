/**
 * Guide figure — semantic media architecture with provenance.
 *
 * Built and exercised by the type system even though no Guide currently renders
 * one: Lions ships text-only because no verified or rights-cleared Lions imagery
 * has been supplied, and the Evidence Package is explicit that synthetic imagery
 * must never masquerade as documentary evidence of Lions or its civil-rights
 * history.
 *
 * Three properties make that boundary structural rather than editorial:
 *
 *  - This renders a real `<figure>` / `<figcaption>` pair, so when archival
 *    material does arrive it is already semantically correct for assistive
 *    technology.
 *  - `alt` and `credit` are required by `GuideMedia`, so an undescribed or
 *    uncredited image fails the typecheck.
 *  - It deliberately does not import `BrandedImage`. The generated contour
 *    graphic used as a Course Page placeholder has no place in a documentary
 *    position — beside civil-rights prose a synthetic image would read as a
 *    photograph of the events described.
 */

import type { GuideMedia } from "@/lib/guide"

export function GuideFigure({ media }: { media: GuideMedia }) {
  return (
    <figure className="my-2">
      {/*
        Plain `img` rather than `next/image`: Guide media will arrive as archival
        scans and licensed photography of unknown intrinsic dimensions, and
        `next/image` needs those up front. Revisit per-asset once real media
        exists and its dimensions are known.
      */}
      <img
        src={media.src}
        alt={media.alt}
        className="w-full rounded-lg border border-border"
      />
      <figcaption className="mt-2.5 font-sans text-sm leading-relaxed text-ink-soft">
        {media.caption}
        <span className="mt-1 block text-xs text-ink-muted">
          {media.date ? `${media.date} · ` : null}
          {media.credit}
        </span>
      </figcaption>
    </figure>
  )
}
