/**
 * The Coil's scenes (v0.9.4, step 3c-1): the Coil screen (`coil_end`), the first dawn again (`coil_dawn`),
 * "Bite the tail" after a lost tribute, "You remember this" on the arrival, breakthrough from 95% in the label.
 * Every new choice checks coilActive (Incremental Mode, the only mode since v0.11.34).
 */
import { advance, startActCoil, combatHooks, PEOPLE_FIGHTS, coilMult, coilMultNext, fmtMult } from '../core/game.js';
import { setDeathHook, goTo } from '../core/story.js';
import { coilActive, endCoil, rewind, coilReport, actOf, actWon, willUnwind, noteClear, targetsText } from '../core/coil.js';
import { yukiJobLabel, yukiSpeedLine } from '../core/tasks.js'; // v0.11.159 (owner pick NX2, CL)

const WHY = {
    collapse: `Halfway between standing and the dark, the Ouroboros Axiom turns.

This is not the slow wheel of a breakthrough. It is one hard, practical snap: a hand closing on a cup an inch above the floor. This world's poisoned Qi had every intention of keeping you. The loop was not consulted, and disagrees.`,
    tribute: `Lu Han's boots crunch away down the road, in no hurry. Ashfall stays ringed about the tribute post, silent in strict order of rank. Nobody looks at you. Here that is a verdict, read out in full.

The village can live with this; it has had the practice. Or you can decline to let it have happened.`,
    beast: `Teeth. Then the ground. Then nothing worth describing.

Whatever it was does not pause over your doctorate in mycology, or over a people who live eight hundred years. It has you down as meat, and the evidence is on its side.

Then the Ouroboros Axiom turns, with the flat snap of a hand catching a cup. This world had begun to digest you. The loop sends its regrets.`,
    shen: `The crimson robes take the road, and you walk in the middle of them, a guest in every word they use. Behind you the grove sings, faint and stubborn, and Ashfall stands at the tribute post, so still and so correct it might have been carved there.

You could go with him. It is an ending somebody took the trouble to write, and not the worst on offer. Or you can bite down, and it never took place.`,
    clear: `The grove is singing behind you, and Shen Qiu is somewhere down the mountain, thinking about things. This is an ending. You read it to the last line and set it down.

Then you pick it up again. The Ouroboros Axiom turns, slow this time, not a hand catching a cup but a season closing. You did this once, start to finish, and your hands know it now. A thread wakes to hold it.`,
    choice: `You could simply carry on. People do. Whole civilisations are built on it.

Or you could close the loop with your own teeth: bite the tail, and wake at a dawn you have already used once, with everything you remember and nothing you were carrying.`,
};

/** v0.11.72 (S1): a card's name for the Coil screen, from its id ("scene:index"). v0.11.159 (RV1, DC): Yuki's jobs have their own line (`yukiJobLabel`). */
function cardName(g, id) {
    const [scene, i] = [id.slice(0, id.lastIndexOf(':')), Number(id.slice(id.lastIndexOf(':') + 1))];
    const c = cardScenes[scene]?.choices?.[i];
    const t = c ? String(typeof c.text === 'function' ? c.text(g) : c.text) : id;
    return t.length > 40 ? `${t.slice(0, 38).replace(/[\s,.:;—-]+\S*$/, '')}…` : t.replace(/\.$/, '');
}
let cardScenes = {};

/** Rewind to 'act' (the act's first dawn) or 'game' (the arrival); the line the player sees. v0.11.26 */
function bite(g, to) {
    const whole = to === 'game' && actOf(g) === 1;
    const n = rewind(g, { to });
    return [`Coil ${n}.${whole ? ' Day 1 again: the forest, the stream, the whole of it.' : ''} The hammerspace is empty, and so are your hands. Your head is not${coilMult(g) > 1 ? `: you learn ×${fmtMult(coilMult(g))} as fast` : ''}.`]; // v0.11.86: no "×1 as fast"
}

