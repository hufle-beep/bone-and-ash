/**
 * The extra meridians (v0.8.0). Windows:
 *   Extraordinary 8  — Golden Core (realm 4; v0.11.66, owner pick G4; Foundation, realm 1, before) to Soul Embryo (realm 6).
 *     Closes for good at Nascent Soul (realm 7).
 *   Their collaterals (28) — v0.11.46 (owner 19:26, pick X1; a deliberate fork from Rules Engine C, whose formulas.js opens
 *     them from Nascent Soul): after all 8 Extraordinary are open, Golden Core to Soul Embryo; closes for good at Nascent Soul.
 *     v0.11.66 (owner pick P1): opened in pairs, one collateral's hours per pair (56 h in all), two challenging awards per pair.
 *   Junctions (10) — Nascent Soul+ (as the engine).
 * Each attempt: 2 Qi, 1 hour, a Convergence Use check (DC climbs per meridian opened); a success pays challenging XP.
 * One opening per group per day (fails can retry). Effect: Qi regen % per Cycle (+0.5 / +0.1 / +0.3 — game.js extraRegen).
 * Yuki opens the same ones through the bond.
 * Menu: 'meridians' (choice "Open a meridian." on every hub that has the breakthrough choice). Warning before the
 * Nascent Soul breakthrough if the Extraordinary 8 or their collaterals aren't all open: 'ns_warn' (the collaterals since v0.11.46).
 */
import { extraRegen, qiRegenPct, advance, awardXp, actSpeed, actUse } from '../core/game.js';

/* ---------- the primaries and their collaterals (v0.9.6: closed at the start of a task-mode game) ----------
 * 12 primaries in the classical order; their 66 collaterals in 8 groups, each group opening once its primaries are open.
 * Opened by timed work (v0.11.2, below; Story Mode's checked sessions are gone since v0.11.41). Engine windows: both are Mortal Vessel only. Foundation needs all 12
 * primaries (game.js breakBlock); collaterals still closed then are sealed (game.js breakthrough), and only a rewind
 * undoes it, by unwinding the breakthrough (coil.js rewind). Yuki's counts mirror James's through the bond. */
