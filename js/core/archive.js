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
import { ARCS, ARC_AT, REGION_DONE, THREAD_MAX, threadsAwake } from './threads.js';
import { enterHook } from './story.js';
import { MARK_COUNT, MARK_DRAIN, marksHeld, INSIGHT_KIND, INSIGHT_KINDS, INSIGHT_STEP, insightsHeld, fedCut, insightPart, FED_CUT_MAX, ITEM_CAP, BIG_CAP, atSkillCap, SKILL_MAX_TIER, breakAt, fillHook } from './game.js';
import { REMEMBER, KNOW_TEXT } from './coil.js';
import { storyDay, tributeLeft, clockDay, calStart, LONG_CAL } from './calendar.js';
import { coilStamp } from './lines.js'; // v0.11.289 (P57 review, M1-f + M3-s): the scenes shown this Coil

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
    noteRecords(g); // v0.11.289 (P57-A, FT + LH): the feats and limits, on every scene entered (the bots' games too)
}
/** Wire it (prologue.js, after installThreads). */
export function installArchive() { enterHook.archive = archiveAt; fillHook.records = noteRecords; } // v0.11.289 (P57 review, L5): and a load's fill

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
        feats: FEATS.map((f) => ({ name: f.name, got: g.stats?.feats?.[f.k] != null, c: g.stats?.feats?.[f.k] || 0 })), featsOf: FEATS.length,
        mems: memList(g).map((m) => ({ c: Number(m.c) || 0, title: String(m.t || ''), text: String(m.x || ''), what: m.k.map(memLabel).filter(Boolean) })),
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
    // v0.11.289 (P57-A, FT + MM-k)
    feats: (n, of) => `Feats: ${n} of ${of}`,
    featsNote: 'Things done, for the record. They give nothing.',
    onCoil: (c) => (c ? `Coil ${c}` : 'before the record'),
    mems: (n) => `Memories: ${n}`,
    memsNote: 'The moments that counted, as you first read them: a Coil mark, an ending, an Insight. Tap one to read it again.',
    noMems: 'None yet. The next mark, ending or Insight is kept here.',
};

/* ---------- v0.11.289 (owner pick P57-A, 2026-11-28 00:53: DL + FT + MM-k + LH): the deadline line, feats, memories, limits ----------
 * All display and records only (no power): `stats.feats` { key: the Coil it was noted on, 0 = before the record (an old save's fill) },
 * `stats.limits` (the same shape), `stats.mem` [{ k: [keys], c: Coil, t: title, x: text }]. Every rewind keeps `stats` (coil.js), so
 * they are kept for the whole game. A new game starts them empty (game.js newGame); an old save gets feats and limits filled from what
 * it holds at its first check (marked 0), and memories only of the firsts after it was loaded (the earlier words were not kept). */

/** The 12 feats, in the story's order (Claude's words; no power rewards). */
const WON_T = ['fought', 'bluff', 'paid'];
const WON_A = ['a:victory', 'a:accord', 'a:revelation'];
const endsOf = (g) => new Set([...(g.stats?.ends || []), g.flags?.ending && `t:${g.flags.ending}`, g.flags?.a1_outcome && `a:${g.flags.a1_outcome}`].filter(Boolean));
const knownOf = (g) => new Set([...(g.coil?.known || []), ...INSIGHTS.filter((x) => g.flags?.[x.f]).map((x) => x.f)]);
const foesMet = (g) => Object.values(g.stats?.foes || {}).filter((n) => n > 0).length;
export const FEAT_FOES = 20, FEAT_KILLS = 100, FEAT_MEALS = 100;
export const FEATS = [
    { k: 'tribute_c1', name: 'The tribute won on the first Coil', ok: (g) => (g.coil?.n || 1) === 1 && WON_T.includes(g.flags?.ending) },
    { k: 'tribute_3', name: 'The tribute won all three ways', ok: (g) => WON_T.every((w) => endsOf(g).has(`t:${w}`)) },
    { k: 'foundation', name: 'Foundation reached', ok: (g) => (g.james?.realm || 0) >= 1 },
    { k: 'long_forest', name: 'Into the Long Forest', ok: (g) => !!g.flags?.longforest },
    { k: 'act1_won', name: 'Act 1 won', ok: (g) => WON_A.some((k) => endsOf(g).has(k)) || endsOf(g).has(END_WON) },
    { k: 'act1_3', name: 'Act 1 won all three ways', ok: (g) => WON_A.every((k) => endsOf(g).has(k)) },
    { k: 'ends_all', name: 'Every ending seen', ok: (g) => ENDINGS.every((x) => endsOf(g).has(x.k)) },
    { k: 'marks_all', name: 'All nine Coil marks', ok: (g) => marksHeld(g) >= MARK_COUNT },
    { k: 'insights_all', name: 'Every Insight', ok: (g) => INSIGHTS.every((x) => knownOf(g).has(x.f)) },
    { k: 'foes_20', name: 'Twenty kinds of foe met', ok: (g) => foesMet(g) >= FEAT_FOES },
    { k: 'kills_100', name: 'A hundred kills', ok: (g) => (g.stats?.kills || 0) >= FEAT_KILLS },
    { k: 'meals_100', name: 'A hundred meals', ok: (g) => (g.stats?.meals || 0) >= FEAT_MEALS },
];

