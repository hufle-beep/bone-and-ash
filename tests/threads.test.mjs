// Run: node tests/threads.test.mjs — v0.11.286 (owner picks G4-A, TQ-A, WR-a, HP-n): the threads (js/core/threads.js).
// A what a thread may hold (TQ-A: the daily Forage and Hunt cards with a check and items, Smoke the catch; 22 ids); B when threads wake
// (WR-a: none before a won rewind, then won rewinds + arcs finished after it, up to 9; the arcs wired into their scenes); C the hand
// record (HP-n) and the save (SV: an old save empty, junk cleaned, kept across a rewind with every lane from 0); D a lane's run
// (the same items, XP and Qi as James's own run of the card, +1 familiarity, none of his time; once a day; 06:00–19:00 only; only on
// its screen; rests on a partial, a full stock); E Smoke the catch; F the screen's words and main.js's wiring (read as text);
// G L5-a (a second tap only from 400 ms) and L4-w (the week card's hold box). Mutation: tools/mutate.mjs on threads.js.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENES } from '../js/story/prologue.js';
import { newGame } from '../js/core/game.js';
import { TASK_HUBS } from '../js/story/task_hubs.js';
import * as T from '../js/core/tasks.js';
import * as H from '../js/core/threads.js';
import { rewind, endCoil } from '../js/core/coil.js';
import { askStep, secondTap, ASK_MIN_MS, ASK_MS } from '../js/core/app.js';
import { goTo, enterHook } from '../js/core/story.js';
import { PRESERVE_MIN } from '../js/story/common.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');
let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; console.log('  PASS ', l); } else { fail++; console.error('  FAIL ', l); } };
const clone = (g) => JSON.parse(JSON.stringify(g));

/** A game on the Wilds at 07:00 on Day 3, threads unlocked (one won rewind), James strong enough for a double. */
function wilds({ clears = 1, gu = true } = {}) {
    const g = newGame(7, { closed: true });
    g.scene = 'wilds'; g.minutes = 2 * 1440 + 7 * 60;
    g.stats.clears = clears;
    if (gu) g.james.gu = { ...g.james.gu, tier: 3, level: 5 };
    return g;
}
/** Pass the time on the Wilds with Rest cards until `until` (game minutes) or `n` cards. */
function passTime(g, n = 12) {
    const lines = [];
    for (let k = 0; k < n; k++) {
        const c = T.taskCards(g, SCENES).find((x) => x.id === 'wilds:6' && x.status === 'open');
        if (!c) break;
        lines.push(...T.runTask(g, SCENES, c.id).lines);
    }
    return lines;
}

// A: what a thread may hold
{
    const all = [];
    for (const hub of Object.keys(TASK_HUBS)) for (const c of H.threadChoices(newGame(1, { closed: true }), SCENES, hub)) all.push(c.id);
    const ids = [...new Set(all)];
    const food = ids.filter((x) => !/^(wilds|ashfall|fo_ashfall|heart_hub):/.test(x)), smoke = ids.filter((x) => /^(wilds|ashfall|fo_ashfall|heart_hub):/.test(x));
    assert(food.length === 18 && smoke.length === 4, `A: 22 cards a thread may hold (18 Forage and Hunt, 4 Smoke the catch): ${food.length} + ${smoke.length}`);
    assert(food.every((id) => { const [m, i] = id.split(':'); const c = SCENES[m].choices[Number(i)]; return !!c.check && typeof c.show === 'function'; }), 'A: every one has a check and a gate of its own (the day, the option)');
    assert(!H.canHold('wild_train:1', SCENES) && !H.canHold('wild_hunt:3', SCENES) && !H.canHold('lf_hunt:2', SCENES) && !H.canHold('workshop:2', SCENES) && !H.canHold('wilds:6', SCENES) && !H.canHold('dw_forage:2', SCENES), 'A: never a drill, Yuki\'s own hunt, the village\'s work, a rest, a card without items');
    assert(H.canHold('wild_forage:0', SCENES) && H.canHold('rr_forage:1', SCENES) && H.canHold('wilds:15', SCENES), 'A: a Forage card, a Blackroot camp\'s, Smoke the catch');
}

