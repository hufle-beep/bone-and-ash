# P25-A — the cold review (Opus, 2026-11-22; repo only, rule 8)

Reviewer: a helper agent on Opus that had not seen the build, from `project/review-checklist.md` and `review-checklist-code.md`.

**No high findings.** The realm is read when the fight is built (`main.js` startCombat, `story.js` instantWin, the preview on a copy);
nothing changes James's realm between building and fighting; nothing else builds the ape (the no-dice raise 14.5, `HP_TUNE` 0.8,
`prepare`, the fight lab and the bots all read `encounter()`). The fight James taps into: HP 44 / lured 32, DC 31.5, attack 32.5 below
Core Formation; 24 / 18, 22, 23 from it; the preview's degree and threat word agree. No FAQ or story text states the ape's numbers.

| Finding | Severity | Done |
|---|---|---|
| M1: Yuki's realm and the real tap path untested (TG1, TG2) | medium | done in v0.11.255 (tests) |
| L1: the wall goes once a Coil starts at Core Formation (two won clears, a Long Forest season) | low, design note | open, options later |
| L2: `id in TUNE_LOW` matches inherited names | low | done (`Object.hasOwn`) |
| L3: the fight lab's `rot_ape` row mixes the two tunes | low | open, options later |
| L4: a log line when the longest random run passes about 6,000 steps | low | open, options later |
| L5: `sw.js` VERSION, `reference.md`'s tune line, run the full check | low | done |
| L6: `tools/mutate.mjs`'s default `--quick` is no flag (it runs 1,000 games) | low, outside | open, options later |
| TG3 (the Coil's kept realm), TG5 (allies after the tune) | test gaps | done; TG4 (null / string realm) left: the game always stores a number |

Planted faults (`tools/mutate.mjs`, `node tests/story.test.mjs --games 50 --workers 1`): 9 of 11 caught; M8 (the higher of James's
and Yuki's realm) caught after TG1; M9 (a missing realm read as Core Formation) near-equivalent (only a null realm differs).
