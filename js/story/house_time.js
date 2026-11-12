/**
 * v0.11.139 (owner pick MW1, the tree's push 2: MB + MS + MG3 + MT; texts by Fable, rule 10):
 * Old Wen's and Mei Lin's mother's daily scenes. Once a waking day, on Ashfall's resting places (the prologue's village, the
 * Fallout's, the return's), James spends time with each (door cards `wen_time`, `mother_time`): 10 minutes on the card and a
 * talk's 10 on "Go on.", 20 in all, like Yuki's (DR2).
 *  - MS: the text by the place and the story's day there (HT_HUBS).
 *    In the prologue the card opens once James has met the person this Coil (the elder's house; her supper); in Act 1 always.
 *  - MG3: +3 friendship a scene, friendship only (strictly non-romantic, below the three; they reset with the Coil as before).
 *  - MT: a closing line by the person's friendship (under 30, 30 and up), drawn once when the scene opens (as Yuki's, RT1's M1).
 * The cards are appended after Yuki's (each hub's last choices), so no choice position changes.
 */
import { bumpRel } from '../core/game.js';
import { daily, markDaily, hour } from './common.js';
import { pickLine, textDay } from '../core/lines.js';
import { TASK_HUBS } from './task_hubs.js';
import { HT_LABEL, HT_BODY, HT_CLOSE } from './house_texts.js';

export { HT_LABEL, HT_BODY, HT_CLOSE };
export const HT_MINUTES = 10; // like Yuki's card (DR2)
export const HT_GAIN = 3; // MG3
export const HT_MID = 30; // MT: the closers' level

/** The slots of each resting place, by the story's own day there (Fable's texts name the day: "two days to the tribute" and its
 *  eve, the vday the hub reads; the Fallout's Days 8, 9 and 10), so a day skipped never shifts a text onto the wrong day; each
 *  day is its own slot, so no text comes back on another day of the Coil. The Fallout's day is the text day, from 05:00 (MR1, M1:
 *  a card taken at 23:50 keeps its day's text past midnight). */
export const HT_HUBS = {
    ashfall: [(g) => ((g.flags.vday || 1) >= 3 ? 'ashfall:2' : 'ashfall:1')],
    fo_ashfall: [(g) => `fo_ashfall:${Math.max(1, Math.min(3, textDay(g) - 7))}`],
    rt_ashfall: [() => 'rt_ashfall:1'],
};

/** The person met this Coil: in Act 1's villages always; in the prologue after the elder's house (its world flag) / her supper
 *  (its daily world flag, `supper@<day>`, which saves from before the text-day record have too: MR1, L8). World flags reset with the Coil. */
export const HT_MET = {
    wen: (g, hub) => hub !== 'ashfall' || !!g.flags.elder,
    mother: (g, hub) => hub !== 'ashfall' || Object.keys(g.flags).some((f) => f.startsWith('supper@')),
};
/** MR1 (M2): the villagers' doors shut at 19:00, as everyone else's in Ashfall. */
export const HT_UNTIL = 19;
const WHO = { wen: 'Old Wen', mother: 'Mother' };
const relF = (g, k) => g.rel?.[WHO[k]]?.f || 0;
export const htPool = (g, k) => `${k} ${relF(g, k) >= HT_MID ? 'MID' : 'LOW'}`;
const hubOf = (g, k) => (HT_HUBS[g.flags[`${k}_time_hub`]] ? g.flags[`${k}_time_hub`] : 'ashfall');
export const htSlot = (g, k) => HT_HUBS[hubOf(g, k)][0](g);

function closeOnce(g, k) {
    const pool = htPool(g, k);
    g.flags[`${k}_time_close`] = `${pool}|${pickLine(g, `ht:${pool}`, HT_CLOSE[pool])}`;
}
function textOf(g, k) {
    const slot = htSlot(g, k);
    const body = (g.flags.loft_burned && HT_BODY[k][`${slot}-burned`]) || HT_BODY[k][slot]; // MR1 (M4): after the arson night
    const [pool, i] = String(g.flags[`${k}_time_close`] || '').split('|');
    const line = HT_CLOSE[pool]?.[Number(i)];
    return line ? `${body}\n\n${line}` : body;
}

export const SCENES_HT = {
    wen_time: {
        id: 'wen_time', title: 'Old Wen', art: 'elder', place: 'Ashfall Hamlet — the elder\'s house', // MR1 (L12)
        enter: (g) => { markDaily(g, 'wen_time'); bumpRel(g, 'Old Wen', HT_GAIN, 0); closeOnce(g, 'wen'); return []; },
        text: (g) => textOf(g, 'wen'),
        choices: [{ text: 'Go on.', time: HT_MINUTES, to: (g) => hubOf(g, 'wen') }], // MR1 (L12): the talk's 10 minutes set here, as the scene now has its own place (no walk)
    },
    mother_time: {
        id: 'mother_time', title: 'Mei Lin\'s Mother', art: 'dinner', place: 'Ashfall Hamlet — Mei Lin\'s house', // MR1 (L12)
        enter: (g) => { markDaily(g, 'mother_time'); bumpRel(g, 'Mother', HT_GAIN, 0); closeOnce(g, 'mother'); return []; },
        text: (g) => textOf(g, 'mother'),
        choices: [{ text: 'Go on.', time: HT_MINUTES, to: (g) => hubOf(g, 'mother') }], // MR1 (L12): the talk's 10 minutes set here, as the scene now has its own place (no walk)
    },
};

/** The two cards on Ashfall's three resting places: appended after Yuki's (no choice position changes), door cards, once a waking day. */
export function installHouseTime(SCENES) {
    Object.assign(SCENES, SCENES_HT);
    for (const hub of Object.keys(HT_HUBS)) {
        const s = SCENES[hub];
        if (!s) continue;
        for (const k of ['wen', 'mother']) {
            const open = daily(`${k}_time`);
            s.choices.push({
                text: HT_LABEL[k],
                // hidden before the person is met, from 19:00 (M2) and once used today (a hub door, as Yuki's: MR1, L5)
                show: Object.assign((g) => HT_MET[k](g, hub) && hour(g) < HT_UNTIL && open(g), { dailyKey: `${k}_time` }),
                time: HT_MINUTES,
                do: (g) => { g.flags[`${k}_time_hub`] = hub; return []; },
                to: `${k}_time`,
            });
            const cfg = TASK_HUBS[hub];
            if (cfg && !(cfg.doors || []).includes(`${k}_time`)) cfg.doors = [...(cfg.doors || []), `${k}_time`];
        }
    }
}
