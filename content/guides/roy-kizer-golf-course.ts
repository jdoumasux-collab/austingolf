/**
 * Roy Kizer Golf Course — AustinGolf researched Course Guide (Guide #2).
 *
 * Drafted only from the approved Roy Kizer Build Brief + Evidence Package, which
 * passed independent adversarial evidence audit, together with the canonical
 * structured course record (Master v1.12). No claim here originates outside that
 * package, and nothing describes playing the course: this is a researched Guide,
 * reviewStatus "none".
 *
 * The binding constraints that shaped the wording, all from the evidence audit:
 *
 *  - Designer: Randolph "Randy" Russell appears ONLY as attributed prose, never
 *    as an AustinGolf-verified structured fact. Jimmy Clay's designer (Joe
 *    Finger) IS a verified master fact, so the two do not share an evidence
 *    standard and designer is deliberately omitted from the Kizer/Clay
 *    comparison rather than presented asymmetrically.
 *  - Reclamation: the former-wastewater-site origin is one short, explicitly
 *    attributed aside — never a section premise or headline.
 *  - Opening year 1994 is stated from the master record; it is not attributed to
 *    the current GolfATX page, which does not carry it.
 *  - Rating / slope are withheld. Secondary figures conflict (e.g. 72.2/125 vs
 *    72.4/124) and the master holds no publishable canonical value. The Guide
 *    says so plainly rather than choosing a number.
 *  - The Roy Kizer / Lions connection rests on first-party City of Austin
 *    evidence [[S1]]. The Lions Guide is linked as related reading only and is
 *    never cited as the evidence for Kizer's Lions history.
 *  - Water and wetlands are described as course character, never as how the
 *    course "plays". Walking policy, pace, conditioning, greens, favourite holes
 *    and value are withheld.
 *  - Fees, carts, maintenance and booking are linked to live GolfATX, never
 *    frozen into prose.
 */

import type { Guide } from "@/lib/guide"

