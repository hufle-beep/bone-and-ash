# Cold review brief: v0.11.181, CM push 1 (the mother's kitchen and the communal pot)

You review a build you haven't seen, on Opus. Repo: `/home/claude/bone-and-ash` (the working copy; **never edit it**: render and plant faults in scratch copies only; `tools/mutate.mjs` makes its own copies).

## What the owner picked (the scope; anything beyond it is a finding)
- **K (KG1):** Mei Lin's mother's daily card (`mother_time`, house_time.js) gets a kitchen text by her friendship after the visit's +3: stage 1 from 8 (helps), 2 from 15 (shares), 3 from 25 (takes over). The first time a stage is reached this Coil its paragraph (KT_UP), later days a short line of the stage (KT_DAY, pickLine), the return's day (rt_ashfall, Day 20) its own line (KT_RETURN). The card's label by stage before the gain (KT_LABEL; stage 0 the old label). **No gain, time or check changed.** The text order: her day text, the kitchen text, the closer.
- **PS:** the communal pot's result line from the village's friendship 90 (POT_LINE; below it, the old line unchanged), by the place's day (prologue: vday < 3 / ≥ 3; Fallout: Days 8/9/10). A new cook-with-the-women scene, once a Coil in each act (`pot_cook` on the prologue's `ashfall`, `fo_pot_cook` on `fo_ashfall`), from the village's 90, 09:00–14:59, while the pot is open today: a door card of 30 minutes + the scene's choice 60 = 90; +25 satiety (closes the pot that day), Mother +2, Village +3 (cap 150). Cards appended last on the hubs (no choice position changes).
- **D1, T1:** Fable's drafts with Claude's four cuts. **B1:** the two pot lines with speech added to `GAIN_LINES` (replies.js).
- IDs, existing gains, times, flags unchanged. New world flags: `kitchen_seen`, `mother_kitchen`, `pot_cook`, `fo_pot_cook` (they reset with the Coil).

## Read
1. `project/review-checklist.md` (how to read; the checklist).
2. `/tmp/cm/diff.patch` (the code, tests and texts; the new files in full).
3. `/tmp/cm/review-packet.md` (each changed line's screen, when it shows from a bot run, task mode, the screen after).
4. `project/canon-card.md`; `project/lore.md` lines 28–52 only (James's cooking).
Beyond these, read only the scenes around a change (grep, line ranges), never whole story files.

## Do
- Check the code paths: the stage on every slot (prologue's two, the Fallout's three, the burned eve, the return), a Coil starting high, a rewind, an old save without the new flags, the label vs the text's stage, the pot lines on each day and below 90, the cook scene's gate, hours, once a Coil, the pot closed after it, task mode (door cards; the card's result shown?), the bots' regexes in `tests/models.test.mjs` (EAT, SOCIAL) against the new labels.
- Read the texts against the checklist (continuity: each line on every day and stage it can show; tone; facts; tics).
- Plant 10–16 faults as `/tmp/cm/faults.json` and run `node tools/mutate.mjs /tmp/cm/faults.json --jobs 2 --out /tmp/cm/mutate.md` (default command is the story test, quick). Report the missed ones as test gaps.

## Report
Write `/tmp/cm/review.md` (at most 10 KB): findings as **H / M / L** (each: where, what, why it matters, a fix), **TG** test gaps, the planted faults' tally (caught / missed, which), and one line per new kind of fault for the checklist. Reply with one line: the path and the counts.
