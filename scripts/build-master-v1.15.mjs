/**
 * Build Master v1.15 from v1.14 by SURGICAL XML edits (same method as v1.13/v1.14).
 *
 * This is the non-standard-format expectation-setting batch. It touches exactly ONE
 * sheet and leaves the other 52 byte-identical:
 *
 *  - sheet3 (Master_Courses): ADD one new column, `format_expectation`, and populate
 *    it for the six non-standard-format courses whose Course Page did not previously
 *    communicate "what kind of round is this?" without the golfer inferring it from
 *    scattered fields. The statements are format-focused, evidence-backed, and
 *    deliberately not mini-Guides:
 *      crs_0005 Joe Balander Short Course   (4-hole par-3 short course, Clay/Kizer)
 *      crs_0007 Hancock Golf Course         (historic nine, par 35, est. 1899)
 *      crs_0008 Butler Pitch & Putt         (9-hole par-3 pitch & putt)
 *      crs_0009 Harvey Penick Golf Campus   (PGA TOUR-designed par-30 nine, First Tee)
 *      crs_0022 Point Venture Golf Club     (full-length par-36 nine, not executive)
 *      crs_0062 Pedernales Cut 'N Putt      (full-length par-36 nine, not par-3)
 *
 * A new column is additive: every other course simply has an empty `format_expectation`
 * cell (omitted from the XML, read as null by the generator). No recommendation,
 * characteristic, feature, tee, area, collection, or Serious-Golf row is touched, so
 * every projected count is preserved. The field is source-driven: the Course Page
 * renders it whenever present, never keyed on hard-coded course IDs.
 *
 * Master_Courses is sheet3.xml: dimension A1:AC70, 29 columns (A..AC), inline-string
 * cells, header style s="43", data style s="46". The new column is AD (30th); the
 * dimension is widened to A1:AD70. Column POSITION does not matter to the generator
 * (it reads by header name via sheet_to_json) - only the header string does.
 */
import { execFileSync } from "node:child_process"
import { copyFileSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const SRC = "data/AustinGolf_COURSES_Master_Database_v1.14.xlsx"
const OUT = "data/AustinGolf_COURSES_Master_Database_v1.15.xlsx"

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/* ------------------------------------------------------------------ *
 * DATA - one concise, evidence-backed expectation statement per course.
 * Each answers: what format is this / how it differs from a conventional
 * 18-hole round / (where evidence supports it) why it is relevant.
 * ------------------------------------------------------------------ */
const EXPECT = {
  // Butler - https://butlerpitchandputt.com/ ; play page verified features (rentals, <2h)
  crs_0008:
    "A true pitch-and-putt: nine short par-3 holes on real grass, first-come with no tee times and walkable in well under two hours. It is built as a casual, all-ages downtown round, not a scaled-down regulation course.",
  // Hancock - Master core data (9 / par 35 / est. 1899); oldest-in-Texas historical record
  crs_0007:
    "A historic nine-hole, par-35 course dating to 1899 and among the oldest in Texas, played as a genuine nine rather than half of an eighteen-hole layout.",
  // Harvey Penick - https://www.harveypenickgc.com/course/ and /
  crs_0009:
    "A PGA TOUR-designed par-30 nine, mixing short par-4s and par-3s and playable in about 90 minutes, at the heart of a public teaching campus that is home to First Tee - Greater Austin. It is built as an affordable, low-pressure place to learn and practice, not a full-length round.",
  // Joe Balander - austintexas.gov / GolfATX; part of Jimmy Clay & Roy Kizer complex
  crs_0005:
    "Part of the Jimmy Clay and Roy Kizer complex, this is an intentional four-hole, par-3 short course for short-game practice and learning: walking-only, no tee times, and not a conventional paid round.",
  // Point Venture - Master core data (9 / par 36 / Open Public) + verified practice complex
  crs_0022:
    "A full-length nine-hole course at par 36 with regulation-length holes, not a pitch-and-putt or executive par-3 nine, paired with an unusually deep practice complex for a course this size.",
  // Pedernales - Master core data (9 / par 36) + Willie Nelson's Cut 'N Putt / Hill Country identity
  crs_0062:
    "Despite the Cut 'N Putt name, this is a full-length nine-hole course at par 36 on a Hill Country hilltop, a casual and unconventional round long associated with Willie Nelson, not a par-3 or executive course.",
}

/* ------------------------------------------------------------------ *
 * EXTRACT - only sheet3 is edited
 * ------------------------------------------------------------------ */
const work = mkdtempSync(join(tmpdir(), "m115-"))
const entries = ["xl/worksheets/sheet3.xml"]
execFileSync("unzip", ["-o", "-q", SRC, ...entries, "-d", work])
const P = (e) => join(work, e)

let s3 = readFileSync(P("xl/worksheets/sheet3.xml"), "utf8")

// Guard: this build assumes the pre-edit 29-column shape.
if (!s3.includes('<dimension ref="A1:AC70"')) {
  throw new Error("Unexpected Master_Courses dimension; expected A1:AC70")
}

// Locate a course's row number from its course_id cell in column A.
const rowOf = (crsId) => {
  const m = s3.match(new RegExp(`<c r="A(\\d+)"[^>]*><is><t[^>]*>${crsId}</t>`))
  if (!m) throw new Error(`row not found for ${crsId}`)
  return m[1]
}

// Append a cell just before a given row's closing </row>. AD is the new highest
// column, so appending at the end keeps cells in ascending column order.
const appendCell = (rn, cellXml) => {
  const re = new RegExp(`(<row r="${rn}">[\\s\\S]*?)(</row>)`)
  const before = s3
  s3 = s3.replace(re, `$1${cellXml}$2`)
  if (s3 === before) throw new Error(`row ${rn} not found for append`)
}

// 1) Header cell AD1 (matches sibling header style s="43").
appendCell(
  "1",
  `<c r="AD1" s="43" t="inlineStr"><is><t>format_expectation</t></is></c>`,
)

// 2) Data cells AD{row} for the six courses (data style s="46").
for (const [crsId, text] of Object.entries(EXPECT)) {
  const rn = rowOf(crsId)
  appendCell(
    rn,
    `<c r="AD${rn}" s="46" t="inlineStr"><is><t xml:space="preserve">${esc(text)}</t></is></c>`,
  )
}

// 3) Widen the sheet dimension to include the new column.
s3 = s3.replace('<dimension ref="A1:AC70"', '<dimension ref="A1:AD70"')

writeFileSync(P("xl/worksheets/sheet3.xml"), s3)

/* ------------------------------------------------------------------ *
 * REPACKAGE - replace only sheet3, keep all other entries intact
 * ------------------------------------------------------------------ */
copyFileSync(SRC, OUT)
execFileSync("zip", ["-q", "-X", `${process.cwd()}/${OUT}`, ...entries], { cwd: work })

console.log(
  "[build] wrote", OUT,
  "| +column format_expectation | populated:", Object.keys(EXPECT).join(","),
)
