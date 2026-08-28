/**
 * Homepage featured-content selectors.
 *
 * The homepage's job is brand orientation and routing, not a fourth copy of the
 * Collections / Areas / Guides hubs. This module is the thin seam that lets the
 * homepage feature a *representative* slice of each system while deriving every
 * fact from the canonical source. There are no parallel hard-coded lists of
 * titles, counts or descriptions here — only slug selections that are validated
 * against the real published sets, so nothing can drift out of sync or point at
 * a destination that no longer exists.
 *
 * Guardrails carried from the rest of the app:
 *   - Featured picks are *filtered* against canonical published data. If an
 *     editorial slug is ever removed or unpublished upstream, it silently drops
 *     from the homepage instead of 404-ing.
 *   - Counts come from `collectionCourses` / `areaCourses` / `courses`, the same
 *     membership predicates the hubs and the Finder use.
 *   - No content is invented to fill a section. If a system is thin (e.g. one
 *     Course Guide today), the homepage shows what truly exists.
 */

import { courses } from "@/lib/domain"
import { collections, collectionCourses, type Collection } from "@/lib/collections"
import { areas, areaCourses, type Area } from "@/lib/areas"
import { allGuides, type GuideIndexEntry } from "@/lib/guides-index"

/**
 * Editorially-chosen Collections to feature, in intended order. These are only
 * *preferences*: the selector keeps just the ones that are actually published,
 * then tops up from remaining published Collections so the homepage always fills
 * its row from real data even if this list drifts. Chosen to span both kinds of
 * grouping — factual/path (Near Downtown, Austin Munis) and editorial/intent
 * (Hill Country, Serious Golf) — so the sample represents the system honestly.
 */
const FEATURED_COLLECTION_SLUGS = [
  "near-downtown",
  "austin-munis",
  "hill-country-golf",
  "serious-golf",
]

export type FeaturedCollection = {
  collection: Collection
  /** Live membership count via the canonical predicate. */
  count: number
}

export function featuredCollections(limit = 4): FeaturedCollection[] {
  const bySlug = new Map(collections.map((c) => [c.slug, c]))
  const picked: Collection[] = []
  const seen = new Set<string>()

  for (const slug of FEATURED_COLLECTION_SLUGS) {
    const c = bySlug.get(slug)
    if (c && !seen.has(c.slug)) {
      picked.push(c)
      seen.add(c.slug)
    }
  }
  // Top up from remaining published Collections (already order-sorted) so the
  // row is never short because of an upstream slug change.
  for (const c of collections) {
    if (picked.length >= limit) break
    if (!seen.has(c.slug)) {
      picked.push(c)
      seen.add(c.slug)
    }
  }

  return picked.slice(0, limit).map((collection) => ({
    collection,
    count: collectionCourses(collection).length,
  }))
}

export type FeaturedArea = {
  area: Area
  count: number
}

/**
 * A lightweight geographic sample for the homepage — NOT the full Areas hub.
 * `areas` is already ordered Austin-core-first, so the first few are the most
 * central and the most useful as an entry point. The homepage links onward to
 * /areas for the complete index.
 */
export function featuredAreas(limit = 4): FeaturedArea[] {
  return areas.slice(0, limit).map((area) => ({
    area,
    count: areaCourses(area).length,
  }))
}

/**
 * Featured Guides, featured-first (course guides lead), capped for the homepage.
 * Derived from the real Guides index, so Lions and the vetted Playing Guides are
 * surfaced and nothing fabricated appears.
 */
export function featuredGuides(limit = 3): GuideIndexEntry[] {
  return allGuides().slice(0, limit)
}

/** Real, derived counts for orientation copy. No hard-coded totals. */
export function siteStats() {
  return {
    courseCount: courses.length,
    collectionCount: collections.length,
    areaCount: areas.length,
    guideCount: allGuides().length,
  }
}
