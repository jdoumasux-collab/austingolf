import Link from "next/link"
import { HeaderSearch } from "@/components/search/header-search"

const NAV = [
  { label: "Courses", href: "/courses", active: true },
  { label: "Guides", href: "/courses#guides" },
  { label: "Map", href: "/courses/explore?view=map" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="ag-shell flex h-16 items-center gap-4">
        <Link
          href="/courses"
          className="flex shrink-0 items-baseline gap-1.5 rounded-sm"
          aria-label="AustinGolf home"
        >
          <span className="ag-display text-xl leading-none text-ink">Austin</span>
          <span className="ag-display text-xl leading-none text-green">Golf</span>
        </Link>

        <nav aria-label="Main" className="ml-2 hidden items-center gap-1 sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={
                item.active
                  ? "ag-label rounded-sm px-3 py-2 text-green-deep"
                  : "ag-label rounded-sm px-3 py-2 text-ink-soft transition-colors hover:text-ink"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto w-full max-w-64 sm:max-w-72">
          <HeaderSearch />
        </div>
      </div>
    </header>
  )
}