export const royKizerGuide: Guide = {
  slug: "roy-kizer-golf-course",
  contentType: "researched-guide",
  researchUpdated: "2026-09-03",
  reviewStatus: "none",

  dek: "One of Austin's two courses at the shared Clay/Kizer complex, Roy Kizer is a links-style municipal laid out across lakes and wetlands — and it is named for the man who kept Lions Municipal playable for thirty-six years.",

  sections: [
    /* ------------------------------------------ why Kizer is worth knowing */
    {
      id: "why-it-matters",
      heading: "Why Kizer is worth understanding",
      blocks: [
        {
          kind: "prose",
          body: [
            "Most of Austin's municipal golf is parkland: tree-lined, rolling, familiar. Roy Kizer is the exception the city built on purpose. GolfATX describes it as a links-style layout spread over roughly 200 acres, shaped by open ground, lakes and wetlands rather than by trees. [[S1]] In a muni system defined by parkland courses, that alone makes it worth understanding before you choose it.",
            "It is also one half of a decision. Kizer shares a site and a clubhouse with Jimmy Clay, so a round here is usually a choice between the two — and they are genuinely different kinds of golf. This Guide is meant to help you make that choice and understand what you are looking at, not to review how the course plays. AustinGolf has not played Roy Kizer, and a researched Guide is not the place to imply otherwise.",
          ],
        },
      ],
    },

    /* ---------------------------------------------- how Kizer came to be */
    {
      id: "origins",
      kicker: "Origins",
      heading: "How Kizer came to be",
      blocks: [
        {
          kind: "prose",
          body: [
            "Roy Kizer opened in 1994, the newer of the two courses at the Clay/Kizer complex and a deliberate contrast to the parkland golf already there. [[S3]] Where Jimmy Clay had been the city's south-side course since 1974, Kizer was built to be something else on the same ground: open, links-influenced, and organised around water. [[S3]]",
            "Its authorship is less settled than its character. Course histories credit architect Randolph \u201cRandy\u201d Russell with the design, and describe the site as reclaimed former wastewater-treatment land put back into public use as golf. [[S2]] AustinGolf treats both as reported context rather than verified record — the canonical course data does not carry a designer for Kizer, and we have not independently confirmed the site's prior use. What is not in doubt is the result: a municipal course whose identity comes from its landscape.",
          ],
        },
      ],
    },

    /* ---------------------------------------------- the man behind the name */
    {
      id: "the-name",
      kicker: "The name",
      heading: "The man behind the name",
      blocks: [
        {
          kind: "prose",
          body: [
            "The course is named for Roy Kizer, and the name reaches back across town. According to the City of Austin, Kizer was the longtime superintendent at Lions Municipal Golf Course, from 1937 until his retirement in 1973 — thirty-six years keeping Austin's oldest public course in play — and he was recognised for his support of junior golf. [[S1]] The city named this course in his honour. [[S1]]",
            "That makes Kizer one of the few American golf courses named not for an architect, a donor or a landmark, but for a course superintendent: the person who maintained the ground rather than designed or paid for it. It is a quietly telling choice for a municipal system, and it ties this 1994 course directly to the history of Lions Municipal, where Kizer spent his career.",
          ],
        },
        {
          kind: "prose",
          body: [
            "If that history interests you, Lions Municipal has its own AustinGolf Guide — a separate course with a much longer and more contested past, where Roy Kizer did his work.",
          ],
        },
      ],
    },

    /* ---------------------------------------------- a links-style muni */
    {
      id: "the-golf",
      kicker: "The course itself",
      heading: "A links-style Austin muni",
      blocks: [
        {
          kind: "prose",
          body: [
            "GolfATX describes Roy Kizer as a links-style course of roughly 200 acres, with about 35 acres of lakes and 22 acres of wetlands that provide habitat for migratory waterfowl. [[S1]] Those figures are the most useful thing to carry onto the first tee: water and open ground, not trees, are the defining feature of the place. The city presents it as playable for all skill levels while still offering a genuine test. [[S1]]",
            "On AustinGolf, Kizer carries a Serious Golf classification at moderate strength. That is a statement about course character, not a difficulty verdict: an open, water-laced links layout at par 71 asks for positioning and commitment in ways a sheltered parkland course does not. Where the challenge actually lands — and how it plays on any given day in Central Texas wind — is a firsthand judgment this Guide does not make.",
            "AustinGolf is also deliberately not publishing a course rating or slope for Roy Kizer. The secondary figures in circulation disagree with one another, and the canonical course record does not hold a value we are willing to stand behind. Rather than pick a number, we are withholding rating and slope until they can be verified authoritatively. The verified structured facts we do stand behind are on the Course Page; this Guide references them below rather than restating the scorecard.",
          ],
        },
        {
          kind: "facts",
          fields: ["holes", "par", "maxYardage", "operatingContext", "accessType", "area"],
          note: "Maintained on the AustinGolf Course Page, which is the canonical record for these facts.",
        },
      ],
    },

    /* ---------------------------------------------- Kizer or Jimmy Clay? */
    {
      id: "kizer-or-clay",
      kicker: "Choosing at the complex",
      heading: "Kizer or Jimmy Clay?",
      blocks: [
        {
          kind: "prose",
          body: [
            "Because Kizer and Jimmy Clay share a site, the practical question is rarely \u201cwhich Austin muni\u201d but \u201cwhich of these two today.\u201d The honest answer is that they are different in kind, not in rank, and the choice comes down to the sort of golf you want.",
            "Clay is the older course, open since 1974, and plays as a traditional tree-lined parkland eighteen at par 72, a touch longer at a published 6,931 yards. [[S3]] Kizer is the 1994 links-style course described above: par 71, a published 6,819 yards, and defined by water and open ground rather than trees. [[S3]] Neither is the harder or better course — they are two different experiences at the same address.",
            "If you want the familiar rhythm of parkland golf, that is Clay. If you want the openness, water and exposure of a links-influenced layout, that is Kizer. AustinGolf lists both, and their Course Pages hold the verified detail for each.",
          ],
        },
      ],
    },

    /* ---------------------------------------------- before you go */
    {
      id: "before-you-go",
      heading: "Before you go",
      blocks: [
        {
          kind: "beforeYouGo",
          items: [
            {
              label: "Where it is",
              body: "Roy Kizer is an operating public course in Southeast Austin, sharing the Clay/Kizer complex and clubhouse with Jimmy Clay Golf Course.",
            },
            {
              label: "Booking",
              body: "Tee times and reservation procedures for Austin's municipal courses are published and administered by GolfATX. Booking rules and windows change, so go to the source rather than to a Guide written months earlier.",
              href: "https://www.austintexas.gov/golfatx/roy-kizer-course",
              hrefLabel: "Reservations and course information at GolfATX",
            },
            {
              label: "Practice and food",
              body: "The complex has shared practice facilities — a driving range and short-game and putting areas — and an on-site snack bar. Exact hours and availability are best checked with GolfATX before you set out.",
              href: "https://www.austintexas.gov/golfatx/roy-kizer-course",
              hrefLabel: "Current facilities and hours",
            },
            {
              label: "Fees, closures and current conditions",
              body: "Green fees, cart rates and maintenance closures change often enough that copying them into this Guide would make it wrong rather than useful. GolfATX publishes all of them.",
              href: "https://www.austintexas.gov/golfatx/roy-kizer-course",
              hrefLabel: "Current fees and course details",
            },
            {
              label: "Verified course facts",
              body: "Holes, par, published yardage, access and area are maintained on the AustinGolf Course Page, alongside the sister course.",
              href: "/courses/roy-kizer-golf-course",
              hrefLabel: "Roy Kizer Course Page",
            },
          ],
        },
      ],
    },
  ],

  guideNote:
    "This is a researched Guide, written from the City of Austin's GolfATX material and the canonical AustinGolf course record, with secondary course histories used only where noted. AustinGolf has not played Roy Kizer, so nothing here describes current conditions or playing experience. The course's naming and its connection to Lions Municipal rest on first-party City of Austin material; the designer attribution and the reclaimed-site origin are reported from secondary sources and flagged as such; and course rating and slope are withheld until they can be verified authoritatively. Operational details that change often are linked rather than copied.",

  sources: [
    {
      id: "S1",
      title: "Roy Kizer Course",
      publisher: "City of Austin / GolfATX",
      sourceClass: "primary",
      approvedUse:
        "The links-style description and the roughly 200-acre / 35-acre-lakes / 22-acre-wetlands landscape and migratory-waterfowl habitat; the all-skill-levels framing; the naming of the course for Roy Kizer, his role as Lions Municipal superintendent from 1937 to his 1973 retirement, and his support of junior golf; reservations, fees, practice facilities and on-site food.",
      url: "https://www.austintexas.gov/golfatx/roy-kizer-course",
    },
    {
      id: "S2",
      title: "Secondary course histories crediting the design and site origin",
      publisher: "Published golf-course histories and directories",
      sourceClass: "supporting",
      approvedUse:
        "Attributed context only: the credit of the design to architect Randolph \u201cRandy\u201d Russell and the description of the site as reclaimed former wastewater-treatment land. Not treated as verified AustinGolf record.",
      url: "https://www.austintexas.gov/golfatx/roy-kizer-course",
    },
    {
      id: "S3",
      title: "AustinGolf Master Course Database v1.12",
      publisher: "AustinGolf",
      sourceClass: "primary",
      approvedUse:
        "The canonical structured facts referenced in this Guide: Roy Kizer's 1994 opening, par 71 and 6,819-yard published maximum; and, for comparison, Jimmy Clay's 1974 opening, par 72 and 6,931-yard published maximum, together with access and area for both.",
      url: "/courses/roy-kizer-golf-course",
    },
  ],
}
