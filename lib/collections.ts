/**
 * AustinGolf COLLECTIONS — editorial discovery model.
 *
 * A Collection is a curated way in: editorial orientation wrapped around a
 * deterministic slice of the verified course set. It is deliberately NOT a new
 * source of course facts. Two rules keep it honest:
 *
 *  1. Membership never diverges from the Explorer. Every Collection resolves its
 *     courses through the *same* predicate the Finder uses for the equivalent
 *     state — `matchesQuickPath` for geographic/factual groupings, and the
 *     recommendation-classification test for editorial ones. There is no separate
 *     hand-maintained membership list to drift out of sync, so a Collection and
 *     its canonical Explorer link always show the same courses (canonicality, §5).
 *
 *  2. No unearned editorial voice. The short orientation (`dek`) is pulled from
 *     the vetted strings already used by the Finder and the landing page
 *     (`quickPathById` / `classificationById` orientation), not rewritten here.
 *     The Collection-specific copy (`rationale`) describes the *decision* a reader
 *     is making, never a quality judgment about the courses.
 *
 * Under $100 and View Map are intentionally NOT Collections: they are simple
 * structured Explorer states, and one concept gets one canonical destination.
 */

import {
  type Course,
  type Recommendation,
  courses,
  classificationById,
  matchesQuickPath,
  quickPathById,
  reasonForIntent,
} from "@/lib/domain"

/* ------------------------------------------------------------------ model */

/**
 * How a Collection selects its courses.
 *
 *  - `path`   delegates to `matchesQuickPath`, so the membership is identical to
 *             the Explorer's `?path=` scope. Used for geographic/factual groupings
 *             (Austin Munis, Near Downtown, Hill Country, Resort). These carry no
 *             editorial rationale per course, so cards orient neutrally.
 *  - `intent` matches a dataset recommendation classification, identical to the
 *             Explorer's `?intent=` scope. Used for editorial groupings, so each
 *             card can show that intent's own approved "why it fits" reasoning.
 */
export type CollectionMembership =
  | { kind: "path"; pathId: string }
  | { kind: "intent"; classification: string }

export type Collection = {
  slug: string
  title: string
  /** Short orientation line. Sourced from the vetted Finder/landing copy. */
  dek: string
  /** Optional longer editorial introduction for the detail page. */
  intro?: string
  /** Why/when a reader reaches for this Collection. About the decision, not the courses. */
  rationale: string
  membership: CollectionMembership
  /** Presentation order in the hub. */
  order: number
  status: "published" | "draft"
}

/* ------------------------------------------------------------ definitions */

/**
 * The eight launch Collections. `dek` values are the exact orientation strings
 * the Explorer and landing modules already use, so a Collection never introduces
 * a second, subtly-different description of the same grouping.
 *
 * Golf Trip / Stay & Play is deliberately absent — it is reserved for the later
 * Travel architecture and must not be launched as a Collection here.
 */
