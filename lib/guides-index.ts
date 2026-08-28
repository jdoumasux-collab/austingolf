/**
 * Guides discovery index — the /guides hub model.
 *
 * This is deliberately a SEPARATE module from `lib/guide.ts`. That file is the
 * per-course Course Guide *content* schema (ordered sections, blocks, sources,
 * civil-rights prose, the whole trust apparatus). This file is the *discovery*
 * layer: a thin catalogue of publishable Guide entries that the /guides hub
 * lists and cross-links. Keeping them apart means the hub can grow new guide
 * TYPES (Playing, Trip) that are not course-scoped without contaminating the
 * course-guide schema, and the course-guide schema keeps doing its trust work
 * untouched.
 *
 * Three V1 guide types (per the build brief):
 *
 *   "course"  — a researched understanding of one course. Its canonical page is
 *               the existing /courses/[slug]/guide route. The hub LINKS there;
 *               it never renders a second copy, so there is no duplicate
 *               indexable URL for the same guide.
 *   "playing" — decision-oriented Austin golf content (comparisons, scenarios).
 *               These are the vetted Finder-routed entries already shipped in
 *               components/landing/guides.tsx, normalised here so the hub and
 *               the landing module read from one place.
 *   "trip"    — golf-trip planning. The type EXISTS so the architecture is ready,
 *               but no trip content is manufactured to fill the hub. An empty
 *               type is the honest state, not a bug.
 *
 * Trust discipline carried over verbatim from the rest of the app:
 *   - No invented publication dates, authorship, or firsthand claims. A "course"
 *     entry's date comes from the real `researchUpdated` on its published Guide;
 *     "playing" entries carry no date because they are evergreen decision tools,
 *     not dated articles.
 *   - A "course" entry only exists if a real published Guide backs it AND the
 *     course exists in the canonical projection. Drift drops the entry rather
 *     than rendering a dead teaser.
 *   - Cross-content relationships (course / property / collection / area) are
 *     only asserted where they can be supported confidently.
 */

import { getCourse } from "@/lib/domain"
import { guideBySlug } from "@/content/guides"

/* -------------------------------------------------------------------- types */

export type GuideType = "course" | "playing" | "trip"

/** A confident relationship from a guide to another canonical destination. */
export type GuideRelation =
  | { kind: "course"; slug: string; label: string }
  | { kind: "collection"; slug: string; label: string }
  | { kind: "area"; slug: string; label: string }

export type GuideIndexEntry = {
  /** Stable key for React lists and ordering. Not necessarily a route. */
  key: string
  type: GuideType
  /** Short label above the title (e.g. "Course Guide", "Comparison"). */
  kicker: string
  title: string
  /** One-line reader-facing summary. */
  dek: string
  /** Canonical destination for this guide. For "course" this is the existing
   *  nested guide route — never a /guides/[slug] duplicate. */
  href: string
  /** Call-to-action label on the card. */
  cta: string
  /**
   * ISO date, ONLY when a real one exists (course guides carry the published
   * Guide's `researchUpdated`). Undefined for evergreen playing guides — we do
   * not fabricate a date to make a card look editorial.
   */
  researchUpdated?: string
  /** Confident cross-links. May be empty. */
  relations: GuideRelation[]
  /** Featured entries lead the hub. */
  featured: boolean
}

/* ---------------------------------------------------------- course guides */

/**
 * Course Guide entries, derived from the real published-guide registry.
 *
 * We do NOT hand-write these. We read `guideBySlug` (the same registry the
 * course-nested guide route uses), join to the canonical course record for the
 * name/area, and drop anything whose course is missing. Today that yields
 * exactly one entry — Lions — and it will yield more automatically as guides are
 * added to `content/guides`, with no change to the hub.
 */
