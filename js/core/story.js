/**
 * Scene runner. A scene: { id, title, art, place, text(g) | text, enter?(g) → lines, choices: [...] }.
 * A choice: { text, show?(g), req?(g) → true | 'reason', qi?, time?, check?: { skill, dc, band?, bonus?(g) },
 *             to | to(g), fail?, do?(g, r) → lines, failDo?(g, r) → lines, combat?: encounter, xp?: false }.
 * A check pays standard XP (25% on a fail) unless xp: false. Pure — no DOM.
 */
import { rollCheck, awardXp, spendQi, advance, ensureBars, actingCheck, actingName } from './game.js';

const asText = (v, g) => (typeof v === 'function' ? v(g) : v);

export function currentScene(g, scenes) {
    const s = scenes[g.scene];
    if (!s) throw new Error(`No scene "${g.scene}"`);
    return s;
}

export function choiceTag(g, c) {
    const bits = [];
    if (c.check) {
        const bonus = c.check.bonus ? c.check.bonus(g) : 0;
        const v = Math.round((actingCheck(g, c.check.skill) + bonus) * 10) / 10;
        bits.push(`${actingName(g, c.check.skill)} ${v} + d6 vs DC ${c.check.dc}`);
    }
    if (c.qi) bits.push(`${c.qi} Qi`);
    if (c.combat) bits.push('fight');
    return bits.join(' · ');
}

/** What the UI shows for the current scene. */
export function sceneView(g, scenes) {
    const s = currentScene(g, scenes);
    const choices = (s.choices || [])
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => !c.show || c.show(g))
        .map(({ c, i }) => {
            let reason = c.req ? c.req(g) : true;
            if (reason === true && c.qi && g.james.qi < c.qi) reason = `needs ${c.qi} Qi`;
            return { index: i, label: asText(c.text, g), tag: choiceTag(g, c), disabled: reason !== true, reason: reason === true ? '' : reason };
        });
    return { id: s.id, title: asText(s.title, g) || '', art: asText(s.art, g), place: asText(s.place, g), text: asText(s.text, g), choices, end: !!s.end };
}

function go(g, scenes, to) {
    const id = typeof to === 'function' ? to(g) : to;
    if (!scenes[id]) throw new Error(`Choice leads to unknown scene "${id}"`);
    g.scene = id;
    const s = scenes[id];
    if (s.place) g.location = asText(s.place, g);
    const lines = s.enter ? (s.enter(g) || []) : [];
    ensureBars(g);
    return lines;
}

/**
 * Take choice `index`. Returns { lines, roll, combat } — lines are what happened (rolls, XP, items).
 */
export function choose(g, scenes, index) {
    const s = currentScene(g, scenes);
    const c = (s.choices || [])[index];
    if (!c) throw new Error(`No choice ${index} in ${s.id}`);
    if (c.show && !c.show(g)) throw new Error('Choice not available');
    if (c.req && c.req(g) !== true) throw new Error(`Locked: ${c.req(g)}`);
    const lines = [];
    if (c.qi && !spendQi(g, c.qi)) throw new Error('Not enough Qi');
    let roll = null;
    let ok = true;
    if (c.check) {
        roll = rollCheck(g, c.check.skill, c.check.dc, c.check.bonus ? c.check.bonus(g) : 0);
        ok = roll.success;
        lines.push(`${roll.skill} ${roll.value} + 🎲${roll.die} = ${roll.total} vs DC ${roll.dc} — ${ok ? 'success' : 'failure'}${roll.crit ? ' (six!)' : roll.fumble ? ' (one…)' : ''}`);
        if (c.xp !== false) lines.push(...awardXp(g, c.check.skill, c.check.band || 'standard', { fail: !ok }));
    }
    if (c.time) lines.push(...advance(g, c.time));
    if (ok && c.do) lines.push(...(c.do(g, roll) || []));
    if (!ok && c.failDo) lines.push(...(c.failDo(g, roll) || []));
    if (c.combat && ok) {
        return { lines, roll, combat: c.combat };
    }
    const dest = ok ? c.to : (c.fail ?? c.to);
    lines.push(...go(g, scenes, dest));
    g.log.push({ at: g.minutes, scene: g.scene, lines: lines.slice(0, 12) });
    if (g.log.length > 200) g.log.shift();
    return { lines, roll, combat: null };
}

/** After a fight ends: go to its win / lose / flee scene. */
export function goTo(g, scenes, id) {
    return go(g, scenes, id);
}
