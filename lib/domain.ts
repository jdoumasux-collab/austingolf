/**
 * AustinGolf COURSES — domain model.
 *
 * Projects the generated dataset into the shapes the UI consumes. This is the only
 * place dataset semantics are interpreted, so the trust rules from the Build Brief
 * live here rather than being re-implemented per component:
 *
 *  - Unknown stays Unknown. `null` is never coerced to "No" or "N/A" (§7.2, §12).
 *  - Only Verified_Features may back a functioning factual filter (§14).
 *  - Recommendation strength/confidence order results but are never displayed (§14).
 *  - `Mixed Ability Groups` is excluded from the prototype UX entirely (§14).
 */

import {
  rawEntities,
  rawRecommendations,
  rawVerifiedFeatures,
  rawCourseCharacteristics,
  rawTeeSets,
  rawScorecardRules,
} from "@/lib/data/dataset.generated"

/* ------------------------------------------------------------------ types */

/**
 * The four LOCKED `page_access_profile` values from the master's controlled
 * vocabulary. This is the single behavioural discriminator for access; the
 * human-readable `accessType` is display copy only and must never be branched on.
 *
 * There is deliberately no fallback member. An unrecognised profile is a hard
 * generation-time failure (see `toAccessProfile`) rather than a silent default,
 * because the failure mode of guessing here is presenting a private club as
 * publicly playable.
 */
export const ACCESS_PROFILES = ["public", "resort", "conditional", "private"] as const

export type AccessProfile = (typeof ACCESS_PROFILES)[number]

/**
 * Exhaustive, fail-loud mapping from the raw master value to `AccessProfile`.
 *
 * The previous implementation was `x === "resort" ? "resort" : "public"`, which
 * silently relabelled every unrecognised profile as publicly accessible. With
 * conditional and private courses now projected, that coercion would have
 * published false access claims, so unknown values must stop the build instead.
 */
function toAccessProfile(raw: string | null, entityId: string): AccessProfile {
  const match = ACCESS_PROFILES.find((p) => p === raw)
  if (!match) {
    throw new Error(
      `[domain] Unknown page_access_profile "${raw}" on ${entityId}. ` +
        `Expected one of: ${ACCESS_PROFILES.join(", ")}. Refusing to guess an ` +
        `access level — add the new value to ACCESS_PROFILES and give it explicit ` +
        `UI handling before projecting it.`,
    )
  }
  return match
}

export type Recommendation = {
  courseId: string
  classification: string
  strength: string | null
  confidence: string | null
  displayTier: string | null
  whyItFits: string
}

export type VerifiedFeature = {
  feature: string
  value: string
  notes: string | null
  sourceUrl: string | null
}

/** A factual, evidence-backed course characteristic. Never a score or a ranking. */
export type CourseCharacteristic = {
  characteristic: string
  strength: string | null
  reason: string
  evidenceType: string | null
  confidence: string | null
  sourceUrl: string | null
}

/**
 * One published tee row. Grain is (tee, audience) because the same tee carries
 * different ratings for different audiences; rows are never merged.
 *
 * `courseRating` / `slopeRating` are null both when genuinely unknown and when a
 * publication rule withholds them, because the UI treatment is identical: absent.
 */
export type TeeSet = {
  teeName: string
  audienceRating: string | null
  totalYardage: number | null
  par: number | null
  courseRating: number | null
  slopeRating: number | null
  sourceUrl: string | null
}

/**
 * How much of the scorecard this course is cleared to publish.
 *
 * `summary_only` is not the same as "no data": Lost Pines holds a verified
 * course-level yardage that may be shown even though no tee table may be.
 *
 * `suppress_rating_slope_and_back_yardage` is the inverse case — the course-level
 * yardage is the value that may NOT be shown, because it is the disputed
 * back-tee figure. Shorter tees remain publishable.
 */
export type TeeDisplayGate =
  | "full"
  | "suppress_rating_slope"
  | "suppress_rating_slope_and_back_yardage"
  | "summary_only"

export type Course = {
  kind: "course"
  id: string
  propertyId: string | null
  name: string
  shortName: string | null
  slug: string
  holes: number | null
  courseFormat: string | null
  operatingContext: string | null
  accessType: string | null
  accessProfile: AccessProfile
  marketZone: string
  area: string
  city: string
  lat: number
  lng: number
  geoNote: string | null
  par: number | null
  architect: string | null
  maxYardage: number | null
  walkingPolicy: string | null
  sourceUrl: string | null
  recommendations: Recommendation[]
  features: VerifiedFeature[]
  characteristics: CourseCharacteristic[]
  /** Already filtered by `teeDisplayGate`; safe to render as-is. */
  teeSets: TeeSet[]
  teeDisplayGate: TeeDisplayGate
}