export const PRIMARIES = [
    { name: 'the Lung meridian', line: 'It opens on an inhale, and for the first time since the crossing the air here tastes merely bad instead of hostile.' },
    { name: 'the Large Intestine meridian', line: 'Index finger to the side of the nose. Not a glamorous channel. It works anyway, which puts it ahead of most of your committees.' },
    { name: 'the Stomach meridian', line: 'Face to foot, the long way. Your stomach growls, approvingly or in protest. Hard to tell. Same as always.' },
    { name: 'the Spleen meridian', line: 'Big toe up to the ribs. It turns food into something useful, which out here is a skill worth having twice.' },
    { name: 'the Heart meridian', line: 'Armpit to little finger. It opens quietly, and your pulse settles half a beat slower, like a man sitting down.' },
    { name: 'the Small Intestine meridian', line: 'Little finger to the ear. It sorts the clean from the foul. The Axiom files a note of thanks.' },
    { name: 'the Bladder meridian', line: 'Sixty-seven points, eye to little toe, all down the back. It takes the full two hours and every one of them is an opinion.' },
    { name: 'the Kidney meridian', line: 'The sole of the foot to the chest. The root of things, your teachers called it. It feels like standing on bedrock.' },
    { name: 'the Pericardium meridian', line: 'The heart\'s bodyguard. It opens with the air of something that has been on duty the whole time and would like that noted.' },
    { name: 'the Triple Burner meridian', line: 'Ring finger to the brow. Three furnaces, one channel. The warmth comes back to your hands like a pilot light catching.' },
    { name: 'the Gallbladder meridian', line: 'It zigzags across the skull like a man who lost the map. Decisiveness, the old texts say. You decide you like it.' },
    { name: 'the Liver meridian', line: 'The last of twelve. Big toe to the ribs, and when it opens the whole circuit closes with a sound only you and Yuki hear. Foundation can come now. Something in you knows it.' },
];
/** The 66 collaterals in 8 groups: size, and how many primaries must be open first. */
export const COL_GROUPS = [
    { name: 'the Lung and Large Intestine collaterals', size: 9, need: 2 },
    { name: 'the Stomach collaterals', size: 9, need: 3 },
    { name: 'the Spleen and Heart collaterals', size: 8, need: 5 },
    { name: 'the Small Intestine collaterals', size: 8, need: 6 },
    { name: 'the Bladder and Kidney collaterals', size: 8, need: 8 },
    { name: 'the Pericardium collaterals', size: 8, need: 9 },
    { name: 'the Triple Burner and Gallbladder collaterals', size: 8, need: 11 },
    { name: 'the Liver collaterals', size: 8, need: 12 },
];
export const SESSION_MINUTES = 120;
const P = (g) => g.james.primaries ?? 12;
const fmtH = (h) => `${Math.round(h * 10) / 10} h`;
const C = (g) => g.james.collaterals ?? 66;
/** How many collateral groups are open (counts from old saves that aren't on a group boundary round down). */
export const colGroupsOpen = (g) => { let n = 0, sum = 0; for (const gr of COL_GROUPS) { sum += gr.size; if (C(g) >= sum) n++; else break; } return n; };
/**
 * Timed meridians (v0.11.2, Incremental Mode): each channel is hours of work at ×1 (÷ the Coil bonus until v0.11.15), in sittings of up
 * to 2 h (2 Qi each; since v0.11.15 a sitting does its minutes × its speed by use), any number a day, no check, no failing. Primary k: 2 … 4 h (36 h for all 12); collateral group j:
 * 3 … 5 h (32 h for all 8). Work is kept in `james.merWork` (primaries) and `james.colWork` (groups), hours at ×1, until
 * the channel opens; standard XP once per channel opened; the cards lock below Fed 20.
 */
