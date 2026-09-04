# AustinGolf — Lean UX Validation Test Kit

A ready-to-run moderated-testing kit for a solo founder. Everything here is
usable as-is: recruit, run the pilot, log findings, decide what (if anything)
to change. No further interpretation required.

- **Format:** moderated, task-based think-aloud. Remote screen-share or in person.
- **Length:** 45–50 minutes per participant.
- **Sample:** 5–7 participants total. Each runs 3–4 of the six journeys — never all six.
- **Prototype under test:** the `test` Preview deployment at a **frozen commit SHA**, recorded per session.
- **Scope guardrail:** this study validates the existing prototype. It cannot promote any
  candidate enhancement (shortlist, fee bands, Near Me) into a requirement — it can only
  gather the evidence that would justify a *decision* by John.

---

## 1. Research objective & study overview (one page)

**Objective.** Determine whether AustinGolf's six priority journeys let real golfers
*find and choose the right course for their game, location, budget, and Austin experience*
— and where friction, confusion, or lost trust gets in the way.

**What we are testing.** The six approved journeys, bound to the canonical personas:

| # | Journey | Primary persona(s) | Secondary |
|---|---------|--------------------|-----------|
| J1 | Known-course lookup | AG01 Local, AG02 Visitor Who Golfs | — |
| J2 | Preference / serious-golf pathway | AG05 Serious Golfer | — |
| J3 | Location / Area | AG02 Visitor Who Golfs, AG03 Golf Traveler | — |
| J4 | Filtering & recovery | AG01 Local, AG03 Golf Traveler, AG05 Serious Golfer | — |
| J5 | Group / Stay-and-Play | AG04 Group Organizer, AG03 Golf Traveler | — |
| J6 | Editorial Guide | AG07 Austin Golf Enthusiast (secondary) | AG01, AG02 |

**AG06 New/Casual Golfer** is a *cross-cutting* lens, not a standalone journey. Every
session with an AG06-leaning participant weights **orientation, terminology, and
comprehension**: does a newcomer understand what a course *is* for them (format, access,
"what to expect"), and does the vocabulary (Serious Golf, pitch & putt, executive, property
vs. course) land without prior knowledge? Recruit **at least one** AG06-leaning participant
and run J1 + J4 (or J3) with them, watching comprehension over speed.

**What success looks like.** Participants complete each journey's expected outcome, can
articulate *why* a result fits, and trust the information enough to act (reach the external
official site) — without mistaking researched Guides for played Reviews, or Unknown data
for a definitive No.

**What this study will *not* do.** Redesign anything, change the prototype or data, or
settle locked product decisions. Findings feed a separate design/build turn and a short
decision memo to John.

**Accessibility is a parallel responsibility.** Including an assistive-technology user is
valuable but does **not** substitute for the dedicated accessibility passes in §11
(keyboard, screen reader, automated checks, responsive, semantic inspection). Run both.

---

## 2. Participant screener (recruit by behavior, not stereotype)

Keep it to ~6 questions. Recruit for the *decision behavior* each journey needs, not age,
gender, or income.

1. **In the last 12 months, how did you decide where to play golf around Austin?**
   *(Open text. Looking for: known-course loyalty, location-first, challenge-first, group-organizing, research-first.)*
2. **Which best describes you?** (multi-select)
   - I have go-to Austin courses I already know → *AG01 signal*
   - I'm visiting Austin / recently moved and don't know the courses → *AG02/AG06 signal*
   - I travel and plan golf trips to new places → *AG03 signal*
   - I organize golf for groups (outings, buddies, events) → *AG04 signal*
   - I pick courses mainly by how challenging/high-quality the test is → *AG05 signal*
   - I'm newer to golf or play casually → *AG06 signal*
   - I love reading about course history/design even when I'm not booking → *AG07 signal*
