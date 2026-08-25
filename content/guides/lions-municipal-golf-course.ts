/**
 * Lions Municipal Golf Course — AustinGolf researched Course Guide.
 *
 * Drafted only from AustinGolf Lions Municipal Course Guide Evidence Package
 * v1.0 (LOCKED) and the canonical structured course record. No historical claim
 * here originates outside that package.
 *
 * Section order follows the locked narrative architecture in the Evidence
 * Package §13. It is the approved sequence for Lions specifically and is not a
 * template — nothing in the framework requires another Guide to have a history
 * section, an architecture section, or these headings.
 *
 * The constraints that shaped the wording, all from the Evidence Package:
 *
 *  - Rowe / Tillinghast distinction preserved. Tillinghast consulted in December
 *    1936; B.F. Rowe is the documented designer of the original course. The
 *    shorthand "Tillinghast-designed" is prohibited, and the Guide states the
 *    correction outright rather than merely avoiding the phrase.
 *  - Desegregation expressed as the late-1950 / early-1951 range, never a single
 *    date, using the package's preferred formulation and attributing the "first
 *    in the former Confederate South" conclusion to the research supporting the
 *    National Register nomination.
 *  - No triumphalism. The section names segregation, exclusion and civic debate
 *    before it names change.
 *  - Firecracker dated 1946 per current City material. The 1945/1946 source
 *    discrepancy is an internal conflict note and is not surfaced to readers.
 *  - No claim that the land situation is permanently resolved.
 *  - No firsthand content of any kind: no condition, pace, service, difficulty,
 *    value, favourite-hole or must-play judgment.
 */

import type { Guide } from "@/lib/guide"