/** The work cards lock below this Fed (v0.11.2 pick 2a): the meridian screen has no forecast. */
export const MER_FED_MIN = 20;
export const priHours = (k) => Math.round((2 + (2 * k) / 11) * 100) / 100;
export const colHours = (j) => Math.round((3 + (2 * j) / 7) * 100) / 100;
const KEY = { pri: 'merWork', col: 'colWork', e8: 'e8Work', ec: 'ecWork', jn: 'jnWork' };
const work = (g, k) => g.james[KEY[k]] || 0;
/** v0.11.18 (owner pick b): the Extraordinary lines are timed work too (Incremental Mode), no check, no daily limit: vessel k 4 … 11 h, their collaterals 3 … 6 h, junctions 6 … 10 h. */
export const e8Hours = (k) => 4 + k;
export const ecHours = (k) => 3 + Math.floor(k / 9);
export const jnHours = (k) => 6 + Math.floor(k / 2);
/** v0.11.66 (P1): the vessels' collaterals open two at a time (one alone only for an odd count left by an older save), for the first one's hours. */
export const ecStep = (c) => Math.max(0, Math.min(2, 28 - c));
/** "the Governing crown thread and the Governing nape thread" from collateral `c`. */
export const ecPairName = (c) => (ecStep(c) === 2 ? `${EXTRA_COLL[c]} and ${EXTRA_COLL[c + 1]}` : EXTRA_COLL[c]);
const ecCount = (c) => (ecStep(c) === 2 ? `${c + 1} and ${c + 2}/28` : `${c + 1}/28`);
const need = (g, k) => (k === 'pri' ? priHours(P(g)) : k === 'col' ? colHours(colGroupsOpen(g)) : k === 'e8' ? e8Hours(m(g).e) : k === 'ec' ? ecHours(m(g).c) : jnHours(m(g).j));
const nameOf = (g, k) => (k === 'pri' ? PRIMARIES[P(g)]?.name : k === 'col' ? COL_GROUPS[colGroupsOpen(g)]?.name : k === 'e8' ? EXTRA8[m(g).e]?.name : k === 'ec' ? ecPairName(m(g).c) : JUNCTIONS[m(g).j]?.name);
const countOf = (g, k) => (k === 'pri' ? `${P(g) + 1}/12` : k === 'col' ? `group ${colGroupsOpen(g) + 1}/8` : k === 'e8' ? `${m(g).e + 1}/8` : k === 'ec' ? ecCount(m(g).c) : `${m(g).j + 1}/10`);
export const merMinutesOf = (g, k) => Math.max(10, Math.min(SESSION_MINUTES, Math.ceil(((need(g, k) - work(g, k)) * 60) / actSpeed(g, 'mer') / 10) * 10)); // v0.11.15: ÷ its speed by use
function workChoice(k) {
    const can = (g) => (k === 'pri' ? canPrimary(g) : k === 'col' ? canColGroup(g) : k === 'e8' ? canExtra8(g) : k === 'ec' ? canExtraColl(g) : canJunction(g));
    return {
        text: (g) => `Work on ${nameOf(g, k)}. (${countOf(g, k)}; ${fmtH(work(g, k))} of ${fmtH(need(g, k))} done; ${merMinutesOf(g, k)} min.)`,
        show: can, qi: 2, time: 0, work: true, merLine: k, minutes: (g) => merMinutesOf(g, k),
        req: (g) => (g.james.satiety >= MER_FED_MIN ? true : 'Too hungry to sit. Eat first.'),
        do: (g) => {
            const mins = merMinutesOf(g, k);
            advance(g, mins, { work: true });
            g.james[KEY[k]] = Math.round((work(g, k) + (mins / 60) * actSpeed(g, 'mer')) * 100) / 100; actUse(g, 'mer');
            if (work(g, k) + 1e-9 < need(g, k)) return [`Two Qi and ${mins} minutes into the ash around ${nameOf(g, k)}. It gives a little. (${fmtH(work(g, k))} of ${fmtH(need(g, k))}.)`];
            g.james[KEY[k]] = 0;
            if (k === 'e8' || k === 'ec' || k === 'jn') { // v0.11.18: the Extraordinary lines, timed; their old challenging XP once per channel
                const xx = awardXp(g, 'Convergence Use', 'challenging');
                if (k === 'e8') { const v = EXTRA8[m(g).e]; g.james.extra8 = m(g).e + 1; return [`Opened ${v.name} (${g.james.extra8}/8). ${v.line}`, ...after(g), ...xx]; }
                if (k === 'ec') { // v0.11.66 (P1): a pair, and the XP of each collateral in it
                    const c = m(g).c, step = ecStep(c), n = ecPairName(c);
                    for (let i = 1; i < step; i++) xx.push(...awardXp(g, 'Convergence Use', 'challenging'));
                    g.james.extraCollaterals = c + step;
                    return [`Opened ${n} (${g.james.extraCollaterals}/28). ${step === 2 ? 'Two fine, bright threads, no thicker than a hair, side by side.' : 'A fine, bright thread, no thicker than a hair.'}`, ...after(g), ...xx];
                }
                const v = JUNCTIONS[m(g).j]; g.james.junctions = m(g).j + 1; return [`Opened ${v.name} (${g.james.junctions}/10). ${v.line}`, ...after(g), ...xx];
            }
            const xp = awardXp(g, 'Convergence Use', 'standard'); // once per channel opened (v0.11.2 pick 1a)
            if (k === 'pri') { const v = PRIMARIES[P(g)]; g.james.primaries = P(g) + 1; mirror(g); return [`Opened ${v.name} (${g.james.primaries}/12). ${v.line}`, 'Qi Max +1.25 (Yuki +1).', ...xp]; }
            const gr = COL_GROUPS[colGroupsOpen(g)]; g.james.collaterals = COL_GROUPS.slice(0, colGroupsOpen(g) + 1).reduce((a, x) => a + x.size, 0); mirror(g);
            return [`Opened ${gr.name} (${g.james.collaterals}/66). Fine threads, lighting up one after another like a city at dusk.`, ...after(g), ...xp];
        },
        to: 'meridians',
    };
}
const mirror = (g) => { g.yuki.primaries = P(g); g.yuki.collaterals = C(g); };
export const canPrimary = (g) => (g.james.realm || 0) === 0 && P(g) < 12;
export const canColGroup = (g) => { const k = colGroupsOpen(g); return (g.james.realm || 0) === 0 && k < COL_GROUPS.length && P(g) >= COL_GROUPS[k].need; };
const baseRegen = (g) => qiRegenPct(g, C(g));