// B: when threads wake (WR-a)
{
    const g = wilds({ clears: 0 });
    H.noteArcs(g, [0, 1, 2]);
    assert(H.threadsAwake(g) === 0 && g.tasks.threads === undefined, 'B: before a won rewind none wake, and arcs finished then are not kept (no record made)');
    g.stats.clears = 1;
    assert(H.threadsAwake(g) === 1, 'B: the first won rewind wakes one');
    H.noteArcs(g, [0]); H.noteArcs(g, [0]);
    assert(H.threadsAwake(g) === 2, 'B: an arc\'s first finish after it wakes one more, once');
    g.stats.clears = 3; H.noteArcs(g, [1, 2, 3, 4, 5, 6, 7, 8]);
    assert(H.threadsAwake(g) === 9, 'B: up to 9 (3 won rewinds + 9 arcs)');
    assert(H.ARCS.length === 9 && Object.values(H.ARC_AT).flat().sort((a, b) => a - b).join() === '0,1,2,3,4,5,6,7,8', 'B: 9 arcs, each finished by a scene');
    const s = wilds();
    goTo(s, SCENES, 'village');
    assert(H.threadsRead(s).arcs === 1, 'B: entering Ashfall finishes the Wilds (story.js\'s entry hook)');
    goTo(s, SCENES, 'ht_start');
    assert(H.threadsRead(s).arcs === (1 | 16 | 32 | 64), 'B: the Heart finishes the Blackroot\'s three regions');
    const sk = wilds(); sk.coil.skipEnter = true; goTo(sk, SCENES, 'fo_start');
    assert(H.threadsRead(sk).arcs === 0, 'B: a rewind\'s own first scene (Act 1\'s) finishes nothing');
    assert(enterHook.fn === H.arcAt && Object.keys(H.ARC_AT).every((id) => !!SCENES[id]), 'B: the hook is set and every arc\'s scene is there');
    assert(/Threads: none yet|none yet/.test(H.threadsLine(wilds({ clears: 0 }))) && /1 of 9 awake/.test(H.threadsLine(wilds())) && /all 9/.test(H.threadsLine(g)), 'B: the Coil screen\'s line, before, at 1 and at 9');
    assert(/\*\*Threads at work:\*\* \$\{threadsLine\(g\)\}/.test(read('js/story/coil_scenes.js')) && /A thread first takes over work when you go round again after Act 1 is won\./.test(H.threadsLine(wilds({ clears: 0 }))), 'B: the Coil screen shows it (RV-A, M3-w: "Threads at work")');
}