export const lionsGuide: Guide = {
  slug: "lions-municipal-golf-course",
  contentType: "researched-guide",
  researchUpdated: "2026-08-25",
  reviewStatus: "none",

  dek: "A century of Austin's public golf, civic life and civil-rights history has unfolded on one piece of land west of downtown — and Muny is still a working municipal golf course, not a preserved historic site.",

  sections: [
    /* ------------------------------------------- opening: why Muny matters */
    {
      id: "why-it-matters",
      heading: "Why Muny matters",
      blocks: [
        {
          kind: "prose",
          body: [
            "Most historic golf courses are interesting because of what happened on them. Lions Municipal is interesting because of what kept happening. Austin's first public course opened here in 1924, and the same ground has since carried the city's municipal golf, a long civic argument about who public land belongs to, and one of the earliest desegregations of a municipal golf course in the former Confederate South.",
            "What makes it unusual is that none of this has been retired into commemoration. Muny is not a monument with a plaque at the gate; it is an operating city golf course where people book tee times, play an amateur tournament every July, and walk past the site of a civil-rights turning point on the way to the next tee. The history is not adjacent to the golf. It is the same place.",
            "This Guide explains that ground — how the course came to exist, how it changed, what happened here in 1950 and 1951, and what remains unsettled about its future. It is researched from documented sources rather than from play.",
          ],
        },
      ],
    },

    /* -------------------------------- Austin gets a public golf course */
    {
      id: "public-golf",
      kicker: "1924–1936",
      heading: "Austin gets a public golf course",
      blocks: [
        {
          kind: "prose",
          body: [
            "Lions Municipal opened in 1924 as Austin's first public golf course. [[S1]] It was the work of the Austin Lions Club, which leased part of the Brackenridge Tract — land owned by the University of Texas — to build it. [[S3]] The course began as nine holes and later expanded to eighteen. [[S2]]",
            "In 1936 the City of Austin took over the lease and the operation of the course. [[S3]] That transfer is the beginning of Muny as a municipal institution rather than a club project, and it is the arrangement that has governed the course ever since: a city golf course on university land.",
            "The word \"municipal\" does a lot of work at Lions. On most courses it is an operating classification — who runs the place, how you book. Here it is closer to the subject. Public access is what the course was created to provide, what made it the stage for everything that followed, and what the long civic fight over the land has been about.",
          ],
        },
      ],
    },

    /* ------------------------------------ a golf course that evolved */
    {
      id: "evolution",
      kicker: "Design lineage",
      heading: "A golf course that evolved",
      blocks: [
        {
          kind: "prose",
          body: [
            "Lions is sometimes described in a single phrase as a Tillinghast course. The documentary record does not support that, and the shorthand costs more than it gains.",
            "The National Register nomination identifies B.F. Rowe, a member of the Austin Lions Club, as the designer of the original course. [[S3]] A.W. Tillinghast — by then one of American golf's significant architects — visited Lions in December 1936 as part of his consulting work for the PGA. The nomination documents recommendations he made involving tees and greens on specific holes, followed by further course improvements carried out with Works Progress Administration funds and labour between 1937 and 1939. [[S3]] The Cultural Landscape Foundation records the same Rowe attribution and Tillinghast contribution. [[S7]]",
            "That is a real contribution, and it is not authorship. Reducing Muny to an architect's name replaces a documented ninety-year process with a badge, and it happens to erase the person who actually laid out the holes.",
            "The more accurate description is also the more interesting one: Muny is an evolved municipal landscape rather than a preserved single-architect composition. The course changed across the following decades, as working city courses do. Its significance is continuity — the same ground in continuous public play — not architectural purity.",
          ],
        },
        {
          kind: "evidence",
          label: "On the design attribution",
          value:
            "B.F. Rowe is identified as the designer of the original course. A.W. Tillinghast's documented role is a December 1936 consultation and recommendations on specific holes, not the original design.",
          attribution:
            "National Register of Historic Places nomination for Lions Municipal Golf Course",
        },
      ],
    },

    /* ------------------------- when "public" didn't mean everyone */
    {
      id: "desegregation",
      kicker: "Segregation and integration",
      heading: "When “public” didn’t mean everyone",
      blocks: [
        {
          kind: "prose",
          body: [
            "Muny was segregated from the day it opened. It was a public course that excluded Black golfers, and that exclusion sat alongside a second fact: Black Austinites, including residents of neighbouring Clarksville, helped build and work at the course and served as caddies there while being barred from playing it. [[S2]] People maintained a golf course they were not allowed to use.",
            "The change, when it came, was quiet and then it was public. The National Register nomination reports that African American golfers probably began playing at Muny in late 1950, without announcement. By early 1951 the press was openly discussing Black golfers' use of the course. [[S3]] The Texas Historical Commission marker records an Austin City Council discussion on 5 April 1951, and the episode in which two Black youths walked onto the course and were allowed by authorities to finish their round. [[S2]]",
            "In late 1950 and early 1951, Lions Municipal became the first municipal golf course in the former Confederate South to desegregate, according to the historical research supporting its National Register nomination. [[S3]] That happened before Brown v. Board of Education in 1954. [[S3]]",
            "It is worth being precise about what that does and does not say. It is not a story about a city that was ahead of its time in general — Austin segregated this course for twenty-six years, and the integration of Muny did not integrate Austin. It is a story about a specific piece of public land where exclusion was practised, contested, argued over in council chambers, and then stopped earlier than almost anywhere comparable. The course kept operating throughout. That is why the ground itself is the historical record.",
            "Lions Municipal was listed in the National Register of Historic Places on 7 July 2016. [[S4]]",
          ],
        },
        {
          kind: "evidence",
          label: "On the chronology",
          value:
            "Sources compress these events differently — the National Register nomination describes the decisive period as late 1950 and early 1951, while the state historical marker centres on April 1951. AustinGolf reports the range rather than choosing a single breakthrough date, because the available record does not settle one.",
          attribution:
            "National Register nomination and Texas Historical Commission marker",
        },
      ],
    },

    /* ------------------------- the golf never stopped mattering */
    {
      id: "living-tradition",
      kicker: "Competitive tradition",
      heading: "The golf never stopped mattering",
      blocks: [
        {
          kind: "prose",
          body: [
            "It would be easy to leave Muny in 1951 and treat everything since as epilogue. The tournament calendar argues otherwise.",
            "The Firecracker Open has been played at Lions over Independence Day weekend since 1946 — a 54-hole amateur stroke-play event that the City describes as drawing nearly 400 golfers through qualifying and the main championship. [[S5]] GolfATX calls it the oldest amateur tournament in Texas. [[S1]]",
            "City and National Register material connect the course to Ben Hogan, Byron Nelson, Sandra Haynie, Tom Kite and Ben Crenshaw. [[S1]] [[S3]] Those names matter less as a celebrity list than as evidence of what the place has been for a century: a public course good enough and central enough that Texas golf came through it.",
            "This is the part that keeps Muny a golf course rather than a historic site. Competitive and community golf here did not pause for the history and has not been retired by it.",
          ],
        },
      ],
    },

    /* --------------------------------------- understanding the golf */
    {
      id: "understanding-the-golf",
      kicker: "The course itself",
      heading: "Understanding the golf",
      blocks: [
        {
          kind: "prose",
          body: [
            "Lions is an eighteen-hole regulation municipal course at par 71, with a maximum published yardage of 5,825 from the current City scorecard. [[S1]] By the standards of modern regulation golf that is a compact course, which is a straightforward consequence of its history: it was routed on leased urban parkland in the 1920s and has never had room to stretch.",
            "Three tee sets are published. AustinGolf lists their yardages on the Course Page and deliberately does not publish course rating or slope for Lions, because the current scorecard image is not legible enough to transcribe those figures with confidence.",
            "Beyond that, this Guide stops. AustinGolf has not played Lions Municipal, and a researched Guide is not the place to imply otherwise. You will not find an assessment of the greens, the pace of play, the bunkering, the current conditioning, a favourite hole, or whether Muny is worth your money — those are firsthand judgments, and they belong to an AustinGolf Review written after actually playing the course. None exists yet.",
            "The historical record does identify holes that were altered and features that changed over time. That is architectural history, and converting it into strategy advice would be inventing experience from a document.",
          ],
        },
        {
          kind: "facts",
          fields: [
            "holes",
            "par",
            "maxYardage",
            "operatingContext",
            "accessType",
            "area",
          ],
          note: "Maintained on the AustinGolf Course Page, which is the canonical record for these facts.",
        },
      ],
    },

    /* ------------------------------------ why Muny still matters */
    {
      id: "land-and-future",
      kicker: "Land and preservation",
      heading: "Why Muny still matters",
      blocks: [
        {
          kind: "prose",
          body: [
            "The reason Muny's future keeps returning to public meetings is in the arrangement it was born with. The course sits on the Brackenridge Tract, which the University of Texas owns, and the City of Austin has operated the golf course there under lease. [[S3]] [[S7]] A city institution on somebody else's land is durable only for as long as the lease is.",
            "That tension has been live for years. City records show the lease continuing past May 2020 on a month-to-month basis. [[S8]] The City's Save Historic Muny District was still holding meetings in 2026. [[S6]]",
            "AustinGolf is not going to tell you how this ends. The long-term disposition of the land has not been permanently resolved by any source we can point to, and a Guide that predicted an outcome — in either direction — would be doing advocacy rather than explanation. What can be said plainly is why the question exists at all: the same lease structure that let a service club build Austin's first public course in 1924 is the reason its hundredth year arrived without a settled future.",
          ],
        },
        {
          kind: "evidence",
          label: "Status of the land question",
          value:
            "The Brackenridge Tract remains University of Texas property operated by the City under lease, and preservation activity was ongoing in 2026. AustinGolf makes no claim that the long-term arrangement has been permanently settled.",
          attribution:
            "City of Austin lease records and Save Historic Muny District meeting records",
        },
      ],
    },

    /* --------------------------------------------- before you go */
    {
      id: "before-you-go",
      heading: "Before you go",
      blocks: [
        {
          kind: "beforeYouGo",
          items: [
            {
              label: "Where it is",
              body: "Lions Municipal is an operating public course at 2901 Enfield Road, in Central / West-Central Austin, a short distance west of downtown.",
            },
            {
              label: "Booking",
              body: "Tee times and reservation procedures for Austin's municipal courses are published and administered by GolfATX. Booking rules and windows change, so go to the source rather than to a Guide written months earlier.",
              href: "https://www.austintexas.gov/my-mm/golfatx/lions-municipal-course",
              hrefLabel: "Reservations and course information at GolfATX",
            },
            {
              label: "Practice",
              body: "The practice facilities at Lions currently include an irons-only driving range and putting greens. If you were planning to warm up with a driver, plan otherwise.",
            },
            {
              label: "Fees, closures and current conditions",
              body: "Green fees, cart rates, maintenance closures and scorecard details change often enough that copying them into this Guide would make it wrong rather than useful. GolfATX publishes all of them.",
              href: "https://www.austintexas.gov/my-mm/golfatx/lions-municipal-course",
              hrefLabel: "Current fees and course details",
            },
            {
              label: "Verified course facts",
              body: "Tee yardages, access, walking policy and on-site facilities are maintained on the AustinGolf Course Page.",
              href: "/courses/lions-municipal-golf-course",
              hrefLabel: "Lions Municipal Course Page",
            },
          ],
        },
      ],
    },
  ],

  guideNote:
    "This is a researched Guide, written from official City of Austin material, Texas Historical Commission records and the National Register of Historic Places nomination for the course. AustinGolf has not played Lions Municipal, so nothing here describes current conditions or playing experience. Where a claim is historically consequential — the design attribution, the desegregation chronology, the standing of the land question — the Guide names the source it rests on and reports the limits of what that source establishes. Operational details that change often are linked rather than copied.",

  sources: [
    {
      id: "S1",
      title: "Lions Municipal Golf Course",
      publisher: "City of Austin / GolfATX",
      sourceClass: "primary",
      approvedUse:
        "Current operation and address, the 1924 opening as Austin's first public course, the nine-to-eighteen-hole expansion, the 1936 transfer to the City, notable golfers, the Firecracker's standing as Texas' oldest amateur tournament, reservations, scorecard and practice facilities.",
      url: "https://www.austintexas.gov/my-mm/golfatx/lions-municipal-course",
    },
    {
      id: "S2",
      title:
        "Desegregation of Lions Municipal Golf Course — Texas historical marker",
      publisher: "Texas Historical Commission",
      sourceClass: "primary",
      approvedUse:
        "Segregation at the course, the Clarksville connection, Black builders and caddies, the April 1951 City Council discussion and the round completed by two Black youths.",
      url: "https://atlas.thc.texas.gov/Details/5507015772",
    },
    {
      id: "S3",
      title:
        "National Register of Historic Places registration form — Lions Municipal Golf Course (Ref. 16000354)",
      publisher: "National Park Service / Texas Historical Commission",
      sourceClass: "primary",
      approvedUse:
        "The principal historical dossier: course history, B.F. Rowe as original designer, Tillinghast's 1936 consultation, WPA improvements, the detailed desegregation research and chronology, and notable golfers.",
      url: "https://atlas.thc.texas.gov/NR/pdfs/16000354/16000354.pdf",
    },
    {
      id: "S4",
      title: "National Register listing record — Lions Municipal Golf Course",
      publisher: "Texas Historical Commission",
      sourceClass: "primary",
      approvedUse:
        "The National Register listing date of 7 July 2016 and the reference number.",
      url: "https://atlas.thc.texas.gov/Details/2016000354",
    },
    {
      id: "S5",
      title:
        "A July tradition: the historic Firecracker Open returns to Lions Municipal Golf Course",
      publisher: "City of Austin",
      sourceClass: "primary",
      approvedUse:
        "The Firecracker Open as a 54-hole amateur stroke-play event, its Independence Day tradition dating to 1946, and participation of nearly 400 golfers.",
      url: "https://www.austintexas.gov/parks/parks/july-tradition-historic-firecracker-open-returns-lions-municipal-golf-course",
    },
    {
      id: "S6",
      title: "Save Historic Muny District — 2026 meeting records",
      publisher: "City of Austin boards and commissions",
      sourceClass: "primary",
      approvedUse:
        "Evidence that preservation work on the Muny district remained active in 2026.",
      url: "https://www.austintexas.gov/boards-commissions/meetings/158_1",
    },
    {
      id: "S7",
      title: "Lions Municipal Golf Course",
      publisher: "The Cultural Landscape Foundation",
      sourceClass: "supporting",
      approvedUse:
        "Corroborates the B.F. Rowe design attribution, Tillinghast's 1936 contribution, the Brackenridge Tract context and the course's preservation significance.",
      url: "https://www.tclf.org/sites/default/files/microsites/landslide2018/lions-golf-course.html",
    },
    {
      id: "S8",
      title: "City Council record on the Brackenridge Tract lease, 2020",
      publisher: "City of Austin",
      sourceClass: "primary",
      approvedUse:
        "Lease history only: the month-to-month extension beyond May 2020. Not evidence of the current or permanent disposition of the land.",
      url: "https://austintx.new.swagit.com/videos/45804/0/",
    },
  ],
}