function courseGuideEntries(): GuideIndexEntry[] {
  const entries: GuideIndexEntry[] = []
  for (const [slug, guide] of guideBySlug) {
    const course = getCourse(slug)
    if (!course) continue // drift guard: no course, no entry
    entries.push({
      key: `course:${slug}`,
      type: "course",
      kicker: "Course Guide",
      title: `Understanding ${course.name}`,
      dek: guide.dek,
      href: `/courses/${slug}/guide`, // canonical, existing URL
      cta: "Read the guide",
      researchUpdated: guide.researchUpdated,
      relations: [
        { kind: "course", slug, label: `${course.name} course page` },
      ],
      featured: true,
    })
  }
  return entries
}

/* --------------------------------------------------------- playing guides */

/**
 * Playing Guides — decision-oriented content.
 *
 * These mirror the vetted entries in components/landing/guides.tsx: each states
 * a decision settled from verified data and routes into the real Finder state
 * that settles it. No dates, no bylines — evergreen decision tools. The related
 * Collection links point only where a genuine Collection already exists for the
 * same decision, so the cross-link is supported rather than decorative.
 */
const PLAYING_GUIDES: GuideIndexEntry[] = [
  {
    key: "playing:groups",
    type: "playing",
    kicker: "Comparison",
    title: "Where should a group of twelve actually play?",
    dek: "Weighs the open-access courses that can absorb an outing against the resort option — as properties, not near-identical course cards.",
    href: "/courses/explore?intent=Great+for+Groups",
    cta: "See group golf",
    relations: [],
    featured: false,
  },
  {
    key: "playing:serious",
    type: "playing",
    kicker: "Comparison",
    title: "Which Austin courses hold up for a low handicap?",
    dek: "The layouts with enough golf course to stay interesting after the third round, and what specifically makes each one demanding.",
    href: "/courses/explore?intent=Serious+Golf",
    cta: "See serious golf",
    relations: [
      { kind: "collection", slug: "serious-golf", label: "Serious Golf collection" },
    ],
    featured: false,
  },
  {
    key: "playing:downtown",
    type: "playing",
    kicker: "Explainer",
    title: "What can you play close to downtown?",
    dek: "Municipal and daily-fee golf inside the city core, ordered by distance from downtown rather than by reputation.",
    href: "/courses/explore?path=near-downtown",
    cta: "See downtown golf",
    relations: [
      { kind: "collection", slug: "near-downtown", label: "Near Downtown collection" },
      { kind: "area", slug: "central-austin", label: "Central Austin" },
    ],
    featured: false,
  },
] as const

/* ----------------------------------------------------------------- public */

/**
 * The full published Guides index, featured-first then course-before-playing.
 *
 * Trip guides are intentionally absent: the type exists in `GuideType` so the
 * hub and future content can use it, but no trip content is invented.
 */
export function allGuides(): GuideIndexEntry[] {
  const all = [...courseGuideEntries(), ...PLAYING_GUIDES]
  const rank = (e: GuideIndexEntry) =>
    (e.featured ? 0 : 1) * 10 + (e.type === "course" ? 0 : 1)
  return [...all].sort((a, b) => rank(a) - rank(b))
}

/** Guides of a given type. Used by the hub to group by category. */
export function guidesByType(type: GuideType): GuideIndexEntry[] {
  return allGuides().filter((g) => g.type === type)
}

/** Human labels + one-line descriptions for the categories that have content. */
export const GUIDE_TYPE_META: Record<
  GuideType,
  { label: string; blurb: string }
> = {
  course: {
    label: "Course Guides",
    blurb:
      "Researched understanding of a single course — history, design lineage and what to know before you go. Not a firsthand review.",
  },
  playing: {
    label: "Playing Guides",
    blurb:
      "Decision-oriented Austin golf: comparisons and scenarios that answer which course to play, and say why.",
  },
  trip: {
    label: "Trip Guides",
    blurb: "Golf-trip planning for visiting Austin. In progress.",
  },
}

/** Count of published guides overall. */
export function guideCount(): number {
  return allGuides().length
}