export type Property = {
  kind: "property"
  id: string
  name: string
  shortName: string | null
  slug: string
  operatingContext: string | null
  accessType: string | null
  accessProfile: AccessProfile
  marketZone: string
  area: string
  city: string
  lat: number
  lng: number
  geoNote: string | null
  sourceUrl: string | null
  courses: Course[]
}

export type Entity = Course | Property

/* ------------------------------------------------------- excluded content */

/**
 * Retained in the master research set but excluded from prototype UX by the
 * locked interaction contract. Never surfaced as a browsable path.
 */
/**
 * Classifications that are valid internal editorial signals but must never become
 * consumer-facing pathways.
 *
 * `classificationsInData` derives the Find the Right Round pathway list from the
 * data, so any new classification arriving from the master would silently create a
 * browsable intent. Anything without curated orientation copy in
 * `CLASSIFICATION_ORIENTATION` would render as a chip with an empty description,
 * so admission here is a deliberate product decision, not a data decision.
 *
 * - `Mixed Ability Groups` — pre-existing UX lock.
 * - `Beginner / Casual Friendly` — methodology is an internal product condition,
 *   never consumer copy (Gen2 §4, and see the note on PRIMARY_PATHWAYS below).
 * - `Tee Flexibility` — a restatement of the tee table. It belongs to the tee
 *   module as verified tee data, not as a separate reason to choose a course.
 */
export const EXCLUDED_CLASSIFICATIONS = [
  "Mixed Ability Groups",
  "Beginner / Casual Friendly",
  "Tee Flexibility",
] as const

const isExcluded = (classification: string | null) =>
  !classification ||
  EXCLUDED_CLASSIFICATIONS.some((c) => c === classification)

/* ------------------------------------------------------------ projection */

const recsByCourse = new Map<string, Recommendation[]>()
for (const r of rawRecommendations) {
  if (r.excluded || isExcluded(r.classification) || !r.courseId || !r.whyItFits) continue
  const list = recsByCourse.get(r.courseId) ?? []
  list.push({
    courseId: r.courseId,
    classification: r.classification as string,
    strength: r.strength,
    confidence: r.confidence,
    displayTier: r.displayTier,
    whyItFits: r.whyItFits,
  })
  recsByCourse.set(r.courseId, list)
}

/**
 * Publication gates are applied here, at the data boundary, so no component can
 * reach a suppressed value by reading the raw row directly.
 */
const teeGateByCourse = new Map<string, TeeDisplayGate>(
  rawScorecardRules.map((r) => [r.courseId as string, r.teeDisplayGate as TeeDisplayGate]),
)

const characteristicsByCourse = new Map<string, CourseCharacteristic[]>()
for (const c of rawCourseCharacteristics) {
  // A characteristic without its reason is not publishable: the reason IS the claim.
  if (!c.courseId || !c.characteristic || !c.reason) continue
  const list = characteristicsByCourse.get(c.courseId) ?? []
  list.push({
    characteristic: c.characteristic,
    strength: c.strength,
    reason: c.reason,
    evidenceType: c.evidenceType,
    confidence: c.confidence,
    sourceUrl: c.sourceUrl,
  })
  characteristicsByCourse.set(c.courseId, list)
}

/**
 * The longest published yardage per course, used to locate the disputed tee for
 * `suppress_rating_slope_and_back_yardage`. Derived from the data rather than
 * matched on a tee name, so the gate does not depend on a course happening to
 * call its longest tee "Back".
 */
const longestYardageByCourse = new Map<string, number>()
for (const t of rawTeeSets) {
  if (!t.courseId || t.totalYardage === null) continue
  const current = longestYardageByCourse.get(t.courseId)
  if (current === undefined || t.totalYardage > current) {
    longestYardageByCourse.set(t.courseId, t.totalYardage)
  }
}

const teeSetsByCourse = new Map<string, TeeSet[]>()
for (const t of rawTeeSets) {
  if (!t.courseId || !t.teeName) continue
  const gate = teeGateByCourse.get(t.courseId) ?? "full"
  // Lost Pines publishes a course-level summary only; its tee rows never surface.
  if (gate === "summary_only") continue
  const disputedLongest = gate === "suppress_rating_slope_and_back_yardage"
  // The disputed row's yardage is its only substantive value, so the row is
  // dropped rather than published blank — a blank longest tee would read as
  // "we have this tee and it has no length" instead of "the length is contested".
  if (disputedLongest && t.totalYardage !== null && t.totalYardage === longestYardageByCourse.get(t.courseId)) {
    continue
  }
  const suppressRatings = gate === "suppress_rating_slope" || disputedLongest
  const list = teeSetsByCourse.get(t.courseId) ?? []
  list.push({
    teeName: t.teeName,
    audienceRating: t.audienceRating,
    totalYardage: t.totalYardage,
    par: t.par,
    courseRating: suppressRatings ? null : t.courseRating,
    slopeRating: suppressRatings ? null : t.slopeRating,
    sourceUrl: t.sourceUrl,
  })
  teeSetsByCourse.set(t.courseId, list)
}

