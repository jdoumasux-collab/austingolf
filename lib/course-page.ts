/**
 * Course Page decision-support helpers (Course Page Product Contract v1.0).
 *
 * Presentation logic for the shared Course Page lives here rather than in
 * `domain.ts` so the projection layer stays about truth and this layer stays
 * about hierarchy. Nothing here introduces a fact: every string is either
 * derived from a projected field or is fixed connective copy that makes a
 * projected field readable.
 *
 * The page is a decision-support product, so each helper answers one of the
 * golfer's questions and returns null/empty when the dataset cannot answer it.
 * Callers omit the module in that case — no filler, no reserved cells.
 */

import { rawUiPriority } from "@/lib/data/dataset.generated"
import {
  type AccessProfile,
  type Course,
  type CourseCharacteristic,
  type Property,
  type Recommendation,
  type TeeSet,
  distanceMiles,
  rankReasons,
} from "@/lib/domain"

/* --------------------------------------------- module 3: decision support */

/** Authoritative editorial display order, by course id. */
const uiPriorityByCourse = new Map<string, readonly string[]>(
  rawUiPriority.map((r) => [r.courseId as string, r.priority]),
)

/**
 * `Recommendation_Display_Rules_v1`: "Show a maximum of 3 recommendation/fit
 * badges in any one card/page summary state."
 */
export const MAX_VISIBLE_REASONS = 3

/**
 * The reasons to show, in order, capped at three.
 *
 * Priority, per the contract: (1) the arrival intent, (2) established editorial
 * UI priority, (3) remaining editorial weight. Step 2 exists because weight
 * cannot break its own ties — Fazio Canyons and Palmer Lakeside each carry five
 * reasons that are all strong/high/primary_candidate, so without the master's
 * `Rich_Coverage_UI_Priority_v1` ordering the visible three would be whichever
 * three happened to be first in the spreadsheet.
 *
 * Classifications excluded from consumer UX are already stripped in the
 * projection, so they cannot appear here even when the priority sheet names one.
 */
export function displayReasons(
  course: Course,
  intent: string | null,
): Recommendation[] {
  const all = course.recommendations
  if (!all.length) return []

  const ordered: Recommendation[] = []
  const take = (r: Recommendation | undefined) => {
    if (r && !ordered.includes(r)) ordered.push(r)
  }

  // 1. The decision the golfer actually arrived with always leads.
  if (intent) {
    const forIntent = all.filter((r) => r.classification === intent)
    if (forIntent.length) take(rankReasons(forIntent)[0])
  }

  // 2. Editorial ordering for courses rich enough to need it.
  for (const classification of uiPriorityByCourse.get(course.id) ?? []) {
    take(all.find((r) => r.classification === classification))
  }

  // 3. Anything still unshown, by editorial weight.
  for (const r of rankReasons(all)) take(r)

  return ordered.slice(0, MAX_VISIBLE_REASONS)
}

/* ------------------------------------------- module 4: course at a glance */

export type GlanceFact = { label: string; value: string }

/**
 * Features that describe the round itself rather than the facilities around it,
 * so they belong in the glance summary instead of module 7.
 */
const ROUND_SHAPE_FEATURES = new Set(["Typical Play Time"])