export const EXTRA8 = [
    { name: 'the Governing Vessel', line: 'It runs up the spine and over the crown like a cable being pulled taut. Every vertebra reports in. You have, apparently, been slouching for forty years.' },
    { name: 'the Conception Vessel', line: 'Down the front of the body, chin to pelvis, and it opens with a warmth that is frankly too intimate for a medical procedure. Yuki looks away, politely.' },
    { name: 'the Thrusting Vessel', line: 'The deep one, through the core of you. It goes in like a well being drilled and comes up like a spring. Your heartbeat shifts key.' },
    { name: 'the Girdle Vessel', line: 'The only one that runs sideways, a belt of Qi around the waist. It closes like a buckle. You stand straighter without deciding to.' },
    { name: 'the Yin Linking Vessel', line: 'It ties the yin channels together like someone finally labelling the cables behind a server rack. Very quiet. Very satisfying.' },
    { name: 'the Yang Linking Vessel', line: 'The outer net. It knits the yang channels into one weave, and for a moment you feel every inch of skin at once. Including the ones under the lab coat.' },
    { name: 'the Yin Heel Vessel', line: 'From the inner ankle up to the eyes. When it opens, you close your eyes and still know exactly where your feet are. Sleep, your body informs you, will be better now.' },
    { name: 'the Yang Heel Vessel', line: 'Outer ankle to the eyes. It opens on a step and the step lands lighter. Yuki, watching, decides that you are now permitted to chase her.' },
];
/** Collaterals of the Extraordinary 8: 28, grouped by vessel. */
export const EXTRA_COLL = [
    ['Governing', ['crown thread', 'nape thread', 'spine-ladder thread', 'tail thread']],
    ['Conception', ['throat thread', 'heart-hall thread', 'navel thread', 'sea-of-Qi thread']],
    ['Thrusting', ['blood-sea thread', 'kidney thread', 'chest-gate thread', 'root thread']],
    ['Girdle', ['left hip thread', 'right hip thread', 'buckle thread']],
    ['Yin Linking', ['inner calf thread', 'heart thread', 'tongue thread']],
    ['Yang Linking', ['shoulder thread', 'temple thread', 'outer knee thread', 'nape-wind thread']],
    ['Yin Heel', ['inner ankle thread', 'groin thread', 'eye-light thread']],
    ['Yang Heel', ['outer ankle thread', 'flank thread', 'eye-corner thread']],
].flatMap(([v, ts]) => ts.map((t) => `the ${v} ${t}`));
export const JUNCTIONS = [
    { name: 'the Crown Junction', line: 'Where every yang channel meets at the top of the skull. It opens like a skylight.' },
    { name: 'the Brow Junction', line: 'Between the eyes. Parallel Cognition notices it first and files nine reports about it.' },
    { name: 'the Throat Junction', line: 'Your voice drops half a tone and stays there. Yuki says nothing, which means she likes it.' },
    { name: 'the Heart-Hall Junction', line: 'Behind the sternum. It opens, and for a second you miss your mother so much it hurts. Then the Qi runs on.' },
    { name: 'the Solar Junction', line: 'Under the ribs, where the Thrusting and the Girdle cross. It hums like a well-made machine.' },
    { name: 'the Sea-of-Qi Junction', line: 'Below the navel. The dantian everyone here worships, you have been using as a storage room. Now it has better shelving.' },
    { name: 'the Gate of Life Junction', line: 'In the small of the back. Your Ouroboros Axiom sighs and loosens its grip, like a man taking off his tie.' },
    { name: 'the Twin Palm Junctions', line: 'Both palms at once. The next dart you sing comes out of your hand already warm.' },
    { name: 'the Twin Sole Junctions', line: 'Both soles. You can feel the forest\'s roots through the ground now, faintly, like conversation in another room.' },
    { name: 'the Bridge Junction', line: 'The last one, where the Extraordinary net closes on itself. Everything connects. The Qi stops flowing through you and starts flowing as you.' },
];

