"use client"

import { GlobalSearch } from "@/components/search/global-search"

/**
 * The header search is site-wide: it spans Courses, Properties, Collections,
 * Areas and Guides and routes to /search for the full result set. The Courses
 * product keeps its own CourseSearch (the hero / Finder known-item lookup) —
 * global search complements it rather than replacing it (§7).
 */
export function HeaderSearch() {
  return <GlobalSearch size="sm" />
}
