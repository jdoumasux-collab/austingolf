/**
 * HOMEPAGE ( / ).
 *
 * The site-level front door. Its job is brand orientation and routing, NOT a
 * second Courses page: it introduces AustinGolf, then hands the reader to the
 * right product (Courses, Collections, Areas, Guides). It deliberately does not
 * carry the Course Finder's search rail or quick-paths — those live on /courses
 * so the two pages have distinct responsibilities (build brief §4).
 *
 * Everything factual here is derived from the canonical systems via
 * `lib/homepage.ts` (featured selectors) — no parallel hard-coded course,
 * collection, area or guide content. Counts come from the same membership
 * predicates the hubs use. Nothing is invented to fill a section: the Guides
 * strip shows the one real Course Guide and the vetted Playing Guides, and the
 * trust note does not yet link to /about/methodology because that page does not
 * exist (linking it would 404).
 *
 * Visual language is composed entirely from existing patterns and tokens — the
 * brand ContourField identity band, the `ag-shell/ag-label/ag-display`
 * utilities, and the bordered card grid used by the Collections/Areas hubs. No
 * new fonts, palette, tokens, header/footer or nav changes (build brief §6–§7).
 */

import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { ContourField } from "@/components/brand/contour-field"
import { courseCountLabel } from "@/lib/domain"
import {
  featuredAreas,
  featuredCollections,
  featuredGuides,
  siteStats,
} from "@/lib/homepage"

export const metadata = {
  // Absolute title so the root reads as the brand, not "<page> | AustinGolf".
  title: { absolute: "AustinGolf — Austin & Central Texas golf, chosen well" },
  description:
    "An independent guide to golf in Austin and Central Texas. Structured course data paired with local editorial judgment to help you choose the right course.",
}

