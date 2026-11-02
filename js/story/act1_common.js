/**
 * ACT 1 — "The Hearth Tree" (Days 8–21). Shared bible, helpers and the contract between the four part files.
 *
 * Parts and their entry / exit scenes (each part file exports its scenes; prologue.js merges them):
 *   Part 1  Fallout          js/story/act1_fallout.js   entry 'fo_start'  (Day 8 06:00)  → exits to 'bl_start' (Day 11 ~06:00)
 *   Part 2  Into the Blackroot js/story/act1_blackroot.js entry 'bl_start' (Day 11)       → exits to 'ht_start' (Day 16 ~06:00)
 *   Part 3  The Heart        js/story/act1_heart.js     entry 'ht_start'  (Day 16)       → exits to 'rt_start' (Day 19 ~06:00)
 *   Part 4  Return           js/story/act1_return.js    entry 'rt_start'  (Day 19)       → ends at 'a1_end' (end: true, Day 21)
 *
 * Cast
 *   James (40, deadpan, sarcastic), Yuki (root-kin cat, deadpan through the bond).
 *   Mei Lin (26): herb-gatherer, looser than the local norm, sharp tongue; it gets her in trouble. Always on the expedition.
 *   Ya (27): the feral huntress of the deep Blackroot, raised wild; more unfit for civilised society than James. Jokes and
 *     flirts aggressively, easily offended, picks fights, open to sharing. The tracks circling James's forest camp were hers.
 *     Second romance option. If James is drawn to both women, Ya wears down Mei Lin's resistance over the act → a throuple.
 *   Old Wen (90), Mei Lin's mother, the Ashfall hunters, Lu Han, Gao Feng (per prologue flags), the Crimson Lotus Sect.
 *   Outer Elder Shen Qiu of the Crimson Lotus: arrives at Ashfall on Day 21. The act's climax.
 * Tone: James and Yuki deadpan. Locals grave, formal, humourless about honour, face, hierarchy, Heaven and the Sect.
 *   Mei Lin and Ya are the exceptions. Romance is frank and sensual up to the door, then fades to black. Adults only.
 * Lore: the dead tree at the forest's heart is a Hearth Tree grown around a crashed seed-ship of James's people, about
 *   a thousand years ago. While it lived it sang and filtered the world's Qi. The Crimson Lotus's founder killed it to
 *   harvest its heart; since then the Qi has been poisoned. The ship still holds a seed-sliver that can grow again.
 */
import { clockParts, bumpRel, sleepUntil } from '../core/game.js';
import { forestScale, villageScale, grow, day, hour } from './common.js';

export { day, hour };

/** Day number within Act 1 (Day 8 = 1). */
export const a1Day = (g) => clockParts(g.minutes).day - 7;

/** Training-days scale for Act 1 fights: the prologue's days plus one step per two Act 1 days. Tuned by simulation. */
export const a1Scale = () => 0; // Act 1 fights are tuned in absolute numbers by full-game simulation (no growth on top).

/** Allies who fight beside James in the story (Mei Lin with a knife, Ya with a spear): they wear the first enemy down. */
export function allies(g) {
    let n = 0;
    if (g.flags.mei_party) n += 1;
    if (g.flags.ya_party) n += 1;
    return n;
}

/**
 * An encounter for the combat engine. tier: 'small' | 'region' | 'boss' | 'climax' — sets XP band and how strongly the
 * enemies grow with a1Scale. Allies in the party shave HP off the first enemy.
 */
export function encounter(g, { id, intro, enemies, win, lose, flee = null, tier = 'small' }) {
    const s = a1Scale(g);
    const growth = { small: { hp: 0.12, dc: 0.4, atk: 0.5 }, region: { hp: 0.12, dc: 0.4, atk: 0.5 }, boss: { hp: 0.1, dc: 0.35, atk: 0.45 }, climax: { hp: 0.08, dc: 0.35, atk: 0.45 } }[tier];
    const band = { small: 'standard', region: 'challenging', boss: 'major', climax: 'major' }[tier];
    const list = enemies.map((e) => grow(e, s, growth));
    const a = allies(g);
    if (a && list[0]) list[0] = { ...list[0], hp: Math.max(3, list[0].hp - 2 * a) };
    return { id, intro, band, enemies: list, win, lose, flee };
}

