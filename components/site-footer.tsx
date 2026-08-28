import Link from "next/link"
import { courses, properties } from "@/lib/domain"
import { Wordmark } from "@/components/brand/wordmark"

/**
 * Derived, never hardcoded: this sentence is a factual claim about dataset scope,
 * so it has to move when the projection moves. It previously read "15 courses"
 * and silently became false the moment the projection grew.
 *
 * The noun is generic because the projected properties are no longer all resorts:
 * Barton Creek is a resort, Clay/Kizer is a municipal complex. "resort properties"
 * would now be false for half of them.
 */
const SCOPE = `${courses.length} courses and ${
  properties.length === 1 ? "one multi-course property" : `${properties.length} multi-course properties`
}`

/*
  Footer IA reflects the locked V1 site. Two groups of real destinations only:

  - Discover: the ways into the coverage — Courses, the Explorer, Collections,
    Areas, Guides. Map is kept as a secondary Courses utility here (not a primary
    category). Areas appears here because the footer is where its discovery role
    belongs, even though it is deliberately absent from primary nav.
  - AustinGolf: the institutional pages — About, Methodology, Contact.

  Everything here routes to a page that exists. Future architecture (Reviews,
  Travel, Stories, Newsletter, Events, commerce) is intentionally NOT linked.
  Contact is a real route; the absence of a public contact mechanism behind it
  remains a known launch blocker and is not solved here.
*/
const DISCOVER = [
  { label: "Courses", href: "/courses" },
  { label: "Explore all courses", href: "/courses/explore" },
  { label: "Map", href: "/courses/explore?view=map" },
  { label: "Collections", href: "/collections" },
  { label: "Areas", href: "/areas" },
  { label: "Guides", href: "/guides" },
]

const INSTITUTIONAL = [
  { label: "About", href: "/about" },
  { label: "Methodology", href: "/about/methodology" },
  { label: "Contact", href: "/contact" },
]

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-cream">
      <div className="ag-shell flex flex-col gap-10 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          {/* Shared brand mark — same treatment as the header (was a two-tone split). */}
          <Wordmark href="/" size="sm" />
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Independent coverage of golf in Central Texas — what each course
            actually is, and who it suits.
          </p>
        </div>

        <nav aria-label="Footer" className="flex gap-12">
          <div>
            <h2 className="ag-label text-ink-soft">Discover</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {DISCOVER.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-ink transition-colors hover:text-green-deep">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="ag-label text-ink-soft">AustinGolf</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {INSTITUTIONAL.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-ink transition-colors hover:text-green-deep">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="ag-shell border-t border-border/70 py-5">
        <p className="text-xs leading-relaxed text-ink-soft">
          Prototype V1. Course facts are drawn from a limited verified dataset of{" "}
          {SCOPE}; unverified details are shown as unknown rather than guessed. No
          pricing or tee-time data.
        </p>
      </div>
    </footer>
  )
}
