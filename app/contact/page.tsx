/**
 * /contact — how to reach AustinGolf.
 *
 * Intentionally simple. The build brief is explicit: audit the repository for
 * an intentionally-published contact address and reuse it; if none exists, do
 * NOT invent one and do NOT ship a form that cannot actually submit. The audit
 * found no contact email anywhere in config, content or components, so this
 * page ships the real structure (what to get in touch about) and clearly flags
 * the absent contact mechanism as a launch blocker.
 *
 * When an owner provides a genuine contact destination, the placeholder block
 * below is the single spot to replace — swap the flag note for the real
 * address / channel and nothing else needs to change.
 */

import Link from "next/link"
import {
  ContentHeader,
  ContentSection,
  ContentNote,
} from "@/components/content/content-page"

export const metadata = {
  title: "Contact",
  description:
    "Reach AustinGolf about corrections, course information updates, editorial inquiries and general questions.",
}

export default function ContactPage() {
  return (
    <div className="ag-shell py-14 sm:py-20">
      <ContentHeader
        eyebrow="Contact"
        title="Get in touch with AustinGolf"
        standfirst="We welcome corrections, updated course information, editorial inquiries and general questions."
      />

      <ContentSection title="What to reach us about">
        <ul className="flex list-none flex-col gap-2 p-0">
          <li>
            <span className="ag-display text-ink">Corrections</span> — a fact
            that looks wrong, anywhere on the site.
          </li>
          <li>
            <span className="ag-display text-ink">Course information updates</span>{" "}
            — rates, access, facilities or conditions that have changed.
          </li>
          <li>
            <span className="ag-display text-ink">Editorial inquiries</span> —
            questions about our Guides or how we cover a course.
          </li>
          <li>
            <span className="ag-display text-ink">General questions</span> —
            anything else about AustinGolf.
          </li>
        </ul>
        <p>
          Corrections are handled the way the{" "}
          <Link
            href="/about/methodology"
            className="underline underline-offset-2 hover:text-green-deep"
          >
            methodology page
          </Link>{" "}
          describes: we confirm a change against a reliable source before
          updating the dataset.
        </p>
      </ContentSection>

      {/* No contact destination is published in the app yet. Per the build
          brief we flag this rather than fabricating an address or a form that
          cannot submit. Replace this note with the real channel when available. */}
      <ContentNote title="Contact mechanism not yet available" tone="flag">
        <p>
          AustinGolf does not yet have a published contact address, so there is
          nothing genuine to link here. Rather than show an email or a form that
          would not actually reach anyone, we have left this deliberately empty.
        </p>
        <p className="text-ink">
          Launch blocker: a real contact destination (an email address or a
          working submission channel) must be provided before AustinGolf goes
          live, so that corrections and updates can actually be received.
        </p>
      </ContentNote>
    </div>
  )
}
