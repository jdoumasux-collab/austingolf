import Link from "next/link"
import { HeaderSearch } from "@/components/search/header-search"

/*
  EXPERIMENT 04 — HEADER / NAVIGATION BRAND CHROME.

  Destinations are unchanged from the previous header. The AustinGolf mockup
  shows COLLECTIONS and ABOUT, but neither route exists in this application, so
  they are deliberately not invented here — composition is borrowed from the
  reference, navigation truth stays with the product.
*/
const NAV = [
  { label: "Courses", href: "/courses", active: true },
  { label: "Guides", href: "/courses#guides" },
  { label: "Map", href: "/courses/explore?view=map" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40">
      {/*
        Eyebrow bar. Both references carry a full-width dark strip above the
        header (Poncho: "FREE & FAST SHIPPING"; AustinGolf mockup: "THE BEST
        GOLF, RIGHT HERE."). It is what gives the chrome its top edge and lets
        the header field itself go quiet. Deep Water on White Sand text = 14.45:1.
      */}
      <div className="bg-ink">
        <div className="ag-shell flex h-8 items-center justify-center">
          <p className="ag-label text-cream/90">The best golf, right here.</p>
        </div>
      </div>

      {/*
        Header field is White Sand, not white. Both references show the wordmark
        band sharing the page's warm field rather than floating as a white panel,
        and Experiment 03 reserved white for functional/elevated surfaces — the
        search control below is one, so it reads correctly against this field.
      */}
      <div className="border-b border-border bg-cream/95 backdrop-blur-sm">
        {/*
          Three-zone grid so the wordmark is optically centred independent of
          the nav and search widths, which is how both references compose it.
          Mobile keeps the original two-zone arrangement (wordmark left, search
          right) because the nav is hidden there, exactly as before.
        */}
        <div className="ag-shell flex h-14 items-center gap-4 sm:grid sm:h-16 sm:grid-cols-[1fr_auto_1fr]">
          <nav aria-label="Main" className="hidden items-center gap-6 sm:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={
                  item.active
                    ? // Active state is carried by full-contrast ink plus a Blaze
                      // rule. The colour is redundant reinforcement, never the
                      // sole signal — aria-current is the accessible source of
                      // truth, since Blaze on this field is only 2.54:1.
                      "ag-label relative rounded-sm text-ink after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-full after:bg-blaze after:content-['']"
                    : "ag-label rounded-sm text-ink-soft transition-colors hover:text-ink"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/*
            Wordmark. Set as one uppercase, letterspaced serif unit rather than
            the previous two-tone "Austin" + "Golf" split: both references treat
            the wordmark as a single confident mark, and the split was reading as
            two words in two colours rather than one brand.
          */}
          <Link
            href="/courses"
            className="flex shrink-0 items-center justify-self-center rounded-sm"
            aria-label="AustinGolf home"
          >
            <span className="ag-display text-[0.9375rem] uppercase leading-none tracking-[0.3em] text-ink sm:text-base">
              Austin Golf
            </span>
          </Link>

          <div className="ml-auto w-full max-w-56 justify-self-end sm:ml-0 sm:max-w-64">
            <HeaderSearch />
          </div>
        </div>
      </div>
    </header>
  )
}
