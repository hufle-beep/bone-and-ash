# Cold review brief — v0.11.191 (owner pick Y1, D1)

You review a push you have not seen built. Repo: /home/claude/bone-and-ash (do **not** edit it; copy to a scratch dir such as /tmp/ykr/s/ for any render or test). Read `project/review-checklist.md` first and follow it. Read cheaply: excerpts by grep and line ranges, never whole story files.

## What the push does (from `git diff` in the repo; uncommitted working copy)
- **The owner's report:** Yuki's answer to "family or more" was kept across Coils (`coil.js` KEEP_FLAGS), so she asked only once a save. He wants her to ask every Coil: she remembers, is patient, doesn't push.
- **RP:** `yk_path` and `yk_wait` out of KEEP_FLAGS; the rewind keeps her last answer as `yk_last` ('sister' | 'lover' | 'wait'; `ykLastOf`: this Coil's answer, else "Not yet", else the one before). A snapshot keeps `yk_path` / `yk_wait` only when Yuki is human in it (an Act 1 started after the Long Forest, asked in its prologue); otherwise they are dropped (an old save's snapshot taken after the old keep). An old save keeps its answer this Coil and moves at its next rewind.
- **AK:** `ykAskNow` (yuki_path.js): human this Coil, `yuki_human_seen`, `yk_last` set, no path, no "Not yet" this Coil. The breakthrough's "Get up." (prologue.js) goes to `yk_choice` when it holds (after the first-time great / human scenes, which keep priority); the Long Forest's fire through the same scene (`lf_active`).
- **TX (Fable's texts, `YK_LATER`):** the later question by last answer (q.sister / q.lover / q.wait, away from the fire: she changes out of earshot of the women, who don't remember her human), the fire's (any last answer), the answers the same or changed (`ykLaterAnswer`; place-neutral, shown both in `yk_sister_here` / `yk_lover_here` and in the fire's `yk_sister` / `yk_lover`). A last "Not yet" reads the first answer texts. Claude's cuts (D1): C1 Q-sister "Her ears are pricked." (was "She looks up at you, ears pricked.", a run shared with `rr_elk_won`); C2 A-lover-changed "kisses you lightly" (was "once", then two places).
- **RL (Claude's words, `YK_LATER_RESULT`):** the result lines of `yk_sister_here` / `yk_lover_here` on a later Coil when she goes back to a non-human shape (ykFormBack): "Back in her own shape, …" instead of "She stays as she is …"; the reopened question (she stays human) keeps the first lines.
- Tests: `tests/story.test.mjs` the Y1 block (search "owner pick Y1"), TR1's kept-flag assert; `tests/tasks.test.mjs` the rewind block (path → `yk_last`). `js/core/news.js` a What's new line.

## Measured before the build (the Sitter, 100 games)
- Realm 7 reached once a game, on Act 1 Coils 1–5, Days 10–16; Act 1 starts at realm 3–5 (never human in the snapshot). Path-gated scenes visited on a later Coil before she asks again: 0 (the bots stop at Act 1's end). The full check after the build: exit 0, 0 drifted.

## Files for you
- `/tmp/yk/brief.md` (Fable's brief, tone rules, constraints), `/tmp/yk/drafts.md`, `/tmp/yk/notes.md`, `/tmp/yk/canon-card.md`, `/tmp/yk/now.md`.
- `/tmp/ykr/packet.md`: packets of the changed scenes (first-time state; render the later states yourself with `yk_last` set).

## Report
Write `/tmp/ykr/review.md` (under 10 KB): H / M / L findings with file:line and a concrete fix each, then TG (test gaps). Look especially at: save safety across rewinds and old saves (rule 7: saves never orphaned, ids never change), whether any path-gated scene reads wrong on a later Coil before she asks, and whether the texts hold for every place and shape they show in. Plant faults with `tools/mutate.mjs` (write `/tmp/ykr/faults.json`, run `node tools/mutate.mjs /tmp/ykr/faults.json --jobs 2 --out /tmp/ykr/mutate.md` from the repo; it works on copies) — about 12–18 faults against the new code and texts; list caught / missed in the report. Reply with one line when done.
