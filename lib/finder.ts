/**
 * Finder state model, eligibility filtering and ordering.
 *
 * Rules implemented here, from the Build Brief:
 *  §7.2  Across filter categories AND; within a category OR.
 *  §7.2  Unknown is not No, and Unknown cannot satisfy an affirmative filter.
 *  §7.2  Clear Filters keeps the originating intent; Clear All returns to neutral.
 *  §7.3  Intent is the strongest relevance signal; filters decide eligibility, not rank.
 *  §7.3  Thin results are acceptable — never padded with weaker recommendations.
 *  §12   A zero-result state explains the conflict and offers a specific relaxation.
 */

import {
  type Course,
  type Entity,
  type Property,
  type Recommendation,
  courses,
  properties,
  DOWNTOWN,
  distanceMiles,
  isResortProperty,
  matchesQuickPath,
  quickPathById,
  classificationById,
  rankReasons,
  reasonWeight,
  supportsRecommendedOrder,
} from "@/lib/domain"

/* ------------------------------------------------------------ state model */

export type ViewMode = "list" | "map"
export type SortMode = "recommended" | "distance" | "name"
export type AccessFilter = "public" | "resort"

export type FinderState = {
  /** Editorial discovery intent (a dataset classification). */
  intent: string | null
  /** Geographic / factual shortcut. */
  path: string | null
  areas: string[]
  access: AccessFilter | null
  /**
   * More Filters — each backed by real prototype data.
   *
   * `walking` is deliberately absent (Gen2 §7). Walking is confirmed for a single
   * prototype course, so exposing it would read as "the other fourteen do not
   * allow walking" even though the filter logic is correct. The field itself is
   * untouched in the dataset and still reported as Unknown on the Course Page.
   */
  holes18: boolean
  rentalClubs: boolean
  practiceFacility: boolean
  /** `null` means "use the default for this discovery state" (Gen2 §2). */
  sort: SortMode | null
  view: ViewMode
  /** Selected result, shared by List and Map (§9). */
  selected: string | null
}

export const EMPTY_STATE: FinderState = {
  intent: null,
  path: null,
  areas: [],
  access: null,
  holes18: false,
  rentalClubs: false,
  practiceFacility: false,
  sort: null,
  view: "list",
  selected: null,
}

/**
 * Gen2 §2 — there is no universal AustinGolf course ranking.
 *
 * Neutral Explore All therefore defaults to Name, an ordering that claims
 * nothing. `Recommended` becomes the default only once the golfer has expressed
 * an editorial intent we have evidence-backed reasoning for, and geographic
 * Quick Paths lead with distance.
 */
export function defaultSort(s: FinderState): SortMode {
  if (s.intent && supportsRecommendedOrder(s.intent)) return "recommended"
  if (s.path && quickPathById.get(s.path)?.geographyFirst) return "distance"
  if (s.path) return "name"
  return "name"
}

/** The ordering actually in effect: explicit choice, else the state's default. */
export const effectiveSort = (s: FinderState): SortMode => s.sort ?? defaultSort(s)

/** Whether `Recommended` is an offerable ordering at all in this state. */
export const allowsRecommended = (s: FinderState) => supportsRecommendedOrder(s.intent)

/* ------------------------------------------------------- URL serialisation */

export function parseState(params: URLSearchParams): FinderState {
  const intent = params.get("intent")
  const path = params.get("path")
  const access = params.get("access")
  const sort = params.get("sort")
  const view = params.get("view")
  const resolvedIntent = intent && classificationById.has(intent) ? intent : null
  return {
    intent: resolvedIntent,
    path: path && quickPathById.has(path) ? path : null,
    areas: params.getAll("area").filter(Boolean),
    access: access === "public" || access === "resort" ? access : null,
    holes18: params.get("holes18") === "1",
    rentalClubs: params.get("rental") === "1",
    practiceFacility: params.get("practice") === "1",
    // `Recommended` is not honoured from the URL unless the state earns it, so a
    // hand-edited or stale link cannot resurrect an implied universal ranking.
    sort:
      sort === "distance" || sort === "name"
        ? sort
        : sort === "recommended" && supportsRecommendedOrder(resolvedIntent)
          ? "recommended"
          : null,
    view: view === "map" ? "map" : "list",
    selected: params.get("sel"),
  }
}

