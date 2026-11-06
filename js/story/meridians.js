/**
 * The extra meridians (v0.8.0). Rules Engine C windows:
 *   Extraordinary 8  — Foundation (realm 1) to Soul Embryo (realm 6). Closes for good at Nascent Soul (realm 7).
 *   Their collaterals (28) — Nascent Soul+, only after all 8 Extraordinary are open.
 *   Junctions (10) — Nascent Soul+.
 * Each attempt: 2 Qi, 1 hour, a Convergence Use check (DC climbs per meridian opened); a success pays challenging XP.
 * One opening per group per day (fails can retry). Effect: Qi regen % per Cycle (+0.5 / +0.1 / +0.3 — game.js extraRegen).
 * Yuki opens the same ones through the bond.
 * Menu: 'meridians' (choice "Open a meridian." on every hub that has the breakthrough choice). Warning before the
 * Nascent Soul breakthrough if the Extraordinary 8 aren't all open: 'ns_warn'.
 */
import { extraRegen, qiRegenPct, clockParts, coilMult } from '../core/game.js';
import { daily, markDaily } from './common.js';

/* ---------- the primaries and their collaterals (v0.9.6: closed at the start of a task-mode game) ----------
 * 12 primaries, one session each, in the classical order; their 66 collaterals in 8 groups, each group opening once its
 * primaries are open. A session: 2 Qi (engine), 2 hours, Convergence Use vs DC (primaries 2.5 → 4.0, groups 3 → 4.75),
 * at most 2 sessions a day (any mix), standard XP (owner 2026-11-06: challenging made the tribute too easy). A fail spends the Qi and the time, pays 25% XP and gives +0.5 to the next try
 * (Intuitive Aptitude, up to +2, gone on a success). Engine windows: both are Mortal Vessel only. Foundation needs all 12
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
export const SESSIONS_PER_DAY = 2;
export const SESSION_MINUTES = 120;
export const MER_ADAPT_STEP = 0.5;
export const MER_ADAPT_MAX = 2;
const P = (g) => g.james.primaries ?? 12;
const C = (g) => g.james.collaterals ?? 66;
/** How many collateral groups are open (counts from old saves that aren't on a group boundary round down). */
export const colGroupsOpen = (g) => { let n = 0, sum = 0; for (const gr of COL_GROUPS) { sum += gr.size; if (C(g) >= sum) n++; else break; } return n; };
const sessionKey = (g) => `mer_s@${clockParts(g.minutes).day}`;
export const sessionsToday = (g) => g.flags[sessionKey(g)] || 0;
const sessionOk = (g) => sessionsToday(g) < SESSIONS_PER_DAY;
const useSession = (g) => { g.flags[sessionKey(g)] = sessionsToday(g) + 1; };
const mirror = (g) => { g.yuki.primaries = P(g); g.yuki.collaterals = C(g); };
export const canPrimary = (g) => (g.james.realm || 0) === 0 && P(g) < 12 && sessionOk(g);
export const canColGroup = (g) => { const k = colGroupsOpen(g); return (g.james.realm || 0) === 0 && k < COL_GROUPS.length && P(g) >= COL_GROUPS[k].need && sessionOk(g); };
export const dcPrimary = (g) => Math.round(((2.5 + (1.5 * P(g)) / 11) / coilMult(g)) * 10) / 10; // 2.5 … 4.0, ÷ the Coil bonus (v0.11.0)
export const dcColGroup = (g) => Math.round(((3 + 0.25 * colGroupsOpen(g)) / coilMult(g)) * 10) / 10; // 3 … 4.75, ÷ the Coil bonus (v0.11.0)
const adaptOf = (g, k) => (g.tasks?.adapt?.[k]) || 0;
const setAdapt = (g, k, v) => { if (!g.tasks) return; g.tasks.adapt = g.tasks.adapt || {}; if (v) g.tasks.adapt[k] = v; else delete g.tasks.adapt[k]; };
const learn = (g, k) => { const a = Math.min(MER_ADAPT_MAX, adaptOf(g, k) + MER_ADAPT_STEP); setAdapt(g, k, a); return `You see what went wrong. (+${a} on the next try.)`; };
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
export const canExtra8 = (g) => R(g) >= 1 && R(g) <= 6 && m(g).e < 8 && daily('mer_e8')(g);
export const canExtraColl = (g) => R(g) >= 7 && m(g).e >= 8 && m(g).c < 28 && daily('mer_ec')(g);
export const canJunction = (g) => R(g) >= 7 && m(g).j < 10 && daily('mer_jn')(g);
export const canAnyMeridian = (g) => canPrimary(g) || canColGroup(g) || canExtra8(g) || canExtraColl(g) || canJunction(g);