/** Romance helpers. */
export const rel = (g, who) => g.rel[who] || { f: 0, a: 0 };
export const likesMei = (g) => !!g.flags.romance || rel(g, 'Mei Lin').a >= 15;
export const likesYa = (g) => !!g.flags.ya_romance || rel(g, 'Ya').a >= 15;
/** The throuple track: 0 none … 4 together. Advances only when James is drawn to both. */
export const trio = (g) => g.flags.trio || 0;
export function trioStep(g, to) { if (likesMei(g) && likesYa(g) && trio(g) < to) g.flags.trio = to; return []; }
export { bumpRel, sleepUntil };

/** Act 1 items (merged into ITEMS). */
export const ACT1_ITEMS = {
    seed_sliver: { name: 'Seed-sliver', note: 'A splinter of living heartwood from the seed-ship. It hums against your palm like a second pulse.' },
    ship_shard: { name: 'Hull-shard', note: 'Grown wood, harder than steel, a thousand years old and still faintly warm.' },
    elk_antler: { name: 'Bone-elk antler', note: 'Your Convergence likes it. A lot.' },
    wyrm_scale: { name: 'Root-wyrm scale', note: 'Barklike, overlapping. Ya says it makes good armour. Ya says many things.' },
    ya_tooth: { name: 'Ya\'s wolf tooth', note: 'She bit it off the wolf herself. She gave it to you. You are choosing not to ask what that means.' },
    palisade_stake: { name: 'Bone stakes (bundle)', note: 'For Ashfall\'s palisade.' },
    hearth_log: { name: 'Hearth-log (memory seed)', note: 'The ship\'s record, grown into a knot of wood. It plays when you hold it.' },
    smoked_meat: { name: 'Smoked meat', note: 'Ya\'s. Do not ask what animal.' },
};

/**
 * Art keys available to the story (the art helper implements every one). Existing: village, dinner, roof, village_night,
 * herb_slope, workshop, drill, elder, healer, mei_lin, yuki_close, camp, forest_night, forest_dawn, stream, hunt, forage,
 * jackals, boar, crows, rats, lizard, wolves, ridge, tribulation, collectors, hollow, mire, bone_field.
 * New for Act 1: ashfall_dawn, envoy, palisade, council, ya_arrives, ya_close, ya_fight, root_road, root_camp,
 * drowned_wood, drowned_camp, ashen_hills, ashen_camp, trio_fire, hot_spring, night_watch, bone_elk, root_wyrm,
 * drowned_dead, mire_serpent, rot_ape, cinder_hawks, heart_gate, heart_hall, heart_roots, ship_wreck, ship_bridge,
 * ship_log, guardian, seed, heart_core, return_road, seed_planting, grove_sprout, elder_arrives, elder_duel,
 * elder_parley, a1_end, trio.
 */
export const ACT1_ART = ['ashfall_dawn', 'envoy', 'palisade', 'council', 'ya_arrives', 'ya_close', 'ya_fight', 'root_road', 'root_camp', 'drowned_wood', 'drowned_camp', 'ashen_hills', 'ashen_camp', 'trio_fire', 'hot_spring', 'night_watch', 'bone_elk', 'root_wyrm', 'drowned_dead', 'mire_serpent', 'rot_ape', 'cinder_hawks', 'heart_gate', 'heart_hall', 'heart_roots', 'ship_wreck', 'ship_bridge', 'ship_log', 'guardian', 'seed', 'heart_core', 'return_road', 'seed_planting', 'grove_sprout', 'elder_arrives', 'elder_duel', 'elder_parley', 'a1_end', 'trio'];
