/**
 * Generates lib/data/dataset.generated.ts from the AUTHORITATIVE master database.
 * Run: node scripts/generate-data.mjs
 *
 * Source of truth
 * ---------------
 * AustinGolf_COURSES_Master_Database_v1.9.xlsx is the single source of production
 * facts. v1.9 supersedes v1.8, which in turn superseded the v1.7 provenance
 * recorded inside the older prototype workbook, which was itself only ever a
 * curated product-development projection.
 *
 * v1.9 differs from v1.8 by exactly one authoritative cell: Master_Properties
 * prp_0003 gains the slug `clay-kizer-golf-complex`. That slug is read from the
 * master rather than derived here — a production identifier invented by the app
 * would be a fact the source of truth never asserted.
 *
 * This script is the ONLY place dataset values enter the app. Nothing is
 * transcribed by hand, so the prototype cannot drift from the source of truth.
 *
 * What a "projection" is here
 * --------------------------
 * v1.9 holds 52 properties / 65 courses. The prototype deliberately renders a
 * curated subset chosen to exercise specific product journeys. That curation is
 * expressed as an explicit allow-list (PROJECTION below) rather than as a second
 * copy of the data: every fact is still read from v1.9 at generation time, so the
 * projection is reproducible and traceable back to the master.
 *
 * The allow-list is deliberately kept explicit rather than replaced by a rule
 * such as "every active Austin Core public course". A rule would silently admit
 * future master rows into production on any edit to the workbook; an allow-list
 * makes each addition a reviewed decision.
 *
 * Every transformation applied on the way out is documented at its call site.
 */
import { read, utils } from "xlsx"
import fs from "node:fs"
import path from "node:path"

const SRC = "data/AustinGolf_COURSES_Master_Database_v1.9-bb805b.xlsx"
const OUT = "lib/data/dataset.generated.ts"

/**
 * Legacy curated feature subset.
 *
 * v1.9's authoritative feature table is `Course_Features_v1`, whose vocabulary
 * ("Driving Range", "Golf Lessons", …) differs from the curated names the Finder
 * currently filters on ("Practice Facility", "Rental Clubs"). Swapping the source
 * in this run would silently change Finder filter results, which Run 1 forbids.
 * So features intentionally remain on the older curated projection until they are
 * migrated deliberately, with the filter vocabulary, in a later run.
 */
const SRC_LEGACY_FEATURES = "data/AustinGolf_COURSES_Prototype_Dataset_v0.1-c4fe13.xlsx"

/**
 * The curated projection scope, with the reason each course is present.
 *
 * `role` is projection metadata (why this course is in the prototype), not a
 * production fact — it never reaches the consumer UI.
 */
const PROJECTION = {
  // Batch 1 completes the ten active playable Austin Core courses, so the
  // municipal heart of the market is represented in full rather than sampled.
  crs_0001: "Municipal baseline; Distinctly Austin civic identity",
  crs_0002: "Municipal; rolling/urban-skyline characteristics",
  crs_0003: "Austin Core (Batch 1); municipal 18 on the shared Clay/Kizer complex point",
  crs_0004: "Municipal; shared Clay/Kizer complex point",
  crs_0005: "Austin Core (Batch 1); 4-hole short course — thinnest-facts regression",
  crs_0006: "Austin Core (Batch 1); first municipal with verified booking + walking policy",
  crs_0007: "Austin Core (Batch 1); 9-hole regulation, oldest course in the projection",
  crs_0008: "Exceptional format regression — 9-hole Pitch & Putt",
  crs_0009: "Austin Core (Batch 1); 9-hole short-form golf campus",
  crs_0010: "Austin Core (Batch 1); Tee Level D regression — disputed back-tee yardage suppressed",
  crs_0011: "Public baseline; Tee Level A (full verified tee table)",
  crs_0012: "Tee Level B regression — rating/slope suppressed by QA rule",
  crs_0013: "Public; first-party scorecard closure",
  crs_0014: "Public daily-fee",
  crs_0015: "Public daily-fee",
  crs_0016: "Public; provenance-qualified scorecard",
  crs_0017: "Public; rich characteristics coverage",
  crs_0029: "Resort; multi-course property sibling",
  crs_0030: "Resort + rich recommendation intelligence; sparse core facts",
  crs_0031: "Resort; multi-course property sibling",
  crs_0032: "Property-affiliated but geographically separate (course-level override)",
  crs_0019: "Conditional / semi-private access regression",
  crs_0037: "Private / member-guest access regression",
  crs_0028: "Tee Level C regression — verified summary yardage only",
}

