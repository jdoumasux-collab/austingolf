/**
 * Course Guide registry.
 *
 * Guides are hand-authored TypeScript modules, not database rows and not a CMS.
 * Three reasons that is the right shape here: Guide prose is versioned editorial
 * that belongs in review alongside the code, the schema does real trust work
 * that a CMS field would not enforce, and there are going to be a handful of
 * these rather than thousands.
 *
 * Registration is explicit. A Guide exists because it was added to this array
 * after its evidence was approved — there is no directory scan that could
 * publish a draft by accident.
 *
 * Editorial content lives here rather than in the generated Master Course
 * Database, which stays canonical for structured facts. The two are joined by
 * slug at render time.
 */

import { courseBySlug } from "@/lib/domain"
import type { Guide } from "@/lib/guide"
import { lionsGuide } from "@/content/guides/lions-municipal-golf-course"
import { royKizerGuide } from "@/content/guides/roy-kizer-golf-course"

/**
 * Every published Guide.
 *
 * Guides whose slug does not match a course in the canonical projection are
 * dropped rather than rendered. A Guide for a course that does not exist — or
 * whose slug changed in the master data — would otherwise produce a page with no
 * structured facts to reference and no Course Page to return to.
 */
const published: Guide[] = [lionsGuide, royKizerGuide].filter((g) => courseBySlug.has(g.slug))

export const guideBySlug = new Map(published.map((g) => [g.slug, g]))

/** The Guide for a course slug, or undefined when none is published. */
export const getGuide = (slug: string): Guide | undefined => guideBySlug.get(slug)

/**
 * Whether a published Guide exists for this course.
 *
 * Used by the Course Page so a course without a Guide never renders a Guide
 * link. This is the whole mechanism preventing dead handoffs — seventeen of the
 * eighteen prototype courses have no Guide, and all seventeen must show nothing.
 */
export const hasGuide = (slug: string): boolean => guideBySlug.has(slug)

/** Slugs with a published Guide. Used for static param generation. */
export const guideSlugs = (): string[] => [...guideBySlug.keys()]
