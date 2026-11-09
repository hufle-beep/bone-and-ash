# Design: Bone and Ash as a hybrid with Selene

Approved 2026-11-05 (owner's picks applied). Nothing here is built yet; the build order is in `roadmap.md`. Every number is a starting point, tuned by simulation, and goes to the owner before it changes.

## The idea
Keep every hand-written scene, and replace the hubs with Selene-style task cards that run on a clock. Each act is a loop with a deadline. If James falls, the Ouroboros Axiom winds him back to the act's first dawn: he keeps what he learned, loses what he gathered.

- **Stays:** the story, the fights, the romance paths, the Rules Engine C numbers, the art.
- **Changes:** hunt, forage, train, cultivate, condense and the village work become timed tasks you queue, repeat, master and later hand to Parallel Cognition threads.
- **Pacing:** Fed is the energy bar, HP the hazard bar; the deadlines are the tribute (Day 7) and Shen Qiu (Day 21).

Pitch: *a cultivator who can't die, only compost and try again, against a world that takes itself far too seriously.*

## The Coil (Selene's lives)
One Coil per act. James never dies (engine canon: at HP 0 the main character is knocked out, captured or rescued); the Axiom composts the failure.

**Lore:** the Ouroboros Axiom is universal among his people; on this world the poisoned Qi turns it into a loop. James and Yuki remember every Coil through the bond; no one else does (James knows Gao Feng's speech by heart; Old Wen gravely explains tribulation for the fourth time).

**A Coil ends on:**
1. **Collapse:** HP 0 outside a story fight, or Fed 0 until HP runs out. (v0.9.7: also a lost fight against a beast; fights against people keep their written branches.)
2. **A lost deadline fight:** the player chooses to accept the written outcome (the paid / lost endings stay) or bite the tail.
3. **Choice:** a "Bite the tail" button, with a confirmation.

**Reset option B (picked):**

> **v0.11.26 (owner 2026-11-07):** a Coil ended in Act 1 (or the end of Act 1, any outcome, through "Go round again…") wakes at the start of Act 1 **or** the start of the whole game (Day 1, a fresh arrival); the prologue wakes at its first dawn only; "same days again" is gone. **One Coil count per save:** crossing into Act 1 continues the Coil, every rewind adds 1, and the Coil bonus follows that count (not "earlier Coils of the act" any more).

| | Kept | Reset to the act's first dawn |
|---|---|---|
| Familiarity, Insights, Coil marks, threads | ✓ | |
| Realm, skills, meridians, Saturation | (until v0.10.4) | ✓ since v0.11.0 (owner 2026-11-06, closer to Selene): they start over, and the Coil bonus ×(1 + 0.5 × earlier Coils of the act; 0.25 since v0.11.29) makes them come back faster |
| Yuki (bond, path, relationship) | ✓ | her realm, skills and forms start over with James's (v0.11.0) |
| Knowledge flags (what James has learned) | ✓ | |
| Hammerspace items | | ✓ |
| World flags, quests | | ✓ |
| Relationships other than Yuki | | ✓, with a 25% head start from the last Coil's peak |

Targets: the first Coil's deadline fight about 30% win, the third about 80%; a strong player can still finish on one Coil.

## Selene's mechanics, mapped
| Selene | Bone and Ash | Start numbers |
|---|---|---|
| Timed tasks, ~~tap or + to queue~~ tap to do (v0.11.64) | Hub choices become task cards; the game time a choice takes becomes its length; ~~queue of 30 rows~~ | ~~1 game hour = 3 s at ×1; ×2 and ×5 unlock per act~~ **v0.11.64 (owner 2026-11-08 02:04, picks 10:58): no timer, no speeds, no queue: every card resolves at once and moves the clock by its time; each card shows its length and the clock it ends; a card that would end the Coil asks for a second tap** |
| Energy and death | Fed drains all the time; HP is hit by risky tasks and fights; both at zero = collapse = the Coil ends | Fed −3/h (as now); task HP loss ÷ (1 + 3 × familiarity fraction) |
| Familiarity | Per task: faster, safer, better loot. **Intuitive Aptitude:** each setback makes the next try 0.5 easier, up to 2 (the engine's rule K says a first try −2; the game's fork since v0.9.2) | Speed = 1 + 9 × min(1, done ÷ need), up to ×10; Practised ×2, Skilled ×5, Mastered ×10 (v0.11.15: smooth between the tiers, need 18; also the sit, meridian work and the breakthrough, each by its own use) |
| Jobs | Run in **Yuki's lane**, next to James: hunt, scout, guard camp; later drying racks, herb loft, clinic, the grove | A job runs until its stock is full |
| Permanent unlocks | **Insights** (one-time discoveries) and **Coil marks** (one per arc finished; Fed drains slower) | Insights +5–15% to one thing each; Coil marks −5% drain each, up to −50% |
| Automation | **Parallel Cognition threads** (see below) | up to 9 |
| Drills | Training (darts, blade, footwork, needles, forms): 4 sessions per Coil, each gives familiarity to every task in the arc plus skill XP | 0.2 of a completion each |

**Threads (option 3, picked):** a task at Practised (×2) can be given to a thread, which works it whenever its lane is free. A thread wakes on every rewind **and** on every first finish of an arc (a Coil mark), up to 9. A player who never rewinds has 3 after the prologue and 9 by the end of Act 1; a player who loops gets them sooner. Lore: this world dulled the threads; "a thread holds only what your hands already know"; "each bite of the tail wakes another". Threads never make story choices.

## The screen
The story becomes the stops; tasks fill the days between them. Art plate, ink look and prose panel stay.

- **Header:** Coil N, Day and hour, the deadline ("Tribute in 3 days 4 h"), ~~speed~~; HP, Fed, Qi/Convergence, Saturation; ~~the Now bar (James) and Yuki's bar; the Outlook line ("Fed runs out Day 5 14:00")~~. *(v0.11.64: the status bar, HP / Convergence / Fed / clock, pinned at the very top of the Story and fight screens; no bars, no outlook: each card shows where it ends; Yuki's lane says how much of James's time is left until her haul.)*
- **Tabs:** Story (scene and choices when a stop is open, otherwise the arc's task cards: jobs, drills, tasks, locked cards with "opens when…"), Queue (finish times, "Fed runs out here", presets, skip, drag), Map (arcs, unreached as "?"), James (the engine status block), Mastery (familiarity, threads), Archive (Insights, Coil marks, "x of y"), Journal (story beats and quests). Saves, Settings and FAQ under ☰.
- **Story stops** pause the clock. Some are timed (the scream on Day 4, night attacks, Shen Qiu), some opened by a task (first bone-field visit, the ship log). Choices show their check, `[GU 2.5 vs DC 4]`. Known stops can be skimmed ("You remember this one").
- **The Coil screen** (Selene's death screen): what this Coil gained, Insights found, threads close to waking, what James remembers, "Same queue again".

## Cultivation by time (v0.11.2, owner 2026-11-06; speed by use since v0.11.15)
In Incremental Mode cultivation is timed work, like Selene's tasks. **Since v0.11.15 (B1-b) every activity speeds up with its own use**, kept across Coils: speed = 1 + 9 × (uses ÷ N), up to ×10 — cards N 18 (the same as the tiers ×2 / ×5 / ×10 at 2 / 8 / 18, smooth in between), the sit N 30, meridian work N 30 (a sitting), the breakthrough N 6. The Coil bonus ×(1 + 0.5 × earlier Coils of the act) now multiplies XP only (James's skills, Yuki's Qi Use and fights); until v0.11.14 it also shortened the times below:
- **Cultivate until the limit (v0.11.64, owner pick C1):** sit after sit, each one tap of the sit card, until Saturation 95%, Qi under 10, a sit that would end past the day's end (02:00; 00:00 since v0.11.91) or leave Fed at 0; the button shows sits, time, Qi and the Saturation reached.
- **Sit:** a 1-hour card ÷ its speed, 10 Qi, Saturation +100 ÷ (10 × 1.5^realm) % (v0.11.66, owner pick S1; × 2^realm before), rounded to 0.1% (Mortal Vessel 10 h, Foundation 15 h, Core 22.5 h… at ×1; sits to 95%: 10, 15, 22, 32, 48, 74, 106, 159 up to Nascent Soul; a sit gains something up to realm 13). Since v0.11.66 (X1) every sit also pays a third of a standard award to Convergence Use and GU, with Yuki's bond share (T1: +5 each). The hollow and the grove count as two sits.
- **Meridians:** hours of work, a sitting doing its minutes × its speed, in sittings of up to 2 h (2 Qi); primaries 2–4 h (36 h for all 12), collateral groups 3–5 h (32 h); no daily limit, no check, no fail; standard XP once per channel; locked below Fed 20. The Extraordinary net too since v0.11.18: vessels 4–11 h, their collaterals 3–6 h, junctions 6–10 h, the challenging XP once per channel. Since v0.11.66 (G4, P1) the vessels and their collaterals open from Golden Core (realm 4) to Soul Embryo, the collaterals in 14 pairs at one collateral's hours each (56 h in all, 114 h before), two challenging awards a pair.
- **Once a day (v0.11.18):** once-a-day things come back after a night slept (waking days), not at midnight. *Push through the night* (a Meditate card on the resting places) gave a new day without sleep at Exhaustion ×1.5, then ×2 on all work; the third push in a row was a collapse. *(v0.11.91, owner pick B: Push through the night and Exhaustion are gone; the waking day ends at 00:00, no bed before 21:00, the night encounters at 01:00, over by 02:00. v0.11.92, pick O1: a fight or a run in the night costs sleep: at dawn only half of the missing HP and Qi come back, James's and Yuki's.)* Yuki's job has its own slower curve (×3 at most).
- **Breakthrough:** a timed card (at once since v0.11.64; no queue) of 2 h × (realm + 1) ÷ its speed (Foundation 2 h … Heavenly Immortal 28 h at ×1), then the tribulation scene.
- Many Coils for a high realm is intended; the Long Forest (+1 realm a season) is the bypass.

## The prologue as a Coil (Days 1–7)
Rewind returns to Day 1 dawn (`arrival`). Every scene stays; the hubs `stream`, `wilds`, `ashfall` become task screens.

| Arc | Days | Story stops | Tasks | Yuki's lane | Drills | Insights | Finale |
|---|---|---|---|---|---|---|---|
| 1 The Clearing | 1 | arrival, yuki_check, scan, first_bone, meditate1 | drink, forage, hunt, condense, cultivate, make camp | hunt alone | first bone | Root memory | the first night |
| 2 The Wilds | 2–3 | random nights | mushroom ring, river cress, honey tree, berries; hare, mire fowl, crab; explore → bone field, mire, hollow | hunt, scout, guard | darts, blade, footwork, needles | Saw the lights, Roots, Bone song, Ghost-gill | the jackals, night 3 |
| 3 Ashfall | 4–6 | the scream, herb_girl, Gao Feng, mei_lin, elder, suppers, night 5, mei_walk, romance | heal, clinic, workshop, palisade, militia, herb slopes, far hunt, scout, communal pot | far hunt, guard the loft | militia drill, Wen's lessons | Realms lore, Tree lore | evening of Day 6 |
| 4 Tribute | 7 | tribute (fight, bluff, hairpin, pay) | — | — | — | — | win → Act 1; lose → accept or rewind |

A second Coil: James wakes in the clearing with full bars and an empty hammerspace; the arrival gets a Coil line ("You have done this before. Yuki has opinions about that."). Familiarity frees days for village work (militia, the boar, scouting), which raises the odds at the tribute.

## Act 1 as a Coil (Days 8–21)
Rewind returns to Day 8 dawn (`fo_start`), the prologue's outcome fixed. **Since v0.11.19** the seven resting places (`fo_ashfall`, `rr_hub`, `dw_hub`, `ah_hub`, `heart_hub`, `rt_camp`, `rt_ashfall`) are task screens like the prologue's: work menus, door cards, chores, Yuki's jobs on the road and in Ashfall.

| Arc | Days | Story stops | Tasks | Yuki's lane | Insights | Finale |
|---|---|---|---|---|---|---|
| 1 Fallout | 8–10 | the Sect's answer, council, Ya arrives, Ya's price | palisade, council work, drill, clinic, Mei Lin's errands | guard, scout | Ya's tracks | the plan, departure |
| 2 Root Road | 11–12 | camp nights, the triangle | travel, forage, hunt, bone-elk | hunt, carry | Wyrm lore | root-wyrm |
| 3 Drowned Wood | 12–13 | hot spring, drowned dead | travel, mire work, smoke meat | guard | Drowned rites | mire serpent |
| 4 Ashen Hills | 14–15 | trio beats, Ya's romance | travel, hawk-watch, ash herbs | scout | Cinder lore | rot-ape |
| 5 The Heart | 16–18 | the ship, Wren Aldous's log | explore the ship, read the log | guard | The founder's crime, Hearth lore | the Guardian |
| 6 Return | 19–20 | planting the seed, the last night | road home, plant and tend the seed | carry | The singing grove | the last night |
| 7 Shen Qiu | 21 | duel, parley, the truth | — | — | — | win → Act 2; lose → accept or rewind |

Act 1 adds **the grove** (a job after planting: spirit grass and Qi regen). Romance across Coils: Mei Lin and Ya forget (25% head start); Yuki remembers everything; after the second Coil James can choose to tell Mei Lin.

## From the SillyTavern engine (all picked)
J Yuki's form ladder by realm (cat; lynx at Foundation; panther, tiger, dire, spirit, apex; human at Nascent Soul), each form changing her lane · K Intuitive Aptitude (the engine: first try −2 DC; the game: +0.5 a setback, up to +2) · L breakthrough from 95% Saturation (anything over 100% is lost) · Qi bond flow ((1 + realm bonus)% of the smaller pool per Cycle toward equal fill) · injury and Strain (−5 / −15 / −30 / −50% of Max; the clinic and herbs heal) · Ouroboros daily knockout beat (one free "refuse to fall" per day) · technique dampening on technique Qi costs only, as canon and the code have it (× max(0.25, 1 − 0.0375 × (tier − 1))) · quest steps paying 120 / 240 / 480 · status block, check labels, deadlines · the Friendship/Attraction ledger (−150 to +150).
**Skipped:** M (XP pool × GU tier) and N (non-GU checks averaged with GU and Yuki). The deliberate game forks stay.
**Lore from the presets:** IASP — the 9 threads as instincts, never a voice. Universal-service gifts as possible Act 2 finds.

## From Selene's infrastructure (all)
Docs set; saves (slots, autosave on every action (the 15 s autosave of a running bar went in v0.11.64), rolling backups, format number, FNV-1a checksum, migrations, recovery screen, broken-number guard, plus a Coil snapshot in every save); export (file, text, export-all, share to `saves/`, reminder); settings (text size, close ✕, pause-when, auto-eat at a Fed threshold, two resets); notices (build label, What's new, Welcome back); fonts embedded; error bar and double-tap guard; checks (one script, old-saves test, softlock test, button-handler check, bots counting Coils per arc); restore points; the Android app (key in the repo); FAQ unlocking with progress. Not copied: section runs (they would skip story stops).

## Clashes and how they're handled
| Selene does | Clash | Bone and Ash does |
|---|---|---|
| Restarts the whole game | Replaying every scene wears thin | The Coil is per act; known scenes can be skimmed |
| Automation and section runs | Choices lose meaning | Threads run tasks only; stops wait for the player; no section runs |
| A crossing needs every action | Branches must stay unvisited | An arc ends at its timed finale; tasks only raise the odds |
| A linear route | The story is a graph of flags | Arcs are fixed; scenes branch inside them as now |
| Death paces everything | Losing Mei Lin's progress hurts | 25% head start; Yuki never forgets; an accepted ending needs no rewind |
| — | Old saves have no tasks or Coil | Migration: Coil 1, familiarity 0, the snapshot = the save as loaded; scene ids never change |

## Lore (owner, 2026-11-05)
- Yuki and James were born together and bonded from birth; her path stays open (familial, or closer once human).
- "Root-kin" means the bonded animal (canon), even though Selene uses Root-Kin for the people.
- Yuki's human look: cat ears, tail, qipao (canon); the black dress is an outfit.
- James is 40 and single (owner's spec, differs from the SillyTavern canon on purpose).
- The Long Forest: ~~a New Game preset~~ (replaced 2026-11-06, v0.10.1): in task mode it opens from the prologue's Coil 2 ("Stay lost" on the arrival or in the clearing); the walkable forest's camp has a queueable "Withdraw for a season" card, +1 realm each, up to Heavenly Immortal. Classic keeps the one-step button.
