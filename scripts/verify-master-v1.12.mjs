import { read, utils } from "xlsx"
import fs from "node:fs"
import crypto from "node:crypto"
const clean = (v) => (v == null ? null : typeof v === "number" ? v : String(v).trim())
const A = read(fs.readFileSync("data/AustinGolf_COURSES_Master_Database_v1.11.xlsx"), { cellDates: true })
const B = read(fs.readFileSync("data/AustinGolf_COURSES_Master_Database_v1.12.xlsx"), { cellDates: true })
const rows = (wb, n) => utils.sheet_to_json(wb.Sheets[n], { defval: null })
const hash = (wb, n) => crypto.createHash("sha1").update(JSON.stringify(utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: null }))).digest("hex")
let fail = 0
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++ }

ok(B.SheetNames.length === 53, `53 sheets preserved (${B.SheetNames.length})`)
ok(JSON.stringify(A.SheetNames) === JSON.stringify(B.SheetNames), "sheet names + order identical")

// Unrelated sheets unchanged (content hash) — everything except the two edited
const CHANGED = new Set(["Decision_Support_Normalized_v2", "Master_Courses"])
let unchanged = 0, drifted = []
for (const n of A.SheetNames) {
  if (CHANGED.has(n)) continue
  if (hash(A, n) === hash(B, n)) unchanged++
  else drifted.push(n)
}
ok(drifted.length === 0, `all ${unchanged} unrelated sheets byte-identical in content${drifted.length ? " (DRIFTED: " + drifted.join(", ") + ")" : ""}`)

// Decision_Support checks
const dsA = rows(A, "Decision_Support_Normalized_v2")
const dsB = rows(B, "Decision_Support_Normalized_v2")
ok(dsA.length === 141 && dsB.length === 144, `DS rows 141 -> 144 (${dsA.length} -> ${dsB.length})`)
const sg = (ds, cid) => ds.find((r) => clean(r.course_id) === cid && clean(r.canonical_classification) === "Serious Golf")

// additions present + correct
const adds = { crs_0028: ["strong", "primary_candidate"], crs_0018: ["moderate", "secondary_candidate"], crs_0060: ["moderate", "secondary_candidate"], crs_0025: ["moderate", "supporting_candidate"] }
for (const [cid, [str, tier]] of Object.entries(adds)) {
  const r = sg(dsB, cid)
  ok(r && clean(r.classification_layer) === "core_editorial" && clean(r.strength) === str && clean(r.display_candidate_tier) === tier && clean(r.editorial_reason)?.length > 20,
    `ADD ${cid} Serious Golf ${str}/${tier} core_editorial w/ reason`)
}
// Blackhawk SG removed but its other rows kept
ok(!sg(dsB, "crs_0020"), "Blackhawk Serious Golf REMOVED")
const bhOther = dsB.filter((r) => clean(r.course_id) === "crs_0020").map((r) => clean(r.canonical_classification)).sort()
ok(JSON.stringify(bhOther) === JSON.stringify(["Great for Groups", "Practice Destination"]), `Blackhawk other rows kept: ${bhOther.join(", ")}`)
// White Wing downgraded
const ww = sg(dsB, "crs_0056")
ok(ww && clean(ww.strength) === "moderate" && clean(ww.display_candidate_tier) === "secondary_candidate" && /Billy Casper/.test(clean(ww.editorial_reason)), "White Wing downgraded to moderate + reason rewritten")
// tier moves
for (const cid of ["crs_0013", "crs_0016", "crs_0014", "crs_0012"]) {
  const r = sg(dsB, cid)
  ok(r && clean(r.strength) === "moderate" && clean(r.display_candidate_tier) === "secondary_candidate", `${cid} demoted strong->moderate`)
}
// Falconhead kept strong, reason rewritten
const fh = sg(dsB, "crs_0011")
ok(fh && clean(fh.strength) === "strong" && /PGA Tour Design Center/.test(clean(fh.editorial_reason)), "Falconhead kept strong + reason rewritten")
// templated phrase gone
const templated = dsB.filter((r) => /championship (length|scale) supports/i.test(clean(r.editorial_reason) || "")).map((r) => clean(r.course_id))
ok(templated.length === 0, `no 'championship length supports' templated reasons remain${templated.length ? ": " + templated.join(",") : ""}`)

// ColoVista guard — MUST NOT have Serious Golf
ok(!sg(dsB, "crs_0026"), "ColoVista (crs_0026) has NO Serious Golf (guard held)")

// Master_Courses architect additions + unrelated cell integrity
const mcA = rows(A, "Master_Courses"), mcB = rows(B, "Master_Courses")
ok(mcA.length === mcB.length, `Master_Courses row count unchanged (${mcB.length})`)
const arch = (mc, cid) => clean(mc.find((c) => clean(c.course_id) === cid)?.architect_display)
const archExp = { crs_0056: "Billy Casper", crs_0014: "Dick Phelps", crs_0060: "Tom Kite; Roy Bechtol; Randy Russell", crs_0025: "Axland & Proctor", crs_0028: "Arthur Hills; Steve Forrest" }
for (const [cid, v] of Object.entries(archExp)) ok(arch(mcB, cid) === v, `architect ${cid} = "${v}"`)
// every OTHER Master_Courses cell unchanged
const idset = new Set(Object.keys(archExp))
let mcDrift = []
for (const cA of mcA) {
  const cid = clean(cA.course_id)
  const cB = mcB.find((c) => clean(c.course_id) === cid)
  for (const k of Object.keys(cA)) {
    if (k === "architect_display" && idset.has(cid)) continue
    if (JSON.stringify(cA[k]) !== JSON.stringify(cB[k])) mcDrift.push(`${cid}.${k}`)
  }
}
ok(mcDrift.length === 0, `no unintended Master_Courses cell changes${mcDrift.length ? " (" + mcDrift.slice(0, 8).join(", ") + ")" : ""}`)

// every OTHER Decision_Support row (untouched ones) unchanged
const editedIds = new Set(["edi_0040", "edi_0011SG"]) // handled separately; compare by editorial_id
const changedEdi = new Set()
// compute which DS rows we intended to change
for (const cid of ["crs_0011", "crs_0013", "crs_0016", "crs_0014", "crs_0012", "crs_0056"]) changedEdi.add(clean(sg(dsA, cid).editorial_id))
changedEdi.add("edi_0040") // removed
let dsDrift = []
for (const rA of dsA) {
  const id = clean(rA.editorial_id)
  if (changedEdi.has(id)) continue
  const rB = dsB.find((r) => clean(r.editorial_id) === id)
  if (!rB) { dsDrift.push(id + " (missing)"); continue }
  if (JSON.stringify(rA) !== JSON.stringify(rB)) dsDrift.push(id)
}
ok(dsDrift.length === 0, `no unintended Decision_Support row changes${dsDrift.length ? " (" + dsDrift.slice(0, 8).join(", ") + ")" : ""}`)

console.log(fail === 0 ? "\nMASTER INTEGRITY: PASS" : `\nMASTER INTEGRITY: FAIL (${fail})`)
process.exit(fail === 0 ? 0 : 1)