const DEFS: Collection[] = [
  {
    slug: "austin-munis",
    title: "Austin Munis",
    dek: "City and municipal golf around the metro.",
    intro:
      "City-run golf: the civic layer of Austin's game and its most public front door. These are courses owned and operated by a municipality rather than a private operator.",
    rationale:
      "Reach for this when civic, city-run golf is the point — whether for the character of a muni or simply the most public way into the game.",
    membership: { kind: "path", pathId: "austin-munis" },
    order: 1,
    status: "published",
  },
  {
    slug: "near-downtown",
    title: "Near Downtown",
    dek: "Courses inside the Austin core, closest first.",
    intro:
      "The golf closest to central Austin, ordered by distance from downtown. A starting point when proximity is the deciding factor rather than the kind of round.",
    rationale:
      "Use this when you are working around the city and want the shortest trip to a tee, not a particular style of course.",
    membership: { kind: "path", pathId: "near-downtown" },
    order: 2,
    status: "published",
  },
  {
    slug: "hill-country-golf",
    title: "Hill Country Golf",
    dek: "Terrain and landscape doing the work west of the city.",
    intro:
      "West of Austin the land changes — elevation, limestone and live oak. These are the courses where Hill Country terrain is a defining part of the round.",
    rationale:
      "Choose this when the setting matters as much as the golf and you want the landscape west of the city to carry the day.",
    membership: { kind: "intent", classification: "Hill Country Experience" },
    order: 3,
    status: "published",
  },
  {
    slug: "resort-golf",
    title: "Resort Golf",
    dek: "Golf attached to a resort stay.",
    intro:
      "Golf tied to a resort, where the round is part of a stay rather than a standalone visit. In the prototype set this is concentrated almost entirely at one resort campus.",
    rationale:
      "Turn here when the golf is part of a trip with lodging, not an errand to a single course.",
    membership: { kind: "path", pathId: "resort-golf" },
    order: 4,
    status: "published",
  },
  {
    slug: "distinctly-austin",
    title: "Distinctly Austin",
    dek: "Rounds that could not be transplanted anywhere else.",
    intro:
      "Courses with a specific sense of place — rounds that are tied to Austin in a way that would not survive being moved somewhere else.",
    rationale:
      "Pick this when you want a round that feels like Austin specifically, not just a good course that happens to be here.",
    membership: { kind: "intent", classification: "Distinctly Austin" },
    order: 5,
    status: "published",
  },
  {
    slug: "serious-golf",
    title: "Serious Golf",
    dek: "Enough golf course to hold a strong player's attention.",
    intro:
      "Courses with enough substance to reward a strong player — the ones that hold up when the golf itself is the reason you are there.",
    rationale:
      "Reach for this when the challenge and quality of the course is the priority.",
    membership: { kind: "intent", classification: "Serious Golf" },
    order: 6,
    status: "published",
  },
  {
    slug: "quick-rounds",
    title: "Quick Rounds",
    dek: "Golf that fits in the time you actually have.",
    intro:
      "Lower-commitment golf for when the day will not hold a full eighteen — shorter or more casual rounds that still count as getting out.",
    rationale:
      "Use this when time is the constraint and you want golf that fits the window you have.",
    membership: { kind: "intent", classification: "Quick Round" },
    order: 7,
    status: "published",
  },
  {
    slug: "worth-the-drive",
    title: "Worth the Drive",
    dek: "Far enough out to be a decision, different enough to justify it.",
    intro:
      "Courses beyond the easy radius — far enough that going is a decision, and distinct enough that the drive is part of the appeal rather than a cost.",
    rationale:
      "Choose this when you are willing to travel for something you cannot get closer to home.",
    membership: { kind: "intent", classification: "Worth the Drive" },
    order: 8,
    status: "published",
  },
]

/* -------------------------------------------------- validation (fail loud) */

/*
 * Every membership descriptor must reference a target that actually exists in
 * the domain, for the same reason `toAccessProfile` throws: a Collection that
 * silently points at a non-existent path or classification would render as an
 * empty, unexplained page. A typo here should stop the build, not ship a void.
 */
for (const c of DEFS) {
  if (c.membership.kind === "path" && !quickPathById.has(c.membership.pathId)) {
    throw new Error(
      `[collections] "${c.slug}" references unknown quick path "${c.membership.pathId}".`,
    )
  }
  if (
    c.membership.kind === "intent" &&
    !classificationById.has(c.membership.classification)
  ) {
    throw new Error(
      `[collections] "${c.slug}" references unknown classification "${c.membership.classification}".`,
    )
  }
}

/* ----------------------------------------------------------------- exports */

/** Published Collections in presentation order. Draft entries never surface. */
export const collections: Collection[] = DEFS.filter(
  (c) => c.status === "published",
).sort((a, b) => a.order - b.order)

export const collectionBySlug = new Map(collections.map((c) => [c.slug, c]))

export const getCollection = (slug: string) => collectionBySlug.get(slug)

/**
 * The courses in a Collection, resolved through the *same* predicate the Finder
 * uses. This is the single source of membership — there is no stored list.
 */