export default function HomePage() {
  const stats = siteStats()
  const collectionsFeatured = featuredCollections(4)
  const areasFeatured = featuredAreas(4)
  const guidesFeatured = featuredGuides(3)

  return (
    <>
      {/* ---------------------------------------------------------- A. Hero */}
      <section className="relative isolate overflow-hidden border-b border-border bg-ink">
        <ContourField className="absolute inset-0 h-full w-full opacity-70" />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 12% 108%, color-mix(in oklab, var(--green) 34%, transparent) 0%, transparent 62%)",
          }}
        />

        <div className="ag-shell relative py-16 sm:py-24 lg:py-28">
          <p className="ag-label text-sand">Austin &amp; Central Texas</p>

          <h1 className="ag-display mt-4 max-w-3xl text-balance text-4xl leading-[1.05] text-background sm:text-5xl lg:text-6xl">
            An independent guide to Austin golf
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-background/70 sm:text-lg">
            AustinGolf helps you choose the right course across Austin and
            Central Texas — structured course data paired with local editorial
            judgment. No pricing, no tee-time booking, no paid placement. Just a
            considered way to decide where to play.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/courses"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-green px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-green-deep"
            >
              Browse courses
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href="/collections"
              className="flex items-center justify-center gap-2 rounded-lg border border-background/25 bg-background/5 px-5 py-3.5 text-sm font-semibold text-background transition-colors hover:border-background/50"
            >
              Explore collections
            </Link>
          </div>

          <p className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-background/60">
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="h-px w-8 bg-sand/50" />
              Independent. No paid placement.
            </span>
            <span>
              We publish what we can verify — and leave blank what we can&apos;t.
            </span>
          </p>
        </div>
      </section>

      {/* ------------------------------------------------ B. Start with Courses */}
      <section className="ag-shell py-14 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="max-w-xl">
            <p className="ag-label text-green-deep">Start here</p>
            <h2 className="ag-display mt-2.5 text-balance text-3xl text-ink sm:text-4xl">
              The Course Finder is the heart of it
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-ink-soft">
              Every course we cover, in one place — filterable by area, access
              and the kind of round you actually have in mind. It is the primary
              way to use AustinGolf; the rest of the site exists to lead you back
              into it with better questions.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="flex items-center justify-center gap-1.5 rounded-lg bg-green px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-green-deep"
              >
                Open the Course Finder
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/courses/explore"
                className="flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-5 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-green hover:text-green-deep"
              >
                Explore all courses
              </Link>
            </div>
          </div>

          {/* Derived stats — orientation, not decoration. */}
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
            <Stat value={String(stats.courseCount)} label="courses covered" />
            <Stat value={String(stats.areaCount)} label="regions of the metro" />
            <Stat
              value={String(stats.collectionCount)}
              label="curated collections"
            />
            <Stat value={String(stats.guideCount)} label="published guides" />
          </dl>
        </div>
      </section>

      {/* --------------------------------------------- C. Featured Collections */}
      <section className="border-y border-border bg-green-wash/40">
        <div className="ag-shell py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="ag-label text-green-deep">Collections</p>
              <h2 className="ag-display mt-2.5 text-balance text-3xl text-ink sm:text-4xl">
                Courses grouped by the decision you&apos;re making
              </h2>
              <p className="mt-4 text-pretty text-base leading-relaxed text-ink-soft">
                Collections gather courses around a shared context — a place, a
                kind of access, a kind of round — so you can start from the
                question instead of the alphabet.
              </p>
            </div>
            <Link
              href="/collections"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-green-deep underline-offset-4 hover:underline"
            >
              All {stats.collectionCount} collections
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <ul className="mt-8 grid list-none grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border p-0 sm:grid-cols-2 lg:grid-cols-4">
            {collectionsFeatured.map(({ collection, count }) => (
              <li key={collection.slug}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="group flex h-full flex-col bg-card p-5 transition-colors hover:bg-green-wash sm:p-6"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="ag-display text-xl leading-snug text-ink">
                      {collection.title}
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-green transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {collection.dek}
                  </span>
                  <span className="ag-label mt-4 text-green-deep">
                    {courseCountLabel(count)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------ D. Explore geographically */}
      <section className="ag-shell py-14 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="ag-label text-green-deep">Areas</p>
            <h2 className="ag-display mt-2.5 text-balance text-3xl text-ink sm:text-4xl">
              Or start from where you are
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-ink-soft">
              Austin golf is a geography problem before it is a taste problem.
              Browse by region when proximity is the deciding factor.
            </p>
          </div>
          <Link
            href="/areas"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-green-deep underline-offset-4 hover:underline"
          >
            All {stats.areaCount} areas
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* Lightweight strip — compact chips, not the full Areas card grid. */}
        <ul className="mt-6 flex list-none flex-wrap gap-2.5 p-0">
          {areasFeatured.map(({ area, count }) => (
            <li key={area.slug}>
              <Link
                href={`/areas/${area.slug}`}
                className="group flex items-center gap-2 rounded-full border border-border bg-card py-2 pl-4 pr-3 text-sm text-ink transition-colors hover:border-green hover:bg-green-wash"
              >
                <span className="font-medium">{area.region.label}</span>
                <span className="text-ink-soft">{count}</span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-3.5 text-green transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ----------------------------------------------------- E. Guides */}
      <section className="border-y border-border bg-cream">
        <div className="ag-shell py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="ag-label text-green-deep">Guides</p>
              <h2 className="ag-display mt-2.5 text-balance text-3xl text-ink sm:text-4xl">
                Reading, when you want the reasoning
              </h2>
              <p className="mt-4 text-pretty text-base leading-relaxed text-ink-soft">
                Researched course guides and decision-oriented playing guides.
                None is a firsthand review, and no guide claims to be one — a
                Review requires having played the course.
              </p>
            </div>
            <Link
              href="/guides"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-green-deep underline-offset-4 hover:underline"
            >
              All guides
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <ul className="mt-8 grid list-none grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border p-0 sm:grid-cols-2 lg:grid-cols-3">
            {guidesFeatured.map((guide) => (
              <li key={guide.key}>
                <Link
                  href={guide.href}
                  className="group flex h-full flex-col bg-card p-5 transition-colors hover:bg-green-wash sm:p-6"
                >
                  <span className="ag-label text-green-deep">{guide.kicker}</span>
                  <span className="ag-display mt-2 flex items-start justify-between gap-3 text-lg leading-snug text-ink">
                    {guide.title}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-green transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {guide.dek}
                  </span>
                  <span className="mt-4 text-sm font-semibold text-green-deep">
                    {guide.cta}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --------------------------------------------------- F. Trust stance */}
      <section className="ag-shell py-14 sm:py-20">
        <div className="max-w-2xl">
          <p className="ag-label text-green-deep">Editorial stance</p>
          <h2 className="ag-display mt-2.5 text-balance text-2xl text-ink sm:text-3xl">
            How to read AustinGolf
          </h2>
          <ul className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-2">
            <TrustPoint title="Independent">
              No paid placement and no advertiser influence over what we cover or
              how we rank it.
            </TrustPoint>
            <TrustPoint title="Verified facts">
              Course details come from the dataset we maintain, checked against
              primary sources.
            </TrustPoint>
            <TrustPoint title="Unknowns stay blank">
              Where we cannot confirm something, we leave it out rather than
              guess. A missing field is deliberate.
            </TrustPoint>
            <TrustPoint title="Guides are not reviews">
              A researched Guide explains a course. A firsthand Review requires
              having played it — a distinct, later product.
            </TrustPoint>
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-ink-soft">
            A fuller methodology note is on the way as the site grows.
          </p>
        </div>
      </section>
    </>
  )
}

/* --------------------------------------------------------------- helpers */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-card p-5 sm:p-6">
      <div className="ag-display text-3xl text-ink sm:text-4xl">{value}</div>
      <div className="ag-label mt-1.5 text-ink-soft">{label}</div>
    </div>
  )
}

function TrustPoint({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="ag-display text-base text-ink">{title}</div>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{children}</p>
    </li>
  )
}
