"use client"

/**
 * Course and Property cards.
 *
 * Required hierarchy (§8, Visual Reference §9):
 *   PHOTO -> NAME -> GEOGRAPHY · ACCESS -> WHY IT FITS / ORIENTATION -> 0-2 facts
 *
 * The whole card is the Course Page affordance; there is no redundant
 * "View Course" button. No ratings, prices, par, yardage, slope or badge walls.
 * A card with an active intent shows one concise approved "Why it fits"; a
 * neutral card orients from real fields instead of manufacturing praise.
 *
 * `context` keeps that hierarchy fixed while letting the *weights* change, so
 * the card answers the question the golfer is actually holding:
 *
 *   neutral    — differentiate 15 near-identical 18-hole courses
 *   intent     — approved reasoning leads
 *   geographic — distance leads; explanatory copy only when it earns its place
 *   map        — the pin carries location, so the card carries everything else
 *
 * One component rather than four siblings: three cards would drift apart, which
 * is the same reason List and Map share a single renderer.
 */

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BrandedImage } from "@/components/brand/branded-image"
import {
  type Course,
  type Property,
  type Recommendation,
  geographyAccessLine,
  isExceptionalFormat,
  neutralOrientation,
  propertyKindLabel,
} from "@/lib/domain"
import { cn } from "@/lib/utils"

export type CardContext = "neutral" | "intent" | "geographic" | "map"

type CourseCardProps = {
  course: Course
  /** Approved contextual reason for the active intent, when there is one. */
  reason?: Recommendation | null
  href: string
  /** Synchronized selection shared with the map (§9). */
  selected?: boolean
  onSelect?: () => void
  onHoverChange?: (hovering: boolean) => void
  /** Distance from downtown, shown only where geography is the leading signal. */
  distanceLabel?: string | null
  context?: CardContext
}

export function CourseCard({
  course,
  reason,
  href,
  selected = false,
  onSelect,
  onHoverChange,
  distanceLabel,
  context = "neutral",
}: CourseCardProps) {
  const isMap = context === "map"

  /*
   * The media is identity, not information: the same wordmark on all 15 cards.
   * It stays (a truthful fallback beats a fake photo) but it no longer takes
   * the majority of the card, and it is dropped entirely in the map tray where
   * it competed with the map for the narrowest column on the page. The fixed
   * aspect container means real photography can swap in with no restructuring.
   */
  const media = isMap ? null : (
    // Shorter aspect on a single-column phone layout: at 390px wide a 2/1 block
    // is ~60% of the card again, which is the problem this was meant to solve.
    <div className="relative aspect-[5/2] w-full shrink-0 overflow-hidden bg-cream sm:aspect-[2/1]">
      <BrandedImage
        seedKey={course.id}
        alt={`AustinGolf placeholder graphic for ${course.name}`}
        className="h-full w-full"
      />
    </div>
  )

  /*
   * Explanatory copy is not automatic — the slot is filled only when the copy
   * moves the decision the golfer is actually making. In a geographic context
   * they are choosing on distance, so "Designed by Leon Howard." is omitted.
   *
   * The exception is an exceptional format: "9-hole pitch & putt" tells someone
   * picking a course near downtown that this is not a full round, which changes
   * the choice. So format survives the geographic filter and generic
   * attribution does not.
   */
  const neutral =
    context === "geographic" && !isExceptionalFormat(course)
      ? null
      : neutralOrientation(course)
  const body = reason?.whyItFits ?? neutral

  return (
    <article
      data-selected={selected || undefined}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      className={cn(
        // h-full so cards sharing a grid row align at the bottom even when one
        // carries a longer reason or an "Explore courses" row.
        "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-shadow",
        // The stretched link sets outline-none (an outline on the <a> would wrap
        // only the title text, not the card), so the ring has to live here or
        // keyboard focus is invisible — see §13 in globals.css.
        "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-green",
        // Selected state uses border weight + a tint, never colour alone (§16).
        selected
          ? "border-green bg-green/[0.04] shadow-md shadow-green/10"
          : "border-border hover:shadow-md hover:shadow-ink/5",
      )}
    >
      {media}

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-1.5",
          isMap ? "p-3.5" : "p-4",
        )}
      >
        <h3
          className={cn(
            "ag-display leading-snug text-ink",
            isMap ? "text-base" : "text-lg",
          )}
        >
          <Link
            href={href}
            onClick={onSelect}
            // Stretched link: the entire card is the affordance.
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {course.name}
          </Link>
        </h3>

        {/*
          Distance is the primary signal wherever it drives the ordering, so it
          gets its own line and real weight instead of being appended to a 13px
          muted line as "· 0.8 mi".
        */}
        {context === "geographic" && distanceLabel ? (
          <p className="text-sm font-medium text-green-deep">
            {distanceLabel} from downtown
          </p>
        ) : null}

        <p className="text-[0.8125rem] leading-snug text-ink-soft">
          {isMap ? (
            /*
             * The map tray previously dropped the area on the theory that the
             * pin conveyed location. It does not: a pin has no meaning without
             * a referent, and screen-reader users got no location at all. So the
             * tray now carries distance AND area, which makes the map view a
             * superset of the list card rather than a downgrade.
             */
            <>
              {distanceLabel ? (
                <>
                  <span className="font-medium text-green-deep">
                    {distanceLabel}
                  </span>
                  <span aria-hidden="true"> · </span>
                </>
              ) : null}
              {geographyAccessLine(course)}
            </>
          ) : (
            <>
              {geographyAccessLine(course)}
              {context !== "geographic" && distanceLabel ? (
                <>
                  <span aria-hidden="true"> · </span>
                  <span>{distanceLabel}</span>
                </>
              ) : null}
            </>
          )}
        </p>

        {/*
          Clamped so a long approved reason cannot blow out row height — but at
          3 lines, not 2, in the narrow map tray. At 2 the longest approved
          reason lost its final clause ("…a substantive architectural test
          without relying on raw length"), which reads as a plain difficulty
          claim once the qualifier is cut. Truncation must not restate approved
          reasoning as something the dataset does not say. 3 lines fits every
          reason in the dataset at this width.
        */}
        {body ? (
          <p
            className={cn(
              "mt-0.5 text-sm leading-relaxed",
              reason ? "text-ink" : "text-ink-soft",
              "line-clamp-3",
            )}
          >
            {body}
          </p>
        ) : null}
      </div>
    </article>
  )
}

