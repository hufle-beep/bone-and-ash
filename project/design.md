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

| | Kept | Reset to the act's first dawn |
|---|---|---|
| Familiarity, Insights, Coil marks, threads | ✓ | |
| Realm, skills, meridians, Saturation | ✓ (v0.9.6: collaterals sealed at Foundation → the rewind unwinds Foundation: Mortal Vessel, Saturation 0) | |
| Yuki (bond, forms, path, relationship) | ✓ | |
| Knowledge flags (what James has learned) | ✓ | |
| Hammerspace items | | ✓ |
| World flags, quests | | ✓ |
| Relationships other than Yuki | | ✓, with a 25% head start from the last Coil's peak |

Targets: the first Coil's deadline fight about 30% win, the third about 80%; a strong player can still finish on one Coil.

## Selene's mechanics, mapped
| Selene | Bone and Ash | Start numbers |
|---|---|---|
| Timed tasks, tap or + to queue | Hub choices become task cards with a bar; the game time a choice takes becomes its length; queue of 30 rows | 1 game hour = 3 s at ×1; ×2 and ×5 unlock per act; the clock stops when nothing runs |
| Energy and death | Fed drains all the time; HP is hit by risky tasks and fights; both at zero = collapse = the Coil ends | Fed −3/h (as now); task HP loss ÷ (1 + 3 × familiarity fraction) |
| Familiarity | Per task: faster, safer, better loot. **Intuitive Aptitude:** a first try is 2 easier | Speed = 1 + 9 × min(1, done ÷ need), up to ×10; Practised ×2, Skilled ×5, Mastered ×10 |
| Jobs | Run in **Yuki's lane**, next to James: hunt, scout, guard camp; later drying racks, herb loft, clinic, the grove | A job runs until its stock is full |
| Permanent unlocks | **Insights** (one-time discoveries) and **Coil marks** (one per arc finished; Fed drains slower) | Insights +5–15% to one thing each; Coil marks −5% drain each, up to −50% |
| Automation | **Parallel Cognition threads** (see below) | up to 9 |
| Drills | Training (darts, blade, footwork, needles, forms): 4 sessions per Coil, each gives familiarity to every task in the arc plus skill XP | 0.2 of a completion each |

**Threads (option 3, picked):** a task at Practised (×2) can be given to a thread, which works it whenever its lane is free. A thread wakes on every rewind **and** on every first finish of an arc (a Coil mark), up to 9. A player who never rewinds has 3 after the prologue and 9 by the end of Act 1; a player who loops gets them sooner. Lore: this world dulled the threads; "a thread holds only what your hands already know"; "each bite of the tail wakes another". Threads never make story choices.

## The screen
The story becomes the stops; tasks fill the days between them. Art plate, ink look and prose panel stay.

- **Header:** Coil N, Day and hour, the deadline ("Tribute in 3 days 4 h"), speed; HP, Fed, Qi/Convergence, Saturation; the Now bar (James) and Yuki's bar; the Outlook line ("Fed runs out Day 5 14:00").
- **Tabs:** Story (scene and choices when a stop is open, otherwise the arc's task cards: jobs, drills, tasks, locked cards with "opens when…"), Queue (finish times, "Fed runs out here", presets, skip, drag), Map (arcs, unreached as "?"), James (the engine status block), Mastery (familiarity, threads), Archive (Insights, Coil marks, "x of y"), Journal (story beats and quests). Saves, Settings and FAQ under ☰.
- **Story stops** pause the clock. Some are timed (the scream on Day 4, night attacks, Shen Qiu), some opened by a task (first bone-field visit, the ship log). Choices show their check, `[GU 2.5 vs DC 4]`. Known stops can be skimmed ("You remember this one").
- **The Coil screen** (Selene's death screen): what this Coil gained, Insights found, threads close to waking, what James remembers, "Same queue again".

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
Rewind returns to Day 8 dawn (`fo_start`), the prologue's outcome fixed.

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
J Yuki's form ladder by realm (cat; lynx at Foundation; panther, tiger, dire, spirit, apex; human at Nascent Soul), each form changing her lane · K Intuitive Aptitude (first try −2 DC) · L breakthrough from 95% Saturation (anything over 100% is lost) · Qi bond flow ((1 + realm bonus)% of the smaller pool per Cycle toward equal fill) · injury and Strain (−5 / −15 / −30 / −50% of Max; the clinic and herbs heal) · Ouroboros daily knockout beat (one free "refuse to fall" per day) · technique dampening on every Qi cost (× max(0.25, 1 − 0.0375 × (tier − 1))) · quest steps paying 120 / 240 / 480 · status block, check labels, deadlines · the Friendship/Attraction ledger (−150 to +150).
**Skipped:** M (XP pool × GU tier) and N (non-GU checks averaged with GU and Yuki). The deliberate game forks stay.
**Lore from the presets:** IASP — the 9 threads as instincts, never a voice. Universal-service gifts as possible Act 2 finds.

## From Selene's infrastructure (all)
Docs set; saves (slots, autosave 15 s, rolling backups, format number, FNV-1a checksum, migrations, recovery screen, broken-number guard, plus a Coil snapshot in every save); export (file, text, export-all, share to `saves/`, reminder); settings (text size, close ✕, pause-when, auto-eat at a Fed threshold, two resets); notices (build label, What's new, Welcome back); fonts embedded; error bar and double-tap guard; checks (one script, old-saves test, softlock test, button-handler check, bots counting Coils per arc); restore points; the Android app (key in the repo); FAQ unlocking with progress. Not copied: section runs (they would skip story stops).

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
- The Long Forest becomes a New Game preset ("Nascent Soul start").