// C: the hand record and the save
{
    const g = wilds(); const id = 'wild_forage:3';
    T.taskState(g).fam[id] = 3;
    assert(!H.setThread(g, SCENES, 0, 'wilds', id), 'C: a card never tapped by hand can\'t be held');
    H.noteHand(g, SCENES, 'wild_train:1'); H.noteHand(g, SCENES, 'wilds:6');
    assert(H.threadsRead(g).hand.length === 0, 'C: only a card a thread may hold goes on the record');
    H.noteHand(g, SCENES, id); H.noteHand(g, SCENES, id);
    assert(H.threadsRead(g).hand.join() === id, 'C: tapped by hand, once on the record');
    T.taskState(g).fam['wild_forage:0'] = 1; H.noteHand(g, SCENES, 'wild_forage:0');
    assert(!H.setThread(g, SCENES, 0, 'wilds', 'wild_forage:0'), 'C: a New card can\'t be held (Practised first)');
    assert(H.threadChoices(g, SCENES).find((c) => c.id === 'wild_forage:0').why === H.THREAD_TEXT.newish && H.threadChoices(g, SCENES).find((c) => c.id === 'wild_forage:2').why === H.THREAD_TEXT.hand, 'C: the picker says why a card is locked');
    assert(!H.setThread(g, SCENES, 1, 'wilds', id), 'C: only an awake lane can be set');
    assert(H.setThread(g, SCENES, 0, 'wilds', id), 'C: by hand and Practised: held');
    assert(JSON.stringify(H.threadsRead(newGame(2, { closed: true }))) === '{"lanes":[],"arcs":0,"hand":[]}', 'C: a save without the field reads empty');
    const j = wilds(); j.tasks.threads = { lanes: [{ id: 5 }, 'x', { id: 'wild_forage:1', hub: 'wilds', p: -3 }, ...Array(12).fill(null)], arcs: 4095, hand: ['wild_forage:1', 7] };
    const r = H.threadsRead(j);
    assert(r.lanes.length === 9 && r.lanes[0] === null && r.lanes[2].p === 0 && r.arcs === 511 && r.hand.join() === 'wild_forage:1', 'C: a junk record is cleaned (9 lanes, no negative time, 9 arcs, ids only)');
    g.tasks.threads.lanes[0].p = 50; g.tasks.threads.arcs = 3;
    g.coil.why = 'death'; rewind(g);
    const k = H.threadsRead(g);
    assert(k.lanes[0]?.id === id && k.lanes[0].p === 0 && k.arcs === 3 && k.hand.includes(id), 'C: a rewind keeps the lanes (their time from 0), the arcs and the hand record');
    const n = newGame(3, { closed: true }); rewind(n);
    assert(n.tasks.threads === undefined, 'C: a rewind of a save without threads adds no field');
}

