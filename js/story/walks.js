/**
 * v0.11.109 (owner pick MW1, after Fable's review of FS1): the walks. Only a story choice marked here is flown from Foundation
 * (js/core/story.js `choose`, `c.walk`): a choice that does nothing but take James somewhere and reads as a walk. Camps, sleep,
 * talk and story beats keep their time, and so does any new choice until it is marked here. Each mark names its scene, the
 * choice's index and the start of its label; `markWalks` throws if a label no longer matches (a reordered or reworded choice),
 * so a mark can't silently move to another choice. The numbers before the pick (200 games each, a scratch copy): Act 1 travel at
 * Foundation+ Careful 1,448 → 1,079 min a game (−25%), Completionist 1,958 → 1,550 (−21%); Act 1 Coils 3.64 / 3.50.
 */
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
    ['lore', 0, "Walk on to her village."],
    ['ridge_alone', 0, "Go down to the village."],
    ['bone_field', 2, "Walk back before the light g"],
    ['mire', 2, "Wade back out while you stil"],
    ['mire_lost', 0, "Limp back to the stream."],
    ['hollow', 2, "Go back. You'll come back he"],
    ['far_hunt', 1, "Back off. Not today."],
    ['far_hunt', 2, "Let them go. Not today."],
    ['far_won', 0, "Back to the village."],
    ['fo_spy_won', 0, "Back down to Ashfall."],
    ['fo_spy_lost', 0, "Limp home."],
    ['fo_spy_fled', 0, "Back down to Ashfall."],
    ['wyrm_won', 0, "Climb down into the Drowned "],
    ['wyrm_lost', 0, "Drag yourself onto the drown"],
    ['dw_drowned_won', 0, "Get them both to dry ground."],
    ['dw_drowned_lost', 0, "Crawl to dry ground."],
    ['hot_spring', 2, "Leave them to it. Go back to"],
    ['ape_won', 0, "Through the pass. Down to th"],
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
    ['log_comfort', 0, "Go back up to the hall. You "],
    ['guardian_approach', 2, "Back away. Not yet."],
    ['guardian_bypass', 0, "Go to the heart. Quietly."],
    ['heart_core_after', 0, "Back up to the hall."],
    ['ht_leave', 0, "Home. To Ashfall."],
    ['rt_start', 0, "Ya's way. One day. Ashfall i"],
    ['rt_road', 2, "Push on toward the birch rid"],
    ['rt_wolves_won', 0, "Down to the river."],
    ['rt_wolves_lost', 0, "Limp down to the river."],
    ['rt_dawn', 0, "Go home."],
    ['rt_brawl_won', 0, "Back to the preparations."],
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

/** Mark the walks on the scenes (once, at load). */
export function markWalks(scenes) {
    for (const [id, i, start] of WALKS) {
        const c = scenes[id]?.choices?.[i];
        if (!c || typeof c.text !== 'string' || !c.text.startsWith(start)) throw new Error(`walks.js: ${id}#${i} is not "${start}…" any more`);
        c.walk = true;
    }
}
