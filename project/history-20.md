# Bone and Ash — history, part 20

Started 2026-11-13 (v0.11.166), when `history-19.md` had passed about 45 KB. Newer than `history-19.md` … `history.md`. Each push moves what is older than the last three versions here from the handover, newest first.

## Moved from the handover in v0.11.166 (word for word)

### Decided in chat

- **v0.11.163: the seven leftovers of v0.11.161 (W1, HN1, TL2, F1, D1, RV1; LF0 and L4-a):** the full entry trimmed in v0.11.165 (the handover past 35 KB), word for word in `history-19.md`. In short: W1 the forced pick of Careful and the Sociable takes each door once a day, then "Rest an hour.", and every model but Random takes "Not now." only when nothing else is open (Careful's forced picks 5,971 → 1,647 per 300 games; the Completionist's rot ape back to 99.0%); HN1 "under Fed 30 with food" a log line (no Eat card on those screens; a bot that eats anywhere: 921 → 0, Act 1 3.33 → 3.35); TL2 the text lint reads one sample with every once-a-day key used; F1 a failed browser part runs once more, a FLAKE line when the retry passes; D1 the drift baseline re-saved (146, 0 past 5); RV1 the Opus review's M1, M2, L3, L5, L6; LF0 (a hunt's familiarity twice a day kept) and L4-a (old saves' one extra day kept).

### Version notes

## v0.11.163 — The seven leftovers answered: the bots, the tools and the tests (W1, HN1, TL2, F1, D1, RV1)

- **Files:** `tests/lib/forced.mjs` (new: `forcedPick`, `oldForcedPick`, `skipNotNow`, `hungryLine`), `tests/models.test.mjs` (RS for Careful and the Sociable, NN for every model but Random, the hungry log line), `tests/tools.test.mjs` (the W1, HN1, TL2, F1 and RV1 blocks), `tools/textlint.mjs` (the used-today sample), `tools/text-baseline.json` (re-saved: Blackroot variant words 5,138 → 5,314), `tools/check.mjs` (the browser parts through `retryOnce`; a flaked step keeps its stored time), `tools/lib/jobs.mjs` (`retryOnce`, the stopping mark in `killAll`), `tools/lib/report.mjs` (`FLAKE` shown), `tools/baseline.json` (re-saved, D1), `tools/timings.json`, `tests/README.md`, `project/reference.md`, `sw.js`, docs (v0.11.160's entries to `history-19.md`). No game file, save, id, flag or key changed; no What's new line (nothing a player sees).
- **Checks:** the bots' code (rule 2): the full check after W1 + HN1 + TL2 + F1 (exit 0; 14 moved more than 5, log only, as before; the models Careful 3.17 / 3.32, Completionist 3.31 / 3.51, Cultivator 2.82 / 3.04, Sociable 3.17 / 3.55, Farmer 3.37 / 3.56; Careful's forced picks 2,640 per 500 games; no models-baseline note; no FLAKE); then D1 `node tools/sanity.mjs --update` (146 compared, 0 moved more than 5); after RV1 (tools and tests only): the tools test (311 passed) and `bash tools/check.sh quick` (exit 0); a mutant of RS's fallback caught by the fixed test.
