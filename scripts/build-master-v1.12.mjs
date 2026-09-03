/**
 * Build Master Database v1.12 from v1.11.
 *
 * Applies ONLY the approved Serious Golf normalization + supporting factual data,
 * to exactly two sheets (Decision_Support_Normalized_v2 and Master_Courses).
 *
 * Method: zip surgery. The source workbook contains sheet names longer than the
 * 31-char cap that SheetJS's *writer* enforces (e.g. Recommendation_Normalization_
 * Audit_v1), so re-serialising the whole book is impossible without renaming
 * sheets. Instead we replace only the two changed worksheet XML parts inside the
 * original .xlsx and leave every other part — including workbook.xml and all sheet
 * names — byte-for-byte identical. This is the maximal-preservation approach.
 *
 * Every change below is traceable to the approved implementation brief.
 */
import { read, utils, write } from "xlsx"
import fs from "node:fs"
import { createRequire } from "node:module"
// jszip is a transitive dep (not a direct package.json entry), so resolve its
// real path under .pnpm rather than by bare name.
const require = createRequire(import.meta.url)
const jszipDir = fs.readdirSync("node_modules/.pnpm").find((x) => x.startsWith("jszip@"))
const JSZip = require(`${process.cwd()}/node_modules/.pnpm/${jszipDir}/node_modules/jszip`)

const SRC = "data/AustinGolf_COURSES_Master_Database_v1.11.xlsx"
const OUT = "data/AustinGolf_COURSES_Master_Database_v1.12.xlsx"
const clean = (v) => (v == null ? null : typeof v === "number" ? v : String(v).trim())

// ---- Read current values via SheetJS (values only) -------------------------
const wb = read(fs.readFileSync(SRC), { cellDates: true })
const headerOf = (name) => utils.sheet_to_json(wb.Sheets[name], { header: 1 })[0]
const rowsOf = (name) => utils.sheet_to_json(wb.Sheets[name], { defval: null })

const assert = (cond, msg) => { if (!cond) throw new Error("BASELINE FAIL: " + msg) }
assert(wb.SheetNames.length === 53, `expected 53 sheets, got ${wb.SheetNames.length}`)

const dsHeader = headerOf("Decision_Support_Normalized_v2")
const mcHeader = headerOf("Master_Courses")
let ds = rowsOf("Decision_Support_Normalized_v2")
let mc = rowsOf("Master_Courses")
const DS_BEFORE = ds.length
const MC_BEFORE = mc.length
assert(DS_BEFORE === 141, `expected 141 DS rows, got ${DS_BEFORE}`)

const nameById = new Map(mc.map((c) => [clean(c.course_id), clean(c.course_name)]))
const sgRow = (cid) => ds.find((r) => clean(r.course_id) === cid && clean(r.canonical_classification) === "Serious Golf")
assert(clean(sgRow("crs_0020").editorial_id) === "edi_0040", "Blackhawk SG row is not edi_0040")
assert(clean(sgRow("crs_0056").strength) === "strong", "White Wing not currently strong")
assert(clean(sgRow("crs_0013").strength) === "strong", "Teravista not currently strong")
assert(nameById.get("crs_0028") === "Lost Pines Golf Club", "crs_0028 is not Lost Pines")
assert(!sgRow("crs_0028") && !sgRow("crs_0018") && !sgRow("crs_0060") && !sgRow("crs_0025"), "an addition already has a SG row")