const m = (g) => ({ e: g.james.extra8 || 0, c: g.james.extraCollaterals || 0, j: g.james.junctions || 0 });
const R = (g) => g.james.realm || 0;
/** v0.11.66 (owner pick G4): the Extraordinary vessels and their collaterals open from Golden Core (Foundation before); still sealed at Nascent Soul. */
export const EXTRA_FROM = 4;
export const canExtra8 = (g) => R(g) >= EXTRA_FROM && R(g) <= 6 && m(g).e < 8;
export const canExtraColl = (g) => R(g) >= EXTRA_FROM && R(g) <= 6 && m(g).e >= 8 && m(g).c < 28; // v0.11.46 (X1): before Nascent Soul
export const canJunction = (g) => R(g) >= 7 && m(g).j < 10;

/**
 * v0.11.13 (E1, Incremental Mode): each meridian line is its own Meditate card (queueable on the task screens), in this
 * order. `window` = the line is in reach at this realm (the card shows); `wait` = why it can't run yet though it shows
 * (the collateral group's primaries, one opening a day for the Extraordinary lines), '' if nothing. The work itself is the
 * line's choice on the meridian screen (`merLine` field), which Story Mode keeps as a screen.
 */
export const MER_LINES = ['pri', 'col', 'e8', 'ec', 'jn'];
const LINE_WINDOW = {
    pri: (g) => R(g) === 0 && P(g) < 12,
    col: (g) => R(g) === 0 && colGroupsOpen(g) < COL_GROUPS.length,
    e8: canExtra8,
    ec: canExtraColl, // v0.11.46 (X1): before Nascent Soul, after the 8 vessels; v0.11.66 (G4): from Golden Core
    jn: (g) => R(g) >= 7 && m(g).j < 10,
};
export const lineWindow = (g, line) => !!LINE_WINDOW[line]?.(g);
export function lineWait(g, line) {
    if (line === 'col') { const gr = COL_GROUPS[colGroupsOpen(g)]; if (gr && P(g) < gr.need) return `opens with ${gr.need} primaries open`; }
    return '';
}
/** The line's choice index on the meridian screen. */
export const lineIndex = (scenes, line) => (scenes.meridians?.choices || []).findIndex((c) => c.merLine === line);
/** The card's label when its choice is hidden (waiting): the next channel of the line. */
export function lineName(g, line) {
    if (line === 'pri') return `Work on ${PRIMARIES[P(g)]?.name}.`;
    if (line === 'col') return `Work on ${COL_GROUPS[colGroupsOpen(g)]?.name}.`;
    if (line === 'e8') return `Open ${EXTRA8[m(g).e]?.name}.`;
    if (line === 'ec') return `Open ${ecPairName(m(g).c)}.`;
    return `Open ${JUNCTIONS[m(g).j]?.name}.`;
}

/** v0.11.41 (D2-a): a Story Mode choice's place, kept so later choices keep their index; never shown. */
const STORY_GONE = { text: 'Story Mode only (removed in v0.11.41).', show: () => false, to: 'meridians' };

const after = (g) => [`Qi regen now ${baseRegen(g).toFixed(1)}% of Max per Cycle (Yuki's too, through the bond).`];

