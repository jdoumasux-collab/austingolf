"use client"

/**
 * Provider-free map surface (§9).
 *
 * The production map-provider decision is an explicit non-goal (§17), so this
 * plots the dataset's real verified coordinates in a Web Mercator projection
 * rather than pulling in a tile provider. That keeps the required behavior real:
 *
 *  - List and Map are two synchronized views of the same result state.
 *  - Hovering or selecting a card highlights the matching pin, and vice versa.
 *  - Palmer Lakeside renders at its own verified coordinates, visibly separate
 *    from the Barton Creek campus, because the data says so.
 *  - Panning/zooming does not change eligibility, and there is no Search This Area.
 *
 * Pins carry no ratings or prices — only identity and selection state.
 */

import { useMemo } from "react"
import { DOWNTOWN } from "@/lib/domain"
import type { ResultItem } from "@/lib/finder"
import { cn } from "@/lib/utils"

/** Web Mercator y, so relative north/south spacing is geographically faithful. */
function mercatorY(lat: number) {
  const rad = (lat * Math.PI) / 180
  return Math.log(Math.tan(Math.PI / 4 + rad / 2))
}

type Props = {
  items: ResultItem[]
  selectedId: string | null
  hoveredId: string | null
  onSelect: (id: string) => void
  onHoverChange?: (id: string | null) => void
  className?: string
}

