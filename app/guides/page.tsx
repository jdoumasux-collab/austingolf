/**
 * GUIDES hub — /guides
 *
 * AustinGolf's canonical editorial discovery page. It explains what a Guide is,
 * distinguishes the guide categories that actually have content, features the
 * one real Course Guide (Lions), and lists the vetted Playing Guides. It reads
 * every entry from `lib/guides-index`, so new guides appear here by being
 * registered, not by editing this page.
 *
 * Deliberate boundaries for V1:
 *   - This is a DISCOVERY hub, not a second guide renderer. The Lions card links
 *     to the canonical /courses/lions-municipal-golf-course/guide route; there is
 *     no /guides/[slug] copy, so nothing here is a duplicate indexable URL.
 *   - Three editorial concepts are kept distinct (Course Page / Course Guide /
 *     Review). The intro states plainly that Guides are researched, not firsthand
 *     reviews, and that reviews are not published yet — the same disclosure the
 *     landing module makes.
 *   - Trip Guides are named as in progress, not faked into cards.
 *
 * Visual system is reused wholesale from the Collections/Areas hubs (ag-shell,
 * ag-label, ag-display, the bordered gap-px card grid, existing tokens). No new
 * fonts, palette, tokens, header/footer/card redesign, or photography.
 */

import Link from "next/link"
import { ArrowUpRight, ArrowRight } from "lucide-react"
import {
  guidesByType,
  GUIDE_TYPE_META,
  guideCount,
  type GuideIndexEntry,
} from "@/lib/guides-index"

export const metadata = {
  // Root layout supplies "| AustinGolf" via its title template.
  title: "Guides",
  description:
    "AustinGolf Guides — researched course understanding and decision-oriented playing guides for golf in Central Texas. Researched from documented sources, not firsthand reviews.",
}

function relationHref(r: GuideIndexEntry["relations"][number]): string {
  switch (r.kind) {
    case "course":
      return `/courses/${r.slug}`
    case "collection":
      return `/collections/${r.slug}`
    case "area":
      return `/areas/${r.slug}`
  }
}

function GuideCard({ guide }: { guide: GuideIndexEntry }) {
  return (
    <li className="flex flex-col bg-card p-5 sm:p-6">
      <Link
        href={guide.href}
        className="group flex flex-1 flex-col outline-none"
      >
        <span className="flex items-start justify-between gap-3">
          <span className="ag-label text-green-deep">{guide.kicker}</span>
          <ArrowUpRight
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-green transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
        <span className="ag-display mt-3 text-xl leading-snug text-ink">
          {guide.title}
        </span>
        <span className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-soft">
          {guide.dek}
        </span>
        <span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-green-deep">
          {guide.cta}
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </Link>

      {/*
        Cross-links are secondary navigation, kept OUTSIDE the card's primary
        link so they are independently focusable and do not nest interactive
        elements. Rendered only when the entry declares supported relations.
      */}
      {guide.relations.length > 0 ? (
        <span className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-4">
          {guide.relations.map((r) => (
            <Link
              key={`${r.kind}:${r.slug}`}
              href={relationHref(r)}
              className="text-xs font-medium text-ink-soft underline-offset-2 hover:text-green-deep hover:underline"
            >
              {r.label}
            </Link>
          ))}
        </span>
      ) : null}
    </li>
  )
}

export default function GuidesPage() {
  const courseGuides = guidesByType("course")
  const playingGuides = guidesByType("playing")

  return (
    <section className="ag-shell py-14 sm:py-20">
      {/* Intro — states what a Guide is and, as importantly, what it is not. */}
      <div className="max-w-2xl">
        <p className="ag-label text-green-deep">Editorial</p>
        <h1 className="ag-display mt-2.5 text-3xl text-ink sm:text-4xl">
          AustinGolf Guides
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          Course pages give you the verified facts. Guides give you the
          understanding around them — a course&apos;s history and design lineage,
          and the comparisons that answer which Austin course to play and why.
          Every guide is researched from documented sources. None is a firsthand
          review: when AustinGolf has actually played and written up a course,
          that will be its own thing, and no guide claims it in the meantime.
        </p>
      </div>

      {/* Course Guides */}
      {courseGuides.length > 0 ? (
        <div className="mt-12">
          <div className="max-w-2xl">
            <h2 className="ag-display text-2xl text-ink">
              {GUIDE_TYPE_META.course.label}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {GUIDE_TYPE_META.course.blurb}
            </p>
          </div>
          <ul className="mt-6 grid list-none grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border p-0 sm:grid-cols-2 lg:grid-cols-3">
            {courseGuides.map((g) => (
              <GuideCard key={g.key} guide={g} />
            ))}
          </ul>
        </div>
      ) : null}

      {/* Playing Guides */}
      {playingGuides.length > 0 ? (
        <div className="mt-12">
          <div className="max-w-2xl">
            <h2 className="ag-display text-2xl text-ink">
              {GUIDE_TYPE_META.playing.label}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {GUIDE_TYPE_META.playing.blurb}
            </p>
          </div>
          <ul className="mt-6 grid list-none grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border p-0 sm:grid-cols-2 lg:grid-cols-3">
            {playingGuides.map((g) => (
              <GuideCard key={g.key} guide={g} />
            ))}
          </ul>
        </div>
      ) : null}

      {/*
        Honest inventory + review-status disclosure. Mirrors the landing module:
        coverage is stated plainly, trip guides are named as pending rather than
        faked, and reviews are explicitly not-yet-published.
      */}
      <p className="mt-10 max-w-2xl rounded-xl border border-dashed border-border bg-cream px-5 py-4 text-sm leading-relaxed text-ink-soft">
        {guideCount() === 1
          ? "One guide is published so far"
          : `${guideCount()} guides are published so far`}
        , and we would rather ship one guide we can stand behind than a shelf of
        thin ones. Trip-planning guides and firsthand course reviews are in
        progress and are not published yet.
      </p>
    </section>
  )
}
