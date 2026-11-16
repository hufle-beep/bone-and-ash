# Bone and Ash — the cold review checklist (Opus)

*New in v0.11.178 (owner pick U1, FR: cold reviews back on Opus). Drawn from what Fable's cold reviews of the rewrite caught (parts 4–9, `project/research/rewrite-part*-review.md`). A cold review is a helper agent on Opus that hasn't seen the build: it reads the diff, the brief and this list, renders what it needs, and reports high / medium / low findings and test gaps (TG). Planted faults go through `tools/mutate.mjs`, not by hand. Each review adds the new kind of fault it found to this list in the same push.*

## How to read (cheaply)
- Start from `git diff` of the push and the context packet of its changed lines (`node tools/packet.mjs <scene:index>…`, v0.11.180, CP1): the whole text by form, every label on the screen with when it shows (code, and the days and hours of a bot run) and whether task mode draws it, the result and the screen after. Beyond it, read **only the scenes around each change** (grep, line ranges), never whole story files.
- **Task mode first:** a work menu's text is never drawn and a hub's entry to a menu is no label (the packet's C3); judge a line as the player meets it (v0.11.179 H, R11).
- Render changed texts in the three forms (cat, great root-kin, human) and on the days and flags their branches use, in a scratch copy; never edit the working copy.
- Planted faults: write them as `faults.json` and run `node tools/mutate.mjs faults.json --jobs 2`; report the missed ones as a test gap.

## Canon (`project/canon-card.md`, then `lore.md`)
- **Sensing:** no local feels James's or Yuki's cultivation, and nobody counts or knows what they had no time or way to see (part 9 T3; part 8 T2).
- **Flight:** locals fly only from Golden Core; James never flies in prologue fights.
- **Forms:** a line written for one form shown in another (the bond against speaking aloud; "on your shoulder" for a tiger; a verb after `yk(g)` that breaks for the woman). Every `byForm` has three fitting branches; the human form has its line where the great form has one (part 5 L5, L12; part 7 L1; part 8 T9).
- **Killing:** who dies and who is spared matches the fight's outcome and the flags (Gao Feng can live or die; a `one` text that leaves a beast alive).
- **Selene:** "she" and her name only after Wren's log; "the ship" before it.
- **Facts:** ages, ranks, numbers (four disciples, three hundred years, forty gardeners), and new facts the lore doesn't have (part 8 T17).

## Continuity
- **Day counts and calendar words:** "yesterday", "this morning", "again", "Three days in", "some nights" against the day a text can really show; texts that assume an earlier day or a first visit (part 4 L1, L12; part 6 L4; part 7 L6, L7; part 8 T12, T14, T21).
- **Screen order:** a text that states what the next screen reveals, or that the screen before has already changed (part 6 M1, L2; part 7 L4; part 4 M3).
- **Labels against texts:** a choice label that no longer fits the text above it or the result after it (part 4 L11; part 5 L9).
- **Repeated beats:** the same joke on one screen or on consecutive ones; a line that repeats one a screen earlier (part 5 L6, L10; part 6 L3, L6; part 9 T17, T18).
- **Variants by state:** second-day and later-visit texts that assume the same beast, place or person as the first (part 9 T1, T15); the stomp texts' wins and `one` against each other (part 9 T9).

## Reachability (what the player never sees)
- Texts behind a day record, an hour or a flag a real game never reaches (part 4 M1, M2; part 5 M1, M2).
- Emptied menus and dead texts; a save resting in an emptied menu (part 9 C2, C3).
- A fix placed in a text that is never drawn is no fix.

## Mechanics the text touches
- Times, gains, items and flags unchanged where the brief says so (part 9 C1); a partial result printing a failure line (C5); kept flags that also record what they shouldn't (C6).
- Loot against the text (cores, items named).
- **Result lines and the reply splitter (v0.11.181 M1, L1):** a result with speech outside `GAIN_LINES` puts its stat in the reply; a two-sentence result leaves a fragment in the reply. Run every new result through `splitLine`.
- **Lines drawn under a screen (v0.11.182 M1, M3):** who is still there at the end of the text (a reaction from someone the text sent to bed); a screen that never comes first in its day never draws; slot phrases read in both editions once filled (L3).
- **A passage drawn under a scene (v0.11.183 M2, M4, TG6, TG7):** it must not contradict a part of the scene that always shows (Ya "says nothing whatever" above a passage that gives her a speech), must not narrate past what the next screen opens with (a send-off the next screen starts again), and a local must not react to the content of a song in a language nobody translated. A song's line before it on the same evening counts as well as one after it (M1).
- **A line drawn above a folded scene (v0.11.184 L1, L2):** a memory line sits directly above the scene's first paragraph: it must not restate it or give away its punchline; point at the folded part.
- **A review cut is a draft too (v0.11.184 M1):** run Claude's own cuts through the brief's bans (a count, a claim a Coil may not have shown) and `--check` again.
- **Gates that cross another pool's gate on one screen (v0.11.181 L5):** a stage text by friendship next to a closer pool with its own level.

## Text quality
- **A voice habit spreading (v0.11.181 M4):** count one image family (here legal words) across the new texts, and from one character to others.
- **James's expertise against fact and against the game (v0.11.181 M2, M3):** real-world mycology and cooking; what he has already done ("until today").
- The tic list (`canon-card.md`); new habits replacing old tics (part 4 L9; part 7 L9; part 8 T15).
- Sentences broken across paragraphs; the lowercase start after a comma (part 8 T18).
- Beats and jokes lost from the old text (part 8 T16; part 9 T13).

- **An insert before a sentence that opens on a pronoun (v0.11.190 M1):** a paragraph spliced in front of "Then she …" changes who "she" is (the women's paragraph ended on Mei Lin, the scene's next sentence meant Yuki). Check the first word of every anchor, and the screen after the insert for "the two of you" and a joke the insert has just made (M2).
- **Who a named local is in the game, not only on the card (v0.11.185 M1):** grep the name in the story before a brief allows it (Pock-Face was on the canon card as a villager; in play he is Gao's lackey, met only on some paths).

## Tests (TG)
- **The usual path, not only a fresh state (v0.11.181 TG1):** a gate tested from zero misses the stage already seen before the return.
- **New text pools join textlint's POOLS (v0.11.181 TG4)**, or tics and reused runs in them go unchecked.
- Each new text reachable in a real game, not only with a faked day record (part 4 TG1; part 5 TG1).
- The render pass covers the branches by day, hour, flag and form (part 4 TG3; part 5 TG3, TG9).
- **Pin the owner's fixed words (v0.11.183 TG5):** a fact or reaction the owner set (a disease's facts, "Mei Lin horrified", no music while hunting) gets a word or two in a test, or a planted fault that changes it passes. A walk asserts every placed item shows, not a share of them (TG2), and passes `newVisit` as main.js does (TG3).
- **The browser test and planted faults (v0.11.182):** `tools/mutate.mjs` copies leave out `art/`, so a browser check's faults can't be measured there; say so rather than counting them. *(v0.11.185, RV1 TG5: the copies used to drop `js/art/` too, which broke `tests/data.test.mjs` and `check.sh quick` in every copy; now only the top-level `art/`, `.git` and `node_modules` are left out, so those commands can be measured; the browser test still can't. *v0.11.192 (RV1 M2, the K1 review):* a copy had no `.git` either, so `git ls-files` (`tools/check.mjs`, `check.sh quick`, the leftovers and consistency tests) died in it and every fault measured with them came out "caught"; each copy is now a git tree of its own files (`gitCopy`), and `art/` is copied too (owner pick A1; 17 MB, 0.03 s), so `check.sh quick` and `tests/tools.test.mjs` pass in a copy (measured: exit 0; 386 passed, 0 failed) and can measure faults; only the browser test still can't.)*
- **Pin Claude's cuts and the unchanged text around a refactor (v0.11.185 TG1, TG2):** a cut on Fable's draft gets a word in a test, and a text moved or wrapped gets a hash of a few fixed renders against the version before, or reverting it passes.
- **A faked day record for one key only (v0.11.184 TG2):** a record that answers every key lets a line or text that reads another scene's days pass; fake the scene's own key and walk one real case with `goTo`.
- Leftovers in the tests (unused imports, dead constants; part 9 C7).
