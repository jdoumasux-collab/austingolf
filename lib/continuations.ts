/**
 * Validated continuations.
 *
 * A "Continue exploring" link that resolves to an empty Finder state is a broken
 * promise even though it returns HTTP 200: the golfer is told courses exist and
 * finds none. The failure mode is structural rather than accidental — a link
 * composed as `?area=X&access=public` is always empty when X contains only
 * private courses, and no amount of care in the copy fixes it.
 *
 * The fix is to answer the question before rendering the link. `lib/finder` is
 * pure TypeScript with no React dependency, so `parseState` and `computeResults`
 * can be called directly from a server component at build time. That means
 * eligibility is decided by the Finder itself — there is no second copy of the
 * filter logic here to drift out of sync with it.
 *
 * Scope note: this module is additive. The known Austin Country Club Course Page
 * continuation defect is deliberately NOT fixed here — `lib/course-page.ts`
 * still composes its own unvalidated links and is untouched by this run. This
 * helper exists so the Guide cannot introduce a second instance of the same
 * defect, and so the Course Page has something to adopt when that fix is
 * scheduled.
 */

import type { Course } from "@/lib/domain"
import { classificationById, quickPathById } from "@/lib/domain"
import { computeResults, parseState } from "@/lib/finder"

export type Continuation = { label: string; href: string; note: string }

/**
 * How many courses a Finder href would actually return.
 *
 * Internal links that are not Finder queries (a Course Page, a Property page)
 * are not Finder states at all, so they are reported as always-valid rather than
 * run through `computeResults`.
 */
function finderResultCount(href: string): number | null {
  const [path, query = ""] = href.split("?")
  if (path !== "/courses/explore") return null
  return computeResults(parseState(new URLSearchParams(query))).items.length
}

/**
 * Drop any candidate whose Finder state is empty.
 *
 * Non-Finder links pass through untouched. Order is preserved, so callers keep
 * control of priority and this only ever removes.
 */
export function validateContinuations(candidates: Continuation[]): Continuation[] {
  return candidates.filter((c) => {
    const count = finderResultCount(c.href)
    return count === null || count > 0
  })
}

/**
 * True when a Finder href would show at least one course.
 *
 * Exposed for callers that need to vary copy — not just presence — based on
 * whether a destination has anything in it.
 */
export function hasResults(href: string): boolean {
  const count = finderResultCount(href)
  return count === null || count > 0
}

/**
 * Where a Guide reader goes next.
 *
 * The first destination is always the Course Page, because that is the
 * product boundary this whole page depends on: the Guide explains, the Course
 * Page holds the maintained facts and the booking route. Everything after it is
 * a Finder state, composed from the course's own record and then validated, so
 * a Guide cannot promise a browse that turns out to be empty.
 *
 * Both the editorial intent and the Quick Path are read from the dataset rather
 * than hand-listed per Guide. A future Guide for a resort course picks up its own
 * classification and its own path with no extra content authoring.
 */
export function guideContinuations(course: Course): Continuation[] {
  const candidates: Continuation[] = [
    {
      // `shortName` where the dataset has one: "Lions Municipal Golf Course
      // Course Page" reads as a stutter, and the heading above already
      // establishes which course this is.
      label: `${course.shortName ?? course.name} Course Page`,
      href: `/courses/${course.slug}`,
      note: "Verified tees, access and facilities",
    },
  ]

  // The course's own core editorial classification, when it is a live pathway.
  const intent = course.recommendations.find((r) =>
    classificationById.has(r.classification),
  )?.classification
  if (intent) {
    candidates.push({
      label: `More ${intent} courses`,
      href: `/courses/explore?intent=${encodeURIComponent(intent)}`,
      note: classificationById.get(intent)?.orientation ?? "Other options",
    })
  }

  // Municipal golf, when this course is actually municipal.
  if (course.operatingContext === "Municipal" && quickPathById.has("austin-munis")) {
    candidates.push({
      label: "Austin munis",
      href: "/courses/explore?path=austin-munis",
      note: "City and municipal golf around the metro",
    })
  }

  candidates.push({
    label: `Courses in ${course.area}`,
    href: `/courses/explore?area=${encodeURIComponent(course.area)}`,
    note: "Nearby alternatives",
  })

  return validateContinuations(candidates)
}
