/**
 * Build Master v1.14 from v1.13 by SURGICAL XML edits (same method as v1.13).
 *
 * This is the Serious-Golf trust-normalization + zero-characteristic batch. It edits
 * only three sheets and leaves the other 50 byte-identical:
 *
 *  - sheet25 (Course_Characteristics_v1): APPEND first-party-grounded characteristics
 *    for the six courses that had none (Avery Ranch, Teravista, Forest Creek,
 *    Falconhead, Lost Pines, Star Ranch). Existing controlled vocabulary only.
 *  - sheet34 (Decision_Support_Normalized_v2):
 *      * REWRITE Star Ranch's Serious Golf reason (edi_0023, J-col) from a length-only
 *        rationale to design evidence (undulating greens + white-sand bunkering +
 *        explicit scratch-player framing). Membership unchanged; the length-only
 *        anti-pattern is removed.
 *      * APPEND Plum Creek's Practice Destination + Great for Groups pathways. Both
 *        were already DECIDED in Plum_Creek_Resolution_v1 ("Added Serious Golf,
 *        Practice Destination, Great for Groups, Tee Flexibility") but only Serious
 *        Golf ever landed in the data; this completes that resolution. Tee Flexibility
 *        is deliberately NOT added — its rubric needs a current scorecard tee count and
 *        the same resolution flags Plum Creek scorecard metrics as unverified.
 *  - sheet3 (Master_Courses): record the Riverside + ColoVista Serious-Golf review
 *    outcomes in research_notes (provenance-only, non-projected). Both are EXCLUDED:
 *    neither has a first-party championship/difficulty claim meeting the Serious Golf
 *    bar. Riverside's Perry Maxwell lineage is Guide material, not a challenge badge.
 *    No Decision_Support row is added for them — an exclusion is the absence of a row.
 *
 * Serious Golf membership count is unchanged (still 25): Star Ranch and Plum Creek were
 * already members; Riverside and ColoVista stay out. Practice Destination and Great for
 * Groups are NOT collections, so collection counts are untouched too.
 *
 * IDs and append positions are computed from the live max row / max id so a gap in the
 * editorial_id sequence cannot cause an off-by-one.
 */
import { execFileSync } from "node:child_process"
import { copyFileSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const SRC = "data/AustinGolf_COURSES_Master_Database_v1.13.xlsx"
const OUT = "data/AustinGolf_COURSES_Master_Database_v1.14.xlsx"

const excelSerial = (iso) => {
  const [y, m, d] = iso.split("-").map(Number)
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000)
}
const VERIFIED_AT = excelSerial("2026-09-03")
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/* ------------------------------------------------------------------ *
 * DATA
 * ------------------------------------------------------------------ */

