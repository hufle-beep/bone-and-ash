# P26 — the cold review's brief (v0.11.256; owner pick P26-A, 2026-11-23)

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash (do not commit, push or edit any file outside
`project/research/`). Read `CLAUDE.md` (the hard rules) and `project/review-checklist-code.md` first; read excerpts only (grep, line
ranges), never whole story files. Do not run the full check or the models (Claude runs them); single unit tests are fine.

## What was picked (the owner, in the question dialog: "P26-A 🟢 (Recommended)")

The retune's last Act 1 numbers (TS7). Every new game plays the long calendar (`g.cal === 7`); the old calendar is bots and tests only.

- **LN** (`js/story/prologue.js` `collectorsFight`, `LU_HP_LONG`): on the long calendar Lu Han's HP −0.5 before the long step
  (`common.js` `longStep`, ×1.375 then rounded), beside the d6 spread (`luSpread`).
- **LR** (`LU_READ_HP`): +0.5 HP for each realm Lu Han reads (`luReads`: James's realm − 1, at least 0, long calendar only), before the
  long step. His DC and attack reads (`LU_READS` 1.75 a realm) unchanged.
- **RP-1.5** (`js/core/game.js` `satDiv`, `LONG_SAT_FROM` 3, `LONG_SAT_HIGH` 6): from True Core (realm 3) on, a long-calendar sit's
  Saturation ÷6 in place of ÷4; `satDiv` also divides the Blackroot root (`act1_blackroot.js` `rootGain`) and a Long Forest seclusion
  (`longforest.js` ~line 479). The FL1 floor (at least 0.1% a sit below the top realm) unchanged.
- A What's new line (`js/core/news.js` 0.11.256, Claude's words).

Measured before the pick on scratch copies, identical on the build (the models, long calendar, same seeds; Completionist and
Cultivator 100 games, Careful and Sociable 40): whole game on Coil 1 20 → 22% / 26 → 25%; Careful and the Sociable prologue 2.40 → 2.10
Coils, Act 1 4.47 → 4.35 / 4.40 → 4.25; realm at Act 1's end 1 / 1 / 2 / 5 → 1 / 1 / 2 / 4.08.

## The diff

`git diff` in the repo: `js/core/game.js`, `js/story/prologue.js`, `js/core/news.js`, `tests/story.test.mjs` (the P26-A block at the end;
the SC2 block's pace pins and the long-step HP pin updated).

## What to return (one file, `project/research/p26-review.md`, under about 10 KB)

1. Findings, each **High / Medium / Low**, with file:line and a concrete failure (inputs → wrong result). High = a player-facing fault
   or a test that now passes when the game is wrong. Look especially at: every caller of `satDiv` (does each read James's realm at the
   right moment, e.g. a seclusion or root that crosses a breakthrough, a save loaded mid-realm, a kept realm at a Coil's start); any text
   or forecast that states a sit's gain or a realm's hours without `sitGain`; `g.james?.realm` against `g` shapes passed in (null, `{}`,
   an old save); Lu Han's HP with militia, the spread's lowest roll and every realm 0–14 (can it go to 0 or below the militia floor's
   intent?); the preview (`power.js` `degreeForChoice`) against the real fight; the old calendar unchanged.
2. Test gaps (TG1 …): what is not tested that should be.
3. Planted faults in `project/research/p26-faults-review.json`, the format `tools/mutate.mjs` reads:
   `[{ "id": "C1", "file": "js/...", "find": "exact text, once in the file", "replace": "...", "note": "what it breaks" }]`,
   6–10 faults in the changed game code (not in the tests). Do not run them; Claude runs them.
