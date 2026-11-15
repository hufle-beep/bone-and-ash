# Cold review: v0.11.184, memory lines of their own (N1, S1, D1)

Read: push.diff, rm-brief / rm-drafts / rm-measure, checklist, canon card, packet-review, the beats, again.js, main.js `proseHtml`, lines.js `dayIndex`, story.js `goTo`, coil.js rewind. Ran in a scratch copy (/tmp/rm/rv/copy): `packet.mjs --check` on the shipped texts (tic 0, pair 0, run 0; the 3 time notes, "still" / "already", hold because the lines only show on a repeat), textlint (0 changed), and an instrumented `models.test.mjs --texts` (200 games each of Random, Careful, Completionist and Sociable).

**Reachability, measured over those 800 games.** Own lines shown: morning 812; Mei Lin's beats 0/1/3/4 347/241/92/84; Ya's 349/245/93/84. The pool still shows on these scenes for the Day 3 morning (411) and the settled talks (67 + 20). All 9 lines appear in real play.

**The code is sound.** `talkBeat` drives both the text and the line. common.js's `dayIndex` is a re-export of the same lines.js function. `noteDay` runs in `goTo` before either one reads it. `mei_talks` and `ya_talks` are not in KEEP_FLAGS, so they reset each Coil and beat 0 can repeat. There is no import cycle, and sw.js FILES lists both new modules.

**Canon is clean.** Every line is James's and none names Yuki. Only he remembers ("because to her it is"). No form words.

## Findings

**M1. `js/story/remember_texts.js:7`: MORNING_AGAIN says "having sat its early lessons once".** That is a Coil count, and it's false from Coil 3 on. The full paragraph still shows there whenever the morning wasn't read on Coil 2 or later, and on every "Read it all again" (mean Coil is 3.2–3.5 for most bots). The brief forbade naming the count. The word came in with Claude's cut C1 ("before" → "once"), not Fable's draft.
- Fix: drop "once" ("…and having sat its early lessons makes you a repeat student…").

**M2. `sw.js:2`: VERSION is still `bone-ash-0.11.183`.** news.js already announces 0.11.184 and FILES gained two modules (rule 7).
- Also missing from the working copy: the `tests/README.md` row (rule 2) and the four docs (rule 5).
- Fix: bump to `bone-ash-0.11.184` and add these before the commit. Ignore this if they belong to the commit step.

**L1. `remember_texts.js:20` (Ya m1) repeats the paragraph right under it.** "The ledge, the swinging legs, the wolves." sits directly above ¶1: "sat down on the lip of a drop, legs swinging… a wolf den". That's a repeated beat on one screen, and the brief said "point, don't retell". Fable flagged it and offered the cut.
- Fix: drop the first sentence (15 words left).

**L2. `remember_texts.js:16` (Mei m4) spoils the line it sits on.** "You were asleep for the noise in every version." sits directly above ¶1 `"…You were asleep. Ya wasn't."`. It takes her punchline first and says "asleep" twice on one screen.
- Fix: point at the folded part instead (the bird, "I'm writing it down"). That needs a Fable redraft.

**L3. `remember_texts.js:7`: after C1, "So the data has improved, slightly." no longer follows.** Trees not noticing him is not better data. Two of the five sentences now open with "So".
- Fix: drop that first "So".

**L4. Two of the nine lines make the same move.** Mei m0 "arrange your face to hear it fresh" and Ya m1 "hear it as if it were new" (the brief asked for a different shape each). "Arrange your face" also echoes the pool's "*Practise the face*".
- Fix: re-point one of them. L1's cut leaves Ya m1 as "hear it as if it were new", so it doesn't solve this.

**L5. `js/core/news.js:40` overclaims.** It says a talk "you have heard before opens with a line of its own", but the settled text (beats 2 and 5+) keeps the pool. That's 87 of 1,622 talk folds measured (5%).
- Fix: "most talks…".

## Test gaps