const featuresByCourse = new Map<string, VerifiedFeature[]>()
for (const f of rawVerifiedFeatures) {
  // Only "verified" rows may back a factual claim in the UI.
  if (!f.courseId || !f.feature || !f.value || f.verification !== "verified") continue
  const list = featuresByCourse.get(f.courseId) ?? []
  list.push({
    feature: f.feature,
    value: f.value,
    notes: f.notes,
    sourceUrl: f.sourceUrl,
  })
  featuresByCourse.set(f.courseId, list)
}

const courseRows = rawEntities.filter(
  (e) => e.entityType === "Course" && e.status === "active",
)
const propertyRows = rawEntities.filter(
  (e) => e.entityType === "Property" && e.status === "active",
)

export const courses: Course[] = courseRows.map((e) => ({
  kind: "course",
  id: e.entityId as string,
  propertyId: e.propertyId,
  name: e.name as string,
  shortName: e.shortName,
  slug: e.slug as string,
  holes: e.holes,
  courseFormat: e.courseFormat,
  operatingContext: e.operatingContext,
  accessType: e.accessType,
  accessProfile: toAccessProfile(e.pageAccessProfile, e.entityId as string),
  marketZone: e.marketZone as string,
  area: e.area as string,
  city: e.city as string,
  // Every prototype course carries a verified point; Palmer Lakeside deliberately
  // holds its own coordinates instead of inheriting the Barton Creek campus (§9).
  lat: e.latitude as number,
  lng: e.longitude as number,
  geoNote: e.geoNote,
  par: e.par,
  architect: e.architectDisplay,
  // Withheld where the course-level maximum IS the disputed longest-tee figure.
  // This is the single most important line of that gate: every downstream surface
  // (glance facts, tee summary fallback, Guide facts) reads maxYardage, so
  // suppressing it here closes all of them at once instead of per component.
  maxYardage:
    (teeGateByCourse.get(e.entityId as string) ?? "full") === "suppress_rating_slope_and_back_yardage"
      ? null
      : e.maxPublishedYardage,
  walkingPolicy: e.walkingPolicy,
  sourceUrl: e.sourceUrl,
  recommendations: recsByCourse.get(e.entityId as string) ?? [],
  features: featuresByCourse.get(e.entityId as string) ?? [],
  characteristics: characteristicsByCourse.get(e.entityId as string) ?? [],
  teeSets: teeSetsByCourse.get(e.entityId as string) ?? [],
  teeDisplayGate: teeGateByCourse.get(e.entityId as string) ?? "full",
}))

export const properties: Property[] = propertyRows.map((e) => ({
  kind: "property",
  id: e.entityId as string,
  name: e.name as string,
  shortName: e.shortName,
  slug: e.slug as string,
  operatingContext: e.operatingContext,
  accessType: e.accessType,
  accessProfile: toAccessProfile(e.pageAccessProfile, e.entityId as string),
  marketZone: e.marketZone as string,
  area: e.area as string,
  city: e.city as string,
  lat: e.latitude as number,
  lng: e.longitude as number,
  geoNote: e.geoNote,
  sourceUrl: e.sourceUrl,
  courses: courses.filter((c) => c.propertyId === e.entityId),
}))

export const courseById = new Map(courses.map((c) => [c.id, c]))
export const courseBySlug = new Map(courses.map((c) => [c.slug, c]))
export const propertyById = new Map(properties.map((p) => [p.id, p]))
export const propertyBySlug = new Map(properties.map((p) => [p.slug, p]))

/**
 * Property language, derived rather than assumed.
 *
 * Until Batch 1 the only projected property was Barton Creek, so "Resort
 * property", "the main resort campus" and "with lodging on site" were hardcoded
 * across the Property Page, cards, search and Finder. Clay/Kizer is a city-run
 * municipal complex, which made every one of those a false claim — including an
 * invented on-site hotel and a guest-access requirement on open public golf.
 *
 * `isResort` reads the master's own `property_type`, so a property only makes
 * resort claims when the source of truth says it is a resort.
 */
export const isResortProperty = (p: Property) =>
  (p.operatingContext ?? "").toLowerCase().includes("resort")

/** Eyebrow/label noun. Generic wording is correct for any multi-course site. */
export const propertyKindLabel = (p: Property) =>
  isResortProperty(p) ? "Resort property" : "Multi-course property"

