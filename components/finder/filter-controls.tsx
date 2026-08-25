"use client"

/**
 * Finder filter controls (§7.1, §7.2).
 *
 * Area, Access and More Filters only. No price, slope/rating, favorites or
 * compare — those are explicitly unapproved controls. Every More Filters
 * option is backed by real prototype data, and each one states its coverage
 * so an unverified course never reads as a "No".
 */

import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { areaGroups } from "@/lib/domain"
import type { AccessFilter, FinderState } from "@/lib/finder"
import { activeFilterCount } from "@/lib/finder"
import { cn } from "@/lib/utils"

type Props = {
  state: FinderState
  patch: (next: Partial<FinderState>) => void
  onClearFilters: () => void
  onClearAll: () => void
  /** Mobile renders these inside a sheet instead of as popovers. */
  variant?: "bar" | "stacked"
}

const MORE_FILTERS = [
  {
    key: "holes18" as const,
    label: "18 holes",
    note: "Hole count is known for every prototype course.",
  },
  // Gen2 §7: Walking is withheld until factual coverage supports it. The data is
  // intact and still shown, unconverted, on the Course Page.
  {
    key: "rentalClubs" as const,
    label: "Rental clubs",
    note: "Verified for a subset of courses.",
  },
  {
    key: "practiceFacility" as const,
    label: "Practice facility",
    note: "Verified facilities only.",
  },
]

export function FilterControls({
  state,
  patch,
  onClearFilters,
  onClearAll,
  variant = "bar",
}: Props) {
  const groups = areaGroups()
  const count = activeFilterCount(state)

  const toggleArea = (area: string) =>
    patch({
      areas: state.areas.includes(area)
        ? state.areas.filter((a) => a !== area)
        : [...state.areas, area],
    })

  if (variant === "stacked") {
    return (
      <div className="flex flex-col gap-6">
        <fieldset>
          <legend className="ag-label text-ink-soft">Area</legend>
          <div className="mt-3 flex flex-col gap-5">
            {groups.map(([zone, areas]) => (
              <div key={zone}>
                <p className="text-xs font-semibold text-green-deep">{zone}</p>
                <ul className="mt-2 flex list-none flex-wrap gap-2 p-0">
                  {areas.map((area) => (
                    <li key={area}>
                      <Toggle
                        active={state.areas.includes(area)}
                        onClick={() => toggleArea(area)}
                      >
                        {area}
                      </Toggle>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="ag-label text-ink-soft">Access</legend>
          <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
            {(["public", "resort"] as AccessFilter[]).map((a) => (
              <li key={a}>
                <Toggle
                  active={state.access === a}
                  onClick={() => patch({ access: state.access === a ? null : a })}
                >
                  {a === "public" ? "Public" : "Resort"}
                </Toggle>
              </li>
            ))}
          </ul>
        </fieldset>

        <fieldset>
          <legend className="ag-label text-ink-soft">More filters</legend>
          <ul className="mt-3 flex list-none flex-col gap-2.5 p-0">
            {MORE_FILTERS.map((f) => (
              <li key={f.key}>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={state[f.key]}
                    onChange={(e) => patch({ [f.key]: e.target.checked })}
                    className="mt-0.5 size-4 shrink-0 accent-[var(--green)]"
                  />
                  <span>
                    <span className="block text-sm font-medium text-ink">
                      {f.label}
                    </span>
                    <span className="block text-xs leading-snug text-ink-muted">
                      {f.note}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        {count > 0 ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="self-start text-sm font-semibold text-green-deep underline underline-offset-4"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover label="Area" activeCount={state.areas.length}>
        <div className="flex w-72 flex-col gap-4 p-3">
          {groups.map(([zone, areas]) => (
            <div key={zone}>
              <p className="text-xs font-semibold text-green-deep">{zone}</p>
              <ul className="mt-2 flex list-none flex-wrap gap-1.5 p-0">
                {areas.map((area) => (
                  <li key={area}>
                    <Toggle
                      active={state.areas.includes(area)}
                      onClick={() => toggleArea(area)}
                      size="sm"
                    >
                      {area}
                    </Toggle>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Popover>

      <Popover label="Access" activeCount={state.access ? 1 : 0}>
        <ul className="flex w-44 list-none flex-col gap-1.5 p-3">
          {(["public", "resort"] as AccessFilter[]).map((a) => (
            <li key={a}>
              <Toggle
                active={state.access === a}
                onClick={() => patch({ access: state.access === a ? null : a })}
                size="sm"
                full
              >
                {a === "public" ? "Public" : "Resort"}
              </Toggle>
            </li>
          ))}
        </ul>
      </Popover>

      <Popover
        label="More filters"
        icon={<SlidersHorizontal aria-hidden="true" className="size-3.5" />}
        activeCount={MORE_FILTERS.filter((f) => state[f.key]).length}
      >
        <ul className="flex w-80 list-none flex-col gap-3 p-3">
          {MORE_FILTERS.map((f) => (
            <li key={f.key}>
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={state[f.key]}
                  onChange={(e) => patch({ [f.key]: e.target.checked })}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--green)]"
                />
                <span>
                  <span className="block text-sm font-medium text-ink">{f.label}</span>
                  <span className="block text-xs leading-snug text-ink-muted">
                    {f.note}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </Popover>

      {/* Clear Filters keeps the discovery intent; Clear All returns to neutral. */}
      {count > 0 ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          <X aria-hidden="true" className="size-3.5" />
          Clear filters
        </button>
      ) : null}
      {state.intent || state.path ? (
        <button
          type="button"
          onClick={onClearAll}
          className="rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          Clear all
        </button>
      ) : null}
    </div>
  )
}

function Toggle({
  active,
  onClick,
  children,
  size = "md",
  full = false,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  size?: "sm" | "md"
  full?: boolean
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border font-medium transition-colors",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
        full && "w-full",
        // Selected state carries a check as well as colour (§16).
        active
          ? "border-green bg-green/10 text-green-deep"
          : "border-input bg-background text-ink hover:border-green",
      )}
    >
      {active ? <Check aria-hidden="true" className="size-3" /> : null}
      {children}
    </button>
  )
}

function Popover({
  label,
  children,
  activeCount,
  icon,
}: {
  label: string
  children: React.ReactNode
  activeCount: number
  icon?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
          activeCount > 0
            ? "border-green bg-green/10 text-green-deep"
            : "border-input bg-background text-ink hover:border-green",
        )}
      >
        {icon}
        {label}
        {activeCount > 0 ? (
          <span className="rounded-full bg-green px-1.5 text-xs text-primary-foreground">
            {activeCount}
          </span>
        ) : null}
        <ChevronDown
          aria-hidden="true"
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-40 mt-2 rounded-xl border border-border bg-popover shadow-lg shadow-ink/10">
          {children}
        </div>
      ) : null}
    </div>
  )
}