// ---- New evidence-based rationales -----------------------------------------
const REASON = {
  crs_0028: "An Arthur Hills / Steve Forrest championship design routed through ridgelines and the Colorado River valley; at 7,300 yards — the longest course in the collection — it asks a strong player for sustained, committed shot-making.",
  crs_0018: "A Roy Bechtol design whose defining trait is its routing: no two fairways run together, so every hole is a self-contained target that rewards disciplined, position-first golf rather than length.",
  crs_0060: "A Tom Kite-led design (with Bechtol and Russell) laid over rugged Highland Lakes terrain, where elevation change and native hazards give a strong player a genuine, well-shaped test from the 7,159-yard tips.",
  crs_0025: "An Axland & Proctor links-style layout whose minimalist, ground-game architecture — firm contours, exposed lies and open approaches — lets a skilled player shape and run shots rather than simply overpower the course.",
  crs_0011: "Built to PGA Tour Design Center standards, Falconhead's tournament-calibre routing and demanding green complexes reward precise, complete ball-striking at full length.",
  crs_0013: "A Clifton-Ezell-Clifton layout that plays as one of the region's stiffest examinations — a 141 slope from the back tees puts a sustained premium on driving and long-iron control.",
  crs_0016: "A Bechtol/Russell design widely regarded among the area's hardest public tests, where narrow corridors, water and a 139 slope demand accuracy on nearly every full shot.",
  crs_0014: "A Dick Phelps design whose length and tree-lined, water-guarded corridors sustain a demanding round for stronger players across a full par 72.",
  crs_0012: "An Andy Raugust design whose length and strategic water and bunkering give a strong player a substantial, position-dependent round from the back tees.",
  crs_0056: "A Billy Casper design whose narrower, tree-lined corridors and water give a strong player meaningful placement and shot-shaping decisions, though the challenge is steady rather than exceptional.",
}

// ---- 1. Decision_Support_Normalized_v2 mutations ---------------------------
// 1a. Remove Blackhawk's Serious Golf row (edi_0040) ONLY; keep its other rows.
ds = ds.filter((r) => clean(r.editorial_id) !== "edi_0040")
// 1b. Edit existing Serious Golf rows: rationale rewrites + approved tier moves.
const editSG = (cid, patch = {}) => {
  const r = ds.find((x) => clean(x.course_id) === cid && clean(x.canonical_classification) === "Serious Golf")
  if (!r) throw new Error("edit target missing: " + cid)
  r.editorial_reason = REASON[cid]
  if (patch.strength) r.strength = patch.strength
  if (patch.tier) r.display_candidate_tier = patch.tier
}
editSG("crs_0011")                                                        // Falconhead — keep strong, rewrite only
editSG("crs_0013", { strength: "moderate", tier: "secondary_candidate" }) // Teravista  strong->moderate
editSG("crs_0016", { strength: "moderate", tier: "secondary_candidate" }) // ShadowGlen strong->moderate
editSG("crs_0014", { strength: "moderate", tier: "secondary_candidate" }) // Forest Creek strong->moderate
editSG("crs_0012", { strength: "moderate", tier: "secondary_candidate" }) // Avery Ranch strong->moderate
editSG("crs_0056", { strength: "moderate", tier: "secondary_candidate" }) // White Wing strong->moderate (approved)
// 1c. Add four Serious Golf rows (core_editorial => browsable).
const addSG = (edi, cid, strength, confidence, tier) =>
  ds.push({
    editorial_id: edi, course_id: cid, course_name: nameById.get(cid),
    original_classification: "Serious Golf", canonical_classification: "Serious Golf",
    classification_layer: "core_editorial", strength, confidence,
    display_candidate_tier: tier, editorial_reason: REASON[cid],
  })
addSG("edi_0142", "crs_0028", "strong", "high", "primary_candidate")        // Lost Pines
addSG("edi_0143", "crs_0018", "moderate", "high", "secondary_candidate")    // Plum Creek
addSG("edi_0144", "crs_0060", "moderate", "high", "secondary_candidate")    // Legends
addSG("edi_0145", "crs_0025", "moderate", "medium", "supporting_candidate") // Delaware Springs

