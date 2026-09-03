/**
 * Riverside Golf Course — AustinGolf researched Course Guide (Guide #3).
 *
 * Drafted only from the approved Riverside Build Brief + Evidence Package, which
 * passed independent adversarial evidence audit, together with the canonical
 * structured course record (Master v1.14). No claim here originates outside that
 * package, and nothing describes playing the course: this is a researched Guide,
 * reviewStatus "none".
 *
 * The sixteen binding constraints from the adversarial audit that shaped the
 * wording:
 *
 *  1. Perry Maxwell is stated as the verified designer of the ORIGINAL course
 *     only. The Guide never claims the present course is an intact or preserved
 *     Maxwell design, and never turns original authorship into a current
 *     architecture judgment.
 *  2. Alister MacKenzie appears only as Maxwell career context, explicitly ended
 *     in 1934 — before Riverside. He is never implied to have touched this site.
 *  3. Opening year leads with 1949 (first-party / master) and discloses the
 *     secondary 1950, concisely, without collapsing the discrepancy.
 *  4. Chronology is stated as resolved: ACC bought the property in 1983; the
 *     club moved to its Davenport Ranch (Pete Dye) course in 1984; the Riverside
 *     Campus opened in 1984. Not framed as an open 1983/1984 conflict.
 *  5. Surviving Maxwell greens are an attributed secondary estimate (roughly
 *     13\u201316) with no primary confirmation. No hard "16" as fact; no
 *     "four modified / one new" counts.
 *  6. The practice putting green claim is OMITTED — it is secondary, cannot be
 *     cleanly attributed (and specifically must not be attributed to ACC), and
 *     is not required.
 *  7. Course modifications: acquisition, campus-on-part-of-the-land, clubhouse
 *     conversion, continued golf use and the City-of-Austin lease are
 *     supportable; layout modification is cautious synthesis. Magnitude is
 *     withheld; "ACC destroyed the routing" is never stated.
 *  8. Serious Golf exclusion is preserved and never argued against. The Guide
 *     makes only the distinction that heritage is not a modern championship test.
 *  9. The Maxwell section carries the mandatory firewall: knowing who designed
 *     the original course does not establish which features remain today.
 * 10. Rating and slope are withheld (master flags them unconfirmed/conflicting).
 * 11. No firsthand language anywhere.
 * 12. Operator marketing ("best value", "great conditions") is not presented as
 *     AustinGolf judgment; it is omitted.
 * 13. Structured Course Page facts are referenced through the `facts` block, not
 *     re-prosed. The scorecard is never restated.
 * 14. No photography is sourced, generated or published; the branded fallback
 *     stands.
 * 15. reviewStatus "none"; existing Guide primitives only; no custom component.
 * 16. Ownership language is precise: ACC owns/acquired the property; the golf
 *     course was leased to the City of Austin. The Guide does not flatten this
 *     into "ACC operates Riverside", and does not edit the master's operator
 *     field.
 */

import type { Guide } from "@/lib/guide"

