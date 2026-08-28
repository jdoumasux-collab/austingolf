"use client"

/**
 * Global site search combobox (Global Search brief §4).
 *
 * A sibling of CourseSearch, NOT a replacement: CourseSearch remains the
 * Courses/Explorer known-item tool (§7). This one navigates ACROSS all five
 * content types and always offers a route to the full /search results page.
 *
 * The accessible combobox mechanics — role/aria-expanded/aria-controls/
 * aria-autocomplete, arrow/Enter/Escape handling, the focus ring, the IME
 * composition guard and the blur delay — are carried over verbatim from
 * CourseSearch so keyboard and screen-reader behaviour stay identical to the
 * search the app already shipped.
 */

import { useId, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Building2, Flag, Layers, BookOpen, ArrowRight } from "lucide-react"
import {
  globalSearch,
  type GlobalSearchHit,
  type GlobalSearchType,
  TYPE_LABEL,
} from "@/lib/global-search"
import { cn } from "@/lib/utils"

type Props = {
  size?: "lg" | "sm"
  placeholder?: string
  className?: string
  autoFocusOnMount?: boolean
}

/** A virtual trailing row that sends the user to the full results page. */
type SeeAllRow = { kind: "see-all" }
type Row = GlobalSearchHit | SeeAllRow

const isSeeAll = (r: Row): r is SeeAllRow => (r as SeeAllRow).kind === "see-all"

export function GlobalSearch({
  size = "sm",
  placeholder = "Search courses, collections, areas, guides",
  className,
  autoFocusOnMount = false,
}: Props) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const hits = open ? globalSearch(query, 8) : []
  // The "see all" row appears whenever there is a usable query, so users always
  // know the full results page exists (§6).
  const showSeeAll = query.trim().length >= 2
  const rows: Row[] = showSeeAll ? [...hits, { kind: "see-all" }] : hits
  const isOpen = open && rows.length > 0

  const goToSearch = () => {
    const q = query.trim()
    setOpen(false)
    inputRef.current?.blur()
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const activate = (row: Row) => {
    if (isSeeAll(row)) {
      goToSearch()
      return
    }
    setOpen(false)
    setQuery("")
    inputRef.current?.blur()
    router.push(row.href)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Respect CJK IME composition before treating Enter as a submit.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === "Enter") {
      e.preventDefault()
      // Enter on an active row activates it; Enter with nothing usable but a
      // query still takes the user to the full results page.
      const row = isOpen ? rows[activeIndex] : undefined
      if (row) activate(row)
      else if (query.trim().length >= 2) goToSearch()
      return
    }
    if (!isOpen) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % rows.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + rows.length) % rows.length)
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
          aria-label="Search AustinGolf"
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
          {rows.map((row, i) => {
            const active = i === activeIndex
            const key = isSeeAll(row) ? "see-all" : row.id
            return (
              <li key={key} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => activate(row)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors",
                    active ? "bg-green-wash" : "bg-transparent",
                  )}
                >
                  {isSeeAll(row) ? (
                    <>
                      <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-green" />
                      <span className="min-w-0 flex-1 text-sm font-medium text-ink">
                        See all results for &ldquo;{query.trim()}&rdquo;
                      </span>
                    </>
                  ) : (
                    <>
                      <TypeIcon type={row.type} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{row.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-ink-soft">
                          {TYPE_LABEL[row.type]}
                          {row.descriptor ? ` · ${row.descriptor}` : ""}
                        </span>
                      </span>
                    </>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function TypeIcon({ type }: { type: GlobalSearchType }) {
  const cls = "size-4 shrink-0 text-green"
  if (type === "property") return <Building2 aria-hidden="true" className={cls} />
  if (type === "area") return <MapPin aria-hidden="true" className={cls} />
  if (type === "collection") return <Layers aria-hidden="true" className={cls} />
  if (type === "guide") return <BookOpen aria-hidden="true" className={cls} />
  return <Flag aria-hidden="true" className={cls} />
}
