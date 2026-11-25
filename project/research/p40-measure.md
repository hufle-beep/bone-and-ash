# P40 — measured before the pick (2026-11-25, on v0.11.271)

Scratch copies in /tmp (`git archive HEAD`), removed; nothing in the repo changed for these. Seed 0, `--off 0`, 50 games a model.

## The kept realm (the P39 review's L3, KA's (a))

A scratch hook in `tests/models.test.mjs` set `g.stats.clears` to N − 1 before the first pass's whole-game bite (the bite adds its own clear), so the kept realm (`keptRealm`: the lower of the won clears and `keptTop`, the realm at a won clear) could pass Foundation. Two copies: `HP_TUNE_HIGH.collectors` 0.7 (as built) and 0.8 (as before P39-A).

`--kept --kept-clears 2` (the second pass alone):

| model | realm at its clear (first pass, mean Coil) | kept start | collectors 0.7 / 0.8 | tribute C1 won 0.7 / 0.8 | whole game on Coil 1 0.7 / 0.8 | realm at Act 1's end |
|---|---|---|---|---|---|---|
| Cultivator | 4.02 / 4.04 (1.66 / 1.82) | 2.00 | 100 / 100% | 98 / 100% | 100 / 100% | 5.08 |
| Completionist | 2.00 (1.80) | 2.00 | 100 / 100% | 100 / 100% | 100 / 100% | 3.00 |
| Careful | 1.00 (4.96) | 1.00 | 100 / 100% | 100 / 100% | 100 / 100% | 1.00 |
| Sociable | 1.00 (4.96) | 1.00 | 100 / 100% | 100 / 100% | 100 / 100% | 1.00 |

No tribute lost in any run (the Cultivator's 98% is one game ending the tribute another way). Without the hook (`--kept` as before, 1 clear: kept Foundation), the Cultivator's 20-game run: tribute C1 won 90%, collectors 100%, the whole game on Coil 1 100%.

`--kept --kept-clears 5`, the Cultivator, 0.7: kept start 4.02, tribute C1 won 96% (none lost), the whole game on Coil 1 100%, realm at Act 1's end 6.00; endings accord 7 / revelation 16 / victory 27. XW-a (from realm 7) is reached by no bot.

Built (KC): the same with the option in the repo, the Completionist, 2 clears: identical (start 2.00, Act 1's end 3.00, 100% throughout).

## The fight texts (TG6)

`tools/textlint.mjs` with `TELL_TEXT`, `SAY_TEXT`, `FOE_TRAITS` (every string but the traits' `tag`s, once each) as the pool `fight`: 47 lines / 763 words, twice 0, shared with a scene 1, tics 0, broken 0, spacing 0 (with the 8 tags: 55 / 780, P39's count). Against the snapshot: 7 log-only notes (the pool's seven counts, new); the snapshot re-saved.
