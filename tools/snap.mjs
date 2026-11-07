// v0.11.7: fresh test saves from the current version (Selene's simsnap). Run from the repo root:
//   node tools/snap.mjs            writes saves/<version>-<point>.json for every point below (overwrites them)
// A seeded Incremental Mode bot plays until each point is reached and saves the game there.
// Make a new set whenever the save format changes, so tests/saves.test.mjs keeps old and new saves loading.
import { writeFileSync, readFileSync } from 'node:fs';
import { SCENES } from '../js/story/prologue.js';
import { newGame, ensureBars, startCombat, combatStep, COMBAT_ACTIONS, setNoDice, serialize, deserialize } from '../js/core/game.js';
import { INC_ONLY_ACTIONS, actionOpen } from '../js/core/forms.js';
import { sceneView, choose, goTo } from '../js/core/story.js';
import { isTaskHub, isTaskChoice, taskCards, taskOpen, runTask, taskQueue } from '../js/core/tasks.js';

const version = (readFileSync('sw.js', 'utf8').match(/bone-ash-([\d.]+)/) || [])[1];
let rs = 1;
const rnd = (n) => { rs = (rs * 1103515245 + 12345) >>> 0; return (rs >>> 8) % n; };

function fight(g) {
    for (let t = 0; t < 400 && g.combat; t++) {
        const act = actionOpen(g, 'spear') && g.james.qi >= 3 && t % 2 === 0 ? 'spear' : g.james.qi >= 4 && t % 3 === 1 ? 'needle' : g.james.qi >= 3 ? 'blade' : 'needle';
        const ok = !INC_ONLY_ACTIONS.has(act) || actionOpen(g, act);
        const out = combatStep(g, ok && COMBAT_ACTIONS[act] ? act : 'guard');
        if (out?.done) { goTo(g, SCENES, out.next); return; }
    }
}

// Each point: a test on the game state; `lost` sends the bot into the Long Forest on prologue Coil 2.
const POINTS = [
    { name: 'coil2-day1', lost: false, at: (g) => (g.coil.act || 0) === 0 && g.coil.n === 2 && !/^coil_/.test(g.scene) && !g.combat },
    { name: 'act1-coil1', lost: false, at: (g) => g.coil.act === 1 && g.coil.n === 1 && !g.combat },
    { name: 'act1-coil2', lost: false, at: (g) => g.coil.act === 1 && g.coil.n === 2 && !/^coil_/.test(g.scene) && !g.combat },
    { name: 'long-forest-coil2', lost: true, at: (g) => g.scene === 'lf_hub' && !g.combat },
];

function playTo(point, seed) {
    rs = seed;
    setNoDice(true);
    const g = ensureBars(newGame(seed, { closed: true }));
    for (let steps = 0; steps < 30000; steps++) {
        if (point.at(g)) return g;
        const v = sceneView(g, SCENES);
        if (v.end) return null;
        if (isTaskHub(g)) {
            const cards = taskCards(g, SCENES).filter((c) => c.status === 'open');
            const stops = v.choices.filter((c) => !c.disabled && (c.index >= 1000 || !isTaskChoice(SCENES, g.scene, c.index)));
            if (cards.length && (rnd(10) < 8 || !stops.length)) {
                const id = cards[rnd(cards.length)].id;
                if (taskOpen(g, SCENES, id)) runTask(g, SCENES, id);
                taskQueue(g).length = 0;
                continue;
            }
            if (!stops.length) return null;
            const r = choose(g, SCENES, stops[rnd(stops.length)].index);
            if (r.combat) { startCombat(g, r.combat(g)); fight(g); }
            continue;
        }
        let open = v.choices.filter((c) => !c.disabled);
        if (!open.length) return null;
        const lost = open.filter((c) => /Stay lost/.test(c.label));
        if (/^(arrival|clearing)$/.test(g.scene)) open = point.lost && lost.length ? lost : open.filter((c) => !/Stay lost/.test(c.label));
        const bite = open.filter((c) => /Bite the tail/.test(c.label));
        if (bite.length && /^(coil_end|collectors_lost|rt_taken)$/.test(g.scene)) open = bite;
        const r = choose(g, SCENES, open[rnd(open.length)].index);
        if (r.combat) { startCombat(g, r.combat(g)); fight(g); }
    }
    return null;
}

for (const p of POINTS) {
    let g = null, seed = 0;
    for (seed = 1; seed <= 200 && !g; seed++) g = playTo(p, seed);
    if (!g) { console.log(`${p.name}: not reached in 200 seeds`); process.exitCode = 1; continue; }
    taskQueue(g).length = 0; // a clean queue (the test plays it on)
    const text = serialize(g);
    deserialize(text); // must load back
    const file = `saves/v${version}-${p.name}.json`;
    writeFileSync(file, text);
    console.log(`${file}: seed ${seed - 1}, ${g.scene}, act ${g.coil.act || 0} Coil ${g.coil.n}, day minute ${g.minutes}`);
}
