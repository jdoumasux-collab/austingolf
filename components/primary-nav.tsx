"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

/*
  Locked V1 primary navigation: Courses · Collections · Guides · About.

  Areas is intentionally NOT a primary category (it is discovery architecture
  reached from Courses/homepage), and Map is intentionally NOT primary (it is a
  Courses/Explorer capability). Contact lives in the footer, not here.

  Active state recognises route *families*, not exact URLs, and the accessible
  source of truth is aria-current — the Blaze underline is redundant colour
  reinforcement only (Blaze on the cream field is ~2.5:1, so it can never be the
  sole signal). The visual treatment is unchanged from Experiment 04.
*/
type NavItem = { label: string; href: string; family: string }

const NAV: NavItem[] = [
  { label: "Courses", href: "/courses", family: "courses" },
  { label: "Collections", href: "/collections", family: "collections" },
  { label: "Guides", href: "/guides", family: "guides" },
  { label: "About", href: "/about", family: "about" },
]

/*
  Which nav family, if any, owns the current path. Order matters: the most
  specific rule wins. A nested course Guide keeps its canonical /courses/[slug]/
  guide URL (we deliberately did not move it), but in the nav it should reinforce
  Guides, so that pattern is tested before the general Courses family.
*/
function activeFamily(pathname: string): string | null {
  if (pathname === "/guides" || pathname.startsWith("/guides/")) return "guides"
  // Nested course guide: canonical URL stays under /courses, nav points to Guides.
  if (/^\/courses\/[^/]+\/guide(\/|$)/.test(pathname)) return "guides"
  if (pathname === "/about" || pathname.startsWith("/about/")) return "about"
  if (pathname === "/collections" || pathname.startsWith("/collections/")) return "collections"
  // Courses product context: the hub, the explorer, individual courses, and the
  // multi-course properties that belong to the same product surface.
  if (
    pathname === "/courses" ||
    pathname.startsWith("/courses/") ||
    pathname.startsWith("/properties/")
  ) {
    return "courses"
  }
  return null
}

export function PrimaryNav({ className = "" }: { className?: string }) {
  const pathname = usePathname() || "/"
  const current = activeFamily(pathname)

  return (
    <nav aria-label="Main" className={className}>
      {NAV.map((item) => {
        const isActive = current === item.family
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "ag-label relative rounded-sm text-ink after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-full after:bg-blaze after:content-['']"
                : "ag-label rounded-sm text-ink-soft transition-colors hover:text-ink"
            }
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
