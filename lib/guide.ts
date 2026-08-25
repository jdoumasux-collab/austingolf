/**
 * Course Guide content schema — Course Guide Build Brief v1.0.
 *
 * The Guide is the "Understand & Prepare" product. It sits between the Course
 * Page ("Choose", structured verified facts) and a future AustinGolf Review
 * ("Firsthand Evaluate", which does not exist yet and is not modelled here).
 *
 * Two design decisions carry most of the weight:
 *
 * 1. A Guide is an ordered array of sections, each an ordered array of blocks —
 *    not a record with fixed `history` / `architecture` / `signatureHoles`
 *    fields. Lions happens to need a long civil-rights section and almost no
 *    hole-level architecture; Butler Pitch & Putt would need format and culture
 *    and has no architect at all; Fazio Canyons has neither a par nor a
 *    published yardage in the master record. A fixed-slot schema forces every
 *    one of those into empty headings. Composition lets each Guide say only what
 *    its evidence supports.
 *
 * 2. Structured course facts are *referenced*, never copied. The `facts` block
 *    names fields and reads them from the live projection at render time, so a
 *    master-data correction propagates into every Guide and a Guide can never
 *    assert a stale par or yardage.
 *
 * On provenance: per owner revision, individual paragraphs are NOT typed claim
 * records. Requiring `claim: "F" | "C" | "I"` on every paragraph turned ordinary
 * editorial writing into database entry for no reader benefit. Traceability is
 * preserved through Guide-level source records, inline `[[S3]]` markers where
 * provenance is materially load-bearing, evidence callouts, inline attribution
 * in the prose itself, and research metadata. What the schema still makes hard
 * is the thing that actually matters: there is no way to express a firsthand
 * observation, because no field accepts one and `reviewStatus` cannot be set to
 * anything but "none".
 */

import type { Course } from "@/lib/domain"

/* ------------------------------------------------------------------ sources */

/**
 * Primary sources are official or documentary records; supporting sources
 * corroborate but do not independently establish a claim. The split is public —
 * it tells a reader how much weight the sourcing carries — while the internal
 * Evidence Ledger's confidence and status codes stay internal.
 */
export type SourceClass = "primary" | "supporting"

export type GuideSource = {
  /** Stable short id, referenced from prose as `[[S3]]`. */
  id: string
  title: string
  publisher: string
  sourceClass: SourceClass
  /** What this source is actually being relied on for, in reader-facing words. */
  approvedUse: string
  url: string
}

/* -------------------------------------------------------------------- media */

/**
 * A Guide figure.
 *
 * `alt` and `credit` are required, non-optional strings: an undescribed or
 * uncredited documentary image cannot be added to a Guide without failing the
 * typecheck. `rightsCleared` is the literal `true` rather than a boolean, so a
 * figure whose reuse status has not actually been checked cannot be expressed at
 * all — writing `rightsCleared: false` is a type error, not a flag.
 *
 * Nothing in the codebase may point this at a generated graphic. Synthetic
 * imagery beside civil-rights prose would read as an archival photograph, which
 * is precisely the failure the Evidence Package forbids.
 */
export type GuideMedia = {
  src: string
  alt: string
  caption: string
  credit: string
  rightsCleared: true
  /** Date of the image itself, when known — not the date it was added. */
  date?: string
}

/* ------------------------------------------------------------------- blocks */

/**
 * Structured fields a Guide may reference from the canonical course record.
 *
 * Deliberately narrow. A Guide is not a second Course Page, so this does not
 * expose tee tables, recommendation weights or feature lists — those remain the
 * Course Page's job and the Guide links to it instead.
 */
export type CourseFactField =
  | "holes"
  | "par"
  | "maxYardage"
  | "accessType"
  | "operatingContext"
  | "area"
  | "walkingPolicy"

export type PrepItem = {
  label: string
  body: string
  href?: string
  hrefLabel?: string
}