export function serializeState(s: FinderState): string {
  const p = new URLSearchParams()
  if (s.intent) p.set("intent", s.intent)
  if (s.path) p.set("path", s.path)
  for (const a of s.areas) p.append("area", a)
  if (s.access) p.set("access", s.access)
  if (s.holes18) p.set("holes18", "1")
  if (s.rentalClubs) p.set("rental", "1")
  if (s.practiceFacility) p.set("practice", "1")
  // Only an explicit, non-default ordering is written to the URL.
  if (s.sort && s.sort !== defaultSort(s)) p.set("sort", s.sort)
  if (s.view !== "list") p.set("view", s.view)
  if (s.selected) p.set("sel", s.selected)
  const q = p.toString()
  return q ? `/courses/explore?${q}` : "/courses/explore"
}

/* ------------------------------------------------------- factual  filters */

/**
 * Each factual filter is a named predicate so the zero-result state can name
 * exactly which criterion failed and offer to relax that one criterion.
 */
export type FactualFilterId = "areas" | "access" | "holes18" | "rentalClubs" | "practiceFacility"

export type FactualFilter = {
  id: FactualFilterId
  /** Human phrasing used in conflict explanations. */
  label: (s: FinderState) => string
  active: (s: FinderState) => boolean
  test: (c: Course, s: FinderState) => boolean
  /**
   * Set when passing the filter depends on data the prototype often does not
   * have. Surfaced so an empty result reads as a coverage gap, not a "No".
   */
  coverageNote?: string
}

const hasFeature = (c: Course, feature: string) =>
  c.features.some((f) => f.feature === feature && f.value === "available")

export const FACTUAL_FILTERS: FactualFilter[] = [
  {
    id: "areas",
    label: (s) => (s.areas.length === 1 ? s.areas[0] : `${s.areas.length} areas`),
    active: (s) => s.areas.length > 0,
    // Within a category, OR.
    test: (c, s) => s.areas.includes(c.area),
  },
  {
    id: "access",
    label: (s) => (s.access === "public" ? "Public access" : "Resort access"),
    active: (s) => s.access !== null,
    test: (c, s) => c.accessProfile === s.access,
  },
  {
    id: "holes18",
    label: () => "18 holes",
    active: (s) => s.holes18,
    // holes is known for every prototype course, so this filter is fully covered.
    test: (c) => c.holes === 18,
  },
  {
    id: "rentalClubs",
    label: () => "Rental clubs",
    active: (s) => s.rentalClubs,
    test: (c) => hasFeature(c, "Rental Clubs"),
    coverageNote:
      "Rental clubs are verified for a subset of prototype courses. Others are unverified rather than unavailable.",
  },
  {
    id: "practiceFacility",
    label: () => "Practice facility",
    active: (s) => s.practiceFacility,
    test: (c) => hasFeature(c, "Practice Facility"),
    coverageNote:
      "Only first-party-verified practice facilities qualify. Several courses are recommended as practice destinations without a verified facility record yet.",
  },
]

export const activeFactualFilters = (s: FinderState) =>
  FACTUAL_FILTERS.filter((f) => f.active(s))

export const activeFilterCount = (s: FinderState) => {
  let n = s.areas.length
  if (s.access) n += 1
  if (s.holes18) n += 1
  if (s.rentalClubs) n += 1
  if (s.practiceFacility) n += 1
  return n
}

/* --------------------------------------------------------- eligibility */

/** Discovery scope: which courses the intent or quick path admits at all. */
function inScope(c: Course, s: FinderState): boolean {
  if (s.intent && !c.recommendations.some((r) => r.classification === s.intent)) {
    return false
  }
  if (s.path && !matchesQuickPath(s.path, c)) return false
  return true
}

/**
 * Applies every active factual filter, AND-ed across categories.
 *
 * `skip` accepts one id or a set of ids. The set form is what lets the
 * zero-result recovery ask "what if these two constraints were relaxed
 * together?" without duplicating the eligibility rules.
 */
