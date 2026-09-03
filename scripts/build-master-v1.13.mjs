/**
 * Build Master v1.13 from v1.12 by SURGICAL XML cell edits.
 *
 * Why XML surgery and not xlsx json_to_sheet: rebuilding the sheet re-serialises
 * every cell and (per prior batches) mangles the date-formatted core_data_verified_at
 * column and can reorder/restyle unrelated cells. Here we mutate only the four/five
 * target cells on the seven destination-course rows, leaving every other cell — and
 * all 52 other sheets — byte-identical. Only xl/worksheets/sheet3.xml (Master_Courses)
 * is replaced inside the zip; all other archive entries are copied through untouched.
 *
 * Scope: par (U), max_published_yardage (X), core_data_verified_at (AB, Excel serial,
 * style 80), core_data_status (AC, inlineStr), research_notes (O, inlineStr provenance).
 * Nothing else. No tee sets, no gate rows, no rating/slope — those are a later pass.
 */
import { execFileSync } from "node:child_process"
import { copyFileSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const SRC = "data/AustinGolf_COURSES_Master_Database_v1.12.xlsx"
const OUT = "data/AustinGolf_COURSES_Master_Database_v1.13.xlsx"

// Excel serial date (1900 date system, with the historical 1899-12-30 epoch xlsx uses).
const excelSerial = (iso) => {
  const [y, m, d] = iso.split("-").map(Number)
  const days = (Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000
  return Math.round(days)
}
const VERIFIED_AT = excelSerial("2026-09-03")

// XML-escape for inline string text (only characters that can appear in our notes).
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/**
 * Per-course verified facts + provenance. Values are the longest CURRENT verified
 * tee per course (see research notes). rating/slope intentionally not captured
 * structurally in this batch; recorded in notes so the evidence is not lost.
 */
const EDITS = {
  crs_0029: {
    par: 72,
    yd: 7087,
    note:
      "Par/yardage from official Omni Barton Creek Fazio Foothills scorecard table (Black 7087, longest tee); page prose cites 7125 (rounded) so the precise scorecard figure is used. Retrieved 2026-09-03. Full tee table and rating/slope deferred to a dedicated tee-capture pass.",
  },
  crs_0030: {
    par: 72,
    yd: null, // withheld: three first-party figures conflict (see note)
    note:
      "Par 72 (unanimous). Max yardage WITHHELD: three first-party figures conflict and do not reconcile — the current Omni page prose says 7433, the 2017 scorecard PDF (pre-2022 renovation) shows Black 7174, and this product's existing Serious Golf reason cites the 7153-yard 2026 Good Good Championship layout. Publishing any one would contradict the others (the 7153 figure is already rendered on this page), so per the trust model unknown is preferred over a guessed canonical max. Par published; yardage awaits a single unambiguous current scorecard. Retrieved 2026-09-03.",
  },
  crs_0031: {
    par: 71,
    yd: 6650,
    note:
      "Par 71; max yardage 6650 (Gold, the longest tee — course has no Black tee) from the official Omni Coore Crenshaw scorecard table. Retrieved 2026-09-03. Rating/slope deferred to tee-capture pass.",
  },
  crs_0032: {
    par: 72,
    yd: 6474,
    note:
      "Par 72; max yardage 6474 (Black, longest of the dual 6474/6462 figures) from the official Omni Palmer Lakeside scorecard (2017 card; course renovated 2024). Confidence medium. Retrieved 2026-09-03.",
  },
  crs_0033: {
    par: 72,
    yd: 6867,
    note:
      "Par 72; championship yardage 6867 from the official Horseshoe Bay Resort Slick Rock page (Robert Trent Jones Sr.). Page also lists championship rating 73.2 / slope 134, deferred to tee-capture pass. Retrieved 2026-09-03.",
  },
  crs_0034: {
    par: 72,
    yd: 6926,
    note:
      "Par 72; championship yardage 6926 from the official Horseshoe Bay Resort Ram Rock page (Robert Trent Jones Sr.). Page also lists championship rating 75.6 / slope 137, deferred to tee-capture pass. Retrieved 2026-09-03.",
  },
  crs_0035: {
    par: 72,
    yd: 6999,
    note:
      "Par 72; championship yardage 6999 from the official Horseshoe Bay Resort Apple Rock page (Robert Trent Jones Sr.). Page also lists championship rating 75.4 / slope 136, deferred to tee-capture pass. Retrieved 2026-09-03.",
  },
}

// 1. Extract just sheet3.xml (Master_Courses) from a fresh copy of v1.12.
const work = mkdtempSync(join(tmpdir(), "m113-"))
execFileSync("unzip", ["-o", "-q", SRC, "xl/worksheets/sheet3.xml", "-d", work])
const sheetPath = join(work, "xl/worksheets/sheet3.xml")
let xml = readFileSync(sheetPath, "utf8")

// 2. Map each target course_id to its row number via the inline-string A cell.
const rowOf = (crsId) => {
  const m = xml.match(
    new RegExp(`<c r="A(\\d+)"[^>]*><is><t[^>]*>${crsId}</t>`),
  )
  if (!m) throw new Error(`row not found for ${crsId}`)
  return m[1]
}

// Replace one cell token (self-closing empty, or full) with new content exactly once.
const setCell = (col, rn, replacement) => {
  const re = new RegExp(`<c r="${col}${rn}"[^>]*?(?:/>|>.*?</c>)`)
  if (!re.test(xml)) throw new Error(`cell ${col}${rn} not found`)
  xml = xml.replace(re, replacement)
}

for (const [crsId, e] of Object.entries(EDITS)) {
  const rn = rowOf(crsId)
  setCell("U", rn, `<c r="U${rn}" s="46" t="n"><v>${e.par}</v></c>`)
  // Yardage is written only when a single current value is defensible; a withheld
  // (null) yardage leaves the empty cell untouched so the field stays null.
  if (e.yd != null) setCell("X", rn, `<c r="X${rn}" s="46" t="n"><v>${e.yd}</v></c>`)
  setCell("AB", rn, `<c r="AB${rn}" s="80" t="n"><v>${VERIFIED_AT}</v></c>`)
  setCell(
    "AC",
    rn,
    `<c r="AC${rn}" s="46" t="inlineStr"><is><t>verified_partial</t></is></c>`,
  )
  // research_notes: append to existing note text if present, else set fresh.
  const oRe = new RegExp(`<c r="O${rn}"[^>]*?(?:/>|>.*?</c>)`)
  const cur = xml.match(oRe)[0]
  const existing = cur.match(/<t[^>]*>(.*?)<\/t>/)
  const merged = existing ? `${existing[1]} | ${e.note}` : e.note
  setCell(
    "O",
    rn,
    `<c r="O${rn}" s="46" t="inlineStr"><is><t xml:space="preserve">${esc(merged)}</t></is></c>`,
  )
}

writeFileSync(sheetPath, xml)

// 3. Copy v1.12 -> v1.13, then replace ONLY the one entry inside the archive.
copyFileSync(SRC, OUT)
execFileSync("zip", ["-q", "-X", `${process.cwd()}/${OUT}`, "xl/worksheets/sheet3.xml"], {
  cwd: work,
})

console.log("[build] wrote", OUT, "verified_at serial", VERIFIED_AT)
