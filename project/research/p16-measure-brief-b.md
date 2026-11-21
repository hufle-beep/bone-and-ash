# Helper B: measure push 16 (BB's first bundle, the Blackroot and the forest): the text reads

You read only; you change nothing in `/home/claude/bone-and-ash` except writing `project/research/p16-measure-b.md`. Another helper runs the bot games on this machine (2 cores): run no model tests; `node tools/packet.mjs <scene> --games 0` and `node tools/textlint.mjs` are fine. Read excerpts only (grep, line ranges), never whole story files.

Read first: `CLAUDE.md`; `project/roadmap-e.md` lines 28 (the flight line), 30 (the night's rules), 31 (small text fixes), 45 (KA (b)); grep line 29 for "FC", "BYb-t", "ST2", "hare"; `project/canon-card.md`; `lore.md`'s flight section (grep "fly\|flight").

## State
v0.11.245 on `main` (the game = v0.11.243's). The bundle: the Blackroot (Act 1's forest: Root Road, Ashen Hills, Drowned Wood) and the prologue's forest. Text items are drafted by Fable later; you only scope them.

## Read and scope each (lines, words, scenes, where the code would change, conditions, risks)
1. **The night's rules, open part:** "the texts that promise a full night after a night fight (not read)". Since v0.11.92 the morning after a night fight gives back only half the missing HP and Qi. Grep every text after a night fight or a night flight (the forest night, the wolves, jackals, the Blackroot's night encounters, `fo_wolf`, camps) for promises of a full night's sleep ("sleep properly", "a full night", "rested", "sleep till", "wake rested", "the whole night"…): list each hit with file:line, scene, area, and whether it is wrong under the rule. Also re-grep the v0.11.229 NR time words briefly for anything new since.
2. **The forest's small text fixes:** every still-open item on the "Small text fixes" line (31) and in line 29's tails that sits in the prologue forest or the Blackroot (not the village / Ashfall / the Fallout: those are bundle 2): name it, its scene, and its size. Known candidates: a menu opened at 19:00 offering her card after it (ME; where?), the cairn while both are away / the climb without Ya's door / the beetle's Ya +3 / `BT_MEI`'s night block (LG: say which area they are in), `breakthrough` leftovers. Also a fresh `node tools/textlint.mjs` summary: tics in forest or Blackroot scenes (the tic list and where).
3. **FC, the first flight:** today the first flight each Coil is one line in the Foundation closer ("The ground, it seems, has let go of you."), no discovery scene in Coil 1. Scope a Coil-1 discovery scene: where it would hook (the Foundation closer, `BT_CLOSER`, `g.seen.breakthrough`?), conditions (first Foundation in Coil 1, where James is: the prologue forest, the village, the Blackroot), the forms of Yuki it must cover, size in words, and whether locals can see it (lore: locals fly only from Golden Core).
4. **KA (b):** a kept realm's later passes never show the Foundation closer and its first-flight line (only at a breakthrough). Scope a fix: where a Coil's start at Foundation or above could show a one-line return of flight, which screen, conditions, words.
5. **BYb-t:** "a 'Wen told you' paragraph" at Foundation when Wen's lesson was seen but not `lore1`: find the Foundation breakthrough text's branches, what each says, and what the paragraph would need.
6. **ST2 degree 3:** `far_won` degree 3 (2 texts, about 230 words + 4 form clauses, shown 0 by bots): where it is, why bots never reach it, and whether a text is still worth it.
7. **The hare's CW line:** what it is, where (old calendar only), why the long calendar never shows it.
For each, say whether it needs Fable (story text), Claude only (code / conditions), or both, and any canon call it would need from the owner.

## Write
`project/research/p16-measure-b.md`, under about 8 KB, one section per item with file:line references. Reply with a 7-line summary.