type PropertyCardProps = {
  property: Property
  /** Property-level rationale, e.g. why a resort solves a group need (§10). */
  rationale?: string
  selected?: boolean
  onSelect?: () => void
  onHoverChange?: (hovering: boolean) => void
  context?: CardContext
}

/**
 * Property card. Visually related to a Course card but states property context
 * and multiple courses, and uses "Explore courses" as its natural action (§8).
 *
 * The kind chip is derived, because a projected property is not necessarily a
 * resort — Clay/Kizer is a municipal complex.
 */
export function PropertyCard({
  property,
  rationale,
  selected = false,
  onSelect,
  onHoverChange,
  context = "neutral",
}: PropertyCardProps) {
  const isMap = context === "map"

  return (
    <article
      data-selected={selected || undefined}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-shadow",
        "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-green",
        selected
          ? "border-green bg-green/[0.04] shadow-md shadow-green/10"
          : "border-green/25 hover:shadow-md hover:shadow-ink/5",
      )}
    >
      {isMap ? null : (
        <div className="relative aspect-[5/2] w-full shrink-0 overflow-hidden bg-cream sm:aspect-[2/1]">
          <BrandedImage
            seedKey={property.id}
            alt={`AustinGolf placeholder graphic for ${property.name}`}
            className="h-full w-full"
          />
          <span className="absolute left-2.5 top-2.5 rounded-sm bg-background/90 px-2 py-1">
            <span className="ag-label text-green-deep">
              {propertyKindLabel(property)}
            </span>
          </span>
        </div>
      )}

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-1.5",
          isMap ? "p-3.5" : "p-4",
        )}
      >
        {/* With no media in the map tray, the chip still has to mark this a property. */}
        {isMap ? (
          <span className="ag-label text-green-deep">
            {propertyKindLabel(property)}
          </span>
        ) : null}

        <h3
          className={cn(
            "ag-display leading-snug text-ink",
            isMap ? "text-base" : "text-lg",
          )}
        >
          <Link
            href={`/properties/${property.slug}`}
            onClick={onSelect}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {property.name}
          </Link>
        </h3>

        {/*
          The course count used to appear here and again in the rationale
          immediately below. The rationale states it in context, so this line
          stays purely geographic.
        */}
        {/* Area is kept in map context for the same reason as the Course card:
            a pin alone does not communicate location. */}
        <p className="text-[0.8125rem] leading-snug text-ink-soft">
          {geographyAccessLine(property)}
        </p>

        {rationale ? (
          <p
            className={cn(
              "mt-0.5 text-sm leading-relaxed text-ink",
              "line-clamp-3",
            )}
          >
            {rationale}
          </p>
        ) : null}

        <p className="mt-auto flex items-center gap-1.5 pt-2">
          <span className="ag-label text-green-deep">Explore courses</span>
          <ArrowRight aria-hidden="true" className="size-3.5 text-green-deep" />
        </p>
      </div>
    </article>
  )
}