/** "Roy Bechtol; Randy Russell" reads as data; "and" reads as a sentence. */
function joinArchitects(s: string) {
  const parts = s.split(";").map((p) => p.trim()).filter(Boolean)
  if (parts.length <= 1) return parts[0] ?? s
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`
}

/**
 * A curated 4–6 fact summary, not a statistics grid.
 *
 * Only verified projected values, and rating/slope never appear here — those are
 * governed by the tee publication gate in module 6. Format is folded into the
 * holes row rather than taking its own slot, because on 17 of 18 courses
 * "Regulation" is not a distinguishing fact.
 */
export function glanceFacts(course: Course): GlanceFact[] {
  const facts: GlanceFact[] = []

  if (course.holes !== null) {
    facts.push({
      label: "Holes",
      value: course.courseFormat
        ? `${course.holes} · ${course.courseFormat}`
        : String(course.holes),
    })
  }
  if (course.par !== null) facts.push({ label: "Par", value: String(course.par) })
  if (course.maxYardage !== null) {
    facts.push({
      label: "Yardage",
      value: `${course.maxYardage.toLocaleString()} yds`,
    })
  }
  if (course.architect) {
    facts.push({ label: "Design", value: joinArchitects(course.architect) })
  }
  if (course.operatingContext) {
    facts.push({ label: "Operation", value: course.operatingContext })
  }
  for (const f of course.features) {
    if (!ROUND_SHAPE_FEATURES.has(f.feature)) continue
    facts.push({ label: f.feature, value: f.value })
  }

  return facts
}

/**
 * Walking is returned separately because it is the one field where silence is
 * dangerous: a walker reading no walking row would infer "not allowed", so an
 * unknown policy is stated as unconfirmed instead of omitted. Missing is not No.
 */
export const walkingFact = (course: Course): GlanceFact =>
  course.walkingPolicy
    ? { label: "Walking", value: course.walkingPolicy }
    : { label: "Walking", value: "Not confirmed" }

/* ------------------------------------ module 5: what the golf is like */

/**
 * Verified characteristics, strongest first.
 *
 * Returned as the projected statements themselves — label plus its evidence-backed
 * reason — and deliberately not synthesized into prose. Generating "the golf is
 * like…" narration from these rows would manufacture firsthand observation the
 * dataset does not contain, which the contract forbids and which is the exact
 * failure mode a decision-support product cannot afford.
 */
export function characterStatements(course: Course): CourseCharacteristic[] {
  const rank: Record<string, number> = { strong: 2, moderate: 1 }
  return [...course.characteristics].sort(
    (a, b) => (rank[b.strength ?? ""] ?? 0) - (rank[a.strength ?? ""] ?? 0),
  )
}

/* ------------------------------------------ module 6: tees & playing options */

export type TeeView =
  | { kind: "table"; tees: TeeSet[]; showRatings: boolean }
  | { kind: "summary"; maxYardage: number | null; par: number | null }
  | { kind: "absent" }

/**
 * What the tee module may render, decided entirely by the Run 1 publication gate.
 *
 * The gate is resolved here once so no component has to interpret it, and so
 * `showRatings` is the only thing a template can act on. Rating/slope values are
 * already nulled in the projection for a suppressed course; this flag additionally
 * removes the empty columns so the table does not advertise data it cannot show.
 */
export function teeView(course: Course): TeeView {
  if (course.teeDisplayGate === "summary_only") {
    // Not the same as "no data": a verified course-level yardage may still exist.
    if (course.maxYardage === null && course.par === null) return { kind: "absent" }
    return { kind: "summary", maxYardage: course.maxYardage, par: course.par }
  }
  // Level D: nothing publishable. Never render an empty table.
  if (!course.teeSets.length) return { kind: "absent" }
  return {
    kind: "table",
    tees: course.teeSets,
    showRatings:
      course.teeDisplayGate === "full" &&
      course.teeSets.some((t) => t.courseRating !== null || t.slopeRating !== null),
  }
}

/* --------------------------------- module 7: practice & golf facilities */

/**
 * Verified facility/practice facts from the already-approved projection.
 *
 * Run 1 deliberately did not migrate `Course_Features_v1`, because the Finder
 * filters on curated feature names and importing the master set would change
 * filter behavior. This reads only the existing curated features, so the Finder
 * is untouched — which also means coverage is thin (five courses).
 */
export function facilityFeatures(course: Course) {
  return course.features.filter((f) => !ROUND_SHAPE_FEATURES.has(f.feature))
}

/* --------------------------------------- module 8: playing this course */

/**
 * Human-language access explanation, keyed off the LOCKED access profile.
 *
 * The taxonomy drives the logic and `accessType` supplies the verified label;
 * this only adds the sentence a golfer needs to act on it. Each string is
 * restricted to what the profile itself guarantees — no stay requirements, no
 * booking capability, no availability, and for conditional access no flattening
 * into unrestricted public play.
 */
export type AccessGuidance = {
  heading: string
  body: string
  /** True where the golfer cannot simply book a public tee time. */
  restricted: boolean
}

const ACCESS_GUIDANCE: Record<AccessProfile, AccessGuidance> = {
  public: {
    heading: "Open to the public",
    body: "No membership required. Tee times are arranged with the course directly.",
    restricted: false,
  },
  resort: {
    heading: "Resort golf",
    body:
      "Access runs through the resort. Confirm how the course handles outside play before planning a round.",
    restricted: true,
  },
  conditional: {
    heading: "Semi-private access",
    body:
      "A member club that also releases public tee times. Public access is real but conditional, so confirm availability with the course rather than assuming open access.",
    restricted: true,
  },
  private: {
    heading: "Private club",
    body:
      "Play is limited to members and their guests. This page is informational only — AustinGolf offers no public access to this course.",
    restricted: true,
  },
}

export function accessGuidance(course: Course): AccessGuidance {
  return ACCESS_GUIDANCE[course.accessProfile]
}

/* --------------------------------------------- module 9: property context */

export type PropertyRelation = {
  property: Property
  miles: number
  /** True when the course sits away from the property's main campus. */
  offCampus: boolean
}

/** Beyond this, "at the resort" would misdescribe the drive. */
const OFF_CAMPUS_MILES = 3

/**
 * The Property relationship plus the geographic truth about it.
 *
 * Palmer Lakeside is the reason this returns a distance rather than a boolean
 * "belongs to". It is part of the Barton Creek golf structure while sitting well
 * away from the main campus, so the page must state membership without implying
 * co-location. Course geography always wins; the property never supplies it.
 */
export function propertyRelation(
  course: Course,
  property: Property | undefined,
): PropertyRelation | null {
  if (!property) return null
  const miles = distanceMiles(property, course)
  return { property, miles, offCampus: miles > OFF_CAMPUS_MILES }
}

/* ------------------------------------------ module 11: continue exploring */

export type Continuation = { label: string; href: string; note: string }

/**
 * Next steps, composed from existing Finder URL state rather than a new
 * recommendation engine. Every link is a Finder query the app already answers,
 * so there is no parallel ranking logic and no hand-maintained related list.
 *
 * The private-course case is the one that needs care: a member-guest course has
 * no public alternatives to offer *as substitutes*, so instead of inventing
 * "similar clubs" it hands off to honest public-access browsing in the same area.
 * That is produced by the existing access filter, which cannot return a private
 * course.
 */
export function continuations(
  course: Course,
  intent: string | null,
  relation: PropertyRelation | null,
): Continuation[] {
  const out: Continuation[] = []
  const area = encodeURIComponent(course.area)

  // Continue the decision the golfer actually arrived with.
  if (intent) {
    out.push({
      label: `More courses for ${intent}`,
      href: `/courses/explore?intent=${encodeURIComponent(intent)}`,
      note: "Same reason, other options",
    })
  }

  if (course.accessProfile === "private") {
    // Honest redirection, not a substitute recommendation.
    out.push({
      label: `Public courses in ${course.area}`,
      href: `/courses/explore?area=${area}&access=public`,
      note: "Courses in this area you can book without a membership",
    })
  } else {
    out.push({
      label: `Other courses in ${course.area}`,
      href: `/courses/explore?area=${area}`,
      note: "Nearby alternatives",
    })
  }

  if (relation) {
    out.push({
      label: relation.property.name,
      href: `/properties/${relation.property.slug}`,
      note: `All ${relation.property.courses.length} courses at this property`,
    })
  }

  return out
}
