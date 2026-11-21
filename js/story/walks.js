/**
 * v0.11.109 (owner pick MW1, after Fable's review of FS1): the walks. Only a story choice marked here is flown from Foundation
 * (js/core/story.js `choose`, `c.walk`): a choice that does nothing but take James somewhere and reads as a walk. Camps, sleep,
 * talk and story beats keep their time, and so does any new choice until it is marked here. Each mark names its scene, the
 * choice's index and the start of its label; `markWalks` throws if a label no longer matches (a reordered or reworded choice),
 * so a mark can't silently move to another choice. The numbers before the pick (200 games each, a scratch copy): Act 1 travel at
 * Foundation+ Careful 1,448 → 1,079 min a game (−25%), Completionist 1,958 → 1,550 (−21%); Act 1 Coils 3.64 / 3.50.
 * v0.11.195 (owner pick F1, a; the FW read's B): `lore` [0] "Walk on to her village." is no longer marked: Mei Lin walks down
 * beside him and can't fly, so it keeps its 40 min at every realm (flown it was 20 min at Foundation, 13 at realm 2).
 * v0.11.197 (owner pick C1): a walk with Mei Lin or Ya along is flown only when they are carried (game.js `partyCarry`); a mark
 * ending in 'alone' is a walk that leaves them behind, flown as James's own (`hot_spring` [2]). `lore` [0] stays unmarked: she
 * met him within the hour (both meters at 30 or more at `lore`: 0 of 93 flying takes, measured).
 * RV1 (the Opus review): M1 `rt_brawl_won` [0] 'alone' too (Ashfall after the Return: the party flags stay set, Mei Lin isn't
 * there); M2 'quiet' on the three walks that follow a hard scene (`dw_drowned_won` the rescue, `ape_won` the spear-head,
 * `log_comfort` the grief night): their line comes from the calm ones only (story.js `QUIET_LINE`).
 * v0.11.198 (owner pick RV1, M2): `ht_leave` [0] 'quiet' too (the walk out of the Heart; `rt_start` opens on "Mei Lin is pale and silent").
 */
import { canFly } from '../core/game.js';

export const WALKS = [
    ['clearing', 2, "Follow the sound of water."],
    ['first_bone', 0, "Follow the water."],
    ['first_bone_fail', 0, "Follow the water."],
    ['meditate1', 1, "Enough. Water, food, shelter"],
    ['stream', 5, "Keep walking downstream unti"],
    ['hunt', 2, "Leave it. Glass armour sound"],
    ['hunt_miss', 1, "Back to the stream."],
    ['hunt_got', 0, "Back to the stream."],
    ['dawn', 0, "Run straight toward it."],
    ['dawn', 2, "Not your world, not your fig"],
    ['ridge_alone', 0, "Go down to the village."],
    ['bone_field', 2, "Walk back before the light g"],
    ['mire', 2, "Wade back out while you stil"],
    ['mire_lost', 0, "Limp back to the stream."],
    ['hollow', 2, "Go back. You'll come back he"],
    ['far_hunt', 1, "Back off. Not today."],
    ['far_hunt', 2, "Let them go. Not today."],
    ['far_won', 0, "Leave the hunters to it."], // v0.11.247 RV-A (T L5): the label reworded, the same walk
    ['fo_spy_won', 0, "Back down to Ashfall."],
    ['fo_spy_lost', 0, "Limp home."],
    ['fo_spy_fled', 0, "Back down to Ashfall."],
    ['wyrm_won', 0, "Climb down into the Drowned "],
    ['wyrm_lost', 0, "Drag yourself onto the drown"],
    ['dw_drowned_won', 0, "Get them both to dry ground.", 'quiet'],
    ['dw_drowned_lost', 0, "Crawl to dry ground."],
    ['hot_spring', 2, "Leave them to it. Go back to", 'alone'],
    ['ape_won', 0, "Through the pass. Down to th", 'quiet'],
    ['ape_lost', 0, "Get up. The tree is waiting."],
    ['bl_morning', 0, "Get moving."],
    ['bl_morning', 1, "Get moving."],
    ['bl_morning', 2, "Climb out of the water into "],
    ['bl_morning', 3, "Get moving."],
    ['heart_gate', 2, "Go in."],
    ['ring_lost', 0, "Back to the hall."],
    ['roots_won', 0, "Go on."],
    ['roots_lost', 0, "Back to the hall. Lick your "],
    ['ship_wreck', 1, "Go straight in. Find the bri"],
    ['log_comfort', 0, "Go back up to the hall. You ", 'quiet'],
    ['guardian_approach', 2, "Back away. Not yet."],
    ['guardian_bypass', 0, "Go to the heart. Quietly."],
    ['heart_core_after', 0, "Back up to the hall."],
    ['ht_leave', 0, "Home. To Ashfall.", 'quiet'], // v0.11.198 (RV1 M2): out of the Heart after its hard beats; "Mei Lin is pale and silent" follows
    ['rt_start', 0, "Ya's way. One day. Ashfall i"],
    ['rt_road', 2, "Push on toward the birch rid"],
    ['rt_wolves_won', 0, "Down to the river."],
    ['rt_wolves_lost', 0, "Limp down to the river."],
    ['rt_dawn', 0, "Go home."],
    ['rt_brawl_won', 0, "Back to the preparations.", 'alone'],
    ['lf_tree_view', 0, "Climb down."],
    ['lf_bone_depths', 2, "Back to camp."],
    ['lf_black_mire', 2, "Back to camp."],
    ['lf_thunder_ridge', 3, "Back to camp."],
    ['lf_old_roots', 2, "Back to camp."],
    ['lf_wanderers', 2, "Walk the other way. Not ever"],
    ['lf_human_talked', 0, "Back to camp."],
    ['lf_human_won', 0, "Back to camp."],
    ['lf_trials', 0, "The Bone Field depths."],
    ['lf_trials', 1, "The Black Mire."],
    ['lf_trials', 2, "The Thunder Ridge."],
    ['lf_trials', 3, "The Old Roots."],
    ['yk_camp', 0, "Back to the fire before it g"],
];

/** v0.11.195 (owner pick F1, k): the label shown from Foundation, where a walk's own label says walk or run (Fable's, rule 10). */
export const FLY_LABELS = {
    'stream#5': 'Keep going downstream until dark.',
    'dawn#0': 'Go straight toward it.',
    'bone_field#2': 'Head back before the light goes.',
    'mire_lost#0': 'Drip your way back to the stream.', // D1 (the merged text push, a1; Fable's): the text above it leaves by air
};

/** Mark the walks on the scenes (once, at load); a walk with a label in FLY_LABELS shows it from Foundation. */
export function markWalks(scenes) {
    for (const [id, i, start, alone] of WALKS) { // `alone`: the fourth field, 'alone' or 'quiet'
        const c = scenes[id]?.choices?.[i];
        if (!c || typeof c.text !== 'string' || !c.text.startsWith(start)) throw new Error(`walks.js: ${id}#${i} is not "${start}…" any more`);
        c.walk = true;
        if (alone === 'alone') c.walkAlone = true;
        if (alone === 'quiet') c.walkQuiet = true;
        const fly = FLY_LABELS[`${id}#${i}`];
        if (fly) { const t = c.text; c.text = (g) => (canFly(g) ? fly : t); }
    }
}
