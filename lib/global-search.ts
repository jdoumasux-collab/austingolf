/**
 * Global site search (Global Search brief).
 *
 * A single, lightweight, deterministic search model over the five content
 * types AustinGolf now publishes: Courses, Properties, Collections, Areas and
 * Guides. It is the model behind BOTH the header combobox and the /search
 * results page, so the two never disagree about what matches or where a result
 * leads.
 *
 * Design decisions:
 *  - This is deliberately SEPARATE from lib/finder.ts `search()`, which is the
 *    Course Finder's known-item lookup (courses/properties/areas that route
 *    INTO the Courses product; an area there opens the Explorer). Global search
 *    is a navigation tool ACROSS the whole site, so its Area hits go to the
 *    canonical /areas/[slug] page, and it adds Collections and Guides that the
 *    Finder has no reason to surface.
 *  - Every item is DERIVED from the canonical systems (domain, collections,
 *    areas, guides-index). No parallel hand-maintained list, no invented
 *    descriptors, no keyword stuffing — aliases are only the real short names
 *    and obvious spellings the data already justifies.
 *  - Ranking mirrors the Finder's proven scoring so relevance feels identical
 *    across the app: exact = 100, prefix = 80, word-start = 60, contains = 30.
 */

import { courses, properties, propertyKindLabel } from "@/lib/domain"
import { collections } from "@/lib/collections"
import { areas, areaCourses } from "@/lib/areas"
import { allGuides } from "@/lib/guides-index"

export type GlobalSearchType = "course" | "property" | "collection" | "area" | "guide"

export type GlobalSearchItem = {
  /** Stable de-dupe / React key. */
  id: string
  type: GlobalSearchType
  title: string
  /** Canonical destination (§8). */
  href: string
  /** Short, already-supported descriptor. May be empty. */
  descriptor: string
  /**
   * Lower-cased strings this item matches on — its title plus any real aliases
   * (short names, city/area for a course). Never fabricated keywords.
   */
  terms: string[]
}

export type GlobalSearchHit = GlobalSearchItem & { score: number }

/** Human label per type, using the site's existing vocabulary. */
export const TYPE_LABEL: Record<GlobalSearchType, string> = {
  course: "Course",
  property: "Property",
  collection: "Collection",
  area: "Area",
  guide: "Guide",
}

/** Group display order on the results page — known-item first, then discovery. */
export const TYPE_ORDER: GlobalSearchType[] = ["course", "property", "area", "collection", "guide"]

/* --------------------------------------------------------------- the index */

/**
 * Built once at module load from canonical data. Small (tens of items), so a
 * plain array scanned per query is more than fast enough — no index structure,
 * no external service (brief §3).
 */
function buildIndex(): GlobalSearchItem[] {
  const items: GlobalSearchItem[] = []

  for (const c of courses) {
    const descriptor = [c.area, c.accessType].filter(Boolean).join(" · ")
    items.push({
      id: `course:${c.id}`,
      type: "course",
      title: c.name,
      href: `/courses/${c.slug}`,
      descriptor,
      terms: dedupeTerms([c.name, c.shortName, c.area, c.city]),
    })
  }

  for (const p of properties) {
    const n = p.courses.length
    items.push({
      id: `property:${p.id}`,
      type: "property",
      title: p.name,
      href: `/properties/${p.slug}`,
      descriptor: `${propertyKindLabel(p)} · ${n} course${n === 1 ? "" : "s"}`,
      terms: dedupeTerms([p.name, p.shortName, p.area, p.city]),
    })
  }

  for (const a of areas) {
    const count = areaCourses(a).length
    items.push({
      id: `area:${a.slug}`,
      type: "area",
      title: a.region.label,
      // §8: Areas resolve to their canonical page, NOT the Explorer filter.
      href: `/areas/${a.slug}`,
      descriptor: `${count} course${count === 1 ? "" : "s"}`,
      terms: dedupeTerms([a.region.label]),
    })
  }

  for (const c of collections) {
    items.push({
      id: `collection:${c.slug}`,
      type: "collection",
      title: c.title,
      href: `/collections/${c.slug}`,
      descriptor: c.dek,
      terms: dedupeTerms([c.title]),
    })
  }

  for (const g of allGuides()) {
    items.push({
      id: `guide:${g.key}`,
      type: "guide",
      title: g.title,
      // §8: the canonical guide URL (course guides stay nested under the course).
      href: g.href,
      descriptor: g.kicker,
      terms: dedupeTerms([g.title, g.kicker]),
    })
  }

  return items
}