export const getCourse = (slug: string) => courseBySlug.get(slug)
export const getProperty = (slug: string) => propertyBySlug.get(slug)
export const getParentProperty = (course: Course) =>
  course.propertyId ? propertyById.get(course.propertyId) : undefined

/* ------------------------------------------------------- classifications */

export type ClassificationMeta = {
  id: string
  label: string
  /** Short orientation for the discovery state header. Describes the intent, not course facts. */
  orientation: string
  /** Whether the prototype supports a working pathway for this intent. */
  functioning: boolean
  /** Shown when not functioning, so the omission reads as discipline rather than a bug. */
  pendingReason?: string
  /** Featured as a primary pathway in Find the Right Round (§5.3, Gen2 §5). */
  featured: boolean
  /** Geography is the leading signal rather than editorial fit. */
  geographyFirst?: boolean
}

/**
 * Gen2 §5 — the six locked Find the Right Round pathways, carrying equal weight.
 *
 * `Hill Country Experience` and `Practice Destination` remain valid internal
 * classifications and still drive Quick Paths and orientation counts; they just
 * do not occupy the primary decision interface. `Beginner Friendly` is absent
 * entirely: methodology is an internal product condition, never consumer copy
 * (Gen2 §4).
 */
export const PRIMARY_PATHWAYS = [
  "Distinctly Austin",
  "Serious Golf",
  "Great for Groups",
  "Quick Round",
  "Worth the Drive",
  "Golf Trip / Stay & Play",
] as const

/**
 * Gen2 §2 — `Recommended` is only meaningful where AustinGolf has evidence-backed
 * recommendation reasoning for the state the golfer is actually in. There is no
 * universal AustinGolf course ranking, so neutral Explore All must not imply one.
 */
export function supportsRecommendedOrder(intent: string | null): boolean {
  return !!intent && classificationById.has(intent)
}

const classificationsInData = Array.from(
  new Set(
    rawRecommendations
      .filter((r) => !r.excluded && !isExcluded(r.classification))
      .map((r) => r.classification as string),
  ),
)

const CLASSIFICATION_ORIENTATION: Record<string, string> = {
  "Great for Groups":
    "Courses and resort properties that absorb an outing without turning the day into logistics.",
  "Serious Golf":
    "Enough golf course to hold a strong player's attention.",
  "Distinctly Austin":
    "Rounds that could not be transplanted anywhere else.",
  "Worth the Drive":
    "Far enough out to be a decision, different enough to justify it.",
  "Hill Country Experience":
    "Terrain and landscape doing the work west of the city.",
  "Practice Destination":
    "Places where the range is a reason to go, not an afterthought.",
  "Quick Round":
    "Golf that fits in the time you actually have.",
  "Golf Trip / Stay & Play":
    "Golf bundled with somewhere to stay.",
}

/** Order used for presentation in Find the Right Round (the six locked pathways first). */
const CLASSIFICATION_ORDER = [
  ...PRIMARY_PATHWAYS,
  "Hill Country Experience",
  "Practice Destination",
] as readonly string[]

export const classifications: ClassificationMeta[] = classificationsInData
  .map((id) => ({
    id,
    label: id,
    orientation: CLASSIFICATION_ORIENTATION[id] ?? "",
    functioning: true,
    featured: (PRIMARY_PATHWAYS as readonly string[]).includes(id),
  }))
  .sort((a, b) => {
    const ai = CLASSIFICATION_ORDER.indexOf(a.id)
    const bi = CLASSIFICATION_ORDER.indexOf(b.id)
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi)
  })

export const classificationById = new Map(classifications.map((c) => [c.id, c]))

/** The six locked pathways, in presentation order, dataset-backed only. */
export const primaryPathways: ClassificationMeta[] = PRIMARY_PATHWAYS.map((id) =>
  classificationById.get(id),
).filter((c): c is ClassificationMeta => !!c)

/* --------------------------------------------------------- quick  paths */

export type QuickPath = {
  id: string
  label: string
  orientation: string
  geographyFirst?: boolean
}

/**
 * Quick Paths are high-confidence shortcuts, not promotional tiles.
 * `Under $100` is deliberately absent: pricing coverage is incomplete (§5.2).
 */
export const quickPaths: QuickPath[] = [
  {
    id: "near-downtown",
    label: "Near Downtown",
    orientation: "Courses inside the Austin core, closest first.",
    geographyFirst: true,
  },
  {
    id: "austin-munis",
    label: "Austin Munis",
    orientation: "City and municipal golf around the metro.",
  },
  {
    id: "hill-country",
    label: "Hill Country Golf",
    orientation: "Terrain and landscape doing the work west of the city.",
  },
  {
    id: "resort-golf",
    label: "Resort Golf",
    orientation: "Golf attached to a resort stay.",
  },
]