// D: a lane's run
{
    const id = 'wild_forage:3'; // Needleberries: no Qi, no XP (xp: false)
    const g = wilds();
    T.taskState(g).fam[id] = 3; H.noteHand(g, SCENES, id); H.setThread(g, SCENES, 0, 'wilds', id);
    const me = clone(g);
    const mine = T.runTask(me, SCENES, id); // James's own run, for the items
    const myGain = (me.inventory.crimson_berry || 0);
    const m0 = g.minutes;
    const lines = passTime(g, 12);
    const runs = lines.filter((l) => /^Thread 1 · /.test(l));
    assert(runs.length === 1, `D: the lane runs its card once in the day (${runs.length})`);
    assert(g.tasks.fam[id] === 4, `D: +1 familiarity (${g.tasks.fam[id]})`);
    assert(new RegExp(`\\+${myGain} Crimson`).test(runs[0] || ''), `D: the same haul as James's own run (+${myGain}): ${runs[0]}`);
    assert(H.threadWhy(g, SCENES, 'wilds', id) === H.THREAD_TEXT.today || H.threadWhy(g, SCENES, 'wilds', id) === H.THREAD_TEXT.shut, `D: then done for today (${H.threadWhy(g, SCENES, 'wilds', id)})`);
    assert(!mine.lines.some((l) => /^Thread/.test(l)), 'D: James\'s own run of the held card is not a thread\'s');
    // none of James's time: the rest cards took their hours, the run none
    const h = wilds(); T.taskState(h).fam[id] = 3; H.noteHand(h, SCENES, id); H.setThread(h, SCENES, 0, 'wilds', id);
    const len = H.threadMinutes(h, SCENES, 'wilds', id);
    h.tasks.threads.lanes[0].p = len - 1;
    const t0 = h.minutes; const rr = T.runTask(h, SCENES, 'wilds:6');
    assert(rr.lines.some((l) => /^Thread 1 · /.test(l)) && h.minutes - t0 === 60, `D: the run takes none of James's time (the rest's hour only: ${h.minutes - t0} min)`);
    // a hunt: its Qi and its XP, as James's (the crab: 4 Qi, Convergence Use XP)
    const hid = 'wild_hunt:2', a = wilds(); a.minutes = 2 * 1440 + 6 * 60; a.james.qi = 20;
    T.taskState(a).fam[hid] = 3; H.noteHand(a, SCENES, hid); H.setThread(a, SCENES, 0, 'wilds', hid);
    const b = clone(a); const jr = T.runTask(b, SCENES, hid);
    a.tasks.threads.lanes[0].p = H.threadMinutes(a, SCENES, 'wilds', hid) - 1;
    const q0 = a.james.qi; const ar = H.threadTick(a, SCENES, 'wilds', 1);
    const after = (ls, re) => { const i = ls.findIndex((l) => re.test(l)); return i < 0 ? [] : ls.slice(i + 1).filter((l) => /^(Convergence Use|GU) \+\d+ XP$/.test(l)).slice(0, 2); };
    assert(ar.some((l) => /^Thread 1 · Stone-shell crab/.test(l)) && (b.inventory.crab_meat || 0) > 0 && (b.inventory.crab_meat || 0) === (a.inventory.crab_meat || 0), `D: a hunt brings James's haul (${a.inventory.crab_meat} / ${b.inventory.crab_meat})`);
    const xa = after(ar, /^Thread 1 · /).join('|'), xb = after(jr.lines, /— (a double haul|done)$/).join('|');
    assert(xa !== '' && xa === xb, `D: and its XP, as his (${xa} / ${xb})`);
    assert(Math.abs((q0 - a.james.qi) - 4) < 1e-6, `D: and its 4 Qi (${q0} → ${a.james.qi})`);
    // only 06:00–19:00, only on its screen, not on a partial, not on a full stock
    const n = wilds(); T.taskState(n).fam[id] = 3; H.noteHand(n, SCENES, id); H.setThread(n, SCENES, 0, 'wilds', id); n.minutes = 2 * 1440 + 20 * 60;
    H.threadTick(n, SCENES, 'wilds', 60);
    assert(n.tasks.threads.lanes[0].p === 0, 'D: after 19:00 a lane gains nothing');
    { const o = clone(n); o.scene = 'stream'; assert(H.threadWhy(o, SCENES, 'wilds', id) === H.THREAD_TEXT.away && H.threadLanes(o, SCENES)[0].here === false && H.threadLanes(n, SCENES)[0].here === true, 'D: off its screen it waits (TG9, TG7: `away`, `here` false)'); }
    const w = wilds({ gu: false }); T.taskState(w).fam[id] = 3; H.noteHand(w, SCENES, id);
    assert(H.threadWhy(w, SCENES, 'wilds', id) === H.THREAD_TEXT.hard, 'D: a card James would only half do rests');
    const f = wilds(); T.taskState(f).fam[id] = 3; H.noteHand(f, SCENES, id); f.inventory.crimson_berry = 999;
    assert(H.threadWhy(f, SCENES, 'wilds', id) === H.THREAD_TEXT.full, `D: a full stock rests (${H.threadWhy(f, SCENES, 'wilds', id)})`);
    const u = wilds({ clears: 0 }); T.taskState(u).fam[id] = 3; H.noteHand(u, SCENES, id); u.tasks.threads.lanes = [{ id, hub: 'wilds', p: 9999 }];
    assert(!passTime(u, 6).some((l) => /^Thread/.test(l)), 'D: before the unlock a lane in the save does nothing');
    assert(H.THREAD_HOURS.join() === T.YUKI_HOURS.join(), 'D: the lanes\' hours are Yuki\'s');
}

// E: Smoke the catch
{
    const g = wilds(); const id = 'wilds:15';
    g.flags.fire = true; g.inventory.hare_raw = 3;
    T.taskState(g).fam[id] = 2; H.noteHand(g, SCENES, id);
    assert(H.setThread(g, SCENES, 0, 'wilds', id), 'E: Smoke the catch can be held');
    assert(H.threadMinutes(g, SCENES, 'wilds', id) === 3 * PRESERVE_MIN, `E: 15 minutes a piece (${H.threadMinutes(g, SCENES, 'wilds', id)})`);
    g.tasks.threads.lanes[0].p = 3 * PRESERVE_MIN - 1;
    const r = T.runTask(g, SCENES, 'wilds:6');
    assert(r.lines.some((l) => /^Thread 1 · Smoke the catch: \+\d+ Smoked/.test(l)) && (g.inventory.hare_raw || 0) === 0 && g.inventory.smoked_meat > 0, `E: the catch smoked (${g.inventory.smoked_meat} smoked, ${g.inventory.hare_raw || 0} raw)`);
    assert(H.threadWhy(g, SCENES, 'wilds', id) === H.THREAD_TEXT.smoke || H.threadWhy(g, SCENES, 'wilds', id) === H.THREAD_TEXT.shut, 'E: then nothing to smoke');
}

