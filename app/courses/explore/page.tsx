import { Suspense } from "react"
import { FinderView } from "@/components/finder/finder-view"

export const metadata = {
  // Gen2 §10: the root layout template appends "| AustinGolf".
  title: "Course Finder",
  description:
    "Filter Austin golf courses by area, access and round format, in list or map view.",
}

/**
 * Neutral, discovery and map Finder states all render from this one route (§4).
 * The state itself lives in the URL, which is what makes back-navigation restore
 * intent, filters and view.
 */
export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="ag-shell py-12 text-ink-soft">Loading…</div>}>
      <FinderView />
    </Suspense>
  )
}
