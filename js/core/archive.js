/**
 * v0.11.287 (owner pick P55-A, 2026-11-27: CM-5 + IN-13 + AR-t + SV): the Archive. Records and shows what the game keeps for good:
 *  - **the Coil marks** (CM-5): one for each of the 9 arcs (threads.js ARCS) the first time it is finished in the game, from the
 *    game's start, by the same scenes as the threads' arcs (ARC_AT, and REGION_DONE by `bl_region`); `stats.marks` (bits). Each takes
 *    MARK_DRAIN off Fed's drain (game.js fedPerHour).
 *  - **the Insights** (IN-13, no power yet): the 10 of design.md's 14 with a flag, plus the 3 the Coil screen already remembered; kept
 *    in `coil.known` (coil.js endCoil, REMEMBER and KNOW_TEXT), shown with what this Coil has found so far.
 *  - **the endings seen**: `stats.ends` ('t:<flags.ending>', 'a:<flags.a1_outcome>'; 'a:won' from an old save, game.js archiveFill).
 *  - **foes met**: `stats.foes` (game.js meetFoe, kept since v0.11.115), named by FOE_NAMES.
 * Both new fields are optional, kept by every rewind (`stats`); an old save gets them from game.js archiveFill. Display and records
 * only, except the marks' drain.
 */
import { ARCS, ARC_AT, REGION_DONE } from './threads.js';
import { enterHook } from './story.js';
import { MARK_COUNT, MARK_DRAIN, marksHeld, INSIGHT_KIND, INSIGHT_KINDS, INSIGHT_STEP, insightsHeld, fedCut } from './game.js';
import { REMEMBER, KNOW_TEXT } from './coil.js';

/** The Insights, in the story's order: the flag and its name (design.md's names; the last three the Coil screen's own). */
export const INSIGHTS = [
    { f: 'saw_lights', name: 'Saw the lights' },
    { f: 'fungus', name: 'The bracket fungus' },
    { f: 'roots', name: 'Roots' },
    { f: 'bone_sung', name: 'Bone song' },
    { f: 'gills', name: 'Ghost-gill' },
    { f: 'lore1', name: 'The tribute' },
    { f: 'lore_realms', name: 'Realms lore' },
    { f: 'lore_tree', name: 'Tree lore' },
    { f: 'bl_tracker', name: 'Ya\'s tracks' },
    { f: 'told_hearth', name: 'Hearth lore' },
    { f: 'ship_found', name: 'The seed-ship' },
    { f: 'log_heard', name: 'The founder\'s crime' },
    { f: 'grove', name: 'The singing grove' },
];
/** The endings, in the story's order: the tribute's (`flags.ending`) and Act 1's (`flags.a1_outcome`). */
export const ENDINGS = [
    { k: 't:fought', name: 'The tribute: Lu Han beaten' },
    { k: 't:bluff', name: 'The tribute: the bluff' },
    { k: 't:paid', name: 'The tribute: the hairpin' },
    { k: 't:lost', name: 'The tribute: lost' },
    { k: 'a:victory', name: 'Act 1: victory' },
    { k: 'a:accord', name: 'Act 1: the accord' },
    { k: 'a:revelation', name: 'Act 1: the revelation' },
    { k: 'a:taken', name: 'Act 1: taken' },
];
/** An old save's won Act 1 whose ending wasn't kept (archiveFill); shown, not counted among the 8. */
export const END_WON = 'a:won';
/** The fights by id (game.js meetFoe's ids), as the Archive names them. */
export const FOE_NAMES = {
    jackals: 'Ashfang jackals', crows: 'Rot-crows', rats: 'Mire-rats, at night', lizard: 'Thornback lizard', thornback: 'Thornback bull',
    mire: 'Mire-rats', husks: 'Hollow-grubs', boar: 'Ironhide boar', wolves: 'Ash-wolves', palisade_wolf: 'Ash-wolves at the palisade',
    night_wolves: 'Ash-wolves, at night', rt_wolves: 'Ash-wolves on the road home', gao: 'Gao Feng and Pock-Face', collectors: 'Lu Han, at the tribute',
    arson: 'Pock-Face\'s hired thugs', elder: 'Outer Elder Shen Qiu', sect_watcher: 'Sect watcher', ya_brawl: 'Ya, in a brawl', rt_brawl: 'Hunter Bao, in a brawl',
    bone_elk: 'Bone-elk', root_wyrm: 'Root-wyrm', root_husks: 'Root-husks', drowned: 'The drowned', night_drowned: 'The drowned, at night',
    mire_serpent: 'Mire serpent', night_serpent: 'Mire serpent, at night', rt_serpent: 'Mire serpent at the ford', cinder_hawks: 'Cinder hawks',
    night_hawks: 'Cinder hawks, at night', rot_ape: 'Rot-ape', guardian: 'The Gardeners\' Guardian',
    lf_bone_hounds: 'Bone-hounds', lf_ossuary: 'Ossuary Wyrm', lf_mire_brood: 'Mire-brood', lf_bog_mother: 'The Bog-Mother', lf_storm_hawks: 'Storm-hawks',
    lf_thunder_ram: 'Thunder-horn Ram', lf_root_lurkers: 'Root-lurkers', lf_heartless: 'The Heartless', lf_bandits: 'The Tan brothers', lf_rogue: 'Fang Wei',
};
/** A fight's name (a fight not in the table: its id, spaced). */
export const foeName = (id) => FOE_NAMES[id] || String(id).replace(/_/g, ' ');

