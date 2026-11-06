/**
 * The Coil's scenes (v0.9.4, step 3c-1): the Coil screen (`coil_end`), the first dawn again (`coil_dawn`),
 * "Bite the tail" after a lost tribute, "You remember this" on the arrival, breakthrough from 95% in the label.
 * Task mode only (every new choice checks isNoDice through coilActive or directly). Classic play is unchanged.
 */
import { advance, isNoDice } from '../core/game.js';
import { coilActive, endCoil, rewind, coilReport, hasPlayed } from '../core/coil.js';

const WHY = {
    collapse: `Somewhere between the ground and the dark, the Ouroboros Axiom turns.

It isn't the slow wheel of a breakthrough. It's a hard, practical snap, like a hand closing on a cup before it hits the floor. This world's poisoned Qi was quite prepared to keep you. The loop has other plans.`,
    tribute: `Lu Han's boots crunch away down the road. Ashfall stands around the tribute post in a silence so formal you could frame it, and nobody looks at you, which is its own kind of verdict.

The village can live with this. Or you can decline to let it have happened.`,
    choice: `You could keep going. It's an option. People do it all the time.

Or you could close the loop yourself: bite the tail, and wake at the first dawn with everything you've learned and nothing you've carried.`,
};

export function installCoil(SCENES) {
    SCENES.coil_end = {
        id: 'coil_end', title: (g) => `Coil ${g.coil?.n || 1}`, art: 'meditation', place: 'The Ouroboros Axiom',
        text: (g) => {
            const r = coilReport(g);
            return `${WHY[r.why] || WHY.choice}

**This Coil:** ${r.gained.length ? r.gained.join(' · ') : 'nothing you can measure. Yet.'}

**James remembers:** ${r.known.length ? `${r.known.join('; ')}.` : 'the way the moss smells. Not much else worth writing down.'}

Yuki remembers everything. She always does, through the bond, and she will bring it up.`;
        },
        choices: [
            { text: 'Bite the tail. Wake at the first dawn.', do: (g) => { const n = rewind(g); return [`Coil ${n}. The hammerspace is empty; everything you learned is not.`]; }, to: 'coil_dawn' },
            { text: 'Bite the tail, and run the same days again.', show: hasPlayed, do: (g) => { const n = rewind(g, { same: true }); return [`Coil ${n}. Each task screen will queue what you did there last time, day by day.`]; }, to: 'coil_dawn' },
            { text: 'Accept it. Get up.', show: (g) => g.coil?.why === 'tribute', do: (g) => { g.coil.why = null; advance(g, 120, { resting: true }); return []; }, to: 'epilogue' },
            { text: 'Not yet.', show: (g) => g.coil?.why === 'choice' && !!g.coil.back, do: (g) => { g.coil.why = null; g.coil.skipEnter = true; return []; }, to: (g) => g.coil.back },
        ],
    };
    SCENES.coil_dawn = {
        id: 'coil_dawn', title: 'The First Dawn, Again', art: 'forest_dawn', place: 'Unknown forest',
        text: (g) => `Black bark. Grey moss. A sky the colour of a bruise. You have seen this sky ${g.coil.n - 1 === 1 ? 'once before' : `${g.coil.n - 1} times before`}, and it has not improved.

Your hammerspace reports in: empty. Your body reports in too, and that report is longer. Everything you learned is still there, packed into muscle and meridian like a library nobody thought to burn.

Yuki is standing on your sternum. The look says: *you have done this before. I was there. Try to remember it this time.*

"I did not touch anything," you tell her. Out of habit.`,
        choices: [{ text: 'Get up.', do: (g) => { g.coil.skipEnter = true; return []; }, to: (g) => g.coil.wake || 'arrival' }],
    };
    SCENES.collectors_lost.choices.push({
        text: 'Bite the tail. (The Coil: wake at the first dawn, keep what you learned.)',
        show: coilActive,
        do: (g) => { endCoil(g, 'tribute', 'collectors_lost'); return []; },
        to: 'coil_end',
    });
    SCENES.arrival.choices.push({
        text: 'You remember this. Skip to the stream.',
        show: (g) => isNoDice() && (g.coil?.n || 1) > 1,
        time: 30,
        do: (g) => { for (const f of ['scanned', 'qi_toxic', 'bone_ok', 'sat_once']) g.flags[f] = true; return ['You skip the parts you know by heart: Yuki is fine, the Qi is poison, the bone sings, the clearing is a clearing.']; },
        to: 'stream',
    });
}
