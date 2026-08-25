"use client"

/**
 * Course Finder (§7, §9, §13).
 *
 * One result state rendered as either List or Map. Selection and hover are
 * shared between the two views, so a card and its pin always agree. Filter
 * state lives in the URL, which is what makes Course Page -> Back restore the
 * intent, filters, view and scroll position.
 */

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { List, Map as MapIcon, SlidersHorizontal, X } from "lucide-react"
import {
  type CardContext,
  CourseCard,
  PropertyCard,
} from "@/components/cards/course-card"
import { FilterControls } from "@/components/finder/filter-controls"
import { NoResults } from "@/components/finder/no-results"
import { CourseMap } from "@/components/map/course-map"
import { classificationById, isResortProperty } from "@/lib/domain"
import {
  type FactualFilterId,
  type FinderState,
  type ResultItem,
  activeFilterCount,
  allowsRecommended,
  clearAll,
  clearFilters,
  computeResults,
  effectiveSort,
  hasDiscoveryIntent,
  parseState,
  serializeState,
  stateHeading,
} from "@/lib/finder"
import { cn } from "@/lib/utils"

export function FinderView() {
  const router = useRouter()
  const params = useSearchParams()

  const state = useMemo(() => parseState(new URLSearchParams(params.toString())), [params])
  const results = useMemo(() => computeResults(state), [state])

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  /**
   * Filter changes replace the history entry so Back returns to the previous
   * page rather than walking back through every filter toggle. View and
   * selection changes are also replacements for the same reason; the Course
   * Page link is the only real push.
   */
  const commit = useCallback(
    (next: FinderState) => {
      router.replace(serializeState(next), { scroll: false })
    },
    [router],
  )

  const patch = useCallback(
    (partial: Partial<FinderState>) => commit({ ...state, ...partial }),
    [commit, state],
  )

  const heading = stateHeading(state)
  const filterCount = activeFilterCount(state)
  const geographyFirst = effectiveSort(state) === "distance"

  const selectedItem =
    results.items.find((i) => i.entity.id === state.selected) ?? null

  /** Clears one factual constraint, leaving intent and every other filter intact. */
  const relaxPatch = (id: FactualFilterId): Partial<FinderState> => {
    switch (id) {
      case "areas":
        return { areas: [] }
      case "access":
        return { access: null }
      default:
        return { [id]: false } as Partial<FinderState>
    }
  }

  const relax = (id: FactualFilterId) => patch(relaxPatch(id))

  /*
   * Tier 2 recovery. Applied as a single patch so the URL updates once and the
   * promised count is what actually renders; applying them one at a time would
   * route through an intermediate state.
   */
  const relaxMany = (ids: FactualFilterId[]) =>
    patch(Object.assign({}, ...ids.map(relaxPatch)) as Partial<FinderState>)

  return (
    <div className="flex min-h-[60vh] flex-col">
      <FinderHeader
        state={state}
        heading={heading}
        resultCount={results.items.length}
        filterCount={filterCount}
        patch={patch}
        onClearFilters={() => commit(clearFilters(state))}
        onClearAll={() => commit(clearAll(state))}
        onOpenSheet={() => setSheetOpen(true)}
      />

      <div className="ag-shell w-full flex-1 py-6">
        {results.conflict ? (
          <NoResults
            state={state}
            conflict={results.conflict}
            onRelax={relax}
            onRelaxMany={relaxMany}
            onClearFilters={() => commit(clearFilters(state))}
          />
        ) : state.view === "map" ? (
          <MapPane
            items={results.items}
            state={state}
            hoveredId={hoveredId}
            onHoverChange={setHoveredId}
            onSelect={(id) => patch({ selected: id })}
            selectedItem={selectedItem}
            geographyFirst={geographyFirst}
          />
        ) : (
          <ListPane
            items={results.items}
            state={state}
            hoveredId={hoveredId}
            onHoverChange={setHoveredId}
            onSelect={(id) => patch({ selected: id })}
            geographyFirst={geographyFirst}
          />
        )}
      </div>

      {/* Mobile: filters open in a near-full-height sheet with Show results (§13). */}
      {sheetOpen ? (
        <FilterSheet
          state={state}
          patch={patch}
          resultCount={results.items.length}
          onClearFilters={() => commit(clearFilters(state))}
          onClearAll={() => commit(clearAll(state))}
          onClose={() => setSheetOpen(false)}
        />
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------------- header */

function FinderHeader({
  state,
  heading,
  resultCount,
  filterCount,
  patch,
  onClearFilters,
  onClearAll,
  onOpenSheet,
}: {
  state: FinderState
  heading: { label: string; orientation: string }
  resultCount: number
  filterCount: number
  patch: (p: Partial<FinderState>) => void
  onClearFilters: () => void
  onClearAll: () => void
  onOpenSheet: () => void
}) {
  const intentMeta = state.intent ? classificationById.get(state.intent) : null

  return (
    <header className="border-b border-border bg-cream">
      <div className="ag-shell py-6">
        {/* The originating discovery state stays visible (§7.1). */}
        {hasDiscoveryIntent(state) ? (
          <p className="ag-label text-green-deep">
            {intentMeta ? "Find the right round" : "Quick path"}
          </p>
        ) : null}

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="ag-display text-2xl text-ink sm:text-3xl">{heading.label}</h1>
          <p className="text-sm text-ink-soft">
            {resultCount} result{resultCount === 1 ? "" : "s"}
          </p>
        </div>

        {heading.orientation ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {heading.orientation}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {/* Desktop controls */}
          <div className="hidden md:block">
            <FilterControls
              state={state}
              patch={patch}
              onClearFilters={onClearFilters}
              onClearAll={onClearAll}
            />
          </div>

          {/* Mobile: a single compact Filters entry into the sheet */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={onOpenSheet}
              className={cn(
                "flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                filterCount > 0
                  ? "border-green bg-green/10 text-green-deep"
                  : "border-input bg-background text-ink",
              )}
            >
              <SlidersHorizontal aria-hidden="true" className="size-3.5" />
              Filters
              {filterCount > 0 ? (
                <span className="rounded-full bg-green px-1.5 text-xs text-primary-foreground">
                  {filterCount}
                </span>
              ) : null}
            </button>
            {filterCount > 0 ? (
              <button
                type="button"
                onClick={onClearFilters}
                className="text-sm font-medium text-ink-soft underline underline-offset-4"
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <span className="sr-only sm:not-sr-only">Sort</span>
              <select
                value={effectiveSort(state)}
                onChange={(e) =>
                  patch({ sort: e.target.value as FinderState["sort"] })
                }
                className="min-h-11 rounded-full border border-input bg-background px-3 py-2 text-sm font-medium text-ink"
              >
                {/*
                  Gen2 §2: Recommended is offered only where an editorial intent
                  gives it meaning. Neutral Explore All has no universal ranking
                  to sort by, so the option is absent rather than misleading.
                */}
                {allowsRecommended(state) ? (
                  <option value="recommended">Recommended</option>
                ) : null}
                <option value="name">Name</option>
                <option value="distance">Closest to downtown</option>
              </select>
            </label>

            <ViewToggle state={state} patch={patch} />
          </div>
        </div>

        {/* Neutral Explore All exposes Find the Right Round as an extra entry (§7.1). */}
        {!hasDiscoveryIntent(state) ? (
          <p className="mt-4 text-sm text-ink-soft">
            Not sure what you need?{" "}
            <Link
              href="/courses#find-the-right-round"
              className="font-semibold text-green-deep underline underline-offset-4"
            >
              Find the right round
            </Link>
          </p>
        ) : null}
      </div>
    </header>
  )
}

function ViewToggle({
  state,
  patch,
}: {
  state: FinderState
  patch: (p: Partial<FinderState>) => void
}) {
  return (
    <div
      role="group"
      aria-label="View"
      className="flex overflow-hidden rounded-full border border-input bg-background"
    >
      {(["list", "map"] as const).map((v) => {
        const active = state.view === v
        const Icon = v === "list" ? List : MapIcon
        return (
          <button
            key={v}
            type="button"
            aria-pressed={active}
            onClick={() => patch({ view: v })}
            className={cn(
              "flex min-h-11 items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-green text-primary-foreground"
                : "text-ink hover:text-green-deep",
            )}
          >
            <Icon aria-hidden="true" className="size-3.5" />
            {v === "list" ? "List" : "Map"}
          </button>
        )
      })}
    </div>
  )
}

/* ----------------------------------------------------------------- panes */

/** Shared card renderer so List and Map trays cannot drift apart. */
function ResultCard({
  item,
  state,
  selected,
  onSelect,
  onHoverChange,
  geographyFirst,
  layout,
}: {
  item: ResultItem
  state: FinderState
  selected: boolean
  onSelect: () => void
  onHoverChange: (hovering: boolean) => void
  geographyFirst: boolean
  layout: "grid" | "row"
}) {
  /*
   * Derived from state that already exists — no new state is introduced.
   * The map tray is the only caller passing layout="row", and its constraints
   * (narrow column, pin already showing location) dominate the others.
   */
  const context: CardContext =
    layout === "row"
      ? "map"
      : geographyFirst
        ? "geographic"
        : item.kind === "course" && item.reason
          ? "intent"
          : "neutral"

  if (item.kind === "property") {
    return (
      <PropertyCard
        property={item.entity}
        rationale={propertyRationale(item, state)}
        selected={selected}
        onSelect={onSelect}
        onHoverChange={onHoverChange}
        context={context}
      />
    )
  }
  return (
    <CourseCard
      course={item.entity}
      reason={item.reason}
      href={`/courses/${item.entity.slug}?from=${encodeURIComponent(serializeState({ ...state, selected: item.entity.id }))}`}
      selected={selected}
      onSelect={onSelect}
      onHoverChange={onHoverChange}
      /*
       * Distance leads where geography drives the ordering, and is always
       * supplied in map context — there the number is what makes a pin's
       * position interpretable relative to the Downtown referent.
       */
      distanceLabel={
        geographyFirst || layout === "row" ? `${item.distance.toFixed(1)} mi` : null
      }
      context={context}
    />
  )
}

/**
 * Property-level rationale. States only the structural fact the dataset
 * supports — several courses under one property — so a property never invents a
 * property-level claim.
 *
 * Resort wording is gated on the master's property_type. These lines previously
 * assumed every property was Barton Creek, so the municipal Clay/Kizer complex
 * would have been credited with a resort base and on-site lodging it does not
 * have. "Lodging on site" in particular is a resort-only fact, so a non-resort
 * property falls back to the structural claim instead.
 */
function propertyRationale(
  item: Extract<ResultItem, { kind: "property" }>,
  state: FinderState,
): string | undefined {
  const count = item.entity.courses.length
  const isResort = isResortProperty(item.entity)
  const base = isResort ? "resort" : "property"
  if (state.intent === "Great for Groups") {
    // "without changing hotels" was an inference about a group's lodging
    // logistics, which the dataset does not support. The supported fact is
    // structural: several courses sit under one property.
    return `${count} courses under one ${base}, so a large group can consider more than one course from a single ${base} base.`
  }
  // Kept as defence-in-depth. propertyIsUsefulAnswer already restricts this
  // intent to resorts, so isResort is currently always true here — but the
  // lodging claim is the single most damaging thing this file can assert about a
  // municipal course, so it stays gated at the point of assertion too.
  if (state.intent === "Golf Trip / Stay & Play" && isResort) {
    return `${count} courses with lodging on site.`
  }
  return `${count} courses under one ${base}.`
}

function ListPane({
  items,
  state,
  hoveredId,
  onHoverChange,
  onSelect,
  geographyFirst,
}: {
  items: ResultItem[]
  state: FinderState
  hoveredId: string | null
  onHoverChange: (id: string | null) => void
  onSelect: (id: string) => void
  geographyFirst: boolean
}) {
  if (!items.length) {
    return (
      <p className="rounded-xl border border-border bg-card p-6 text-sm text-ink-soft">
        No courses in this state.
      </p>
    )
  }

  return (
    <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.entity.id}>
          <ResultCard
            item={item}
            state={state}
            selected={state.selected === item.entity.id || hoveredId === item.entity.id}
            onSelect={() => onSelect(item.entity.id)}
            onHoverChange={(h) => onHoverChange(h ? item.entity.id : null)}
            geographyFirst={geographyFirst}
            layout="grid"
          />
        </li>
      ))}
    </ul>
  )
}

function MapPane({
  items,
  state,
  hoveredId,
  onHoverChange,
  onSelect,
  selectedItem,
  geographyFirst,
}: {
  items: ResultItem[]
  state: FinderState
  hoveredId: string | null
  onHoverChange: (id: string | null) => void
  onSelect: (id: string) => void
  selectedItem: ResultItem | null
  geographyFirst: boolean
}) {
  const listRef = useRef<HTMLUListElement>(null)

  // Selecting a pin brings the matching card into view in the side list.
  useEffect(() => {
    if (!state.selected || !listRef.current) return
    const el = listRef.current.querySelector(`[data-id="${state.selected}"]`)
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [state.selected])

  return (
    <div className="flex flex-col gap-4 lg:h-[min(38rem,calc(100vh-19rem))] lg:flex-row">
      {/* Desktop: synchronized side list. Hidden on mobile, where the map is near-full-screen. */}
      <ul
        ref={listRef}
        className="hidden list-none flex-col gap-3 overflow-y-auto p-0 lg:flex lg:w-[22rem] lg:shrink-0"
      >
        {items.map((item) => (
          <li key={item.entity.id} data-id={item.entity.id}>
            <ResultCard
              item={item}
              state={state}
              selected={
                state.selected === item.entity.id || hoveredId === item.entity.id
              }
              onSelect={() => onSelect(item.entity.id)}
              onHoverChange={(h) => onHoverChange(h ? item.entity.id : null)}
              geographyFirst={geographyFirst}
              layout="row"
            />
          </li>
        ))}
      </ul>

      <div className="flex min-h-[26rem] flex-1 flex-col gap-3 lg:min-h-0">
        <CourseMap
          items={items}
          selectedId={state.selected}
          hoveredId={hoveredId}
          onSelect={onSelect}
          onHoverChange={onHoverChange}
          className="min-h-[22rem] flex-1"
        />

        {/* Mobile selected-course tray (§13). */}
        {selectedItem ? (
          <div className="lg:hidden">
            <ResultCard
              item={selectedItem}
              state={state}
              selected
              onSelect={() => onSelect(selectedItem.entity.id)}
              onHoverChange={() => {}}
              geographyFirst={geographyFirst}
              layout="row"
            />
          </div>
        ) : (
          <p className="text-center text-sm text-ink-soft lg:hidden">
            Tap a pin to see the course.
          </p>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ mobile sheet */

function FilterSheet({
  state,
  patch,
  resultCount,
  onClearFilters,
  onClearAll,
  onClose,
}: {
  state: FinderState
  patch: (p: Partial<FinderState>) => void
  resultCount: number
  onClearFilters: () => void
  onClearAll: () => void
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  /*
   * Focus management for a hand-rolled modal (§13).
   *
   * Three separate obligations, all handled here:
   *  1. On open, move focus into the dialog. We target the heading rather than
   *     the Close button so the first thing a keyboard user lands on is the
   *     dialog's name, not "dismiss".
   *  2. While open, keep Tab inside. Without this, tabbing walked straight out
   *     of the sheet into the result cards behind the overlay.
   *  3. On close, put focus back on the Filters trigger. This previously
   *     appeared to work only because focus had never actually left it; now
   *     that we move focus in, the restore has to be explicit.
   */
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    headingRef.current?.focus()

    const focusable = () => {
      const root = dialogRef.current
      if (!root) return [] as HTMLElement[]
      return Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key !== "Tab") return

      const items = focusable()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null

      // Wrap at both ends, and pull focus back in if it has escaped
      // (the heading is tabindex=-1, so it is not part of the cycle).
      if (e.shiftKey) {
        if (active === first || active === headingRef.current || !dialogRef.current?.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last || !dialogRef.current?.contains(active)) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        tabIndex={-1}
        className="absolute inset-0 bg-ink/40"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className="relative flex max-h-[88vh] flex-col rounded-t-2xl bg-background"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          {/* tabindex=-1 so it can receive programmatic focus on open without
              joining the Tab cycle. */}
          <h2 ref={headingRef} tabIndex={-1} className="ag-display text-lg text-ink outline-none">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex size-11 items-center justify-center rounded-full text-ink-soft hover:text-ink"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <FilterControls
            state={state}
            patch={patch}
            onClearFilters={onClearFilters}
            onClearAll={onClearAll}
            variant="stacked"
          />
        </div>

        <div className="flex items-center gap-3 border-t border-border px-4 py-3.5">
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm font-medium text-ink-soft"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-green px-5 py-3.5 text-sm font-semibold text-primary-foreground"
          >
            Show {resultCount} result{resultCount === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  )
}
