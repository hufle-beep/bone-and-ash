# Bone and Ash — the cold review checklist (Opus)

*New in v0.11.178 (owner pick U1, FR: cold reviews back on Opus). Drawn from what Fable's cold reviews of the rewrite caught (parts 4–9, `project/research/rewrite-part*-review.md`). A cold review is a helper agent on Opus that hasn't seen the build: it reads the diff, the brief and this list, renders what it needs, and reports high / medium / low findings and test gaps (TG). Planted faults go through `tools/mutate.mjs`, not by hand. Each review adds the new kind of fault it found to this list in the same push.* *(v0.11.212, owner pick CK1: split by kind under the 12,000-byte cap; this file: how to read and the text lists. **A push that changes game logic, UI or tests: also `review-checklist-code.md`** (the test gaps and the code lessons), read with this file's "How to read"; a push with both: both.)*

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
- **A quarry rolled each day (v0.11.230 H1):** a later-day text keyed on the days a kind showed, not on wins ("the same pair", "recognition"): the beast was likely killed on an earlier day; the habits can be familiar, the animal new.
- **Pools blind to their scene:** a line pool drawn after many scenes (the flown and carried walk lines) shown after a hard beat (a rescue, a grave find, a grief night) where its jokes don't fit; mark those uses (v0.11.197 M2: `quiet`).
- **The clock's day against the text day (v0.11.203 L4):** a beat keyed on `clockParts(g.minutes).day` opens after midnight on the night before its day (`dayHour` reads 00:00–03:59 as the evening before); the text day (`textDay`, from 05:00) is the story's.
- **Flags that outlive their story:** a rule keyed on flags that are never cleared (`mei_party`, `ya_party`) firing where the people aren't (Ashfall after the Return; v0.11.197 M1).

- **A presence rule (who is there; v0.11.231 T H1, M1, M2, C M1, M2, TG-C1, TG-C5):** walk every screen reachable from the cards that stay open while someone is away (the other woman's talk, a scout scene, the door scenes and what follows them, the same day and a later one), over several real days of one game per state (not a fresh game a day: that reads only day 1), in each form; count heads ("the two / three / four of you"), not only names; and the order the rule now forces (a scene that assumed the old order).

- **A cycle's branch formula (v0.11.233 T M1):** count the endings of every plain and warm branch across a whole cycle of texts, and the result pools drawn under them; a brief that prescribes a branch's beat makes every text end on it. And a line on a hub screen (which never folds) against every state that redraws it: the food on hand, the screen after the meal (v0.11.233 T M2, C M1).
- **A result line drawn above the next scene (v0.11.234 T M1):** it must stop where that scene's text starts (no sleep before the screen that settles him) and must not repeat its opening noun; a brief's "it ends with…" goes into every line, so read the brief's prescribed endings and props (the sleeve, the mother) across the whole cycle.
- **Two cycles that run in step (v0.11.235 T M1, M2, M3):** read the scenes of one evening together (the walk's text n, then the supper's n), not each cycle alone: a joke family or a brief's prescribed beat ("laughs, checks who heard", a closeness that "stays there") can land twice in one evening; and read every cut for a pronoun it orphaned.

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

- **v0.11.209:** grep callers of `[0]`/`.length` before prefixing a result (H1); every `advance(` whose return is dropped (M1); every backward clock write (M2); exact minutes, not `>=` (TG4).

## Text quality
- **A voice habit spreading (v0.11.181 M4):** count one image family (here legal words) across the new texts, and from one character to others.
- **James's expertise against fact and against the game (v0.11.181 M2, M3):** real-world mycology and cooking; what he has already done ("until today").
- The tic list (`canon-card.md`); new habits replacing old tics (part 4 L9; part 7 L9; part 8 T15).
- Sentences broken across paragraphs; the lowercase start after a comma (part 8 T18).
- Beats and jokes lost from the old text (part 8 T16; part 9 T13).

- **An insert before a sentence that opens on a pronoun (v0.11.190 M1):** a paragraph spliced in front of "Then she …" changes who "she" is (the women's paragraph ended on Mei Lin, the scene's next sentence meant Yuki). Check the first word of every anchor, and the screen after the insert for "the two of you" and a joke the insert has just made (M2).
- **An insert before a scene's own first sentence (v0.11.193 M1):** check that sentence's pronoun as well as the anchor's: `ASK_WOMEN` went in front of `YK_HERE.first`, whose "She is in the tall shape" then read as the woman who had just left.
- **Who a named local is in the game, not only on the card (v0.11.185 M1):** grep the name in the story before a brief allows it (Pock-Face was on the canon card as a villager; in play he is Gao's lackey, met only on some paths).
- **A cut's reason gets a grep too (v0.11.193 H1):** Claude's cut C2 swapped Fable's "spirit beast" for "root-kin" as "a term the game never uses"; the grep missed the hyphenated "spirit-beast" the mother says at supper, and "root-kin" is James's people's word, not a local's. Grep every spelling (hyphen, space, plural) and who says it before a cut's reason goes to the owner.
