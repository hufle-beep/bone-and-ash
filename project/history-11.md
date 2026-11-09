# Bone and Ash — history, part 11

Started 2026-11-09 (v0.11.86), when `history-10.md` passed 45 KB. Newer than `history-10.md` … `history.md`. Each push moves what is older than the last three versions here from the handover, newest first.

## Moved from the handover in v0.11.87 (word for word)

### From "Open items" (the NEXT item and the roadmap item, as of v0.11.86)

- **NEXT, the owner's order (2026-11-08 22:10 and 22:39; new in v0.11.82; the FAQ done in v0.11.83, the difficulty in v0.11.85):** (1) and (2) done (v0.11.83, v0.11.85; their words moved to `history-10.md` and `history-11.md`). **Open small items (owner 23:37, "my call later"):** "Fists only." twice at the start of Bao's brawl; the spar's "terms agreed" line on the forced path (`ya_forced`); a brawl win's GU XP about double a small fight's; the Journal's "checks rolled" (group e). **Next before the playtest (the owner's order, 2026-11-09 00:43):** (1) **#53, the farmable Coil bonus: done in v0.11.86** (C1 + G1 + W1; decisions below); (2) **the sitting loop**, next, options and numbers first (the Sitter still reaches realm 14 and T10 L10 by Act 1's end: a higher skill tier shortens the regen Cycle from 30 min to 1 min from T6, so Qi stops limiting sits, and sits run ×10 from 30 uses); with its own options and numbers. Also open (the owner's call): the Sitter clears at 2.78 / 2.80, well inside the 4 / 6 targets; dying on purpose still adds the bonus (roadmap section 2, v0.11.86).

- **The roadmap, regrouped in v0.11.65 (owner pick G2):** `project/roadmap.md` holds only the open work, in six sections: **1** the story and mechanics pass (push 1 done in v0.11.64; **group a done in v0.11.66**; **group b done**: one hub format in v0.11.67, where replies show in v0.11.68, **the missing replies of the one-off story choices in v0.11.69** (the repeating ones moved to group e); **group c, the small rules, done in v0.11.71** (Yuki's food switch, one total per skill for "Cultivate until the limit", more than one wilds exploration a day from Coil 2), **g the copy-over push 5, the Coil (moved up from section 4 in v0.11.70), done in v0.11.72** (the Coil screen's closest cards and what carries over, the next-step line, the targets and the personal best), h the analysis of Selene's and the SillyTavern repositories, i the games analysis (Selene's `project/research.md` list, about 45 games, plus the games the owner names before d)**, d combat, e story texts (now also the Fable rewrite pass and its comparison, the relationship decision of 14:50, the repeating replies), f romance; **order since v0.11.70 (O1): c → g → h → i → d → e → f**, then section 2, then the rest of section 4), **2** the balance retune (E below), **3** a later art pass, **4** systems still to build (F, the copy-over push 5 (the Coil), then G; threads need a new design without the queue), **5** later, **6** waiting on the owner. Done, stale and moot lines: `project/roadmap-done.md`. **group h done in v0.11.73** (H1 + K1; the findings placed in the roadmap's groups, each marked "new in v0.11.73, from group h"). **Group i's round 1 done in v0.11.74** (I1 + L1 + E1: 52 candidates, #43–#94 in `research.md`, each placed in the roadmap, marked "new in v0.11.74, from group i"; the Coil-bonus finding, #53, in section 2). **Round 2's wave 1 done in v0.11.75** (W1: dating sims and visual novels, 26 candidates, #95–#120, marked "new in v0.11.75, from group i round 2"). **Round 2's wave 2 done in v0.11.76** (V1: cultivation and xianxia games, idle and not, with E1's five and Chinese sources; 26 candidates, #121–#146, marked "new in v0.11.76, from group i round 2"). **Group i is done. Group d (combat) started in v0.11.80: the fight lab (L1, a tool).** **The Tan brothers' fight fixed in v0.11.81 (T1); the brawls in v0.11.82 (B1 + Y1).** **Tabled by the owner (22:10) until the FAQ is built; then the difficulty (22:39); both below.** Left in d after that (each its own options and pick, numbers first): the blade's lead over every other action, the weapons by Convergence, flight, the fight ideas from the games; then e, f, the retune, the rest of section 4. Two lore calls for the owner wait in group e (#123: where Core Formation, True Core, Origin Core and Soul Embryo sit on his realm scale; #141: whether this world had breakthroughs without tribulations before the poison). *(The three open items this replaced are in `history-9.md`, moved in v0.11.65.)*

### From "Decided in chat"

- **v0.11.84: docs only (owner 23:33: "it's ok I'm group f. give update the docs and give me a handover message"):**
  - **Recorded:** the owner confirmed the place of his 23:22 bug report (Yuki's love-life talk in human form at Origin Core) in the roadmap's group f, beside the romance gates. A handover message for a new chat given in chat.
  - **Also:** moved word for word to `history-11.md` in v0.11.86.
  - **Checks:** see the version note.

### From "Version notes"

## v0.11.84 — docs only: the bug's place confirmed

- **project docs** (handover, roadmap, changelog, restore-points, history-10: v0.11.81 moved there), **sw.js** (VERSION). The game identical to 0.11.83; saves unchanged.
- **Checks:** docs only (rule 2): `node tools/consistency.mjs`, `node tests/tools.test.mjs` and `bash tools/check.sh quick`. How it interacts: no game file, save or bot code changed, so the game and the bot numbers can't move. What can break: nothing new.

## Moved from the handover in v0.11.86 (word for word)

### From "Decided in chat"

- **v0.11.83: the FAQ (owner 22:10; Claude read Selene's FAQ and its unfolding (`hufle-beep/Long-patience` index.html); options at 23:00: P1 its own tab / P2 a menu button, T1 Claude's texts from the game's own numbers / T2 Fable drafts, R1 the James tab's dice-era rules replaced / R2 kept; owner 23:06 "Go with your picks"):**
  - **Picked:** **P1 + T1 + R1.** A sixth tab, **FAQ** (one row from 360 px), Selene's unfolding as it is: gates checked on every redraw; unlocks and opened entries on the phone (`boneash.faq.v1`), never in a save; a phone new to the FAQ counts nothing already reached as new; new tags, the first new entry opens, a dot on the tab; search (every word); opened from a tab, that tab's entry opens. 20 entries, 9 from the start; the rest behind the first work card, fight, Meditate, Coil end, rewind, person met, Yuki's second form, Act 1, the Long Forest (the list: `js/core/faq.js`). Texts Claude's (help text: no Fable step), the numbers read from the game, so the difficulty push updates them. P2, T2, R2 not picked.
  - **Cold review on Opus** (rule 9: no logic or balance): fixed: the James tab's button found no entry on a new game; Fights named the blade wrong early on (the Fragile bone knife); small text errors; a re-tap of the tab read the next new entry; search read HTML; open entries kept across tabs; more numbers read from the game or checked (`YUKI_HOURS` exported, `REL_MAX` named, unchanged), every bold label checked against the game's words. Kept as Selene's: a search opens (and so reads) its matches. Open (the owner's call, roadmap group e): the Journal's "checks rolled".
  - **Also:** `bfc0f07` filled in for 0.11.82; after v0.11.82 Claude uploaded 5 docs (handover, roadmap, changelog, restore-points, history-10); v0.11.80's notes to `history-10.md`; the owner's bug report of 23:22 (open items; roadmap group f).
  - **Checks:** see the version note.

### From "Version notes"

## v0.11.83 — the FAQ (P1 + T1 + R1)

- **js/core/faq.js** (new; pure), **js/main.js** (the FAQ tab, its dot, search, per-tab entry; the James tab's button), **index.html, css/style.css** (six tabs, the FAQ's styles), **js/core/tasks.js** (exports for the FAQ, `YUKI_HOURS`), **js/core/game.js** (`REL_MAX` named), **tests/faq.test.mjs** (new), **tools/check.mjs, tools/browser.py** (part 2: `faq`), **sw.js, tests/README.md, tools/timings.json; project docs**. Saves unchanged; no id changed; one new phone key, `boneash.faq.v1`.
- **Checks:** a game change (rule 2): the full `bash tools/check.sh`, before and after the review's fixes: exit 0, 0 drifted of 152, 0 past 5; the models unchanged (Careful 2.23 / 2.83, Completionist 2.08 / 2.77); the four browser parts pass. Mutations by hand: the James entry gated again, a label renamed, the re-tap fix undone: each caught.

### From "Decided in chat", v0.11.84's "Also" line

  - **Also:** `18a0aa2` filled in for 0.11.83; after v0.11.83 Claude uploaded 7 docs (handover, roadmap, roadmap-done, changelog, restore-points, history-10, reference); v0.11.81's notes to `history-10.md`. After v0.11.84 (`5eb5683`) Claude uploaded 5 docs (handover, roadmap, changelog, restore-points, history-10).

### From "Open items" (the NEXT item, its done parts)

- (1) **the FAQ: done in v0.11.83** (this part of the item, the owner's words, moved word for word to `history-10.md`). (2) **the game at least twice as hard: done in v0.11.85** (D + T1 + M1; decisions below).

### From "Open items" (the art item, the files on the owner's PC)

- push 5a's: job lists `input/boneash_jobs/a1p5a_*.json`; masks `input/boneash/f5_*.png`; pictures `output/boneash/f5_<key>_<what>_s<seed>`; push 5b's: job lists `a1p5b_test_bg.json`, `a1p5b_test_p.json` … `a1p5b_test_p3.json`, `a1p5b_bg2.json`, `a1p5b_forms.json`, `a1p5b_forms2.json`; stand-ins and masks `input/boneash/b5l_*.png`, `b5m_*.png`; pictures `output/boneash/b5_<key>_bg_s<seed>`, `b5_<key>_<form>_s<seed>`.