/** The 7 limits ("limits you have hit"), each with its FAQ line (the numbers from the game's own values). */
const capped = (g, big) => Object.entries(g.inventory || {}).some(([id, n]) => !!BIG_CAP[id] === big && n >= (BIG_CAP[id] || ITEM_CAP));
const fedRaw = (g) => MARK_DRAIN * marksHeld(g) + insightPart(g, 'fed');
const pc = (x) => Math.round(x * 100);
export const LIMITS = [
    { k: 'item', ok: (g) => capped(g, false), line: () => `<b>The hammerspace</b> takes ${ITEM_CAP} of anything; the rest stays behind.` },
    { k: 'stock', ok: (g) => capped(g, true), line: () => `<b>Cores and spirit grass:</b> ${BIG_CAP.beast_core} of each, no more.` },
    { k: 'skill', ok: (g) => !!g.james && (atSkillCap(g.james.gu || {}) || Object.values(g.james.skills || {}).some((n) => atSkillCap(n || {}))), line: () => `<b>A skill</b> stops at T${SKILL_MAX_TIER} L10; XP past it is lost.` },
    { k: 'sat', ok: (g) => (g.james?.saturation || 0) >= 100, line: () => `<b>Saturation</b> stops at 100%; anything more is lost (a breakthrough opens from ${breakAt()}%).` },
    { k: 'threads', ok: (g) => threadsAwake(g) >= THREAD_MAX, line: () => `<b>Threads:</b> ${THREAD_MAX} awake, no more.` },
    { k: 'marks', ok: (g) => marksHeld(g) >= MARK_COUNT, line: () => `<b>Coil marks:</b> ${MARK_COUNT}, so Fed drains at most ${pc(MARK_DRAIN * MARK_COUNT)}% slower from the marks.` },
    { k: 'fed', ok: (g) => pc(fedRaw(g)) > pc(FED_CUT_MAX), line: () => `<b>Fed's drain</b> slows by ${pc(FED_CUT_MAX)}% at most, the marks and the Insights together.` },
];

/** Feats and limits reached now, noted with this Coil (an old save's first check: 0, before the record). */
function noteSet(g, field, list) {
    const old = !g.stats[field] || typeof g.stats[field] !== 'object' || Array.isArray(g.stats[field]);
    const rec = old ? (g.stats[field] = {}) : g.stats[field];
    for (const x of list) {
        if (rec[x.k] != null) continue;
        let ok = false;
        try { ok = !!x.ok(g); } catch { ok = false; }
        if (ok) rec[x.k] = old ? 0 : (g.coil?.n || 1);
    }
}
export function noteRecords(g) {
    if (!g?.stats || typeof g.stats !== 'object') return;
    noteSet(g, 'feats', FEATS);
    noteSet(g, 'limits', LIMITS);
}
/** The limits hit, in the list's order, as FAQ lines. */
export const limitsHit = (g) => LIMITS.filter((x) => g?.stats?.limits?.[x.k] != null).map((x) => x.line());

/** MM-k: the keys of what a memory is kept for: a Coil mark (`m:<arc>`), an ending (`e:<key>`), an Insight (`i:<flag>`). */
export function memKeys(g) {
    const k = new Set();
    const bits = (Number(g?.stats?.marks) || 0) & 511;
    for (let i = 0; i < ARCS.length; i++) if (bits & (1 << i)) k.add(`m:${i}`);
    if (g) for (const e of endsOf(g)) if (ENDINGS.some((x) => x.k === e)) k.add(`e:${e}`);
    if (g) for (const f of knownOf(g)) k.add(`i:${f}`);
    return k;
}
/** The kept memories, a broken entry left out (the review's L7). */
export const memList = (g) => (Array.isArray(g?.stats?.mem) ? g.stats.mem : []).filter((m) => !!m && typeof m === 'object' && Array.isArray(m.k)).map((m) => ({ ...m, k: m.k.filter((k) => typeof k === 'string') }));
/** A memory's label. */
export function memLabel(key) {
    if (typeof key !== 'string') return ''; // the review's L7
    const [t, v] = [key.slice(0, 1), key.slice(2)];
    if (t === 'm') return ARCS[Number(v)] ? `Coil mark: ${ARCS[Number(v)]}` : '';
    if (t === 'e') return ENDINGS.find((x) => x.k === v)?.name || '';
    if (t === 'i') { const x = INSIGHTS.find((y) => y.f === v); return x ? `Insight: ${x.name}` : ''; }
    return '';
}
/** After a tap (main.js `land`): the keys new since `before` get one memory: the screen it moved to (`moved`), else the reply under
 *  the scene (the scene's own text when there is none). Only the screen calls it, so a game played by the bots keeps none. */
