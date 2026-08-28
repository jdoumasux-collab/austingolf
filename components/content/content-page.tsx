/**
 * Shared institutional content-page primitives.
 *
 * A deliberately small set of building blocks for the low-frequency
 * institutional destinations (/about, /about/methodology, /contact) so the
 * three pages share one structure instead of three bespoke layouts — while
 * staying far short of a CMS or generic page-builder.
 *
 * Everything here is composed from the existing system only: the `ag-shell`
 * width, the `ag-label` eyebrow, the `ag-display` heading face, and the
 * established ink / ink-soft / green-deep / border tokens. No new fonts,
 * palette, tokens or spacing conventions are introduced.
 */

import type React from "react"

/**
 * Page header: eyebrow + display title + optional standfirst, in the same
 * narrow prose column the Collections/Areas hubs use.
 */
export function ContentHeader({
  eyebrow,
  title,
  standfirst,
}: {
  eyebrow: string
  title: string
  standfirst?: React.ReactNode
}) {
  return (
    <header className="max-w-2xl">
      <p className="ag-label text-green-deep">{eyebrow}</p>
      <h1 className="ag-display mt-2.5 text-balance text-3xl text-ink sm:text-4xl">
        {title}
      </h1>
      {standfirst ? (
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          {standfirst}
        </p>
      ) : null}
    </header>
  )
}

/**
 * A titled prose block. Sections stack in a single readable column; the
 * heading uses the display face at a subordinate size so it never competes
 * with the page H1.
 */
export function ContentSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-10 max-w-2xl first:mt-12">
      <h2 className="ag-display text-xl text-ink sm:text-2xl">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-base leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  )
}

/**
 * A bordered callout for a single load-bearing distinction or notice
 * (e.g. the Guide-vs-Review line, or the Contact launch-blocker flag).
 * Reuses the card + border tokens already used across the app.
 */
export function ContentNote({
  title,
  tone = "default",
  children,
}: {
  title: string
  tone?: "default" | "flag"
  children: React.ReactNode
}) {
  return (
    <div
      className={
        tone === "flag"
          ? "mt-6 max-w-2xl rounded-lg border border-blaze/50 border-l-4 border-l-blaze bg-card p-5"
          : "mt-6 max-w-2xl rounded-lg border border-border bg-card p-5"
      }
    >
      <div className="ag-display text-base text-ink">{title}</div>
      <div className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-ink-soft">
        {children}
      </div>
    </div>
  )
}
