# Bone and Ash — history, part 7

Started 2026-11-07 (v0.11.45), when `history-6.md` reached about 45 KB. Newer than `history-6.md` … `history.md`. Each push moves what is older than the last three versions here from the handover, newest first.

## Moved from the handover in v0.11.54 (word for word)

### From "Decided in chat (2026-11-07)"

- **v0.11.51: Y3 part 2b, the other 14 human pictures (2026-11-08; options after v0.11.50: H1 / H2 for jackals_dead's pose, C1 / C2 for the code art's choker, T1 / T2 for a test sheet; owner 00:09 "go with your picks" = H1 + C1 + T1):**
  - **Picked:** H1 (jackals_dead: she crouches between the dead jackals wiping her hands, smug; mask `y3h_jd`); C1 (the choker out of the code-art human Yuki now: Act 1's code-art scenes draw her); T1 (a test sheet first: dinner, james).
  - **How:** fresh pictures (style **pc**, each key's scene text with the cat line swapped for cast `yuki_human`, side by side, "she is a head shorter than him"; details `tools/art/README.md`); `james` and `jackals_dead` inpaints on the approved pictures; drill redone with old bearded hunters (the first seeds drew long-haired young men, some like women).
  - **The pictures (owner picks 00:29):** dinner s44, james s44, hollow s44, wolves s22, lizard s44, arson s55 (s22 and s44 grew a stray woman), jackals s44, jackals_dead s55 ("the top of the ears are cut off, leave that for a final pass": in the second round), drill (redo) s88, roof s22, herb_slope s22, gao_down s22, village s44 (s55 drew her twice), collectors s44. In most she comes out about James's height, not a head shorter (accepted; none oversized).
  - **After the cold review (owner picks J1 + L1 + the low items' option):** james: the cat's paws left on his shoulder painted out (mask `y3h_james_paws`, owner pick s1); lizard: her black tail repainted white (mask `y3h_lizard_tail`, owner pick s3); the close-up's choker out too (`yukiHumanCloseUp`, never shown while `yuki_human.webp` exists); kept: arson's third thug, jackals_dead without the fire's ashes.
  - **Code:** `js/art/art.js` `YUKI_HUMAN_PICS` all 29 keys (kept as the gate for Act 1 keys that get their human picture after their cat one); `js/art/clamp2.js` the choker and knot out of `yukiHuman` and `yukiHumanCloseUp`; `tools/art/recipes.json` the 14 `<key>_human` recipes and the masks `y3h_jd`, `y3h_james_paws`, `y3h_lizard_tail`.
  - **Checks:** see the version note.
  - **Uploaded by Claude after v0.11.50 (owner, before this chat):** the changed docs ("docs uploaded by Claude").

### From "Version notes"

### v0.11.51 — Y3 part 2b: the other 14 human pictures, the code art's choker out

- **art/pic:** 14 new `<key>_human.webp` (about 1.1 MB). **js/art/art.js** (`YUKI_HUMAN_PICS` all 29), **js/art/clamp2.js** (the choker out of `yukiHuman` and `yukiHumanCloseUp`), **sw.js** (ART fingerprints, VERSION), **tests/data.test.mjs** (every `YUKI_PICS` key in `YUKI_HUMAN_PICS`; the code-art human Yuki's only red is her mouth, the close-up has none; both fail on v0.11.50), **tools/art/recipes.json, README.md; tests/README.md; project/reference.md, roadmap.md, changelog.md, restore-points.md, history-7.md** (v0.11.48 moved).
- **Checks:** the full `bash tools/check.sh` twice (after the picks; after the two fixes and the VERSION bump): exit 0, 0 drifted, 1 log-only move (tribute C6 won 60.2 → 53.6%, n 110, as since v0.11.48); the models unchanged (Careful 2.29 / 3.87, Completionist 2.12 / 2.94); the baseline kept; the palette check 108 pictures, 0 failed. Every recorded prompt (the 14 and the two fixes) checked against what ComfyUI ran (SHA-256 of the prompt text from its history). Cold review on Opus (art): code, files, fingerprints, recipes correct, no id changed, Yuki once in each picture with no stray figures; its findings are in the decisions block (two medium fixed, the close-up's choker fixed, two low kept).

## Moved from the handover in v0.11.53 (word for word)

### From "Decided in chat (2026-11-07)"

- **v0.11.50: Y3 part 2a, the human form (owner 23:01 the session's start; options P1 / P2 / P3; 23:05 "take into account the character pictures picked that are in the game… the hybrid CLAMP/Monogatari style with heavier emphasis on CLAMP"; options D1–D3, S1 / S2; 23:08 "go with your picks" = D1 + S1 + P2; "when all the pictures are done for both acts we can uniformize"):**
  - **Picked:** P2 (two pushes: 2a the 15 scenes with only James and Yuki, 2b the 14 harder ones); S1 (the CLAMP-heavier style **pc** for the human pictures only; their cat and tiger versions keep their style); D1 (the scenes' qipao, and the portrait repainted in it). Each push starts with a test sheet.
  - **The test sheet (forage, camp):** owner 23:19 "s44 looks great for a baseline. the choker can be lost then… reword the description if necessary" (K1: the high collar hid the choker; a low-collar wording and a throat inpaint both failed): cast `yuki_human` without the choker (the story text never mentions it).
  - **The pictures (owner 23:37):** s44 for all 13 others; bone_field: "she is ginormous… rationalize her height and size": painting her out brought in a stray woman, painting her in small cut her off; a new picture with the two side by side, owner pick s66 (23:46). The portrait: "the sleeveless ones' body shape and how she is holding herself look better… use y3h_portrait_s2_d85 and draw long sleeves on it": three inpaints melted the sleeves into the dress; the arms recoloured in code (`tools/art/sleeves.py`); 23:46 "the sleeve fades to white, it should cover the whole arm": the limits widened to the bottom of the frame.
  - **After the cold review (owner 23:56 "F2 and add the second round mentioned in F3 before the final uniformization of the art"; options F1 / F2 / F3):** hunt redone side by side (crouching redos still drew her too big), owner pick s22 (23:59); rain kept ("the rain smudged her mascara"); `sleeves.py` stops on a seed off the arm. **Before the final uniformization pass (the F3 second round):** the tails of mire (thin, black), rats (mostly black) and forest_dawn (a loop not joined to her), and gift (her legs merge with James's; the red piping in a V on the ground), as small inpaints.
  - **Noted for later (23:22–23:29):** the ridge redrawn from the owner's find as the last art pass; one hub format for the whole game; no repeated texts all over the game (Open items).
  - **Code:** `js/art/art.js`: `YUKI_PIC_FORMS` {cat, tiger, human} and `YUKI_HUMAN_PICS` (the 15 keys); `pictureOf` shows `<file>_human` only for those; `tools/art/recipes.json` style `pc`, cast `yuki_human`, the 15 `<key>_human` recipes, the portrait's inpaint and local step, the mask `y3h_portrait_dress`; `tools/art/sleeves.py` (new).
  - **Checks:** see the version note.
  - **Uploaded by Claude after v0.11.49 (owner, before this chat):** handover, roadmap, changelog, restore points, `reference.md`, `history-7.md`.

### From "Version notes"

### v0.11.50 — Y3 part 2a: the human form (15 pictures) and the portrait in the qipao

- **art/pic:** 15 new `<key>_human.webp` (about 1.25 MB); `yuki_human.webp` replaced (the qipao with long sleeves). **js/art/art.js** (`YUKI_PIC_FORMS` with human, `YUKI_HUMAN_PICS`), **sw.js** (ART fingerprints, VERSION), **tests/data.test.mjs** (the v0.11.50 lines: the forms are cat, tiger, human; the 15 keys show `<file>_human` with a recipe that draws her human form and no cat; the other 14 keep code art in human form), **tools/art/recipes.json, sleeves.py (new), README.md; tests/README.md; project/reference.md, roadmap.md, changelog.md, restore-points.md, history-7.md** (v0.11.47 moved).
- **Checks:** the full `bash tools/check.sh`: exit 0, 0 drifted, 1 log-only move (tribute C6 won 60.2 → 53.6%, n 110, as in v0.11.48 and v0.11.49); the models unchanged (Careful 2.29 / 3.87, Completionist 2.12 / 2.94); the baseline kept; the palette check 94 pictures, 0 failed. Every recorded prompt checked against what ComfyUI ran (SHA-256 of the prompt text from its history); the masks and the sleeves step rebuild the files byte for byte. Cold review on Opus (art): the code, files, fingerprints and recipes correct (`pictureOf` for all 29 keys in every form, `yuki_close` and `ridge` unchanged, no id changed; 16 pictures 800×500, 53–103 KB, 0% other colour, gold only in the portrait's eyes); its picture findings: hunt (medium, fixed: redone), rain's streak (kept, owner), the three tails and gift's legs (low, the second round, above); `sleeves.py`'s seed guard (low, fixed); the code art's choker (low, Open items). The full check rerun after the hunt redo and the VERSION bump: exit 0, 0 drifted, the same log-only move, models unchanged.

## Moved from the handover in v0.11.52 (word for word)

### From "Decided in chat (2026-11-07)"

- **v0.11.49: Y3 part 1, the great cat (owner 20:30 "let's do the art now"; options V1 / V2 / V3, H1 / H2 / H3; 20:33 "go with your recommendation, but split the output into two, so the 35 minutes is two sessions" = V3 + H1, as two pushes: the great cat now, human next):**
  - **Asked mid-build and picked:** `james` and `jackals` (multi-step pictures): inpaint Yuki only (20:36); James's look (20:52): "new tigers now, cats later"; James's head (21:52): "original heads now, uniform later" (the head repaints from text came out far from uniform; a ComfyUI restart would not help: it does not learn between runs).
  - **The pictures (owner picks 20:48–21:52):** s44 for forest_dawn, clearing, forage, hunt, camp, gao_down, dinner, collectors, tribulation, lights, rain, crows, rats, gift, herb_slope, drill, wolves; mire s22, hollow s22; stream s66 and bone_field s66 (redos as a real tiger, cast `yuki_tiger2`); arson s88 and jackals s44 (redos with the tiger apart from James; jackals' cord fixed); village and omnitool s44 with the stray women / the floating face inpainted out; roof s44 and omnitool with the face made less catlike, then flatter; lizard s44 with the second James out (s6) and a faint outline out (c2's base); james (arrival): the great cat beside him (s7), ears and cord fixed (s1); jackals_dead: the great cat behind the dead jackals (s7), the fire under her paws lost (s3); ridge (21:52–22:55, after the great cat kept blending into the tree, the owner's tries: the tree pushed far away, then "just show the ridge without Yuki at all", then his own pick of an earlier ridge with the figures painted out, then "its not worth the effort… redraw it" from a photo he found): **a new picture drawn from a description** (a lone dead tree on the ridge above rolling mountains; not traced from the photo, which is someone else's), seed 22; `ridge` left `YUKI_PICS` and shows in every form; no `ridge_tiger`. **After the cold review (owner 22:00 "fix all four first", picks 22:10):** camp s2 (the second tiger out), forage s2 (a real tiger face), wolves s1 (the leash-like cord out), roof s2 (one cord).
  - **Code:** `js/art/art.js`: `YUKI_CAT_ONLY` → `YUKI_PICS` (29 keys: the 30 without `ridge`) + `YUKI_PIC_FORMS` {cat, tiger}; `pictureOf` returns `<file>_<form>.webp` for a drawn form, code art for human. `tools/art/masks.py` draws `ellipses`; `recipes.json` every step, the masks, cast `yuki_tiger`, `yuki_tiger2`, `james_shaggy`.
  - **Checks:** the full check (twice; last after the final ridge): exit 0, 0 drifted, 1 log-only move (tribute C6 won 60.2 → 53.6%, as in v0.11.48); the models unchanged; the baseline kept; after the owner's wilds save landed: the saves test (22 files, 126 passed) and the quick check. Cold review on Opus (art): see the version note.
  - **Uploaded by Claude after v0.11.48 (owner 20:18):** handover, roadmap, changelog, restore points, `history-7.md`.

### From "Version notes"

### v0.11.49 — Y3 part 1: the great-cat pictures

- **art/pic:** 29 new `<key>_tiger.webp` (about 2.2 MB); `ridge.webp` replaced (a new landscape without characters). **js/art/art.js** (the form map), **sw.js** (ART fingerprints, VERSION), **tests/data.test.mjs** (the v0.11.49 block: `YUKI_PICS` is 29 keys and `ridge` shows its one picture in every form; every `YUKI_PICS` key shows `<file>_tiger` in tiger form, has a recipe whose last step draws the great cat; human keeps code art), **tools/art/recipes.json, masks.py, README.md; tests/README.md; project/reference.md, roadmap.md, changelog.md, restore-points.md, history-7.md** (v0.11.46 moved).
- **Checks:** the full `bash tools/check.sh` (results in the decisions block); the cold review on Opus: the code, recipes, files and cache table correct (`pictureOf` for every form and key kind, no `YUKI_CAT_ONLY` left, all 30 recipes complete with their masks and renames, the new files 800×500, 58–100 KB, 0% gold (it read 30 incl. the since-dropped `ridge_tiger`), adding files safe for the offline cache, no save or id change); VERSION not yet bumped when it read (bumped with the docs). **Its picture findings, fixed in this push (owner 22:00, picks 22:10):** camp had a second tiger, forage a house cat, wolves a leash-like cord, roof two cords. **Low, kept:** lights and rats are tiger-ish but catlike in the face; a function-valued `PICTURES` entry added to `YUKI_PICS` would get `_<form>` added twice (none today). The data test checks the prompt text, not the drawn picture: pictures are checked by eye on contact sheets.

## Moved from the handover in v0.11.51 (word for word)

### From "Decided in chat (2026-11-07)"

- **v0.11.48: M1 + G1 (owner 20:18 "M1+G1, upload. I'm home but the art can wait. keep asking if I'm ready for it yet."; the v0.11.47 Fable review's findings 1 and 2, options M1 / M2 and G1):**
  - **M1 (picked):** "Eat with the others." (`rr_hub:1`, Manners) shows at any Fed while `ya_mocked` is unset and it isn't late; "Eat something." stays hidden on `rr_hub` until then (Fed < 85 after). M2 (keep the gate, always offer it on the last Root Road day) not picked.
  - **G1 (picked):** `qiFed` = Fed above `SATIETY_PER_HOUR` × `QI_MINUTES` / 60 (3): at Fed 3 or below the gather card is locked ("too hungry: eat first") and a queued one is skipped.
  - **Checks:** the full check: exit 0, 0 drifted, 1 log-only move (the random bots' tribute C6 won 60.2 → 53.6%, n 110); the models unchanged from v0.11.47 (Careful 2.29 / 3.87, Completionist 2.12 / 2.94); the baseline kept. Cold review on Fable: see the version note.
  - **Uploaded by Claude after v0.11.47 (owner 20:18):** handover, roadmap, changelog, restore points, `history-7.md`.
- **The art (20:18):** the owner is home; the art can wait; ask after this push whether he is ready for it.

### From "Version notes"

### v0.11.48 — M1 + G1: Manners at any Fed, gather Qi above Fed 3

- **js/story/act1_blackroot.js** (M1), **js/core/tasks.js** (G1). **tests/tasks.test.mjs:** the v0.11.47 block's Fed checks (Manners at Fed 99; gather locked at Fed 3, open and giving Qi at 3.5). **project/roadmap.md, changelog.md, restore-points.md, history-7.md** (v0.11.45 moved). **sw.js:** VERSION.
- **Checks:** the full `bash tools/check.sh` (results in the decisions block); the Fable cold review: nothing serious (the Fed > 3 threshold is exact against `advance`: resting doubles regen only, Exhaustion multiplies work only; a queue of three gathers from Fed 7 forecasts and plays 4 / 1 / skip alike; Manners shows once, never with "Eat something."; the bots don't loop on it). **Notes for the owner, low:** after a full supper Manners' line still says "+15 satiety" while Fed caps at 100 (cosmetic); a day-2 arrival on the Root Road after 19:00 still misses Manners before "Push on" (older).

## Moved from the handover in v0.11.50 (word for word)

### From "Decided in chat (2026-11-07)"

- **v0.11.47: N1 (owner 19:39 the Root Road notes with `saves/2026-11-07-1939-incremental-rr_hub.txt`; options after v0.11.46: N1; 19:58 "the midday meal/stop to eat could be consolidated into the "eat something" button. If, and only if it doesn't have a story beat behind it. if it does, it should stay as midday meal and be gated until 14:00"; told: it has one (Manners, `ya_mocks`: Ya mocks Mei Lin's thanks to Heaven; relationships, `ya_grudge`, a GU check, the later "Ya has been staring" talk); 20:01 "Put the Manners scene behind the eat something instead. Rename it something fitting. after the Manners scene is played, it becomes an ordinary eat something again"; 20:03 "go with your recommendations" = "Eat with the others." and T1):**
  - **The meal:** `rr_hub`'s choice 1 (was "Stop for the midday meal.", the same place in the list, so `rr_hub:1` keeps its meaning in saves and queues) is "Eat with the others.": shown while `ya_mocked` is unset, not late, Fed under 85, no food of James's own needed (Ya's millet cakes, +15 in Manners); while it shows, the shared "Eat something." is hidden on `rr_hub` only; once Manners has played, the ordinary card is back. The 14:00 gate (the 19:58 idea) dropped with it.
  - **T1 (picked):** the shared "Train." door on the Blackroot camps (`rr_hub`, `dw_hub`, `ah_hub`) shows only while one of `bl_train`'s drills is left today (`bt_ya`, `bt_yuki`, `bt_needle`, or `bt_dart` once James can sing darts). T2 (the drills as queueable cards like the forest's; a balance change, for the retune) not picked.
  - **From the v0.11.46 Fable review:** `act1_return.js` `toHour`: an evening hour (19:00: `rt_camp`, `rt_evening`) is not jumped to before 06:00; the mornings (6, 8) as before. "Meditate: gather Qi" locked at Fed 0 ("too hungry: eat first"; `qiFed`, so a queued one is skipped there too). A sit short of Qi that would end past 02:00 shows "ends past 02:00".
  - **Checks:** the full check: exit 0, 0 drifted, 3 log-only moves (random bots' tribute: C4 won 43.3 → 37.8%, C6 won 60.2 → 49.1%, C6 paid 26.5 → 33.3%; n about 100–220); models: Careful 2.29 / 3.87 (Yuki off 2.40 / 4.18 → 4.12), Completionist 2.12 / 2.96 → 2.94 (Yuki off 3.53 → 3.52); the baseline kept. Cold review on Fable: see the version note.
  - **Uploaded by Claude after v0.11.46 (owner 19:57):** handover, roadmap, changelog, restore points, `reference.md`, working agreement, `history-7.md`.
- **The art (19:57):** not home yet; ask again after this push.

### Version note

#### v0.11.47 — N1: the Root Road's meal and Train, the return camps' clock, gather Qi at Fed 0

- **js/story/act1_blackroot.js** (the meal, `trainLeft`), **js/story/act1_return.js** (`toHour`), **js/core/tasks.js** (`qiFed`), **js/core/meditate.js** (the Fed lock, the late sit). **tests/tasks.test.mjs:** the v0.11.47 block. **tests/README.md; project/roadmap.md, changelog.md, restore-points.md, history-7.md** (v0.11.44 moved). **sw.js:** VERSION.
- **Checks:** the full `bash tools/check.sh` (results in the decisions block); the Fable cold review: nothing breaks saves, ids or the forecast (`rr_hub:1` is still the Manners door, `g.picked` keeps its meaning, the new label matches no instant-choice rule, `trainLeft` matches `bl_train` exactly, `qi:next` forecast = reality). **Its findings, for the owner (options next):** (1) medium: with the Fed < 85 gate, Manners is hidden all morning on Root Road day 2 after a full supper (Fed 99 at 06:20, the card from about 11:00) and from 10:00 to about 15:00 on day 1 if James arrives fed, so a player can walk off the Road without it, losing its later talk (`ya_fight_start`, Ya +4–6, `ya_respected`); before, it showed at any Fed; (2) low-medium: the gather card's Fed gate should be Fed > 3 (an hour drains 3 and regen needs Fed left at the end): at Fed 0–3 it gives no Qi; (3) low: on `rr_hub` from 19:00 before Manners there is no eating card at all (`bl_camp` still has "Cook and eat."); (4) low: `trainLeft` ignores Qi (at 0 Qi with only darts / needles left, Train opens two locked drills); (5) note, older: a morning `toHour` (6) entered at 00:00–03:59 doesn't move the clock (`a1`, act1_return.js:67).

## Moved from the handover in v0.11.49 (word for word)

### From "Decided in chat (2026-11-07)"

- **v0.11.46: Q1 + X1 + B1 (owner 18:56 / 19:02 the two camp saves; 19:22 "defer the retune and scan the roadmap for other items to consolidate"; options C1 + C2 / C1 / C1 with (b) as a rule; 19:26 "there should be two options then. Meditate to recover Qi manually, and another to condense Qi. There is a design error then. The extraordinary collaterals can be opened UNTIL Nascent soul, not after."; options Q1 / Q2 / Q3, X1 / X2, push A / B; 19:28 "Q1, X1, both together in one push" = Q1 + X1 + push A's `bl_camp` fix and docs tidy-up; 19:42 "B1"):**
  - **Found in the saves:** the Day 1 night camp had 9.3 Qi, a sit costs 10, and since v0.11.17 a card that can't run is hidden; at the Day 3 camp all 8 vessels were open at Foundation and their collaterals opened only from Nascent Soul (the engine's rule in `formulas.js`, copied by the game).
  - **Q1 (picked):** `tasks.js`: `QI_TASK` = `qi:next`, `QI_MINUTES` 60, `qiNotFull`, `qiOpen` (a queue screen and Qi below max), kind `qi` in `cardOf` / `runTask` (`advance(g, 60, { resting: true })`, the line "Meditated an hour: Qi a → b."), `medTaskCards`, `taskLabel`, `isMedTask`, not instant. `meditate.js`: the card "Meditate: gather Qi. (An hour; Qi x / max.)" after Cultivate, locked past 02:00 like the others; Cultivate short of Qi carries `show: true` and the tag "needs 10 Qi (you have x)"; `main.js` shows such a card locked. Q2 (×3 Qi) and Q3 (until full) not picked.
  - **X1 (picked):** `meridians.js`: `canExtraColl` and the `ec` window realm 1–6 with all 8 vessels open (a fork from Rules Engine C, which opens them from Nascent Soul; `formulas.js` unchanged; the owner may fix the engine in Shared-ST); they seal at Nascent Soul (the window shuts; nothing is taken from a save that opened some); `btTarget` sends to `ns_warn` at Soul Embryo when a vessel or a collateral is still closed; `ns_warn` names the vessels first, then the collaterals ("Not yet. Open the collaterals first."); the meridian screen's lines. Junctions stay Nascent Soul+ (X2 not picked).
  - **Push A's rest:** `act1_blackroot.js` `toHour` (bl_camp, heart_view at 19:00, the drowned-wood arrival and the hot spring at 18:00): no jump before 06:00 (dayHour below 6). Docs: the working agreement's forks line, `reference.md` (the files table's dated lines, the gather card and the extra meridians in "Rules as implemented"), the roadmap ("Next up" renamed "Older notes", D2 done); `tools/leftovers-keep.json`: 5 stale entries out (`mer_e8` / `mer_ec` / `mer_jn`, `meridians#0` / `#1`).
  - **Stopped mid-build (rule 2):** the full check failed on coverage ("Call it a day" on `dw_hub` ran but never in the 1 game in 8 that checks forecasts: luck, the bots spend time on the new cards) and 4 numbers drifted past ±20 (random bots, Act 1 C2 dead 99.5 → 76.5%, C3 83.2 → 56.6%, and their beast deaths), measured to come from X1 alone (74.2 / 57.1% with Q1 switched off; the rot ape won 49.9 → 67.2% smart, 50.5 → 70% random). Q1 moves the models: Careful prologue C1 dead 17.6 → 17.6%, Coils 2.21 / 4.09 → 2.29 / 3.87 (Yuki off 2.43 / 5.02 → 2.40 / 4.18); Completionist 46.4 → 36.4%, 2.24 / 3.00 → 2.12 / 2.96 (Yuki off 3.04 / 3.71 → 2.72 / 3.53); with X1 alone the models were unchanged. 21 numbers moved more than 5 (log only), e.g. the random bots' tribute C1 lost 55.2 → 72.9%. Options B1 (accept, baseline, fix the coverage test) / B2 (also a harder rot ape) / B3 (X1 out).
  - **B1 (picked 19:42, the baseline go):** the tasks test checks every card's forecast the first time it runs in a process too (plus 1 game in 8); the bot stats byte-identical to the measured run; `node tools/sanity.mjs --update` (178 numbers). Full check: exit 0, 0 drifted, 0 moved past 5; the models as above; 145 s.
  - **Cold review on Fable (rule 9):** clean in scope; its five findings outside the pick are in the version note.
  - **Uploaded by Claude after v0.11.45 (owner 19:22):** handover, roadmap, changelog, restore points, `reference.md`, working agreement, `history-7.md`.
- **The art (19:22):** not home yet; ask again after this push.

### Version note

#### v0.11.46 — Q1 + X1: gather Qi, the vessels' collaterals before Nascent Soul, the camp clock

- **js/core/tasks.js, js/core/meditate.js, js/main.js** (Q1); **js/story/meridians.js, js/core/game.js** (comment) (X1); **js/story/act1_blackroot.js** (`toHour`). **tests/tasks.test.mjs:** the v0.11.46 blocks (X1 windows at realms 0–9, junctions, `ns_warn`, the camp's card, timed work; Q1 the locked sit, the card on every resting place, an hour at the resting rate, full Qi, past 02:00; `toHour` at 04:30, 05:50, 01:00, 15:00), the v0.11.13 realm-7 check (junctions only), the first-run forecast check. **tools/leftovers-keep.json, tools/baseline.json, tools/timings.json; tests/README.md; project/reference.md, working-agreement.md, roadmap.md, changelog.md, restore-points.md, history-7.md** (v0.11.43 moved). **sw.js:** VERSION.
- **Checks:** the full `bash tools/check.sh` (exit 0 after the baseline); the Fable cold review: nothing serious in the picked scope (the windows, `ns_warn`, forecast = reality for `qi:next` at 20:40 / 01:00 / 01:01 / Exhaustion 1–2 / hubs and resting places, the locked sit's UI and tooltip, the Blackroot `toHour`, the coverage change all verified). **Its findings outside the pick, for the owner (options next):** (1) medium: `act1_return.js:19` has its own `toHour` with the same bug, worse (sets `g.minutes` directly: no hunger or regen for the skipped hours; `rt_camp` / `rt_evening` at 04:30 jump +870 min, after a push at 01:00 +1080 min, erasing the pushed day); (2) low: the gather card has no Fed gate (at Fed 0 it costs HP and gives no Qi, since regen needs Fed > 0; the forecast still shows it); (3) low: a save at Nascent Soul or later with partial `ecWork` keeps those hours unused (the seal text explains it); (4) info: at Soul Embryo the breakthrough can't be queued until all 28 collaterals are open (the warning comes first; intended by X1); (5) cosmetic: a locked sit at 01:30 says "needs 10 Qi" rather than "ends past 02:00".

## Moved from the handover in v0.11.48 (word for word)

### From "Decided in chat (2026-11-07)"

- **v0.11.45: E step 2, D-a (owner 19:08 "upload yourself, not home for the art. procceed to E step 2"; options D-a / D-b / D-c; 19:10 "Go with your recommendation" = D-a):**
  - **Removed:** `game.js`: the `noDice` switch (`setNoDice` / `isNoDice`), `rollCheck`'s dice branch (a check returns `{ skill, value, dc, ratio, success, crit }`, no `die` / `total` / `six` / `fumble`), the dice fight round in `combatStep` (now `finishRound(g, stepNoDice(…))`), `dmgRoll`'s die (the middle of the range), the `noDice` tests in `formDmgBonus`, `guardBonus`, `noDiceUp`, `startCombat` and the 30-round cap, `checkText`'s dice text; `forms.js`: the forms switch (`setFormsActive`, `on()`; forms always apply); `story.js`: the `isNoDice()` branches (the check label, the thin haul, "critical / six / one" wording, "Double haul"); `coil_scenes.js`'s import, `main.js`'s call. **Kept:** `d6()` (the save's seeded random numbers for night events, the far trail, Yuki's lone hunt, the Long Forest's wanderers, the heart's night), the "no-dice" names (`noDiceDc`, `NO_DICE_TUNE`, `setNoDiceTune`, `noDiceUp`, `NO_DICE_ROUND_CAP`, `NO_DICE_DC_SHIFT`, `stepNoDice`, `INC_ONLY_ACTIONS`; D-b's renaming not picked), and `main.js`'s display of 🎲 in log lines (old saves' logs may hold dice lines).
  - **Tests and tools:** every `setNoDice(true)` call gone (tasks, story, models, part, saves tests; `tools/sanity.mjs`, `tools/snap.mjs`); the tasks test's fight keys stay `inc:…` (the baseline keys); its E1 check "with dice there is no raise" gone (one assertion fewer); the rules test checks value ÷ (DC − 2) instead of value + d6.
  - **Proof:** the tasks test (1,000 games), the story test (1,000), the models (300 each of Careful, Completionist, Rusher, Random, plus 100 with Yuki off) and the four part tests wrote byte-identical stats and output before and after. Full check: exit 0, 152 numbers compared, 0 drifted, the same 12 log-only moves as since v0.11.42, the leftover step 0 findings, models unchanged (Careful 2.21 / 4.09, Completionist 2.24 / 3.00); 140 s on this 2-core workspace (99.7 s stored). No Fable review: no logic change, proven by byte-identical stats (as in v0.11.41 and v0.11.23).
  - **Uploaded by Claude after v0.11.44 (owner 19:08):** handover, roadmap, changelog, restore points, `history-6.md`.
- **The art (19:08):** not home yet; ask again after this push.

### Version note

#### v0.11.45 — E step 2: the dice code out

- **js/core/game.js, js/core/forms.js, js/core/story.js, js/story/coil_scenes.js, js/story/nodice_tune.js, js/main.js:** as in the decisions block. **tests/tasks.test.mjs, story.test.mjs, models.test.mjs, part.test.mjs, saves.test.mjs, rules.test.mjs; tools/sanity.mjs, tools/snap.mjs:** no `setNoDice`; the rules test's check. **tests/README.md, project/reference.md, tools/timings.json; project/roadmap.md, changelog.md, restore-points.md, history-7.md** (new: v0.11.42's decisions and note moved). **sw.js:** VERSION.
- **Checks:** the byte-identical stats run and the full `bash tools/check.sh` (results in the decisions block).

## Moved from the handover in v0.11.47 (word for word)

### From "Decided in chat (2026-11-07)"

- **v0.11.44: E step 1, P2 (owner 18:54 "Next: E, step 1, convert the Act 1 part test to Incremental Mode so the dice core can go. Options first"; options P1 / P2 / P3; 18:58 "P2, go"):**
  - **Found before the options:** with dice off and nothing else changed, 6 scenes were unreached (`fo_spy_fled`, `fo_wolf_forced`, `rt_serpent_forced`: checks a GU T1 L7 James never fails; `rt_serpent_lost`; `guardian_won`: the guardian 0%; `ya_romance`: luck, once in 1,000 runs with dice); the walks no longer fall into prologue scenes. The bots' strength at each part's entry (300 games each of Random, Careful, Completionist, v0.11.43; GU / Convergence as tier.level, p10 / p50 / p90): fallout GU 1.8 / 1.9 / 2.4, Conv 1.5 / 1.6 / 1.8, realm 0 / 0 / 1, Yuki fight 4 / 8 / 9; Blackroot GU 1.10 / 2.3 / 2.7, Conv 1.6 / 1.7 / 1.9, realm 0 / 0 / 1, Yuki 2 / 7 / 10; heart GU 2.10 / 3.3 / 3.9, Conv 1.10 / 2.2 / 2.7, realm 1, Yuki 4 / 8 / 10; return GU 3.2 / 3.5 / 3.10, Conv 2.1 / 2.5 / 2.9, realm 1 / 1 / 2, Yuki 3 / 8 / 10. The old fixed James (GU T1 L7, Conv T1 L5, Yuki 3) is far weaker from the Blackroot on.
  - **P2 (picked):** `tests/part.test.mjs` plays Incremental Mode; `BANDS` (the numbers above) give each run low / middle / high strength (3 / 5 / 2 in 10), full HP and Qi (the old fixture kept `newGame`'s bars, 21 of 44 HP once stronger). Test-only runs: 3 in 40 fail their checks on purpose (they take an open check half the time, by a hash of run and step, since `rnd`'s picks run in step with `run % 40`; the check's skill is set to T1 L1 for that one pick, then put back: 2 fail GU checks, 1 Convergence ones too); 1 in 10 arrives hurt (1–20% HP, as before); 1 in 40 hurt with the old fixed James; in the return part 1 in 40 a T1 L1 James who also fails GU checks (the only James who loses the ford serpent: GU T1 L7 at 1% HP still wins it in 2 rounds); not in the heart (a James who can neither win a fight nor pass a check loops on the roots forever); 1 in 40 after the fallout with Ya's affection at 86 (`ya_romance`). The fights' win rates count the bot-like runs only. P1 (fixed James plus 3 groups) and P3 (drop the walks) not picked.
  - **The first numbers (bot-like runs, 1,000 walks a part):** the fallout 100% (palisade wolf, Ya's brawl, the sect watcher); the Blackroot 97–100% (the root wyrm 97%, the bone elk, the drowned, the night serpent, the night drowned 98%); the heart: the root husks 100%, the husks 100%, the guardian 84%; the return: the wolves, the elder, the brawl 100%; the ford serpent is met only through a failed check. A hurt James (1–20% HP) at bot-like strength won every return-part fight (the elder 52 of 52 at 5–8 HP). For E's retune.
  - **Checks (tests and docs only, rule 2):** the four part tests (0 failed each, about 1–2 s) and `bash tools/check.sh quick`. How it touches the rest: only the part test changed; it now needs `setNoDice(true)`, so step 2 can take the dice code out.
- **The art (18:54):** not home yet; ask again after this push.

### Version note

#### v0.11.44 — E step 1: the Act 1 part test in Incremental Mode

- **tests/part.test.mjs:** no dice; `BANDS`; the test-only runs; full bars; the win rates of the bot-like runs. **tests/README.md:** its row and the v0.11.44 line. **project/roadmap.md** (E step 1 done; the two checks after E), **changelog.md, restore-points.md, history-6.md** (v0.11.41's decisions and note moved). **sw.js:** VERSION (no game change).
- **Checks:** the four part tests and `bash tools/check.sh quick` (results in the decisions block).

## Moved from the handover in v0.11.46 (word for word)

### From "Decided in chat (2026-11-07)"

- **v0.11.43: H2, the handover trimmed (owner 18:45 "trim the handover reasonably to keep everything important. there might be times when I cannot upload despite working"; options H1 / H2 / H3; 18:49 "Go with your recommendation, also give me the new rules to paste" = H2):**
  - **Why:** the handover was 72 KB; Claude's project tool reads a file in one go only up to about 25k tokens (about 60 KB), so it could not upload it. Where the size was: the version chain 12.7 KB, decisions older than the last three versions about 15 KB (they should already have moved), the files table, the checks and the rules as implemented about 14 KB.
  - **H2 (picked):** the version line names the current version only; the PRIORITY section, the decisions of v0.11.29–v0.11.40 and their notes, the rebalance plan, the tabled art block, the "Next after…" notes, the 2026-11-06 decisions and the v0.11.40 version note moved word for word to the new `history-6.md` (part 5 is at 40 KB); the files table, "Run every check", the workspace gotchas, "Rules as implemented" and the v0.4.0 balance notes moved word for word to `reference.md` (the dice-era lines marked there); an Open items list keeps everything still open from the moved blocks. The working rules: the handover under about 35 KB, the current version only on the version line (`CLAUDE.md` rule 5, `working-agreement.md`). H1 (keep the files table, about 45 KB) and H3 (only the version line, about 59 KB) not picked.
  - **The project's Instructions field:** the owner pastes `CLAUDE.md` (given in chat at 18:5x) into it; Claude's tools can't edit that field.
  - **Uploaded by Claude after v0.11.42 (owner 18:42):** roadmap, changelog, restore points, working agreement (with "50 samples", committed here), design, `history-5.md` (new in the project), `claude/CLAUDE.md`; the project's copies had stood at v0.11.27. The handover and `reference.md` were sent as files (the handover too big then).

### Version note

#### v0.11.43 — H2, the handover trimmed

- **project/handover.md:** trimmed (the decisions block). **project/history-6.md** (new): the moved blocks, word for word. **project/reference.md:** the files table, the checks, the gotchas, the rules as implemented. **CLAUDE.md** rule 5, **project/working-agreement.md:** the handover rule; "50 samples". **project/roadmap.md, changelog.md, restore-points.md.** **sw.js:** VERSION (no game change).
- **Checks (docs only, rule 2):** `tools/consistency.mjs` (versions, offline files) and `bash tools/check.sh quick`. Nothing outside the docs reads them except the consistency check (the **Version:** line, kept).

## Moved from the handover in v0.11.45 (word for word)

### From "Decided in chat (2026-11-07)"

- **v0.11.42: B1 and rule 8 (owner 18:42 "not home yet, go with B1. you can upload the docs yourself this time. In fact ask every time if you should upload them or I should. make it a hard rule"):**
  - **B1:** `tools/sanity.mjs` `MIN_N` 100 → 50: 152 numbers compared (was 143), 0 drifted; one more log-only move: tribute C6 paid 35.8 → 29.3% (n 95 → 99). `design.md`: Intuitive Aptitude as built (+0.5 a setback, up to +2; the engine's rule K is a first try −2) and the dampening on technique Qi costs only.
  - **Rule 8 (hard rule, owner 18:42):** after every push Claude asks whether it uploads the changed docs to the claude.ai project itself (its project tool, about 35k tokens a push) or sends them as files for the owner (M1). `CLAUDE.md`, `working-agreement.md`. The project's Instructions field needs the new text: the owner pastes `CLAUDE.md` into it (Claude's tools can't edit that field). For this push the owner chose: Claude uploads (v0.11.41's and this push's docs).
  - **Checks (tools and docs only, rule 2):** `tools/sanity.mjs` on the full 1,000-game stats of v0.11.41 (byte-identical to today's game): 0 drifted; `bash tools/check.sh quick`: passed. How it touches the rest: only the drift step reads `MIN_N`; numbers between n 50 and 100 can now fail the check at ±20 (none is near).
- **The art (18:42):** not home yet; ask again after this push.

### Version note

#### v0.11.42 — B1: drift from n 50, design.md, rule 8

- **tools/sanity.mjs:** `MIN_N` 50. **project/design.md:** Intuitive Aptitude and the dampening as built. **CLAUDE.md, project/working-agreement.md:** rule 8 (ask who uploads). **tests/README.md:** n ≥ 50. **sw.js:** VERSION (no game change).
- **Checks:** the sanity check on the full stats: 152 compared, 0 drifted, 12 log-only moves; `check.sh quick` passed (32.8 s).