function passesFilters(
  c: Course,
  s: FinderState,
  skip?: FactualFilterId | ReadonlySet<FactualFilterId>,
): boolean {
  const skipped = (id: FactualFilterId) =>
    typeof skip === "string" ? skip === id : (skip?.has(id) ?? false)

  for (const f of FACTUAL_FILTERS) {
    if (skipped(f.id)) continue
    if (f.active(s) && !f.test(c, s)) return false
  }
  return true
}

/**
 * A Property is a container: it satisfies a factual filter when any of its child
 * courses does, and it appears only where the Property itself is a useful answer.
 */
function propertyIsUsefulAnswer(p: Property, s: FinderState): boolean {
  /*
   * Both lodging-dependent surfaces are gated on the property actually being a
   * resort. These returned an unconditional true when Barton Creek was the only
   * projected property, so the municipal Clay/Kizer complex was admitted to a
   * resort pathway and to a stay-and-play intent despite having no lodging.
   * Suppressing the copy alone was not enough: a hotel-less property is not an
   * answer to "golf bundled with somewhere to stay", so it must not be eligible
   * in the first place.
   */
  if (s.path === "resort-golf") return isResortProperty(p)
  if (s.intent === "Golf Trip / Stay & Play") return isResortProperty(p)
  /*
   * Great for Groups is the required Course + Property comparison journey (§3).
   * This one stays open to any multi-course property: the group question is
   * about absorbing an outing across several courses from one base, which a
   * municipal complex answers as well as a resort does.
   */
  if (s.intent === "Great for Groups") return true
  return false
}

function propertyPasses(
  p: Property,
  s: FinderState,
  skip?: FactualFilterId | ReadonlySet<FactualFilterId>,
) {
  return p.courses.some((c) => passesFilters(c, s, skip))
}

/* --------------------------------------------------------------- results */

export type ResultItem =
  | { kind: "course"; entity: Course; reason: Recommendation | null; distance: number }
  | { kind: "property"; entity: Property; distance: number }

export type FinderResults = {
  items: ResultItem[]
  /** Present when active filters removed everything (§12). */
  conflict: {
    scopeCount: number
    /**
     * Tier 1 -- single-constraint relaxations that would produce results,
     * most productive first.
     */
    relaxations: { id: FactualFilterId; label: string; count: number; coverageNote?: string }[]
    /**
     * Tier 2 -- smallest combinations of constraints whose joint relaxation
     * recovers results. Only populated when no single relaxation works, so the
     * user is never offered a bigger concession than necessary.
     */
    combinedRelaxations: {
      ids: FactualFilterId[]
      labels: string[]
      count: number
      coverageNotes: string[]
    }[]
  } | null
  /** Courses admitted by the intent/path before factual filtering. */
  scopeCount: number
}

