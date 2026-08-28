/**
 * AustinGolf AREAS — geographic orientation model.
 *
 * An Area answers "where is the golf?", as opposed to a Collection, which
 * answers "which courses fit this context?". The two are kept deliberately
 * distinct and cross-linked rather than merged (§6).
 *
 * This file is a THIN presentation layer over the canonical consumer geography
 * that already lives in `lib/domain.ts` (`consumerRegions`). It does not define
 * a second geography taxonomy:
 *
 *  1. Membership is never re-derived here. An Area *is* a `ConsumerRegion`, and
 *     its courses come from `regionCourses`, its Explorer link from `regionHref`
 *     — the same functions the landing "Explore by area" module already uses.
 *     So an Area page, the landing map and the Explorer can never disagree, and
 *     no course is reclassified.
 *
 *  2. The canonical region set already omits three active courses whose dataset
 *     areas are intentionally unmapped (Kissing Tree — Kyle/San Marcos, Austin
 *     Country Club — Lake Austin, Lost Pines — Bastrop). We preserve that
 *     decision rather than inventing regions to absorb them, and the hub
 *     discloses the omission instead of silently implying full coverage.
 *
 *  3. Editorial prose is conservative. `blurb` is the vetted region string from
 *     the domain; the optional `intro` states only direction and what inventory
 *     exists — never a travel-time, terrain-quality or neighbourhood claim the
 *     data does not carry.
 */

import {
  type ConsumerRegion,
  consumerRegions,
  regionCourses,
  regionHref,
} from "@/lib/domain"
import { type Collection, collections } from "@/lib/collections"

/* ------------------------------------------------------------------ model */

export type Area = {
  /** Canonical slug — the ConsumerRegion id, so URLs match the domain model. */
  slug: string
  /** The underlying canonical region. Source of membership and geography. */
  region: ConsumerRegion
  /**
   * Optional longer orientation. Direction and inventory only — deliberately no
   * terrain, travel-time or quality claims. `undefined` where the region's own
   * one-line blurb already says everything the data supports.
   */
  intro?: string
  /** Slugs of Collections with genuine geographic relevance to this Area (§6). */
  relatedCollectionSlugs: string[]
  /** Presentation order in the hub. Mirrors the landing region order. */
  order: number
  status: "published" | "draft"
}

/* ------------------------------------------------------------ definitions */

/**
 * Per-region editorial supplement, keyed by ConsumerRegion id.
 *
 * Everything here is checked against what the region actually contains:
 *  - `intro` restates direction/inventory, never a new fact.
 *  - `relatedCollectionSlugs` lists a Collection only where the geography and the
 *    Collection genuinely coincide. "Genuine" means the relationship is real in
 *    the data, not merely thematically adjacent — e.g. Resort Corridor ↔ Resort
 *    Golf (the resort campus is that region), West & Hill Country ↔ Hill Country
 *    Golf (that is where the terrain is), Central Austin ↔ Near Downtown / Austin
 *    Munis (the munis and the closest-in golf sit in the core). Regions with no
 *    honest editorial tie carry an empty list rather than a stretched one.
 */
const SUPPLEMENT: Record<
  string,
  { intro?: string; relatedCollectionSlugs: string[] }
> = {
  "central-austin": {
    intro:
      "The golf closest to the centre of the city, including its municipal courses. A first place to look when proximity to downtown is the deciding factor.",
    relatedCollectionSlugs: ["near-downtown", "austin-munis"],
  },
  "north-austin": {
    intro:
      "Daily-fee golf up the northern corridor, in the suburbs above the city.",
    relatedCollectionSlugs: [],
  },
  "west-hill-country": {
    intro:
      "West of the city the land rises into the Hill Country. This is where terrain becomes part of the round.",
    relatedCollectionSlugs: ["hill-country-golf"],
  },
  "east-northeast": {
    intro:
      "The metro's deepest concentration of open-access golf, spread east and northeast of the core.",
    relatedCollectionSlugs: [],
  },
  "south-southwest": {
    // Direction only — the region blurb is explicit that it makes no view or
    // terrain promise, so the intro must not add one.
    intro: "Golf south and southwest of central Austin.",
    relatedCollectionSlugs: [],
  },
  "round-rock": {
    intro:
      "Established clubs just north of the city line, in Round Rock.",
    relatedCollectionSlugs: [],
  },
  "resort-corridor": {
    intro:
      "Several regulation courses under a single resort campus, west of the city — the golf here is part of a stay.",
    relatedCollectionSlugs: ["resort-golf"],
  },
}

/* -------------------------------------------------- validation (fail loud) */

/*
 * Like the Collections model, referencing a target that does not exist should
 * stop the build rather than ship a broken page. Two invariants:
 *  - Every ConsumerRegion must have a supplement entry, so a new region added to
 *    the domain cannot silently ship with no ordering or editorial decision.
 *  - Every related Collection slug must resolve to a real published Collection.
 */
const publishedCollectionSlugs = new Set(collections.map((c) => c.slug))

for (const r of consumerRegions) {
  if (!SUPPLEMENT[r.id]) {
    throw new Error(
      `[areas] consumer region "${r.id}" has no Area supplement entry.`,
    )
  }
  for (const slug of SUPPLEMENT[r.id].relatedCollectionSlugs) {
    if (!publishedCollectionSlugs.has(slug)) {
      throw new Error(
        `[areas] region "${r.id}" references unknown or unpublished collection "${slug}".`,
      )
    }
  }
}

/* ----------------------------------------------------------------- exports */

/**
 * Published Areas in presentation order. Order follows `consumerRegions`, which
 * is already Austin-core-first; `order` is assigned from that sequence so the
 * hub and the landing map agree.
 */
export const areas: Area[] = consumerRegions
  .map((region, i) => {
    const supp = SUPPLEMENT[region.id]
    return {
      slug: region.id,
      region,
      intro: supp.intro,
      relatedCollectionSlugs: supp.relatedCollectionSlugs,
      order: i + 1,
      status: "published" as const,
    }
  })
  .filter((a) => a.status === "published")
  .sort((a, b) => a.order - b.order)

export const areaBySlug = new Map(areas.map((a) => [a.slug, a]))

export const getArea = (slug: string) => areaBySlug.get(slug)

/**
 * The courses in an Area, resolved through the canonical `regionCourses` — the
 * single source of geographic membership. No stored list, no re-derivation.
 */
export const areaCourses = (a: Area) => regionCourses(a.region)

/** The canonical Explorer state (Area filter) this Area corresponds to. */
export const areaExploreHref = (a: Area) => regionHref(a.region)

/** Related published Collections, resolved and de-duplicated, order preserved. */
export function areaRelatedCollections(a: Area): Collection[] {
  return a.relatedCollectionSlugs
    .map((slug) => collections.find((c) => c.slug === slug))
    .filter((c): c is Collection => Boolean(c))
}