const dcE = (g) => 4 + m(g).e; // 4 … 11
const dcC = (g) => 6 + Math.floor(m(g).c / 4); // 6 … 12
const dcJ = (g) => 8 + Math.floor(m(g).j / 2); // 8 … 12

const after = (g) => [`Qi regen now ${baseRegen(g).toFixed(1)}% of Max per Cycle (Yuki's too, through the bond).`];

export const MERIDIANS = {
    meridians: {
        id: 'meridians', title: 'The Extraordinary Net', art: 'yuki_close', place: (g) => g.location,
        text: (g) => {
            const x = m(g);
            const parts = [];
            if (P(g) >= 12 && C(g) >= 66) parts.push(`You sit, close your eyes, and let Parallel Cognition draw the map. Twelve primaries, sixty-six collaterals: lit, all of them. Around and between them, the second net. ${x.e}/8 Extraordinary vessels, ${x.c}/28 of their collaterals, ${x.j}/10 junctions open.`);
            else {
                parts.push(`You sit, close your eyes, and let Parallel Cognition draw the map. It is mostly grey. The crossing ashed your channels shut, and this world's Qi settled in the ash like soot in a chimney. ${P(g)}/12 primaries open, ${C(g)}/66 collaterals (${colGroupsOpen(g)}/8 groups). The Axiom composts the seal one channel at a time: two hours, two Qi, and your full attention. Twice a day is all the body will stand.`);
                if (sessionsToday(g) >= SESSIONS_PER_DAY) parts.push('You have done two today. The channels are raw. Tomorrow.');
                if (P(g) < 12) parts.push(`Foundation won't hold on an open circuit. All twelve primaries first. ${12 - P(g)} to go.`);
                if (g.james.colSealed) parts.push(`${66 - C(g)} collaterals sealed when you broke through to Foundation: scar tissue, now, and Mortal Vessel was their only window. Only the Coil can give that window back, and it will take the breakthrough with it.`);
                else if ((g.james.realm || 0) === 0 && C(g) < 66) parts.push('The collaterals open only while you are Mortal Vessel. Break through with any of them closed and they seal.');
                if ((g.james.realm || 0) >= 1 || x.e || x.c || x.j) parts.push(`The second net: ${x.e}/8 Extraordinary vessels, ${x.c}/28 of their collaterals, ${x.j}/10 junctions.`);
            }
            if (R(g) === 0) parts.push('The Extraordinary vessels are there, but sealed, like doors painted on a wall. Your people open them after Foundation. Not before.');
            else if (R(g) <= 6 && x.e < 8) parts.push(`They open between Foundation and Soul Embryo, and only then: at Nascent Soul the window shuts for good. ${8 - x.e} still closed.`);
            if (R(g) >= 7 && x.e < 8) parts.push('The vessels you didn\'t open in time are scar tissue now, and their collaterals with them. You knew the rule. You were busy.');
            if (R(g) >= 7 && x.e >= 8 && x.c < 28) parts.push('With all eight vessels open, their collaterals are within reach: twenty-eight fine threads.');
            parts.push('Yuki curls against your hip. Whatever you open, she opens too; the bond doesn\'t do things by halves.');
            return parts.join('\n\n');
        },
        choices: [
            {
                text: (g) => `Open ${PRIMARIES[P(g)]?.name}. (${P(g) + 1}/12; session ${sessionsToday(g) + 1} of ${SESSIONS_PER_DAY} today.)`, show: canPrimary, qi: 2, time: SESSION_MINUTES,
                check: { skill: 'Convergence Use', dc: dcPrimary, band: 'standard', bonus: (g) => adaptOf(g, 'mer:pri') },
                do: (g) => { const v = PRIMARIES[P(g)]; useSession(g); g.james.primaries = P(g) + 1; mirror(g); setAdapt(g, 'mer:pri', 0); return [`Opened ${v.name} (${g.james.primaries}/12). ${v.line}`, 'Qi Max +1.25 (Yuki +1).']; },
                failDo: (g) => { useSession(g); return ['The ash holds. Two hours of breathing at a wall, and the wall won.', learn(g, 'mer:pri')]; },
                to: 'meridians',
            },
            {
                text: (g) => `Open ${COL_GROUPS[colGroupsOpen(g)]?.name}. (group ${colGroupsOpen(g) + 1}/8, ${COL_GROUPS[colGroupsOpen(g)]?.size} threads; session ${sessionsToday(g) + 1} of ${SESSIONS_PER_DAY} today.)`, show: canColGroup, qi: 2, time: SESSION_MINUTES,
                check: { skill: 'Convergence Use', dc: dcColGroup, band: 'standard', bonus: (g) => adaptOf(g, 'mer:col') },
                do: (g) => { const gr = COL_GROUPS[colGroupsOpen(g)]; useSession(g); g.james.collaterals = COL_GROUPS.slice(0, colGroupsOpen(g) + 1).reduce((a, x) => a + x.size, 0); mirror(g); setAdapt(g, 'mer:col', 0); return [`Opened ${gr.name} (${g.james.collaterals}/66). Fine threads, lighting up one after another like a city at dusk.`, ...after(g)]; },
                failDo: (g) => { useSession(g); return ['The threads tangle. You spend the session unpicking them and end where you started, minus two Qi and your patience.', learn(g, 'mer:col')]; },
                to: 'meridians',
            },
            {
                text: (g) => `Open ${EXTRA8[m(g).e]?.name}.`, show: canExtra8, qi: 2, time: 60,
                check: { skill: 'Convergence Use', dc: dcE, band: 'challenging' },
                do: (g) => { const v = EXTRA8[m(g).e]; g.james.extra8 = m(g).e + 1; markDaily(g, 'mer_e8'); return [`Opened ${v.name} (${g.james.extra8}/8). ${v.line}`, ...after(g)]; },
                failDo: () => ['The vessel holds. Two Qi gone into a wall. Tomorrow, maybe, or in an hour if you\'re stubborn.'],
                to: 'meridians',
            },
            {
                text: (g) => `Open ${EXTRA_COLL[m(g).c]}.`, show: canExtraColl, qi: 2, time: 60,
                check: { skill: 'Convergence Use', dc: dcC, band: 'challenging' },
                do: (g) => { const n = EXTRA_COLL[m(g).c]; g.james.extraCollaterals = m(g).c + 1; markDaily(g, 'mer_ec'); return [`Opened ${n} (${g.james.extraCollaterals}/28). A fine, bright thread, no thicker than a hair.`, ...after(g)]; },
                failDo: () => ['The thread slips. It\'s like threading a needle in the dark, if the needle were inside you.'],
                to: 'meridians',
            },
            {
                text: (g) => `Open ${JUNCTIONS[m(g).j]?.name}.`, show: canJunction, qi: 2, time: 60,
                check: { skill: 'Convergence Use', dc: dcJ, band: 'challenging' },
                do: (g) => { const v = JUNCTIONS[m(g).j]; g.james.junctions = m(g).j + 1; markDaily(g, 'mer_jn'); return [`Opened ${v.name} (${g.james.junctions}/10). ${v.line}`, ...after(g)]; },
                failDo: () => ['The junction doesn\'t give. It isn\'t stubborn. It\'s just bigger than you are, today.'],
                to: 'meridians',
            },
            { text: 'Open your eyes.', to: (g) => g.flags.mer_return || 'stream' },
        ],
    },
    ns_warn: {
        id: 'ns_warn', title: 'Before Nascent Soul', art: 'tribulation', place: (g) => g.location,
        text: (g) => `Saturation sits at the brim. One more step and you're Nascent Soul.

Parallel Cognition raises a hand, the way it does when it has read the fine print. *${8 - m(g).e} of the eight Extraordinary vessels are still closed. They open between Foundation and Soul Embryo. Break through now, and they seal for good, and their twenty-eight collaterals with them.*

Yuki looks at you. *Your call,* says the bond. *I'd open them. But I'm a cat. I'd also eat the curtains.*`,
        choices: [
            { text: 'Not yet. Open the vessels first.', to: (g) => g.flags.bt_return || 'stream' },
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
export const btTarget = (g) => (g.james.realm === 0 && C(g) < 66 ? 'col_warn' : g.james.realm === 6 && (g.james.extra8 || 0) < 8 ? 'ns_warn' : 'breakthrough');

/** The James page row. */
export const meridianRow = (g) => { const x = m(g); return `Primaries ${P(g)}/12 · collaterals ${C(g)}/66 (${colGroupsOpen(g)}/8 groups${g.james.colSealed ? ', the rest sealed: a rewind unwinds Foundation to reopen them' : ''}) · Extraordinary ${x.e}/8 · their collaterals ${x.c}/28 · junctions ${x.j}/10 · Qi regen ${baseRegen(g).toFixed(1)}%/Cycle`; };