export type GuideBlock =
  /** Narrative paragraphs. `[[S1]]` tokens become real source links. */
  | { kind: "prose"; body: string[] }
  /**
   * A documented fact lifted out of the prose because it is load-bearing —
   * a date, a chronology caveat, a documentary attribution. Attribution is
   * required so a callout can never read as an AustinGolf assertion.
   */
  | { kind: "evidence"; label: string; value: string; attribution: string }
  | { kind: "figure"; media: GuideMedia }
  /** Quoted material. Attribution required for the same reason. */
  | { kind: "pullquote"; text: string; attribution: string }
  /** Reads named fields from the live course projection. Absence-tolerant. */
  | { kind: "facts"; fields: CourseFactField[]; note?: string }
  | { kind: "beforeYouGo"; items: PrepItem[] }

export type GuideSection = {
  id: string
  heading: string
  /** Optional short label above the heading. Omit rather than pad. */
  kicker?: string
  blocks: GuideBlock[]
}

/* -------------------------------------------------------------------- guide */

export type Guide = {
  /** Must match a course slug in the canonical projection. */
  slug: string
  /**
   * Reader-facing thesis line. Per the Evidence Package this may be shorter than
   * the locked editorial thesis but must not replace it with generic
   * historic-course language.
   */
  dek: string
  /**
   * Always a researched Guide. The union has exactly one member so that adding
   * a firsthand content type is a deliberate schema change with its own route,
   * never a string swapped in a content file.
   */
  contentType: "researched-guide"
  /** ISO date of the last research pass. Rendered in the masthead. */
  researchUpdated: string
  /**
   * Locked to "none". A Review is a separate product on a separate route; if one
   * is ever published, this type changes deliberately rather than a Guide
   * quietly starting to claim firsthand play.
   */
  reviewStatus: "none"
  sections: GuideSection[]
  sources: GuideSource[]
  /** Plain-language note on how the Guide was researched. */
  guideNote: string
}

/* ------------------------------------------------------ fact-field renderers */

const FACT_LABELS: Record<CourseFactField, string> = {
  holes: "Holes",
  par: "Par",
  maxYardage: "Max published yardage",
  accessType: "Access",
  operatingContext: "Operation",
  area: "Area",
  walkingPolicy: "Walking",
}

/**
 * Resolve a referenced fact against the live course record.
 *
 * Returns null — not an empty string — when the master record has no value, so
 * callers omit the row entirely. Fazio Canyons is the reason: it has neither a
 * par nor a published yardage, and a Guide that rendered "Par —" would be
 * presenting a gap as a fact.
 */
export function resolveFact(
  course: Course,
  field: CourseFactField,
): { label: string; value: string } | null {
  const raw = (() => {
    switch (field) {
      case "holes":
        return course.holes
      case "par":
        return course.par
      case "maxYardage":
        return course.maxYardage === null
          ? null
          : `${course.maxYardage.toLocaleString()} yds`
      case "accessType":
        return course.accessType
      case "operatingContext":
        return course.operatingContext
      case "area":
        return course.area
      case "walkingPolicy":
        return course.walkingPolicy
    }
  })()

  if (raw === null || raw === undefined || raw === "") return null
  return { label: FACT_LABELS[field], value: String(raw) }
}

/* --------------------------------------------------------- prose source refs */

export type ProseSegment =
  | { kind: "text"; text: string }
  | { kind: "ref"; source: GuideSource; index: number }

/**
 * Split a paragraph into text and source-reference segments.
 *
 * Prose is written as ordinary sentences with `[[S3]]` where a citation belongs,
 * which keeps writing natural while still producing real, accessible source
 * links in the output. An unknown id degrades to plain text rather than throwing
 * or rendering a dangling marker.
 */
export function parseProse(body: string, sources: GuideSource[]): ProseSegment[] {
  const byId = new Map(sources.map((s) => [s.id, s]))
  const segments: ProseSegment[] = []
  const pattern = /\[\[([A-Za-z0-9]+)\]\]/g
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(body)) !== null) {
    const source = byId.get(match[1])
    if (match.index > cursor) {
      segments.push({ kind: "text", text: body.slice(cursor, match.index) })
    }
    if (source) {
      segments.push({
        kind: "ref",
        source,
        index: sources.indexOf(source) + 1,
      })
    }
    cursor = match.index + match[0].length
  }

  if (cursor < body.length) {
    segments.push({ kind: "text", text: body.slice(cursor) })
  }
  return segments
}