const wb = read(fs.readFileSync(SRC), { cellDates: true })
const sheet = (name) => {
  if (!wb.Sheets[name]) throw new Error(`[generate-data] Missing sheet "${name}" in ${SRC}`)
  return utils.sheet_to_json(wb.Sheets[name], { defval: null })
}

const legacyWb = read(fs.readFileSync(SRC_LEGACY_FEATURES), { cellDates: true })

/** Empty / placeholder cells become null. Display layer renders null as "Unknown". */
const clean = (v) => {
  if (v === null || v === undefined) return null
  if (typeof v === "number") return v
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  const s = String(v).trim()
  if (s === "" || s === "-" || s === "—") return null
  return s
}
const num = (v) => {
  const c = clean(v)
  if (c === null) return null
  const n = typeof c === "number" ? c : Number(String(c).replace(/[^0-9.\-]/g, ""))
  return Number.isFinite(n) ? n : null
}

const masterCourses = sheet("Master_Courses")
const masterProperties = sheet("Master_Properties")

const courseById = new Map(masterCourses.map((c) => [clean(c.course_id), c]))
const propertyById = new Map(masterProperties.map((p) => [clean(p.property_id), p]))

const projectedIds = Object.keys(PROJECTION)
for (const id of projectedIds) {
  if (!courseById.has(id)) throw new Error(`[generate-data] Projected course ${id} is not in ${SRC}`)
}

/**
 * A Property is projected as its own browsable entity only when it parents more
 * than one projected course — that is the case where "which course?" is a real
 * question a golfer has to answer. Single-course properties stay implicit.
 */
const courseCountByProperty = new Map()
for (const id of projectedIds) {
  const pid = clean(courseById.get(id).property_id)
  courseCountByProperty.set(pid, (courseCountByProperty.get(pid) ?? 0) + 1)
}
const projectedPropertyIds = [...courseCountByProperty.entries()]
  .filter(([, n]) => n > 1)
  .map(([pid]) => pid)

/**
 * Course-level coordinates.
 *
 * v1.8 stores verified coordinates on the Property, and records a course-level
 * exception in `course_location_override` as a "lat, lng — provenance" string.
 * Palmer Lakeside depends on this: it belongs to the Barton Creek property but
 * sits ~19 miles away, so property membership must never imply co-location.
 */
const parseOverride = (raw) => {
  const s = clean(raw)
  if (s === null) return null
  const m = String(s).match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/)
  return m ? { lat: Number(m[1]), lng: Number(m[2]) } : null
}

/**
 * Internal geocoding provenance, never rendered (§14 forbids exposing evidence
 * notes as consumer UI — `sharedPointNote` derives the consumer-facing fact from
 * coordinates instead). Kept so the provenance of each point stays inspectable.
 */
const geoNoteFor = (course, override, siblingCount) => {
  if (override) return `verified separate course location (${clean(course.identity_qa)}); do not inherit parent point`
  if (siblingCount > 1) return "inherits shared property/campus point"
  return "inherits verified property point"
}

const courseEntities = projectedIds.map((id) => {
  const c = courseById.get(id)
  const p = propertyById.get(clean(c.property_id))
  if (!p) throw new Error(`[generate-data] Course ${id} references unknown property ${c.property_id}`)

  const override = parseOverride(c.course_location_override)
  const siblings = courseCountByProperty.get(clean(c.property_id)) ?? 1

  return {
    entityType: "Course",
    entityId: clean(c.course_id),
    propertyId: clean(c.property_id),
    name: clean(c.course_name),
    shortName: clean(c.course_short_name),
    slug: clean(c.slug),
    status: clean(c.course_status),
    holes: num(c.holes),
    courseFormat: clean(c.course_format),
    operatingContext: clean(c.operating_context),
    accessType: clean(c.access_type),
    pageAccessProfile: clean(c.page_access_profile),
    marketZone: clean(c.market_zone),
    area: clean(c.area),
    // A course at its own verified location names its own place; the property's
    // city would put Palmer Lakeside in "Austin" instead of Spicewood.
    city: override ? String(clean(c.area)).split("/")[0].trim() : clean(p.city),
    latitude: override ? override.lat : num(p.latitude),
    longitude: override ? override.lng : num(p.longitude),
    geoNote: geoNoteFor(c, override, siblings),
    par: num(c.par),
    architectDisplay: clean(c.architect_display),
    maxPublishedYardage: num(c.max_published_yardage),
    walkingPolicy: clean(c.walking_policy),
    sourceUrl: clean(c.source_url),
    prototypeRole: PROJECTION[id],
  }
})