function dedupeTerms(raw: (string | null | undefined)[]): string[] {
  const out = new Set<string>()
  for (const t of raw) {
    if (t && t.trim()) out.add(t.trim().toLowerCase())
  }
  return [...out]
}

const INDEX: GlobalSearchItem[] = buildIndex()

/** Exposed for verification/debugging; not a public feature surface. */
export function globalSearchIndexSize(): number {
  return INDEX.length
}

/* ---------------------------------------------------------------- scoring */

/** Normalize a query: lower-case, collapse whitespace, drop stray punctuation. */
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s/&'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Deterministic per-term score, mirroring lib/finder.ts so relevance is
 * consistent across the app:
 *   exact 100 · prefix 80 · any-word-start 60 · contains 30 · else 0
 */
function scoreTerm(term: string, q: string): number {
  if (!term) return 0
  if (term === q) return 100
  if (term.startsWith(q)) return 80
  if (term.split(/[\s/&'-]+/).some((w) => w.startsWith(q))) return 60
  if (term.includes(q)) return 30
  return 0
}

/** Best score for a single query token across all of an item's terms. */
function bestTermScore(item: GlobalSearchItem, token: string): number {
  let best = 0
  for (const term of item.terms) {
    const s = scoreTerm(term, token)
    if (s > best) best = s
  }
  return best
}

/**
 * Score an item against the whole (normalized) query.
 *
 * Single-word queries behave exactly like the Finder: the query is matched as
 * one string. Multi-word queries additionally succeed when EVERY word matches
 * some term (so "lions course guide" finds the "Understanding Lions Municipal
 * Golf Course" guide, whose terms include "lions" and "course guide"). The
 * whole-phrase score always wins when it applies, keeping exact/prefix hits on
 * top. This is deterministic token matching — not fuzzy or typo-tolerant.
 */
function scoreItem(item: GlobalSearchItem, q: string): number {
  const phrase = bestTermScore(item, q)
  if (phrase > 0) return phrase

  const tokens = q.split(" ").filter((t) => t.length >= 2)
  if (tokens.length < 2) return 0

  let sum = 0
  for (const token of tokens) {
    const s = bestTermScore(item, token)
    if (s === 0) return 0 // every word must match somewhere
    sum += s
  }
  // Average, capped below a real single-string prefix match so phrase hits rank first.
  return Math.min(55, Math.round(sum / tokens.length))
}

/**
 * Rank items for a query. Deterministic and stable: primary by score, then a
 * gentle type bias (known-item over discovery on ties), then alphabetical so
 * results never reorder between renders.
 */
export function globalSearch(query: string, limit?: number): GlobalSearchHit[] {
  const q = normalizeQuery(query)
  if (q.length < 2) return []

  const typeBias: Record<GlobalSearchType, number> = {
    course: 3,
    property: 3,
    area: 2,
    collection: 1,
    guide: 1,
  }

  const hits: GlobalSearchHit[] = []
  for (const item of INDEX) {
    const score = scoreItem(item, q)
    if (score > 0) hits.push({ ...item, score })
  }

  hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (typeBias[b.type] !== typeBias[a.type]) return typeBias[b.type] - typeBias[a.type]
    return a.title.localeCompare(b.title)
  })

  return typeof limit === "number" ? hits.slice(0, limit) : hits
}

/** Group hits by type, preserving TYPE_ORDER and within-group ranking. */
export function groupHits(hits: GlobalSearchHit[]): { type: GlobalSearchType; hits: GlobalSearchHit[] }[] {
  return TYPE_ORDER.map((type) => ({
    type,
    hits: hits.filter((h) => h.type === type),
  })).filter((g) => g.hits.length > 0)
}