export const MERIDIANS = {
    meridians: {
        id: 'meridians', title: 'The Extraordinary Net', art: 'yuki_close', place: (g) => g.location,
        text: (g) => {
            const x = m(g);
            const parts = [];
            if (P(g) >= 12 && C(g) >= 66) parts.push(`You sit, close your eyes, and let Parallel Cognition draw the map. Twelve primaries, sixty-six collaterals: lit, all of them. Around and between them, the second net. ${x.e}/8 Extraordinary vessels, ${x.c}/28 of their collaterals, ${x.j}/10 junctions open.`);
            else {
                parts.push(`You sit, close your eyes, and let Parallel Cognition draw the map. It is mostly grey. The crossing ashed your channels shut, and this world's Qi settled in the ash like soot in a chimney. ${P(g)}/12 primaries open, ${C(g)}/66 collaterals (${colGroupsOpen(g)}/8 groups). The Axiom composts the seal one channel at a time: sittings of two hours and two Qi, as many as you can stand, until the channel gives. ${P(g) < 12 ? `${nameOf(g, 'pri')}: ${fmtH(work(g, 'pri'))} of ${fmtH(need(g, 'pri'))} done.` : ''}`);
                if (g.james.satiety < MER_FED_MIN) parts.push('Your stomach files a formal complaint. Too hungry to sit. Eat first.');
                if (P(g) < 12) parts.push(`Foundation won't hold on an open circuit. All twelve primaries first. ${12 - P(g)} to go.`);
                if (g.james.colSealed) parts.push(`${66 - C(g)} collaterals sealed when you broke through to Foundation: scar tissue, now, and Mortal Vessel was their only window. Only the Coil can give that window back, and it will take the breakthrough with it.`);
                else if ((g.james.realm || 0) === 0 && C(g) < 66) parts.push('The collaterals open only while you are Mortal Vessel. Break through with any of them closed and they seal.');
                if ((g.james.realm || 0) >= 1 || x.e || x.c || x.j) parts.push(`The second net: ${x.e}/8 Extraordinary vessels, ${x.c}/28 of their collaterals, ${x.j}/10 junctions.`);
            }
            if (R(g) < EXTRA_FROM && x.e < 8) parts.push(x.e ? `${8 - x.e} of the Extraordinary vessels are still sealed, like doors painted on a wall. Your people open them at Golden Core. Not before.` : 'The Extraordinary vessels are there, but sealed, like doors painted on a wall. Your people open them at Golden Core. Not before.');
            if (R(g) < EXTRA_FROM && x.e >= 8 && x.c < 28) parts.push(`All eight vessels open. Their twenty-eight collaterals wait for Golden Core: ${28 - x.c} still closed.`); // v0.11.66 (G4): an older save that opened them early
            else if (R(g) >= EXTRA_FROM && R(g) <= 6 && x.e < 8) parts.push(`They open between Golden Core and Soul Embryo, and only then: at Nascent Soul the window shuts for good. ${8 - x.e} still closed.`);
            if (R(g) >= 7 && x.e < 8) parts.push('The vessels you didn\'t open in time are scar tissue now, and their collaterals with them. You knew the rule. You were busy.');
            if (R(g) >= EXTRA_FROM && R(g) <= 6 && x.e >= 8 && x.c < 28) parts.push(`With all eight vessels open, their collaterals are within reach: twenty-eight fine threads, ${28 - x.c} still closed. They open in pairs. The same window: at Nascent Soul it shuts on them for good.`);
            if (R(g) >= 7 && x.e >= 8 && x.c < 28) parts.push(`${28 - x.c} of the vessels' collaterals sealed at Nascent Soul. Scar tissue, fine as hair. You knew the rule. You were busy.`);
            parts.push('Yuki curls against your hip. Whatever you open, she opens too; the bond doesn\'t do things by halves.');
            return parts.join('\n\n');
        },
        choices: [
            workChoice('pri'),
            workChoice('col'),
            workChoice('e8'),
            workChoice('ec'),
            workChoice('jn'),
            STORY_GONE, // v0.11.41 (D2-a): Story Mode's checked sessions (primaries, collateral groups, the Extraordinary vessels,
            STORY_GONE, // their collaterals, the junctions; the flags mer_e8 / mer_ec / mer_jn) are gone; the five places stay
            STORY_GONE, // so every later choice keeps its index (task card ids are scene:index in saves)
            STORY_GONE,
            STORY_GONE,
            { text: 'Open your eyes.', to: (g) => g.flags.mer_return || 'stream' },
        ],
    },
    ns_warn: {
        id: 'ns_warn', title: 'Before Nascent Soul', art: 'tribulation', place: (g) => g.location,
        text: (g) => `Saturation sits at the brim. One more step and you're Nascent Soul.

Parallel Cognition raises a hand, the way it does when it has read the fine print. *${m(g).e < 8 ? `${8 - m(g).e} of the eight Extraordinary vessels are still closed. They open between Golden Core and Soul Embryo. Break through now, and they seal for good, and their twenty-eight collaterals with them.` : `${28 - m(g).c} of the vessels' twenty-eight collaterals are still closed. They open only before Nascent Soul. Break through now, and they seal for good.`}*

Yuki looks at you. *Your call,* says the bond. *I'd open them. But I'm a cat. I'd also eat the curtains.*`,
        choices: [
            { text: (g) => (m(g).e < 8 ? 'Not yet. Open the vessels first.' : 'Not yet. Open the collaterals first.'), to: (g) => g.flags.bt_return || 'stream' },
            { text: 'Break through anyway. Let them seal.', to: 'breakthrough' },
        ],
    },
};

