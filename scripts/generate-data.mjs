/**
 * Generates lib/data/dataset.generated.ts from the AUTHORITATIVE master database.
 * Run: node scripts/generate-data.mjs
 *
 * Source of truth
 * ---------------
 * AustinGolf_COURSES_Master_Database_v1.12.xlsx is the single source of production
 * facts. v1.12 supersedes v1.11, which superseded v1.10, which superseded v1.9,
 * which superseded v1.8, which in turn superseded the v1.7 provenance recorded
 * inside the older prototype workbook, which was itself only ever a curated
 * product-development projection.
 *
 * v1.12 is the Serious Golf normalization pass. It changes exactly two sheets and
 * leaves the other 51 byte-identical:
 *   - Decision_Support_Normalized_v2: +4 Serious Golf core_editorial rows (Lost
 *     Pines strong; Plum Creek, Legends, Delaware Springs moderate); Blackhawk's
 *     length-driven Serious Golf row removed (its Great for Groups / Practice
 *     Destination rows kept); White Wing strong->moderate; Teravista, ShadowGlen,
 *     Forest Creek, Avery Ranch strong->moderate under the owner-refined rule that
 *     measured difficulty alone is not Strong; six length-only rationales rewritten
 *     to evidence-based prose. ColoVista is deliberately NOT admitted.
 *   - Master_Courses: architect_display gap-fills (White Wing = Billy Casper,
 *     Forest Creek = Dick Phelps, Legends = Tom Kite; Roy Bechtol; Randy Russell,
 *     Delaware Springs = Axland & Proctor, Lost Pines = Arthur Hills; Steve Forrest).
 * No tee publication gate was weakened; suppressed rating/slope stays suppressed.
 *
 * v1.9 differed from v1.8 by exactly one authoritative cell: Master_Properties
 * prp_0003 gained the slug `clay-kizer-golf-complex`.
 *
 * v1.10 differed from v1.9 by exactly one authoritative cell: Master_Properties
 * prp_0044 (Sun City Texas Golf Clubs) gained the slug `sun-city-texas-golf-clubs`.
 * Batch 2 projects that property's three sibling courses (Legacy Hills, White Wing,
 * Cowan Creek), which makes the property browsable.
 *
 * v1.11 differs from v1.10 by exactly one authoritative cell: Master_Properties
 * prp_0028 (Horseshoe Bay Resort) gains the slug `horseshoe-bay-resort`. Batch 3
 * projects that property's three sibling courses (Slick Rock, Ram Rock, Apple Rock),
 * which makes the property browsable; a browsable property needs a canonical URL.
 * As with prp_0003 and prp_0044, the slug is read from the master rather than
 * derived here — a production identifier invented by the app would be a fact the
 * source of truth never asserted.
 *
 * Batch 4 (Legends, Lighthouse CC, Double J Ranch, Point Venture, Pedernales
 * Cut 'N Putt) required NO master change and stays on v1.11: all five are
 * single-course properties, so none becomes browsable and none needs a slug.
 * Lighthouse CC is projected with no coordinate — the master asserts no point for
 * it, and none could be verified — so it publishes everywhere except the map,
 * which omits any coordinate-less course rather than inventing a location.
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

const SRC = "data/AustinGolf_COURSES_Master_Database_v1.12.xlsx"
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
  // Batch 2 — Core Greater-Austin public courses. Each verified active + Open
  // Public against its official source; admitted individually, not by rule. None
  // maps into the current seven-region model (their dataset area labels are not
  // in REGION_AREA_MAP), so they are intentionally Finder/Explorer/search-visible
  // without an Area home — the Area model is resolved cross-cutting after the
  // expansion batches, not by inventing regions here.
  crs_0018: "Batch 2; Greater Austin public (Kyle) — no normalized recommendations, collection/area orphan",
  crs_0020: "Batch 2; Greater Austin public (Pflugerville)",
  crs_0021: "Batch 2; Greater Austin public (Lago Vista); municipal operator",
  crs_0026: "Batch 2; Greater Austin public (Bastrop); one verified tee row, slope suppressed",
  crs_0055: "Batch 2; Sun City Georgetown sibling; no intent-collection classification match",
  crs_0056: "Batch 2; Sun City Georgetown sibling",
  crs_0057: "Batch 2; Sun City Georgetown sibling; one verified tee row",
  // Batch 3 — Hill Country / Destination courses. Each verified active against its
  // official operator source; admitted individually, not by rule. All sit in the
  // "Hill Country / Destination" market zone and their dataset area labels are not
  // in REGION_AREA_MAP, so they are intentionally Finder/Explorer/search-visible
  // without an Area home (the Area model is resolved cross-cutting after the
  // expansion batches). Resort access is preserved as Resort / Guest Access, not
  // flattened to public: the ordinary golfer can book daily-fee, but the pathway
  // is resort-mediated. Horseshoe Bay's members-only fourth course (Summit Rock)
  // is deliberately NOT admitted.
  crs_0033: "Batch 3; Horseshoe Bay resort sibling (Slick Rock); editorial-led, no tee data",
  crs_0034: "Batch 3; Horseshoe Bay resort sibling (Ram Rock); editorial-led, no tee data",
  crs_0035: "Batch 3; Horseshoe Bay resort sibling (Apple Rock); editorial-led, no tee data",
  crs_0024: "Batch 3; Hill Country public (Vaaler Creek, Blanco); full verified tees/rating/slope",
  crs_0025: "Batch 3; Hill Country public (Delaware Springs, Burnet); tees published, rating/slope suppressed",
  crs_0064: "Batch 3; Hill Country public (Hidden Falls, Meadowlakes); verified tees/rating/slope",
  // Batch 4 — final expansion; Highland Lakes / Hill Country. Each verified active
  // against its official operator source; admitted individually, not by rule. Their
  // dataset area labels are not in REGION_AREA_MAP, so they are Finder/Explorer/
  // search-visible without an Area home (Area model resolved after the batches).
  // Course FORMAT and ACCESS are preserved verbatim, never normalised:
  //   - Point Venture and Pedernales Cut 'N Putt are 9-hole (par 36) courses, kept
  //     as 9-hole; Cut 'N Putt is a rugged casual 9, NOT a par-3 executive.
  //   - Lighthouse is "Public Tee Times" (public play at a course named Country
  //     Club); the raw access label is shown as-is, not flattened to Open Public.
  //     The master asserts no coordinate for it, so it publishes everywhere except
  //     the map, which now defensively omits any course lacking verified coords.
  crs_0060: "Batch 4; Highland Lakes public (Legends, Kingsland); 18-hole regulation, online booking",
  crs_0061: "Batch 4; Highland Lakes public-tee-times (Lighthouse CC, Kingsland); no master coordinate -> no map pin",
  crs_0063: "Batch 4; Hill Country public (Double J Ranch, Wimberley); 18-hole, 24/7 online booking",
  crs_0022: "Batch 4; public 9-hole (Point Venture, N Lake Travis); par 36, rating/slope not published",
  crs_0062: "Batch 4; public casual 9-hole (Pedernales Cut 'N Putt, Spicewood); par 36, rugged nine",
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
  // Batch 2 closure-pass rules (Scorecard_QA_Closure_v1). Each is transcribed from
  // the master's prose and mapped to the gate it describes — not relaxed to admit
  // the course.
  //   Plum Creek: par/tee data is source-provenanced and convergent, so the pass
  //   clears the full table.
  { match: /^publish par\s?71 and source-provenanced current tee data\.?$/i, gate: "full" },
  //   ColoVista: only a course-level summary is first-party; no per-tee selector
  //   is cleared yet.
  { match: /^publish first-party summary; no full tee selector yet\.?$/i, gate: "summary_only" },
  //   Lago Vista: sources conflict on rating/slope, so tees/yardage publish while
  //   rating and slope are withheld.
  { match: /suppress unverified rating\/slope/i, gate: "suppress_rating_slope" },
  //   Sun City (Legacy Hills / White Wing / Cowan Creek): detailed ratings are
  //   provisional secondary extractions, withheld until manual first-party capture.
  { match: /suppress detailed public ratings/i, gate: "suppress_rating_slope" },
  // Batch 3 closure-pass rule (Scorecard_QA_Closure_v1).
  //   Delaware Springs: yardage/par are first-party, but rating/slope are not yet
  //   confirmed, so publish the tee table and withhold rating/slope. Phrased with
  //   "withhold" rather than "suppress", so it needs its own explicit transcription.
  { match: /^publish yardage\/par; withhold rating\/slope\.?$/i, gate: "suppress_rating_slope" },
  // Batch 4 closure-pass rules (Scorecard_QA_Closure_v1). Each names specific
  // figures, so the transcription is exact rather than pattern-generalised.
  //   Legends: back-tee yardage and par are first-party; rating/slope stay in the
  //   table attributed to their source. Nothing is withheld, so this is the full
  //   table with provenance, not a suppression.
  { match: /^publish 7159\/par72; rating\/slope remains source-provenanced\.?$/i, gate: "full" },
  //   Lighthouse: the full four-tee par-71 table is first-party anchored and
  //   published with provenance.
  { match: /^publish 6558\/6034\/5552\/4922 par-71 table with provenance\.?$/i, gate: "full" },
  //   Double J Ranch: tee configuration is still unclear, so no detailed tee
  //   metrics publish yet — only the course-level summary. This is the same
  //   outcome as summary_only (no tee table), reached from a different prose.
  { match: /^do not publish detailed tee metrics yet\.?$/i, gate: "summary_only" },
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