**TG1. MORNING_AGAIN is never linted.** No textlint sample renders the Day 2 branch (the samples have `forest_day` undefined and Coil 1), and MORNING_AGAIN is not in POOLS. A canon-card tic planted in it (F13) passed both the story test and textlint.
- Fix: add it to the `remember` pool (`tools/textlint.mjs:119`), or add a sample with `forest_day: 2` and `coil.n = 2`. The sample would also lint the Day 2 first paragraph and the Coil 1 paragraph, which were never linted before this push.

**TG2. `onDayR` (story.test) gives every key the same day list.** So a wrong day key passes: Ya's line following Mei Lin's record (F6, remember.js) and Ya's text following Mei Lin's (F16, act1_blackroot.js). In play, the line would then sit above the wrong beat.
- Fix: fake only the scene's own key, assert that the other talk's record at k leaves the beat alone, and walk one real case: Mei Lin on days 1–2, Ya on day 3 only.

**TG3. The lines are checked against the same table they come from.** Swapping two beats' lines passes (F9).
- Fix: pin one word per line to its beat's text: Mei 0 "arithmetic" ↔ "Three, then"; Mei 1 "stem" ↔ "stem"; Mei 3 "question" ↔ "twenty-six"; Mei 4 "noise" ↔ "A noise"; Ya 0 "inspection" ↔ "boots to hair"; Ya 1 "wolves" ↔ "wolf den"; Ya 3 "definition" ↔ "*improper*"; Ya 4 "count" ↔ "I count".

**TG4. The KP fact guard only knows `tribute|seventh|Day 7`.** "Ashfall, a cage" (F10, C1's 14–83%-false fact by another name) and "twice" (F11) both pass.
- Fix: widen it to `/Ashfall|cage|village|tribute|seventh|Day \d|\bonce\b|twice|times/`, or pin the paragraph's words as the other pushes do.

**TG5. "The pool untouched" is checked only as `MEMORY_LINES.length === 48`.** Drawing a pool line and throwing it away when the scene has its own line passes (F2).
- Fix: assert that `linesOf(g).cur.mem` is unset after a fold that used an own line.

**Not a gap: F3 (own line on an SV fold).** It passes, but the talks and the Day 2 morning always leave by their choices, so SV never reaches them. It changes nothing in play.

## Planted faults (`tools/mutate.mjs`, /tmp/rm/rv/faults.json, report /tmp/rm/rv/mutate.md)

Default command (`story.test --quick`): **6 caught, 10 missed** of 16.
- **Caught:** F1 (pool before own line), F4 (pool dropped), F5 (beat ignores the day), F7 (settled text gets beat 1's line), F8 (morning line on other days), F15 (KP gated on the lights night).
- **Missed:**
  - F2 (pool drawn and discarded): TG5.
  - F3 (own line on SV): unreachable, see above.
  - F6 (Ya's line by Mei Lin's day record): TG2.
  - F9 (Ya's beats 3 and 4 swapped): TG3.
  - F10 (Ashfall and the cage in KP): TG4.
  - F11 ("twice"): TG4 / M1.
  - F12 (tic in Mei m0).
  - F13 (tic in KP): TG1.
  - F14 ("since this morning" in Mei m3, a time word wrong at most hours).
  - F16 (Ya's text by Mei Lin's record): TG2.

The six text faults also ran against textlint's snapshot (`--cmd "node tools/textlint.mjs | grep -q ' 0 changed against the snapshot'"`, /tmp/rm/rv/mutate-text.md): 2 caught (F12, F14), 4 missed (F9, F10, F11, F13). F14 was caught only because the word count changed, not by a time check. Time words are checked only by `packet.mjs --check`.

## For the checklist (new kind of fault)

- A memory or line pool that sits directly above the paragraph it points at must not restate that paragraph (L1, L2).
- A faked day record must be faked for one key only, or a wrong key passes (TG2).
- A review cut can bring in a new count or claim: run the cut text through the brief's own bans again (M1).
