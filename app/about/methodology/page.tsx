/**
 * /about/methodology — the canonical trust / transparency page.
 *
 * Codifies the principles the application already enforces (verified-vs-unknown
 * data handling, the deliberate suppression of unconfirmed facts, editorial
 * Collections, researched-not-firsthand Guides, the Guide/Review firewall) as
 * reader-facing policy. It restates the homepage editorial stance at greater
 * length and adds Updates and Corrections sections.
 *
 * Deliberate omissions, per the build brief and the project's trust rules:
 *  - no implementation details or source-code references;
 *  - no fabricated newsroom-style formal correction workflow;
 *  - corrections route to the real Contact page rather than an invented desk.
 */

import Link from "next/link"
import {
  ContentHeader,
  ContentSection,
  ContentNote,
} from "@/components/content/content-page"

export const metadata = {
  title: "Methodology",
  description:
    "How AustinGolf handles verified course facts, unknowns, recommendations, researched Guides, firsthand Reviews, updates and corrections.",
}

export default function MethodologyPage() {
  return (
    <div className="ag-shell py-14 sm:py-20">
      <ContentHeader
        eyebrow="Methodology"
        title="How AustinGolf handles what it publishes"
        standfirst="AustinGolf combines structured course information with editorial judgment. This page explains how we treat facts, what we do when something is unknown, and where researched Guides end and firsthand Reviews begin."
      />

      <ContentSection title="Verified course information">
        <p>
          Course details come from a structured dataset AustinGolf maintains and
          checks against primary sources. Throughout the site we distinguish
          information we have verified from information we simply do not have.
        </p>
      </ContentSection>

      <ContentSection title="Unknown means unknown">
        <p>
          Where a fact is missing or uncertain, we leave it blank rather than
          guess to make a page look complete. A gap on a Course Page is
          deliberate: it means we could not confirm that detail, not that the
          detail does not exist. We would rather show less and have it be right.
        </p>
      </ContentSection>

      <ContentSection title="Recommendations and Collections">
        <p>
          Recommendations, Collections and the way courses are grouped combine
          the structured data with editorial organisation and judgment. The goal
          is always the same: to make choosing a course easier. Editorial
          judgment shapes how courses are presented and grouped — it never
          invents facts about them.
        </p>
      </ContentSection>

      <ContentSection title="Guides">
        <p>
          Guides are researched editorial understanding of a course. A Guide can
          be written from documented sources — history, design record, public
          information — without AustinGolf having played the course, and it is
          presented on those terms.
        </p>
      </ContentSection>

      <ContentSection title="Reviews">
        <p>
          A Review is different. An AustinGolf Review requires firsthand
          experience: it reflects having actually played the course.
        </p>
      </ContentSection>

      <ContentNote title="A Guide is never a Review">
        <p>
          A researched Guide must never masquerade as a firsthand Review. The two
          are kept separate everywhere on the site, and no Guide implies play we
          have not done. When a Review exists, it will be labelled as one.
        </p>
      </ContentNote>

      <ContentSection title="Keeping information current">
        <p>
          Golf courses change — rates, access, conditions and facilities all
          move over time. AustinGolf aims to keep its information useful and
          current, but it does not claim perfect real-time accuracy. If
          something looks out of date, the fastest way to fix it is to tell us.
        </p>
      </ContentSection>

      <ContentSection title="Corrections">
        <p>
          If you find something wrong — an incorrect fact, an outdated detail, or
          a course that needs updating — please{" "}
          <Link
            href="/contact"
            className="underline underline-offset-2 hover:text-green-deep"
          >
            get in touch
          </Link>
          . We read correction reports and update the dataset when we can
          confirm the change against a reliable source. That confirmation step
          is the same standard we apply to everything else we publish.
        </p>
      </ContentSection>
    </div>
  )
}
