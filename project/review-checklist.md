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

## Text quality
- The tic list (`canon-card.md`); new habits replacing old tics (part 4 L9; part 7 L9; part 8 T15).
- Sentences broken across paragraphs; the lowercase start after a comma (part 8 T18).
- Beats and jokes lost from the old text (part 8 T16; part 9 T13).

## Tests (TG)
- Each new text reachable in a real game, not only with a faked day record (part 4 TG1; part 5 TG1).
- The render pass covers the branches by day, hour, flag and form (part 4 TG3; part 5 TG3, TG9).
- Leftovers in the tests (unused imports, dead constants; part 9 C7).