/** Foundation with collaterals still closed (v0.9.6): they seal. Shown before the breakthrough. */
MERIDIANS.col_warn = {
    id: 'col_warn', title: 'Before Foundation', art: 'tribulation', place: (g) => g.location,
    text: (g) => `Saturation sits at the brim, and all twelve primaries are open. Foundation is one breath away.

Parallel Cognition raises a hand. *${66 - C(g)} of the sixty-six collaterals are still closed. They open only in Mortal Vessel. Break through now and they seal: Qi regen stays at ${baseRegen(g).toFixed(1)}% per Cycle instead of ${(baseRegen(g) + 0.1 * (66 - C(g))).toFixed(1)}%, for good.*

*Footnote,* it adds. *The Coil can undo it. A rewind would unwind the breakthrough itself: back to Mortal Vessel, every realm since gone, Saturation at zero. That is not a discount. That is the full price.*

Yuki looks at you. *Finish the threads,* says the bond. *Then show off.*`,
    choices: [
        { text: 'Not yet. Open the collaterals first.', to: (g) => g.flags.bt_return || 'stream' },
        { text: 'Break through anyway. Let them seal.', to: 'breakthrough' },
    ],
};
/** Where a breakthrough starts: a warning first if it would seal something (collaterals at Foundation, the Extraordinary 8 at Nascent Soul). */
export const btTarget = (g) => (g.james.realm === 0 && C(g) < 66 ? 'col_warn' : g.james.realm === 6 && ((g.james.extra8 || 0) < 8 || (g.james.extraCollaterals || 0) < 28) ? 'ns_warn' : 'breakthrough'); // v0.11.46 (X1): the collaterals too

/** The James page row. */
export const meridianRow = (g) => { const x = m(g); return `Primaries ${P(g)}/12 · collaterals ${C(g)}/66 (${colGroupsOpen(g)}/8 groups${g.james.colSealed ? ', the rest sealed: a rewind unwinds Foundation to reopen them' : ''}) · Extraordinary ${x.e}/8 · their collaterals ${x.c}/28 · junctions ${x.j}/10 · Qi regen ${baseRegen(g).toFixed(1)}%/Cycle`; };
