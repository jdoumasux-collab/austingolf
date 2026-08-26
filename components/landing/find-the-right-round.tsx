/**
 * Find the Right Round (§5.3, Gen2 §5, §15).
 *
 * Gen1 exposed the recommendation taxonomy: two oversized cards plus a row of
 * classification pills. Gen2 makes this a curated decision aid instead — the six
 * locked pathways at roughly equal visual weight, scannable together without
 * meaningful scrolling.
 *
 * `Beginner Friendly` is absent (Gen2 §4): "methodology pending" is an internal
 * product condition, not consumer content. `Hill Country Experience` and
 * `Practice Destination` remain valid internal classifications and still drive
 * Quick Paths and the orientation layer — they just do not compete for the
 * primary decision interface.
 *
 * Each pathway carries enough meaning to be understood, and deliberately stops
 * short of becoming a mini Course Card (§15).
 *
 * VISUAL EXPERIMENT 01 — calibration against the approved courses-landing
 * design. Visual treatment only: pathways, ordering, destinations, derived
 * counts, semantics and breakpoints are all unchanged.
 *
 * One directive was deliberately inverted. The approved design reads as a warm
 * cream ground carrying white surfaces, but this section is sandwiched between
 * two fields that are *already* cream — the hero's search band above and
 * ExploreByArea below. A cream ground here would fuse three sections into one
 * continuous slab, and re-balancing that would mean editing a neighbouring
 * section (out of scope). So the warmth is carried by the cards and the page
 * field stays white, preserving the existing cream/white alternation.
 */

import Link from "next/link"
import {
  ArrowUpRight,
  BedDouble,
  Car,
  Clock,
  Flag,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react"
import { courseCountLabel, courses, primaryPathways } from "@/lib/domain"

/**
 * EXPERIMENT 01 — TEMPORARY, LOCALLY SCOPED ACCENT. NOT AN APPROVED TOKEN.
 *
 * The approved courses-landing design establishes a warm terracotta as the
 * *action* accent, but AustinGolf has no accent token: `--sand` is a rule/mark
 * colour and `--green` is a label/state colour (§3). Rather than mint a global
 * token from a raster approximation, this experiment carries one hard-coded
 * value scoped to this component so the accent's ROLE can be judged before its
 * VALUE is decided. It is deliberately not in globals.css and must not be
 * reused. If the role is approved, this becomes a real token and this constant
 * is deleted.
 */
const X01_ACCENT = "#C2673B"

const countFor = (id: string) =>
  courses.filter((c) => c.recommendations.some((r) => r.classification === id)).length

/**
 * Recognition aid only (Gen2 §5). The icon restates the intent the label already
 * names, so it must never be the sole carrier of meaning — hence `aria-hidden`
 * and a thin stroke. Keyed by classification id, so an unmapped pathway degrades
 * to no icon rather than a wrong one.
 */
const PATHWAY_ICONS: Record<string, LucideIcon> = {
  "Distinctly Austin": Star,
  "Serious Golf": Flag,
  "Great for Groups": Users,
  "Quick Round": Clock,
  "Worth the Drive": Car,
  "Golf Trip / Stay & Play": BedDouble,
}

export function FindTheRightRound() {
  return (
    <section
      id="find-the-right-round"
      aria-labelledby="ftrr-heading"
      className="ag-shell scroll-mt-20 py-14 sm:py-20"
    >
      {/*
        Approved design stacks the supporting line directly beneath the heading
        rather than opposing it across the row, which reads as one editorial
        statement instead of two competing blocks. Copy is unchanged.
      */}
      <div className="max-w-2xl">
        <p className="ag-label text-green-deep">Decision support</p>
        <h2
          id="ftrr-heading"
          className="ag-display mt-2.5 text-3xl leading-[1.08] text-ink sm:text-4xl"
        >
          Find the right round
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          Start from what the day has to do, not from a filter. Every pathway
          shows our reasoning, so you can see why a course is on the list.
        </p>
      </div>

      {/*
        Six pathways, equal weight, one scan.
        Gen1/Gen2 used a seamless `gap-px` hairline grid; the approved design
        shows six discretely bordered cards separated by a small gutter, so each
        pathway reads as its own enumerable cell. Comparison density is
        unchanged — same six cards, same breakpoints — and structure is carried
        by hairline borders rather than by elevation.
      */}
      <ul className="mt-8 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {primaryPathways.map((c) => {
          const Icon = PATHWAY_ICONS[c.id]
          return (
            <li key={c.id}>
              <Link
                href={`/courses/explore?intent=${encodeURIComponent(c.id)}`}
                className="group relative flex h-full flex-col items-center rounded-sm border border-border bg-cream px-5 pb-7 pt-5 text-center transition-colors hover:border-ink/20 hover:bg-card"
              >
                {Icon ? (
                  <span
                    aria-hidden="true"
                    className="mb-4 grid size-11 shrink-0 place-items-center rounded-full border transition-colors"
                    style={{
                      borderColor: `color-mix(in oklab, ${X01_ACCENT} 34%, transparent)`,
                    }}
                  >
                    <Icon
                      className="size-5"
                      strokeWidth={1.5}
                      style={{ color: X01_ACCENT }}
                    />
                  </span>
                ) : null}

                <span className="ag-display text-[1.0625rem] leading-snug text-ink">
                  {c.label}
                </span>
                <span className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft">
                  {c.orientation}
                </span>
                <span className="ag-label mt-auto pt-4 text-green-deep">
                  {courseCountLabel(countFor(c.id))}
                </span>

                {/*
                  Corner affordance, not a call to action: the whole card is the
                  target, so the arrow only marks direction (§15).
                */}
                <ArrowUpRight
                  aria-hidden="true"
                  className="absolute bottom-3 right-3 size-3.5 text-ink-muted transition-colors group-hover:text-ink-soft"
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
