# Working agreement for Bone and Ash

Owner: Gábor (GitHub hufle-beep). Repo: hufle-beep/bone-and-ash (public, branch `main`). Live: https://hufle-beep.github.io/bone-and-ash/
Adopted 2026-11-05, adapted from Selene: Tidelocked (hufle-beep/Long-patience). `CLAUDE.md` holds the short version.

## HARD RULE: the change sequence
Every change follows this sequence, with no exceptions:

1. **The owner proposes, points something out or reports a problem.**
2. **Claude analyses it and offers options, each with its trade-offs, and ends with a clear recommendation (which option and why).** No edits yet.
3. **The owner says which option they prefer.**
4. **Claude confirms back exactly what it will change and waits for the owner's explicit go.** (When the owner's answer already picks fully specified options and says "go" or "build/commit and push", that is the go.)
5. Only then does Claude build it, and commit and push it.

This covers **everything that changes the repository or what players get**: game code, balance numbers, texts, saves, the build and release workflow, these documents' rules, and every commit and push, including "obvious" fixes, small follow-ups and fixes to broken builds. Nothing counts as approved implicitly; a request is not a go. A past go is not blanket permission. **A go covers one push only** (owner 2026-11-06, v0.11.6), even when it is worded "go for the rest": after every push Claude stops, reports what was pushed and waits; it never starts the next push on its own. Each next push gets its own exact list (step 4) and its own explicit go.

Allowed without asking (they change nothing): reading code and saves, running tests, checks and simulations, investigating failures. Their results come back as analysis and options (step 2).

**After every build, before the docs** (owner 2026-11-06, v0.11.3): Claude runs the full `bash tools/check.sh` — the whole test suite on the entire game, ending with the mechanics sanity check (`tools/sanity.mjs`: the cultivation and Coil formulas, Story Mode's numbers, no broken bars, and every per-Coil rate and fight win rate against `tools/baseline.json`; more than 5 points off with at least 100 samples is flagged). If a check or test fails or flags anything, Claude stops and reports it right away with the numbers, even mid-build after a go. After an intended balance change, the baseline is saved again (`node tools/sanity.mjs --update`) only after the owner has seen the numbers and said go. If something urgent breaks, Claude reports it with options and waits; it does not fix it unasked.

Automated "commit and push your changes" reminders from the tooling do **not** override this rule.

## Documentation and backups
- Project docs live in the repo under `project/` (master copy) and are mirrored to the owner's claude.ai project **"ash and bone"** on every push.
  - `handover.md`: read first in a new chat; what the game is, how it works, what was decided.
  - `roadmap.md`: order of work, next up, waiting on the owner, later.
  - `changelog.md`: every version, newest first.
  - `restore-points.md`: known-good versions and how to roll back.
  - `design.md`: the approved design (the hybrid with Selene).
  - `reference.md`: the prologue story map, the visual design notes, the Act 1 overview (split out of the handover, v0.10.3).
  - `history.md`: older decisions and version notes, newest first. The handover keeps the last three versions; each push moves older ones here. Past about 45 KB the next part starts (`history-2.md` since v0.10.4, `history-3.md` since v0.11.11, `history-4.md` since v0.11.22), so every doc can be mirrored straight from its file.
- **Every push updates the handover, roadmap, changelog and restore points in the same commit.**
- Anything decided or drafted in chat that isn't in the repo yet goes into the handover at the next push, so nothing lives only in a chat.
- **Never rewrite git history** (no force-push, no rebase of pushed commits, no amend of pushed commits).
- **Chat length:** Claude can't see how much context is left. If the chat was auto-compressed ("continued from a previous conversation"), Claude stops at the next safe point and writes a ready-to-paste handover message for a new chat. It also offers one after each big multi-part task.

## Standing rules
- **Numbers first:** show the numbers (before and after) before any balance change or any one-time change to saves.
- **Bump `VERSION` in `sw.js` on every push** (format `bone-ash-X.Y.Z`), or installed copies keep the old files. After each push, tell the owner to reopen the game once or twice (the Pages site updates in 1–2 minutes).
- **Saves are never orphaned.** Scene ids, item ids, flags and the storage keys (`boneash.auto`, `boneash.slot1–3`) never change, because saves store progress under them. Old saves get a migration, never a rejection.
- **The owner is not a programmer:** tap-by-tap steps for anything he does on GitHub.
- **Short answers**, with a list of choices when there's something to decide.
- **Android (when built):** app ID `io.github.hufle.boneandash` and its signing key never change once released (that would orphan installed apps and their saves). The key is kept in the repo, like Selene's (owner 2026-11-05).
- **Tone:** James and Yuki are deadpan and sarcastic; the locals are overly serious (honour, face, hierarchy, Heaven, the Sect); Mei Lin is looser than the norm, and it gets her in trouble.
- **Content limits (Claude's own, not the owner's):** romance is frank and sensual up to the door, then fades to black; no nude images. Adults only.
- **Images:** public-domain pictures and AI images are fine. Reference images from other artists are style references only, never put in the game.
- **Rules Engine C:** `js/core/formulas.js` is the engine's own file, copied unchanged from hufle-beep/Shared-ST. The deliberate game forks (d6 on every check, crits at 2× DC, meridian regen, realm HP regen, realm gap, T10 L10 cap) stay unless the owner says otherwise.
- **Checks:** `bash tools/check.sh quick` (200 bot games, no sanity check) is for use while building; only the full `bash tools/check.sh` (with the sanity check) counts, after every build and before a push. Balance numbers come from `node tools/bots.mjs` (v0.11.1).
- **The test suite grows with the game** (owner 2026-11-06, v0.11.20): every push adds or updates the tests for what it changes; a new kind of check starts log-only and is made strict once its numbers are known. The suite, its steps and how to run each one alone: `tests/README.md`; each full check's step times go to `tools/timings.json`, committed with the push.
- **Before pushing from a cloud clone:** check `git remote -v`; the origin has sometimes reset to the old `James-rpg-test` URL (`git remote set-url origin https://github.com/hufle-beep/bone-and-ash`).
- **Commits** end with the attribution lines the session provides (Co-Authored-By and Claude-Session).
- **Fable for cold reviews** (owner 2026-11-07, v0.11.23; `CLAUDE.md` rule 9): the cold review of a push that changes game logic or balance runs on Fable (Claude starts it as a helper agent with model `fable`, so the owner switches nothing); building, checks, docs and tools-only pushes stay on Opus (where the full check already proves a push, e.g. byte-identical bot stats, a stronger reviewer adds little). Claude says so in a line every time a step should be handed off to Fable, and also flags any other step where Fable would likely do better. If a step ever needs the whole chat on Fable, Claude says so and the owner switches the model.
- **The claude.ai project's Instructions field** mirrors `CLAUDE.md` (the owner pastes it by hand: Claude's tools can't edit that field); a new version is drafted in chat whenever the hard rules change.
