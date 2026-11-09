# Bone and Ash — history, part 11

Started 2026-11-09 (v0.11.86), when `history-10.md` passed 45 KB. Newer than `history-10.md` … `history.md`. Each push moves what is older than the last three versions here from the handover, newest first.

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
