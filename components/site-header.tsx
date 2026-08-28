import { HeaderSearch } from "@/components/search/header-search"
import { PrimaryNav } from "@/components/primary-nav"
import { Wordmark } from "@/components/brand/wordmark"

/*
  EXPERIMENT 04 — HEADER / NAVIGATION BRAND CHROME.

  Navigation now reflects the locked V1 information architecture:
  COURSES · COLLECTIONS · GUIDES · ABOUT — all real routes. Areas and Map are
  deliberately not primary categories (Areas is discovery architecture, Map is a
  Courses/Explorer capability). The nav itself, with route-family active state,
  lives in the PrimaryNav client component; the wordmark is the shared brand mark
  (now routing to "/"), and the global header search is unchanged.

  Header styling — the eyebrow strip, White Sand field, three-zone centred grid
  — is unchanged from Experiment 04.
*/
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40">
      {/*
        Eyebrow bar. Both references carry a full-width dark strip above the
        header. Deep Water on White Sand text = 14.45:1.
      */}
      <div className="bg-ink">
        <div className="ag-shell flex h-8 items-center justify-center">
          <p className="ag-label text-cream/90">The best golf, right here.</p>
        </div>
      </div>

      {/*
        Header field is White Sand, not white — the wordmark band shares the
        page's warm field; white is reserved for functional/elevated surfaces
        such as the search control below.
      */}
      <div className="border-b border-border bg-cream/95 backdrop-blur-sm">
        {/*
          Three-zone grid so the wordmark is optically centred independent of the
          nav and search widths. Mobile keeps the two-zone arrangement (wordmark
          left, search right); the four-item nav moves to a compact row beneath.
        */}
        <div className="ag-shell flex h-14 items-center gap-4 sm:grid sm:h-16 sm:grid-cols-[1fr_auto_1fr]">
          <PrimaryNav className="hidden items-center gap-6 sm:flex" />

          <Wordmark href="/" className="justify-self-center" />

          <div className="ml-auto w-full max-w-56 justify-self-end sm:ml-0 sm:max-w-64">
            <HeaderSearch />
          </div>
        </div>

        {/*
          Mobile navigation. The desktop nav is hidden below sm, so the locked
          four-item IA is exposed here as a compact, horizontally-scrollable row
          that keeps semantic <nav>, keyboard focus and active state without a
          separate menu system. Hidden from sm upward where the inline nav shows.
          overflow-x-auto + no wrap keeps it from forcing page-level overflow at
          narrow widths.
        */}
        <div className="border-t border-border/60 sm:hidden">
          <PrimaryNav className="ag-shell flex items-center gap-6 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" />
        </div>
      </div>
    </header>
  )
}