const propertyEntities = projectedPropertyIds.map((pid) => {
  const p = propertyById.get(pid)
  return {
    entityType: "Property",
    entityId: clean(p.property_id),
    propertyId: null,
    name: clean(p.property_name),
    shortName: clean(p.property_short_name),
    slug: clean(p.slug),
    status: clean(p.property_status),
    holes: null,
    courseFormat: null,
    // Properties carry `property_type` / `access_context` rather than the
    // course-level equivalents; these are the authoritative property analogues.
    operatingContext: clean(p.property_type),
    accessType: clean(p.access_context),
    pageAccessProfile: clean(p.page_access_profile),
    marketZone: clean(p.market_zone),
    area: clean(p.area),
    city: clean(p.city),
    latitude: num(p.latitude),
    longitude: num(p.longitude),
    geoNote: String(clean(p.geo_verification) ?? "").replace(/_/g, " ") || null,
    par: null,
    architectDisplay: null,
    maxPublishedYardage: null,
    walkingPolicy: null,
    sourceUrl: clean(p.website_url),
    prototypeRole: `Property-level result; parent of ${courseCountByProperty.get(pid)} projected courses`,
  }
})

const entities = [...courseEntities, ...propertyEntities]

/**
 * Decision support.
 *
 * `Decision_Support_Normalized_v2` is the current normalized recommendation
 * layer; `canonical_classification` is the deduplicated classification and
 * `display_candidate_tier` the display eligibility. Only `core_editorial` rows
 * become browsable classifications — the derived geography/operational layers
 * exist for internal coverage analysis, not as consumer-facing badges.
 */
const recommendations = sheet("Decision_Support_Normalized_v2")
  .filter((r) => projectedIds.includes(clean(r.course_id)))
  .map((r) => ({
    courseId: clean(r.course_id),
    courseName: clean(r.course_name),
    classification: clean(r.canonical_classification),
    strength: clean(r.strength),
    confidence: clean(r.confidence),
    displayTier: clean(r.display_candidate_tier),
    whyItFits: clean(r.editorial_reason),
    classificationLayer: clean(r.classification_layer),
    excluded: clean(r.classification_layer) !== "core_editorial",
  }))

/**
 * Authoritative display ordering for courses with rich recommendation coverage.
 *
 * This is display metadata, not a new fact, and it is needed because editorial
 * weight cannot break its own ties: Fazio Canyons and Palmer Lakeside each hold
 * five reasons that are all strong/high/primary_candidate, so `reasonWeight`
 * scores them identically and the "top three" would be decided by row order.
 * `Rich_Coverage_UI_Priority_v1` is the editorial answer to exactly that.
 *
 * Consumed only by the Course Page reason selector. It is deliberately NOT wired
 * into Finder ranking, which keeps its approved ordering.
 */
const uiPriority = sheet("Rich_Coverage_UI_Priority_v1")
  .filter((r) => projectedIds.includes(clean(r.course_id)))
  .map((r) => ({
    courseId: clean(r.course_id),
    // Ordered most- to least-differentiating. Nulls are dropped so a short list
    // stays short rather than carrying empty slots into the UI.
    priority: [clean(r.priority_1), clean(r.priority_2), clean(r.priority_3)].filter(Boolean),
  }))

/** See SRC_LEGACY_FEATURES: deliberately unmigrated in Run 1. */
const verifiedFeatures = utils
  .sheet_to_json(legacyWb.Sheets["Verified_Features"], { defval: null })
  .filter((r) => projectedIds.includes(clean(r.course_id)))
  .map((r) => ({
    courseId: clean(r.course_id),
    courseName: clean(r.course_name),
    feature: clean(r.feature),
    value: clean(r.value),
    verification: clean(r.verification),
    notes: clean(r.notes),
    sourceUrl: clean(r.source_url),
  }))

/**
 * "What the golf is like" source data.
 *
 * Structured factual characteristics with their own evidence basis. Projected
 * as-is: no scores, rankings or editorial conclusions are synthesised here, and
 * no prose is rewritten — that would make this file a second source of truth.
 */
