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
import { extraRegen } from '../core/game.js';
import { daily, markDaily } from './common.js';

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
export const canAnyMeridian = (g) => canExtra8(g) || canExtraColl(g) || canJunction(g);

const dcE = (g) => 4 + m(g).e; // 4 … 11
const dcC = (g) => 6 + Math.floor(m(g).c / 4); // 6 … 12
const dcJ = (g) => 8 + Math.floor(m(g).j / 2); // 8 … 12

const after = (g) => [`Qi regen now ${(11.6 + extraRegen(g)).toFixed(1)}% of Max per Cycle (Yuki's too, through the bond).`];

export const MERIDIANS = {
    meridians: {
        id: 'meridians', title: 'The Extraordinary Net', art: 'yuki_close', place: (g) => g.location,
        text: (g) => {
            const x = m(g);
            const parts = [];
            parts.push(`You sit, close your eyes, and let Parallel Cognition draw the map. Twelve primaries, sixty-six collaterals: lit, all of them, the way they've been since you were a child. Around and between them, the second net. ${x.e}/8 Extraordinary vessels, ${x.c}/28 of their collaterals, ${x.j}/10 junctions open.`);
            if (R(g) === 0) parts.push('The Extraordinary vessels are there, but sealed, like doors painted on a wall. Your people open them after Foundation. Not before.');
            else if (R(g) <= 6 && x.e < 8) parts.push(`They open between Foundation and Soul Embryo, and only then: at Nascent Soul the window shuts for good. ${8 - x.e} still closed.`);
            if (R(g) >= 7 && x.e < 8) parts.push('The vessels you didn\'t open in time are scar tissue now, and their collaterals with them. You knew the rule. You were busy.');
            if (R(g) >= 7 && x.e >= 8 && x.c < 28) parts.push('With all eight vessels open, their collaterals are within reach: twenty-eight fine threads.');
            parts.push('Yuki curls against your hip. Whatever you open, she opens too; the bond doesn\'t do things by halves.');
            return parts.join('\n\n');
        },
        choices: [
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

/** The James page row. */
export const meridianRow = (g) => { const x = m(g); return `Extraordinary ${x.e}/8 · their collaterals ${x.c}/28 · junctions ${x.j}/10 · Qi regen ${(11.6 + extraRegen(g)).toFixed(1)}%/Cycle`; };