export const quickPathById = new Map(quickPaths.map((q) => [q.id, q]))

/** Membership test for each Quick Path, derived from real fields only. */
export function matchesQuickPath(pathId: string, c: Course): boolean {
  switch (pathId) {
    case "near-downtown":
      return c.marketZone === "Austin Core"
    case "austin-munis":
      return (c.operatingContext ?? "").toLowerCase().includes("municipal")
    case "hill-country":
      return c.recommendations.some((r) => r.classification === "Hill Country Experience")
    case "resort-golf":
      return c.accessProfile === "resort"
    default:
      return false
  }
}

/* ------------------------------------------------------------- geography */

/** Downtown Austin reference point, used for geography-first ordering. */
export const DOWNTOWN = { lat: 30.2672, lng: -97.7431 }

export function distanceMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 3958.8
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Areas grouped by market zone, for the Area filter. */
export function areaGroups() {
  const zones = new Map<string, string[]>()
  for (const c of courses) {
    const list = zones.get(c.marketZone) ?? []
    if (!list.includes(c.area)) list.push(c.area)
    zones.set(c.marketZone, list)
  }
  for (const list of zones.values()) list.sort()
  // Austin Core first, then Greater Austin.
  return Array.from(zones.entries()).sort(([a], [b]) =>
    a === "Austin Core" ? -1 : b === "Austin Core" ? 1 : a.localeCompare(b),
  )
}

/* ------------------------------------------- consumer geography (Gen2 §6) */

/**
 * Gen2 §6 — a presentation abstraction over the detailed dataset geography.
 *
 * The dataset's area labels are correct structured data but they are database
 * taxonomy, not a way for someone unfamiliar with Austin to understand where
 * golf is. Each consumer region therefore *expands into* its underlying dataset
 * area labels and filters through the existing Area category (OR within a
 * category), so the detailed geography is never overwritten or lost.
 *
 * The eleven regions are the approved "Metro & Travel Corridors" model: they
 * describe WHERE a course is, in the words a local would use ("out at Lake
 * Travis", "up in Georgetown", "the Highland Lakes"). Access (public vs
 * resort vs private) and experience (resort, Hill Country) are deliberately
 * NOT geography — those live in Collections. So `barton-creek` is a place
 * (the campus, west of the city), while the resort *experience* is the Resort
 * Golf collection; the retired "Resort Corridor" name conflated the two.
 *
 * Two membership rules make the model honest:
 *  - A region expands only into dataset area labels that actually exist, so it
 *    can never over-claim (`consumerRegions` filters against real data).
 *  - Every publicly playable course's area label maps to exactly one region,
 *    so all 41 are geographically accounted for. The one deliberately UNMAPPED
 *    label is "West Austin / Lake Austin" — Austin Country Club, the sole
 *    private course. Geography could place it, but per policy a private course
 *    is not surfaced or counted on playable discovery yet, so leaving its label
 *    unmapped keeps it off consumer Area surfaces with zero special-casing.
 *    Private-course informational discovery is handled separately.
 *
 * Palmer Lakeside stays in its own western area (Lake Travis & Bee Cave)
 * because that is where it physically is — the same reason it holds its own map
 * point rather than a campus point (§9).
 */
export type ConsumerRegion = {
  id: string
  label: string
  /** What a newcomer needs to know about golf here. Derived from real inventory. */
  blurb: string
  /** Dataset area labels rolled up into this region. */
  areas: string[]
}

/*
 * Approved "Metro & Travel Corridors" model — eleven regions, Austin-core first
 * then outward by direction. Order here sets the hub/landing presentation order.
 * Every blurb states direction, place names and verified inventory only — no
 * drive-time, terrain-quality, tourism or neighbourhood claim the data lacks.
 * Canonical slugs are long-term (no legacy names retained); superseded routes
 * redirect at the framework layer.
 */