const courseCharacteristics = sheet("Course_Characteristics_v1")
  .filter((r) => projectedIds.includes(clean(r.course_id)))
  .map((r) => ({
    characterId: clean(r.character_id),
    courseId: clean(r.course_id),
    characteristic: clean(r.characteristic),
    strength: clean(r.strength),
    reason: clean(r.reason),
    evidenceBasis: clean(r.evidence_basis),
    evidenceType: clean(r.evidence_type),
    confidence: clean(r.confidence),
    verifiedAt: clean(r.verified_at),
    sourceUrl: clean(r.source_url),
  }))

/**
 * Tee sets.
 *
 * Grain is (course, tee_name, audience_rating). `audience_rating` is load-bearing:
 * the same tee legitimately carries different course/slope ratings for Men and
 * Women, so dropping it would turn a real second dimension into phantom duplicate
 * rows with conflicting numbers. Rows are never merged to manufacture completeness.
 */
const teeSets = sheet("Tee_Sets_v1")
  .filter((r) => projectedIds.includes(clean(r.course_id)))
  .map((r) => ({
    teeId: clean(r.tee_id),
    courseId: clean(r.course_id),
    teeName: clean(r.tee_name),
    audienceRating: clean(r.audience_rating),
    totalYardage: num(r.total_yardage),
    par: num(r.par),
    courseRating: num(r.course_rating),
    slopeRating: num(r.slope_rating),
    verifiedAt: clean(r.verified_at),
    sourceUrl: clean(r.source_url),
    sourceTier: clean(r.source_tier),
    verificationStatus: clean(r.verification_status),
    notes: clean(r.notes),
  }))

/**
 * Per-course publication gates for scorecard data.
 *
 * `Scorecard_QA_Closure_v1` is the later resolution pass and supersedes the
 * earlier `Tee_Set_QA_v1` findings. It is authoritative over raw row
 * completeness: a course can hold fully-populated rating/slope values that this
 * rule still forbids publishing (Avery Ranch), or an earlier "incomplete" finding
 * that this pass has since cleared (Kissing Tree).
 */

/**
 * The authoritative rules are editorial prose, so they are translated here into
 * one machine-readable gate. The mapping is exhaustive and throws on anything it
 * does not recognise: a new or reworded rule must be read by a human and given
 * explicit handling rather than silently degrading to "publish everything", which
 * is how a suppressed rating reaches the UI as a fact.
 *
 *   full                  — publish the tee table as verified.
 *   suppress_rating_slope — publish tee/yardage/par only; rating and slope are
 *                           withheld pending first-party confirmation.
 *   summary_only          — publish no tee table; only the course-level summary.
 *   suppress_rating_slope_and_back_yardage
 *                         — as suppress_rating_slope, and additionally withhold
 *                           the longest tee entirely plus the course-level max
 *                           yardage derived from it. Used where sources disagree
 *                           on a course's back-tee length: the disputed figure is
 *                           both the tee row's only substantive value and the
 *                           course's headline yardage, so publishing either would
 *                           assert a number the master does not stand behind.
 *                           Shorter tees are untouched — the dispute is scoped to
 *                           the longest tee, so suppressing them would discard
 *                           publishable facts.
 */
const TEE_DISPLAY_RULES = [
  { match: /^publish current first-party values\.?$/i, gate: "full" },
  { match: /^publish direct scorecard values\.?$/i, gate: "full" },
  { match: /^publish with provenance\.?$/i, gate: "full" },
  { match: /do not publish disputed rating\/slope\/precise back yardage/i, gate: "suppress_rating_slope_and_back_yardage" },
  { match: /suppress rating\/slope/i, gate: "suppress_rating_slope" },
  { match: /^publish par\/yardage summary only\.?$/i, gate: "summary_only" },
]

const teeDisplayGate = (rule, courseId) => {
  const hit = TEE_DISPLAY_RULES.find((r) => r.match.test(rule))
  if (!hit) {
    throw new Error(
      `[generate-data] Unrecognised public_ui_rule on ${courseId}: "${rule}". ` +
        `Add explicit handling to TEE_DISPLAY_RULES — refusing to default to publishing.`,
    )
  }
  return hit.gate
}