3. **How often do you play?** (weekly / monthly / few times a year / just starting)
4. **When choosing a course, rank what matters most:** location · challenge/quality · price · who you're playing with · course story/history.
   *(Reveals which journey's driving variable is real for them.)*
5. **Have you used a golf course directory or booking site before?** (yes/no + which)
6. **Access needs:** *Do you use any assistive technology (screen reader, keyboard-only, magnification, captions)?* — recruit at least one "yes."

**Include** if answers give a clear behavioral signal for a persona we still need (per the
matrix in §3). **Exclude** anyone who only wants to talk features rather than do tasks, or
who has seen the prototype before.

---

## 3. Participant → journey assignment matrix

Target 6 participants (works down to 5, up to 7). Every journey seen by **≥3**; the two
decision-bearing journeys **J2** and **J4** seen by **≥4**. Nobody runs more than 4.

| Participant | Persona lean | Journeys (3–4 each) |
|---|---|---|
| P1 | AG01 Local | J1, J4, J6 |
| P2 | AG05 Serious Golfer | J2, J4, J1 |
| P3 | AG02 Visitor + AG06 lean | J1, J3, J4 *(comprehension focus)* |
| P4 | AG03 Golf Traveler | J3, J5, J4 |
| P5 | AG04 Group Organizer | J5, J2, J3 |
| P6 | AG07 Enthusiast (+AG01/02 secondary) | J6, J1, J2 |
| P7 *(optional, AT user)* | any lean + accessibility | J1, J3, J4 |

**Coverage check:** J1 ×4 · J2 ×4 · J3 ×4 · J4 ×5 · J5 ×2→3 · J6 ×3. *(If running only 5,
drop P6 or P7 but keep J2/J4 at ≥4 and J5 at ≥2; re-add J6 to P1 to keep it at ≥3.)*
AG06 comprehension rides on P3 (and P7 if recruited).

---

## 4. Outreach / recruitment message (copy-paste)

> **Subject: 45 min to help shape a new Austin golf course finder?**
>
> Hi [name] — I'm building AustinGolf, a straightforward guide to finding the right course
> to play around Central Texas. I'm looking for a few golfers to try it out and think out
> loud while doing a couple of realistic tasks — about **45 minutes**, over a screen-share
> (or in person if that's easier).
>
> There are no right answers and nothing to prepare — I'm testing the site, not you. It'd
> really help me see what works and what's confusing.
>
> If you're up for it, reply with a couple of times that suit you this/next week, and let me
> know how you usually decide where to play. Thanks!
>
> — John

*(For the AT-user recruit, add: "I'd especially value testing with anyone who uses a screen
reader, keyboard navigation, or other assistive tools.")*

---

## 5. Moderator guide

### 5.1 Introduction & consent (read aloud)

> Thanks for doing this. I'm testing a golf course website I'm building — so I want your
> honest reactions, good or bad. You can't do anything wrong here; if something's confusing,
> that's useful information about the site, not about you.
>
> I'll ask you to do a few short tasks and I'd love you to **think out loud** — say what
> you're looking at, what you expect, what's confusing, what you'd click and why.
>
> Is it OK if I **record the screen and audio** just so I don't miss anything? It's only for
> my own notes and won't be shared. *(Wait for a clear yes. If no: take written notes only.)*
>
> You can stop any time. Ready?

### 5.2 Think-aloud instructions

> As you go, narrate your thoughts: "I'm looking for…", "I'd expect this to…", "I'm not sure
> what this means…". If you go quiet I might gently ask what you're thinking — that's normal.

### 5.3 Neutral task prompts (read verbatim — never name a feature)

- **J1:** "A friend told you to check out Lions Municipal before you play it. Find out what
  you'd want to know before booking, then do whatever you'd naturally do next."
- **J2:** "You want a genuinely demanding round this weekend. Find a course that fits that
  and decide whether it's the one."
- **J3:** "You're staying downtown and don't want a long drive. Find somewhere convenient to
  play and see where it actually is."
- **J4:** "You want a walkable public course, in a specific area, that's good for a serious
  game. Narrow it down — and if nothing fits, get to something you'd actually play."
- **J5:** "You're organizing golf for a group of twelve, ideally somewhere you could make a
  day or weekend of it. Find a fit and decide if it works for the group."
- **J6:** "You like to understand the story and reasoning behind a course before you commit.
  Dig into one, then keep going however feels natural."

### 5.4 Permitted follow-up questions (after each task; stay neutral)

- Comprehension: "In your own words, what is this telling you?" / "What does [term they hit]
  mean to you here?"
- Confidence: "On 1–5, how ready would you feel to act on this? What's missing?"
- Trust: "Does anything here feel like an opinion vs. a fact? Do you trust it enough to act?"
- Intent match: "Does this fit what I asked you to find? Why / why not?"
- Never ask "Do you like it?" or "Would you use a compare tool?" — those lead the witness.

### 5.5 Handling silence, confusion, and help requests

- **Silence:** wait ~10 seconds, then "What are you thinking right now?" — never "You should…".
- **Confusion:** let it play out; it's data. "Talk me through what you expected to happen."
  Only after the task resolves or clearly stalls, probe *why*.
- **Requests for help / "what do I click?":** deflect once — "What would you do if I weren't
  here?" If truly stuck (~60–90s of unproductive struggle), record it as an **aided
  completion** (or failure), then give the minimum nudge to continue. Note where the nudge
  was needed.
- **Going off the task:** let them finish the thought, then "Let's come back to [task]."

### 5.6 Closing questions

- "Overall, how much would you trust this to help you pick a course? Why?"
- "One thing that was missing or would've made you more confident?"
- "How did you expect location and price to work here?" *(captures Near-Me / budget signal
  without leading)*
- "Anything you expected to be able to do but couldn't?"

---

## 6. Session-notes template (one per participant)

```
PARTICIPANT: P__    Persona lean: AG__    Date: ____    Frozen build SHA: __________
Recording consent: Y / N       Device / browser: __________     AT used: __________

WARM-UP — how they normally choose a course:
Top decision factor (their words): __________

── PER TASK (repeat block) ─────────────────────────────
JOURNEY: J__            Funnel stage(s): Discover/Locate/Filter/Understand/Compare/Trust/Act
Completion: unaided / aided / failed          Time: ____
Friction events (tally + note): __________
Comprehension answer: __________
Confidence (1–5): ___     What's missing: __________
Trust note: __________
Intent-vs-outcome match: yes / partial / no
Verbatim quote: "__________"
Accessibility observations (kbd/SR/contrast/reflow): __________
────────────────────────────────────────────────────────

CLOSING:
Overall trust (1–5): ___   Missing-one-thing: __________
Location expectation: __________   Price/budget expectation: __________
Moderator notes / hypotheses: __________
```

---

## 7. Findings repository template

One row per **distinct issue** (not per participant). Aggregate across sessions.

| ID | Journey | Funnel stage | Issue (observed behavior) | Freq (n/total) | Severity S1–S4 | Bucket | Evidence (quotes / clip ts) | Candidate-flag |
|----|---------|--------------|---------------------------|----------------|----------------|--------|------------------------------|----------------|
| F01 | J2 | Compare | e.g. "opened 3 tabs to compare finalists" | 3/4 | S2 | Candidate enhancement | P2 05:12, P5 11:40 | shortlist? |
| … | | | | | | | | |

**Severity scale (impact × frequency):**
- **S1 Critical** — blocks task or breaks trust (matches a journey's critical-failure
  criteria); seen by ≥2.
- **S2 Serious** — completes only with struggle/aid; recurring.
- **S3 Moderate** — noticeable friction, self-recovered.
- **S4 Minor** — cosmetic / one-off.

**Buckets (see §8):** Usability · Content/Data · Candidate enhancement · Accessibility ·
Production-quality.

---

## 8. Post-study synthesis method

Sort every finding into exactly one of five buckets. This separation is the whole point —
it stops a UI symptom from being "fixed" when the real cause is data, and stops a stated
wish from being mistaken for a validated need.

1. **Confirmed usability problems** — the interface caused failure/struggle within locked
   scope (e.g. intent echo not noticed, Back lost state, distance anchor misread). → design
   revision candidates.
2. **Content/data problems** — the surface worked but the *content* was thin/absent (one
   Guide, thin lodging, missing `sourceUrl`). → editorial/data backlog, **not** UI.
3. **Candidate enhancements** — participants repeatedly hit the edge of a *deliberately
   unbuilt* capability (shortlist, Near Me, fee bands). → decision memo to John; never
   auto-promoted.
4. **Accessibility issues** — keyboard/SR/contrast/reflow/semantics failures, from both the
   AT session and the dedicated passes in §11. → accessibility backlog, tracked separately.
5. **Production-quality issues** — broken external handoffs, stale copy, data gaps that
   would embarrass in prod (e.g. the known stale `app/page.tsx` methodology comment). →
   hardening backlog.

For each bucket, write **at most 5 ranked items** with severity, frequency, and one
representative quote. Keep it to two pages.

---

## 9. Decision rule (when does evidence warrant action?)

Apply per issue after synthesis:

- **Design revision** → **S1 seen by ≥2**, *or* **S2 seen by ≥3**, *and* the fix respects
  locked principles (reduce decision effort, no quality claims, no ranking). Route to a
  separate build turn with John's sign-off.
- **Additional testing** → strong signal but n too small (e.g. S1/S2 seen by exactly 2 in a
  5-person run), *or* the finding is confounded by fixtures/moderation. Re-test with a
  tightened prompt before acting.
- **Consider a candidate enhancement** — only when its journey-specific *"evidence justifying
  a new feature"* bar is met:
  - **Shortlist (J2):** ≥3 participants show *decision failure* holding 2–3 finalists **even
    with working Back-restore** (tab-juggling, abandoned choice) — not merely "a table would
    be nice." → memo, not build.
  - **Fee bands (J4):** ≥3 participants' constraint set *includes budget* and its absence
    demonstrably blocks/degrades the decision. Budget stays in the promise regardless; this
    only informs whether a trustworthy band abstraction earns a slot. → memo, not build.
  - **Near Me (J3):** ≥3 actively seek device-location proximity **and** the downtown anchor
    blocks task success. → memo, not build.
- **No change** → S3/S4, one-offs, or stated preferences with no behavioral failure. Log and
  move on. "Interesting" is not "actionable."

**Hard stop:** this study never itself changes locked decisions, the promise, versioning, or
scope. It produces evidence + a recommendation; John decides.

---

## 10. Pilot-session checklist

Run this **once, ~45 min, before recruiting the full panel.**

- [ ] **Frozen build:** `test` Preview open at a **recorded commit SHA**; no in-flight
      changes. Write the SHA on the session note. Never say "v1.15" to the participant;
      the authoritative *document* baseline remains **Master DB v1.11** in analysis.
- [ ] **Task fixtures verified live** on that SHA:
  - [ ] Lions Municipal Course Page loads; external official-site link works (J1).
  - [ ] A serious/challenging pathway returns a populated Collection (J2).
  - [ ] "Near Downtown" / an Area returns Finder results with Map + distance sort (J3).
  - [ ] A specific over-constrained filter combo genuinely returns **zero**, and relaxation
        appears (J4).
  - [ ] A multi-course **property** exists for Group/Stay-and-Play (J5).
  - [ ] At least one course has a Guide (`hasGuide`) with a working continuation (J6).
- [ ] **Recording permission** script ready; fallback to written notes if declined.
- [ ] **Browser setup:** clean profile — no autofill, history, or extensions; default zoom;
      desktop window sized to the target (≈1242×1120) for the desktop runs; a mobile
      viewport ready for the one mobile-filter check.
- [ ] **Backup note-taking:** printed/opened §6 template ×2; pen; a second device for notes
      if screen-recording the primary.
- [ ] **Logistics:** quiet space, stable connection, calendar hold with buffer, thank-you
      ready.

---

## 11. Parallel accessibility validation (do regardless of who is recruited)

Not a substitute for each other — run all five:

- [ ] **Keyboard-only:** every journey completable with Tab/Shift-Tab/Enter/Space/arrows;
      visible focus; no traps; mobile filter sheet traps + restores focus correctly.
- [ ] **Screen reader:** search typeahead results announced; decision-support/format rationale
      is real text; Map has an equivalent List path; continuation links are descriptive.
- [ ] **Automated checks:** run an axe/Lighthouse pass on Home, `/courses`, a Course Page, a
      Collection, a Guide, and the zero-results state.
- [ ] **Responsive:** re-run J3 (Map/List) and the filter sheet at mobile widths.
- [ ] **Semantic inspection:** one `<h1>` per page, ordered headings, landmark regions,
      button-vs-link correctness.

Log results into the §7 repository under the **Accessibility** bucket.

---

## 12. First-pilot starting instructions

**Exact materials John needs for the first pilot:**
1. This kit (§5 moderator guide open; §6 note template printed ×2).
2. The `test` Preview URL at a **frozen commit SHA**, written down.
3. The §10 checklist completed (fixtures verified live).
4. Screen-record tool + consent line ready; pen/paper backup.
5. A clean browser profile at the desktop viewport.

**Recommended first participant profile:** an **AG05 Serious Golfer** (P2) — challenge-first,
opinionated, and the persona tied to the single most consequential open question (whether
sequential Compare is enough).

**The two journeys to run in the pilot:** **J2 (serious-golf pathway)** and **J4
(over-constrained filtering & recovery)** — together they carry both live product questions
(Compare sufficiency and whether budget's absence blocks decisions) and exercise the richest
surfaces (Collections + intent echo + Back-restore; NoResults tiers + Unknown≠No).

**Immediately after the pilot:**
1. Within 24h, transcribe the §6 note into the §7 repository while memory is fresh.
2. Sanity-check the **kit itself**: did any prompt leak a feature? did fixtures behave? did
   45–50 min hold? Fix prompts/fixtures *before* spending real recruits.
3. If the protocol held, proceed to recruit the full 5–7 panel per §3. If J2/J4 already show
   an early S1, note it but **do not act on n=1** — the decision rule (§9) needs the panel.
4. Keep the six journeys (J1–J6) as the **permanent functional-regression set**: any future
   prototype change ships only after these six still pass.
