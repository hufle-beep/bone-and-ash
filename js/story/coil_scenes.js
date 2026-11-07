/**
 * The Coil's scenes (v0.9.4, step 3c-1): the Coil screen (`coil_end`), the first dawn again (`coil_dawn`),
 * "Bite the tail" after a lost tribute, "You remember this" on the arrival, breakthrough from 95% in the label.
 * Task mode only (every new choice checks isNoDice through coilActive or directly). Classic play is unchanged.
 */
import { advance, isNoDice, startActCoil, combatHooks, PEOPLE_FIGHTS, coilMult, COIL_GROWTH, fmtMult } from '../core/game.js';
import { setDeathHook, goTo } from '../core/story.js';
import { coilActive, endCoil, rewind, coilReport, actOf, willUnwind } from '../core/coil.js';

const WHY = {
    collapse: `Somewhere between the ground and the dark, the Ouroboros Axiom turns.

It isn't the slow wheel of a breakthrough. It's a hard, practical snap, like a hand closing on a cup before it hits the floor. This world's poisoned Qi was quite prepared to keep you. The loop has other plans.`,
    tribute: `Lu Han's boots crunch away down the road. Ashfall stands around the tribute post in a silence so formal you could frame it, and nobody looks at you, which is its own kind of verdict.

The village can live with this. Or you can decline to let it have happened.`,
    beast: `Teeth, then the ground, then nothing in particular.

Whatever it was does not stop to consider that you are a doctor of mycology from a civilisation of eight-hundred-year lifespans. It considers that you are meat. On the evidence, it has a point.

Then the Ouroboros Axiom turns, with the hard snap of a hand catching a cup. This world was ready to digest you. The loop declines on your behalf.`,
    shen: `The crimson robes take the road down the mountain, and you walk between them. Behind you, the grove sings, faint and stubborn, and Ashfall stands at the tribute post in a silence so formal it could be carved on a stele.

You could go with him. It is a written ending, and not the worst one. Or you can decline to let it have happened.`,
    choice: `You could keep going. It's an option. People do it all the time.

Or you could close the loop yourself: bite the tail, and wake at a dawn you have already seen, with what you remember and nothing you've carried.`,
};

/** Rewind to 'act' (the act's first dawn) or 'game' (the arrival); the line the player sees. v0.11.26 */
function bite(g, to) {
    const whole = to === 'game' && actOf(g) === 1;
    const n = rewind(g, { to });
    return [`Coil ${n}.${whole ? ' Day 1 again: the forest, the stream, the whole of it.' : ''} The hammerspace is empty, and so are your hands. Your head is not: you learn ×${fmtMult(coilMult(g))} as fast.`];
}