const CONSUMER_REGION_DEFS: Omit<ConsumerRegion, "areas">[] = [
  {
    id: "central-austin",
    // Proximity to downtown is computed and real; the munis here are a fact.
    label: "Central Austin",
    blurb: "The closest golf to downtown, including the city's municipal courses.",
  },
  {
    id: "east-northeast",
    label: "East & Northeast Austin",
    blurb: "The metro's deepest run of open-access golf, east and northeast of the core.",
  },
  {
    id: "north-austin-cedar-park",
    label: "North Austin & Cedar Park",
    blurb: "Suburban daily-fee golf north through Cedar Park and Leander.",
  },
  {
    // Grey Rock alone here; the region states direction and nothing more — no
    // terrain or view claim. Kept as a legitimate geography, not merged for size.
    id: "southwest-austin",
    label: "Southwest Austin",
    blurb: "Golf south and southwest of central Austin.",
  },
  {
    // A place (the resort campus, west of the city), not the "resort" experience
    // — that is the Resort Golf collection. Replaces the retired "Resort Corridor".
    // The count of regulation courses under one resort is a verified fact.
    id: "barton-creek",
    label: "Barton Creek",
    blurb: "Several regulation courses on one resort campus, west of the city.",
  },
  {
    // The nearer western/lake geography. Replaces "West Austin & Hill Country";
    // the true Hill Country destinations are now their own regions, so this
    // label no longer over-claims terrain it does not universally hold.
    id: "lake-travis-bee-cave",
    label: "Lake Travis & Bee Cave",
    blurb: "Golf west toward Bee Cave and out along Lake Travis.",
  },
  {
    id: "round-rock-georgetown",
    label: "Round Rock & Georgetown",
    blurb: "Established suburban clubs north through Round Rock and Georgetown.",
  },
  {
    id: "kyle-san-marcos",
    label: "Kyle & San Marcos",
    blurb: "Golf south of the city in Kyle and San Marcos.",
  },
  {
    id: "bastrop-lost-pines",
    label: "Bastrop & Lost Pines",
    blurb: "Golf east of the city around Bastrop and the Lost Pines.",
  },
  {
    // "Destination" is supported by the dataset market zone (Hill Country /
    // Destination); towns are facts. No distance or quality claim.
    id: "highland-lakes",
    label: "Highland Lakes",
    blurb: "Golf northwest in the Highland Lakes, around Marble Falls, Kingsland and Horseshoe Bay.",
  },
  {
    id: "hill-country-blanco-wimberley",
    label: "Hill Country — Blanco & Wimberley",
    blurb: "Golf southwest into the Hill Country, around Blanco and Wimberley.",
  },
]

/*
 * Each dataset area label maps to exactly one region. All 26 labels held by the
 * 41 publicly playable courses are covered; the only unmapped label is
 * "West Austin / Lake Austin" (Austin Country Club, private — see the module
 * doc comment above). `consumerRegions` further filters to labels that exist in
 * data, so a mapped-but-absent label can never make a region over-claim.
 */
const REGION_AREA_MAP: Record<string, string[]> = {
  "central-austin": ["Central Austin", "Central / West-Central Austin"],
  "east-northeast": [
    "East Austin",
    "Southeast Austin",
    // Riverside's area label is the union of two areas already mapped here, and
    // it sits between existing members, so the region's claim stays true.
    "East / Southeast Austin",
    "Hutto / Northeast Metro",
    "Manor / East-Northeast",
    // Blackhawk (Pflugerville) — honestly NE metro, adjacent to Hutto/Manor.
    "Pflugerville / Northeast Austin",
  ],
  "north-austin-cedar-park": ["North / Northwest Austin", "Cedar Park / Leander"],
  "southwest-austin": ["Southwest Austin"],
  "barton-creek": ["West Austin / Barton Creek"],
  "lake-travis-bee-cave": [
    "West Austin / Bee Cave",
    "Spicewood / Lake Travis",
    "Lago Vista / North Lake Travis",
    "Spicewood / Pedernales",
  ],
  "round-rock-georgetown": ["Round Rock", "Georgetown"],
  "kyle-san-marcos": ["Kyle / San Marcos"],
  "bastrop-lost-pines": ["Bastrop / Lost Pines"],
  "highland-lakes": [
    "Highland Lakes / Horseshoe Bay",
    "Highland Lakes / Kingsland",
    "Burnet",
    "Marble Falls / Meadowlakes",
  ],
  "hill-country-blanco-wimberley": [
    "Blanco / Central Hill Country",
    "Driftwood / Wimberley",
  ],
}

export const consumerRegions: ConsumerRegion[] = CONSUMER_REGION_DEFS.map((r) => ({
  ...r,
  // Only areas that actually exist in the dataset, so a region never over-claims.
  areas: (REGION_AREA_MAP[r.id] ?? []).filter((a) =>
    courses.some((c) => c.area === a),
  ),
}))

export const regionCourses = (r: ConsumerRegion) =>
  courses.filter((c) => r.areas.includes(c.area))

/** Region link routes through the real Area filter, preserving detailed geography. */
export function regionHref(r: ConsumerRegion) {
  const p = new URLSearchParams()
  for (const a of r.areas) p.append("area", a)
  return `/courses/explore?${p.toString()}`
}

/**
 * Projection used by the landing geography module (Gen2 §16).
 *
 * Positions come from the same verified coordinates the Finder map uses, padded
 * so nothing sits on the edge. Deriving them rather than hand-placing labels is
 * what lets the module answer "where is the golf relative to Austin?" truthfully
 * — including keeping Palmer Lakeside out west where it actually is.
 */