export function CourseMap({
  items,
  selectedId,
  hoveredId,
  onSelect,
  onHoverChange,
  className,
}: Props) {
  const { points, downtown, rings } = useMemo(() => {
    if (!items.length) return { points: [], downtown: null, rings: [] }

    const raw = items.map((item) => ({
      id: item.entity.id,
      name: item.entity.name,
      shortName: item.entity.shortName ?? item.entity.name,
      isProperty: item.kind === "property",
      lng: item.entity.lng,
      lat: item.entity.lat,
    }))

    /*
     * Downtown Austin joins the bounds calculation so it is always on-panel.
     * Without a fixed referent a pin position is unreadable — "where is this?"
     * has no answer. DOWNTOWN is the same verified point the distance ordering
     * already uses, so nothing here is invented geography.
     */
    const xs = [...raw.map((p) => p.lng), DOWNTOWN.lng]
    const ys = [...raw.map((p) => mercatorY(p.lat)), mercatorY(DOWNTOWN.lat)]
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)

    // Pad the extent so a single result, or a tight cluster, still reads sensibly.
    const spanX = Math.max(maxX - minX, 0.06)
    const spanY = Math.max(maxY - minY, 0.0006)
    const padX = spanX * 0.16
    const padY = spanY * 0.16

    /** One projection for every plotted point, courses and referent alike. */
    const project = (lng: number, lat: number) => ({
      // Percentages keep the plot responsive without re-measuring on resize.
      left: ((lng - (minX - padX)) / (spanX + padX * 2)) * 100,
      top: (1 - (mercatorY(lat) - (minY - padY)) / (spanY + padY * 2)) * 100,
    })

    const downtownPoint = project(DOWNTOWN.lng, DOWNTOWN.lat)

    /*
     * Distance rings, computed from the projection rather than drawn by eye.
     * Radius comes from projecting a point the given number of miles due east
     * of Downtown and measuring the horizontal offset, so the ring matches the
     * same scale the pins are plotted on. Longitude degrees per mile vary with
     * latitude, hence the cos() term.
     */
    const ringSize = (miles: number) => {
      const degPerMileLng = 1 / (69.172 * Math.cos((DOWNTOWN.lat * Math.PI) / 180))
      const degPerMileLat = 1 / 69.172
      return {
        // Horizontal and vertical panel scales differ, so the same real-world
        // distance needs a different percentage on each axis.
        rx:
          project(DOWNTOWN.lng + miles * degPerMileLng, DOWNTOWN.lat).left -
          downtownPoint.left,
        ry:
          downtownPoint.top -
          project(DOWNTOWN.lng, DOWNTOWN.lat + miles * degPerMileLat).top,
      }
    }

    // Only keep a ring that is actually legible inside the plotted extent.
    const rings = [10, 20]
      .map((miles) => ({ miles, ...ringSize(miles) }))
      .filter((r) => r.rx > 5 && r.ry > 5 && r.rx < 140 && r.ry < 140)

    const placed = raw.map((p) => ({
      ...p,
      ...project(p.lng, p.lat),
    }))

    /*
     * Several courses share one verified coordinate — the three Barton Creek
     * campus courses sit on the resort point, and the three Clay/Kizer courses
     * sit on the municipal complex point. Drawn literally they stack into a
     * single unselectable pin, so co-located pins fan out a few percent around
     * their shared centre. The fan is a rendering affordance only — it never
     * edits the underlying coordinates, and Palmer Lakeside stays where the data
     * puts it because it has its own point and never joins a cluster.
     */
    const groups = new Map<string, typeof placed>()
    for (const p of placed) {
      const key = `${p.lat},${p.lng}`
      const bucket = groups.get(key)
      if (bucket) bucket.push(p)
      else groups.set(key, [p])
    }

    const fanned = placed.map((p) => {
      const bucket = groups.get(`${p.lat},${p.lng}`)!
      if (bucket.length === 1) return { ...p, coLocated: false }

      const i = bucket.indexOf(p)
      const angle = (i / bucket.length) * Math.PI * 2 - Math.PI / 2
      return {
        ...p,
        coLocated: true,
        left: p.left + Math.cos(angle) * 4.5,
        top: p.top + Math.sin(angle) * 7,
      }
    })

    return { points: fanned, downtown: downtownPoint, rings }
  }, [items])

  const showAllLabels = points.length > 0 && points.length <= 8

  if (!items.length) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border border-border bg-cream",
          className,
        )}
      >
        <p className="px-6 text-center text-sm text-ink-soft">
          No courses to plot in this state.
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-cream",
        className,
      )}
    >
      {/* Quiet geographic field. Decorative only — the pins carry the meaning. */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <pattern id="ag-map-grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path
              d="M8 0 L0 0 0 8"
              fill="none"
              stroke="var(--sand)"
              strokeOpacity="0.28"
              strokeWidth="0.25"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#ag-map-grid)" />

        {/*
          Distance rings from the verified Downtown point. Kept hairline and
          low-opacity so they stay subordinate to pin selection rather than
          turning the panel into a radar readout. viewBox units are the same
          percentages the pins use, and preserveAspectRatio="none" stretches
          them to the panel, so a geographic circle is an ellipse here.
        */}
        {downtown
          ? rings.map((r) => (
              <ellipse
                key={r.miles}
                cx={downtown.left}
                cy={downtown.top}
                rx={r.rx}
                ry={r.ry}
                fill="none"
                stroke="var(--sand)"
                strokeOpacity="0.55"
                strokeWidth="0.22"
                strokeDasharray="1 2"
              />
            ))
          : null}
      </svg>

      {/* Ring mileage, stated once each so the rings are self-explaining. */}
      {downtown
        ? rings.map((r) => (
            <span
              key={r.miles}
              aria-hidden="true"
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 text-[0.625rem] font-medium leading-none text-clay/55"
              style={{ left: `${downtown.left}%`, top: `${downtown.top - r.ry}%` }}
            >
              {r.miles} mi
            </span>
          ))
        : null}

      {/*
        North indicator. Truthful because the projection is north-up: Mercator y
        is inverted into `top`, so up on the panel is north.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-3 z-10 flex flex-col items-center rounded-sm bg-background/85 px-1.5 py-1 text-ink-soft"
      >
        <span className="text-[0.625rem] font-semibold leading-none">N</span>
        <span className="mt-0.5 block h-3 w-px bg-ink-soft/60" />
      </div>

      {/*
        Downtown Austin referent. Deliberately a different shape and weight from
        a course pin, and not a button, so it can never be mistaken for a result.
      */}
      {downtown ? (
        // pointer-events-none, not aria-hidden: the "Downtown" text is a
        // meaningful referent for screen readers, it just must never intercept a
        // click meant for a pin.
        <div
          className="pointer-events-none absolute z-20 flex flex-col items-center"
          style={{
            left: `${downtown.left}%`,
            top: `${downtown.top}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <span
            aria-hidden="true"
            className="block size-3 rotate-45 border-2 border-background bg-clay shadow-sm"
          />
          <span className="mt-1 whitespace-nowrap rounded-sm border border-clay/25 bg-background px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide leading-tight text-clay shadow-sm">
            Downtown
          </span>
        </div>
      ) : null}

      <p className="pointer-events-none absolute left-3 top-3 z-10 max-w-[15rem] rounded-sm bg-background/85 px-2 py-1 text-[0.6875rem] leading-tight text-ink-soft">
        Schematic · verified coordinates, relative positions only. Not to scale;
        no roads or water shown.
      </p>

      {/*
        Pins sit above every decorative layer (grid, rings, ring mileages, north
        indicator, schematic caption, Downtown referent). Without this the pin
        layer defaulted to z-auto while the Downtown referent was z-20, so map
        furniture painted over the pins and swallowed their clicks: a 20px pin
        near the middle of the panel was simply not clickable at its centre.
        Batch 1 made that visible by adding courses close to Downtown (Jimmy
        Clay, Riverside), but Butler Pitch & Putt was already affected.
      */}
      <ul className="absolute inset-0 z-30 m-0 list-none p-0">
        {points.map((p) => {
          const isSelected = selectedId === p.id
          const isHovered = hoveredId === p.id
          const emphasized = isSelected || isHovered

          return (
            <li
              key={p.id}
              className="absolute"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                transform: "translate(-50%, -50%)",
                zIndex: emphasized ? 30 : 10,
              }}
            >
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={`${p.name}${p.isProperty ? " (multi-course property)" : ""}${
                  p.coLocated ? " — mapped at a shared campus point" : ""
                }`}
                onClick={() => onSelect(p.id)}
                onMouseEnter={() => onHoverChange?.(p.id)}
                onMouseLeave={() => onHoverChange?.(null)}
                onFocus={() => onHoverChange?.(p.id)}
                onBlur={() => onHoverChange?.(null)}
                className="flex flex-col items-center gap-1 rounded-md p-1"
              >
                <span
                  className={cn(
                    "block rounded-full border-2 transition-all",
                    // Selected pins differ in size and ring, not just colour (§16).
                    isSelected
                      ? "size-4 border-background bg-green-deep ring-2 ring-green-deep"
                      : isHovered
                        ? "size-3.5 border-background bg-green"
                        : p.isProperty
                          ? "size-3.5 border-background bg-green/80"
                          : "size-3 border-background bg-ink-soft",
                  )}
                />
                {/*
                  Sparse result sets get permanent labels so the plot is readable
                  at a glance; dense ones label on hover/selection only.
                */}
                {emphasized || showAllLabels ? (
                  <span
                    className={cn(
                      "pointer-events-none whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-medium leading-tight",
                      emphasized
                        ? "bg-ink text-background"
                        : "bg-background/85 text-ink-soft",
                    )}
                    /* Nudge labels inward near the edges so names aren't clipped. */
                    style={{
                      transform:
                        p.left > 78
                          ? "translateX(-30%)"
                          : p.left < 22
                            ? "translateX(30%)"
                            : undefined,
                    }}
                  >
                    {p.shortName}
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