export function installCoil(SCENES) {
    SCENES.coil_end = {
        id: 'coil_end', title: (g) => `${actOf(g) === 1 ? 'Act 1 · ' : ''}Coil ${g.coil?.n || 1}`, art: 'meditation', place: 'The Ouroboros Axiom',
        text: (g) => {
            const r = coilReport(g);
            return `${WHY[r.why] || WHY.choice}

**This Coil:** ${r.gained.length ? r.gained.join(' · ') : 'nothing you can measure. Yet.'}

**James remembers:** ${r.known.length ? `${r.known.join('; ')}.` : 'the way the moss smells. Not much else worth writing down.'}

Yuki remembers everything. She always does, through the bond, and she will bring it up.

**Next Coil:** your realm, skills and meridians start over. What you remember makes them come back faster: you will learn ×${fmtMult(1 + COIL_GROWTH * (g.coil?.n || 1))} as fast.${willUnwind(g) ? `

**The price:** your collaterals sealed at Foundation. This rewind unwinds the breakthrough with them: Mortal Vessel again, ${g.james.realm} realm${g.james.realm > 1 ? 's' : ''} gone, Saturation at zero. The threads will open again. Everything else you learned stays.` : ''}`;
        },
        choices: [
            // v0.11.26 (owner 11:07): the prologue wakes at the first dawn only; Act 1 at its start or at the start of the whole game; no "same days again"
            { text: (g) => (actOf(g) === 1 ? 'Bite the tail. Wake at the start of Act 1.' : `Bite the tail. Wake at the first dawn.${willUnwind(g) ? ' (Foundation unwinds.)' : ''}`), do: (g) => bite(g, 'act'), to: 'coil_dawn' },
            { text: 'Bite the tail. Wake at the start of the whole game (Day 1, the arrival).', show: (g) => actOf(g) === 1, do: (g) => bite(g, 'game'), to: 'coil_dawn' },
            { text: 'Accept it. Get up.', show: (g) => g.coil?.why === 'tribute', do: (g) => { g.coil.why = null; advance(g, 120, { resting: true }); return []; }, to: 'epilogue' },
            { text: 'Accept it. Walk.', show: (g) => g.coil?.why === 'shen', do: (g) => { g.coil.why = null; return []; }, to: 'a1_end' },
            { text: 'Not yet.', show: (g) => g.coil?.why === 'choice' && !!g.coil.back, do: (g) => { g.coil.why = null; g.coil.skipEnter = true; return []; }, to: (g) => g.coil.back },
        ],
    };
    SCENES.coil_dawn = {
        id: 'coil_dawn', title: (g) => (actOf(g) === 1 ? 'Ashfall, Again' : 'The First Dawn, Again'), art: (g) => (actOf(g) === 1 ? 'ashfall_dawn' : 'forest_dawn'), place: (g) => (actOf(g) === 1 ? 'Ashfall Hamlet' : 'Unknown forest'),
        text: (g) => {
            const times = 'before'; // v0.11.26: one count per save, so the number of this dawn's visits is unknown (Fable review)
            const unwound = g.coil.unwound ? `

One thing is missing, and you feel its shape like a pulled tooth: Foundation. The Axiom took it back with the seal. Mortal Vessel again, and the sealed threads warm and open to you, waiting.` : '';
            if (actOf(g) === 1) return `Grey light over the palisade. Smoke from forty chimneys. A rooster with no sense of occasion. You have seen this morning ${times}, and Ashfall has not.

Your hammerspace reports in: whatever the tribute left you, and nothing you earned since. Your body has forgotten the road to the dead tree; your head has not. It will come back faster this time.${unwound}

Somewhere down the street Mei Lin is already arguing with someone about herbs. She doesn't know what she said to you at the tree. You do. That is going to be a strange conversation.

Yuki is sitting on the windowsill, tail around her feet. The look says: *again. Fine. Try not to get taken this time.*`;
            return `Black bark. Grey moss. A sky the colour of a bruise. You have seen this sky ${times}, and it has not improved.

Your hammerspace reports in: empty. Your body reports in too, and that report is short: it has forgotten everything. Your meridians are ash again. Your head, though, is a library nobody thought to burn, and it knows the way back.${unwound}

Yuki is standing on your sternum. The look says: *you have done this before. I was there. Try to remember it this time.*

"I did not touch anything," you tell her. Out of habit.`;
        },
        choices: [{ text: 'Get up.', do: (g) => { g.coil.skipEnter = true; g.coil.unwound = false; return []; }, to: (g) => g.coil.wake || 'arrival' }],
    };
    // severe difficulty (v0.9.7, task mode): HP 0 outside a fight ends the Coil; so does losing to a beast
    setDeathHook((g, scenes) => {
        if (!coilActive(g) || g.scene === 'coil_end') return null;
        g.james.hp = 1;
        if (g.tasks) g.tasks.queue.length = 0;
        endCoil(g, 'collapse');
        return ['Your body runs out before the day does. You fold up where you stand, and the last thing you see is Yuki\'s face, very close, very unimpressed.', ...goTo(g, scenes, 'coil_end')];
    });
    combatHooks.lose = (g, c) => {
        if (PEOPLE_FIGHTS.has(c.id) || !coilActive(g)) return null;
        if (g.tasks) g.tasks.queue.length = 0;
        endCoil(g, 'beast');
        return 'coil_end';
    };
    // Act 1 begins (v0.9.6): its Coil's rewind point is Day 8 dawn, taken after fo_start's enter (a rewind skips it)
    const foEnter = SCENES.fo_start.enter;
    SCENES.fo_start.enter = (g) => { const lines = foEnter ? (foEnter(g) || []) : []; if (actOf(g) !== 1) startActCoil(g, 1); return lines; };
    // v0.11.26 (owner 11:07, E1): the end of Act 1 can go round again, every outcome (Incremental Mode)
    SCENES.a1_again = {
        id: 'a1_again', title: 'Go Round Again', art: 'meditation', place: 'The Ouroboros Axiom',
        text: (g) => `The ending holds still, the way endings do, and waits to see if you will leave it alone.

You don't have to. The Axiom is right there, coiled under your breastbone, tail in its mouth. Bite down and this ending is one you remember, not one that happened: ${g.flags.a1_outcome === 'taken' ? 'the road up the mountain, the crimson robes, all of it' : 'the grove, the Sect, the whole hard-won shape of it'}. What you learned stays. What you won does not.

Yuki opens one eye. *Again?* says the bond. *Fine. I'll remember it for both of us.*`,
        choices: [
            { text: 'Bite the tail. Wake at the start of Act 1.', do: (g) => { endCoil(g, 'choice', 'a1_end'); return bite(g, 'act'); }, to: 'coil_dawn' },
            { text: 'Bite the tail. Wake at the start of the whole game (Day 1, the arrival).', do: (g) => { endCoil(g, 'choice', 'a1_end'); return bite(g, 'game'); }, to: 'coil_dawn' },
            { text: 'Not yet.', to: 'a1_end' },
        ],
    };
    SCENES.a1_end.choices.push({ text: 'Go round again…', show: coilActive, to: 'a1_again' });
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
        do: (g) => { for (const f of ['bone_ok', 'sat_once']) g.flags[f] = true; return ['You skip the parts you know by heart: Yuki is fine, the Qi is poison, the bone sings, the clearing is a clearing.']; },
        to: 'stream',
    });
}
