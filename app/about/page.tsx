/**
 * /about — what AustinGolf is, who it serves, and how it helps.
 *
 * Institutional orientation, not marketing. Language is kept consistent with
 * the homepage editorial-stance block and the Guide/Review distinction used on
 * the guide masthead: current Guides are researched, never firsthand Reviews.
 * Geographic scope is described only as broadly as the current product data
 * supports ("Austin and the surrounding Central Texas landscape") with no
 * invented coverage promise.
 */

import Link from "next/link"
import {
  ContentHeader,
  ContentSection,
  ContentNote,
} from "@/components/content/content-page"

export const metadata = {
  // Root layout appends "| AustinGolf" via its title template.
  title: "About",
  description:
    "AustinGolf is an independent golf discovery and editorial resource for Austin and Central Texas, built to help golfers choose the right round.",
}

export default function AboutPage() {
  return (
    <div className="ag-shell py-14 sm:py-20">
      <ContentHeader
        eyebrow="About"
        title="An independent guide to Austin golf"
        standfirst="AustinGolf helps golfers in Austin and Central Texas choose the right course — with less effort, not more information to wade through."
      />

      <ContentSection title="What AustinGolf is">
        <p>
          AustinGolf is an independent golf discovery and editorial resource for
          Austin and the surrounding Central Texas golf landscape. It brings
          together structured course information and Austin-specific editorial
          judgment so that choosing where to play is a shorter, clearer
          decision.
        </p>
        <p>
          It is not a booking engine and not a directory of everything. It is a
          considered view of the courses the region actually offers.
        </p>
      </ContentSection>

      <ContentSection title="The problem it solves">
        <p>
          Most golf information online adds to the pile you have to sort
          through. AustinGolf is built to do the opposite: to reduce the effort
          of choosing the right golf experience rather than simply increasing
          the volume of golf-course information in front of you.
        </p>
      </ContentSection>

      <ContentSection title="How it helps">
        <p>Four ways in, depending on how you already think about the round:</p>
        <ul className="flex list-none flex-col gap-2 p-0">
          <li>
            <span className="ag-display text-ink">Course Pages</span> — the
            structured facts for a single course, with the decision support to
            judge whether it fits.
          </li>
          <li>
            <span className="ag-display text-ink">
              <Link href="/areas" className="underline underline-offset-2 hover:text-green-deep">
                Areas
              </Link>
            </span>{" "}
            — geographic discovery across the metro and Hill Country.
          </li>
          <li>
            <span className="ag-display text-ink">
              <Link href="/collections" className="underline underline-offset-2 hover:text-green-deep">
                Collections
              </Link>
            </span>{" "}
            — curated groupings for a setting, a kind of access, or the sort of
            round you want.
          </li>
          <li>
            <span className="ag-display text-ink">
              <Link href="/guides" className="underline underline-offset-2 hover:text-green-deep">
                Guides
              </Link>
            </span>{" "}
            — researched editorial understanding of individual courses.
          </li>
        </ul>
        <p>
          When the question is a plain filter — public courses, or what is near
          you — the{" "}
          <Link href="/courses" className="underline underline-offset-2 hover:text-green-deep">
            Course Finder
          </Link>{" "}
          answers it directly.
        </p>
      </ContentSection>

      <ContentSection title="Course Pages, Guides and Reviews">
        <p>
          These are three different things, and AustinGolf keeps them distinct
          on purpose:
        </p>
      </ContentSection>

      <ContentNote title="The distinction that matters most">
        <p>
          <span className="text-ink">Course Pages</span> present structured facts
          and decision support. <span className="text-ink">Guides</span> are
          researched editorial understanding of a course.{" "}
          <span className="text-ink">Reviews</span> are firsthand AustinGolf
          evaluations written after actually playing the course — a distinct,
          later product.
        </p>
        <p>
          No current Guide is a firsthand Review, and none claims to be one. When
          AustinGolf has played a course and can speak from experience, a Review
          will say so plainly.
        </p>
      </ContentNote>

      <ContentSection title="How we handle facts">
        <p>
          AustinGolf publishes what it can verify and leaves blank what it
          cannot. The reasoning behind that — how course facts, recommendations
          and research are handled — is set out on the{" "}
          <Link
            href="/about/methodology"
            className="underline underline-offset-2 hover:text-green-deep"
          >
            methodology page
          </Link>
          .
        </p>
      </ContentSection>
    </div>
  )
}