const scorecardRules = sheet("Scorecard_QA_Closure_v1")
  .filter((r) => projectedIds.includes(clean(r.course_id)))
  .map((r) => ({
    courseId: clean(r.course_id),
    courseName: clean(r.course_name),
    priorIssue: clean(r.prior_issue),
    readiness: clean(r.readiness_after_pass),
    publicUiRule: clean(r.public_ui_rule),
    teeDisplayGate: teeDisplayGate(clean(r.public_ui_rule), clean(r.course_id)),
    remainingAction: clean(r.remaining_action),
  }))

/** Locked access vocabulary, projected so the app can validate against it. */
const accessVocabulary = sheet("Controlled_Vocabularies_v1")
  .filter((r) => clean(r.vocabulary) === "page_access_profile")
  .map((r) => ({
    value: clean(r.value),
    definition: clean(r.definition),
    status: clean(r.status),
  }))

const journeyCoverage = utils
  .sheet_to_json(legacyWb.Sheets["Journey_Coverage"], { defval: null })
  .map((r) => ({
    journey: clean(r.journey),
    requiredBehavior: clean(r.required_behavior),
    result: clean(r.result),
    entities: clean(r.entities),
    finding: clean(r.finding),
  }))

const qaNotes = sheet("Audit_Findings").map((r) => ({
  item: clean(r.finding_id),
  status: clean(r.status),
  decision: clean(r["decision / implication"]) ?? clean(r.finding),
}))

const banner = `// GENERATED FILE — DO NOT EDIT BY HAND.
// Source of truth: ${SRC}
// Legacy curated features (unmigrated, see generator): ${SRC_LEGACY_FEATURES}
// Regenerate with: node scripts/generate-data.mjs
`

const nullable = (obj) =>
  JSON.stringify(obj, null, 2)
    .replace(/: ".*"/g, ": string | null")
    .replace(/: -?[\d.]+/g, ": number | null")
    .replace(/: (true|false)/g, ": boolean")
    .replace(/: null/g, ": string | null")

const body = `${banner}
export type RawEntity = ${nullable(entities[0])}

export const rawEntities = ${JSON.stringify(entities, null, 2)} as const

export const rawRecommendations = ${JSON.stringify(recommendations, null, 2)} as const

export const rawVerifiedFeatures = ${JSON.stringify(verifiedFeatures, null, 2)} as const

export const rawCourseCharacteristics = ${JSON.stringify(courseCharacteristics, null, 2)} as const

export const rawTeeSets = ${JSON.stringify(teeSets, null, 2)} as const

export const rawScorecardRules = ${JSON.stringify(scorecardRules, null, 2)} as const

/** Editorial display order for courses whose reasons tie on weight. */
export const rawUiPriority = ${JSON.stringify(uiPriority, null, 2)} as const

/** page_access_profile is LOCKED in v1.9. Used to validate, never to coerce. */
export const accessProfileVocabulary = ${JSON.stringify(accessVocabulary, null, 2)} as const

export const journeyCoverage = ${JSON.stringify(journeyCoverage, null, 2)} as const

export const qaNotes = ${JSON.stringify(qaNotes, null, 2)} as const
`

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, body)

const courseRows = entities.filter((e) => e.entityType === "Course")
console.log(
  `Wrote ${OUT}\n  entities: ${entities.length}` +
    `\n  courses: ${courseRows.length}` +
    `\n  properties: ${entities.filter((e) => e.entityType === "Property").length}` +
    `\n  recommendations: ${recommendations.length} (non-core excluded: ${recommendations.filter((r) => r.excluded).length})` +
    `\n  verifiedFeatures: ${verifiedFeatures.length} (legacy curated)` +
    `\n  characteristics: ${courseCharacteristics.length}` +
    `\n  teeSets: ${teeSets.length}` +
    `\n  scorecardRules: ${scorecardRules.length}`,
)
console.log("\naccessProfiles:", [...new Set(entities.map((e) => e.pageAccessProfile))])
console.log("accessTypes:", [...new Set(entities.map((e) => e.accessType))])
console.log("lockedVocabulary:", accessVocabulary.map((v) => v.value))
console.log("areas:", [...new Set(courseRows.map((e) => e.area))])
console.log("geoMissing:", courseRows.filter((e) => e.latitude === null).map((e) => e.name))
console.log(
  "coursesWithoutRecommendations:",
  courseRows.filter((e) => !recommendations.some((r) => r.courseId === e.entityId && !r.excluded)).map((e) => e.name),
)