export function noteMemory(g, before, { title = '', text = '', reply = [], moved = false } = {}) {
    if (!g?.stats || !(before instanceof Set)) return null;
    const had0 = Array.isArray(g.stats.mem) ? g.stats.mem : null; // an old save: no list; what it reached before is in `before`, so only firsts from now on
    const had = new Set(memList(g).flatMap((m) => m.k));
    const fresh = [...memKeys(g)].filter((k) => !before.has(k) && !had.has(k));
    if (!fresh.length) return null;
    const said = (reply || []).filter(Boolean).join('\n\n');
    // the review's H1 (owner pick RV-A, H1-k): an Insight is found in the reply (most then move on to another screen), so its memory
    // keeps the reply (the screen's text when there is none); a mark's or an ending's keeps the screen it arrives on; a tap with both
    // kinds keeps the reply, then the screen
    const ins = fresh.some((k) => k.startsWith('i:')), other = fresh.some((k) => !k.startsWith('i:'));
    const x = ins && said ? (other && text && text !== said ? `${said}\n\n${text}` : said) : moved || !said ? text || said : said;
    const m = { k: fresh, c: g.coil?.n || 1, t: String(title || ''), x: String(x) };
    (had0 || (g.stats.mem = [])).push(m);
    return m;
}

/** The scenes of the tribute itself: its day, until the ending is set (the review's M1). */
export const TRIBUTE_SCENES = new Set(['tribute', 'bluff_fail', 'bluff_win', 'tribute_paid', 'collectors_won', 'collectors_sent', 'collectors_lost']);
/** Scene `id` shown this Coil (lines.js's per-Coil record of the days each scene showed; read only). */
export const shownThisCoil = (g, id) => !!g?.lines && typeof g.lines === 'object' && g.lines.c === coilStamp(g) && Array.isArray(g.lines.d?.[id]);
/** DL: the deadline and its progress, one line for the status bar (a fight's too); '' where there is none (after it, the Long Forest).
 *  The review's M1 (RV-A, M1-f): the tribute's own scenes read "today"; the short road (no `long`) counts as the game does
 *  (`tributeLeft`: tomorrow) once the village was reached this Coil, "ahead" before. L3: both acts count by the story's day, which
 *  turns at 05:00 (the prologue by the nights slept, Act 1 by `clockDay`), so 00:30 reads "tomorrow" in both. */
export function deadlineLine(g) {
    if (!g?.coil || !g.flags || g.flags.lf_active) return '';
    const act = g.coil.act || 0, d = storyDay(g);
    const when = (left) => (left <= 0 ? 'today' : left === 1 ? 'tomorrow' : `in ${left} days`);
    if (act === 0) {
        if (g.flags.ending) return '';
        const prim = g.james?.primaries ?? 12;
        const p = prim < 12 ? ` · ${prim} of 12 primaries` : '';
        if (d >= 7 || TRIBUTE_SCENES.has(g.scene)) return `Tribute today${p}`;
        if (g.flags.vday) return `Tribute ${when(tributeLeft(g))}${p}`;
        if (g.flags.long) return `Tribute ${3 * LONG_CAL} days after the village${p}`;
        if (shownThisCoil(g, 'village')) return `Tribute ${when(tributeLeft(g))}${p}`;
        return `Tribute ahead${p}`;
    }
    if (act === 1) {
        if (g.flags.a1_outcome) return '';
        return `Shen Qiu ${when(calStart(g, 21) - clockDay(g))} · ${act1Arcs(g)} of 6 arcs`;
    }
    return '';
}
/** Act 1's arcs behind James this Coil (the review's M3, RV-A, M3-s): an arc counts once he has left it, by the scene that ends it
 *  in the game's own marks (threads.js ARC_AT: bl_start, ht_start, rt_start, a1_end), shown this Coil, and the Blackroot's region;
 *  the Return ends with the duel, so Shen Qiu's day reads 5 of 6. */
export function act1Arcs(g) {
    const r = g.flags?.bl_region || '', s = (id) => shownThisCoil(g, id), heart = s('ht_start');
    return [s('bl_start') || !!r, heart || r === 'dw' || r === 'ah', heart || r === 'ah', heart, s('rt_start'), s('a1_end')].filter(Boolean).length;
}