/** The marks for arcs `ks` (their indexes in ARCS). */
export function noteMarks(g, ks) {
    if (!g?.stats || !ks?.length) return;
    let m = (Number(g.stats.marks) || 0) & 511;
    for (const k of ks) m |= 1 << k;
    g.stats.marks = m;
}
/** The endings the flags show now, added to `stats.ends`. */
export function noteEnds(g) {
    if (!g?.stats || !g.flags) return;
    const e = Array.isArray(g.stats.ends) ? g.stats.ends : (g.stats.ends = []);
    for (const k of [g.flags.ending && `t:${g.flags.ending}`, g.flags.a1_outcome && `a:${g.flags.a1_outcome}`]) if (k && !e.includes(k)) e.push(k);
}
/** A scene entered (story.js `go`, through enterHook.archive; not a rewind's own first scene): an arc's end, a Blackroot region
 *  reached, an ending the flags now show. */
export function archiveAt(g, id) {
    if (ARC_AT[id]) noteMarks(g, ARC_AT[id]);
    if (g.flags?.bl_region) noteMarks(g, REGION_DONE[g.flags.bl_region] || []);
    noteEnds(g);
}
/** Wire it (prologue.js, after installThreads). */
export function installArchive() { enterHook.archive = archiveAt; }

/** The Archive's content (AR-t), plain data for the tab. */
export function archiveView(g) {
    const known = new Set([...(g.coil?.known || []), ...INSIGHTS.filter((x) => g.flags?.[x.f]).map((x) => x.f)]);
    const held = new Set(g.coil?.known || []); // v0.11.288 (P56-A, WH-n): what counts this Coil; a find of this Coil counts from the next
    const insights = INSIGHTS.filter((x) => known.has(x.f)).map((x) => ({ name: x.name, line: REMEMBER[x.f] || KNOW_TEXT[x.f] || '', kind: INSIGHT_KIND[x.f], held: held.has(x.f) }));
    const power = INSIGHT_KINDS.map((kind) => ({ kind, n: insightsHeld(g, kind), pct: Math.round(100 * INSIGHT_STEP * insightsHeld(g, kind)) })).filter((x) => x.n);
    const bits = (Number(g.stats?.marks) || 0) & 511;
    const marks = ARCS.map((name, i) => ({ name, got: !!(bits & (1 << i)) }));
    const seen = new Set(g.stats?.ends || []);
    for (const k of [g.flags?.ending && `t:${g.flags.ending}`, g.flags?.a1_outcome && `a:${g.flags.a1_outcome}`]) if (k) seen.add(k);
    const endings = ENDINGS.filter((x) => seen.has(x.k)).map((x) => x.name);
    const wonOld = seen.has(END_WON) && !['a:victory', 'a:accord', 'a:revelation'].some((k) => seen.has(k));
    const foes = Object.entries(g.stats?.foes || {}).filter(([, n]) => n > 0).map(([id, n]) => ({ name: foeName(id), n })).sort((a, b) => a.name.localeCompare(b.name));
    const marksN = marksHeld(g);
    return {
        insights, insightsOf: INSIGHTS.length, power, step: Math.round(100 * INSIGHT_STEP), fedAll: Math.round(100 * fedCut(g)),
        fedCapped: Math.round(100 * MARK_DRAIN * marksN) + Math.round(100 * INSIGHT_STEP * insightsHeld(g, 'fed')) > Math.round(100 * fedCut(g)), // the review's L2
        marks, held: marksN, marksOf: MARK_COUNT, slower: Math.round(100 * MARK_DRAIN * marksN),
        endings, endingsOf: ENDINGS.length, wonOld,
        foes,
    };
}
/** The tab's words (UI; Claude's plain words). */
export const ARCHIVE_TEXT = {
    lede: 'What James keeps from every Coil, whatever the rewind takes.',
    insights: (n, of) => `Insights: ${n} of ${of}`,
    noInsights: 'Nothing yet that he would call an insight.',
    // v0.11.288 (P56-A, UI-p): what each Insight gives, and what counts this Coil
    kind: { blow: 'a foe\'s blow', sit: 'Saturation a sit', fed: 'Fed\'s drain', xp: 'skill XP (Yuki\'s share too)' }, // the review's L1: her bond share comes from the same pool
    sign: { blow: '−', sit: '+', fed: '−', xp: '+' },
    gives: (kind, pct) => `${ARCHIVE_TEXT.sign[kind]}${pct}% ${ARCHIVE_TEXT.kind[kind]}`,
    next: 'counts from the next Coil',
    // the review's L2: the total only with marks held too, the cap only when reached; one rule line, not two
    power: (parts, fedAll, marks = 0, capped = false) => (parts.length ? `This Coil: ${parts.map((x) => ARCHIVE_TEXT.gives(x.kind, x.pct)).join(', ')}.${parts.some((x) => x.kind === 'fed') && marks ? ` With the Coil marks, Fed drains ${fedAll}% slower${capped ? ' (50% at most)' : ''}.` : ''}` : 'None counts yet: each Insight counts from the Coil after the one that found it, and those of a kind add up.'),
    powerNote: 'Each Insight counts from the Coil after it is found; those of a kind add up.',
    marks: (n, of, pct) => `Coil marks: ${n} of ${of}${n ? ` · −${pct}% Fed's drain` : ''}`, // the review's L2: one "Fed drains" total, in the Insights' line
    marksNote: 'One for each part of the story the first time it is finished, in any Coil.',
    got: 'finished', // PG: a word, not a check mark (the fonts test: every character in Literata or the phone's list)
    foes: (n) => `Foes met: ${n}`,
    noFoes: 'Nothing has tried to eat him yet.',
    times: (n) => `×${n}`,
    endings: (n, of) => `Endings seen: ${n} of ${of}`,
    noEndings: 'None yet.',
    wonOld: 'Act 1 won (from an older save; which ending was not kept).',
};