export function installCoil(SCENES) {
    cardScenes = SCENES;
    SCENES.coil_end = {
        id: 'coil_end', title: (g) => `${actOf(g) === 1 ? 'Act 1 · ' : ''}Coil ${g.coil?.n || 1}`, art: 'meditation', place: 'The Ouroboros Axiom',
        text: (g) => {
            const r = coilReport(g);
            return `${WHY[r.why] || WHY.choice}

**This Coil:** ${r.gained.length ? r.gained.join(' · ') : 'nothing you can measure. Yet.'}

**James remembers:** ${r.known.length ? `${r.known.join('; ')}.` : 'the way the moss smells. Not much else worth writing down.'}
${r.near.length ? `
**Closest to the next tier:** ${r.near.map((x) => `${cardName(g, x.id)} ${x.f}/${x.at} (${x.tier})`).join(' · ')}
` : ''}${r.yuki?.length ? `
**Yuki's hunting:** ${r.yuki.map((y) => `${yukiJobLabel(y.id)} (${yukiSpeedLine(y.f)})`).join(' · ')}
` : ''}
**Carries over:** familiarity with every card and Yuki's practice, what James remembers, the faster learning, Yuki's bond, and a quarter of each relationship's best as a head start.

**Targets:** ${targetsText(g)}

Yuki remembers all of it, through the bond, as she always has. Expect to hear it quoted.

**Next Coil:** your realm, skills and meridians start over. ${g.coil?.why === 'clear' ? `Act 1 is won, and a bite from a won act counts like a hard one: you will learn ×${fmtMult(coilMultNext(g, false))} as fast.` : g.coil?.why === 'choice' ? `A Coil you end by choice adds nothing to the faster learning: you will learn as fast as now${coilMultNext(g, true) > 1 ? ` (×${fmtMult(coilMultNext(g, true))})` : ''}.` : `What you remember makes them come back faster: you will learn ×${fmtMult(coilMultNext(g, false))} as fast.`}${willUnwind(g) ? `

**The price:** your collaterals sealed at Foundation. This rewind unwinds the breakthrough with them: Mortal Vessel again, ${g.james.realm} realm${g.james.realm > 1 ? 's' : ''} gone, Saturation at zero. The threads will open again. Everything else you learned stays.` : ''}`;
        },
        choices: [
            // v0.11.26 (owner 11:07): the prologue wakes at the first dawn only; Act 1 at its start or at the start of the whole game; no "same days again"
            { text: (g) => (actOf(g) === 1 ? 'Bite the tail. Wake at the start of Act 1.' : `Bite the tail. Wake at the first dawn.${willUnwind(g) ? ' (Foundation unwinds.)' : ''}`), do: (g) => bite(g, 'act'), to: 'coil_dawn' },
            { text: 'Bite the tail. Wake at the start of the whole game (Day 1, the arrival).', show: (g) => actOf(g) === 1 && g.coil?.why !== 'choice', do: (g) => bite(g, 'game'), to: 'coil_dawn' }, // v0.11.86 (W1): a bite by choice restarts the act only
            { text: 'Accept it. Get up.', show: (g) => g.coil?.why === 'tribute', do: (g) => { g.coil.why = null; advance(g, 120, { resting: true }); return []; }, to: 'epilogue' },
            { text: 'Accept it. Walk.', show: (g) => g.coil?.why === 'shen', do: (g) => { g.coil.why = null; return []; }, to: 'a1_end' },
            { text: 'Not yet.', show: (g) => (g.coil?.why === 'choice' || g.coil?.why === 'clear') && !!g.coil.back, do: (g) => { g.coil.why = null; g.coil.skipEnter = true; return []; }, to: (g) => g.coil.back }, // v0.11.106 (RA1): Not yet after a won act's bite too
        ],
    };
    SCENES.coil_dawn = {
        id: 'coil_dawn', title: (g) => (actOf(g) === 1 ? 'Ashfall, Again' : 'The First Dawn, Again'), art: (g) => (actOf(g) === 1 ? 'ashfall_dawn' : 'forest_dawn'), place: (g) => (actOf(g) === 1 ? 'Ashfall Hamlet' : 'Unknown forest'),
        text: (g) => {
            const times = 'before'; // v0.11.26: one count per save, so the number of this dawn's visits is unknown (Fable review)
            const unwound = g.coil.unwound ? `

One thing is gone, and you keep finding the gap, as a tongue finds a pulled tooth: Foundation. The Axiom took it back along with the seal. Mortal Vessel again, and the threads that were sealed lie warm and open, waiting for you.` : '';
            if (actOf(g) === 1) return `Grey light over the palisade. Forty chimneys, forty threads of smoke. A rooster announcing a day it believes to be new. You have seen this morning ${times}. Ashfall has not.

The hammerspace reports in: what the tribute left you, and not one thing earned since. Your body has lost the road to the dead tree. Your head kept the map, and the body will learn it back the faster for that.${unwound}

Down the street Mei Lin is already arguing with somebody about herbs, and winning. She has no idea what she said to you at the tree. You have every word of it. The next conversation is going to be strange for exactly one of you.

Yuki is sitting on the windowsill, tail wrapped over her feet. The look says: *again. Fine. My remarks on the last one will keep until breakfast.*`;
            return `Black bark. Grey moss. Overhead, the same bruise of a sky. You have seen this sky ${times}, and it has not spent the interval improving.

The hammerspace reports in: empty. Your body files a report of its own, and a short one: it remembers nothing. The meridians are ash again. Your head is another matter, a library nobody thought to burn, with the way back shelved where you left it.${unwound}

Yuki is standing on your sternum, on all four feet. The look says: *we have been here. I was paying attention. This time you will be, too.*

"I did not touch anything," you tell her. By now it is a greeting.`;
        },
        choices: [{ text: 'Get up.', do: (g) => { g.coil.skipEnter = true; g.coil.unwound = false; return []; }, to: (g) => g.coil.wake || 'arrival' }],
    };
    // severe difficulty (v0.9.7, task mode): HP 0 outside a fight ends the Coil; so does losing to a beast
    setDeathHook((g, scenes) => {
        if (!coilActive(g) || g.scene === 'coil_end') return null;
        g.james.hp = 1;
        if (g.tasks) g.tasks.queue.length = 0;
        endCoil(g, 'collapse');
        return ['The day outlasts your body. You fold up where you stand, joint by joint, and the last thing you see is Yuki\'s face, very close and not at all impressed.', ...goTo(g, scenes, 'coil_end')];
    });
    combatHooks.lose = (g, c) => {
        if (PEOPLE_FIGHTS.has(c.id) || !coilActive(g)) return null;
        if (g.tasks) g.tasks.queue.length = 0;
        endCoil(g, 'beast');
        return 'coil_end';
    };
    // Act 1 begins (v0.9.6): its Coil's rewind point is Day 8 dawn, taken after fo_start's enter (a rewind skips it)
    const foEnter = SCENES.fo_start.enter;
    SCENES.fo_start.enter = (g) => { const lines = foEnter ? (foEnter(g) || []) : []; if (actOf(g) !== 1) { lines.push(...noteClear(g, 0)); startActCoil(g, 1); } return lines; }; // v0.11.72 (T1): the prologue cleared
    // v0.11.26 (owner 11:07, E1): the end of Act 1 can go round again, every outcome (Incremental Mode)
    SCENES.a1_again = {
        id: 'a1_again', title: 'Go Round Again', art: 'meditation', place: 'The Ouroboros Axiom',
        text: (g) => `The ending holds still, as endings will, and waits to learn whether you can leave it alone.

Nothing obliges you to. The Axiom lies coiled under your breastbone, tail in its mouth, well within reach. Bite down, and this ending is one you remember and not one that happened: ${g.flags.a1_outcome === 'taken' ? 'the road up the mountain, the crimson robes, all of it' : 'the grove, the Sect, the whole hard-won shape of it'}. What you learned stays. What you won does not.

Yuki opens one eye. *Go on, then,* says the bond. *You bite. I will keep the record for us both.*`,
        choices: [
            // v0.11.86 (G1): going round again is a Coil ended by choice: no faster learning from it;
            // v0.11.106 (owner pick RA1, W): after an Act 1 James won (victory, accord, revelation) it adds to it ('clear'); after 'taken' as before
            { text: (g) => (actWon(g) ? `Bite the tail. Wake at the start of Act 1. (Act 1 is won: the next Coil learns ×${fmtMult(coilMultNext(g, false))} as fast.)` : 'Bite the tail. Wake at the start of Act 1. (By choice: adds no faster learning.)'), do: (g) => { endCoil(g, actWon(g) ? 'clear' : 'choice', 'a1_end'); return bite(g, 'act'); }, to: 'coil_dawn' },
            { text: (g) => (actWon(g) ? `Bite the tail. Wake at the start of the whole game (Day 1, the arrival). (Act 1 is won: the next Coil learns ×${fmtMult(coilMultNext(g, false))} as fast.)` : 'Bite the tail. Wake at the start of the whole game (Day 1, the arrival). (By choice: adds no faster learning.)'), do: (g) => { endCoil(g, actWon(g) ? 'clear' : 'choice', 'a1_end'); return bite(g, 'game'); }, to: 'coil_dawn' },
            { text: 'Not yet.', to: 'a1_end' },
        ],
    };
    SCENES.a1_end.choices.push({ text: 'Go round again…', show: coilActive, to: 'a1_again' });
    const a1Enter = SCENES.a1_end.enter; // v0.11.72 (T1): Act 1 cleared, every outcome
    SCENES.a1_end.enter = (g) => { const lines = a1Enter ? (a1Enter(g) || []) : []; if (actOf(g) === 1) lines.push(...noteClear(g, 1)); return lines; };
    SCENES.rt_taken.choices.push({
        text: 'Bite the tail. (The Coil: wake at the start of Act 1 or of the whole game, keep what you learned.)',
        show: coilActive,
        do: (g) => { endCoil(g, 'shen', 'rt_taken'); return []; },
        to: 'coil_end',
    });
    SCENES.collectors_lost.choices.push({
        text: 'Bite the tail. (The Coil: wake at the first dawn, keep what you learned.)',
        show: coilActive,
        do: (g) => { endCoil(g, 'tribute', 'collectors_lost'); return []; },
        to: 'coil_end',
    });
    SCENES.arrival.choices.push({
        text: 'You remember this. Skip to the stream.',
        show: (g) => (g.coil?.n || 1) > 1,
        time: 30,
        do: (g) => { for (const f of ['bone_ok', 'sat_once']) g.flags[f] = true; return ['You take the opening as read: Yuki is unhurt, the Qi is poison, the bone still sings, and the clearing remains a clearing.']; },
        to: 'stream',
    });
}