export const riversideGuide: Guide = {
  slug: "riverside-golf-course",
  contentType: "researched-guide",
  researchUpdated: "2026-09-03",
  reviewStatus: "none",

  dek: "Riverside was the second home of Austin Country Club — a Perry Maxwell course where Harvey Penick taught Ben Crenshaw and Tom Kite. A community-college campus later reshaped the property, so its Maxwell name is a matter of heritage, not a preserved design.",

  sections: [
    /* --------------------------------------- why Riverside is worth knowing */
    {
      id: "why-it-matters",
      heading: "Why Riverside is worth understanding",
      blocks: [
        {
          kind: "prose",
          body: [
            "Few public tee times in Austin sit on ground with this much history. Riverside was the second home of Austin Country Club, a course laid out by Perry Maxwell, and the ground where Harvey Penick taught two future major champions in Ben Crenshaw and Tom Kite. [[S1]] That lineage is real, and it is the reason to understand the course before you play it.",
            "It is also the reason to be careful. The pedigree is genuine, but a golf course is not a fixed monument: after the club left, the land was bought by Austin Community College and a campus was built on part of it. [[S3]] What you can tee off on today is a public course carrying a famous name — not an untouched Maxwell design. This Guide is about separating the two honestly. AustinGolf has not played Riverside, and a researched Guide is not the place to imply otherwise.",
          ],
        },
      ],
    },

    /* ------------------------------------------ the second Austin CC site */
    {
      id: "second-austin-country-club",
      kicker: "The ground",
      heading: "The second Austin Country Club",
      blocks: [
        {
          kind: "prose",
          body: [
            "Austin Country Club moved to this site on the south bank of the Colorado River as its second location, and the course Perry Maxwell laid out here opened for play in 1949 according to the club and course's own history. [[S1]] Several golf and design histories date the opening to 1950 instead; AustinGolf notes the discrepancy rather than resolving it. [[S5]] The canonical AustinGolf record carries Maxwell as the course's designer. [[S2]]",
            "This is the ground where Harvey Penick did his teaching. Austin Country Club is where Penick coached the juniors who became Ben Crenshaw and Tom Kite, and the course's own history still points to that heritage. [[S1]] It is an unusually direct link between a public tee sheet and the roots of championship Austin golf.",
            "The club's time here ended in the mid-1980s. Austin Community College purchased the property in 1983, and in 1984 the club relocated to its current Pete Dye course at Davenport Ranch while ACC opened its Riverside Campus on the site. [[S3]] The course stayed in play in a new setting — which is where the story turns from lineage to what actually remains.",
          ],
        },
      ],
    },

    /* ----------------------------------- what Perry Maxwell means (firewall) */
    {
      id: "what-maxwell-means",
      kicker: "The name",
      heading: "What Perry Maxwell means \u2014 and what it doesn't",
      blocks: [
        {
          kind: "prose",
          body: [
            "Perry Maxwell is one of the significant names in American golf architecture. He is credited with Southern Hills and Colonial, worked on Prairie Dunes, and is remembered for a minimalist routing style and for bold, rolling putting surfaces that the game still calls \u201cMaxwell Rolls.\u201d [[S4]] Earlier in his career he collaborated with Alister MacKenzie, until MacKenzie's death in 1934 — well before this Austin course existed. [[S1]] That collaboration is Maxwell's biography, not Riverside's: MacKenzie had no hand in the course on this ground.",
            "That reputation is why the Maxwell name on Riverside matters at all. But it is worth being precise about what the name does and does not tell you. Knowing that Maxwell designed the original course does not, by itself, establish which of his design features survive on the ground you would play today. Pedigree is a fact about the course's origins; it is not evidence about its present-day architecture. The next section is about that gap.",
          ],
        },
      ],
    },

    /* -------------------------------- what changed and what appears to remain */
    {
      id: "what-changed",
      kicker: "Origins vs today",
      heading: "What changed, and what appears to remain",
      blocks: [
        {
          kind: "prose",
          body: [
            "When Austin Community College acquired the property in 1983, the campus was built on a portion of the land, and documented institutional history records that the college leased the golf course itself to the City of Austin and converted the former country-club clubhouse into classroom space. [[S3]] The course continued as public golf in that new context. It is fair to say, as synthesis, that the original layout was modified as the property was redeveloped — but the exact extent of those changes is not something AustinGolf can state as fact, and we do not repeat the specific hole-by-hole counts that circulate in secondary accounts.",
            "What remains of Maxwell's original design is genuinely uncertain, and that uncertainty is the honest headline. Rather than present a settled figure, we set out what the sourcing actually supports below.",
          ],
        },
        {
          kind: "evidence",
          label: "What appears to remain",
          value:
            "Secondary golf histories commonly report that a number of Maxwell's original greens survive on the current course, with estimates ranging roughly from 13 to 16. AustinGolf has found no primary documentation confirming an exact count, so we do not present one as settled fact.",
          attribution: "Secondary course histories; not corroborated by primary record",
        },
        {
          kind: "prose",
          body: [
            "The point of laying it out this way is not to diminish Riverside — it is to describe it accurately. A public course that still carries some of Perry Maxwell's original greens is a genuinely interesting place to play. A perfectly preserved Maxwell course, untouched since the country-club era, is not what the evidence supports. Holding both of those at once is the whole reason this Guide exists.",
          ],
        },
      ],
    },

    /* -------------------------------------------- Riverside today / before you go */
    {
      id: "riverside-today",
      kicker: "Choosing it today",
      heading: "Riverside today, and before you go",
      blocks: [
        {
          kind: "prose",
          body: [
            "Set the history aside for a moment and Riverside is a public, walkable par 72 in East and Southeast Austin. Its verified facts live on the Course Page; this Guide references them below rather than restating the scorecard.",
          ],
        },
        {
          kind: "facts",
          fields: ["holes", "par", "maxYardage", "operatingContext", "accessType", "area", "walkingPolicy"],
          note: "Maintained on the AustinGolf Course Page, which is the canonical record for these facts.",
        },
        {
          kind: "prose",
          body: [
            "One thing the pedigree does not do is turn Riverside into a championship test. AustinGolf does not classify Riverside as Serious Golf, and this Guide is not an argument to change that: historical and design heritage is a different thing from a demanding modern layout, and the reason to understand Riverside is its place in Austin golf history, not a claim about difficulty. We are also not publishing a course rating or slope here — the figures in circulation are unconfirmed and conflicting, and we would rather withhold them than stand behind a number we cannot verify. The same applies to the longest-tee yardage, which is disputed on the record and withheld rather than guessed.",
          ],
        },
        {
          kind: "beforeYouGo",
          items: [
            {
              label: "Where it is",
              body: "Riverside is an operating public course in East and Southeast Austin, on the former second site of Austin Country Club near the Austin Community College Riverside Campus.",
            },
            {
              label: "Booking and current information",
              body: "Tee times, fees and current operating details are published by the course itself and change often enough that copying them into a Guide would make it wrong rather than useful. Go to the source.",
              href: "https://riverside-gc.com/",
              hrefLabel: "Riverside Golf Course official site",
            },
            {
              label: "Verified course facts",
              body: "Holes, par, published yardage, access, area and walking policy are maintained on the AustinGolf Course Page.",
              href: "/courses/riverside-golf-course",
              hrefLabel: "Riverside Course Page",
            },
            {
              label: "More Austin muni history",
              body: "Two other Austin courses have AustinGolf Guides with their own histories: Lions Municipal, the city's oldest public course, and Roy Kizer, named for the man who kept Lions playable for thirty-six years.",
              href: "/courses/lions-municipal-golf-course/guide",
              hrefLabel: "Lions Municipal Guide",
            },
          ],
        },
      ],
    },
  ],

  guideNote:
    "This is a researched Guide, written from the Riverside course's own history, the canonical AustinGolf course record, documented institutional history of the Austin Community College acquisition, and Perry Maxwell design scholarship, with contextual secondary histories used only where noted. AustinGolf has not played Riverside, so nothing here describes current conditions or playing experience. Perry Maxwell's authorship of the original course is treated as verified; what survives of that design today is reported from secondary sources as an uncertain estimate and flagged as such; the opening-year discrepancy (1949 versus 1950) is disclosed rather than resolved; and course rating and slope are withheld until they can be verified authoritatively. Operational details that change often are linked rather than copied.",

  sources: [
    {
      id: "S1",
      title: "Riverside Golf Course \u2014 course history",
      publisher: "Riverside Golf Course",
      sourceClass: "primary",
      approvedUse:
        "The course's identity as the second location of Austin Country Club; Perry Maxwell as the original designer; the 1949 opening as the course's own dating; the heritage of Harvey Penick teaching on this ground and the development of Ben Crenshaw and Tom Kite here; the description of Maxwell's earlier collaboration with Alister MacKenzie ending in 1934; and current booking and operating information.",
      url: "https://riverside-gc.com/",
    },
    {
      id: "S2",
      title: "AustinGolf Master Course Database v1.14",
      publisher: "AustinGolf",
      sourceClass: "primary",
      approvedUse:
        "The canonical structured facts referenced in this Guide: Perry Maxwell as the verified designer of record, and Riverside's holes, par, public access, area and walking policy. The course-level back-tee yardage is withheld in the canonical record because the longest-tee figure on file is disputed, so this Guide does not state one.",
      url: "/courses/riverside-golf-course",
    },
    {
      id: "S3",
      title: "Austin Community College Riverside Campus \u2014 institutional history",
      publisher: "Austin Community College and Austin local-history records",
      sourceClass: "primary",
      approvedUse:
        "The documented chronology of Austin Community College's 1983 purchase of the property that included the former Austin Country Club course, the 1984 opening of the Riverside Campus, the lease of the golf course to the City of Austin, the conversion of the clubhouse to classrooms, and the campus being built on a portion of the original land.",
      url: "https://www.austincc.edu/about-acc/campus-locations/riverside-campus",
    },
    {
      id: "S4",
      title: "Perry Maxwell design scholarship and course-architecture references",
      publisher: "Published golf-architecture histories",
      sourceClass: "supporting",
      approvedUse:
        "Perry Maxwell's design reputation and career context only: his credits including Southern Hills, Colonial and Prairie Dunes, his minimalist routing style and rolling greens (\u201cMaxwell Rolls\u201d), and his collaboration with Alister MacKenzie. Used as context for what the Maxwell name means, not as evidence about Riverside's present-day design.",
      url: "https://en.wikipedia.org/wiki/Perry_Maxwell",
    },
    {
      id: "S5",
      title: "Contextual secondary course histories",
      publisher: "Published golf-course histories and directories",
      sourceClass: "supporting",
      approvedUse:
        "Disputed or estimated historical detail only, explicitly flagged as such: the alternative 1950 opening date, and the secondary estimates that roughly 13 to 16 of Maxwell's original greens survive. Not treated as verified AustinGolf record, and repeated secondary claims are not presented as independent corroboration.",
      url: "https://riverside-gc.com/",
    },
  ],
}
