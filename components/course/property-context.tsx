/**
 * Module 9 — property context.
 *
 * The Course is the golf entity; the Property is the resort/business that
 * contains it. This module states the relationship and hands off to the Property
 * page without ever letting property membership overwrite course geography.
 *
 * PALMER LAKESIDE IS THE REGRESSION CASE. It belongs to the Barton Creek golf
 * structure while sitting ~18 miles from the main campus on Lake Travis, so the
 * page must communicate both truths at once: same resort, different place. The
 * distance is stated from projected coordinates rather than described, which is
 * what keeps "part of Barton Creek" from being read as "at Barton Creek".
 */

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { PropertyRelation } from "@/lib/course-page"
import type { Course } from "@/lib/domain"

export function PropertyContext({
  relation,
  course,
}: {
  relation: PropertyRelation
  course: Course
}) {
  const { property, miles, offCampus } = relation

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm leading-relaxed text-ink-soft">
        {offCampus ? (
          <>
            One of {property.courses.length} courses at{" "}
            <span className="font-medium text-ink">{property.name}</span>, but a
            separate location:{" "}
            {/*
              Course geography, never the property's. Naming the course's own area
              and the drive is what prevents an implied shared campus.
            */}
            <span className="font-medium text-ink">
              {course.area} is about {miles.toFixed(0)} miles from the main resort
              campus
            </span>
            . Plan travel time if you are combining it with a round there.
          </>
        ) : (
          <>
            One of {property.courses.length} courses at{" "}
            <span className="font-medium text-ink">{property.name}</span> in{" "}
            {course.area}.
          </>
        )}
      </p>

      <Link
        href={`/properties/${property.slug}`}
        className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-green-deep hover:underline"
      >
        All courses at {property.shortName ?? property.name}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </div>
  )
}