const GEO_PAD = 0.09
const geoPoints = [...courses, DOWNTOWN as { lat: number; lng: number }]
const latMin = Math.min(...geoPoints.map((p) => p.lat))
const latMax = Math.max(...geoPoints.map((p) => p.lat))
const lngMin = Math.min(...geoPoints.map((p) => p.lng))
const lngMax = Math.max(...geoPoints.map((p) => p.lng))

/** Lat/lng to percentage coordinates within the schematic panel. */
export function projectToPanel(p: { lat: number; lng: number }) {
  const span = (min: number, max: number) => (max - min === 0 ? 1 : max - min)
  const fx = (p.lng - lngMin) / span(lngMin, lngMax)
  // Latitude is inverted: north is up.
  const fy = 1 - (p.lat - latMin) / span(latMin, latMax)
  return {
    x: (GEO_PAD + fx * (1 - GEO_PAD * 2)) * 100,
    y: (GEO_PAD + fy * (1 - GEO_PAD * 2)) * 100,
  }
}

/** Mean position of a region's courses, used to anchor its label. */
export function regionCentroid(r: ConsumerRegion) {
  const list = regionCourses(r)
  if (!list.length) return projectToPanel(DOWNTOWN)
  return projectToPanel({
    lat: list.reduce((s, c) => s + c.lat, 0) / list.length,
    lng: list.reduce((s, c) => s + c.lng, 0) / list.length,
  })
}

/* ------------------------------------------------- presentation helpers */

/** "1 course" / "6 courses". Small counts are common in a 15-course prototype. */
export const courseCountLabel = (n: number) =>
  `${n} ${n === 1 ? "course" : "courses"}`

/** Quiet factual orientation line: "East Austin · Open Public". */
export function geographyAccessLine(e: Entity) {
  const parts = [e.area]
  if (e.accessType) parts.push(e.accessType)
  return parts.join(" · ")
}