// New characteristics, grouped by course. Vocabulary terms all pre-exist in the sheet.
const CHARS = [
  // Avery Ranch — https://averyranch.com/course/ (Andy Raugust)
  ["crs_0012", "Hill Country / Rolling", "strong",
    "Layout identity is a real Hill Country experience routed over gentle rolling hills.",
    "Avery Ranch course page: 'a real Hill Country golf experience ... gentle rolling hills'.",
    "https://averyranch.com/course/"],
  ["crs_0012", "Oak-lined / Natural", "strong",
    "Fairways are framed by oak lines rather than open corridors.",
    "Avery Ranch course page: 'oak-lined fairways'.",
    "https://averyranch.com/course/"],
  ["crs_0012", "Water-featured", "moderate",
    "Water is an occasional strategic feature, headlined by the lake-side closing hole.",
    "Avery Ranch course page: '60-acre lake'; 18th hole 'bordering Avery Lake'.",
    "https://averyranch.com/course/"],
  // Teravista — https://teravistagolf.com/
  ["crs_0013", "Hill Country Views", "strong",
    "Long-range Hill Country views are a defining part of the experience.",
    "Teravista site: 'captures the beauty of the Texas Hill Country with views that span for over 50 miles'.",
    "https://teravistagolf.com/"],
  ["crs_0013", "Rolling", "strong",
    "Rolling terrain shapes the challenge across the layout.",
    "Teravista site: 'The rolling terrain provides a challenging 7,200-yard layout'.",
    "https://teravistagolf.com/"],
  ["crs_0013", "Championship-scale", "moderate",
    "Presented as a championship-length 18-hole test with five tee sets.",
    "Teravista site: 'Championship 18-hole golf club ... 7,200-yard layout ... 5 different sets of tees'.",
    "https://teravistagolf.com/"],
  // Forest Creek — https://forestcreek.com/
  ["crs_0014", "Hill Country / Rolling", "strong",
    "Hill Country character over rolling fairways is the course's stated identity.",
    "Forest Creek site: 'hill country golf at its finest'; 'rolling fairways'.",
    "https://forestcreek.com/"],
  ["crs_0014", "Practice-rich", "moderate",
    "The practice offering is substantial enough to factor into course choice.",
    "Forest Creek site: 'outstanding practice range enhanced by a putting green and short-game complex'.",
    "https://forestcreek.com/"],
  ["crs_0014", "Championship-scale", "moderate",
    "A nationally recognised championship-length par-72 public course.",
    "Forest Creek site: '7,147 yard par-72 ... nationally recognized'; Golf Digest 'Best Public Golf Course in Central Texas'.",
    "https://forestcreek.com/"],
  // Falconhead — https://falconheadaustin.com/
  ["crs_0011", "Hill Country / Rolling", "strong",
    "Sits on Hill Country land defined by rolling hills.",
    "Falconhead site: 'the famous Hill Country of Texas ... our rolling hills'.",
    "https://falconheadaustin.com/"],
  ["crs_0011", "Oak-lined / Natural", "moderate",
    "Native oaks and cedars frame the corridors.",
    "Falconhead site: 'From our knobby oaks and cedars'.",
    "https://falconheadaustin.com/"],
  ["crs_0011", "Water-influenced", "moderate",
    "Creeks and ponds bring water into play.",
    "Falconhead site: 'our creeks and ponds'.",
    "https://falconheadaustin.com/"],
  // Lost Pines — https://www.lostpinesresortandspa.com/golf/ (Arthur Hills)
  ["crs_0028", "Wooded / Framed", "strong",
    "The Lost Pines woodland defines the setting the golf plays through.",
    "Lost Pines golf page: 'views of the Lost Pines woodland and the spectacular Texan landscape'.",
    "https://www.lostpinesresortandspa.com/golf/"],
  ["crs_0028", "Championship-scale", "moderate",
    "An Arthur Hills championship-length par-72 layout.",
    "Lost Pines golf page: 'Designed by ... Arthur Hills, our 7,300-yard, par-72 golf course'; 'championship 18-hole golf course'.",
    "https://www.lostpinesresortandspa.com/golf/"],
  ["crs_0028", "Practice-rich", "moderate",
    "Practice scale is a genuine draw rather than an afterthought.",
    "Lost Pines golf page: '13-acre driving range with eight target greens, two short-game greens'.",
    "https://www.lostpinesresortandspa.com/golf/"],
  // Star Ranch — https://www.starranchgolf.com/course/
  ["crs_0015", "Rolling / Undulating", "strong",
    "Undulation runs through both the fairways and the greens.",
    "Star Ranch course page: 'undulating fairways and greens'.",
    "https://www.starranchgolf.com/course/"],
  ["crs_0015", "Strategic", "moderate",
    "White-sand bunkering around the greens sets up a shot-making test pitched up to the scratch player.",
    "Star Ranch course page: 'greens flanked by pristine white sand bunkers ... an enjoyable experience for both the novice and scratch golfer'.",
    "https://www.starranchgolf.com/course/"],
]

// Rewrite of Star Ranch's Serious Golf reason (edi_0023).
const STAR_RANCH_SG_REASON =
  "Beyond raw length, the golf itself sets a shot-making test: undulating fairways and greens defended by pristine white-sand bunkering, a layout the course explicitly pitches to hold interest for the scratch player as well as the novice."

// New Plum Creek (crs_0018) core_editorial pathways. [canonical, strength, confidence, tier, reason]
const PLUM_ROWS = [
  ["Practice Destination", "strong", "high", "primary_candidate",
    "Practice depth is a genuine reason to choose Plum Creek: a Toptracer-equipped driving range, a three-acre short-game complex, and on-site instruction including a junior academy."],
  ["Great for Groups", "moderate", "high", "secondary_candidate",
    "Built for organised group golf, with dedicated outing and tournament support, an on-site events venue (the Mockingbird Room), and food and beverage at Glenn's Bar & Grill."],
]

// Serious-Golf review outcomes recorded in Master_Courses.research_notes (provenance only).
const SG_NOTES = {
  crs_0010:
    "Serious Golf review (2026-09-03): EXCLUDED. First-party riverside-gc.com positions the course on history, value and walkability at ~6,309 yards, with no championship-scale or demanding-difficulty claim meeting the Serious Golf bar. Its distinguishing value is a Perry Maxwell design lineage (historic greens) - Guide/editorial material, not a challenge badge. Revisit only on firsthand play or a first-party difficulty claim.",
  crs_0026:
    "Serious Golf review (2026-09-03): EXCLUDED. ColoVista's first-party identity is scenic resort golf above the Colorado River (Hill Country Experience, Golf Trip, Worth the Drive already recorded); any championship-difficulty signal is secondary-sourced only. No first-party challenge/scale claim meets the Serious Golf bar; stays out pending firsthand or first-party difficulty evidence.",
}

/* ------------------------------------------------------------------ *
 * EXTRACT
 * ------------------------------------------------------------------ */
const work = mkdtempSync(join(tmpdir(), "m114-"))
const entries = [
  "xl/worksheets/sheet3.xml",
  "xl/worksheets/sheet25.xml",
  "xl/worksheets/sheet34.xml",
]
execFileSync("unzip", ["-o", "-q", SRC, ...entries, "-d", work])
const P = (e) => join(work, e)