// ---- 2. Master_Courses factual additions (architect_display gap fills) ------
// Done as surgical XML cell edits (see editArchitectXml) rather than a sheet
// regeneration, so date-formatted cells such as core_data_verified_at are left
// byte-identical instead of being coerced to bare serials by json_to_sheet.
// architect_display is column W; rows are located by course_id position.
const mcIds = mc.map((c) => clean(c.course_id))
const wRow = (cid) => mcIds.indexOf(cid) + 2 // +1 header, +1 for 1-based
const ARCH = {
  [wRow("crs_0056")]: "Billy Casper",                         // White Wing (was null)
  [wRow("crs_0014")]: "Dick Phelps",                          // Forest Creek (was null)
  [wRow("crs_0060")]: "Tom Kite; Roy Bechtol; Randy Russell", // Legends (was null)
  [wRow("crs_0025")]: "Axland & Proctor",                     // Delaware Springs (was null)
  [wRow("crs_0028")]: "Arthur Hills; Steve Forrest",          // Lost Pines (was "Arthur Hills")
}
const xmlEsc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
function editArchitectXml(sheetXml) {
  let out = sheetXml
  for (const [row, val] of Object.entries(ARCH)) {
    const cell = `<c r="W${row}" s="46" t="inlineStr"><is><t>${xmlEsc(val)}</t></is></c>`
    // Match the existing W-cell whether it is empty (self-closing) or populated.
    const re = new RegExp(`<c r="W${row}"[^>]*?(?:/>|>[\\s\\S]*?</c>)`)
    if (!re.test(out)) throw new Error(`W${row} cell not found in Master_Courses XML`)
    out = out.replace(re, cell)
  }
  return out
}

// ---- Generate a fresh worksheet-XML part for a set of rows -----------------
// Build a throwaway single-sheet book, force inline strings (bookSST:false) so
// the part is self-contained and never dangles a shared-string index.
async function worksheetXml(rows, header) {
  const wb2 = utils.book_new()
  utils.book_append_sheet(wb2, utils.json_to_sheet(rows, { header }), "S")
  const buf = write(wb2, { type: "buffer", bookType: "xlsx", bookSST: false })
  const z = await JSZip.loadAsync(buf)
  const partName = Object.keys(z.files).find((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n))
  return z.file(partName).async("string")
}

// ---- Resolve the worksheet part path for a given sheet name ----------------
function partPathFor(workbookXml, relsXml, sheetName) {
  const m = workbookXml.match(new RegExp(`<sheet[^>]*name="${sheetName}"[^>]*/>`))
  if (!m) throw new Error("sheet not found in workbook.xml: " + sheetName)
  const rid = m[0].match(/r:id="([^"]+)"/)[1]
  const rel = relsXml.match(new RegExp(`<Relationship[^>]*Id="${rid}"[^>]*/>`))[0]
  const target = rel.match(/Target="([^"]+)"/)[1].replace(/^\/?/, "").replace(/^xl\//, "")
  return "xl/" + target
}

async function main() {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC))
  const workbookXml = await zip.file("xl/workbook.xml").async("string")
  const relsXml = await zip.file("xl/_rels/workbook.xml.rels").async("string")

  const dsPart = partPathFor(workbookXml, relsXml, "Decision_Support_Normalized_v2")
  const mcPart = partPathFor(workbookXml, relsXml, "Master_Courses")
  console.log("target parts:", { dsPart, mcPart })

  // Decision_Support: regenerated (text-only sheet, safe to rebuild).
  zip.file(dsPart, await worksheetXml(ds, dsHeader))
  // Master_Courses: surgical cell edits on the ORIGINAL part (preserves dates).
  const mcXml = await zip.file(mcPart).async("string")
  zip.file(mcPart, editArchitectXml(mcXml))

  const outBuf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
  fs.writeFileSync(OUT, outBuf)
  console.log("Wrote", OUT)
  console.log(`  Decision_Support rows: ${DS_BEFORE} -> ${ds.length}  (-1 Blackhawk SG, +4 additions)`)
  console.log(`  Master_Courses rows:   ${MC_BEFORE} -> ${mc.length}  (row count unchanged)`)
}
main().catch((e) => { console.error(e); process.exit(1) })