/** "Roy Bechtol; Randy Russell" reads as data; "and" reads as a sentence. */
function formatArchitect(s: string) {
  const parts = s
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length <= 1) return parts[0] ?? s
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`
}

/**
 * Neutral orientation for a card with no active editorial intent.
 *
 * Returns `null` when the dataset holds no *differentiating* fact. That matters:
 * 17 of 18 courses are 18-hole Regulation, so the previous
 * "{operatingContext} golf, {holes} holes." formula printed a near-identical
 * sentence on nearly every card while also restating the access line directly
 * above it. Ordered most- to least-distinguishing, and deliberately silent
 * rather than filler when nothing separates this course from its neighbours.
 */
export function neutralOrientation(c: Course): string | null {
  if (c.courseFormat === "Pitch & Putt" && c.holes) {
    return `${c.holes}-hole pitch & putt in ${c.city}.`
  }
  if (c.holes && c.holes !== 18) {
    return `${c.holes}-hole course in ${c.city}.`
  }
  // Attribution, not praise. A verified field, and the most differentiating
  // one available on a neutral card.
  if (c.architect) {
    return `Designed by ${formatArchitect(c.architect)}.`
  }
  // Civic ownership is not derivable from "Open Public", so it still adds.
  if (/municipal/i.test(c.operatingContext ?? "")) {
    return `City-run municipal course in ${c.city}.`
  }
  return null
}

/**
 * Access alone, dropping area. Used in the map tray: the pin already answers
 * "where", but access type is not derivable from a pin.
 */
export const accessOnlyLine = (e: Entity) => e.accessType

/**
 * Consumer-facing map-precision caveat.
 *
 * The dataset's `geo_note` field is internal geocoding provenance ("inherits
 * verified property point", "do not inherit parent point") and §14 forbids
 * exposing internal evidence notes as consumer UI. So instead of printing it,
 * this derives the one fact a golfer actually needs: whether this course's pin
 * is shared with another course rather than being its own surveyed point.
 */
export function sharedPointNote(c: Course): string | null {
  const others = courses.filter(
    (o) => o.id !== c.id && o.lat === c.lat && o.lng === c.lng,
  )
  if (!others.length) return null
  const names = others.map((o) => o.shortName ?? o.name)
  const list =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
  return `Mapped at the same point as ${list}. Use the course website for exact directions.`
}

/** True where the round format is itself the notable fact (§8). */
export function isExceptionalFormat(c: Course) {
  return c.courseFormat === "Pitch & Putt" || (c.holes !== null && c.holes !== 18)
}

export function exceptionalFormatLabel(c: Course) {
  if (!isExceptionalFormat(c)) return null
  if (c.holes && c.courseFormat) return `${c.holes}-hole ${c.courseFormat}`
  return c.courseFormat ?? (c.holes ? `${c.holes} holes` : null)
}

/**
 * The recommendation to show for a given intent — strictly that intent's own
 * reasoning, never a substitute from another classification.
 *
 * Returns `null` when the dataset has no reason for this course under this
 * intent. Callers then fall back to neutral orientation, so an unmatched course
 * orients rather than borrowing editorial language it did not earn.
 */
export function reasonForIntent(
  c: Course,
  intent: string | null,
): Recommendation | null {
  if (intent) {
    const exact = c.recommendations.filter((r) => r.classification === intent)
    if (exact.length) return rankReasons(exact)[0]
  }
  return null
}

const STRENGTH_RANK: Record<string, number> = { strong: 2, moderate: 1 }
const CONFIDENCE_RANK: Record<string, number> = { high: 2, medium: 1 }
const TIER_RANK: Record<string, number> = {
  primary_candidate: 3,
  secondary_candidate: 2,
  supporting_candidate: 1,
}

/** Internal editorial weight. Never rendered as a score (§7.3, §15). */
export function reasonWeight(r: Recommendation) {
  return (
    (STRENGTH_RANK[r.strength ?? ""] ?? 0) * 100 +
    (CONFIDENCE_RANK[r.confidence ?? ""] ?? 0) * 10 +
    (TIER_RANK[r.displayTier ?? ""] ?? 0)
  )
}

export function rankReasons(list: Recommendation[]) {
  return [...list].sort((a, b) => reasonWeight(b) - reasonWeight(a))
}

/*
 * There is deliberately no `strongestReason(course)` helper.
 *
 * Gen2 §3: a course's rationale must answer the decision the golfer actually
 * arrived with. Selecting the highest-weighted reason regardless of context is
 * exactly what let a direct visit to Falconhead argue for Great for Groups.
 * Contextual reasoning goes through `reasonForIntent(course, intent)` instead,
 * and the absence of this helper keeps that defect from returning.
 */

/* ------------------------------------------------ Austin Golf at a Glance */

/** Orientation counts, all derived from the dataset (§5.4). */
export function glanceGroups() {
  const munis = courses.filter((c) =>
    (c.operatingContext ?? "").toLowerCase().includes("municipal"),
  )
  const dailyFee = courses.filter((c) => c.operatingContext === "Daily Fee")
  const hillCountry = courses.filter((c) =>
    c.recommendations.some((r) => r.classification === "Hill Country Experience"),
  )
  const resort = courses.filter((c) => c.accessProfile === "resort")
  // Counted by the master's own editorial `Quick Round` classification, which is
  // also what this tile links to — so the number always equals what the golfer
  // finds on arrival. Matching on `holes !== 18` instead would make the app decide
  // what "casual" means, and would misfile any non-18 course the editors did not
  // classify that way.
  const shortForm = courses.filter((c) =>
    c.recommendations.some((r) => r.classification === "Quick Round"),
  )

  return [
    {
      label: "Austin Munis",
      count: munis.length,
      // The dataset carries no green-fee or pricing field, so "the cheapest way
      // into it" was an unsupported price claim. Operating context is verified.
      blurb:
        "City-run golf, the civic layer of Austin's game and its most public front door.",
      href: "/courses/explore?path=austin-munis",
      // Cross-link provenance: which canonical destination this row maps to. The
      // Explorer `href` above stays the fallback; the consumer resolves a
      // Collection from this and prefers it when one exists. `access` rows have
      // no editorial Collection and remain on the Finder.
      source: { kind: "path", id: "austin-munis" } as const,
    },
    {
      label: "Daily-Fee Golf",
      count: dailyFee.length,
      // "book and play" implied booking capability and immediate availability we
      // hold no data for. `access_type: Open Public` is verified; tee sheets are not.
      blurb:
        "The bulk of the metro. Clubs open to the public without a membership.",
      href: "/courses/explore?access=public",
      // Structured access category, not a locked editorial Collection (task §3):
      // stays on the Explorer.
      source: { kind: "access" } as const,
    },
    {
      label: "Hill Country Golf",
      count: hillCountry.length,
      blurb:
        "West of the city the land changes. Elevation, limestone and live oak.",
      href: "/courses/explore?path=hill-country",
      source: { kind: "intent", classification: "Hill Country Experience" } as const,
    },
    {
      label: "Resort Golf",
      count: resort.length,
      blurb: "Golf tied to a stay, concentrated almost entirely at Barton Creek.",
      href: "/courses/explore?path=resort-golf",
      source: { kind: "path", id: "resort-golf" } as const,
    },
    {
      label: "Short & Casual Golf",
      count: shortForm.length,
      blurb: "Lower-commitment rounds for when the day will not hold eighteen.",
      href: "/courses/explore?intent=Quick+Round",
      source: { kind: "intent", classification: "Quick Round" } as const,
    },
  ]
}