export function computeResults(s: FinderState): FinderResults {
  const scope = courses.filter((c) => inScope(c, s))
  const eligible = scope.filter((c) => passesFilters(c, s))

  const items: ResultItem[] = eligible.map((c) => ({
    kind: "course" as const,
    entity: c,
    reason: s.intent ? pickReason(c, s.intent) : null,
    distance: distanceMiles(DOWNTOWN, c),
  }))

  // Property results sit alongside course results where the Property is the answer.
  for (const p of properties) {
    if (!propertyIsUsefulAnswer(p, s)) continue
    if (!propertyPasses(p, s)) continue
    items.push({
      kind: "property" as const,
      entity: p,
      distance: distanceMiles(DOWNTOWN, p),
    })
  }

  sortItems(items, s)

  let conflict: FinderResults["conflict"] = null
  if (items.length === 0 && activeFilterCount(s) > 0) {
    /*
     * Recovery counts must match what the Finder would actually render, so
     * they count Properties as well as Courses. Counting only courses used to
     * hide a relaxation whose sole recovery was a Property result.
     */
    const recoveredCount = (skip: FactualFilterId | ReadonlySet<FactualFilterId>) => {
      let n = scope.filter((c) => passesFilters(c, s, skip)).length
      for (const p of properties) {
        if (!propertyIsUsefulAnswer(p, s)) continue
        if (propertyPasses(p, s, skip)) n += 1
      }
      return n
    }

    const active = activeFactualFilters(s)

    // Tier 1: relax exactly one constraint.
    const relaxations = active
      .map((f) => ({
        id: f.id,
        label: f.label(s),
        count: recoveredCount(f.id),
        coverageNote: f.coverageNote,
      }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count)

    /*
     * Tier 2: only when no single relaxation recovers anything. Pairs first,
     * and we stop at the smallest size that works, so the user is never asked
     * to give up three constraints when two would do. With at most five
     * factual filters this is a handful of combinations.
     */
    let combinedRelaxations: NonNullable<FinderResults["conflict"]>["combinedRelaxations"] = []
    if (relaxations.length === 0 && active.length > 1) {
      for (let size = 2; size <= active.length && combinedRelaxations.length === 0; size++) {
        const found: typeof combinedRelaxations = []
        const walk = (start: number, chosen: FactualFilter[]) => {
          if (chosen.length === size) {
            const ids = chosen.map((f) => f.id)
            const count = recoveredCount(new Set(ids))
            if (count > 0) {
              found.push({
                ids,
                labels: chosen.map((f) => f.label(s)),
                count,
                coverageNotes: chosen
                  .map((f) => f.coverageNote)
                  .filter((n): n is string => Boolean(n)),
              })
            }
            return
          }
          for (let i = start; i < active.length; i++) walk(i + 1, [...chosen, active[i]])
        }
        walk(0, [])
        combinedRelaxations = found.sort((a, b) => b.count - a.count).slice(0, 3)
      }
    }

    conflict = { scopeCount: scope.length, relaxations, combinedRelaxations }
  }

  return { items, conflict, scopeCount: scope.length }
}

function pickReason(c: Course, intent: string): Recommendation | null {
  const matching = c.recommendations.filter((r) => r.classification === intent)
  return matching.length ? rankReasons(matching)[0] : null
}

function sortItems(items: ResultItem[], s: FinderState) {
  const sort = effectiveSort(s)
  const geographyFirst = sort === "distance"

  items.sort((a, b) => {
    if (sort === "name") {
      return a.entity.name.localeCompare(b.entity.name)
    }
    if (geographyFirst) {
      // Near Downtown is geography-first (§7.3).
      if (a.distance !== b.distance) return a.distance - b.distance
      return a.entity.name.localeCompare(b.entity.name)
    }

    // Recommended: editorial weight first, geography only as a tiebreaker.
    const aw = itemWeight(a, s)
    const bw = itemWeight(b, s)
    if (aw !== bw) return bw - aw

    if (!s.intent) {
      // Neutral inventory: Austin core before the wider metro.
      const az = a.entity.marketZone === "Austin Core" ? 0 : 1
      const bz = b.entity.marketZone === "Austin Core" ? 0 : 1
      if (az !== bz) return az - bz
    }
    if (Math.abs(a.distance - b.distance) > 0.5) return a.distance - b.distance
    return a.entity.name.localeCompare(b.entity.name)
  })
}

/**
 * Internal ordering weight. Deliberately not a universal numeric score and
 * never surfaced in the UI (§7.3, §15).
 */
function itemWeight(item: ResultItem, s: FinderState): number {
  if (item.kind === "property") {
    // A property answering a group/trip need ranks with the strongest of its
    // children so it competes fairly with individual courses.
    if (!s.intent) return 0
    const best = Math.max(
      0,
      ...item.entity.courses.flatMap((c) =>
        c.recommendations
          .filter((r) => r.classification === s.intent)
          .map((r) => reasonWeight(r)),
      ),
    )
    return best
  }
  return item.reason ? reasonWeight(item.reason) : 0
}

/* ----------------------------------------------------------- state header */

/** Label and orientation for the current discovery state (§7.1). */
export function stateHeading(s: FinderState): { label: string; orientation: string } {
  if (s.intent) {
    const meta = classificationById.get(s.intent)
    return { label: s.intent, orientation: meta?.orientation ?? "" }
  }
  if (s.path) {
    const meta = quickPathById.get(s.path)
    return { label: meta?.label ?? "", orientation: meta?.orientation ?? "" }
  }
  return {
    label: "All Courses",
    orientation: "Every playable course in the AustinGolf prototype set.",
  }
}

export const hasDiscoveryIntent = (s: FinderState) => !!(s.intent || s.path)

/** Clear Filters — drops factual narrowing, preserves discovery intent (§7.2). */
export function clearFilters(s: FinderState): FinderState {
  return {
    ...EMPTY_STATE,
    intent: s.intent,
    path: s.path,
    sort: s.sort,
    view: s.view,
  }
}

/** Clear All — returns to neutral playable inventory (§7.2). */
export function clearAll(s: FinderState): FinderState {
  return { ...EMPTY_STATE, view: s.view }
}

/* ---------------------------------------------------------------- search */

export type SearchHit =
  | { kind: "course"; entity: Course; matchedOn: string | null }
  | { kind: "property"; entity: Property; matchedOn: string | null }
  | { kind: "area"; area: string; count: number }

/**
 * Search matches course names, common short names, meaningful areas and
 * multi-course properties (§6). Selecting a course goes straight to its page —
 * known-item lookup never detours through the Finder.
 */
export function search(query: string, limit = 8): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []

  const hits: { hit: SearchHit; score: number }[] = []

  const scoreText = (text: string | null) => {
    if (!text) return 0
    const t = text.toLowerCase()
    if (t === q) return 100
    if (t.startsWith(q)) return 80
    // Match on any word start, so "falc" finds "Falconhead" and "kizer" finds "Roy Kizer".
    if (t.split(/[\s/&-]+/).some((w) => w.startsWith(q))) return 60
    if (t.includes(q)) return 30
    return 0
  }

  for (const p of properties) {
    const score = Math.max(scoreText(p.name), scoreText(p.shortName))
    // Properties outrank their children so "Barton Creek" surfaces the resort first.
    if (score) hits.push({ hit: { kind: "property", entity: p, matchedOn: null }, score: score + 6 })
  }

  for (const c of courses) {
    const score = Math.max(scoreText(c.name), scoreText(c.shortName))
    if (score) {
      hits.push({ hit: { kind: "course", entity: c, matchedOn: null }, score })
      continue
    }
    const areaScore = scoreText(c.area) || scoreText(c.city)
    if (areaScore) {
      hits.push({
        hit: { kind: "course", entity: c, matchedOn: c.area },
        score: areaScore - 10,
      })
    }
  }

  // Areas as navigable results, so "round rock" offers the area as well as courses.
  const areaCounts = new Map<string, number>()
  for (const c of courses) {
    if (scoreText(c.area)) areaCounts.set(c.area, (areaCounts.get(c.area) ?? 0) + 1)
  }
  for (const [area, count] of areaCounts) {
    if (count > 1) {
      hits.push({ hit: { kind: "area", area, count }, score: scoreText(area) - 5 })
    }
  }

  return hits
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((h) => h.hit)
}

/* -------------------------------------------------- arrival context (§3) */

/**
 * Gen2 §3 — the discovery intent a Course Page was actually reached through.
 *
 * A Course Page must answer "why does this course fit the decision I was
 * making?", which means the rationale has to come from the journey, not from
 * whatever recommendation happens to be strongest in the database. Opening
 * Falconhead directly is a known-item lookup with no decision context, so it
 * gets neutral orientation; arriving from Great for Groups gets the Great for
 * Groups reason.
 *
 * The intent is read back out of the `from` Finder URL that discovery already
 * carries for the Back link, so no new state plumbing is required.
 */
export function arrivalIntent(from: string | undefined): string | null {
  if (!from || !from.startsWith("/courses/explore")) return null
  const q = from.indexOf("?")
  if (q < 0) return null
  const intent = new URLSearchParams(from.slice(q + 1)).get("intent")
  return intent && classificationById.has(intent) ? intent : null
}

export function hrefForEntity(e: Entity) {
  return e.kind === "property" ? `/properties/${e.slug}` : `/courses/${e.slug}`
}