// F: main.js's wiring and the What's new note (as text)
{
    const M = read('js/main.js');
    assert(/land\(label, r\.lines[^\n]*\n\s*if \(!r\.skipped\) noteHand\(g, SCENES, id\)/.test(M), 'F: a card tapped by hand goes on the record after its result is shown, not a tap the routine left no time for (RV L1)');
    assert(/threadsHtml\(\)/.test(M) && /data-thpick/.test(M) && /data-thread=/.test(M) && /setThread\(g, SCENES, Number\(i\), g\.scene, id \|\| null\)/.test(M), 'F: the lanes\' rows, their picker and Off');
    assert(/'0\.11\.286', 'Threads:/.test(read('js/core/news.js')), 'F: What\'s new names the threads');
    const tk = read('js/core/tasks.js');
    assert(/yukiTick\(g, hubId, g\.minutes - mY\)\);\n\s*lines\.push\(\.\.\.threadTick\(g, scenes, hubId, g\.minutes - mY\)\)/.test(tk), 'F: the lanes tick on the same time as Yuki\'s, after hers');
    assert(/threads: threadsKept\(g\)/.test(read('js/core/coil.js')), 'F: the rewind keeps them');
}

// RV: the cold review's fixes and test gaps (M2, L1–L5, TG1–TG11)
{
    const id = 'wild_forage:3';
    const mk = () => { const g = wilds(); g.minutes = 2 * 1440 + 6 * 60; T.taskState(g).fam[id] = 3; H.noteHand(g, SCENES, id); H.setThread(g, SCENES, 0, 'wilds', id); return g; };
    // M2: a lane on no task hub is dropped; the screen's lanes draw
    const j = wilds(); j.tasks.threads = { lanes: [{ id: 'wild_forage:0', hub: 'old_hub', p: 5 }], arcs: 0, hand: [] };
    let ok = true; try { H.threadLanes(j, SCENES); } catch { ok = false; }
    assert(ok && H.threadsRead(j).lanes[0] === null, 'M2: a lane whose hub is no task hub is dropped, and the lanes still draw');
    // TG1: the Blackroot's regions by bl_region
    const b = wilds(); b.scene = 'dw_hub'; b.flags.bl_region = 'dw'; H.threadTick(b, SCENES, 'dw_hub', 30);
    assert(H.threadsRead(b).arcs === 16, `TG1: at the Drowned Wood, the Root Road is finished (${H.threadsRead(b).arcs})`);
    b.scene = 'ah_hub'; b.flags.bl_region = 'ah'; H.threadTick(b, SCENES, 'ah_hub', 30);
    assert(H.threadsRead(b).arcs === (16 | 32), `TG1: at the Ashen Hills, the Drowned Wood too (${H.threadsRead(b).arcs})`);
    const a2 = wilds(); a2.scene = 'ah_hub'; a2.flags.bl_region = 'ah'; H.threadTick(a2, SCENES, 'ah_hub', 30);
    assert(H.threadsRead(a2).arcs === (16 | 32), `TG1: at the Ashen Hills alone, the Root Road and the Drowned Wood (${H.threadsRead(a2).arcs})`);
    // TG2: the 19:00 edge
    const e1 = mk(); e1.minutes = 2 * 1440 + 19 * 60; H.threadTick(e1, SCENES, 'wilds', 30);
    const e2 = mk(); e2.minutes = 2 * 1440 + 18 * 60 + 59; H.threadTick(e2, SCENES, 'wilds', 30);
    assert(e1.tasks.threads.lanes[0].p === 0 && e2.tasks.threads.lanes[0].p === 30, `TG2: a card ending at 19:00 gives a lane nothing, at 18:59 its time (${e1.tasks.threads.lanes[0].p} / ${e2.tasks.threads.lanes[0].p})`);
    // TG3: back to 0 after a run
    const z = mk(); z.tasks.threads.lanes[0].p = H.threadMinutes(z, SCENES, 'wilds', id) - 1;
    const zr = H.threadTick(z, SCENES, 'wilds', 30);
    assert(zr.some((l) => /^Thread 1 · /.test(l)) && z.tasks.threads.lanes[0].p === 0, 'TG3: a lane\'s time is back to 0 after its run');
    // TG4: a spaced card: James's three days' haul
    const sp = wilds(); sp.minutes = 2 * 1440 + 6 * 60; const sid = 'wild_forage:1'; T.taskState(sp).fam[sid] = 9; H.noteHand(sp, SCENES, sid); H.setThread(sp, SCENES, 0, 'wilds', sid);
    const { cardSpaced } = await import('../js/story/common.js');
    if (cardSpaced(sp, sid)) {
        const me = clone(sp); T.runTask(me, SCENES, sid);
        sp.tasks.threads.lanes[0].p = H.threadMinutes(sp, SCENES, 'wilds', sid) - 1; const sr = H.threadTick(sp, SCENES, 'wilds', 1);
        assert(sr.some((l) => /^Thread 1 · /.test(l)) && (sp.inventory.river_cress || 0) === (me.inventory.river_cress || 0) && sp.inventory.river_cress >= 12, `TG4: a spaced card brings James's three days' haul (${sp.inventory.river_cress} / ${me.inventory.river_cress})`);
    } else assert(false, 'TG4: the cress card at Skilled on the Wilds\' stay is spaced');
    // TG5: a card James is working this week rests
    const bu = mk(); const hid = 'wild_forage:0'; T.taskState(bu).fam[hid] = 3; H.noteHand(bu, SCENES, hid); bu.minutes = 2 * 1440 + 12 * 60; T.runTask(bu, SCENES, hid);
    if (T.carriesRead(bu)[hid]) { bu.minutes = 3 * 1440 + 8 * 60; assert(H.threadWhy(bu, SCENES, 'wilds', hid) === H.THREAD_TEXT.busy, `TG5: a card James has in hand this week rests (${H.threadWhy(bu, SCENES, 'wilds', hid)})`); }
    else assert(false, 'TG5: the mushroom ring is a week\'s work on the stay');
    // TG6: a lane on another hub gains nothing here
    const oh = mk(); oh.tasks.threads.lanes[0].hub = 'lf_hub'; H.threadTick(oh, SCENES, 'wilds', 30);
    assert(oh.tasks.threads.lanes[0].p === 0, 'TG6: a lane on another screen gains no time from cards here');
    // TG7: the Coil line names the arcs left
    const cl = wilds(); H.noteArcs(cl, [0]);
    assert(/left: Ashfall, the tribute/.test(H.threadsLine(cl)) && /bite the tail on a won Act 1/.test(H.threadsLine(cl)), `TG7 / L3: the line names the arcs left and the won bite (${H.threadsLine(cl)})`);
    const wc = wilds({ clears: 0 }); wc.coil.why = 'clear';
    assert(H.threadsLine(wc) === 'none yet: this bite wakes the first.', 'L3: on the won clear\'s Coil screen, this bite wakes the first');
    // L2: the card's day replies stay James's to read
    const dr = mk(); const before = JSON.stringify(dr.lines?.d || {});
    dr.tasks.threads.lanes[0].p = H.threadMinutes(dr, SCENES, 'wilds', id) - 1; H.threadTick(dr, SCENES, 'wilds', 1);
    const keysR = (o) => JSON.stringify(Object.fromEntries(Object.entries(o || {}).filter(([k]) => k.startsWith('r:'))));
    assert(keysR(dr.lines?.d) === keysR(JSON.parse(before)), 'L2: a thread\'s run leaves the card\'s day replies as they were');
    // L4: one card, one lane
    const two = mk(); two.stats.clears = 2;
    assert(!H.setThread(two, SCENES, 1, 'wilds', id) && H.threadChoices(two, SCENES, 'wilds', 1).find((c) => c.id === id).why === 'Held by Thread 1.' && H.threadChoices(two, SCENES, 'wilds', 0).find((c) => c.id === id).why === '', 'L4: a card on one lane can\'t go on another (the picker says which)');
    // M1-r: a thread's run of a card with Mei Lin's gain leaves her as she was; James's own run still gains
    const mm = wilds(); mm.scene = 'rr_hub'; mm.minutes = 2 * 1440 + 7 * 60; const mid = 'rr_forage:1';
    T.taskState(mm).fam[mid] = 3; H.noteHand(mm, SCENES, mid); H.setThread(mm, SCENES, 0, 'rr_hub', mid);
    const why = H.threadWhy(mm, SCENES, 'rr_hub', mid);
    const rel0 = JSON.stringify(mm.rel['Mei Lin'] || null), fl0 = Object.keys(mm.flags).filter((x) => x.startsWith('rel_')).join();
    mm.tasks.threads.lanes[0].p = H.threadMinutes(mm, SCENES, 'rr_hub', mid) - 1; const mr = H.threadTick(mm, SCENES, 'rr_hub', 1);
    assert(why === '' && mr.some((l) => /^Thread 1 · Help Mei Lin/.test(l)), `M1: the root-sorrel runs on a thread (${why})`);
    assert(JSON.stringify(mm.rel['Mei Lin'] || null) === rel0 && Object.keys(mm.flags).filter((x) => x.startsWith('rel_')).join() === fl0, `M1-r: her friendship and affection, and today's mark, as they were (${JSON.stringify(mm.rel['Mei Lin'])})`);
    // L5: the picker only for its game and screen (main.js, as text)
    assert(/threadPick && \(threadPick\.g !== g \|\| threadPick\.scene !== g\.scene\)\) threadPick = null/.test(read('js/main.js')), 'L5: the open picker closes on another screen or game');
}

