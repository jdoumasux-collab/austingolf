"use client"

/**
 * Course search (§6).
 *
 * Matches course names, common short names, meaningful areas and multi-course
 * properties. Selecting a course navigates straight to its Course Page — a
 * known-item lookup is never routed through the Finder to preserve the
 * discovery system. Area matches are the one exception: an area is a
 * geographic need, so it opens the Finder filtered to that area.
 */

import { useId, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Building2, Flag } from "lucide-react"
import { search, type SearchHit } from "@/lib/finder"
import { propertyKindLabel } from "@/lib/domain"
import { cn } from "@/lib/utils"

type Props = {
  size?: "lg" | "sm"
  placeholder?: string
  className?: string
  autoFocusOnMount?: boolean
}

function hrefForHit(hit: SearchHit) {
  if (hit.kind === "course") return `/courses/${hit.entity.slug}`
  if (hit.kind === "property") return `/properties/${hit.entity.slug}`
  return `/courses/explore?area=${encodeURIComponent(hit.area)}`
}

function keyForHit(hit: SearchHit) {
  return hit.kind === "area" ? `area:${hit.area}` : `${hit.kind}:${hit.entity.id}`
}

export function CourseSearch({
  size = "lg",
  // "resort" was accurate when Barton Creek was the only property; the municipal
  // Clay/Kizer complex is now searchable too, so the noun is generic.
  placeholder = "Search a course, area or property",
  className,
  autoFocusOnMount = false,
}: Props) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const hits = open ? search(query) : []
  const isOpen = open && hits.length > 0

  const go = (hit: SearchHit) => {
    setOpen(false)
    setQuery("")
    inputRef.current?.blur()
    router.push(hrefForHit(hit))
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Respect CJK IME composition before treating Enter as a submit.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (!isOpen) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % hits.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + hits.length) % hits.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      const hit = hits[activeIndex]
      if (hit) go(hit)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  const large = size === "lg"

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft",
            large ? "size-5" : "size-4",
          )}
        />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Search courses, areas and properties"
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          autoFocus={autoFocusOnMount}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActiveIndex(0)
          }}
          onFocus={() => setOpen(true)}
          // Delay so a click on an option registers before the list unmounts.
          onBlur={() => window.setTimeout(() => setOpen(false), 140)}
          onKeyDown={onKeyDown}
          className={cn(
            "w-full rounded-lg border border-input bg-background text-ink placeholder:text-ink-soft/80",
            // A border hue change alone is not a sufficient focus indicator --
            // it fails low-vision and forced-colors users. Use the same 2px
            // offset ring the Course Card already uses so focus reads
            // identically across the app. Both search instances (header and
            // hero) render this component, so one treatment covers both.
            "transition-colors focus:border-green",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green",
            large ? "py-3.5 pl-11 pr-4 text-base" : "py-2 pl-9 pr-3 text-sm",
          )}
        />
      </div>

      {isOpen ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-lg border border-border bg-background py-1 shadow-lg shadow-ink/5"
        >
          {hits.map((hit, i) => {
            const active = i === activeIndex
            return (
              <li key={keyForHit(hit)} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(hit)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors",
                    active ? "bg-green-wash" : "bg-transparent",
                  )}
                >
                  <HitIcon hit={hit} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {hit.kind === "area" ? hit.area : hit.entity.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-soft">
                      {subtitleForHit(hit)}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function HitIcon({ hit }: { hit: SearchHit }) {
  const cls = "size-4 shrink-0 text-green"
  if (hit.kind === "property") return <Building2 aria-hidden="true" className={cls} />
  if (hit.kind === "area") return <MapPin aria-hidden="true" className={cls} />
  return <Flag aria-hidden="true" className={cls} />
}

function subtitleForHit(hit: SearchHit) {
  if (hit.kind === "area") {
    return `Area · ${hit.count} courses`
  }
  if (hit.kind === "property") {
    const n = hit.entity.courses.length
    // Derived: not every multi-course property is a resort.
    return `${propertyKindLabel(hit.entity)} · ${n} course${n === 1 ? "" : "s"}`
  }
  const c = hit.entity
  const parts = [c.area]
  if (c.accessType) parts.push(c.accessType)
  return parts.join(" · ")
}