const maxRow = (xml) =>
  Math.max(...[...xml.matchAll(/<row r="(\d+)"/g)].map((m) => +m[1]))
const setDimLastRow = (xml, lastRow) =>
  xml.replace(/(<dimension ref="[A-Z]+1:[A-Z]+)\d+"/, `$1${lastRow}"`)

/* ---- sheet25: append characteristics ---- */
let s25 = readFileSync(P("xl/worksheets/sheet25.xml"), "utf8")
const s25max = maxRow(s25) // last existing row (chr_0080 => data)
const lastChrId = Math.max(
  ...[...s25.matchAll(/chr_(\d+)/g)].map((m) => +m[1]),
)
let chrRows = ""
CHARS.forEach((c, i) => {
  const rn = s25max + 1 + i
  const id = "chr_" + String(lastChrId + 1 + i).padStart(4, "0")
  const [course, characteristic, strength, reason, basis, url] = c
  const cell = (col, txt) =>
    `<c r="${col}${rn}" t="inlineStr"><is><t xml:space="preserve">${esc(txt)}</t></is></c>`
  chrRows +=
    `<row r="${rn}">` +
    cell("A", id) +
    cell("B", course) +
    cell("C", characteristic) +
    cell("D", strength) +
    cell("E", reason) +
    cell("F", basis) +
    cell("G", "first_party_explicit") +
    cell("H", "high") +
    `<c r="I${rn}" s="81" t="n"><v>${VERIFIED_AT}</v></c>` +
    cell("J", url) +
    `</row>`
})
s25 = s25.replace("</sheetData>", chrRows + "</sheetData>")
s25 = setDimLastRow(s25, s25max + CHARS.length)
writeFileSync(P("xl/worksheets/sheet25.xml"), s25)

/* ---- sheet34: rewrite Star Ranch reason + append Plum Creek rows ---- */
let s34 = readFileSync(P("xl/worksheets/sheet34.xml"), "utf8")

// Rewrite J24 (edi_0023) reason. Match the specific cell to avoid collateral edits.
const starBefore = s34
s34 = s34.replace(
  /(<c r="J24" t="str"><v>)[^<]*(<\/v><\/c>)/,
  `$1${esc(STAR_RANCH_SG_REASON)}$2`,
)
if (s34 === starBefore) throw new Error("Star Ranch reason (J24) not rewritten")

const s34max = maxRow(s34)
const lastEdiId = Math.max(
  ...[...s34.matchAll(/edi_(\d+)/g)].map((m) => +m[1]),
)
let plumRows = ""
PLUM_ROWS.forEach((p, i) => {
  const rn = s34max + 1 + i
  const id = "edi_" + String(lastEdiId + 1 + i).padStart(4, "0")
  const [canon, strength, confidence, tier, reason] = p
  const cell = (col, txt) => `<c r="${col}${rn}" t="str"><v>${esc(txt)}</v></c>`
  plumRows +=
    `<row r="${rn}">` +
    cell("A", id) +
    cell("B", "crs_0018") +
    cell("C", "Plum Creek Golf Course") +
    cell("D", canon) +
    cell("E", canon) +
    cell("F", "core_editorial") +
    cell("G", strength) +
    cell("H", confidence) +
    cell("I", tier) +
    cell("J", reason) +
    `</row>`
})
s34 = s34.replace("</sheetData>", plumRows + "</sheetData>")
s34 = setDimLastRow(s34, s34max + PLUM_ROWS.length)
writeFileSync(P("xl/worksheets/sheet34.xml"), s34)

/* ---- sheet3: set Riverside + ColoVista research_notes ---- */
let s3 = readFileSync(P("xl/worksheets/sheet3.xml"), "utf8")
const rowOf = (crsId) =>
  s3.match(new RegExp(`<c r="A(\\d+)"[^>]*><is><t[^>]*>${crsId}</t>`))[1]
for (const [crsId, note] of Object.entries(SG_NOTES)) {
  const rn = rowOf(crsId)
  const re = new RegExp(`<c r="O${rn}"[^>]*?(?:/>|>.*?</c>)`)
  if (!re.test(s3)) throw new Error(`O${rn} not found for ${crsId}`)
  s3 = s3.replace(
    re,
    `<c r="O${rn}" s="46" t="inlineStr"><is><t xml:space="preserve">${esc(note)}</t></is></c>`,
  )
}
writeFileSync(P("xl/worksheets/sheet3.xml"), s3)

/* ------------------------------------------------------------------ *
 * REPACKAGE — replace only the three entries, keep all others intact
 * ------------------------------------------------------------------ */
copyFileSync(SRC, OUT)
execFileSync("zip", ["-q", "-X", `${process.cwd()}/${OUT}`, ...entries], { cwd: work })

console.log(
  "[build] wrote", OUT,
  "| +chars", CHARS.length, "(chr_%s..)", String(lastChrId + 1).padStart(4, "0"),
  "| +recs", PLUM_ROWS.length,
  "| star reason rewritten | SG notes:", Object.keys(SG_NOTES).join(","),
)