// G: L5-a and L4-w
{
    const a0 = askStep({ k: '', at: 0 }, 'x', 1000);
    assert(!a0.go && a0.armed.k === 'x', 'G: the first tap arms');
    assert(!askStep(a0.armed, 'x', 1000 + ASK_MIN_MS - 1).go, `G: a second tap within ${ASK_MIN_MS} ms is no confirm`);
    assert(askStep(askStep(a0.armed, 'x', 1100).armed, 'x', 1000 + ASK_MIN_MS).go, 'G: an early second tap keeps the first armed; from 400 ms it confirms');
    assert(!askStep(a0.armed, 'x', 1000 + ASK_MS).go && !askStep(a0.armed, 'y', 1500).go, 'G: too late, or another button: no');
    assert(!secondTap(1000, 1399, 4000) && secondTap(1000, 1400, 4000) && !secondTap(1000, 5000, 4000), 'G: secondTap: 400 ms to the window');
    const M = read('js/main.js');
    assert(/askTwice\(`bak:\$\{b\.dataset\.bak\}`, ASK_TEXT\.restore\(/.test(M), 'G: Restore a backup asks a second tap, naming both games');
    assert(/Date\.now\(\) - biteArmed < ASK_MIN_MS\) return;/.test(M) && /Date\.now\(\) - yieldArmed < ASK_MIN_MS\) return;/.test(M) && /newKind === kind && Date\.now\(\) - newArmed < ASK_MIN_MS\) return false;/.test(M) && /secondTap\(newArmed/.test(M) && /fatalArmed\.id === id && Date\.now\(\) - fatalArmed\.at < ASK_MIN_MS\) return false;/.test(M) && /secondTap\(fatalArmed\.at/.test(M), 'G: New game, Bite the tail, Yield and a fatal card wait 400 ms too (TG8: each by name)');
    assert(/This week: \$\{WEEK_MULT\} runs/.test(M) && /One run \$\{durLabel\(fn\.now\)\}; \$\{durLabel\(fn\.then\)\} at \$\{fn\.name\}/.test(M), 'G: L4-w: a week\'s card says its week and its one run');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