export function collectionCourses(c: Collection): Course[] {
  if (c.membership.kind === "path") {
    const { pathId } = c.membership
    return courses.filter((course) => matchesQuickPath(pathId, course))
  }
  const { classification } = c.membership
  return courses.filter((course) =>
    course.recommendations.some((r) => r.classification === classification),
  )
}

/** The canonical Explorer state this Collection corresponds to. */
export function collectionExploreHref(c: Collection): string {
  if (c.membership.kind === "path") {
    return `/courses/explore?path=${c.membership.pathId}`
  }
  return `/courses/explore?intent=${encodeURIComponent(c.membership.classification)}`
}

/**
 * A Collection → Course link.
 *
 * For an editorial (intent) Collection we carry the originating Explorer state in
 * `from`, exactly as the Finder does, so the Course Page shows that intent's own
 * approved reasoning on arrival (`arrivalIntent` reads it back). Geographic/factual
 * Collections carry no intent, so the Course Page orients neutrally — which is
 * correct: those groupings never earned per-course editorial language.
 */
export function collectionCourseHref(c: Collection, course: Course): string {
  if (c.membership.kind === "intent") {
    const from = `/courses/explore?intent=${encodeURIComponent(c.membership.classification)}`
    return `/courses/${course.slug}?from=${encodeURIComponent(from)}`
  }
  return `/courses/${course.slug}`
}

/** Card presentation context: editorial Collections lead with the reason. */
export function collectionCardContext(c: Collection): "intent" | "neutral" {
  return c.membership.kind === "intent" ? "intent" : "neutral"
}

/**
 * The approved contextual reason to show on a card, for editorial Collections
 * only. Returns `null` for geographic Collections and for any course the dataset
 * holds no reason for under this intent — the card then orients neutrally rather
 * than borrowing language it did not earn.
 */
export function collectionReason(c: Collection, course: Course): Recommendation | null {
  if (c.membership.kind !== "intent") return null
  return reasonForIntent(course, c.membership.classification)
}

/* ------------------------------------------ canonical-destination resolvers */

/*
 * Cross-link integration: the inverse of `collectionExploreHref`. Discovery
 * modules (Quick Paths, Find the Right Round, Austin Golf Explained) historically
 * pointed every shortcut at an Explorer state; where that shortcut now has a
 * canonical editorial Collection, it should lead there instead. These lookups are
 * built from the Collections' OWN `membership`, so there is no second mapping to
 * drift — a Collection is reachable from exactly the path/classification it is
 * already defined by. A shortcut with no Collection resolves to `undefined`, and
 * the caller keeps its Explorer link (so "Great for Groups", "Golf Trip" and
 * Daily-Fee stay on the Finder, exactly as the locked IA requires).
 */
const collectionByPathId = new Map<string, Collection>()
const collectionByClassification = new Map<string, Collection>()
for (const c of collections) {
  if (c.membership.kind === "path") collectionByPathId.set(c.membership.pathId, c)
  else collectionByClassification.set(c.membership.classification, c)
}

/**
 * The one Quick Path whose Collection is defined by intent rather than by its
 * own id: `matchesQuickPath("hill-country")` tests the "Hill Country Experience"
 * classification, which is exactly how the Hill Country Golf Collection selects
 * its courses. Bridging through that classification keeps the pairing a fact
 * about the data, not a hand-kept parallel list.
 */
const QUICK_PATH_INTENT: Record<string, string> = {
  "hill-country": "Hill Country Experience",
}

/** Canonical Collection for a Quick Path id, or `undefined` (keep Explorer). */
export function collectionForQuickPath(pathId: string): Collection | undefined {
  return (
    collectionByPathId.get(pathId) ??
    collectionByClassification.get(QUICK_PATH_INTENT[pathId] ?? "")
  )
}

/** Canonical Collection for a recommendation classification, or `undefined`. */
export function collectionForClassification(
  classification: string,
): Collection | undefined {
  return collectionByClassification.get(classification)
}
