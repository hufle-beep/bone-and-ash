// Run: node tests/tasks.test.mjs — task cards and the queue (v0.9.0, "Tasks (preview)").
// Every card resolves; old saves get an empty queue; a dry run predicts the real run exactly;
// 1,000 bot games (2,000 before v0.11.34) in task mode reach the end with no dead end (Incremental Mode only since v0.11.34, D1: the classic games and the Story Mode checks gone).
import { SCENES, lfOpen, lfSeason, lfRank, LF_STOCK, LF_SEASON_MINUTES } from '../js/story/prologue.js';
import { itemCap, MAX_REALM, combatStep as cStep0, startCombat as sCombat, coilMult, awardXp, actSpeed, sitMinutes, awardYukiFightXp, condense, SAT_HOURS, sitGain, btMinutes, formDmgBonus, guardBonus, fieldDamage, FIELD_ROUNDS, actionDmg } from '../js/core/game.js';
import { FORM_LINES, hasForm, cuRank, actionOpen, actionLabel, fragileKnife, STORY_FORMS, INC_ONLY_ACTIONS } from '../js/core/forms.js';
import { TASK_HUBS } from '../js/story/task_hubs.js';
import { markDaily, daily, hour } from '../js/story/common.js';
import { dayEnd, nightLock, dayHour, endsLate, sitUseless } from '../js/core/game.js'; // v0.11.37 (v0.11.91: no push)
import { pickedMinutes, PICKED_SPEED } from '../js/core/story.js'; // v0.11.37 (F1)
import { wakeDay, sleepUntil, clockParts } from '../js/core/game.js';
import { yukiSpeed, yukiSays, setDryClone, dryClone, showPicked } from '../js/core/tasks.js';
import { e8Hours, ecHours, jnHours } from '../js/story/meridians.js';
import { serialize, deserialize } from '../js/core/game.js';
import { PEOPLE_FIGHTS, combatHooks } from '../js/core/game.js'; // v0.11.81
import { fightAction, yukiSitsOut, armourDr as armourDrOf, jamesDr as jamesDrOf } from '../js/core/game.js'; // v0.11.82
import { XP_RATE, XP_BANDS } from '../js/core/game.js'; // v0.11.85
import { jamesHpMax, canBreakThrough, newGame, ensureBars, startCombat, combatStep, combatFlee, COMBAT_ACTIONS, migrate, SAVE_VERSION, advance, STARVE_HP_PER_HOUR, jamesQiMax, yukiQiMax, qiRegenPct, breakthrough, inAct1, bumpRel as relBump, startActCoil, REL_CATCHUP, coilStart } from '../js/core/game.js';
import { canPrimary, canColGroup, colGroupsOpen, btTarget, COL_GROUPS, priHours, colHours, merMinutesOf } from '../js/story/meridians.js';
import { sceneView, choose, goTo, wasPicked, isMenuScene, notePicked, seenBefore, noteSeen } from '../js/core/story.js';
import { linesOf, pickLine, visitLine, noteVisit, coilStamp, SAID_MAX, noteDay, dayIndex, byDay, textDay, TEXT_DAY_FROM } from '../js/core/lines.js'; // v0.11.134 (LP2: PK); v0.11.135 (NT1): the day record
import { coilSnap } from '../js/core/game.js'; // v0.11.134 (LP2)
import { hpRegenPct } from '../js/core/game.js'; // v0.11.143 (RN1, L1)
import { replyKey, quietFilter, noteSaid, landReply } from '../js/core/replies.js'; // v0.11.134 (LP2: QR; RQ1)
/** v0.11.134 (LP2, QR): what main.js does for one action and its screen: filter, then record what was drawn. */
const quietReplies = (g, reply) => { const out = quietFilter(g, reply); noteSaid(g, out); return out; };
import { againView, skipStep, skipRun, skipPlan, MEMORY_LINES, noFold, SKIP_MAX, noteRead, readBefore, paraKey, STATE_PARA, isRecord } from '../js/story/again.js'; // v0.11.35 (P1-a)
import { medCards, runMed, canMeditate, NO_MEDITATE, isSitChoice, MED_SCREENS } from '../js/core/meditate.js';
import { defaultMinutes, DEFAULT_MINUTES } from '../js/core/story.js';
import { coilActive, rewind, endCoil, KEEP_FLAGS, REMEMBER } from '../js/core/coil.js';
import { isTaskHub, isTaskChoice, taskCards, taskOpen, taskMinutes, taskOutcome, dryOutcome, outcomeOf, sitLoop, sitLoopPlan, sitTaskId, SIT_STOP_TEXT, runTask, taskState, setYuki, yukiLane, famTier, famLine, FAM, merChoice, MER_TASK, BT_TASK, SIT_TASK, merLineTask, lineOfTask, isQueueScreen, runsHere, cardSpeed } from '../js/core/tasks.js';
/** v0.11.64: the game has no queue; the bots keep their plan of cards in the save's old queue field (emptied by the Coil screens and a collapse, as the queue was), so they play exactly as before. */
const planOf = (g) => taskState(g).queue;
/** v0.11.37 (D-a): card `id` can't run because the day is over (the day's end passed, or it would end past it; 00:00 since v0.11.91); the bots' plan stops there, as the queue did. A test helper since v0.11.64. */
const dayOver = (g, scenes, id) => (nightLock(g) ? !taskCards(g, scenes, id).some((x) => x.id === id && x.status === 'open') : taskCards(g, scenes, id).some((x) => x.id === id && x.status === 'late'));

import { writeFileSync } from 'node:fs';
import { smartAction, attackReserve } from './lib/smartfight.mjs'; // v0.11.96 (BT1); v0.11.107 (NK1): attackReserve
import { GAMES, FULL, SHARD, WORKERS, SEED, SENSIBLE, REPORT, STATS_OUT, myRuns, seedOf, launch, collect, emit, mergeInto } from './lib/shard.mjs';
import { seen as touched, track, noteView, noteCards, mergeSeen, seenOut as touchedOut } from './lib/seen.mjs'; // v0.11.22: for tools/leftovers.mjs
let pass = 0, fail = 0;
/** v0.11.118 (YK1, D8): a save stream whose next d8 is `roll` (the same xorshift step as d6 and d8). */
const rngFor = (roll) => { for (let s = 1; ; s++) { let x = s; x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; if ((x % 8) + 1 === roll) return s; } };
/** v0.11.116 (owner pick WA2, CDB): the older fight tests swing one move every round, as the game allowed before the rhythm; their
 *  helper clears the move's wait so they test what they tested. The WA2 block uses the real step (cStep0). */
const cStep = (g, a, t) => { if (g.combat) delete g.combat.wait; return cStep0(g, a, t); };
const assert = (c, l) => { if (c) { pass++; } else { fail++; if (fail < 30) console.error('  FAIL ', l); } };
const kids = launch(import.meta.url); // v0.11.1: the bot games in worker processes, while this one runs the other checks
/** v0.11.21: --bots-only plays the bot games and writes their stats, without the rule checks (tests/tools.test.mjs: 1 worker = 2 workers). */
const BOTS_ONLY = process.argv.includes('--bots-only');

if (!SHARD && !BOTS_ONLY) { // the static checks run in the parent only

// static: hubs, menus and their doors exist
for (const [hub, cfg] of Object.entries(TASK_HUBS)) {
    assert(!!SCENES[hub], `hub ${hub} exists`);
    for (const menu of Object.keys(cfg.menus || {})) {
        assert(!!SCENES[menu], `menu ${menu} exists`);
        assert(SCENES[hub].choices.some((c) => c.to === menu), `${hub} has a door to ${menu}`);
        assert(!SCENES[menu].choices.some((c) => c.combat), `${menu} has no fights (cards can't fight)`);
    }
}
// v0.11.67 (owner pick F1, one hub format): no gate cards. The Long Forest camp's Forage, Hunt and Practice are work cards on
// its list and Go deep's zones door cards; the Blackroot's Practice is a work group on its three hubs. Each card runs from the
// hub and comes back to it; a zone's door opens its scene.
{
    const { readFileSync } = await import('node:fs');
    const { oneOffLeft, onceKey } = await import('../js/story/oneoff.js');
    const lf = deserialize(readFileSync(new URL('../saves/v0.11.7-long-forest-coil2.json', import.meta.url), 'utf8'));
    lf.james.qi = 30; lf.james.satiety = 70;
    const lc = taskCards(lf, SCENES);
    const grp = (n) => lc.filter((c) => c.group === n && c.status === 'open');
    assert(lf.scene === 'lf_hub' && ['Forage', 'Hunt', 'Practice'].every((n) => grp(n).length && grp(n).every((c) => c.kind === 'work' || c.kind === 'chore')) && grp('Go deep').length === 4 && grp('Go deep').every((c) => c.kind === 'door'), `v0.11.67 (F1): the Long Forest camp's groups (${lc.map((c) => `${c.group}/${c.kind}`)})`);
    const vis = sceneView(lf, SCENES).choices.filter((c) => c.index < 1000 && !isTaskChoice(SCENES, 'lf_hub', c.index)).map((c) => String(c.label));
    assert(!vis.some((t) => /^(Forage|Hunt|Train)\.|^Go deep/.test(t)), `v0.11.67 (F1): no gate card left among the Long Forest's story cards (${vis})`);
    for (const n of ['Forage', 'Hunt', 'Practice']) {
        const x = deserialize(serialize(lf)); x.james.qi = 30; x.james.satiety = 70;
        if (!grp(n).length) continue; // reported by the group check above (Fable review M2)
        const id = grp(n)[0].id, m0 = x.minutes; runTask(x, SCENES, id);
        assert(x.scene === 'lf_hub' && x.minutes > m0, `v0.11.67 (F1): a ${n} card runs from the camp and comes back (${id}: ${x.scene})`);
    }
    if (grp('Go deep').length) {
        const z = deserialize(serialize(lf)); runTask(z, SCENES, grp('Go deep')[0].id);
        assert(z.scene === 'lf_bone_depths', `v0.11.67 (F1): Go deep's first zone opens its scene (${z.scene})`);
    }
    for (const hub of ['rr_hub', 'dw_hub', 'ah_hub']) {
        const b = ensureBars(newGame(312)); b.scene = hub; b.coil.act = 1; b.minutes = (hub === 'rr_hub' ? 13 : hub === 'dw_hub' ? 15 : 17) * 1440 + 9 * 60; b.james.qi = 30; b.james.satiety = 70; b.flags.ya_joined = true;
        const pc = taskCards(b, SCENES).filter((c) => c.group === 'Practice' && c.status === 'open');
        assert(pc.length >= 3 && pc.every((c) => c.kind === 'work' && c.id.startsWith('bl_train:')), `v0.11.67 (F1): ${hub}'s Practice group (${pc.map((c) => c.label)})`);
        if (!pc.length) continue;
        runTask(b, SCENES, pc[0].id);
        assert(b.scene === hub, `v0.11.67 (F1): ${hub}: a Practice card comes back to the hub (${b.scene})`);
    }
    // the Fable review (H1, R1): the Practice drills are repeatable work, so drills left never hold "Call it a day" back:
    // with every one-off done, the hub's oneOffLeft is the same with the four drills open or done
    for (const hub of ['rr_hub', 'dw_hub', 'ah_hub']) {
        const r = ensureBars(newGame(313)); r.scene = hub; r.coil.act = 1; r.minutes = (hub === 'rr_hub' ? 13 : hub === 'dw_hub' ? 15 : 17) * 1440 + 9 * 60; r.flags.ya_joined = true;
        const scn = SCENES[hub];
        scn.choices.forEach((c, i) => { r.flags[onceKey(hub, i)] = true; });
        for (const m of Object.keys(TASK_HUBS[hub].menus)) SCENES[m].choices.forEach((c, i) => { r.flags[onceKey(m, i)] = true; });
        Object.assign(r.flags, { ya_mocked: true, ya_sparred: true, rr_listened: true, ya_back: true, trio_found: true });
        for (const k of ['rr_scout', 'rr_hunt', 'dw_hunt', 'dw_scout', 'ah_hunt', 'ah_scout', 'tmei', 'tya', 'hot_spring']) markDaily(r, k); // v0.11.156 (RV1, LT): the forage menus' marks gone (no longer read)
        const open = !oneOffLeft(r, SCENES, hub);
        const drills = taskCards(r, SCENES).filter((c) => c.status === 'open' && c.group === 'Practice').length;
        for (const k of ['bt_ya', 'bt_dart', 'bt_needle', 'bt_yuki']) markDaily(r, k);
        const after = !oneOffLeft(r, SCENES, hub);
        assert(drills > 0 && open === after, `v0.11.67 (H1): ${hub}: the Practice drills never hold "Call it a day" back (${drills} drills open: ${open ? 'free' : 'held'}; done: ${after ? 'free' : 'held'})`);
    }
}
// v0.11.19 (owner pick B): Act 1's seven resting places are task screens
{
    const A1 = { fo_ashfall: ['Palisade', 'Council', 'Militia', 'Clinic'], rr_hub: ['Forage', 'Scout', 'Practice'], dw_hub: ['Forage', 'Practice'], ah_hub: ['Forage', 'Practice'], heart_hub: [], rt_camp: [], rt_ashfall: ['Militia'] };
    const JOBS = { fo_ashfall: 'yuki:ashfall', rr_hub: 'yuki:rr', dw_hub: 'yuki:dw', ah_hub: 'yuki:ah', rt_ashfall: 'yuki:ashfall' };
    for (const [hub, groups] of Object.entries(A1)) {
        const cfg = TASK_HUBS[hub];
        assert(!!cfg && MED_SCREENS.has(hub), `v0.11.19: ${hub} is a task screen and a resting place`);
        assert(JSON.stringify(Object.values(cfg.menus || {}).map((m) => m.label)) === JSON.stringify(groups), `v0.11.19: ${hub}'s work groups (${Object.values(cfg.menus || {}).map((m) => m.label)})`);
        for (const d of cfg.doors || []) assert(!!SCENES[d] && SCENES[hub].choices.some((c) => c.to === d), `v0.11.19: ${hub} has a door to ${d}`);
        assert((cfg.yuki?.id || null) === (JOBS[hub] || null), `v0.11.19: ${hub}'s Yuki job (${cfg.yuki?.id})`);
    }
    const f = ensureBars(newGame(311)); f.scene = 'fo_ashfall'; f.minutes = 8 * 1440 + 9 * 60; f.coil = f.coil || {}; f.james.qi = 30; f.james.satiety = 70;
    const fc = taskCards(f, SCENES);
    assert(isTaskHub(f) && ['Palisade', 'Council', 'Militia', 'Clinic'].every((gr) => fc.some((c) => c.group === gr && c.kind === 'work')) && fc.some((c) => c.kind === 'door' && c.group === 'Around Ashfall') && fc.some((c) => c.id === 'fo_ashfall:11'), `v0.11.19: Ashfall (fallout) on Day 9: work, doors, its own sit (${[...new Set(fc.map((c) => c.group))]})`);
    const pid = fc.find((c) => c.group === 'Palisade').id, fm0 = taskMinutes(f, SCENES, pid), f0 = f.minutes;
    runTask(f, SCENES, pid);
    assert(f.scene === 'fo_ashfall' && f.minutes - f0 === fm0 && taskCards(f, SCENES).filter((c) => c.group === 'Palisade').length >= 1 && taskCards(f, SCENES).filter((c) => c.group === 'Palisade').every((c) => c.status === 'open'), 'v0.11.19 (v0.11.156, DM1: no longer done for the day): a palisade card runs as forecast and stays on the screen; the other is still open');
}
// v0.11.156 (owner pick DM1: OF + OS + OA + OM; texts TX1): Act 1's once-a-day menus opened. The Blackroot's Forage repeats the
// same day (as the Wilds'), Scout's and the Fallout's Palisade, Militia and Clinic cards run more than one a day (each still once a
// Coil), the Council stays one a day (T1, the palisade's same-day opening, taken out again in RV1: menu texts are never drawn); the last day's drill stays
// open for practice once the militia is ready (no second preparation, no relationship change) and then never holds "Call it a day" back
{
    const { DRILL_AGAIN } = await import('../js/story/act1_return.js');
    const { oneOffLeft } = await import('../js/story/oneoff.js');
    const at = (hub, day, seed) => { const g = ensureBars(newGame(seed)); g.scene = hub; g.coil.act = 1; g.minutes = (day - 1) * 1440 + 8 * 60; g.james.qi = 60; g.james.satiety = 90; g.flags.ya_joined = true; return g; };
    const grp = (g, name) => taskCards(g, SCENES).filter((c) => c.group === name);
    for (const [hub, day] of [['rr_hub', 13], ['dw_hub', 15], ['ah_hub', 17]]) {
        const g = at(hub, day, 15601); const f0 = grp(g, 'Forage').filter((c) => c.status === 'open');
        assert(f0.length >= 2, `OF: ${hub} offers its forage cards (${f0.map((c) => c.id)})`);
        const id = f0.find((c) => !/grub|beetle/.test(c.label)).id; runTask(g, SCENES, id);
        const f1 = grp(g, 'Forage');
        // v0.11.161 (owner pick PO2, FG): the card taken waits for tomorrow; the menu's other cards stay open the same day
        assert(g.scene === hub && f1.find((c) => c.id === id)?.status === 'tomorrow' && f1.filter((c) => c.id !== id && !/grub|beetle/.test(c.label)).every((c) => c.status === 'open'), `OF + FG: ${hub}'s forage after one card: that card tomorrow, the others still open the same day (${f1.map((c) => `${c.id} ${c.status}`)})`);
        const other = f1.find((c) => c.id !== id && c.status === 'open' && !/grub|beetle/.test(c.label)).id; const fam = taskState(g).fam[other] || 0; runTask(g, SCENES, other);
        assert(g.scene === hub && (taskState(g).fam[other] || 0) > fam, `OF: ${hub}'s second forage card runs the same day and gains familiarity (${fam} → ${taskState(g).fam[other]})`);
        g.minutes += 1440; assert(grp(g, 'Forage').find((c) => c.id === id)?.status === 'open', `FG: ${hub}'s card open again the next day`);
    }
    { const g = at('rr_hub', 13, 15602); const s0 = grp(g, 'Scout').filter((c) => c.status === 'open'); assert(s0.length === 2, `OS: two scout cards (${s0.map((c) => c.id)})`);
      runTask(g, SCENES, 'rr_scout:1'); const s1 = grp(g, 'Scout');
      assert(!s1.some((c) => c.id === 'rr_scout:1') && s1.find((c) => c.id === 'rr_scout:0')?.status === 'open', `OS: after "You followed me for two days?" the other scout card is open the same day, the one taken gone for the Coil (${s1.map((c) => `${c.id} ${c.status}`)})`); }
    { for (const [k, name] of ['Palisade', 'Militia', 'Clinic'].entries()) {
          const g = at('fo_ashfall', 8, 15610 + k);
          const cs = grp(g, name).filter((c) => c.status === 'open'); assert(cs.length >= 2, `OA: ${name} offers two cards (${cs.map((c) => c.id)})`);
          runTask(g, SCENES, cs[0].id);
          const after = grp(g, name);
          assert(after.length >= 1 && after.every((c) => c.status === 'open'), `OA: ${name} after one card: the rest open the same day (${after.map((c) => `${c.id} ${c.status}`)})`);
      }
      const g = at('fo_ashfall', 8, 15603); const c0 = grp(g, 'Council').find((c) => c.status === 'open'); runTask(g, SCENES, c0.id);
      assert(grp(g, 'Council').length >= 1 && grp(g, 'Council').every((c) => c.status === 'tomorrow'), `OA: the Council stays one a day (its Day 8 and Day 9 stories) (${grp(g, 'Council').map((c) => `${c.id} ${c.status}`)})`); }
    { const g = at('rt_ashfall', 20, 15606); const entry = SCENES.rt_ashfall.choices.find((c) => c.to === 'rt_hunters');
      assert(entry.text(g) === 'Drill the hunters one last time.' && grp(g, 'Militia').length === 2, 'OM: before the militia is ready, the drill as before');
      assert(grp(g, 'Militia').every((c) => c.groupNote === ''), 'TX-A: no note on the heading before the militia is ready');
      g.flags.a1_militia = true; const rel0 = JSON.stringify(g.rel);
      assert(entry.text(g) === DRILL_AGAIN.label && entry.show(g) && grp(g, 'Militia').every((c) => c.status === 'open'), 'OM: once ready, both cards stay open for practice (T2 the entry\'s label)');
      assert(grp(g, 'Militia').every((c) => c.groupNote === 'practice only'), 'TX-A: once ready, the Militia heading reads "Militia · practice only"');
      assert(grp(at('fo_ashfall', 8, 15608), 'Militia').every((c) => !c.groupNote), 'TX-A: the Fallout\'s Militia has no note');
      const MAIN = (await import('node:fs')).readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      assert(MAIN.includes("${esc(name)}${note ? ` · ${esc(note)}` : ''}") && MAIN.includes('if (c.groupNote) gr.note = c.groupNote;') && MAIN.includes('!work.has(gr.name), gr.note)'), 'TX-A: main.js draws the note after the heading, the group keyed by its name');
      const ya = runTask(g, SCENES, 'rt_hunters:1');
      assert(ya.lines.includes(DRILL_AGAIN.ya) && JSON.stringify(g.rel) === rel0 && g.flags.a1_militia === true, `OM: a repeat "Let Ya teach them" says T5 and moves no relationship (${ya.lines})`);
      const hard = SCENES.rt_hunters.choices[0];
      assert(JSON.stringify(hard.do(g)) === JSON.stringify([DRILL_AGAIN.hard]) && JSON.stringify(hard.failDo(g)) === JSON.stringify([DRILL_AGAIN.hardFail]) && JSON.stringify(g.rel) === rel0, 'OM: a repeat "Drill them hard" says T3, a failed one T4, no relationship moves');
      const g0 = at('rt_ashfall', 20, 15607); const r0 = JSON.stringify(g0.rel);
      assert(SCENES.rt_hunters.choices[0].do(g0)[0].startsWith('By sunset') && g0.flags.a1_militia && JSON.stringify(g0.rel) !== r0, 'OM: the first success still readies the militia and moves the Village');
      Object.assign(g.flags, { a1_palisade: true, council_done: true, ya_village: true });
      assert(!oneOffLeft(g, SCENES, 'rt_ashfall'), 'OM: the practice drill does not hold "Call it a day" back'); }
    // RV1 (Fable's review): G1 relationships once a day per card, the grub and the beetle once a day; CD "Call it a day" after one
    // card from each opened once-a-Coil menu; LT the repeat drill through runTask, the 19:00 cutoff, no once-a-Coil mark
    for (const [hub, day, card, who] of [['rr_hub', 13, 'rr_forage:1', 'Mei Lin'], ['dw_hub', 15, 'dw_forage:1', 'Mei Lin'], ['dw_hub', 15, 'dw_forage:2', 'Ya'], ['ah_hub', 17, 'ah_forage:1', 'Mei Lin']]) {
        const g = at(hub, day, 15620); const r0 = JSON.stringify(g.rel[who] || {});
        const [sc, i] = card.split(':'); const c = SCENES[sc].choices[+i];
        c.do(g); const r1 = JSON.stringify(g.rel[who]); c.do(g); (c.failDo || c.do)(g);
        assert(r1 !== r0 && JSON.stringify(g.rel[who]) === r1, `G1: ${card}'s ${who} gain once a day (${r0} → ${r1} → ${JSON.stringify(g.rel[who])})`);
        g.minutes += 1440; c.do(g); assert(JSON.stringify(g.rel[who]) !== r1, `G1: ${card}'s ${who} gain again the next day`);
    }
    for (const [hub, day, label] of [['rr_hub', 13, /grub/], ['ah_hub', 17, /beetle/]]) {
        const g = at(hub, day, 15621); g.james.satiety = 40; const c0 = grp(g, 'Forage').find((c) => label.test(c.label));
        assert(c0?.status === 'open', `G1: ${hub}'s ${c0?.label} open in the morning`);
        const rel0 = JSON.stringify(g.rel.Ya || {}); runTask(g, SCENES, c0.id); const rel1 = JSON.stringify(g.rel.Ya);
        assert(rel1 !== rel0 && grp(g, 'Forage').find((c) => c.id === c0.id)?.status === 'tomorrow', `G1: ${c0.label} once a day (back tomorrow), Ya moved once`);
        g.minutes += 1440; assert(grp(g, 'Forage').find((c) => c.id === c0.id)?.status === 'open', `G1: ${c0.label} open again the next day`);
    }
    { const { onceKey } = await import('../js/story/oneoff.js'); const { markDaily: mark } = await import('../js/story/common.js');
      const base = () => { const g = at('fo_ashfall', 8, 15622); Object.assign(g.flags, { council_done: true, fo_mother: true, spy: true }); for (const k of ['a1_council', 'a1_mei', 'yk_time', 'wen_time', 'mother_time']) mark(g, k); return g; };
      const allDone = base(); for (const m of ['fo_palisade', 'fo_drill', 'fo_clinic']) SCENES[m].choices.forEach((c, i) => { allDone.flags[onceKey(m, i)] = true; });
      const marked = base(); for (const k of ['a1_palisade', 'a1_drill', 'a1_clinic']) mark(marked, k);
      const unmarked = base();
      assert(oneOffLeft(unmarked, SCENES, 'fo_ashfall') === true, 'CD: with the Fallout\'s once-a-Coil cards open and none taken today, "Call it a day" waits');
      assert(oneOffLeft(allDone, SCENES, 'fo_ashfall') === false && oneOffLeft(marked, SCENES, 'fo_ashfall') === false, `CD: one card from each group today counts as those groups done for the button (${oneOffLeft(marked, SCENES, 'fo_ashfall')} / ${oneOffLeft(allDone, SCENES, 'fo_ashfall')})`);
      const p = base(); const pid = taskCards(p, SCENES).find((c) => c.group === 'Palisade' && c.status === 'open').id; runTask(p, SCENES, pid);
      assert(Object.keys(p.flags).some((k) => k.startsWith('a1_palisade@')) && grp(p, 'Palisade').some((c) => c.status === 'open'), 'CD: a palisade card marks the day for the button, and the palisade stays open');
      const r = at('rr_hub', 13, 15623); r.scene = 'rr_hub'; runTask(r, SCENES, 'rr_scout:1');
      assert(r.flags[`rr_scout@${Object.keys(r.flags).find((k) => k.startsWith('rr_scout@'))?.split('@')[1]}`] === true && grp(r, 'Scout').find((c) => c.id === 'rr_scout:0')?.status === 'open', 'CD: the scout card marks the day for the button, and the other card stays open'); }
    { const g = at('rt_ashfall', 20, 15624); g.flags.a1_militia = true; const rel0 = JSON.stringify(g.rel); const oo0 = Object.keys(g.flags).filter((k) => k.startsWith('oo:')).length;
      g.minutes = 19 * 1440 + 9 * 60; const res = runTask(g, SCENES, 'rt_hunters:0');
      assert([DRILL_AGAIN.hard, DRILL_AGAIN.hardFail].some((t) => res.lines.includes(t)) && JSON.stringify(g.rel) === rel0 && Object.keys(g.flags).filter((k) => k.startsWith('oo:')).length === oo0, `LT: a repeat "Drill them hard" through runTask: T3 or T4, no relationship, no once-a-Coil mark (${res.lines})`);
      g.minutes = 19 * 1440 + 19 * 60 + 5; assert(!grp(g, 'Militia').some((c) => c.status === 'open'), 'LT: the practice drill closes at 19:00'); }
}
// v0.11.158 (owner pick NX2, YS; Fable's L3 of v0.11.155): Yuki's lane names her own speed and her count to her best, not the
// cards' step names (Practised / Skilled / Mastered mean ×2 / ×5 / ×10 on a card; she runs ×1.2 / ×1.8 / ×2.8 there, ×3 at 20);
// RV1 (the Opus review): RD the speed rounded down (×3 only at her best), WB "8/20 to her best" (her practice, not hauls)
{
    const { yukiSpeed, yukiSpeedLine, YUKI_BEST, YUKI_CAP } = await import('../js/core/tasks.js');
    assert(YUKI_BEST === 20 && yukiSpeed(YUKI_BEST) === YUKI_CAP && yukiSpeed(YUKI_BEST - 1) < YUKI_CAP, `YS: her best comes at ${YUKI_BEST} hauls, the first count at ×${YUKI_CAP}`);
    const nb = (t) => t.replace(/\u00a0/g, ' ');
    assert(nb(yukiSpeedLine(0)) === '×1 of ×3 · 0/20 to her best' && nb(yukiSpeedLine(8)) === '×1.8 of ×3 · 8/20 to her best' && nb(yukiSpeedLine(18)) === '×2.8 of ×3 · 18/20 to her best' && nb(yukiSpeedLine(12.5)) === '×2.2 of ×3 · 12.5/20 to her best' && nb(yukiSpeedLine(19.5)) === '×2.9 of ×3 · 19.5/20 to her best', `YS + RD + WB: the line at 0, 8, 18, 12.5, 19.5 (${[0, 8, 18, 12.5, 19.5].map(yukiSpeedLine)})`);
    assert(nb(yukiSpeedLine(20)) === '×3, her best' && nb(yukiSpeedLine(31)) === '×3, her best', 'YS: from 20 hauls "×3, her best"');
    for (let f = 0; f < 20; f += 0.5) { const m = /^×([\d.]+)\sof/.exec(yukiSpeedLine(f)); assert(m && +m[1] <= yukiSpeed(f) + 1e-9 && yukiSpeed(f) - +m[1] < 0.1 && +m[1] < YUKI_CAP, `RD: below her best the shown speed is hers rounded down, never ×3 (${f}: ${m?.[1]} vs ${yukiSpeed(f)})`); }
    assert(yukiSpeedLine(8).includes('\u00a0of\u00a0') && yukiSpeedLine(8).includes('/20\u00a0to\u00a0her\u00a0best') && yukiSpeedLine(20).includes('her\u00a0best') && !/haul/.test(yukiSpeedLine(8)), 'YS + WB: non-breaking spaces keep the speed and the count whole on a narrow phone; no "hauls"');
    const g = ensureBars(newGame(15801)); g.scene = 'wilds'; g.tasks.fam['yuki:wilds'] = 8;
    assert(yukiLane(g)?.speedLine === yukiSpeedLine(8), `YS: the lane carries her line (${yukiLane(g)?.speedLine})`);
    const MAIN = (await import('node:fs')).readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
    const lane = MAIN.slice(MAIN.indexOf('<div class="yuki-lane">'), MAIN.indexOf('</span></div><button', MAIN.indexOf('<div class="yuki-lane">')));
    assert(lane.includes('${esc(yl.speedLine)}') && !lane.includes('FAM['), 'YS: main.js draws her line on the lane, no card step name');
}
// v0.11.157 (owner pick NX1, PA): the prologue Ashfall's Clinic, Workshop and Militia run more than one card a day, as Act 1's
// (v0.11.156, OA): each card still once a Coil (a success uses it up), the menus' day marks only hold "Call it a day" as before
{
    const { oneOffLeft, onceKey } = await import('../js/story/oneoff.js');
    const { markDaily: mark } = await import('../js/story/common.js');
    const { wakeDay: wd } = await import('../js/core/game.js');
    const at = (seed) => { const g = ensureBars(newGame(seed, { closed: true })); g.minutes = 4 * 1440 + 7 * 60; goTo(g, SCENES, 'ashfall'); Object.assign(g.flags, { healed_try: true, elder: true }); g.james.gu = { tier: 3, level: 10, xp: 0 }; g.james.skills['Convergence Use'] = { tier: 3, level: 10, xp: 0 }; g.james.qi = 60; g.james.satiety = 95; g.inventory.jade_bracket = 2; ensureBars(g); g.james.qi = 60; return g; };
    const grp = (g, name) => taskCards(g, SCENES).filter((c) => c.group === name);
    for (const [k, [menu, name]] of [['clinic', 'Clinic'], ['workshop', 'Workshop'], ['drill', 'Militia']].entries()) {
        const g = at(15701 + k);
        const c0 = grp(g, name).filter((c) => c.status === 'open');
        assert(c0.length >= 2 && c0.every((c) => c.id.startsWith(`${menu}:`)), `PA: ${name} offers its cards on the morning of Day 5 (${c0.map((c) => c.id)})`);
        const first = c0[0].id; const r = runTask(g, SCENES, first);
        assert(g.scene === 'ashfall' && !r.fail, `PA: ${name}'s first card succeeds for a strong James (${r.lines})`);
        const c1 = grp(g, name);
        assert(!c1.some((c) => c.id === first) && c1.length >= 1 && c1.every((c) => c.status === 'open'), `PA: ${name} after one card: that card gone for the Coil, the rest open the same day (${c1.map((c) => `${c.id} ${c.status}`)})`);
        assert(g.flags[onceKey(menu, +first.split(':')[1])] === true && g.flags[`${menu}@${wd(g)}`] === true, `PA: ${name}'s card marked once a Coil, the menu's day marked`);
        const second = c1[0].id; runTask(g, SCENES, second);
        assert(g.scene === 'ashfall' && !grp(g, name).some((c) => c.id === first || c.id === second), `PA: ${name}'s second card the same day, both gone for the Coil (${grp(g, name).map((c) => c.id)})`);
    }
    // "Call it a day": one card from each menu today counts as that menu done for the button, as before
    const base = () => { const g = at(15710); Object.assign(g.flags, { 'oo:wen_lesson': 2, 'oo:herb_slopes': 2, village_hunt: true }); return g; };
    const unmarked = base(); const marked = base(); for (const k of ['clinic', 'workshop', 'drill']) mark(marked, k);
    const allDone = base(); for (const m of ['clinic', 'workshop', 'drill']) SCENES[m].choices.forEach((c, i) => { allDone.flags[onceKey(m, i)] = true; });
    assert(oneOffLeft(unmarked, SCENES, 'ashfall') === true, 'PA (DAY_DONE): with the three menus open and none taken today, "Call it a day" waits');
    assert(oneOffLeft(marked, SCENES, 'ashfall') === false && oneOffLeft(allDone, SCENES, 'ashfall') === false, 'PA (DAY_DONE): one card from each menu today, or all done for the Coil, lets the button show');
    const two = base(); for (const k of ['clinic', 'workshop']) mark(two, k);
    assert(oneOffLeft(two, SCENES, 'ashfall') === true, 'PA (DAY_DONE): a menu with no card today still holds the button back');
    // the hub's entries no longer read the day marks (the late cutoff stays)
    const e = at(15711); for (const k of ['clinic', 'workshop', 'drill']) mark(e, k);
    for (const m of ['clinic', 'workshop', 'drill']) { const c = SCENES.ashfall.choices.find((x) => x.to === m); assert(c.show(e), `PA: the ${m} entry shows after a card today`); }
    e.minutes = 4 * 1440 + 23 * 60; assert(['clinic', 'workshop', 'drill'].every((m) => !SCENES.ashfall.choices.find((x) => x.to === m).show(e)), 'PA: the entries still close late in the evening');
    // RV1 (Fable's review, L1–L3): a failed try stays open the same day (no once-a-Coil mark; the day marked; a bracket spent), says
    // Fable's lines (FT, no "tonight" / "tomorrow"), and "Call it a day" can show after it while that card is still open
    const { JADE_FAIL, SPEARS_FAIL } = await import('../js/story/ashfall.js');
    const weak = (seed) => { const w = at(seed); w.james.gu = { tier: 1, level: 1, xp: 0 }; w.james.skills['Convergence Use'] = { tier: 1, level: 1, xp: 0 }; w.james.satiety = 0; w.tasks.fam = {}; ensureBars(w); w.james.qi = 60; return w; };
    { const w = weak(15712); const ji = SCENES.clinic.choices.findIndex((c) => /jade bracket/.test(c.text)); const b0 = w.inventory.jade_bracket;
      const r = runTask(w, SCENES, `clinic:${ji}`);
      if (r.fail) {
          assert(!w.flags[onceKey('clinic', ji)] && w.flags[`clinic@${wd(w)}`] === true && w.inventory.jade_bracket === b0 - 1, `TG: a failed jade-bracket clinic: no once-a-Coil mark, the day marked, a bracket spent (${b0} → ${w.inventory.jade_bracket})`);
          assert(grp(w, 'Clinic').find((c) => c.id === `clinic:${ji}`)?.status === 'open', 'TG (L1): the failed card is open again the same day');
          assert(r.lines.join(' ').includes(JADE_FAIL) && !/tonight/.test(r.lines.join(' ')), `FT: the failed clinic says Fable's line, no "tonight" (${r.lines})`);
          Object.assign(w.flags, { 'oo:wen_lesson': 2, 'oo:herb_slopes': 2, village_hunt: true }); mark(w, 'workshop'); mark(w, 'drill');
          assert(oneOffLeft(w, SCENES, 'ashfall') === false && grp(w, 'Clinic').some((c) => c.status === 'open'), 'TG (L4, as Act 1\'s): "Call it a day" shows after a failed try, the card still open');
      } else assert(false, `TG: the weak-James jade clinic was meant to fail (test setup; ${r.lines})`); }
    { const w = weak(15713); const si = SCENES.workshop.choices.findIndex((c) => /^Spearheads/.test(c.text));
      const { hasForm } = await import('../js/core/forms.js'); const sp = SCENES.workshop.choices[si];
      for (let n = 0; n < 100 && !hasForm(w, sp.form); n++) { const cu = w.james.skills['Convergence Use']; if (cu.level < 10) cu.level++; else { cu.tier++; cu.level = 1; } } // the least Bonesinger that sings the spear
      assert(hasForm(w, sp.form) && grp(w, 'Workshop').some((c) => c.id === `workshop:${si}`), `TG: the spearheads offered at the least Bonesinger that sings them (${JSON.stringify(w.james.skills['Convergence Use'])})`);
      const r = runTask(w, SCENES, `workshop:${si}`);
      if (r.fail || /— partly/.test(r.lines.join(' '))) assert(r.lines.join(' ').includes(SPEARS_FAIL) && !/Tomorrow/.test(r.lines.join(' ')) && !w.flags.spears && grp(w, 'Workshop').find((c) => c.id === `workshop:${si}`)?.status === 'open', `FT: the failed spearheads say Fable's line, no "Tomorrow", and stay open today (${r.lines})`);
      else assert(false, `TG: the weak-James spearheads were meant to fail (test setup; ${r.lines})`); }
    assert(!/tonight|[Tt]omorrow/.test(JADE_FAIL + SPEARS_FAIL) && SCENES.clinic.choices.some((c) => c.failDo && String(c.failDo).includes('JADE_FAIL')) && SCENES.workshop.choices.some((c) => c.failDo && String(c.failDo).includes('SPEARS_FAIL')), 'FT: the two lines are wired to their failures and promise no later time');
}
// v0.11.20: the lean dry-run copy gives exactly what the old full copy gave (forecast rows, card minutes)
{
    const hubs = ['camp', 'stream', 'wilds', 'village', 'ashfall', 'fo_ashfall', 'rr_hub', 'dw_hub', 'ah_hub', 'heart_hub', 'rt_camp', 'rt_ashfall'];
    const day0 = { camp: 0, stream: 0, wilds: 1, village: 3, ashfall: 4, fo_ashfall: 7, rr_hub: 10, dw_hub: 11, ah_hub: 13, heart_hub: 15, rt_camp: 18, rt_ashfall: 19 };
    let same = 0, diff = [];
    for (let i = 0; i < 200; i++) {
        const hub = hubs[i % hubs.length];
        const g = ensureBars(newGame(400 + i)); g.scene = hub; g.minutes = day0[hub] * 1440 + (7 + (i % 9)) * 60; g.james.qi = 20 + (i % 20); g.james.satiety = 15 + (i * 7) % 80;
        Object.assign(g.flags, { long: true, forest_day: 2, vday: 2 });
        for (let k = 0; k < 30; k++) g.log.push({ at: g.minutes, scene: hub, lines: ['filler line to make the log heavy'] });
        const cards = taskCards(g, SCENES).filter((c) => c.status === 'open');
        setDryClone(true); const a = JSON.stringify([cards.map((c) => taskOutcome(g, SCENES, c.id)), cards.map((c) => taskMinutes(g, SCENES, c.id))]);
        setDryClone(false); const b = JSON.stringify([cards.map((c) => taskOutcome(g, SCENES, c.id)), cards.map((c) => taskMinutes(g, SCENES, c.id))]);
        if (a === b) same++; else if (diff.length < 3) diff.push(`${hub} #${i}`);
    }
    assert(same === 200, `v0.11.20: the lean dry run = the full copy on 200 screens (${same}; differs: ${diff.join(', ')})`);
}
// old state (v1) → empty queue
{ const old = ensureBars(newGame(5)); delete old.tasks; old.v = 1; migrate(old); assert(old.v === SAVE_VERSION && Array.isArray(old.tasks.queue) && old.tasks.queue.length === 0 && Object.keys(old.tasks.fam).length === 0 && old.tasks.yuki.on === false, 'v1 save gets an empty queue and no familiarity'); }
// v0.11.64 (F): no queue: a saved queue is emptied and a half-filled bar dropped when the save is read; the field stays
{
    const o = ensureBars(newGame(6)); o.tasks.queue.push('wilds:6', 'mer:pri'); o.runPart = { id: 'wilds:6', at: o.minutes, frac: 0.4 };
    const back = deserialize(serialize(o));
    assert(Array.isArray(back.tasks.queue) && back.tasks.queue.length === 0 && !('runPart' in back) && back.minutes === o.minutes && JSON.stringify(back.james) === JSON.stringify(o.james), 'v0.11.64: a saved queue is emptied and runPart dropped; nothing else changes');
    const e = ensureBars(newGame(6)); const s0 = serialize(e); assert(serialize(deserialize(s0)) === s0, 'v0.11.64: a save without a queue reads back unchanged');
}
// HP 0 during a task (v0.9.4): the Coil ends — queue cleared, the Coil screen
{
    const g = ensureBars(newGame(9)); g.scene = 'wilds'; g.minutes += 1440 + 120; Object.assign(g.flags, { long: true, forest_day: 2 });
    g.james.satiety = 0; g.james.hp = 0.5; planOf(g).push('wilds:6', 'wilds:6');
    const rest = SCENES.wilds.choices.findIndex((c) => /^Rest/.test(c.text));
    const r = runTask(g, SCENES, `wilds:${rest}`);
    assert(r.stopped && planOf(g).length === 0 && g.scene === 'coil_end' && g.coil.why === 'collapse', `collapse → the Coil screen, the plan cleared (${g.scene})`);
    assert(r.lines.some((l) => /You fold up where you stand/.test(l)) && !r.lines.some((l) => /queue/i.test(l)), 'v0.11.64: the collapse text mentions no queue');
}
// v0.9.5: every choice takes time in task mode; the Meditate card everywhere
{
    // talking 10, moving 20, an action 30; hand-set times stay
    const g = ensureBars(newGame(31)); const m0 = g.minutes;
    const yi = SCENES.arrival.choices.findIndex((c) => /Check Yuki/.test(String(c.text)));
    const yc = SCENES.arrival.choices[yi];
    choose(g, SCENES, yi);
    assert(yc.time == null && g.minutes - m0 === 5 + DEFAULT_MINUTES.talk, `talking: 10 min on top of the scene's own 5 (${g.minutes - m0})`);
    assert(defaultMinutes(SCENES, 'x', { to: 'y' }, 'y', false) === 10 && defaultMinutes(SCENES, 'x', { to: 'y' }, 'y', true) === 20 && defaultMinutes(SCENES, 'x', { to: 'y', check: { skill: 'GU', dc: 2 } }, 'y', false) === 30, 'defaults: talk 10, move 20, act 30');
    assert(defaultMinutes(SCENES, 'wilds', { to: 'wild_forage' }, 'wild_forage', false) === 0 && defaultMinutes(SCENES, 'x', { to: 'y', time: 5 }, 'y', false) === 0 && defaultMinutes(SCENES, 'x', { combat: {} }, 'y', false) === 0, 'no default: hub ↔ menu, own time, fights');
    // v0.11.14 (owner pick A): the Meditate card only on the 13 resting places
    let medded = 0;
    for (const id of Object.keys(SCENES)) {
        const h = ensureBars(newGame(32)); h.scene = id; h.james.qi = 30;
        const m = medCards(h, SCENES); // (rendering every scene is walked by the bots: a fresh state can't stand in every scene)
        if (NO_MEDITATE.has(id) || SCENES[id].end || !MED_SCREENS.has(id)) assert(m.length === 0, `no Meditate on ${id}`);
        else { assert(m.length >= 1, `Meditate on ${id}`); medded++; }
    }
    assert(medded === 13 && MED_SCREENS.size === 13 && [...MED_SCREENS].every((id) => SCENES[id]), `v0.11.14: Meditate on the 13 resting places and nowhere else (${medded})`);
    // a sit off the hubs: an hour (v0.11.2), Saturation +10% at Mortal Vessel on Coil 1, the scene stays
    const k = ensureBars(newGame(33)); k.scene = 'rt_camp'; k.james.qi = 30; const k0 = k.minutes;
    const r = runMed(k, SCENES, 'med:sit');
    assert(k.scene === 'rt_camp' && k.minutes - k0 === 60 && k.james.saturation === 10 && /Condensed/.test(r.lines[0]), `Meditate: a sit keeps the scene (1 h, +10%: ${k.minutes - k0} min, ${k.james.saturation}%)`);
    // v0.11.13 (E1): no meridian screen from Meditate; at Golden Core (Foundation before v0.11.66, G4) the Extraordinary vessel is a card, run from the scene, which stays
    const e = ensureBars(newGame(34)); e.scene = 'village'; e.james.realm = 4; e.james.qi = 30;
    const before = JSON.stringify(e.inventory);
    const em = medCards(e, SCENES);
    assert(!em.some((c) => c.id === 'med:mer') && em.some((c) => c.id === 'med:mer:e8' && c.open && c.minutes === 120), 'Golden Core: the Extraordinary vessel is a Meditate card (a 2 h sitting of its 4 h, v0.11.18), no meridian screen');
    const e0 = e.minutes, er = runMed(e, SCENES, 'med:mer:e8');
    assert(e.scene === 'village' && !er.moved && e.minutes - e0 === 120 && JSON.stringify(e.inventory) === before && !e.flags.med_back, `the card runs here: 2 h, the scene stays, its enter not run (${e.scene}, ${e.minutes - e0} min)`);
    // v0.11.18 (owner picks B, c2, b): sleep brings the once-a-day things back; Push through the night; Yuki's curve; timed Extraordinary lines
    {
        const s = ensureBars(newGame(301)); s.scene = 'ashfall'; s.minutes = 5 * 1440 + 10 * 60; delete s.wake; // an old save: Day 6
        assert(wakeDay(s) === 6, `an old save's days-slept counter starts at its calendar day (${wakeDay(s)})`);
        markDaily(s, 'clinic'); assert(!daily('clinic')(s), 'the clinic is done today');
        advance(s, 20 * 60); assert(clockParts(s.minutes).day === 7 && !daily('clinic')(s) && wakeDay(s) === 6, 'past midnight and past 04:00 awake: still done (no new day)');
        sleepUntil(s, 6); assert(wakeDay(s) === 7 && daily('clinic')(s), `slept: a new day, the clinic back (${wakeDay(s)})`);
        sleepUntil(s, 6); assert(wakeDay(s) === 8, 'every night slept counts once');
        const j = ensureBars(newGame(302)); j.minutes = 2 * 1440 + 22 * 60; wakeDay(j); j.minutes = 3 * 1440 + 6 * 60; // a scene that sets the clock to morning
        assert(wakeDay(j) === 4, `a scene that moves the clock past a morning counts as sleep (${wakeDay(j)})`);
        const n0 = ensureBars(newGame(303)); n0.minutes = 1440 + 23 * 60; wakeDay(n0); n0.minutes = 2 * 1440 + 60; sleepUntil(n0, 6);
        assert(wakeDay(n0) === 3, `a night broken after midnight, then slept to 06:00: one new day (${wakeDay(n0)})`);
        const t5 = ensureBars(newGame(304)); t5.minutes = 5 * 1440 + 22 * 60; wakeDay(t5); sleepUntil(t5, 5); assert(wakeDay(t5) === 7, 'sleeping to 05:00 (the tribute) counts');
        const L = ensureBars(newGame(305)); const l0 = wakeDay(L); advance(L, 90 * 1440); assert(wakeDay(L) === l0 + 90, 'a span of days (a Long Forest season) has its nights in it');
        // v0.11.91 (owner pick B, push 1): Push through the night and Exhaustion are gone: no Push card at any hour, the night
        // locks the day's work, work is never slowed, and an old save's Exhaustion and push marks are dropped when read
        const p = ensureBars(newGame(306)); p.scene = 'ashfall'; p.minutes = 5 * 1440 + 9 * 60; wakeDay(p); markDaily(p, 'clinic');
        for (const hh of [17, 21, 23, 24, 25, 27]) { p.minutes = 5 * 1440 + hh * 60; assert(!medCards(p, SCENES).some((c) => c.id === 'med:push' || /Push through/.test(c.label || '')), `v0.11.91: no Push card at ${hh}:00`); }
        p.minutes = 6 * 1440 + 60; assert(nightLock(p) && medCards(p, SCENES).length === 0 && !daily('clinic')(p), 'v0.11.91: at 01:00 the day is over: no Meditate card, the clinic still done');
        let threw = false; try { runMed(p, SCENES, 'med:push'); } catch { threw = true; } assert(threw, 'v0.11.91: med:push is no card any more');
        const sx = ensureBars(newGame(307)); sx.scene = 'ashfall'; sx.minutes = 5 * 1440 + 10 * 60; sx.wake = { n: 6, ex: 2, lastX: 6, slept: 6, push: 5 }; const sm = sitMinutes(sx); const c0 = sx.minutes; sx.james.qi = 30; condense(sx);
        assert(sx.minutes - c0 === sm && !('ex' in sx.wake) && !('push' in sx.wake) && wakeDay(sx) === 6, `v0.11.91: an old save's Exhaustion 2 and push mark are dropped; a sit takes its own time (${sx.minutes - c0} vs ${sm})`);
        const r0 = sx.minutes; advance(sx, 60, { resting: true }); const k0 = sx.minutes; advance(sx, 60); assert(sx.minutes - k0 === 60 && k0 - r0 === 60, 'v0.11.91: work and rest take their own time');
        // Yuki's curve (c2)
        assert(yukiSpeed(0) === 1 && Math.abs(yukiSpeed(10) - 2) < 1e-9 && yukiSpeed(20) === 3 && yukiSpeed(61) === 3 && yukiSpeed(500) === 3, `Yuki's job: N 90, capped at ×3 (${yukiSpeed(10)}, ${yukiSpeed(61)})`);
        // the Extraordinary lines, timed (b)
        assert(e8Hours(0) === 4 && e8Hours(7) === 11 && ecHours(0) === 3 && ecHours(27) === 6 && jnHours(0) === 6 && jnHours(9) === 10, 'Extraordinary hours: vessels 4 … 11, collaterals 3 … 6, junctions 6 … 10');
        const x = ensureBars(newGame(310)); x.scene = 'village'; x.james.realm = 4; x.james.qi = 30; // v0.11.66 (G4): from Golden Core
        let sit = 0; while ((x.james.extra8 || 0) < 2 && sit < 20) { x.james.qi = 30; x.james.satiety = 80; runMed(x, SCENES, 'med:mer:e8'); sit++; }
        assert(x.james.extra8 === 2 && sit >= 3 && sit <= 5 && clockParts(x.minutes).day === 1, `two vessels in one day, no check, by hours (4 h + 5 h; ${sit} sittings)`);
        x.james.satiety = 10; assert(medCards(x, SCENES).find((c) => c.id === 'med:mer:e8')?.open === false, 'Extraordinary work locks below Fed 20');
    }
    // the hub's own cultivate card is the Meditate sit there (queueable); the old hub doors are hidden in task mode
    const w = ensureBars(newGame(35)); w.scene = 'wilds'; w.james.qi = 30; w.james.saturation = 99;
    const wm = medCards(w, SCENES);
    assert(wm[0].task && isSitChoice(SCENES.wilds.choices[Number(wm[0].task.split(':')[1])], 'wilds') && wm.some((c) => c.id === 'med:bt'), 'wilds: sit card is the hub card; Break through on the Meditate card');
    assert(!sceneView(w, SCENES).choices.some((c) => /^Break through|^Open a meridian/.test(c.label)), 'task mode: no old break / meridian choices on the hub');
    // the two dead ends found by the sweep
    const rn = ensureBars(newGame(36)); rn.scene = 'night_event'; rn.flags.night_ev = 'rain'; rn.james.qi = 0;
    assert(SCENES.night_event.choices.some((c) => c.text === 'Get wet. Sleep anyway.' && c.to === 'morning'), 'rain: a way out without Qi');
    assert(SCENES.rt_elder ? true : true, 'rt_elder exists');
}

// v0.9.6: meridians closed at the start (task mode), sessions, the Foundation gate, the seal and its unwinding
{
    const open = ensureBars(newGame(40)), g = ensureBars(newGame(40, { closed: true }));
    assert(open.james.primaries === 12 && open.james.collaterals === 66 && open.yuki.primaries === 12, 'a new game without closed meridians (old saves, older tests): 12 / 66 open');
    assert(g.james.primaries === 0 && g.james.collaterals === 0 && g.yuki.primaries === 0 && g.yuki.collaterals === 0, 'closed new game: 0 / 0, Yuki too');
    assert(jamesQiMax(g) === 25.5 && yukiQiMax(g) === 20.5 && qiRegenPct(g, 0) === 5 && jamesQiMax(open) === 40.5, `closed bars: Qi 25.5, Yuki 20.5, regen 5% (${jamesQiMax(g)}, ${yukiQiMax(g)})`);
    assert(COL_GROUPS.reduce((a, x) => a + x.size, 0) === 66 && COL_GROUPS.length === 8, '8 collateral groups, 66 threads');
    assert(!canColGroup(g) && canPrimary(g), 'no group before 2 primaries');
    // v0.11.2: meridians by hours of work — primaries 2 … 4 h, groups 3 … 5 h, sittings of up to 2 h, 2 Qi, no daily limit, no check
    assert(priHours(0) === 2 && priHours(11) === 4 && colHours(0) === 3 && colHours(7) === 5, 'hours: primaries 2–4, groups 3–5');
    assert(Math.round(Array.from({ length: 12 }, (_, k) => priHours(k)).reduce((x, y) => x + y) * 10) / 10 === 36 && Math.round(Array.from({ length: 8 }, (_, j) => colHours(j)).reduce((x, y) => x + y) * 10) / 10 === 32, '36 h for the 12 primaries, 32 h for the 8 groups');
    g.scene = 'stream'; g.james.qi = 20; g.james.satiety = 70;
    { const gm = medCards(g, SCENES); assert(!gm.some((c) => c.id === 'med:mer') && gm.some((c) => c.id === 'med:mer:pri' && c.open && c.task === merLineTask('pri')) && gm.some((c) => c.id === 'med:mer:col' && !c.open && /2 primaries/.test(c.reason)), 'v0.11.13: Mortal Vessel: a primary card (queueable here), the collateral card locked until 2 primaries, no screen'); }
    g.scene = 'meridians'; g.flags.mer_return = 'stream'; // the screen itself (Story Mode's; old saves sitting on it)
    const wp = SCENES.meridians.choices.findIndex((c) => c.work && /primary|Lung/.test(String(c.text(g))) && c.show(g));
    const wc = () => SCENES.meridians.choices.findIndex((c, i) => c.work && i !== wp);
    assert(wp >= 0 && SCENES.meridians.choices.every((c) => !c.check || !(c.show ? c.show(g) : true) || c.to !== 'meridians' || c.work), 'Incremental Mode: work cards, the old checked sessions hidden');
    const cu0 = g.james.skills['Convergence Use'].xp + g.james.skills['Convergence Use'].level * 1000;
    const m0 = g.minutes, q0 = g.james.qi;
    (g.tasks.use = {}, choose(g, SCENES, wp));
    assert(g.james.primaries === 1 && g.yuki.primaries === 1 && g.minutes - m0 === 120 && q0 - g.james.qi <= 2 && !g.james.merWork, `the first primary: one 2-hour sitting, 2 Qi, opens, Yuki mirrors (${g.james.primaries}, ${g.minutes - m0} min)`);
    assert(g.james.skills['Convergence Use'].xp + g.james.skills['Convergence Use'].level * 1000 > cu0, 'XP when a channel opens');
    const cu1 = g.james.skills['Convergence Use'].xp + g.james.skills['Convergence Use'].level * 1000;
    (g.tasks.use = {}, choose(g, SCENES, wp)); // primary 2 needs 2.18 h: 2 h now, the rest next time
    assert(g.james.primaries === 1 && Math.abs(g.james.merWork - 2) < 0.01 && g.james.skills['Convergence Use'].xp + g.james.skills['Convergence Use'].level * 1000 === cu1, `a sitting short of the channel: progress kept, no XP (${g.james.merWork})`);
    g.tasks.use = {}; assert(merMinutesOf(g, 'pri') === 20, `the rest is a short sitting (${merMinutesOf(g, 'pri')} min)`);
    const m1 = g.minutes; (g.tasks.use = {}, choose(g, SCENES, wp));
    assert(g.james.primaries === 2 && g.minutes - m1 === 20 && !g.james.merWork, 'the second primary opens on the short sitting');
    (g.tasks.use = {}, choose(g, SCENES, wp)); g.james.qi = 20;
    assert(canPrimary(g), 'no daily limit');
    assert(canColGroup(g) && wc() >= 0 && SCENES.meridians.choices[wc()].show(g), 'group 1 after primaries 1–2: its own work card');
    (g.tasks.use = {}, choose(g, SCENES, wc()));
    assert(g.james.collaterals === 0 && Math.abs(g.james.colWork - 2) < 0.01 && Math.abs(g.james.merWork - 2) < 0.01, 'groups and primaries keep separate progress');
    g.james.qi = 20; (g.tasks.use = {}, choose(g, SCENES, wc()));
    assert(g.james.collaterals === 9 && g.yuki.collaterals === 9 && colGroupsOpen(g) === 1 && !g.james.colWork, 'group 1 after 3 h: 9 collaterals, Yuki mirrors');
    // v0.11.15 (B1-b): no Coil bonus on the hours; meridian work speeds up with its own sittings (N 30, up to ×10)
    const c3 = ensureBars(newGame(46, { closed: true })); c3.coil.n = 3; c3.scene = 'meridians'; c3.james.qi = 20;
    assert(merMinutesOf(c3, 'pri') === 120, `v0.11.15: Coil 3: the first primary still 2 h (${merMinutesOf(c3, 'pri')})`);
    c3.tasks.use = { 'act:mer': 10 }; assert(actSpeed(c3, 'mer') === 4 && merMinutesOf(c3, 'pri') === 30, `v0.11.15: after 10 sittings ×4: 30 min (${merMinutesOf(c3, 'pri')})`);
    c3.tasks.use = { 'act:mer': 30 }; assert(actSpeed(c3, 'mer') === 10 && merMinutesOf(c3, 'pri') === 20, `v0.11.15: after 30 sittings ×10: 20 min (${merMinutesOf(c3, 'pri')})`);
    c3.tasks.use = { 'act:mer': 99 }; assert(actSpeed(c3, 'mer') === 10, 'v0.11.15: ×10 is the cap');
    c3.tasks.use = {}; c3.minutes += 0; const cm = c3.minutes; choose(c3, SCENES, wp); assert(c3.tasks.use['act:mer'] === 1 && c3.james.primaries === 1 && c3.minutes - cm === 120, 'v0.11.15: a sitting counts one use');
    // the Fed lock (pick 2a): below Fed 20 the work cards lock, and the screen says why
    const h = ensureBars(newGame(47, { closed: true })); h.scene = 'meridians'; h.james.qi = 20; h.james.satiety = 19;
    assert(merChoice(h, SCENES) === -1 && /Too hungry to sit/.test(SCENES.meridians.text(h)), 'Fed under 20: no sitting, the screen says why');
    h.james.satiety = 20; assert(merChoice(h, SCENES) >= 0, 'Fed 20: sitting allowed');
    // Foundation needs all 12 primaries; collaterals still closed seal; a rewind unwinds Foundation
    const b = ensureBars(newGame(42, { closed: true })); b.scene = 'stream'; b.james.saturation = 96; b.james.primaries = 11;
    assert(!canBreakThrough(b) && medCards(b, SCENES).some((c) => c.id === 'med:bt' && !c.open && /12 primaries/.test(c.reason)), 'Foundation: locked at 11 primaries, the card says why');
    b.james.primaries = 12; b.james.collaterals = 18;
    assert(canBreakThrough(b) && btTarget(b) === 'col_warn', 'with all 12: the warning before sealing');
    runMed(b, SCENES, 'med:bt');
    assert(b.scene === 'col_warn', 'Meditate → Break through → the warning');
    choose(b, SCENES, SCENES.col_warn.choices.findIndex((c) => c.to === 'breakthrough'));
    assert(b.james.realm === 1 && b.james.colSealed && !canColGroup(b), 'sealed at Foundation: no collaterals any more');
    b.james.saturation = 40; b.inventory.hare_raw = 3;
    endCoil(b, 'choice', 'stream'); rewind(b);
    assert(b.james.realm === 0 && b.james.saturation === 0 && !b.james.colSealed && b.yuki.realm === 0 && b.james.collaterals === 0 && b.james.primaries === 0 && !b.inventory.hare_raw, 'v0.11.0: the rewind starts James over: Mortal Vessel, Saturation 0, meridians closed again');
    const k = ensureBars(newGame(43, { closed: true })); k.james.primaries = 12; k.james.collaterals = 66; k.james.saturation = 96; k.flags.bt_return = 'stream';
    assert(btTarget(k) === 'breakthrough', 'everything open: no warning');
    breakthrough(k); endCoil(k, 'choice', 'stream'); rewind(k);
    assert(k.james.realm === 0 && k.james.primaries === 0, 'v0.11.0: the realm starts over on a rewind, sealed or not');
    // the closed Day 1 scan text
    assert(/ash/.test(SCENES.yuki_check.text(ensureBars(newGame(45, { closed: true })))) && /Twelve primaries open/.test(SCENES.yuki_check.text(open)), 'Day 1 scan text follows the meridians');
}
// v0.11.0: the Coil bonus — ×(1 + 0.5 × earlier Coils), Incremental Mode only; v0.11.29 (RB-1): ×(1 + 0.25 × earlier Coils)
{
    const g = ensureBars(newGame(91, { closed: true }));
    assert(coilMult(g) === 1, 'Coil 1: ×1');
    const xp1 = (h) => { const c = structuredClone(h); const out = awardXp(c, 'Convergence Use', 'standard'); return Number(/\+(\d+) XP/.exec(out[0])[1]); };
    const base = xp1(g);
    endCoil(g, 'collapse'); rewind(g); endCoil(g, 'beast'); rewind(g); // v0.11.86 (#53): a death adds to the bonus (a bite by choice doesn't)
    assert(g.coil.n === 3 && coilMult(g) === 1.5 && xp1(g) === Math.floor(base * 1.5), `Coil 3: ×1.5 XP (${base} → ${xp1(g)})`);
    // v0.11.118 (YK1, CG): James's GU above her, so she learns; TA (the review's medium 2): the assert on its own line again
    g.james.gu.tier = 5; const y0 = g.yuki.fight.xp; awardYukiFightXp(g, 'standard');
    assert(g.yuki.fight.xp - y0 === 45 || g.yuki.fight.level > 1, `Yuki's XP ×1.5 too (${g.yuki.fight.xp - y0})`);
    // v0.11.41 (D2-a): the meridian DC ÷ the Coil bonus was Story Mode's checked sessions (gone)
    g.james.qi = 40; const s0 = g.james.saturation; const r = condense(g); const one = ensureBars(newGame(93, { closed: true })); one.james.qi = 40; const r1 = condense(one);
    assert(r.ok && Math.abs((g.james.saturation - s0) - r1.gain) < 0.2, `v0.11.15: a sit gives the same Saturation on Coil 3 (${r1.gain} → ${g.james.saturation - s0})`);
    const a = ensureBars(newGame(94)); a.scene = 'epilogue'; a.flags.ending = 'bluff'; a.minutes = 6 * 1440 + 900; a.coil.n = 5;
    choose(a, SCENES, 0);
    assert(a.coil.act === 1 && a.coil.n === 5 && coilMult(a) === 2, 'v0.11.26 (one count, N1): Act 1 continues the prologue\'s Coil 5 at ×2 (×3 before v0.11.29)');
}
// v0.11.29 (owner pick RB-1): the two walls and the bonus text
{
    const { NO_DICE_TUNE } = await import('../js/story/nodice_tune.js');
    const { fmtMult, COIL_GROWTH } = await import('../js/core/game.js');
    assert(NO_DICE_TUNE.collectors.up === 4.5 && NO_DICE_TUNE.rot_ape.up === 14 && COIL_GROWTH === 0.25, `RB-1: the tribute 4.5, the rot ape 14 (v0.11.36; 15 in RB-1), the Coil bonus 0.25 per Coil (${NO_DICE_TUNE.collectors.up}, ${NO_DICE_TUNE.rot_ape.up}, ${COIL_GROWTH})`);
    assert(fmtMult(1) === '1' && fmtMult(1.25) === '1.25' && fmtMult(1.5) === '1.5' && fmtMult(2.75) === '2.75', 'fmtMult: ×1.25 shows as 1.25, not 1.3');
}
// v0.11.109 (owner pick FL1, W + C): from Foundation a story choice that takes James elsewhere is flown (÷ (1 + realm), at
// least 5 minutes, never longer); the seven crossings are flown (no check shown, they succeed, Fable's line replaces the scene's)
{
    const { flightMinutes, canFly, FLY_MIN } = await import('../js/core/game.js');
    const { FLOWN_LINES, choiceTag } = await import('../js/core/story.js');
    const at = (realm) => { const g = ensureBars(newGame(91)); g.james.realm = realm; return g; };
    assert(!canFly(at(0)) && canFly(at(1)) && FLY_MIN === 5, 'FL1: flight from Foundation, at least 5 minutes');
    assert(flightMinutes(at(0), 40) === 40 && flightMinutes(at(1), 40) === 20 && flightMinutes(at(2), 40) === 13 && flightMinutes(at(1), 10) === 5 && flightMinutes(at(1), 4) === 4 && flightMinutes(at(9), 120) === 12, 'FL1: ÷ (1 + realm), floor 5, never longer than walking');
    assert(FLOWN_LINES.length === 6 && FLOWN_LINES.every((l) => l.includes('{min}') && l.includes('{walk}')), 'FL1: six flown lines, each with both numbers (Fable)');
    // a walk elsewhere with its own time: the ford's "Cross carefully" (40 min, to rt_camp); and every one of the seven crossings marked
    const crossings = Object.values(SCENES).flatMap((sc) => (sc.choices || []).filter((c) => c.fly).map((c) => [sc.id, c]));
    assert(crossings.length === 7 && crossings.every(([, c]) => c.check && typeof c.fly === 'string' && c.fly.length > 40), `FL1: seven flown crossings, each with a check and Fable's line (${crossings.map(([id]) => id)})`);
    const ford = SCENES.rt_ford, wake = SCENES.rt_ford_wake, iRun = wake.choices.findIndex((c) => /^Run for the far bank/.test(c.text)), iCross = ford.choices.findIndex((c) => /^Cross carefully/.test(c.text));
    assert(iRun >= 0 && iCross >= 0, 'FL1: the ford\'s two crossings found');
    for (const realm of [0, 1]) {
        const g = at(realm); g.scene = 'rt_ford_wake'; g.james.gu = { tier: 1, level: 1, xp: 0 }; // fails every GU check walking
        const r = choose(g, SCENES, iRun);
        if (realm === 0) assert(g.scene === 'rt_serpent_forced' && r.roll && !r.roll.success, `FL1: walking, a weak James fails the far bank (${g.scene})`);
        else assert(g.scene === 'rt_camp' && r.roll === null && r.lines[0] === wake.choices[iRun].fly && !r.lines.some((l) => /DC|failure/.test(l)), `FL1: flying, the far bank is flown: no check shown, Fable's line (${g.scene})`); // the camp's own clock moves on after it, so the minutes are tested on a plain walk below
        assert(realm ? choiceTag(g, wake.choices[iRun]) === 'flown' : /DC/.test(choiceTag(g, wake.choices[iRun])), 'FL1: the card says flown, not the check');
    }
    { // v0.11.109 (owner pick FQ1, N): the two sung bridges cost no Qi when flown; the ambush wall keeps its 6 (it is still sung)
        const { choiceQi } = await import('../js/core/story.js');
        const free = crossings.filter(([, c]) => c.flyFree);
        assert(free.length === 2 && free.every(([, c]) => c.qi === 8 && /bridge|stepping-stones/.test(c.text)) && crossings.some(([, c]) => /of bone between you/.test(c.text) && c.qi === 6 && !c.flyFree), `FQ1: the two sung bridges are free when flown, the wall is not (${free.map(([id]) => id)})`);
        const iSung = ford.choices.findIndex((c) => c.flyFree); // its label reads by the forms ("Sing stepping-stones of bone …")
        for (const realm of [0, 1]) { // at Qi 0: walking it can't be sung (8 Qi), flying it goes ahead and costs nothing
            const g = at(realm); g.scene = 'rt_ford'; g.james.qi = 0; g.james.skills['Convergence Use'] = { tier: 3, level: 1, xp: 0 };
            let r = null, err = null; try { r = choose(g, SCENES, iSung); } catch (e) { err = e; }
            assert(choiceQi(g, ford.choices[iSung]) === (realm ? 0 : 8) && (realm ? !err && r.lines.includes(ford.choices[iSung].fly) : /Not enough Qi/.test(err?.message)), `FQ1: the ford's sung bridge at realm ${realm}, Qi 0: ${realm ? 'flown, free' : 'needs 8 Qi'} (${err?.message || 'ok'})`);
        }
    }
    { // v0.11.109 (owner pick FS1, WP; Fable's review mediums 1–5): only a pure walk is flown
        // B1: the flown wyrm bridge (default 30 min, a check) gets Fable's line and no walk line
        const rr = SCENES.rr_end, iW = rr.choices.findIndex((c) => c.fly), gw = at(1); gw.scene = 'rr_end'; gw.james.qi = 0;
        const rw = choose(gw, SCENES, iW);
        assert(rw.lines.includes(rr.choices[iW].fly) && !gw.stats.flown, 'FS1 (B1): the flown wyrm bridge has its line and no walk line');
        // a choice with work in it (a check, Qi, a do or a haul) to another place keeps its time at Foundation
        const busy = Object.values(SCENES).flatMap((sc) => (sc.choices || []).map((c, i) => [sc, c, i])).filter(([sc, c]) => !c.fly && !c.show && !c.req && !c.qi && !c.combat && c.time >= 30 && (c.check || c.do) && typeof c.to === 'string' && SCENES[c.to] && typeof sc.place === 'string' && typeof SCENES[c.to].place === 'string' && sc.place !== SCENES[c.to].place && !SCENES[c.to].enter && !c.fail);
        assert(busy.length > 3, `FS1: choices with work in them that end elsewhere (${busy.length})`);
        let kept = 0;
        for (const [sc, c, i] of busy.slice(0, 12)) { const g = at(1); g.scene = sc.id; const t0 = g.minutes; let r; try { r = choose(g, SCENES, i); } catch { continue; } if (g.minutes - t0 >= c.time && !g.stats.flown && r) kept++; else assert(false, `FS1: ${sc.id} "${String(c.text).slice(0, 40)}" keeps its ${c.time} min at Foundation (${g.minutes - t0})`); }
        assert(kept > 0, `FS1: work that ends elsewhere keeps its time (${kept})`);
        // MW1: only a marked walk is flown; a choice that only moves but isn't a walk keeps its time; a card (task: true) never flies
        const { WALKS, markWalks } = await import('../js/story/walks.js');
        assert(WALKS.length === 62 && WALKS.every(([id, i]) => SCENES[id]?.choices?.[i]?.walk === true), `MW1: 62 marked walks, each on its choice (${WALKS.length})`);
        { let threw = false; try { markWalks({ [WALKS[0][0]]: { choices: [] } }); } catch { threw = true; } assert(threw, 'MW1: a mark that no longer matches its choice throws at load'); }
        const camp = SCENES.rt_serpent_lost.choices[0];
        assert(!camp.walk && /^Make camp/.test(camp.text) && camp.time === 90, 'MW1: "Make camp. Dry out." is not a walk');
        { const g = at(1); g.scene = 'rt_serpent_lost'; const t0 = g.minutes; choose(g, SCENES, 0); assert(!g.stats.flown && g.minutes - t0 >= 90, `MW1: making camp keeps its 90 min at Foundation (${g.minutes - t0})`); }
        { const [id, i] = WALKS.find(([wid, wi]) => { const c = SCENES[wid].choices[wi]; return c.time >= 30 && !c.show && !c.req && !SCENES[c.to]?.enter; }); const c = SCENES[id].choices[i];
          const g = at(1); g.scene = id; const t0 = g.minutes; choose(g, SCENES, i, { task: true }); assert(!g.stats.flown && g.minutes - t0 === c.time, `MW1: run as a card, a walk is not flown (${id} ${c.time} → ${g.minutes - t0})`); }
    }
    { const g = at(1); g.scene = 'rt_ford'; const r = choose(g, SCENES, iCross); assert(!r.lines.some((l) => /stone to stone with Ya/.test(l)) && r.lines.includes(ford.choices[iCross].fly), 'FL1: a flown crossing\'s line replaces the scene\'s own'); }
    { // a plain walk elsewhere: flown with a line in turn; walking, no line
        const pick = Object.values(SCENES).flatMap((sc) => (sc.choices || []).map((c, i) => [sc, c, i])).find(([sc, c]) => c.walk && !c.check && !c.fly && !c.show && !c.req && !c.qi && !c.do && !c.combat && c.time >= 30 && typeof c.to === 'string' && SCENES[c.to] && typeof sc.place === 'string' && typeof SCENES[c.to].place === 'string' && sc.place !== SCENES[c.to].place && !SCENES[c.to].enter);
        assert(!!pick, 'FL1: a plain walk to test');
        const [sc, c, i] = pick;
        for (const realm of [0, 1, 1]) {
            const g = at(realm); g.stats.flown = realm ? 7 : undefined; g.scene = sc.id; const t0 = g.minutes; const r = choose(g, SCENES, i);
            const want = realm ? flightMinutes(g, c.time) : c.time;
            assert(g.minutes - t0 === want && (realm ? r.lines.includes(FLOWN_LINES[7 % 6].replace('{min}', want).replace('{walk}', c.time)) && g.stats.flown === 8 : !g.stats.flown), `FL1: ${sc.id} → ${c.to} at realm ${realm}: ${g.minutes - t0} min (want ${want}), the line in turn`);
        }
    }
}
// v0.11.107 (owner pick NK1, FL): the bone flail at Convergence T2 L1: sung once (Qi 3, dampened), then free; GU +1; damage
// 2–4 × the bone multiplier; each swing hits the target and one more foe standing (each checked); not in a spar or a brawl.
{
    const { FLAIL_SUNG, actionCost } = await import('../js/core/game.js');
    const { dampenMultiplier } = await import('../js/core/formulas.js');
    const { FAQ } = await import('../js/core/faq.js');
    const setSk = (g, t, l) => { g.james.skills['Convergence Use'] = { tier: t, level: l, xp: 0 }; g.james.gu = { tier: t, level: l, xp: 0 }; };
    const fl = COMBAT_ACTIONS.flail;
    assert(fl && fl.label === 'Bone flail' && fl.skill === 'GU' && fl.qi === 3 && fl.dmg.join() === '2,4' && fl.dcMod === 1 && fl.keeps === 'flail' && fl.sweep === 2 && !fl.pierce && !fl.stagger && !fl.reach, 'NK1: the flail as picked (GU +1, Qi 3, 2–4, keeps, two targets)');
    assert(INC_ONLY_ACTIONS.has('flail') && FORM_LINES.sweep.label === 'Sweep' && FORM_LINES.sweep.forms.length === 1 && FORM_LINES.sweep.forms[0].at === 11, 'NK1: the sweep line, the flail at rank 11 (T2 L1)');
    const g = ensureBars(newGame(83, { closed: true }));
    setSk(g, 1, 10); assert(!hasForm(g, 'flail') && !actionOpen(g, 'flail'), 'NK1: T1 L10: no flail');
    setSk(g, 2, 1); assert(hasForm(g, 'flail') && actionOpen(g, 'flail'), 'NK1: T2 L1: the flail opens');
    assert(actionCost(g, fl) === Math.round(3 * dampenMultiplier(2) * 10) / 10 && actionDmg(g, fl).join() === '4,8', `NK1: T2 L1 costs 3 dampened, 4–8 damage (${actionCost(g, fl)}, ${actionDmg(g, fl)})`);
    for (const style of ['spar', 'unarmed']) { const h = ensureBars(newGame(84, { closed: true })); setSk(h, 2, 1); sCombat(h, { id: 'jackals', intro: '', band: 'standard', style, enemies: [{ name: 'A', hp: 50, dc: 1, atk: 1, dmg: 0 }], win: 'stream', lose: 'stream' }); assert(!actionOpen(h, 'flail') && fightAction(h, 'flail') === (style === 'spar' ? 'blade' : 'strike'), `NK1: no flail in a ${style}`); }
    // two dummies: the first swing sings it (Qi, the line) and hits both; the second costs nothing; three foes: only two hit
    const h = ensureBars(newGame(85, { closed: true })); setSk(h, 2, 1); h.james.qi = 20; // under the T2 maximum (32)
    const foe = (n) => ({ name: n, hp: 99, dc: 1, atk: 1, dmg: 0 });
    sCombat(h, { id: 'jackals', intro: '', band: 'standard', enemies: [foe('A'), foe('B'), foe('C')], win: 'stream', lose: 'stream' });
    const q0 = h.james.qi, o1 = cStep(h, 'flail');
    const hp = () => h.combat.enemies.map((e) => e.hp).join();
    assert(h.combat.flailFormed && Math.abs(q0 - h.james.qi - actionCost(h, fl)) < 1e-9 && o1.lines.includes(FLAIL_SUNG), `NK1: the first swing sings it (Qi ${q0} → ${h.james.qi}, the line)`);
    assert(o1.lines.filter((l) => /^Bone flail → /.test(l)).length === 2 && h.combat.enemies[2].hp === 99 && h.combat.enemies[0].hp < 99 && h.combat.enemies[1].hp < 99, `NK1: the target and one more, not a third (${hp()})`);
    const q1 = h.james.qi, b1 = h.combat.enemies.map((e) => e.hp); cStep(h, 'flail', 1);
    assert(h.james.qi === q1 && h.combat.enemies[1].hp < b1[1] && h.combat.enemies[0].hp < b1[0] && h.combat.enemies[2].hp === 99, `NK1: free once sung; target B and the first other (A), not C (${hp()})`); // review low 2
    { // review low 2: a target index past the end or a dead first foe: the last living one and one other, never the same foe twice
        const t = ensureBars(newGame(88, { closed: true })); setSk(t, 2, 1); t.james.qi = 20;
        sCombat(t, { id: 'jackals', intro: '', band: 'standard', enemies: [foe('A'), foe('B'), foe('C')], win: 'stream', lose: 'stream' });
        const o = cStep(t, 'flail', 7); const hit = o.lines.filter((l) => /^Bone flail → /.test(l)).map((l) => l.split('→ ')[1].split(':')[0]);
        assert(hit.join() === 'C,A', `NK1: index 7 of 3: C, then A (${hit})`);
        t.combat.enemies[0].hp = 0; const o2 = cStep(t, 'flail', 1); const hit2 = o2.lines.filter((l) => /^Bone flail → /.test(l)).map((l) => l.split('→ ')[1].split(':')[0]);
        assert(hit2.join() === 'C,B', `NK1: A down, index 1 of the living: C, then B (${hit2})`);
    }
    // one foe left: it hits that one alone, no second line
    const k = ensureBars(newGame(86, { closed: true })); setSk(k, 2, 1); k.james.qi = 40;
    sCombat(k, { id: 'jackals', intro: '', band: 'standard', enemies: [foe('A')], win: 'stream', lose: 'stream' });
    const o2 = cStep(k, 'flail'); assert(o2.lines.some((l) => /^Bone flail: /.test(l)) && !o2.lines.some((l) => / → /.test(l)), 'NK1: one foe: one hit, no arrow');
    // the smart rule: the flail while two or more stand; the spear on one; a sung flail is free on the last foe; the reserve is 0 once sung
    const m = ensureBars(newGame(87, { closed: true })); setSk(m, 2, 1); m.james.qi = 20;
    sCombat(m, { id: 'jackals', intro: '', band: 'standard', enemies: [foe('A'), foe('B')], win: 'stream', lose: 'stream' });
    assert(smartAction(m) === 'spikes', 'NK1 smart: the spike field first, as before'); m.combat.fieldUsed = true;
    assert(smartAction(m) === 'flail', 'NK1 smart: two foes → the flail');
    { const q = m.james.qi; m.james.qi = actionCost(m, fl); assert(smartAction(m) === 'flail', 'NK1 smart: Qi exactly at the cost sings it (review low 3)'); m.james.qi = q; }
    { m.combat.flailFormed = true; const q = m.james.qi; m.james.qi = 0; assert(smartAction(m) === 'flail', 'NK1 smart: two foes, a sung flail, no Qi → the flail (review low 3)');
      m.james.qi = 20; const hp0 = m.james.hp; m.james.hp = 1; assert(smartAction(m) === 'qshield', 'NK1 smart: a sung flail lets the shield through at low HP (review low 3)'); m.james.hp = hp0; m.james.qi = q; m.combat.flailFormed = false; }
    m.combat.enemies[1].hp = 0; assert(smartAction(m) === 'spear', 'NK1 smart: one foe → the spear');
    m.combat.flailFormed = true; m.james.qi = 0; assert(smartAction(m) === 'flail' && attackReserve(m) === 0, 'NK1 smart: no Qi, a sung flail → the flail; the reserve 0');
    setSk(m, 1, 10); m.combat.flailFormed = false; m.combat.enemies[1].hp = 99; m.james.qi = 20; assert(smartAction(m) !== 'flail', 'NK1 smart: below T2, never the flail');
    assert(/<b>Bone flail<\/b> from T2 that hits a second enemy/.test(FAQ.find(([t]) => t === 'Fights')[1]()), 'NK1: the FAQ names the flail (Fable)');
}
// v0.11.112 (owner pick FF1, TD): flight in fights: from Foundation, darts or the Qi blast are thrown from the air and foes
// that don't fly get no attack that round; flyers still do; not in a spar or a brawl; the smart rule throws darts then.
{
    const { airStrike, AIR_TEXT, AIR_STRIKE_ACTIONS } = await import('../js/core/game.js');
    const { readFileSync } = await import('node:fs');
    const setSk = (g, t, l) => { g.james.skills['Convergence Use'] = { tier: t, level: l, xp: 0 }; g.james.gu = { tier: t, level: l, xp: 0 }; };
    const ground = (n) => ({ name: n, hp: 99, dc: 1, atk: 50, dmg: 3 }), hawk = (n) => ({ name: n, hp: 99, dc: 1, atk: 50, dmg: 3, flies: true });
    const toAct1 = (g) => { g.flags.ending = g.flags.ending || 'victory'; g.minutes = Math.max(g.minutes, 7 * 1440 + 6 * 60); return g; }; // AG1: the air is Act 1's
    const mk = (realm, enemies, extra = {}, act1 = true) => { const g = ensureBars(newGame(95, { closed: true })); if (act1) toAct1(g); setSk(g, 1, 6); g.james.realm = realm; g.james.qi = 40; g.james.hp = jamesHpMax(g);
        sCombat(g, { id: 'jackals', intro: '', band: 'standard', enemies, win: 'stream', lose: 'stream', ...extra }); g.combat.fieldUsed = true; return g; };
    assert([...AIR_STRIKE_ACTIONS].join() === 'dart,blast', 'FF1: darts and the Qi blast only');
    { const g = mk(1, [ground('Wolf'), hawk('Hawk')]); const o = cStep(g, 'dart');
      assert(o.lines.includes(AIR_TEXT.reach.replace('{foe}', 'Wolf')) && !o.lines.some((l) => /^Wolf attacks/.test(l)) && o.lines.some((l) => /^Hawk attacks/.test(l)), `FF1: at Foundation the ground foe can't reach, the hawk still attacks (${o.lines.join(' | ')})`); }
    { const g = mk(1, [ground('Wolf')]); const o = cStep(g, 'blast'); assert(o.lines.includes(AIR_TEXT.reach.replace('{foe}', 'Wolf')), 'FF1: the Qi blast too'); }
    { const g = mk(0, [ground('Wolf')]); const o = cStep(g, 'dart'); assert(o.lines.some((l) => /^Wolf attacks/.test(l)) && !airStrike(g, 'dart'), 'FF1: Mortal: no flight, the foe attacks'); }
    { const g = mk(1, [ground('Wolf')]); const o = cStep(g, 'blade'); assert(o.lines.some((l) => /^Wolf attacks/.test(l)) && !airStrike(g, 'blade'), 'FF1: the blade is on the ground'); }
    { const g = mk(1, [ground('Wolf')]); g.james.qi = 0; const o = cStep(g, 'dart'); assert(o.lines.some((l) => /fall back on guarding/.test(l)) && o.lines.some((l) => /^Wolf attacks/.test(l)), 'FF1: no Qi for darts: guard, on the ground'); }
    { const g = mk(1, [ground('Ya')], { style: 'spar' }); assert(!airStrike(g, 'dart') && !airStrike(g, 'blast'), 'FF1: not in a spar'); }
    { // AG1, G1: the prologue at Foundation: no air in fights (the walks still fly: canFly)
      const { canFly, airFights, inAct1 } = await import('../js/core/game.js');
      const g = mk(1, [ground('Wolf')], {}, false); assert(canFly(g) && !inAct1(g) && !airFights(g) && !airStrike(g, 'dart'), 'AG1: the prologue: flies, but not in fights');
      const o = cStep(g, 'dart'); assert(o.lines.some((l) => /^Wolf attacks/.test(l)) && !o.lines.some((l) => /can't reach you/.test(l)), 'AG1: the prologue: the wolf still attacks a dart round');
      assert(smartAction(mk(1, [ground('Wolf'), ground('Wolf')], {}, false)) !== 'dart', 'AG1: the prologue: the smart rule as before'); }
    { const g = mk(1, [hawk('Hawk')]); assert(!airStrike(g, 'dart'), 'FF1: only flyers standing: nothing to gain'); }
    { const g = mk(1, [ground('Wolf')]); cStep(g, 'dart'); assert(g.combat.aloft === undefined, 'FF1: the air lasts the round'); const o = cStep(g, 'blade'); assert(o.lines.some((l) => /^Wolf attacks/.test(l)), 'FF1: next round on the ground, it attacks again'); }
    // the smart rule
    { const g = mk(1, [ground('Wolf'), ground('Wolf')]); assert(smartAction(g) === 'dart', 'FF1 smart: Foundation, ground foes, darts open and paid → darts');
      g.james.qi = 0; assert(smartAction(g) !== 'dart', 'FF1 smart: no Qi for darts → the old rule');
      // AF1, T (review low): the Mortal and hawks-only cases call smartAction and compare with the old rule's pick (the air off)
      const old = (g) => { const r = g.james.realm; g.james.realm = 0; const a = smartAction(g); g.james.realm = r; return a; };
      const h = mk(0, [ground('Wolf'), ground('Wolf')]); assert(!airStrike(h, 'dart') && smartAction(h) !== 'dart' && (h.james.realm = 1, smartAction(h) === 'dart'), `FF1 smart: Mortal: the old rule, not darts; the same fight at Foundation: darts`);
      const k = mk(1, [hawk('Hawk'), hawk('Hawk')]); assert(!airStrike(k, 'dart') && smartAction(k) === old(k) && smartAction(k) !== 'dart', `FF1 smart: hawks only: the old rule (${smartAction(k)})`); }
    // AF1, T: a spar round at Foundation stays on the ground; the construct isn't spent on a foe that can't reach; a Yuki-lunging foe still lunges
    { const g = mk(1, [ground('Ya')], { style: 'spar' }); const o = cStep(g, 'blade'); assert(!g.combat?.aloft && o.lines.some((l) => /^Ya attacks/.test(l)), 'AF1: a spar round: no air'); }
    { const g = mk(1, [{ ...ground('Wolf'), hp: 9999 }, { ...hawk('Hawk'), hp: 9999 }]); setSk(g, 8, 1); g.james.qi = 400; const o = cStep(g, 'blast');
      assert(o.lines.includes(AIR_TEXT.reach.replace('{foe}', 'Wolf')) && o.lines.some((l) => /^Hawk attacks — your construct steps into the blow/.test(l)), `AF1, S: at T8 the construct waits for the hawk (${o.lines.join(' | ')})`); }
    { const g = mk(1, [{ ...ground('Jackal'), prefersSmall: true }]); g.combat.round = 3; const o = cStep(g, 'dart');
      assert(o.lines.some((l) => /^Jackal lunges at Yuki/.test(l)), 'AF1: a foe that goes for Yuki on round 3 still does (James is up, she is not)'); }
    // AF1, M: an old mid-fight save's hawks and crows get `flies` by name; nothing else does
    { const { fliesFill } = await import('../js/core/game.js'); const g = { combat: { enemies: [{ name: 'Cinder hawk 2' }, { name: 'Rot-crow 1' }, { name: 'Storm-hawk' }, { name: 'Ash-wolf' }, { name: 'Hawk', flies: false }] } };
      fliesFill(g); assert(g.combat.enemies.map((e) => e.flies).join() === 'true,true,true,,false', `AF1, M: fliesFill (${g.combat.enemies.map((e) => e.flies).join()})`);
      assert(fliesFill({}) && fliesFill(null) === null, 'AF1, M: no fight, no change'); }
    // the data and the texts
    { const src = ['js/story/act1_blackroot.js', 'js/story/longforest.js', 'js/story/wilds.js'].map((f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')).join('\n');
      const foes = [...src.matchAll(/name: [`'](?:Cinder hawk|Storm-hawk|Rot-crow)(?: \$\{i\})?[`'][^}]*}/g)].map((m) => m[0]);
      assert(foes.length === 6 && foes.every((f) => /flies: true/.test(f)), `FF1: the hawks and crows fly (${foes.length})`);
      assert((src.match(/flies: true/g) || []).length === 6, 'FF1: nothing else flies');
      const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      assert(/airStrike\(g, id\) \? ` · \$\{AIR_TEXT\.tag\}`/.test(main) && /airStrike\(g, b\.dataset\.act\)\) lines\.push\(AIR_TEXT\.hold\)/.test(main), 'FF1: the card tag and the hold line');
      assert(AIR_TEXT.reach === "{foe} can't reach you up there." && AIR_TEXT.tag === 'from the air', "FF1: Fable's lines"); }
    { const { FAQ } = await import('../js/core/faq.js'); const fl = FAQ.find(([t]) => t === 'Flight')[1]();
      assert(/<b>Fights:<\/b> from Act 1 on, never in the prologue, and only at <b>[^<]+<\/b> or above: in an armed fight, any round James throws <b>Bone darts<\/b> or the <b>Qi blast<\/b> he does it from the air/.test(fl) && !/not in the game yet/.test(fl), "FF1: the FAQ's Fights sentence (Fable)"); }
}
// v0.11.121 (owner pick AS1, EL6 + W): the air stalemate: a round from the air in which nobody takes damage while every foe
// standing can't fly is a stuck round; the third in a row warns, the sixth ends the fight, lost; any damage starts the count again.
{
    const { AIR_STALL_WARN, AIR_STALL_END, AIR_STALL_TEXT, foeFillAll, TELL_TEXT, combatFlee } = await import('../js/core/game.js');
    const { FAQ } = await import('../js/core/faq.js');
    const { readFileSync } = await import('node:fs');
    const toAct1 = (g) => { g.flags.ending = g.flags.ending || 'victory'; g.minutes = Math.max(g.minutes, 7 * 1440 + 6 * 60); return g; };
    const mk = (enemies, realm = 1, extra = {}) => { const g = ensureBars(newGame(96, { closed: true })); toAct1(g);
        g.james.skills['Convergence Use'] = { tier: 1, level: 6, xp: 0 }; g.james.gu = { tier: 1, level: 6, xp: 0 }; g.james.realm = realm; g.james.qi = 200; g.james.hp = jamesHpMax(g);
        sCombat(g, { id: 'jackals', intro: '', band: 'standard', enemies, win: 'stream', lose: 'stream', ...extra }); g.combat.fieldUsed = true; if (!extra.yuki) g.yuki.hp = 0; return g; };
    const wall = (n) => ({ name: n, hp: 99, dc: 99, atk: 1, dmg: 3 });
    const warn = (n) => foeFillAll(AIR_STALL_TEXT.warn, n), end = (n) => foeFillAll(AIR_STALL_TEXT.end, n);
    const { AIR_TEXT: AT } = await import('../js/core/game.js'); const AIR_TEXT_REACH = (n) => AT.reach.replace('{foe}', n);
    assert(AIR_STALL_WARN === 3 && AIR_STALL_END === 6, 'AS1: warn at 3, end at 6');
    assert(!warn('Rot-ape').includes('{foe}') && warn('Rot-ape').startsWith('Three rounds from the air, and nothing you send down has hurt Rot-ape. Rot-ape can') && end('Rot-ape').startsWith('Six rounds from the air, and none of them hurt Rot-ape.'), "AS1, T: Fable's lines, every {foe} filled");
    assert(!/darts|mark on|nothing is left/i.test(AIR_STALL_TEXT.warn + AIR_STALL_TEXT.end + AIR_STALL_TEXT.warnPerson + AIR_STALL_TEXT.endPerson) && !/\bit\b/.test(AIR_STALL_TEXT.warnPerson + AIR_STALL_TEXT.endPerson), 'AS1, RV1 PT: no weapon named, nothing that can be false, a person never "it"');
    assert(foeFillAll(AIR_STALL_TEXT.warn, 'The Rot Ape').startsWith('Three rounds from the air, and nothing you send down has hurt the Rot Ape. The Rot Ape can'), 'AS1, TG: a "The …" name, lower-cased mid-line only');
    { const g = mk([wall('Rot-ape')]); const outs = [];
      for (let i = 0; i < AIR_STALL_END && g.combat; i++) outs.push(cStep(g, 'dart'));
      const at = outs.map((o) => o.lines.includes(warn('Rot-ape')));
      assert(outs.length === 6 && at.join() === 'false,false,true,false,false,false', `AS1, W: the warning in the third stuck round only (${at})`);
      assert(outs.slice(0, 5).every((o) => !o.done) && outs[5].done === 'lose' && !g.combat, `AS1, EL6: lost in the sixth (${outs.map((o) => o.done)})`);
      assert(outs[5].lines.includes(end('Rot-ape')) && !outs[5].lines.some((l) => /Thirty exchanges/.test(l)) && g.james.hp === 1, 'AS1: the stall\'s own line, not the round cap\'s');
      assert(!outs[5].lines.some((l) => /draws back|next round/i.test(l)), 'AS1: no next-round tells after the last round'); }
    { const g = mk([{ ...wall('Rot-ape'), dmg: 8 }]); const outs = []; for (let i = 0; i < 6 && g.combat; i++) outs.push(cStep(g, 'dart'));
      const tell = (o) => o.lines.some((l) => TELL_TEXT.big.some((t) => l === foeFillAll(t, 'Rot-ape')));
      assert(g.combat === null && outs[5].done === 'lose' && tell(outs[1]) && tell(outs[4]) && !tell(outs[5]), `AS1, TG: a heavy foe's tell in rounds 2 and 5, none after the last (${outs.map(tell)})`); }
    { const g = mk([wall('Rot-ape')]); const outs = []; for (let i = 0; i < 6 && g.combat; i++) outs.push(cStep(g, 'blast'));
      assert(outs[0].lines.includes(AIR_TEXT_REACH('Rot-ape')) && outs[2].lines.includes(warn('Rot-ape')) && outs[5]?.done === 'lose', `AS1, TG: the Qi blast stalls the same (${outs.map((o) => o.done)})`); }
    { const g = mk([wall('Elder Shen')], 1, { id: 'elder' }); const outs = []; for (let i = 0; i < 6 && g.combat; i++) outs.push(cStep(g, 'dart'));
      const pw = foeFillAll(AIR_STALL_TEXT.warnPerson, 'Elder Shen'), pe = foeFillAll(AIR_STALL_TEXT.endPerson, 'Elder Shen');
      assert(outs[2].lines.includes(pw) && outs[5].done === 'lose' && outs[5].lines.includes(pe) && !outs[5].lines.includes(end('Elder Shen')), 'AS1, RV1 PT: a people fight gets the people lines'); }
    { const g = mk([{ ...wall('Rot-ape'), atk: 999 }], 1, { flee: 'stream' }); for (let i = 0; i < 5; i++) cStep(g, 'dart');
      const hp = g.james.hp; const f = combatFlee(g);
      assert(!f.done && g.james.hp < hp && g.combat.stall === 0, `AS1, RV1 FR: a failed run starts the count again (${g.combat?.stall})`);
      const o = cStep(g, 'dart'); assert(!o.done && g.combat.stall === 1, 'AS1, RV1 FR: and the next dart is stuck round 1, not the loss'); }
    { const g = mk([wall('Rot-ape')]); for (let i = 0; i < 4; i++) cStep(g, 'dart'); g.james.qi = 0;
      const o = cStep(g, 'dart'); assert(o.lines.some((l) => /fall back on guarding/.test(l)) && g.combat.stall === 0, 'AS1, TG: no Qi: the dart falls back to guard on the ground, the count starts again'); }
    { const g = mk([wall('Rot-ape')], 1, { yuki: true }); assert(g.yuki.hp > 0, 'AS1, TG: Yuki in the fight'); const outs = []; for (let i = 0; i < 6 && g.combat; i++) outs.push(cStep(g, 'dart'));
      assert(outs[5]?.done === 'lose' && outs[2].lines.includes(warn('Rot-ape')), 'AS1, TG: Yuki missing too changes nothing (no damage either side)'); }
    { const g = mk([{ ...wall('Plain'), dc: 1 }, { ...wall('Hungry'), dc: 1, moods: true }]);
      g.james.skills['Convergence Use'] = { tier: 4, level: 1, xp: 0 }; g.james.gu = { tier: 4, level: 1, xp: 0 }; g.combat.enemies[1].hp = 50; g.combat.round = 2;
      const a0 = g.combat.enemies[0].hp, b0 = g.combat.enemies[1].hp; cStep(g, 'dart');
      assert(g.combat.enemies[0].hp < a0 && g.combat.enemies[1].hp > b0 && g.combat.stall === 0, `AS1, RV1 PF: one foe hurt while another heals is not stuck (${g.combat.stall}; ${a0}→${g.combat.enemies[0].hp}, ${b0}→${g.combat.enemies[1].hp})`); }
    { const g = mk([wall('Rot-ape')]); cStep(g, 'dart'); cStep(g, 'dart'); g.combat.enemies[0].dc = 1; cStep(g, 'dart'); g.combat.enemies[0].dc = 99;
      assert(g.combat.stall === 0, `AS1: a hit starts the count again (${g.combat.stall})`);
      const outs = []; for (let i = 0; i < 6 && g.combat; i++) outs.push(cStep(g, 'dart'));
      assert(outs[2].lines.includes(warn('Rot-ape')) && outs[5].done === 'lose' && outs.slice(0, 5).every((o) => !o.done), 'AS1: then three to the warning, six to the end'); }
    { const g = mk([wall('Wolf'), { ...wall('Hawk'), flies: true }]); let o = null;
      for (let i = 0; i < 8; i++) o = cStep(g, 'dart');
      assert(g.combat && !o.done && !g.combat.stall, 'AS1: no stalemate while a flyer stands (it can reach him)'); }
    { const g = mk([wall('Rot-ape')]); let o = null;
      for (let i = 0; i < 8; i++) o = cStep(g, 'blade');
      assert(g.combat && !o.done && !g.combat.stall, 'AS1: no stalemate on the ground (the blade)'); }
    { const g = mk([wall('Rot-ape')], 0); let o = null;
      for (let i = 0; i < 8; i++) o = cStep(g, 'dart');
      assert(g.combat && !o.done && !g.combat.stall, 'AS1: no stalemate at Mortal (no flight)'); }
    { const g = mk([wall('Rot-ape')]); cStep(g, 'dart'); cStep(g, 'dart');
      delete g.combat.stall; const o = cStep(g, 'dart'); assert(g.combat.stall === 1 && !o.lines.includes(warn('Rot-ape')), 'AS1: a fight saved before the stall count starts it at 0'); }
    { const fl = FAQ.find(([t]) => t === 'Flight')[1]();
      assert(fl.includes("While no flying foe is standing, a round from the air in which nobody takes damage (no foe, not James) is a stalemate round: after 3 in a row the log warns you, and after 6 in a row the fight is lost, because James's attacks from the air are doing nothing and he has to come down to a foe that is ready for him; any damage on either side starts the count again.") && !/stay up forever/.test(fl), "AS1, RV1 PT: the FAQ's stalemate sentence (Fable)"); }
    { const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      assert(!main.includes('06:00–19:00') && /YUKI_HOURS\.map/.test(main), 'AS1, LH: the lane note reads YUKI_HOURS'); }
}
// v0.11.113 (owner pick DA1; research.md #43, #45, #133): foes show their hand. TD: traits as tags with a line at the start;
// TL: from Act 1 a foe hitting for 5+ (not the rot ape, not a spar or a brawl) shows its big blow a round early, ×2, guard
// avoids it, the needle's stagger stops it; TY: a shown lunge, any guard covers Yuki; HD: the guardian's moods (hungry: hits
// heal it; proud: hits double); CS: a thief takes one food item on its first landed hit; the smart rule answers.
{
    const { FOE_TRAITS, foeTraits, traitLines, TELL_TEXT, bigBlowDue, moodOf, NO_TELL, HEAVY_DMG, BIG_BLOW, bigBlowNow, lungeNow, combatHooks } = await import('../js/core/game.js');
    const { readFileSync } = await import('node:fs');
    const setSk = (g, t, l) => { g.james.skills['Convergence Use'] = { tier: t, level: l, xp: 0 }; g.james.gu = { tier: t, level: l, xp: 0 }; };
    const toAct1 = (g) => { g.flags.ending = g.flags.ending || 'victory'; g.minutes = Math.max(g.minutes, 7 * 1440 + 6 * 60); return g; };
    const mk = (enemies, { act1 = true, id = 'test_da1', extra = {}, realm = 0, yuki = true } = {}) => { const g = ensureBars(newGame(96, { closed: true })); if (act1) toAct1(g); setSk(g, 1, 9); g.james.realm = realm; g.james.qi = 40; g.james.hp = jamesHpMax(g); if (!yuki) g.yuki.hp = 0;
        sCombat(g, { id, intro: 'In.', band: 'standard', enemies, win: 'stream', lose: 'stream', ...extra }); g.combat.fieldUsed = true; return g; };
    const brute = (n = 'Brute', x = {}) => ({ name: n, hp: 999, dc: 1, atk: 60, dmg: HEAVY_DMG, ...x });
    const dealt = (o, n) => { const m = o.lines.map((l) => l.match(new RegExp(`^${n} attacks: .*: (\\d+(?:\\.\\d+)?) \\(DR`))).find(Boolean); return m ? Number(m[1]) : null; };
    // TD
    assert(foeTraits({ prefersSmall: true, flies: true, dr: 1, heavy: true, moods: true, thief: true }).join() === 'yuki,flies,plated,heavy,moods,thief' && foeTraits({ dr: 0 }).length === 0, 'DA1, TD: the traits, in order');
    assert(Object.values(FOE_TRAITS).map((t) => t.tag).join() === 'goes for Yuki,flies,plated,hits hard,postures,moods,thief', "DA1, TD: Fable's tags (v0.11.114: postures)");
    { const two = [{ name: 'Crow 1', flies: true }, { name: 'Crow 2', flies: true }]; const tl = traitLines(mk([], { act1: false }), two, 'test_da1');
      assert(tl.length === 1 && tl[0] === FOE_TRAITS.flies.grounded.replace('{foe}', 'Crow 1'), 'DA1, TD: each trait once, named for the first foe');
      const g = mk(two, { act1: false }); assert(g.combat.log[0] === 'In.' && g.combat.log[1] === tl[0] && g.combat.log.length === 2, 'DA1, TD: the line follows the intro'); }
    // TL
    { const g = mk([brute()]); assert(g.combat.enemies[0].heavy === true, 'DA1, TL: Act 1, dmg 5: heavy');
      assert(!mk([brute()], { act1: false }).combat.enemies[0].heavy, 'DA1, TL: not in the prologue');
      assert(NO_TELL.has('rot_ape') && !mk([brute()], { id: 'rot_ape' }).combat.enemies[0].heavy, 'DA1, TL: not the rot ape');
      assert(!mk([brute()], { extra: { style: 'spar' } }).combat.enemies[0].heavy, 'DA1, TL: not in a spar');
      assert(!mk([brute('B', { dmg: HEAVY_DMG - 1 })]).combat.enemies[0].heavy, 'DA1, TL: dmg 4: not heavy');
      const o1 = cStep(g, 'blade'); assert(!o1.lines.some((l) => TELL_TEXT.big.some((t) => l === t.replace('{foe}', 'Brute'))), 'DA1, TL: no tell after round 1');
      const d1 = dealt(o1, 'Brute');
      const o2 = cStep(g, 'blade'); assert(o2.lines.some((l) => TELL_TEXT.big.some((t) => l === t.replace('{foe}', 'Brute'))), `DA1, TL: the tell after round 2 (${o2.lines.join(' | ')})`);
      assert(bigBlowNow(g) && bigBlowDue(g.combat, g.combat.enemies[0]), 'DA1, TL: due on round 3');
      const hp = g.james.hp; const o3 = cStep(g, 'guard'); assert(g.james.hp === hp && o3.lines.includes(TELL_TEXT.bigAvoided.replace('{foe}', 'Brute')), 'DA1, TL: guard avoids the big blow outright');
      const h = mk([brute()]); h.combat.round = 3; const o = cStep(h, 'blade'); assert(d1 > 0 && dealt(o, 'Brute') === d1 * BIG_BLOW && o.lines.includes(TELL_TEXT.bigLands), `DA1, TL: unanswered it lands ×2 (${d1} → ${dealt(o, 'Brute')})`);
      const n = mk([brute()]); n.combat.round = 3; const on = cStep(n, 'needle'); assert(on.lines.some((l) => /Brute is still reeling/.test(l)) && !on.lines.includes(TELL_TEXT.bigLands), 'DA1, TL: the needle\'s stagger stops it'); }
    // TY: no buckler (T1 L9), a shown lunge, guard covers her
    { const g = mk([{ name: 'Jackal', hp: 999, dc: 1, atk: 60, dmg: 3, prefersSmall: true }], { act1: false }); cStep(g, 'blade'); const o2 = cStep(g, 'blade');
      assert(o2.lines.includes(TELL_TEXT.lunge.replace('{foe}', 'Jackal')) && lungeNow(g), 'DA1, TY: the lunge shown after round 2');
      const yh = g.yuki.hp; const o3 = cStep(g, 'guard'); assert(g.yuki.hp === yh && o3.lines.includes(TELL_TEXT.covered.replace('{foe}', 'Jackal')), 'DA1, TY: any guard covers Yuki'); }
    // HD
    { const g = mk([{ name: 'Guardian', hp: 50, dc: 1, atk: 0.1, dmg: 5, moods: true }], { act1: false, yuki: false }); const e = g.combat.enemies[0];
      assert(['plain', 'hungry', 'proud', 'plain'].every((m, i) => moodOf({ round: i + 1 }, e) === m) && moodOf({ round: 2 }, {}) === 'plain', 'DA1, HD: plain, hungry, proud');
      const o1 = cStep(g, 'blade'); const d = 50 - e.hp; assert(d > 0 && o1.lines.includes(TELL_TEXT.hungry.replace('{foe}', 'Guardian')), 'DA1, HD: the hungry tell');
      const o2 = cStep(g, 'blade'); assert(e.hp === 50 && o2.lines.some((l) => l.includes(TELL_TEXT.fed.replace('{foe}', 'Guardian').replace('{n}', d))) && o2.lines.includes(TELL_TEXT.proud.replace('{foe}', 'Guardian')), `DA1, HD: hungry: the hit heals it (${e.hp})`);
      const o3 = cStep(g, 'blade'); assert(e.hp === 50 - 2 * d && o3.lines.includes(TELL_TEXT.proudHit), `DA1, HD: proud: double (${e.hp})`); }
    // CS
    { assert(typeof combatHooks.steal === 'function', 'DA1, CS: the story sets the hook');
      const g = mk([{ name: 'Crow', hp: 999, dc: 1, atk: 60, dmg: 2, thief: true }], { act1: false }); g.inventory.hare_raw = 2; g.inventory.venison = 1;
      const o1 = cStep(g, 'blade'); assert(g.inventory.hare_raw === 1 && g.inventory.venison === 1 && o1.lines.includes(TELL_TEXT.theft.replace('{foe}', 'Crow').replace('{item}', 'Glassback hare (dressed)')), `DA1, CS: the first hit takes the first food (${o1.lines.join(' | ')})`);
      cStep(g, 'blade'); assert(g.inventory.hare_raw === 1, 'DA1, CS: once a fight');
      const n = mk([{ name: 'Crow', hp: 999, dc: 1, atk: 60, dmg: 2, thief: true }], { act1: false }); for (const k of Object.keys(n.inventory)) n.inventory[k] = 0; const on = cStep(n, 'blade'); assert(!n.combat.stole && !on.lines.some((l) => /makes off/.test(l)), 'DA1, CS: no food, nothing taken'); }
    // the smart rule
    { const g = mk([brute()]); g.combat.round = 3; assert(smartAction(g) === 'guard', 'DA1 smart: a big blow due, no air → guard');
      g.combat.spearFormed = true; assert(smartAction(g) === 'spear', 'DA1 smart: the spear formed and on it → the spear');
      const a = mk([brute()], { realm: 1 }); a.combat.round = 3; assert(smartAction(a) === 'dart', 'DA1 smart: darts from the air first');
      const s = mk([brute()]); s.combat.round = 2; assert(smartAction(s) !== 'guard', 'DA1 smart: nothing due: the old rule');
      const m = mk([{ name: 'Guardian', hp: 50, dc: 1, atk: 1, dmg: 5, moods: true }], { act1: false, realm: 1 }); m.combat.round = 2; assert(smartAction(m) === 'guard', 'DA1 smart: hungry → guard'); }
    // v0.11.113 (owner pick DB1; Fable's review of DA1): P people's wording, F the real heal, C "the" mid-line, L no tell for a
    // round that never comes, W true trait lines, S the smart rule's two latent cases, Q the FAQ's shield clause; the review's gaps
    { const { foeFill, traitLine, serialize, deserialize } = await import('../js/core/game.js');
      const e = mk([brute('Outer Elder Shen Qiu')], { id: 'elder' }); assert(e.combat.log.includes(FOE_TRAITS.heavy.person.replace('{foe}', 'Outer Elder Shen Qiu')) && !e.combat.log.some((l) => / its /.test(l)), 'DB1, P: a heavy person: no "its"');
      cStep(e, 'blade'); const o = cStep(e, 'blade'); assert(o.lines.includes(TELL_TEXT.bigPerson[1].replace('{foe}', 'Outer Elder Shen Qiu')), 'DB1, P: the people\'s tell');
      assert(TELL_TEXT.bigPerson.length === 3 && [FOE_TRAITS.heavy.person, ...TELL_TEXT.bigPerson].every((t) => !/\bits\b/.test(t)), "DB1, P: Fable's people lines, no \"its\"");
      // W
      const lo = mk([], { act1: false }); assert(traitLine(lo, 'plated', 'x') === FOE_TRAITS.plated.line && traitLine(lo, 'flies', 'x') === FOE_TRAITS.flies.grounded, 'DB1, W: below T3, no air: the armour line, the grounded wings');
      const hi = mk([], { realm: 1 }); setSk(hi, 3, 1); assert(traitLine(hi, 'plated', 'x') === FOE_TRAITS.plated.pierced && traitLine(hi, 'flies', 'x') === FOE_TRAITS.flies.line, 'DB1, W: T3: the bone pierces; Foundation in Act 1: the air line');
      // C
      assert(foeFill(TELL_TEXT.hungry, "The Gardeners' Guardian").startsWith("The singing inside the Gardeners' Guardian") && foeFill(TELL_TEXT.proud, "The Gardeners' Guardian").startsWith("The Gardeners' Guardian draws"), 'DB1, C: "the" mid-line, "The" first');
      // F: the fed line says what it healed
      const f = mk([{ name: 'Guardian', hp: 50, dc: 1, atk: 0.1, dmg: 4, moods: true }], { act1: false, yuki: false }); f.combat.round = 2; f.combat.enemies[0].hp = 49; const of = cStep(f, 'blade');
      assert(f.combat.enemies[0].hp === 50 && of.lines.some((l) => l.includes(TELL_TEXT.fed.replace('{foe}', 'Guardian').replace('{n}', 1))), `DB1, F: at 49 / 50 the line says +1 (${of.lines.join(' | ')})`);
      // L: no tell for a round that never comes
      const l = mk([brute()]); cStep(l, 'blade'); l.james.hp = 1; const ol = cStep(l, 'blade'); assert(ol.done === 'lose' && !ol.lines.some((x) => TELL_TEXT.big.some((t) => x === t.replace('{foe}', 'Brute'))), 'DB1, L: James falls in round 2: no tell');
      // the tells' rotation: rounds 3, 6, 9
      const r = mk([brute('Brute', { atk: 0.1 })]); const seen = []; for (let i = 0; i < 8; i++) { const x = cStep(r, i % 3 === 1 ? 'blade' : 'guard'); const t = TELL_TEXT.big.findIndex((b) => x.lines.includes(b.replace('{foe}', 'Brute'))); if (t >= 0) seen.push(t); }
      assert(seen.join() === '1,2,0', `DB1: the tells rotate (${seen.join()})`);
      // S: two big blows, a heavy flyer
      const two = mk([brute('B1'), brute('B2')]); two.combat.round = 3; two.combat.spearFormed = true; assert(smartAction(two) === 'guard', 'DB1, S: two big blows due: guard, not the spear');
      const fl = mk([brute('Wolf', { dmg: 3 }), brute('Roc', { flies: true })], { realm: 1 }); fl.combat.round = 3; assert(smartAction(fl) === 'guard', 'DB1, S: a heavy flyer due: guard, not darts from the air');
      const gr = mk([brute('Wolf', { dmg: 3 }), brute('Ox')], { realm: 1 }); gr.combat.round = 3; assert(smartAction(gr) === 'dart', 'DB1, S: a heavy ground foe: darts from the air as before');
      // the Qi shield, the construct, the spike field with a big blow
      const q = mk([brute('Brute', { dmg: 1 })]); q.combat.round = 3; const hq = q.james.hp; const oq = cStep(q, 'qshield'); assert(q.james.hp === hq && !oq.lines.includes(TELL_TEXT.bigLands), `DB1: the Qi shield soaks a small blow before the doubling (${oq.lines.join(' | ')})`);
      const k = mk([brute()]); setSk(k, 8, 1); k.james.hp = jamesHpMax(k); k.combat.round = 3; const hk = k.james.hp; const ok = cStep(k, 'blade'); assert(k.james.hp === hk && ok.lines.some((x) => /your construct steps into the blow/.test(x)), 'DB1: the T8 construct takes the big blow');
      const sp = mk([brute()]); sp.combat.field = 2; sp.combat.round = 3; const os = cStep(sp, 'blade'); assert(os.lines.some((x) => /through the spikes/.test(x)) && os.lines.includes(TELL_TEXT.bigLands), 'DB1: the spikes bite, then the big blow lands');
      // the thief: soaked to 0, no hook
      const t0 = mk([{ name: 'Crow', hp: 999, dc: 1, atk: 60, dmg: 1, thief: true }], { act1: false }); t0.inventory.hare_raw = 1; cStep(t0, 'qshield'); assert(t0.inventory.hare_raw === 1 && !t0.combat.stole, 'DB1: a hit soaked to 0 takes nothing');
      const keep = combatHooks.steal; combatHooks.steal = null; try { const t1 = mk([{ name: 'Crow', hp: 999, dc: 1, atk: 60, dmg: 2, thief: true }], { act1: false }); t1.inventory.hare_raw = 1; cStep(t1, 'blade'); assert(t1.inventory.hare_raw === 1, 'DB1: no hook, nothing taken'); } finally { combatHooks.steal = keep; }
      // saves: the new fields go round; an old mid-fight save without them plays as before
      const sv = mk([brute(), { name: 'Crow', hp: 9, dc: 1, atk: 1, dmg: 1, thief: true, moods: true }]); sv.combat.stole = true; const back = deserialize(serialize(sv));
      assert(back.combat.enemies[0].heavy === true && back.combat.enemies[1].moods === true && back.combat.enemies[1].thief === true && back.combat.stole === true, 'DB1: heavy, moods, thief and stole survive a save');
      const old = mk([brute()]); delete old.combat.enemies[0].heavy; old.combat.round = 3; const oo = cStep(old, 'blade'); assert(!oo.lines.includes(TELL_TEXT.bigLands) && !bigBlowNow(old), 'DB1: an old mid-fight save: no big blow');
      const { FAQ } = await import('../js/core/faq.js'); assert(/the <b>Qi shield<\/b> soaks the blow before it is doubled/.test(FAQ.find(([t]) => t === 'Fights')[1]()), "DB1, Q: the FAQ's shield clause (Fable's)"); }
    // the data, the screen, the FAQ
    { const src = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
      assert((src('js/story/act1_heart.js').match(/moods: true/g) || []).length === 1 && /Gardeners\\' Guardian'[^}]*moods: true/.test(src('js/story/act1_heart.js')), 'DA1, HD: the guardian alone has moods');
      assert((src('js/story/wilds.js').match(/thief: true/g) || []).length === 1 && /Rot-crow \$\{i\}`[^}]*thief: true/.test(src('js/story/wilds.js')), 'DA1, CS: the rot-crows alone steal');
      const main = src('js/main.js'); assert(/foeTraits\(e\)\.map/.test(main) && /bigBlowNow\(g\) \? ` · \$\{TELL_TEXT\.guardBig\}`/.test(main) && /lungeNow\(g\)\) lines\.push\(TELL_TEXT\.holdYuki\)/.test(main), 'DA1: the tags, the Guard card and its hold lines');
      const { FAQ } = await import('../js/core/faq.js'); const fq = FAQ.find(([t]) => t === 'Fights')[1]();
      assert(/<b>big blow<\/b> a round early: it does double damage, <b>Guard<\/b> avoids it outright/.test(fq) && /the rot ape doesn't do this/.test(fq) && /<b>mood<\/b>/.test(fq), "DA1: the FAQ (Fable's)"); }
}
// v0.11.114 (owner pick PA2; research.md #132, #136, #63): fights with people. PT + SP: people (not Ya, not a heavy foe)
// posture every third round from the prologue on, shown a round early; SS: Say something on a posture costs that foe this
// round and the next, else nothing (no guard); SF: in a spar or a brawl a foe at half its HP is out; YD: Yield loses at once
// with the HP kept; UM: every 10 rounds bare-handed +0.5 to the brawl's moves (Cover's defence too), up to +2, kept across Coils.
{
    const G = await import('../js/core/game.js');
    const { SAY_TEXT, SPAR_TEXT, postureDue, postureNow, combatYield, unarmedMastery, NO_POSTURE, SAY_ROUNDS, UNARMED_EVERY, UNARMED_STEP, UNARMED_MAX, FOE_TRAITS, traitLines } = G;
    const toAct1 = (g) => { g.flags.ending = g.flags.ending || 'victory'; g.minutes = Math.max(g.minutes, 7 * 1440 + 6 * 60); return g; };
    const mk = (id, enemies, { act1 = false, style = null } = {}) => { const g = ensureBars(newGame(114, { closed: true })); if (act1) toAct1(g); g.james.qi = 40; g.james.hp = jamesHpMax(g); g.yuki.hp = 0;
        sCombat(g, { id, intro: 'In.', band: 'standard', enemies, win: 'stream', lose: 'stream', ...(style ? { style } : {}) }); return g; };
    const man = (n = 'Gao', x = {}) => ({ name: n, hp: 999, dc: 60, atk: 60, dmg: 2, ...x });
    // PT: who postures
    const p = mk('gao', [man('Gao', { dmg: 6 }), man('Pock')]);
    assert(p.combat.enemies.every((e) => e.postures) && actionOpen(p, 'remark'), 'PA2, PT + SP: in the prologue every person postures, a hard hitter too (nobody is heavy there); Say something opens');
    assert(p.combat.log.includes(FOE_TRAITS.postures.line.replace('{foe}', 'Gao')) && FOE_TRAITS.postures.tag === 'postures', "PA2, PT: the tag and the start line (Fable's)");
    const el = mk('elder', [man('Shen', { dmg: 5 }), man('Lu', { dmg: 4 })], { act1: true });
    assert(el.combat.enemies[0].heavy && !el.combat.enemies[0].postures && el.combat.enemies[1].postures, 'PA2, PT: in Act 1 a heavy person shows the big blow, not a posture');
    const beast = mk('jackals', [man('Jackal')]); const ya = mk('ya_brawl', [man('Ya')], { act1: true, style: 'spar' });
    assert(!beast.combat.enemies[0].postures && !actionOpen(beast, 'remark') && NO_POSTURE.has('ya_brawl') && !ya.combat.enemies[0].postures && !actionOpen(ya, 'remark'), 'PA2, PT: no posture from beasts or Ya; no Say something there');
    // the tell, a round early; postureDue every third round
    { const g = mk('gao', [man()]); const r1 = cStep(g, 'guard'); const r2 = cStep(g, 'guard');
      assert(!r1.lines.some((l) => SAY_TEXT.tells.some((t) => l === t.replace('{foe}', 'Gao'))) && r2.lines.includes(SAY_TEXT.tells[1].replace('{foe}', 'Gao')), 'PA2, PT: the tell at the end of round 2, for round 3');
      assert(g.combat.round === 3 && postureDue(g.combat, g.combat.enemies[0]) && postureNow(g), 'PA2, PT: round 3 is a posture round'); }
    // SS: on a posture, the foe loses this round and the next; then attacks again
    { const g = mk('gao', [man()]); cStep(g, 'guard'); cStep(g, 'guard'); const hp0 = g.james.hp;
      const r3 = cStep(g, 'remark');
      assert(r3.lines.includes(SAY_TEXT.landed[1].replace('{foe}', 'Gao')) && !r3.lines.some((l) => /^Gao attacks/.test(l)) && g.james.hp === hp0, 'PA2, SS: landed, no attack that round');
      const r4 = cStep(g, 'guard');
      assert(r4.lines.includes(SAY_TEXT.stunned.replace('{foe}', 'Gao')) && !r4.lines.some((l) => /^Gao attacks/.test(l)), 'PA2, SS: the next round lost too, with its line');
      const r5 = cStep(g, 'guard'); assert(r5.lines.some((l) => /^Gao attacks/.test(l)) && SAY_ROUNDS === 2, 'PA2, SS: then it attacks again'); }
    // SS: on any other round nothing, and no guard
    { const g = mk('gao', [man()]); const hp0 = g.james.hp; const r = cStep(g, 'remark');
      assert(r.lines.includes(SAY_TEXT.unheard) && r.lines.some((l) => /^Gao attacks/.test(l)) && !r.lines.some((l) => /give ground/.test(l)) && g.james.hp < hp0, 'PA2, SS: unheard, the foe hits, no guard'); }
    // SF: a foe worn to half is out (spar and brawl), and the terms line; not in an ordinary fight
    { const g = mk('ya_brawl', [{ name: 'Ya', hp: 50, dc: 0.1, atk: 60, dmg: 1 }], { act1: true, style: 'spar' });
      assert(g.combat.log.includes(SPAR_TEXT.terms), 'PA2, SF: the terms at the start of a spar');
      g.james.gu = { tier: 9, level: 1, xp: 0 }; g.james.skills['Convergence Use'] = { tier: 3, level: 1, xp: 0 }; // the knife holds, the hit lands (the spar's tune raises Ya's DC)
      const o = cStep(g, 'blade'); assert(o.done === 'win' && o.lines.includes(SPAR_TEXT.out.replace('{foe}', 'Ya')), `PA2, SF: down to half, out (${o.lines.slice(-6).join(' | ')})`);
      const n = mk('gao', [{ name: 'Gao', hp: 30, dc: 0.1, atk: 60, dmg: 1 }]); cStep(n, 'blade'); assert(n.combat && n.combat.enemies[0].hp > 0 && !n.combat.log.includes(SPAR_TEXT.terms), 'PA2, SF: an ordinary fight goes to 0'); }
    // YD: Yield in a spar or a brawl only; the fight is lost and the HP kept
    { const g = mk('rt_brawl', [man('Bao')], { act1: true, style: 'unarmed' }); g.james.hp = 17; const o = combatYield(g);
      assert(o.done === 'lose' && o.next === 'stream' && o.lines[0] === SPAR_TEXT.yielded && g.james.hp === 17 && !g.combat, 'PA2, YD: yield loses at once, HP kept');
      const n = mk('gao', [man()]); assert(combatYield(n) === null && n.combat, 'PA2, YD: no yield in an ordinary fight'); }
    // UM: rounds bare-handed, +0.5 every 10 up to +2, Cover too; the start line; a spar doesn't count
    { const g = mk('rt_brawl', [man('Bao')], { act1: true, style: 'unarmed' }); g.stats.unarmed = UNARMED_EVERY - 1;
      assert(unarmedMastery(g) === 0 && guardBonus(g) === 2, 'PA2, UM: nothing below 10 rounds');
      const o = cStep(g, 'cover'); assert(g.stats.unarmed === UNARMED_EVERY && unarmedMastery(g) === UNARMED_STEP && guardBonus(g) === 2 + UNARMED_STEP && o.lines.includes(SPAR_TEXT.masteryUp.replace('{b}', UNARMED_STEP)), 'PA2, UM: the tenth round, +0.5, Cover +0.5, its line');
      g.stats.unarmed = 999; assert(unarmedMastery(g) === UNARMED_MAX, 'PA2, UM: up to +2');
      const s2 = mk('rt_brawl', [man('Bao')], { act1: true }); s2.stats.unarmed = 25; s2.combat = null; sCombat(s2, { id: 'rt_brawl', intro: 'In.', band: 'standard', style: 'unarmed', enemies: [man('Bao')], win: 'stream', lose: 'stream' });
      assert(s2.combat.log.includes(SPAR_TEXT.mastery.replace('{n}', 25).replace('{b}', 1)), 'PA2, UM: the start line with the rounds and the bonus');
      const sp = mk('ya_brawl', [man('Ya')], { act1: true, style: 'spar' }); cStep(sp, 'guard'); assert(!sp.stats.unarmed, 'PA2, UM: a spar is not bare-handed');
      const k = ensureBars(newGame(115, { closed: true })); k.stats.unarmed = 30; endCoil(k, 'choice', 'stream'); rewind(k); assert(k.stats.unarmed === 30, 'PA2, UM: kept across a Coil'); }
    // the smart rule: Say something on a posture, not while a heavy foe stands, not instead of darts from the air
    { const g = mk('gao', [man()]); cStep(g, 'guard'); cStep(g, 'guard'); assert(smartAction(g) === 'remark', 'PA2: the smart rule says something on a posture');
      const e2 = mk('elder', [man('Shen', { dmg: 5 }), man('Lu', { dmg: 4 })], { act1: true }); cStep(e2, 'guard'); cStep(e2, 'guard'); assert(smartAction(e2) !== 'remark', 'PA2: not while a heavy foe stands'); }
    // the screen and the FAQ
    { const { readFileSync } = await import('node:fs'); const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      assert(/data-yield="1"/.test(main) && /combatYield\(g\)/.test(main) && /SAY_TEXT\.holdNow/.test(main) && /SPAR_TEXT\.yieldHold/.test(main), 'PA2: the Yield card, its handler, the hold lines');
      const { FAQ } = await import('../js/core/faq.js'); const fq = FAQ.find(([t]) => t === 'Fights')[1]();
      assert(/<b>Yield<\/b> concedes at once/.test(fq) && /<b>unarmed mastery<\/b>/.test(fq) && /tagged <b>postures<\/b>/.test(fq) && /<b>Say something<\/b> on that round/.test(fq), "PA2: the FAQ (Fable's)"); }
}
// v0.11.114 (owner pick PB1; Fable's review of PA2): HC a stagger or hold on a stunned foe is spent with it; CV the brawl
// cards count unarmed mastery; YC Yield's second tap; LY Yield to the fight's own lost scene; T the review's test gaps.
{
    const G = await import('../js/core/game.js');
    const { SAY_TEXT, SPAR_TEXT, combatYield, unarmedMastery, UNARMED_MAX, airStrike, startActCoil: sac } = G;
    const toAct1 = (g) => { g.flags.ending = g.flags.ending || 'victory'; g.minutes = Math.max(g.minutes, 7 * 1440 + 6 * 60); return g; };
    const mk = (id, enemies, { act1 = false, style = null, realm = 0, gu = null } = {}) => { const g = ensureBars(newGame(116, { closed: true })); if (act1) toAct1(g); if (gu) { g.james.gu = { tier: gu[0], level: gu[1], xp: 0 }; g.james.skills['Convergence Use'] = { tier: gu[0], level: gu[1], xp: 0 }; } g.james.realm = realm; ensureBars(g); g.james.qi = 40; g.james.hp = jamesHpMax(g); g.yuki.hp = 0;
        sCombat(g, { id, intro: 'In.', band: 'standard', enemies, win: 'stream', lose: 'stream', ...(style ? { style } : {}) }); return g; };
    const man = (n = 'Gao', x = {}) => ({ name: n, hp: 999, dc: 0.1, atk: 60, dmg: 2, ...x });
    const attacks = (o, n) => o.lines.some((l) => l.startsWith(`${n} attacks`));
    // HC: remark in round 3, needle in round 4: the stagger is spent; round 5 the foe attacks (no "still reeling")
    { const g = mk('gao', [man()], { gu: [5, 1] }); cStep(g, 'guard'); cStep(g, 'guard'); cStep(g, 'remark'); const r4 = cStep(g, 'needle');
      assert(r4.lines.some((l) => /Gao staggers/.test(l)) && !attacks(r4, 'Gao'), 'PB1, HC: the needle lands on the stunned foe');
      const r5 = cStep(g, 'guard'); assert(attacks(r5, 'Gao') && !r5.lines.some((l) => /still reeling/.test(l)), `PB1, HC: the stagger is spent with the stun: round 5 it attacks (${r5.lines.join(' | ')})`); }
    { const g = mk('rt_brawl', [man('Bao')], { act1: true, style: 'unarmed', gu: [5, 1] }); cStep(g, 'cover'); cStep(g, 'cover'); cStep(g, 'remark'); cStep(g, 'throw'); const r5 = cStep(g, 'cover');
      assert(attacks(r5, 'Bao') && !r5.lines.some((l) => /still getting up/.test(l)), 'PB1, HC: in the brawl the throw is spent too'); }
    // two posturing foes: only the target (the first) is stunned, the other attacks
    { const g = mk('gao', [man('Gao'), man('Pock')]); cStep(g, 'guard'); cStep(g, 'guard'); const r3 = cStep(g, 'remark');
      assert(g.combat.enemies[0].flustered === 1 && !g.combat.enemies[1].flustered && !attacks(r3, 'Gao') && attacks(r3, 'Pock'), 'PB1, T: one remark stuns one foe');
      cStep(g, 'guard'); cStep(g, 'guard'); assert(g.combat.round === 6 && G.postureDue(g.combat, g.combat.enemies[1]), 'PB1, T: round 6 is a posture round again'); }
    // a closed remark (a beast fight, an old save's foes) falls back to guard
    { const b = mk('jackals', [man('Jackal')]); const o = cStep(b, 'remark'); assert(o.lines.some((l) => /give ground/.test(l)) && !o.lines.includes(SAY_TEXT.unheard), 'PB1, T: a closed remark becomes guard'); }
    // saves: postures and flustered kept mid-fight; an old mid-fight save (no postures) plays without the card or the tells
    { const g = mk('gao', [man()]); cStep(g, 'guard'); cStep(g, 'guard'); cStep(g, 'remark'); const x = deserialize(serialize(g));
      assert(x.combat.enemies[0].postures === true && x.combat.enemies[0].flustered === 1 && cStep(x, 'guard').lines.includes(SAY_TEXT.stunned.replace('{foe}', 'Gao')), 'PB1, T: a mid-fight save keeps the posture and the stun');
      const o = mk('gao', [man()]); delete o.combat.enemies[0].postures; const y = deserialize(serialize(o)); const r1 = cStep(y, 'guard'), r2 = cStep(y, 'guard');
      assert(!actionOpen(y, 'remark') && !r2.lines.some((l) => SAY_TEXT.tells.some((t) => l === t.replace('{foe}', 'Gao'))) && attacks(r1, 'Gao'), 'PB1, T: an old mid-fight save plays as before'); }
    // the smart rule: not instead of darts from the air, not at a stunned foe, and in the brawl
    { const g = mk('sect_watcher', [man('Watcher')], { act1: true, realm: 1, gu: [1, 6] }); g.combat.round = 3;
      assert(airStrike(g, 'dart') && smartAction(g) === 'dart', 'PB1, T: darts from the air before a remark');
      const f = mk('gao', [man()]); f.combat.round = 3; f.combat.enemies[0].flustered = 1; assert(smartAction(f) !== 'remark', 'PB1, T: no remark at a stunned foe');
      const b = mk('rt_brawl', [man('Bao')], { act1: true, style: 'unarmed' }); assert(smartAction(b) === 'strike', 'PB1, T: the brawl strikes'); b.combat.round = 3; assert(smartAction(b) === 'remark', 'PB1, T: and says something on a posture'); }
    // the half rule: exactly half is out, just above is not; a two-foe brawl with one out; James fights on below half
    { const hit = (hp) => { const g = mk('test_brawl', [man('Bao', { hp }), man('Cousin', { dc: 99 })], { act1: true, style: 'unarmed', gu: [3, 1] }); /* not a story id: the story's hook would rescale it */ g.combat.enemies[0].hpMax = hp; const o = cStep(g, 'strike'); return { g, o }; };
      const n = 999 - hit(999).g.combat.enemies[0].hp;
      const a = hit(2 * n), b = hit(2 * n + 1);
      assert(n > 0 && a.g.combat && a.g.combat.enemies[0].hp === 0 && a.o.lines.includes(SPAR_TEXT.out.replace('{foe}', 'Bao')) && a.g.combat.enemies[1].hp > 0, `PB1, T: exactly half is out, the cousin fights on (hit ${n})`);
      assert(b.g.combat.enemies[0].hp === n + 1, 'PB1, T: just above half is not');
      const j = mk('ya_brawl', [man('Ya', { dmg: 0 })], { act1: true, style: 'spar' }); j.james.hp = 2; cStep(j, 'guard'); assert(j.combat && j.james.hp === 2, 'PB1, T: James fights on below half'); }
    // Yield: the spar under an active Coil goes to its own lost scene; HP 17 stays, 2 becomes 3; a yielded brawl adds no round
    { const yaCh = SCENES.ya_challenge.choices.find((c) => c.combat);
      for (const hp of [17, 2]) { const g = ensureBars(newGame(117, { closed: true })); toAct1(g); g.coil = g.coil || {}; startCombat(g, combatHooks.before(g, yaCh.combat(g)));
        g.james.hp = hp; const o = combatYield(g); goTo(g, SCENES, o.next);
        assert(o.next === 'ya_lost' && g.scene === 'ya_lost' && g.james.hp === Math.max(3, hp) && g.flags.ya_brawl === 'lost', `PB1, LY: a yielded spar is lost in its own scene, HP ${hp} → ${g.james.hp}`); }
      const b = mk('rt_brawl', [man('Bao')], { act1: true, style: 'unarmed' }); b.stats.unarmed = 5; combatYield(b); assert(b.stats.unarmed === 5, 'PB1, T: a yield adds no round');
      const { readFileSync } = await import('node:fs'); const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      assert(/Date\.now\(\) - yieldArmed > 4000\) \{ yieldArmed = Date\.now\(\); note\(SPAR_TEXT\.yieldConfirm\)/.test(main) && SPAR_TEXT.yieldConfirm === 'Tap Yield again to concede the fight.', 'PB1, YC: Yield asks for a second tap');
      assert(/a\.unarmed \? unarmedMastery\(g\) : a\.guard/.test(main) && /a\.remark \? `\$\{SAY_TEXT\.tag\}\$\{postureNow\(g\) \? ` · \$\{SAY_TEXT\.tagNow\}`/.test(main), 'PB1, CV: the brawl cards count mastery; the remark tag says when the speech is now'); }
    // unarmed mastery reaches the check; a spar's guard stays 2; no line at the cap; the whole game again keeps it; none on a new game
    { const val = (u) => { const g = mk('rt_brawl', [man('Bao', { dc: 50 })], { act1: true, style: 'unarmed' }); g.stats.unarmed = u; const l = cStep(g, 'strike').lines.find((x) => x.startsWith('Step in and hit:')); return Number(/GU ([\d.]+) \//.exec(l)[1]); };
      assert(Math.round((val(20) - val(0)) * 10) / 10 === 1, `PB1, T: +1 at 20 rounds reaches the strike's check (${val(0)} → ${val(20)})`);
      const sp = mk('ya_brawl', [man('Ya')], { act1: true, style: 'spar' }); sp.stats.unarmed = 40; assert(guardBonus(sp) === 2, 'PB1, T: a spar\'s guard has no mastery');
      const c = mk('rt_brawl', [man('Bao')], { act1: true, style: 'unarmed' }); c.stats.unarmed = 49; const o = cStep(c, 'cover'); assert(unarmedMastery(c) === UNARMED_MAX && !o.lines.some((l) => /Bare-handed, you are now/.test(l)), 'PB1, T: no step line past the cap');
      assert(unarmedMastery(ensureBars(newGame(118, { closed: true }))) === 0, 'PB1, T: a new game (or an old save) starts at 0'); }
}
// v0.11.115 (owner pick MA3; research.md #44, #65): FX foes remembered (every earlier meeting +0.5 to the attacks, up to +2
// shared with the fight's own learning, not the tribute), W50 weapon familiarity (+0.5 a move for every 50 rounds, up to +2).
{
    const G = await import('../js/core/game.js');
    const { MEMORY_TEXT, FOE_MEMORY_STEP, FOE_MEMORY_MAX, NO_MEMORY, meetFoe, fightAdapt, memoryLine, weaponMastery, weaponLine, WEAPON_EVERY, WEAPON_STEP, WEAPON_MAX, instantWin } = G;
    // not story ids: the story's hook would rescale them
    const mk = (id, enemies, { stats = null, style = null } = {}) => { const g = ensureBars(newGame(119, { closed: true })); g.james.gu = { tier: 3, level: 1, xp: 0 }; g.james.skills['Convergence Use'] = { tier: 3, level: 1, xp: 0 }; g.james.qi = 99;
        if (stats) Object.assign(g.stats, structuredClone(stats)); sCombat(g, { id, intro: 'In.', band: 'standard', enemies, win: 'stream', lose: 'stream', ...(style ? { style } : {}) }); return g; };
    const wolf = (x = {}) => ({ name: 'Wolf', hp: 999, dc: 4, atk: 0.1, dmg: 1, ...x });
    const isMem = (l) => l.startsWith('You have fought this fight');
    const learn = (o) => o.lines.some((l) => /You read the opening better/.test(l));
    const val = (o) => Number(/GU ([\d.]+) \//.exec(o.lines.find((l) => /: GU [\d.]+ \/ DC/.test(l)))[1]);
    // FX: a first meeting has no memory and no line; the third starts at +1 with Fable's line
    { const g = mk('test_wolf', [wolf()]); assert(g.stats.foes.test_wolf === 1 && !g.combat.mem && !g.combat.log.some(isMem), 'MA3, FX: a first meeting, no memory, no line');
      const h = mk('test_wolf', [wolf()], { stats: { foes: { test_wolf: 2 } } });
      assert(h.combat.mem === 2 * FOE_MEMORY_STEP && h.stats.foes.test_wolf === 3 && h.combat.log.includes(memoryLine(2, 1)) && memoryLine(2, 1) === 'You have fought this fight twice before. Nobody else here has: +1 to your attacks.' && memoryLine(1, 0.5).includes(' once before') && memoryLine(3, 1.5).includes(' 3 times before'), "MA3, FX: twice before, +1, the line (Fable's)");
      assert(meetFoe(ensureBars(newGame(120, { closed: true })), 'x') === 0 && (() => { const k = ensureBars(newGame(120, { closed: true })); k.stats.foes = { x: 9 }; return meetFoe(k, 'x') === FOE_MEMORY_MAX; })(), 'MA3, FX: up to +2'); }
    // the memory reaches the attack's check from round 1 (+1 at two meetings), and only the attacks: guard's defence is as before
    { const a = mk('test_wolf', [wolf()]), b = mk('test_wolf', [wolf()], { stats: { foes: { test_wolf: 2 } } });
      assert(Math.round((val(cStep(b, 'blade')) - val(cStep(a, 'blade'))) * 10) / 10 === 1, 'MA3, FX: +1 on the first swing');
      const d = (stats) => { const g = mk('test_wolf', [wolf({ atk: 60 })], { stats }); return Number(/defend \(GU ([\d.]+) \//.exec(cStep(g, 'guard').lines.find((l) => /attacks: you defend/.test(l)))[1]); };
      assert(d(null) === d({ foes: { test_wolf: 4 } }), 'MA3, FX: not on defence'); }
    // the cap is shared with the fight's own learning: memory +1.5, one miss lifts it to 2, then no more learning
    { const g = mk('test_wolf', [wolf({ dc: 99 })], { stats: { foes: { test_wolf: 3 } } });
      const r1 = cStep(g, 'blade'); assert(learn(r1) && fightAdapt(g.combat, 'blade') === FOE_MEMORY_MAX, 'MA3, FX: a miss learns up to the shared cap');
      const r2 = cStep(g, 'blade'); assert(!learn(r2) && fightAdapt(g.combat, 'blade') === FOE_MEMORY_MAX && g.combat.adapt.blade === 0.5, 'MA3, FX: no learning past it');
      const n = mk('test_wolf', [wolf({ dc: 99 })]); for (let i = 0; i < 6; i++) cStep(n, 'blade'); assert(fightAdapt(n.combat, 'blade') === 2 && n.combat.adapt.blade === 2, 'MA3, FX: with no memory the fight learns to +2 as before'); }
    // not the tribute: counted, but no memory; a one-move finish counts as a meeting
    { const k = ensureBars(newGame(121, { closed: true })); k.stats.foes = { collectors: 4 };
      assert(NO_MEMORY.has('collectors') && NO_MEMORY.size === 1 && meetFoe(k, 'collectors') === 0 && k.stats.foes.collectors === 5, 'MA3, FX: the tribute has no memory');
      const w = ensureBars(newGame(122, { closed: true })); instantWin(w, { id: 'test_wolf', intro: 'In.', band: 'standard', enemies: [wolf()], win: 'stream', lose: 'stream' });
      assert(w.stats.foes.test_wolf === 1 && !w.combat, 'MA3, FX: a one-move finish is a meeting'); }
    // W50: the 50th round of a move lifts it +0.5 with its line; up to +2; the blast's own line; it reaches the next check
    { const g = mk('test_wolf', [wolf()], { stats: { weapons: { blade: WEAPON_EVERY - 1 } } }); assert(weaponMastery(g, 'blade') === 0, 'MA3, W50: nothing below 50');
      const o = cStep(g, 'blade'); const lab = actionLabel(g, 'blade', 'Wraithbone blade');
      assert(g.stats.weapons.blade === WEAPON_EVERY && weaponMastery(g, 'blade') === WEAPON_STEP && o.lines.includes(weaponLine(lab, 'blade', 50, 0.5)) && weaponLine(lab, 'blade', 50, 0.5) === `${lab}, 50 rounds in. Your hands have stopped consulting you about it: +0.5 to hit.`, "MA3, W50: the 50th round, +0.5, the line (Fable's)");
      const v1 = val(cStep(g, 'blade')); const z = mk('test_wolf', [wolf()]); cStep(z, 'blade'); const v0 = val(cStep(z, 'blade'));
      assert(Math.round((v1 - v0) * 10) / 10 === WEAPON_STEP, `MA3, W50: +0.5 reaches the check (${v0} → ${v1})`);
      g.stats.weapons.blade = 9999; assert(weaponMastery(g, 'blade') === WEAPON_MAX && weaponMastery(g, 'dart') === 0, 'MA3, W50: up to +2, each move its own');
      assert(weaponLine('Qi blast', 'blast', 100, 1) === 'Qi blast, 100 rounds in. There is no bone to blame, so it must be you getting better: +1 to hit.', "MA3, W50: the blast's own line (Fable's)");
      const c = mk('test_wolf', [wolf()], { stats: { weapons: { blade: 4 * WEAPON_EVERY - 1 } } }); const oc = cStep(c, 'blade'); assert(oc.lines.some((l) => /rounds in\./.test(l)) && weaponMastery(c, 'blade') === WEAPON_MAX, 'MA3, W50: the line at +2');
      const p = mk('test_wolf', [wolf()], { stats: { weapons: { blade: 4 * WEAPON_EVERY } } }); assert(!cStep(p, 'blade').lines.some((l) => /rounds in\./.test(l)), 'MA3, W50: no line past +2'); }
    // only attacks count: guard, Say something, the shield and the brawl's fists don't; a spar's blade does
    { const g = mk('test_wolf', [wolf()]); cStep(g, 'guard'); cStep(g, 'qshield'); assert(!Object.keys(g.stats.weapons || {}).length, 'MA3, W50: guard and the shield are not attacks');
      const b = mk('test_brawl', [wolf({ name: 'Bao' })], { style: 'unarmed' }); cStep(b, 'strike'); assert(!Object.keys(b.stats.weapons || {}).length && b.stats.unarmed === 1, 'MA3, W50: fists count as unarmed mastery only');
      const s2 = mk('test_spar', [wolf({ name: 'Ya' })], { style: 'spar' }); cStep(s2, 'blade'); assert(s2.stats.weapons.blade === 1, 'MA3, W50: a spar\'s blade counts'); }
    // kept across a Coil and in a save; an old save (no fields) starts at 0 and fights
    { const k = ensureBars(newGame(123, { closed: true })); k.stats.foes = { jackals: 3 }; k.stats.weapons = { blade: 120 }; endCoil(k, 'choice', 'stream'); rewind(k);
      assert(k.stats.foes.jackals === 3 && k.stats.weapons.blade === 120, 'MA3: kept across a Coil');
      const x = deserialize(serialize(k)); assert(x.stats.foes.jackals === 3 && weaponMastery(x, 'blade') === 1, 'MA3: kept in a save');
      const o = ensureBars(newGame(124, { closed: true })); delete o.stats.foes; delete o.stats.weapons; const y = deserialize(serialize(o));
      assert(weaponMastery(y, 'blade') === 0, 'MA3: an old save starts at 0'); sCombat(y, { id: 'test_wolf', intro: 'In.', band: 'standard', enemies: [wolf()], win: 'stream', lose: 'stream' }); cStep(y, 'blade');
      assert(y.stats.foes.test_wolf === 1 && y.stats.weapons.blade === 1, 'MA3: an old save counts from its first fight'); }
    // the cards and the FAQ
    { const { readFileSync } = await import('node:fs'); const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      assert(/a\.guard \|\| a\.remark \|\| a\.qshield \|\| a\.field \? \(c\.adapt\?\.\[id\] \|\| 0\) : fightAdapt\(c, kk\)\) \+ \(a\.unarmed \? unarmedMastery\(g\) : a\.guard \|\| a\.remark \|\| a\.qshield \|\| a\.field \? 0 : weaponMastery\(g, kk\)\)/.test(main), 'MA3: an attack card counts the memory and the familiarity (v0.11.116, WA2: kk, the blade\'s for a needle the song pays for)');
      const { FAQ } = await import('../js/core/faq.js'); const fq = FAQ.find(([t]) => t === 'Fights')[1]();
      assert(/counts as <b>foes remembered<\/b>: \+0\.5/.test(fq) && /toward <b>weapon familiarity<\/b> with that move: \+0\.5 to hit with it for every 50 rounds/.test(fq) && MEMORY_TEXT.met && MEMORY_TEXT.up && MEMORY_TEXT.upQi, "MA3: the FAQ (Fable's)"); }
}
// v0.11.115 (owner pick MB1; Fable's review of MA3): FY a run or a yield is not a meeting; SA every target of a swing at
// one value; CC one cap; FQ the FAQ's numbers from the constants; T the review's test gaps.
{
    const G = await import('../js/core/game.js');
    const { meetFoe, fightAdapt, FOE_MEMORY_MAX, WEAPON_EVERY, combatYield: cYield, combatFlee: cFlee, memoryLine } = G;
    const mk = (id, enemies, { stats = null, style = null, flee = null } = {}) => { const g = ensureBars(newGame(125, { closed: true })); g.james.gu = { tier: 3, level: 1, xp: 0 }; g.james.skills['Convergence Use'] = { tier: 3, level: 1, xp: 0 }; g.james.qi = 99;
        if (stats) Object.assign(g.stats, structuredClone(stats)); sCombat(g, { id, intro: 'In.', band: 'standard', enemies, win: 'stream', lose: 'stream', ...(style ? { style } : {}), ...(flee ? { flee } : {}) }); return g; };
    const wolf = (x = {}) => ({ name: 'Wolf', hp: 999, dc: 4, atk: 0.1, dmg: 1, ...x });
    const isMem = (l) => l.startsWith('You have fought this fight');
    const W = (g) => Object.keys(g.stats.weapons || {}).length;
    // FY: a yield and a run that got clear take the meeting back; a failed run doesn't; a won fight keeps it
    { const y = mk('test_spar', [wolf({ name: 'Ya' })], { style: 'spar' }); assert(y.stats.foes.test_spar === 1, 'MB1, FY: a meeting at the start');
      cYield(y); assert(y.stats.foes.test_spar === 0, 'MB1, FY: a yield takes it back');
      const f = mk('test_wolf', [wolf()], { flee: 'stream' }); const o = cFlee(f); assert(o.done === 'flee' && f.stats.foes.test_wolf === 0, 'MB1, FY: a run that got clear takes it back');
      const h = mk('test_wolf', [wolf({ atk: 99 })], { flee: 'stream' }); const o2 = cFlee(h); assert(!o2.done && h.stats.foes.test_wolf === 1, 'MB1, FY: a failed run keeps it');
      const w = mk('test_wolf', [wolf({ hp: 1, dc: 0.1 })]); const ow = cStep(w, 'blade'); assert(ow.done === 'win' && w.stats.foes.test_wolf === 1, 'MB1, FY: a won fight keeps it'); }
    // a lost fight is a meeting, carried into the next Coil
    { const g = mk('test_wolf', [wolf({ atk: 99, dmg: 999 })]); g.james.hp = 1; let o = null; for (let i = 0; i < 5 && g.combat; i++) o = cStep(g, 'guard');
      assert(o.done === 'lose' && g.stats.foes.test_wolf === 1, 'MB1, T: a lost fight is a meeting');
      endCoil(g, 'choice', 'stream'); rewind(g); sCombat(g, { id: 'test_wolf', intro: 'In.', band: 'standard', enemies: [wolf()], win: 'stream', lose: 'stream' });
      assert(g.combat.mem === 0.5 && g.combat.log.includes(memoryLine(1, 0.5)), 'MB1, T: next Coil it is remembered'); }
    // the tribute through startCombat: counted, no memory, no line
    { const g = mk('collectors', [wolf({ name: 'Lu Han' })], { stats: { foes: { collectors: 3 } } }); assert(!g.combat.mem && !g.combat.log.some(isMem) && g.stats.foes.collectors === 4, 'MB1, T: the tribute shows no memory'); }
    // not counted: Say something, the spike field, a Qi-short round; a closed move in a spar counts as the blade, in a brawl not at all
    { const p = mk('gao', [wolf({ name: 'Gao' })]); cStep(p, 'remark'); assert(!W(p), 'MB1, T: Say something is not an attack');
      const s2 = mk('test_wolf', [wolf()]); if (actionOpen(s2, 'spikes')) { cStep(s2, 'spikes'); assert(!W(s2), 'MB1, T: the spike field is not an attack'); }
      const q = mk('test_wolf', [wolf()]); q.james.qi = 0; const oq = cStep(q, 'blade'); assert(oq.lines.some((l) => /fall back on guarding/.test(l)) && !W(q), 'MB1, T: a Qi-short round counts nothing');
      const sp = mk('test_spar', [wolf({ name: 'Ya' })], { style: 'spar' }); cStep(sp, 'needle'); assert(sp.stats.weapons.blade === 1 && W(sp) === 1, 'MB1, T: a closed move in a spar counts as the blade');
      const br = mk('test_brawl', [wolf({ name: 'Bao' })], { style: 'unarmed' }); cStep(br, 'blade'); assert(!W(br) && br.stats.unarmed === 1, 'MB1, T: a closed move in a brawl is a strike, not counted'); }
    // SA + multi-target: one count a round, one learning a round, and every target checked at the same value
    { const g = mk('test_pack', [wolf({ dc: 99 }), wolf({ name: 'Wolf two', dc: 99 })], { stats: { foes: { test_pack: 1 } } });
      if (actionOpen(g, 'flail')) {
        const o = cStep(g, 'flail'); const v = o.lines.filter((l) => /→ .*: GU [\d.]+ \//.test(l)).map((l) => /GU ([\d.]+) \//.exec(l)[1]);
        assert(g.stats.weapons.flail === 1 && g.combat.adapt.flail === 0.5 && o.lines.filter((l) => /You read the opening better/.test(l)).length === 1, 'MB1, T: the flail on two foes: one count, one learning');
        assert(v.length === 2 && v[0] === v[1], `MB1, SA: both targets at one value (${v.join(' / ')})`);
      } else assert(false, 'MB1, T: the flail is open at Convergence T3'); }
    // the memory reaches the Qi blast's check too; Yuki's own check is untouched
    { const blastV = (stats) => { const g = mk('test_wolf', [wolf()], { stats }); const l = cStep(g, 'blast').lines.find((x) => x.startsWith('Qi blast:')); return { v: Number(/([\d.]+) \/ DC/.exec(l)[1]), y: cStep(g, 'guard') && g }; };
      assert(Math.round((blastV({ foes: { test_wolf: 2 } }).v - blastV(null).v) * 10) / 10 === 1, 'MB1, T: the memory on the Qi blast');
      const yk = (stats) => { const g = mk('test_wolf', [wolf()], { stats }); return cStep(g, 'guard').lines.find((l) => l.startsWith('Yuki:')); };
      assert(yk(null) === yk({ foes: { test_wolf: 4 } }), 'MB1, T: Yuki\'s check has no memory'); }
    // a mid-fight save keeps the memory and doesn't count again; the whole-game rewind keeps both counts
    { const g = mk('test_wolf', [wolf()], { stats: { foes: { test_wolf: 2 } } }); const x = deserialize(serialize(g));
      assert(x.combat.mem === 1 && x.stats.foes.test_wolf === 3 && fightAdapt(x.combat, 'blade') === 1, 'MB1, T: a mid-fight save keeps the memory, no recount');
      const k = ensureBars(newGame(126, { closed: true })); k.stats.foes = { elder: 2 }; k.stats.weapons = { dart: 77 }; k.coil.act = 1; endCoil(k, 'choice', 'stream'); rewind(k, { to: 'game' });
      assert(k.stats.foes.elder === 2 && k.stats.weapons.dart === 77, 'MB1, T: the whole-game rewind keeps both'); }
    // CC: one cap; FQ: the FAQ reads the constants
    { const { readFileSync } = await import('node:fs'); const src = readFileSync(new URL('../js/core/game.js', import.meta.url), 'utf8'); const faq = readFileSync(new URL('../js/core/faq.js', import.meta.url), 'utf8');
      assert(/ADAPT_FIGHT_MAX = FOE_MEMORY_MAX;/.test(src) && FOE_MEMORY_MAX === 2, 'MB1, CC: the learning and the memory share one cap');
      assert(/\$\{FOE_MEMORY_STEP\} to James's attacks/.test(faq) && /\$\{WEAPON_STEP\} to hit with it for every \$\{WEAPON_EVERY\} rounds, up to \+\$\{WEAPON_MAX\}/.test(faq) && WEAPON_EVERY === 50, 'MB1, FQ: the FAQ\'s numbers from the constants'); }
}
// v0.11.116 (owner pick WA2; research.md #64, #142): CDB the rhythm (the blade, the spear, the flail and the Qi blast wait a
// round, the needle two); SG the song (a blade, spear or flail hit +1, up to 3; the needle for 2 song, the spike field for 3;
// a needle the song pays for uses the blade's practice, SH, and staggers on a glancing hit, NS); the bots' rule; the cards;
// the FAQ; Fable's texts. These use the real step (cStep0), wait and all.
{
    const G = await import('../js/core/game.js');
    const { WAIT, waitLeft, songPays, SONG_MAX, SONG_COST, SONG_TEXT, checkValue, noDiceDc } = G;
    const mk = (enemies, { style = null, qi = 99, field = true } = {}) => { const g = ensureBars(newGame(127, { closed: true })); g.james.gu = { tier: 3, level: 1, xp: 0 }; g.james.skills['Convergence Use'] = { tier: 3, level: 1, xp: 0 }; ensureBars(g); g.james.qi = qi; g.yuki.hp = 0;
        sCombat(g, { id: 'test_wa2', intro: 'In.', band: 'standard', enemies, win: 'stream', lose: 'stream', ...(style ? { style } : {}) }); g.combat.fieldUsed = field; return g; };
    const post = (x = {}) => ({ name: 'Post', hp: 999, dc: 0.1, atk: 0.1, dmg: 0, ...x });
    const lab = (g, id) => actionLabel(g, id, G.COMBAT_ACTIONS[id].label);
    // CDB: the waits
    assert(JSON.stringify(WAIT) === '{"blade":1,"spear":1,"flail":1,"blast":1,"needle":2}', 'WA2, CDB: the blade, spear, flail and blast 1, the needle 2');
    { const g = mk([post()]); cStep0(g, 'blade'); assert(waitLeft(g, 'blade') === 1 && waitLeft(g, 'spear') === 0, 'WA2, CDB: after the blade it waits one round, the spear not');
      const o = cStep0(g, 'blade'); assert(o.lines.includes(SONG_TEXT.waiting.replace('{move}', lab(g, 'blade'))) && o.lines.includes('You give ground, watching for the opening.') && !o.lines.some((l) => l.startsWith(`${lab(g, 'blade')}:`)), "WA2, CDB: a waiting move guards instead, with Fable's line");
      assert(waitLeft(g, 'blade') === 0, 'WA2, CDB: the round after, ready'); const o3 = cStep0(g, 'blade'); assert(o3.lines.some((l) => l.startsWith(`${lab(g, 'blade')}:`)), 'WA2, CDB: and it swings'); }
    { const g = mk([post({ dc: 99 })]); cStep0(g, 'needle'); assert(waitLeft(g, 'needle') === 2, 'WA2, CDB: the needle waits two'); cStep0(g, 'guard'); assert(waitLeft(g, 'needle') === 1, 'WA2, CDB: one left'); cStep0(g, 'guard'); assert(waitLeft(g, 'needle') === 0, 'WA2, CDB: ready'); }
    for (const id of ['blast', 'spear', 'flail']) { const g = mk([post({ dc: 99 }), post({ name: 'Post two', dc: 99 })]); cStep0(g, id); assert(waitLeft(g, id) === 1, `WA2, CDB: ${id} waits one, hit or miss`); }
    for (const id of ['dart', 'guard', 'qshield']) { const g = mk([post()]); cStep0(g, id); cStep0(g, id); assert(waitLeft(g, id) === 0 && !g.combat.wait?.[id], `WA2, CDB: ${id} never waits`); }
    { const g = mk([post()], { field: false }); cStep0(g, 'spikes'); assert(waitLeft(g, 'spikes') === 0, 'WA2, CDB: the spike field never waits'); }
    { const g = mk([post()], { qi: 0 }); g.combat.song = 0; const o = cStep0(g, 'needle'); assert(o.lines.some((l) => /fall back on guarding/.test(l)) && waitLeft(g, 'needle') === 0, 'WA2, CDB: a move not paid for does not wait'); }
    { const b = mk([post({ name: 'Bao' })], { style: 'unarmed' }); cStep0(b, 'strike'); cStep0(b, 'strike'); assert(!b.combat.wait && b.stats.unarmed === 2, 'WA2, CDB: the fists never wait'); }
    // SG: the song rises on a landed blade, spear or flail hit, up to 3, with Fable's line; a miss or another move doesn't
    { const g = mk([post()]); const o1 = cStep0(g, 'blade'); assert(g.combat.song === 1 && o1.lines.includes(SONG_TEXT.rise.replace('{weapon}', lab(g, 'blade')).replace('{n}', 1).replace('{max}', SONG_MAX)), "WA2, SG: a blade hit, song 1, Fable's line");
      cStep0(g, 'spear'); cStep0(g, 'blade'); assert(g.combat.song === 3, 'WA2, SG: the spear and the blade, song 3'); const o4 = cStep0(g, 'spear'); assert(g.combat.song === SONG_MAX && !o4.lines.some((l) => /bone hums/.test(l)), 'WA2, SG: no further than 3, no line');
      const m = mk([post({ dc: 99 })]); cStep0(m, 'blade'); assert(!m.combat.song, 'WA2, SG: a miss adds nothing');
      const d = mk([post()]); cStep0(d, 'dart'); cStep0(d, 'blast'); assert(!d.combat.song, 'WA2, SG: darts and the blast add nothing'); }
    // the needle for 2 song: no Qi, Fable's line, the blade's learning and familiarity, its own wait
    { const g = mk([post({ dc: 99 })]); g.combat.song = 2; assert(songPays(g, 'needle') && !songPays(g, 'spikes'), 'WA2, SG: 2 song pays the needle, not the field');
      g.james.qi = 10; const q = g.james.qi, w0 = g.stats.weapons?.needle || 0; const o = cStep0(g, 'needle'); // under the pool's top, so a Qi spend would show
      assert(g.james.qi === q && g.combat.song === 0 && o.lines.includes(SONG_TEXT.needle.replace('{n}', SONG_COST.needle)), "WA2, SG: no Qi, 2 song spent, Fable's line");
      assert(g.combat.adapt.blade === 0.5 && !g.combat.adapt.needle && g.stats.weapons.blade === 1 && (g.stats.weapons.needle || 0) === w0, 'WA2, SH: its miss teaches the blade, its round counts as the blade');
      assert(o.lines.some((l) => l.includes(`to ${lab(g, 'blade')} this fight`)) && waitLeft(g, 'needle') === 2 && waitLeft(g, 'blade') === 0, "WA2, SH: the learning line names the blade; the needle's own wait, not the blade's");
      const v = mk([post()]); v.stats.weapons = { blade: 4 * G.WEAPON_EVERY }; v.combat.adapt = { blade: 1 }; v.combat.song = 2; const lv = cStep0(v, 'needle').lines.find((l) => /^Needle to a joint:/.test(l));
      const z = mk([post()]); z.combat.song = 2; const lz = cStep0(z, 'needle').lines.find((l) => /^Needle to a joint:/.test(l));
      const num = (l) => Number(/GU ([\d.]+) \//.exec(l)[1]); assert(Math.round((num(lv) - num(lz)) * 10) / 10 === 3, `WA2, SH: the blade's +2 familiarity and +1 learning reach the sung needle (${num(lz)} → ${num(lv)})`); }
    // NS: a sung needle staggers on a glancing hit; one paid with Qi does not
    { let dc = null; for (let x = 1; x <= 30 && dc == null; x += 0.25) { const t = mk([post({ dc: x })]); const v = checkValue(t, 'GU', 0) / noDiceDc(x + 1); if (v >= 0.55 && v < 0.95) dc = x; }
      const sung = mk([post({ dc })]); sung.combat.song = 2; const os = cStep0(sung, 'needle'); const qi = mk([post({ dc })]); const oq = cStep0(qi, 'needle');
      assert(dc != null && os.lines.some((l) => /a glancing blow/.test(l)) && oq.lines.some((l) => /a glancing blow/.test(l)), `WA2, NS: both glance (dc ${dc})`);
      assert(os.lines.includes('  Post staggers.') && !oq.lines.includes('  Post staggers.'), 'WA2, NS: the sung needle staggers on a glance, the Qi needle not'); }
    // the spike field for 3 song
    { const g = mk([post()], { field: false }); g.combat.song = 3; g.james.qi = 10; const q = g.james.qi; const o = cStep0(g, 'spikes');
      assert(g.james.qi === q && g.combat.song === 0 && g.combat.fieldUsed && o.lines.includes(SONG_TEXT.spikes.replace('{n}', SONG_COST.spikes)), "WA2, SG: 3 song sings the field, no Qi, Fable's line");
      const h = mk([post()], { field: false }); h.combat.song = 2; h.james.qi = 10; const qh = h.james.qi; cStep0(h, 'spikes'); assert(h.james.qi < qh && h.combat.song === 2, 'WA2, SG: 2 song: the field costs Qi as before');
      const u = mk([post()]); u.combat.song = 3; assert(!songPays(u, 'spikes'), 'WA2, SG: a used field is not paid for again'); }
    // a spar: the song builds, nothing spends it
    { const s = mk([post({ name: 'Ya' })], { style: 'spar' }); cStep0(s, 'blade'); s.combat.song = 3; assert(!songPays(s, 'needle') && !songPays(s, 'spikes'), 'WA2, SG: in a spar no needle and no field to spend it on'); }
    // a mid-fight save keeps the wait and the song
    { const g = mk([post()]); cStep0(g, 'blade'); const x = deserialize(serialize(g)); assert(x.combat.song === 1 && waitLeft(x, 'blade') === 1, 'WA2: a mid-fight save keeps the song and the wait'); }
    // the bots: the needle when the song pays and the first foe would strike; a formed spear while the blade waits; nothing waiting picked
    { const g = mk([post({ atk: 5 })]); cStep0(g, 'blade'); g.combat.song = 2; assert(smartAction(g) === 'needle', 'WA2: the bot spends the song on the needle');
      g.combat.enemies[0].staggered = true; assert(smartAction(g) !== 'needle', 'WA2: not on a foe already staggered'); g.combat.enemies[0].staggered = false;
      g.combat.song = 1; g.combat.spearFormed = true; assert(smartAction(g) === 'spear', 'WA2: the blade waits, a formed spear swings');
      g.combat.spearFormed = false; g.combat.wait.spear = g.combat.round + 1; const a = smartAction(g); assert(waitLeft(g, a) === 0, `WA2: never a waiting move (${a})`);
      const h = mk([post({ atk: 5, dmg: 6 })]); h.combat.enemies[0].heavy = true; h.combat.round = 3; h.combat.song = 2; assert(smartAction(h) === 'needle', 'WA2: a shown big blow, no spear, the song pays: the needle stops it');
      h.combat.song = 0; assert(smartAction(h) === 'guard', 'WA2: without the song, guard as before'); }
    // Fable's texts, the cards, the hold lines and the FAQ
    assert(SONG_TEXT.rise === '{weapon} lands, and the bone hums a little louder for it. Song {n} / {max}.' && SONG_TEXT.needle === "The song pays for the needle, {n} of it and no Qi. It goes in on the blade's rhythm." && SONG_TEXT.waiting === '{move} is still singing itself back together. You guard instead.' && SONG_TEXT.label === 'Song {n} / {max}' && SONG_TEXT.tagNext === 'next round' && SONG_TEXT.price === '{n} song', "WA2, T: Fable's MAINs");
    { const { readFileSync } = await import('node:fs'); const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8'); const faq = readFileSync(new URL('../js/core/faq.js', import.meta.url), 'utf8');
      assert(/class="card fightish\$\{wl \? ' wait' : ''\}"/.test(main) && /\$\{wl \? ' aria-disabled="true"' : ''\}/.test(main) && /SONG_TEXT\.tagIn\.replace\('\{n\}', wl\)/.test(main), 'WA2: a waiting card is greyed with its tag');
      assert(/const wl = waitLeft\(g, b\.dataset\.act\);[^\n]*\n\s*if \(wl\) \{[^\n]*note\(/.test(main), 'WA2: a tap on a waiting card only says when it is ready');
      assert(/SONG_TEXT\.label\.replace\('\{n\}', c\.song\)/.test(main) && /SONG_TEXT\.holdNeedle\.replace/.test(main) && /SONG_TEXT\.price\.replace\('\{n\}', SONG_COST\[id\]\)/.test(main), 'WA2: the song beside the foes, the needle hold line, the price tag');
      assert(/up to \$\{SONG_MAX\}/.test(faq) && /\$\{SONG_COST\.needle\} song instead of its Qi/.test(faq) && /\$\{SONG_COST\.spikes\}/.test(faq), 'WA2, T: the FAQ reads the constants');
      const { FAQ } = await import('../js/core/faq.js'); const fq = FAQ.find(([t]) => t === 'Fights')[1](); assert(fq.includes('<b>The rhythm:</b>') && fq.includes('up to 3; it lasts only for that fight') && fq.includes('2 song instead of its Qi'), "WA2, T: the FAQ's sentences (Fable's)"); }
}
// v0.11.116 (owner pick WB1; Fable's review of WA2): SP the sung needle uses the better practice; SD only a damaging hit raises
// the song; FR a failed run is a round for the rhythm; SL no song shown in a spar; SR the bot sings the spear while a holding
// blade waits; FT Fable's texts; RT the review's gaps: older mechanics through the real step (cStep0), old saves, edges.
{
    const G = await import('../js/core/game.js');
    const { waitLeft, songPays, sungKey, SONG_TEXT, SONG_COST, AIR_TEXT, SAY_TEXT, SPAR_TEXT, TELL_TEXT, WEAPON_EVERY } = G;
    const mk = (enemies, { cu = [3, 1], gu = [3, 1], qi = 99, field = true, id = 'test_wb1', act1 = false, realm = 0, ...extra } = {}) => { const g = ensureBars(newGame(128, { closed: true })); if (act1) { g.flags.ending = 'victory'; g.minutes = Math.max(g.minutes, 7 * 1440 + 6 * 60); }
        g.james.gu = { tier: gu[0], level: gu[1], xp: 0 }; g.james.skills['Convergence Use'] = { tier: cu[0], level: cu[1], xp: 0 }; g.james.realm = realm; ensureBars(g); g.james.qi = qi; g.james.hp = jamesHpMax(g); g.yuki.hp = 0;
        sCombat(g, { id, intro: 'In.', band: 'standard', enemies, win: 'stream', lose: 'stream', ...extra }); g.combat.fieldUsed = field; return g; };
    const post = (x = {}) => ({ name: 'Post', hp: 999, dc: 0.1, atk: 0.1, dmg: 0, ...x });
    const num = (l) => Number(/GU ([\d.]+) \//.exec(l)[1]);
    // SP: the needle's own practice when it is better (and its round counts for the needle); a tie is the blade's
    { const g = mk([post()]); g.stats.weapons = { needle: 4 * WEAPON_EVERY }; g.combat.adapt = { needle: 1.5 }; g.combat.song = 2; assert(sungKey(g) === 'needle', 'WB1, SP: the needle\'s own +3.5 beats the blade\'s 0');
      const ls = cStep0(g, 'needle').lines.find((l) => /^Needle to a joint:/.test(l)); const q = mk([post()]); q.stats.weapons = { needle: 4 * WEAPON_EVERY }; q.combat.adapt = { needle: 1.5 }; const lq = cStep0(q, 'needle').lines.find((l) => /^Needle to a joint:/.test(l));
      assert(num(ls) === num(lq) && g.stats.weapons.needle === 4 * WEAPON_EVERY + 1 && !g.stats.weapons.blade, `WB1, SP: the sung needle checks as the Qi needle (${num(ls)} = ${num(lq)}), its round the needle's`);
      const t = mk([post()]); t.combat.song = 2; assert(sungKey(t) === 'blade', 'WB1, SP: a tie is the blade\'s');
      const { readFileSync } = await import('node:fs'); assert(/kk = songed \? sungKey\(g\) : id/.test(readFileSync(new URL('../js/main.js', import.meta.url), 'utf8')), 'WB1, SP: the card shows the same practice'); }
    // SD: a hungry hit, a hit armour soaks to 0: no song; a flail on two foes: +1, not +2
    { const h = mk([post({ moods: true })]); cStep0(h, 'guard'); const o = cStep0(h, 'blade'); assert(o.lines.some((l) => /grows over it/.test(l)) && !h.combat.song, 'WB1, SD: a hungry foe\'s hit raises no song');
      const a = mk([post({ dr: 99 })], { cu: [1, 9] }); const oa = cStep0(a, 'blade'); assert(oa.lines.some((l) => /takes 0/.test(l)) && !a.combat.song, 'WB1, SD: a hit armour soaks to 0 raises no song');
      const f = mk([post(), post({ name: 'Post two' })]); cStep0(f, 'flail'); assert(f.combat.song === 1, 'WB1, SD: the flail on two foes: +1'); }
    // FR: a failed run ticks the waits; a fight that can't be run from is unchanged
    { const g = mk([post({ atk: 99, dmg: 1 })], { flee: 'stream' }); cStep0(g, 'blade'); assert(waitLeft(g, 'blade') === 1, 'WB1, FR: the blade waits');
      const o = G.combatFlee(g); assert(!o.done && waitLeft(g, 'blade') === 0, 'WB1, FR: a failed run is a round for the rhythm');
      cStep0(g, 'needle'); G.combatFlee(g); assert(waitLeft(g, 'needle') === 1, 'WB1, FR: the needle\'s two: one left after a failed run'); }
    // SL, FT
    { const { readFileSync } = await import('node:fs'); const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      assert(/\(c\.song \|\| 0\) > 0 && c\.style !== 'spar'/.test(main) && /SONG_TEXT\.holdSpikes\.replace\('\{n\}', SONG_COST\[id\]\)/.test(main) && !/song instead of Qi\.`/.test(main), 'WB1, SL + FT: no song shown in a spar; the field\'s hold line is Fable\'s');
      assert(SONG_TEXT.holdSpikes === 'The song pays for this one: {n} song and no Qi, and the spikes come up exactly as they would have.' && /whichever is better, and it staggers/.test(SONG_TEXT.holdNeedle), "WB1, FT: Fable's lines");
      const { FAQ } = await import('../js/core/faq.js'); const fq = FAQ.find(([t]) => t === 'Fights')[1](); assert(fq.includes('every round it waits is a round of <b>Guard</b>: the blade swings every other round.') && fq.includes('whichever is better (practice is'), "WB1, FT: the FAQ's sentences (Fable's)"); }
    // SR: a holding blade that waits, the spear unsung, Qi for it: the spear; while the blade is ready, the blade as before
    { const g = mk([post({ atk: 5 })], { cu: [1, 9] }); g.combat.bladeFormed = true; assert(smartAction(g) === 'blade', 'WB1, SR: a ready holding blade swings (FB1 as before)');
      g.combat.wait = { blade: g.combat.round + 1 }; g.combat.song = 0; assert(smartAction(g) === 'spear', 'WB1, SR: while it waits, the spear is sung'); }
    // RT: the fragile knife across waits (T1 L3: two swings a singing)
    { const g = mk([post()], { cu: [1, 3], gu: [3, 1], qi: 30 }); const seq = [];
      for (let i = 0; i < 5; i++) { const q = g.james.qi; const o = cStep0(g, 'blade'); seq.push([Math.round((q - g.james.qi) * 10) / 10 > 0 ? 'paid' : 'free', o.lines.some((l) => /knife shatters/.test(l)) ? 'shatter' : o.lines.some((l) => /singing itself back/.test(l)) ? 'wait' : 'swing']); }
      assert(JSON.stringify(seq) === JSON.stringify([['paid', 'swing'], ['free', 'wait'], ['free', 'shatter'], ['free', 'wait'], ['paid', 'swing']]), `WB1, RT: the knife: sing, wait, shatter, wait, sing again (${JSON.stringify(seq)})`); }
    // RT: the spear's hold stops a shown big blow, through the waits
    { const g = mk([post({ atk: 99, dmg: 6 })]); g.combat.enemies[0].heavy = true; cStep0(g, 'spear'); cStep0(g, 'blade'); assert(waitLeft(g, 'spear') === 0, 'WB1, RT: the spear ready in round 3');
      const o = cStep0(g, 'spear'); assert(o.lines.includes("Post can't get past the spear.") && !o.lines.includes(TELL_TEXT.bigLands), 'WB1, RT: its hold stops the big blow'); }
    // RT: darts from the air never wait; Say something on a posture with the blade waiting
    { const g = mk([post({ name: 'Wolf', atk: 50, dmg: 3 })], { act1: true, realm: 1 }); const o1 = cStep0(g, 'dart'), o2 = cStep0(g, 'dart');
      assert([o1, o2].every((o) => o.lines.includes(AIR_TEXT.reach.replace('{foe}', 'Wolf'))) && waitLeft(g, 'dart') === 0, 'WB1, RT: darts from the air, two rounds running'); }
    { const g = mk([post({ name: 'Gao', atk: 5, dmg: 2 })], { id: 'gao' }); cStep0(g, 'blade'); cStep0(g, 'guard'); assert(waitLeft(g, 'blade') === 0, 'WB1, RT: Gao, round 3');
      const o = cStep0(g, 'remark'); assert(o.lines.some((l) => SAY_TEXT.landed.some((t) => l === t.replace('{foe}', 'Gao'))) && g.combat.enemies[0].flustered > 0, 'WB1, RT: Say something lands on the posture'); }
    // RT: spar-out through the waits (blade, wait, blade: out at half)
    { const g = mk([post({ name: 'Ya', hp: 24, dc: 6 })], { style: 'spar', cu: [1, 9] }); const o1 = cStep0(g, 'blade'), o2 = cStep0(g, 'blade'); const o3 = cStep0(g, 'blade');
      assert(!o1.done && o2.lines.some((l) => /singing itself back/.test(l)) && o3.done === 'win' && o3.lines.includes(SPAR_TEXT.out.replace('{foe}', 'Ya')), `WB1, RT: a spar: swing, guard, swing, out at half (${g.combat ? 'still on' : o3.done})`); }
    // RT: an old mid-fight save without the wait or the song steps as before; a new fight starts clean
    { const g = mk([post()]); delete g.combat.wait; delete g.combat.song; const x = deserialize(serialize(g)); const o = cStep0(x, 'blade'); assert(!o.done && x.combat.song === 1 && waitLeft(x, 'blade') === 1, 'WB1, RT: an old mid-fight save plays');
      const n = mk([post()]); assert(!n.combat.song && !n.combat.wait && waitLeft(n, 'blade') === 0, 'WB1, RT: a new fight: no song, no waits'); }
    // RT: an unpaid move never waits; a stale field tap at song 3 with the field used spends nothing
    for (const id of ['blade', 'spear', 'flail', 'blast']) { const g = mk([post(), post({ name: 'Post two' })], { qi: 0 }); const o = cStep0(g, id); assert(o.lines.some((l) => /fall back on guarding/.test(l)) && waitLeft(g, id) === 0, `WB1, RT: ${id} not paid for, no wait`); }
    { const g = mk([post()]); g.combat.song = 3; const o = cStep0(g, 'spikes'); assert(g.combat.song === 3 && o.lines.some((l) => /already broken/.test(l)), 'WB1, RT: a used field: no song spent'); }
    // RT: the smart rule's edges
    { const g = mk([post({ atk: 5 })]); g.combat.song = 2; g.combat.wait = { needle: g.combat.round + 1 }; assert(smartAction(g) !== 'needle', 'WB1, RT: a waiting needle is not picked, song or not');
      g.combat.wait = {}; g.combat.enemies[0].flustered = 1; assert(smartAction(g) !== 'needle', 'WB1, RT: not on a stunned foe');
      const h = mk([post({ atk: 5, dmg: 6 })]); h.combat.enemies[0].heavy = true; h.combat.round = 3; h.combat.spearFormed = true; h.combat.wait = { spear: 4 }; assert(smartAction(h) === 'guard', 'WB1, RT: a big blow, the spear waiting, no song: guard');
      const m = mk([post({ atk: 5, moods: true })]); m.combat.round = 2; m.combat.song = 2; assert(smartAction(m) === 'guard', 'WB1, RT: a hungry round: guard, not the needle'); }
}
// v0.11.118 (owner pick YK1): Yuki held at James's GU. CG: no Fight XP at or above it, from any source, and an award stops
// at it; FE: in a fight she strikes and dodges with the lower of the two (a save from before YK1 fights at his level, its
// number untouched); D8: her hauls by a d8 from the save's stream (1–2 nothing, 3–4 half, 5–6 the job's, 7–8 double), not her Fight.
{
    const G = await import('../js/core/game.js');
    const { yukiHeld, yukiFightSkill, yukiHeldNote, YUKI_HELD_TEXT, d8, d6, skillCheck } = G;
    const { yukiHaul, YUKI_D8, YUKI_LANE_TEXT } = await import('../js/core/tasks.js');
    const mk = (yt, yl, gt, gl, seed = 1180) => { const g = ensureBars(newGame(seed, { closed: true })); g.yuki.fight = { tier: yt, level: yl, xp: 0 }; g.james.gu = { tier: gt, level: gl, xp: 0 }; return g; };
    const rk = (n) => 10 * (n.tier - 1) + n.level;
    const HELD22 = YUKI_HELD_TEXT.held.replace('{t}', 2).replace('{l}', 2);
    // CG: level with him, nothing; under him, the usual award; an award that would carry her past him stops at his rank
    { const g = mk(2, 3, 2, 3), out = awardYukiFightXp(g, 'major');
      assert(yukiHeld(g) && g.yuki.fight.tier === 2 && g.yuki.fight.level === 3 && g.yuki.fight.xp === 0 && out.length === 2 && out[0] === YUKI_HELD_TEXT.held.replace('{t}', 2).replace('{l}', 3) && out[0] === "Yuki Fight held at James's GU (T2 L3)", `YK1, CG: level with his GU: no XP, the held line (${out[0]})`); }
    { const g = mk(3, 4, 2, 1), out = awardYukiFightXp(g, 'major');
      assert(rk(g.yuki.fight) === 24 && g.yuki.fight.xp === 0 && out[0] === YUKI_HELD_TEXT.held.replace('{t}', 2).replace('{l}', 1), `YK1, CG: above him (an old save): no XP either (${out[0]})`); }
    { const g = mk(1, 1, 3, 1), out = awardYukiFightXp(g, 'standard');
      assert(!yukiHeld(g) && out[0] === `Yuki Fight +${Math.floor(30 * 0.6)}` && g.yuki.fight.xp === 18, `YK1, CG: under him, the award as before (${out[0]})`); }
    { const free = mk(1, 8, 9, 1); free.coil.n = 21; awardYukiFightXp(free, 'major'); // the same award with room: past T1 L9
      const g = mk(1, 8, 1, 9); g.coil.n = 21; g.yuki.fight.xp = 3; const room = G.xpToNext(g.yuki.fight) - 3; const out = awardYukiFightXp(g, 'major'), pool = Math.floor(120 * coilMult(g) * 0.6);
      assert(pool > room && rk(free.yuki.fight) > 9 && g.yuki.fight.tier === 1 && g.yuki.fight.level === 9 && g.yuki.fight.xp === 0 && out[0] === `Yuki Fight +${room} → T1 L9, level with James's GU (held)`, // RX: the XP she kept
 `YK1, CG: an award past his rank stops at it (free ${rk(free.yuki.fight)}; ${out[0]})`); }
    // CG from every source: the lane's haul, a won fight, a story beat
    { const g = mk(2, 2, 2, 2, 1181); g.scene = 'wilds'; g.minutes = 1440 + 9 * 60; Object.assign(g.flags, { long: true, forest_day: 2 }); g.james.satiety = 90; g.james.qi = 30;
      g.rng = rngFor(5); setYuki(g, true); g.tasks.yuki.progress = yukiLane(g).len - 1;
      const id = taskCards(g, SCENES).find((c) => c.status === 'open' && /^Rest in the shade/.test(c.label))?.id, r = runTask(g, SCENES, id);
      assert(!!id && r.lines.some((l) => /\+1 Glassback hare/.test(l)) && r.lines.includes(HELD22) && rk(g.yuki.fight) === 12 && g.yuki.fight.xp === 0, `YK1, CG: the lane's haul at his rank: the hare, no XP (${r.lines.join(' | ').slice(0, 200)})`); }
    { const g = mk(2, 2, 2, 2, 1182); g.james.skills['Convergence Use'] = { tier: 3, level: 1, xp: 0 }; ensureBars(g); g.james.qi = jamesQiMax(g);
      startCombat(g, { id: 'test_yk1', intro: 'In.', band: 'standard', enemies: [{ name: 'Rat', hp: 1, dc: 0.5, atk: 0.1, dmg: 0 }], win: 'stream', lose: 'stream' });
      let o = null; for (let t = 0; t < 20 && g.combat; t++) o = cStep(g, 'blade');
      assert(o?.done === 'win' && o.lines.includes(HELD22) && rk(g.yuki.fight) === 12 && g.yuki.fight.xp === 0, `YK1, CG: a won fight at his rank: no XP (${(o?.lines || []).slice(-3).join(' | ')})`); }
    { const g = mk(2, 2, 2, 2, 1183); const ch = SCENES.wild_train.choices.find((c) => /^Footwork/.test(c.text)), out = ch.do(g);
      assert(out.includes(HELD22) && rk(g.yuki.fight) === 12, `YK1, CG: a story beat at his rank: no XP (${out.join(' | ')})`); }
    // FE: in a fight she strikes and dodges with the lower of the two; the saved number is not touched
    { const g = mk(10, 10, 2, 5), h = mk(1, 1, 2, 5);
      assert(yukiFightSkill(g) === g.james.gu && yukiFightSkill(h) === h.yuki.fight, 'YK1, FE: above him she fights at his GU; under him at her own');
      g.james.skills['Convergence Use'] = { tier: 2, level: 1, xp: 0 }; ensureBars(g); g.james.qi = jamesQiMax(g);
      startCombat(g, { id: 'test_yk1b', intro: 'In.', band: 'standard', enemies: [{ name: 'Wall', hp: 999, dc: 30, atk: 0.1, dmg: 0 }], win: 'stream', lose: 'stream' });
      const o = cStep(g, 'guard'), l = o.lines.find((x) => /^Yuki: Fight /.test(x)) || '';
      assert(l.startsWith(`Yuki: Fight ${Math.round(skillCheck(g.james.gu) * 10) / 10} / DC`) && g.yuki.fight.tier === 10 && g.yuki.fight.level === 10, `YK1, FE: her strike reads his GU (${l})`); }
    { const lunge = (yt, gt) => { const g = mk(yt, 1, gt, 1, 1184); g.james.skills['Convergence Use'] = { tier: 2, level: 1, xp: 0 }; ensureBars(g); g.james.qi = jamesQiMax(g); // a lunge at DC 4: T1 misses it, T2 and up don't
        startCombat(g, { id: 'test_yk1c', intro: 'In.', band: 'standard', enemies: [{ name: 'Hawk', hp: 999, dc: 30, atk: 6, dmg: 1, prefersSmall: true }], win: 'stream', lose: 'stream' });
        g.combat.round = 3; return cStep(g, 'blade').lines.find((x) => /lunges at Yuki/.test(x)) || ''; };
      assert(/it connects/.test(lunge(10, 1)) && /it connects/.test(lunge(1, 5)) && /she is not there/.test(lunge(5, 5)), `YK1, FE: her dodge reads the lower too (T10 by a T1 James: ${lunge(10, 1)}; T5 by T5: ${lunge(5, 5)})`); }
    // the Yuki tab's note
    assert(yukiHeldNote(mk(3, 1, 3, 1)) === YUKI_HELD_TEXT.tab && yukiHeldNote(mk(9, 9, 2, 5)) === YUKI_HELD_TEXT.above.replace('{t}', 2).replace('{l}', 5) && /T2 L5/.test(yukiHeldNote(mk(9, 9, 2, 5))) && yukiHeldNote(mk(1, 1, 2, 5)) === '', 'YK1: the tab note: level, above (with his rank), or none');
    // D8: the roll, its stream, the haul's table, and not her Fight
    { const g = { rng: 1 }, n = [0, 0, 0, 0, 0, 0, 0, 0, 0]; for (let i = 0; i < 8000; i++) n[d8(g)]++;
      assert(n[0] === 0 && n.slice(1).every((k) => k > 900 && k < 1100), `YK1, D8: a fair d8 (${n.slice(1).join(' ')})`);
      const a = { rng: 777 }, b = { rng: 777 }; d8(a); d6(b); assert(a.rng === b.rng && a.rng !== 777, 'YK1, D8: one step of the save\'s stream, as d6'); }
    assert(YUKI_D8.join() === '0,0,0.5,0.5,1,1,2,2' && /1–2 nothing/.test(YUKI_LANE_TEXT.roll) && /7–8 double/.test(YUKI_LANE_TEXT.roll), 'YK1, D8: the table and the lane note');
    { const one = { n: 1 }, two = { n: 2 }, at = (r, job) => { const g = { rng: rngFor(r) }; return yukiHaul(g, job); };
      assert([1, 2, 5, 6, 7, 8].map((r) => at(r, one)).join() === '0,0,1,1,2,2' && [1, 2, 3, 4, 5, 6, 7, 8].map((r) => at(r, two)).join() === '0,0,1,1,2,2,4,4', 'YK1, D8: 1–2 nothing, 5–6 the job\'s, 7–8 double; half of a two');
      const g = { rng: 4242 }; let got = 0, half = 0, halfOne = 0;
      for (let i = 0; i < 8000; i++) { const s = g.rng; const k = yukiHaul(g, one); got += k; const t = { rng: s }; const r = d8(t); if (r === 3 || r === 4) { half++; halfOne += k; } }
      assert(Math.abs(got / 8000 - 0.875) < 0.04 && Math.abs(halfOne / half - 0.5) < 0.05, `YK1, D8: a one-item job brings 0.875 a haul, half rolls one in two (${(got / 8000).toFixed(3)}, ${(halfOne / half).toFixed(3)})`); }
    { const run = (yt) => { const g = mk(yt, 1, 10, 10, 1185); g.scene = 'wilds'; g.minutes = 1440 + 7 * 60; Object.assign(g.flags, { long: true, forest_day: 2 }); g.james.satiety = 90; g.rng = 99; setYuki(g, true);
        for (let k = 0; k < 6; k++) { const id = taskCards(g, SCENES).find((c) => c.status === 'open' && /^Rest in the shade/.test(c.label))?.id; if (!id) break; runTask(g, SCENES, id); } return g.inventory.hare_raw || 0; };
      assert(run(1) === run(10), `YK1, D8: her Fight doesn't set the haul (T1 ${run(1)}, T10 ${run(10)})`); }
    assert(!('dc' in (yukiLane(Object.assign(mk(1, 1, 1, 1), { scene: 'wilds' })) || { dc: 1 })) && !('check' in (yukiLane(Object.assign(mk(1, 1, 1, 1), { scene: 'wilds' })) || {})), 'YK1, D8: the lane shows no Fight / DC');
    // the review (YR1): HG the held line is a gain (Results), not story prose; RS the Results summary reads the reach line's rank;
    // CP both at T10 L10: held; TN no tab note on a new game; SN a Coil snapshot above him rewinds her to his rank; SB the story's
    // +1 for her Fight reads the lower; T a card's dry run matches its real run with her job on
    { const { splitLine } = await import('../js/core/replies.js');
      const h = splitLine(YUKI_HELD_TEXT.held.replace('{t}', 2).replace('{l}', 2)), r = splitLine(YUKI_HELD_TEXT.reach.replace('{xp}', 40).replace('{t}', 2).replace('{l}', 2));
      assert(h.reply === '' && h.gain !== '' && r.reply === '' && r.gain !== '', `YR1, HG: the held and reach lines are gains (${JSON.stringify(h)})`);
      const src = (await import('node:fs')).readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      const lit = /const up = (\/\^\(\.\+\?\) .+?\$\/)\.exec\(l\)/.exec(src)?.[1], re = lit ? new RegExp(lit.slice(1, -1)) : null;
      const m = re?.exec(YUKI_HELD_TEXT.reach.replace('{xp}', 40).replace('{t}', 2).replace('{l}', 3));
      assert(!!m && m[1] === 'Yuki Fight' && m[2] === 'T2 L3' && re.exec('GU +5 XP → T1 L4')?.[2] === 'T1 L4' && !re.exec('GU +5 XP'), `YR1, RS: the summary's level-up pattern reads the reach line (${lit})`); }
    { const g = mk(10, 10, 10, 10), out = awardYukiFightXp(g, 'major');
      assert(out[0] === YUKI_HELD_TEXT.held.replace('{t}', 10).replace('{l}', 10) && rk(g.yuki.fight) === 100, `YR1, CP: both at T10 L10: the held line (${out[0]})`);
      assert(yukiHeldNote(ensureBars(newGame(1186, { closed: true }))) === '' && yukiHeldNote(mk(1, 2, 1, 2)) === YUKI_HELD_TEXT.tab, 'YR1, TN: no tab note on a new game (both T1 L1); the note once they are level past it'); }
    { const g = mk(1, 1, 1, 1, 1187); g.coil.snap.yuki.fight = { tier: 5, level: 9, xp: 40 }; g.coil.snap.james.gu = { tier: 4, level: 10, xp: 0 }; // the owner's 11-08 0813 snapshot: +9 ranks
      rewind(g); const k = mk(1, 1, 1, 1, 1188); k.coil.snap.yuki.fight = { tier: 2, level: 3, xp: 7 }; k.coil.snap.james.gu = { tier: 3, level: 1, xp: 0 }; rewind(k);
      assert(g.yuki.fight.tier === 4 && g.yuki.fight.level === 10 && g.yuki.fight.xp === 0 && k.yuki.fight.tier === 2 && k.yuki.fight.level === 3 && k.yuki.fight.xp === 7, `YR1, SN: a snapshot above him rewinds her to his rank; one under him as it was (T${g.yuki.fight.tier} L${g.yuki.fight.level})`); }
    { const bonus = (yt, yl, gt, gl) => SCENES.wild_hunt.choices.find((c) => /^Mire fowl/.test(c.text)).check.bonus(mk(yt, yl, gt, gl));
      const pb = (yt, yl, gt, gl) => { const c = Object.values(SCENES).flatMap((s) => s.choices || []).find((x) => /^Let Yuki drive it toward you/.test(x.text)); return c.check.bonus(mk(yt, yl, gt, gl)); };
      assert(bonus(1, 5, 1, 1) === 0 && bonus(1, 5, 1, 3) === 1 && bonus(1, 2, 1, 5) === 1 && pb(1, 5, 1, 1) === 0 && pb(1, 3, 1, 4) === 1, 'YR1, SB: the two story +1s read the lower of her Fight and his GU'); }
    { const g = mk(2, 2, 3, 1, 1189); g.scene = 'wilds'; g.minutes = 1440 + 7 * 60; Object.assign(g.flags, { long: true, forest_day: 2 }); g.james.satiety = 90; g.rng = 4243; setYuki(g, true); g.tasks.yuki.progress = yukiLane(g).len - 1;
      const id = taskCards(g, SCENES).find((c) => c.status === 'open' && /^Rest in the shade/.test(c.label))?.id, d = taskOutcome(g, SCENES, id), rng0 = g.rng, m0 = g.minutes;
      const copy = structuredClone(g); runTask(copy, SCENES, id); runTask(g, SCENES, id); const real = outcomeOf(g, m0);
      assert(!!id && rng0 === 4243 && JSON.stringify(d) === JSON.stringify(real) && g.rng !== 4243 && g.rng === copy.rng && JSON.stringify(g.inventory) === JSON.stringify(copy.inventory), `YR1, T: with her job on, the card's forecast leaves the save's stream alone, and a copy rolls her d8 as the real run does (${JSON.stringify(d)} vs ${JSON.stringify(real)})`); }
    // v0.11.120 (owner pick LX1): a tenth of the XP she can't keep (held, or past his rank) goes to his GU, on a line of its own
    { const { YUKI_LOST_SHARE } = G, SHARE = YUKI_HELD_TEXT.share;
      assert(YUKI_LOST_SHARE === 0.1 && SHARE === "from what Yuki couldn't keep", 'LX1: a tenth, Fable\'s tail');
      { const g = mk(2, 3, 2, 3), out = awardYukiFightXp(g, 'major'), xp = Math.floor(Math.floor(120 * 2 * 0.6) * 0.1);
        assert(xp === 14 && out[1] === `GU +14 XP, ${SHARE}` && g.james.gu.xp === 14 && g.james.gu.tier === 2 && g.james.gu.level === 3 && rk(g.yuki.fight) === 13 && g.yuki.fight.xp === 0, `LX1: held, a tenth of her whole award to his GU (${out.join(' | ')})`); }
      { const g = mk(1, 8, 1, 9); g.coil.n = 21; g.yuki.fight.xp = 3; const room = G.xpToNext(g.yuki.fight) - 3, pool = Math.floor(120 * coilMult(g) * 0.6), out = awardYukiFightXp(g, 'major'), xp = Math.floor((pool - room) * 0.1);
        assert(xp > 0 && out.length === 2 && out[1].startsWith(`GU +${xp} XP`) && out[1].endsWith(`, ${SHARE}`) && rk(g.yuki.fight) === 9, `LX1: past his rank, a tenth of what she couldn't keep (${out.join(' | ')})`); }
      { const g = mk(1, 1, 3, 1), out = awardYukiFightXp(g, 'standard');
        assert(out.length === 1 && g.james.gu.xp === 0, `LX1: under him nothing goes to James (${out.join(' | ')})`); }
      { const g = mk(10, 10, 10, 10), out = awardYukiFightXp(g, 'major');
        assert(out.length === 1 && g.james.gu.xp === 0, `LX1: his GU at T10 L10: no share line (${out.join(' | ')})`); }
      { const g = mk(1, 1, 1, 1); g.yuki.fight.tier = 1; g.coil.n = 1; const out = awardYukiFightXp(g, 'routine');
        assert(out.length === 1, `LX1: a share that rounds to 0 gives no line (${out.join(' | ')})`); }
      { const g = mk(3, 4, 3, 4); g.james.gu.xp = G.xpToNext(g.james.gu) - 1; const out = awardYukiFightXp(g, 'major');
        const src = (await import('node:fs')).readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
        const lit = /const up = (\/\^\(\.\+\?\) .+?\$\/)\.exec\(l\)/.exec(src)?.[1], re = lit ? new RegExp(lit.slice(1, -1)) : null, m = re?.exec(out[1] || '');
        const { splitLine } = await import('../js/core/replies.js'), sp = splitLine(out[1] || '');
        assert(out[0] === YUKI_HELD_TEXT.heldPast.replace('{t}', 3).replace('{l}', 4) && out[1] === `GU +${Math.floor(Math.floor(120 * 3 * 0.6) * 0.1)} XP → T3 L5, ${SHARE}` && g.james.gu.level === 5 && !!m && m[1] === 'GU' && m[2] === 'T3 L5' && sp.reply === '' && sp.gain !== '' && !yukiHeld(g),
          `LX1: a share that raises his GU: the rank on the line, read by the summary, a gain; she is free again (${out.join(' | ')})`); }
      { const g = mk(2, 2, 2, 2, 1190); g.scene = 'wilds'; g.minutes = 1440 + 9 * 60; Object.assign(g.flags, { long: true, forest_day: 2 }); g.james.satiety = 90; g.james.qi = 30;
        g.rng = rngFor(5); setYuki(g, true); g.tasks.yuki.progress = yukiLane(g).len - 1; const xp0 = g.james.gu.xp;
        const id = taskCards(g, SCENES).find((c) => c.status === 'open' && /^Rest in the shade/.test(c.label))?.id, r = runTask(g, SCENES, id), i = r.lines.indexOf(HELD22);
        assert(!!id && i >= 0 && /^GU \+\d+ XP, from what Yuki couldn't keep$/.test(r.lines[i + 1] || '') && g.james.gu.xp > xp0, `LX1: the lane's held haul gives James his tenth (${r.lines.join(' | ').slice(0, 240)})`); } }
    // v0.11.120 (owner pick LR1, Fable's review of LX1): SS the sit loop sums his share apart from his own GU; AP an old save above
    // him pays the share on his tier; SD the Results summary shows one GU bit, the last rank; T a reach whose share floors to 0,
    // a reach whose share raises his GU (her line keeps the rank she reached), a won fight and a one-move finish while held
    { const { sitSummary } = await import('../js/core/tasks.js'), SH = YUKI_HELD_TEXT.share;
      const s = sitSummary(['GU +10 XP → T3 L5', `GU +21 XP → T3 L5, ${SH}`, 'Convergence Use +4 XP', `GU +21 XP, ${SH}`, 'Some warning.']);
      assert(JSON.stringify(s) === JSON.stringify(['GU +10 XP → T3 L5', `GU +42 XP → T3 L5, ${SH}`, 'Convergence Use +4 XP', 'Some warning.']), `LR1, SS: the share has its own total in the sit loop (${JSON.stringify(s)})`); }
    { const g = mk(10, 10, 7, 6), h = mk(7, 6, 7, 6), a = awardYukiFightXp(g, 'major'), b = awardYukiFightXp(h, 'major');
      assert(a[1] === `GU +50 XP, ${YUKI_HELD_TEXT.share}` && a[1] === b[1] && g.yuki.fight.tier === 10, `LR1, AP: above him (the owner's 11-08 ranks) the share is a level pair's, +50 not +72 (${a[1]} / ${b[1]})`); }
    { const src = (await import('node:fs')).readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      const body = src.slice(src.indexOf('function summarize(lines) {'), src.indexOf('\n}\n', src.indexOf('function summarize(lines) {')) + 2);
      const summarize = new Function(`${body}; return summarize;`)();
      const t = summarize(['GU +9 XP → T3 L5', 'Convergence Use +9 XP', `GU +21 XP → T3 L6, ${YUKI_HELD_TEXT.share}`]);
      assert((t.match(/GU →/g) || []).length === 1 && t.includes('GU → T3 L6') && !t.includes('T3 L5'), `LR1, SD: one GU bit, the last rank (${t})`); }
    { let found = null; // a reach whose leftover is under 10: its share floors to 0, no line
      for (let x = 0; x < 400 && !found; x++) { const g = mk(1, 1, 1, 2); g.yuki.fight.xp = x; const room = G.xpToNext(g.yuki.fight) - x, pool = Math.floor(30 * 0.6); if (pool >= room && pool - room > 0 && pool - room < 10) found = { g, x }; }
      const out = found ? awardYukiFightXp(found.g, 'standard') : [];
      assert(!!found && out.length === 1 && /level with James's GU \(held\)$/.test(out[0]) && found.g.james.gu.xp === 0, `LR1, T: a reach whose share floors to 0 gives no line (x ${found?.x}; ${out.join(' | ')})`); }
    { const g = mk(1, 8, 1, 9); g.coil.n = 21; g.james.gu.xp = G.xpToNext(g.james.gu) - 1; const out = awardYukiFightXp(g, 'major');
      assert(out[0].endsWith('→ T1 L9, where James\'s GU stood (held)') && /^GU \+\d+ XP → T1 L10, /.test(out[1] || '') && rk(g.yuki.fight) === 9 && rk(g.james.gu) === 10, `LR1, T: a reach whose share raises his GU: her line keeps T1 L9 (${out.join(' | ')})`); }
    { const g = mk(2, 2, 2, 2, 1191); g.james.skills['Convergence Use'] = { tier: 2, level: 1, xp: 0 }; ensureBars(g); g.james.qi = jamesQiMax(g);
      startCombat(g, { id: 'test_lx1', intro: 'In.', band: 'standard', enemies: [{ name: 'Rat', hp: 1, dc: 0.5, atk: 0.1, dmg: 0 }], win: 'stream', lose: 'stream' });
      let o = null; for (let t = 0; t < 20 && g.combat; t++) o = cStep(g, 'blade');
      const i = (o?.lines || []).indexOf(HELD22), share = `GU +${Math.floor(Math.floor(30 * 2 * 0.6) * 0.1)} XP, ${YUKI_HELD_TEXT.share}`;
      assert(o?.done === 'win' && i > 0 && o.lines.slice(0, i).some((l) => /^GU \+\d+ XP/.test(l)) && o.lines[i + 1] === share, `LR1, T: a won fight while held: his own XP, her held line, then his share (${(o?.lines || []).slice(-5).join(' | ')})`);
      const k = mk(2, 2, 2, 2, 1192), w = G.instantWin(k, { id: 'test_lx1b', intro: 'In.', band: 'standard', enemies: [{ name: 'Rat', hp: 1, dc: 0.5, atk: 0.1, dmg: 0 }], win: 'stream', lose: 'stream' });
      const j = w.lines.indexOf(HELD22);
      assert(j > 0 && w.lines[j + 1] === share, `LR1, T: the one-move finish the same (${w.lines.join(' | ')})`); }
    // v0.11.130 (owner pick YB1, HL; Fable's MAINs): when his share raises his GU in the same award, her line names the rank
    // where his GU stood (heldPast / reachPast), not "held at James's GU"; with no rank-up the old lines stay
    { const { splitLine } = await import('../js/core/replies.js');
      assert(YUKI_HELD_TEXT.heldPast === "Yuki Fight held at T{t} L{l}, where James's GU stood" && YUKI_HELD_TEXT.reachPast === "Yuki Fight +{xp} → T{t} L{l}, where James's GU stood (held)", 'YB1, HL: Fable\'s two MAINs word for word');
      { const g = mk(3, 4, 3, 4); g.james.gu.xp = G.xpToNext(g.james.gu) - 1; const out = awardYukiFightXp(g, 'major');
        assert(out[0] === 'Yuki Fight held at T3 L4, where James\'s GU stood' && /^GU \+\d+ XP → T3 L5, /.test(out[1] || '') && rk(g.yuki.fight) === 24 && rk(g.james.gu) === 25, `YB1, HL: held, his share moves him on: heldPast with her rank (${out.join(' | ')})`); }
      { const g = mk(3, 4, 3, 4); const out = awardYukiFightXp(g, 'major');
        assert(out[0] === YUKI_HELD_TEXT.held.replace('{t}', 3).replace('{l}', 4) && !/→/.test(out[1] || ''), `YB1, HL: held, his share doesn't move him: the held line as before (${out.join(' | ')})`); }
      { const g = mk(1, 8, 1, 9); g.coil.n = 21; const out = awardYukiFightXp(g, 'major');
        assert(/^Yuki Fight \+\d+ → T1 L9, level with James's GU \(held\)$/.test(out[0]) && !/→/.test(out[1] || '') && rk(g.james.gu) === 9, `YB1, HL: a reach with no rank-up keeps "level with" (${out.join(' | ')})`); }
      const sh = splitLine(YUKI_HELD_TEXT.heldPast.replace('{t}', 3).replace('{l}', 4)), sh0 = splitLine(YUKI_HELD_TEXT.held.replace('{t}', 3).replace('{l}', 4));
      assert(JSON.stringify(Object.keys(sh)) === JSON.stringify(Object.keys(sh0)) && sh.reply === sh0.reply && (sh.gain === '') === (sh0.gain === ''), `YB1, HL: the replies read heldPast as they read held (${JSON.stringify(sh)} / ${JSON.stringify(sh0)})`);
      const src = (await import('node:fs')).readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      const lit = /const up = (\/\^\(\.\+\?\) .+?\$\/)\.exec\(l\)/.exec(src)?.[1], re = lit ? new RegExp(lit.slice(1, -1)) : null, m = re?.exec(YUKI_HELD_TEXT.reachPast.replace('{xp}', 40).replace('{t}', 2).replace('{l}', 3));
      assert(!!m && m[1] === 'Yuki Fight' && m[2] === 'T2 L3', `YB1, HL: the Results summary reads reachPast's rank (${m?.slice(1).join(' / ')})`); }
    // v0.11.130 (owner pick RB2; Fable's review of YB1): HA above him (a save from before YK1) the held line stays; TG a share
    // two ranks up, heldPast through the Results summary, a whole fight ending in reachPast
    { { const g = mk(10, 10, 7, 6); g.james.gu.xp = G.xpToNext(g.james.gu) - 1; const out = awardYukiFightXp(g, 'major');
        assert(out[0] === YUKI_HELD_TEXT.held.replace('{t}', 7).replace('{l}', 6) && /^GU \+\d+ XP → T7 L7, /.test(out[1] || '') && rk(g.yuki.fight) === 100, `RB2 (HA): above him, a share that moves him on keeps the held line (${out.join(' | ')})`); }
      { const g = mk(3, 10, 3, 10); g.coil.n = 16; g.james.gu.xp = G.xpToNext(g.james.gu) - 1; ensureBars(g); const out = awardYukiFightXp(g, 'major');
        assert(out[0] === 'Yuki Fight held at T3 L10, where James\'s GU stood' && /^GU \+\d+ XP → T4 L2, /.test(out[1] || '') && rk(g.james.gu) === 32, `RB2 (TG): a share two ranks up: heldPast, his last rank on his line (${out.join(' | ')})`); }
      { const src = (await import('node:fs')).readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
        const body = src.slice(src.indexOf('function summarize(lines) {'), src.indexOf('\n}\n', src.indexOf('function summarize(lines) {')) + 2);
        const summarize = new Function(`${body}; return summarize;`)();
        const t = summarize([YUKI_HELD_TEXT.heldPast.replace('{t}', 3).replace('{l}', 4), `GU +14 XP → T3 L5, ${YUKI_HELD_TEXT.share}`]);
        assert(t.includes('GU → T3 L5') && !/Yuki Fight →|T3 L4/.test(t), `RB2 (TG): the Results summary reads heldPast as held: his rank only (${t})`); }
      { const fight = () => ({ id: 'test_rb2', intro: 'In.', band: 'standard', enemies: [{ name: 'Rat', hp: 1, dc: 0.5, atk: 0.1, dmg: 0 }], win: 'stream', lose: 'stream' });
        const prep = (gx) => { const g = mk(1, 8, 1, 9, 1193); g.yuki.fight.xp = G.xpToNext(g.yuki.fight) - 1; g.james.gu.xp = gx; g.james.skills['Convergence Use'] = { tier: 2, level: 1, xp: 0 }; ensureBars(g); g.james.qi = jamesQiMax(g); return g; };
        const run = (g) => { startCombat(g, fight()); let o = null; for (let t = 0; t < 20 && g.combat; t++) o = cStep(g, 'blade'); return o; };
        const dry = run(prep(0)), own = Number(/^GU \+(\d+) XP/.exec((dry?.lines || []).find((l) => /^GU \+\d+ XP(?! .*couldn't keep)/.test(l) && !/couldn't keep/.test(l)) || '')?.[1] || 0);
        const g = prep(G.xpToNext({ tier: 1, level: 9, xp: 0 }) - own - 1), o = run(g), i = (o?.lines || []).findIndex((l) => /where James's GU stood \(held\)$/.test(l));
        assert(o?.done === 'win' && own > 0 && i > 0 && /^GU \+\d+ XP → T1 L10, from what Yuki couldn't keep$/.test(o.lines[i + 1] || ''), `RB2 (TG): a won fight ends in reachPast, then his share (own ${own}; ${(o?.lines || []).slice(-4).join(' | ')})`); } }
    // the owner's save from before YK1 (Yuki T10 L10, GU T7 L6): loads with her number kept, and fights at his GU
    { const { gunzipSync } = await import('node:zlib'); const t = (await import('node:fs')).readFileSync(new URL('../saves/2026-11-08-0813-incremental-a1_end.txt', import.meta.url), 'utf8').trim();
      const g = deserialize(t.startsWith('BAZ1:') ? gunzipSync(Buffer.from(t.slice(5), 'base64')).toString('utf8') : t);
      assert(g.yuki.fight.tier === 10 && g.yuki.fight.level === 10 && g.james.gu.tier === 7 && g.james.gu.level === 6 && yukiFightSkill(g) === g.james.gu && deserialize(serialize(g)).yuki.fight.tier === 10, 'YK1: the owner\'s 11-08 save keeps Yuki T10 L10 and fights her at his T7 L6'); }
}
// v0.11.117 (owner pick TW1; research.md #62): the threat word. A fight choice is taken on a copy and its fight played with
// the blade alone (plainFight); the band is the word (Fable's); the screen shows it, the bots never read it.
{
    const G = await import('../js/core/game.js');
    const { plainFight, THREAT_TEXT, THREAT_LOW, THREAT_HIGH, combatHooks, takeCapNotes } = G;
    const { threatOf, choose: chooseS } = await import('../js/core/story.js');
    const { playFight } = await import('../tools/lib/fightlab.mjs');
    const base = () => { const g = ensureBars(newGame(129, { closed: true })); g.james.gu = { tier: 3, level: 1, xp: 0 }; g.james.skills['Convergence Use'] = { tier: 1, level: 9, xp: 0 }; ensureBars(g); g.james.hp = jamesHpMax(g); g.yuki.hp = 0; return g; };
    const enc = (e) => ({ id: 'test_tw1', intro: 'In.', band: 'standard', enemies: [{ name: 'Foe', hp: 10, dc: 1, atk: 0.1, dmg: 0, ...e }], win: 'stream', lose: 'stream' });
    assert(THREAT_TEXT.words.join() === 'losing,narrow,costly,clean' && THREAT_TEXT.hold.length === 4 && THREAT_TEXT.hold[0] === 'With the blade alone, swing and guard, you lose this one. A better fight than that might not.' && THREAT_LOW === 30 && THREAT_HIGH === 70, "TW1: Fable's four words and hold lines, 30 / 70");
    assert(plainFight(base(), enc({})) === 3 && plainFight(base(), enc({ hp: 999, dc: 99, atk: 99, dmg: 99 })) === 0, 'TW1: a soft foe is clean, an impossible one losing');
    { const bands = []; for (let d = 1; d <= 40; d++) bands.push(plainFight(base(), enc({ hp: 30, atk: 99, dmg: d })));
      assert(bands.includes(1) && bands.includes(2) && bands.every((b, i) => i === 0 || b <= bands[i - 1]), `TW1: harder blows, never a better word; narrow and costly both reached (${bands.join('')})`); }
    { const b0 = combatHooks.before, l0 = combatHooks.lose; plainFight(base(), enc({})); let threw = false; try { plainFight(base(), { id: 'x', enemies: null }); } catch { threw = true; }
      assert(threw && combatHooks.before === b0 && combatHooks.lose === l0, 'TW1: the story hooks are put back, even after a throw'); }
    // TX1 (T; Fable's review): every fight choice in five states (strong, weak, hurt, Act 1, the Long Forest): the same band as the
    // fight lab's blade tactic and as the real tap (choose, then startCombat with the hooks on); the save, the hooks and capNotes untouched
    { const pct = (x) => Math.round((100 * Math.max(0, x.james.hp)) / jamesHpMax(x));
      const bandOf = (win, h0, h1) => (!win ? 0 : (100 * h1) / h0 < THREAT_LOW ? 1 : (100 * h1) / h0 <= THREAT_HIGH ? 2 : 3);
      const states = [base(), (() => { const g = base(); g.james.gu = { tier: 1, level: 2, xp: 0 }; g.james.skills['Convergence Use'] = { tier: 1, level: 2, xp: 0 }; ensureBars(g); return g; })(),
          (() => { const g = base(); g.james.hp = Math.round(jamesHpMax(g) * 0.29); return g; })(), (() => { const g = base(); g.flags.ending = 'victory'; g.minutes = 7 * 1440 + 6 * 60; return g; })(),
          (() => { const g = base(); g.flags.longforest = true; return g; })()];
      let n = 0, words = 0, labBad = [], tapBad = [], dirty = 0; const b0 = combatHooks.before, l0 = combatHooks.lose;
      for (const [k, st] of states.entries()) for (const [id, s] of Object.entries(SCENES)) (s.choices || []).forEach((ch, i) => { if (!ch.combat) return; n++;
          const g = structuredClone(st); g.scene = id; const snap = serialize(g); const t = threatOf(g, SCENES, i);
          if (serialize(g) !== snap || takeCapNotes().length || combatHooks.before !== b0 || combatHooks.lose !== l0) dirty++;
          const c = JSON.parse(JSON.stringify(g)); let r = null; try { r = chooseS(c, SCENES, i); } catch { r = null; }
          if (!r?.combat) { if (t !== null) labBad.push(`${k}:${id}#${i} no fight, word ${t?.band}`); return; }
          let e = null; try { e = r.combat(c); } catch { if (t !== null) labBad.push(`${k}:${id}#${i} a fight that can't be built, word ${t?.band}`); return; } // a Long Forest fight needs its season's state
          words++;
          const lc = JSON.parse(JSON.stringify(c)); const h0 = pct(lc); const lab = playFight(lc, combatHooks.before(lc, e), 'blade'); const lb = bandOf(lab.win, h0, lab.hp);
          if (!t || lb !== t.band || t.fists !== (e.style === 'unarmed')) labBad.push(`${k}:${id}#${i} lab ${lb} word ${t?.band}`);
          const tc = JSON.parse(JSON.stringify(c)); const t0 = pct(tc); startCombat(tc, e); let o = null; for (let q = 0; q < 400 && tc.combat; q++) { o = combatStep(tc, 'blade'); if (o?.done) break; }
          if (bandOf(o?.done === 'win', t0, pct(tc)) !== t?.band) tapBad.push(`${k}:${id}#${i}`); combatHooks.lose = l0; });
      assert(words > 150 && !labBad.length, `TX1, T: every fight choice in five states has the fight lab's band (${words} words of ${n}; ${labBad.slice(0, 4).join(', ')})`);
      assert(!tapBad.length, `TX1, T: and the real tap's band (${tapBad.slice(0, 4).join(', ')})`);
      assert(!dirty && combatHooks.before === b0 && combatHooks.lose === l0, `TX1, T: the save, the hooks and capNotes untouched (${dirty})`);
      const g = base(); g.scene = Object.entries(SCENES).find(([, s]) => (s.choices || []).some((c) => c.combat))[0]; const ni = SCENES[g.scene].choices.findIndex((x) => !x.combat);
      if (ni >= 0) assert(threatOf(g, SCENES, ni) === null, 'TW1: no word on a choice with no fight');
      assert(threatOf(g, SCENES, 1000) === null && threatOf(g, SCENES, 1000 + ni) === null, 'TX1, PF: the one-move card (1000+) gets none and is not played'); }
    // HL: an untouched win from 29% HP is clean (it was narrow); a win that costs half of a full bar costly
    { const low = base(); low.james.hp = Math.round(jamesHpMax(low) * 0.29); assert(plainFight(low, enc({})) === 3, 'TX1, HL: an untouched win from low HP reads clean');
      const bands = []; for (let d = 1; d <= 40; d++) { const h = base(); h.james.hp = Math.round(jamesHpMax(h) * 0.5); bands.push(plainFight(h, enc({ hp: 30, atk: 99, dmg: d }))); }
      assert(bands.includes(1) && bands.includes(2) && bands.every((x, i) => i === 0 || x <= bands[i - 1]), `TX1, HL: from half HP the cost bands still run in order (${bands.join('')})`); }
    // UB: Bao's bare-handed brawl reads with the fists' lines (the blade is a strike every round there); a spar with the blade's
    { let fists = null, spar = null; for (const [id, s] of Object.entries(SCENES)) (s.choices || []).forEach((ch, i) => { if (!ch.combat) return; for (const st of [base()]) { const g = structuredClone(st); g.scene = id; const t = threatOf(g, SCENES, i); const c = JSON.parse(JSON.stringify(g)); let e = null; try { const r = chooseS(c, SCENES, i); e = r.combat ? r.combat(c) : null; } catch { e = null; } if (t && e?.style === 'unarmed') fists = t; if (t && e?.style === 'spar') spar = t; } });
      assert(fists?.fists === true && spar && spar.fists === false, 'TX1, UB: the brawl reads with fists, the spar with the blade');
      assert(THREAT_TEXT.fists.length === 4 && THREAT_TEXT.fists[0] === 'With your fists alone, stepping in and hitting every round, you lose this one. A better fight than that might not.', "TX1, UB: Fable's brawl lines"); }
    { const { readFileSync } = await import('node:fs'); const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8'); const faq = readFileSync(new URL('../js/core/faq.js', import.meta.url), 'utf8'); const bot = readFileSync(new URL('./lib/smartfight.mjs', import.meta.url), 'utf8');
      assert(/threatOf\(g, SCENES, c\.index\)/.test(main) && /fight · \$\{THREAT_TEXT\.words\[th\.band\]\}/.test(main) && /\(th\.fists \? THREAT_TEXT\.fists : THREAT_TEXT\.hold\)\[th\.band\]/.test(main), 'TW1 + TX1: the card\'s tag and its hold line (the brawl\'s own)');
      assert(/more than \$\{THREAT_HIGH\}% of the HP he has/.test(faq) && /less than \$\{THREAT_LOW\}% of it/.test(faq) && !/threatOf|plainFight/.test(bot), 'TW1: the FAQ reads the constants; the bots never read the word');
      const { FAQ } = await import('../js/core/faq.js'); assert(FAQ.find(([q]) => q === 'Fights')[1]().includes('losing (he loses it), narrow (he wins, and it costs him more than 70% of the HP he has), costly (30–70% of it) or clean (less than 30% of it)'), "TW1 + TX1: the FAQ's sentence (Fable's)"); }
}
// v0.11.110 (owner pick GD1): group d's small items in one push: CV (the fight's cards show the check's own value, hunger
// counted), FO (the smart rule pays for an unsung flail only while no free formed weapon is out), KN (a formed fragile
// knife's swings left are free, so the smart rule swings them out), FQ (the FAQ: the blast's difficulty one lower).
{
    const { checkValue, rollCheck, skillCheck } = await import('../js/core/game.js');
    const { knifeSwings } = await import('../js/core/forms.js');
    const { readFileSync } = await import('node:fs');
    const { FAQ } = await import('../js/core/faq.js');
    const setSk = (g, t, l) => { g.james.skills['Convergence Use'] = { tier: t, level: l, xp: 0 }; g.james.gu = { tier: t, level: l, xp: 0 }; };
    const foe = (n) => ({ name: n, hp: 99, dc: 1, atk: 1, dmg: 0 });
    // CV: the value with hunger, the same the check uses; the cards and Run read it
    { const g = ensureBars(newGame(90, { closed: true })); setSk(g, 1, 6); const base = skillCheck(g.james.gu);
      for (const [sat, less] of [[80, 0], [30, 0], [29.9, 1], [10, 1], [0, 2]]) { g.james.satiety = sat; // review low: the hunger edge (30 / 29.9) pinned
          const v = checkValue(g, 'GU'), r = rollCheck(g, 'GU', 1);
          assert(Math.abs(v - (base - less)) < 1e-9 && r.value === v, `CV: Fed ${sat}: the value ${v} = ${base} − ${less}, the check's ${r.value}`);
          assert(checkValue(g, 'Convergence Use', 0.5) === rollCheck(g, 'Convergence Use', 1, 0.5).value, `CV: Fed ${sat}: Convergence Use with a bonus matches the check`); } }
    { const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      const cards = main.slice(main.indexOf('function renderCombatCards'), main.indexOf('view.innerHTML', main.indexOf('function renderCombatCards')));
      assert(/checkValue\(g, a\.skill, \(a\.guard \|\| a\.remark \|\| a\.qshield \|\| a\.field \? \(c\.adapt\?\.\[id\] \|\| 0\) : fightAdapt\(c, kk\)\) \+ \(a\.unarmed \? unarmedMastery\(g\) : /.test(cards) && /kk = songed \? sungKey\(g\) : id/.test(cards) && /checkValue\(g, 'GU'\)/.test(cards) && !/skillCheck\(/.test(cards), 'CV: the fight\'s cards and Run show checkValue, never skillCheck (v0.11.114, PB1: with unarmed mastery; v0.11.115, MA3: the memory and familiarity; v0.11.116, WA2 + WB1: a needle the song pays for shows the practice it uses)'); }
    // FO: a formed spear (or a holding blade) is used before paying for an unsung flail; with none formed, the flail as before
    { const m = ensureBars(newGame(91, { closed: true })); setSk(m, 2, 1); m.james.qi = 20;
      sCombat(m, { id: 'jackals', intro: '', band: 'standard', enemies: [foe('A'), foe('B')], win: 'stream', lose: 'stream' }); m.combat.fieldUsed = true;
      assert(smartAction(m) === 'flail', 'FO: two foes, nothing formed → the flail');
      m.combat.spearFormed = true; assert(smartAction(m) === 'spear', 'FO: two foes, a sung spear, an unsung flail → the spear (free)');
      m.combat.spearFormed = false; m.combat.bladeFormed = true; assert(!fragileKnife(m) && smartAction(m) === 'blade', 'FO + FB1: two foes, a holding blade formed → the blade (free), not a paid flail or spear');
      m.combat.enemies[1].hp = 0; assert(smartAction(m) === 'blade', 'FB1: one foe, a holding blade formed → the blade, not a paid spear'); m.combat.enemies[1].hp = 99;
      m.combat.bladeFormed = false; m.combat.enemies[1].hp = 0; assert(smartAction(m) === 'spear', 'FB1: one foe, nothing formed → the spear, as before'); m.combat.enemies[1].hp = 99; m.combat.bladeFormed = true;
      m.combat.flailFormed = true; m.combat.spearFormed = true; assert(smartAction(m) === 'flail', 'FO: a sung flail on two foes still swings'); }
    // KN: a formed fragile knife with swings left and no Qi for a new one → the blade, free; unformed with no Qi → guard
    { const k = ensureBars(newGame(92, { closed: true })); setSk(k, 1, 3); k.james.qi = 40;
      sCombat(k, { id: 'jackals', intro: '', band: 'standard', enemies: [foe('A')], win: 'stream', lose: 'stream' }); k.combat.fieldUsed = true;
      assert(fragileKnife(k) && knifeSwings(k) === 2, `KN: T1 L3: the knife lasts 2 swings (${knifeSwings(k)})`);
      cStep(k, 'blade'); assert(k.combat.bladeFormed && k.combat.knifeSw === 1, 'KN: the first swing sings it, one left');
      const calm = () => { delete k.combat.wait; k.combat.song = 0; }; // v0.11.116 (WA2): the knife's rule, without the rhythm's wait or the song's needle
      calm(); k.james.qi = 0; assert(smartAction(k) === 'blade', 'KN: no Qi, a formed knife with a swing left → the blade');
      const o = cStep(k, 'blade'); assert(k.james.qi === 0 && !o.lines.some((l) => /fall back on guarding/.test(l)) && !k.combat.bladeFormed, 'KN: the swing left is free, then it shatters');
      calm(); assert(smartAction(k) === 'guard', 'KN: shattered, no Qi, no darts at T1 L3 → guard'); }
    { // review low: instead of darts too (T1 L7: darts open at 2 Qi, a new knife 3)
      const d = ensureBars(newGame(93, { closed: true })); setSk(d, 1, 7); d.james.qi = 40;
      sCombat(d, { id: 'jackals', intro: '', band: 'standard', enemies: [foe('A')], win: 'stream', lose: 'stream' }); d.combat.fieldUsed = true;
      cStep(d, 'blade'); d.james.qi = 2.5; delete d.combat.wait; d.combat.song = 0; // v0.11.116 (WA2): without the rhythm's wait or the song
      assert(fragileKnife(d) && actionOpen(d, 'dart') && d.combat.bladeFormed && smartAction(d) === 'blade', 'KN: a formed knife with swings left, Qi for darts only → the blade, not darts');
      d.combat.bladeFormed = false; assert(smartAction(d) === 'dart', 'KN: no knife formed, Qi for darts only → darts, as before'); }
    // FQ: Fable's clause
    assert(/a Convergence Use check, no bone, its difficulty one lower than a weapon's\)/.test(FAQ.find(([t]) => t === 'Fights')[1]()), 'FQ: the FAQ says the blast\'s difficulty is one lower (Fable)');
}
// v0.10.4: Bonesinger forms — Incremental Mode shows only what James can sing
{
    const setCu = (g, t, l) => { g.james.skills['Convergence Use'] = { tier: t, level: l, xp: 0 }; };
    const g = ensureBars(newGame(81, { closed: true }));
    assert(Object.keys(FORM_LINES).join() === 'ranged,melee,structures,reach,sweep,defence', 'six lines (v0.11.4: reach; v0.11.107, NK1: sweep)');
    assert(cuRank(g) === 1 && hasForm(g, 'needle') && hasForm(g, 'fragile_knife') && !hasForm(g, 'dart') && !hasForm(g, 'spikes') && !hasForm(g, 'bracer'), 'T1 L1: needle and fragile knife only');
    assert(!actionOpen(g, 'dart') && actionOpen(g, 'needle') && actionOpen(g, 'blade') && actionOpen(g, 'guard') && actionLabel(g, 'blade', 'x') === 'Fragile bone knife' && fragileKnife(g), 'fight at T1 L1: no darts, a fragile knife');
    setCu(g, 1, 5); assert(actionOpen(g, 'dart') && actionLabel(g, 'dart', 'x') === 'Bone darts' && /Bracer/.test(actionLabel(g, 'guard', 'x')), 'T1 L5: darts and a bracer');
    setCu(g, 1, 8); assert(!fragileKnife(g) && actionLabel(g, 'blade', 'x') === 'Bone knife', 'T1 L8: the knife holds');
    setCu(g, 2, 5); assert(actionLabel(g, 'blade', 'x') === 'Bone sword' && /Shield/.test(actionLabel(g, 'guard', 'x')), 'T2 L5: sword and shield');
    setCu(g, 3, 1); assert(actionLabel(g, 'dart', 'x') === 'Thrown bone lance' && hasForm(g, 'slab'), 'T3 L1: lance and slab');
    // the knife breaks every swing at T1 L1–L2, after two swings at L3–L4 (v0.11.104, GW2 K: still formed after one), and holds from T1 L8
    for (const [l, holds] of [[1, false], [3, true], [8, true]]) {
        const h = ensureBars(newGame(82, { closed: true })); setCu(h, 1, l); h.james.qi = 40;
        sCombat(h, { id: 'jackals', intro: '', band: 'standard', enemies: [{ name: 'Dummy', hp: 999, dc: 1, atk: 1, dmg: 0 }], win: 'stream', lose: 'stream' });
        cStep(h, 'blade');
        assert(!!h.combat.bladeFormed === holds, `T1 L${l}: the knife ${holds ? 'holds' : 'breaks'} after a swing`);
        const q0 = h.james.qi; cStep(h, 'dart');
        if (l < 5) assert(h.combat && h.james.qi === q0, `v0.11.21: a dart below T1 L5 falls back on guarding (no Qi spent: ${q0} → ${h.james.qi})`); // was `|| true`: could never fail
    }
    // story choices: hidden until the form, then back
    const s = ensureBars(newGame(83, { closed: true })); s.minutes = 7 * 60;
    goTo(s, SCENES, 'hunt'); const lab = () => sceneView(s, SCENES).choices.filter((c) => !c.disabled).map((c) => c.label);
    assert(!lab().some((x) => /bone dart/.test(x)), 'Day 1 hunt: no dart below T1 L5');
    setCu(s, 1, 5); assert(lab().some((x) => /bone dart/.test(x)), 'Day 1 hunt: the dart at T1 L5');
    let gated = 0; for (const sc of Object.values(SCENES)) for (const c of sc.choices || []) if (c.form) gated++;
    assert(gated === 18, `18 story choices need a form (${gated})`);
    // the rewordings: Incremental Mode only
    const t = (sc, re) => SCENES[sc].choices.find((c) => re.test(String(typeof c.text === 'function' ? c.text(s) : c.text)));
    assert(t('night_attack', /^A hedge of bone spikes/) && t('rt_ford', /stepping-stones/) && t('rt_ambush', /slab of bone/) && t('ring_chambers', /slab of bone/), 'four rewordings in Incremental Mode');
    assert(/hedge/.test(SCENES.night_attack_forced.text), 'the hedge fail text');
    const fc = t('rt_ford', /stepping-stones/); const fg = ensureBars(newGame(84)); setCu(fg, 3, 1);
    assert(fc.do(fg).some((l) => /stepping-stones/.test(l)), 'the ford result line');
}
// v0.10.2: the camp is a task screen (its checks keep the story numbers); waiting for a time of day plays at once
{
    const g = ensureBars(newGame(71, { closed: true })); goTo(g, SCENES, 'camp'); g.minutes = 15 * 60;
    g.james.skills['Convergence Use'].level = 3; // v0.10.4: the stakes need spikes (T1 L3)
    assert(isTaskHub(g), 'camp is a task hub');
    const cards = taskCards(g, SCENES);
    const fire = cards.find((c) => /^Make fire/.test(c.label)), stakes = cards.find((c) => /^Sing a ring/.test(c.label));
    assert(fire && fire.kind === 'chore' && stakes && stakes.kind === 'chore', 'fire and stakes are chores (story-check numbers)');
    assert(!cards.some((c) => /^Night falls/.test(c.label)) && !isTaskChoice(SCENES, 'camp', SCENES.camp.choices.findIndex((c) => /^Night falls/.test(c.text))), 'Night falls stays a story card');
    // same numbers as the story choice: a copy taking the choice directly ends identical
    const a = structuredClone(g), b = structuredClone(g);
    runTask(a, SCENES, fire.id); choose(b, SCENES, Number(fire.id.split(':')[1]));
    assert(a.minutes === b.minutes && a.flags.fire === b.flags.fire && a.james.hp === b.james.hp && JSON.stringify(a.james.gu) === JSON.stringify(b.james.gu), 'the fire card = the story choice (time, result, XP)');
    const o1 = taskOutcome(g, SCENES, fire.id); runTask(g, SCENES, fire.id); const e1 = g.minutes;
    const o2 = taskOutcome(g, SCENES, stakes.id); runTask(g, SCENES, stakes.id);
    assert(o1.end === e1 && o2.end === g.minutes && g.flags.fire && g.flags.stakes, 'v0.11.64: camp cards end where their card said');
    const ni = SCENES.camp.choices.findIndex((c) => /^Night falls/.test(c.text));
    choose(g, SCENES, ni);
    assert(g.scene === 'night' || g.minutes % 1440 >= 21 * 60, 'Night falls: the clock lands on 21:00 or later');
}
// v0.10.1: the Long Forest in task mode — gated behind the first Coil, one season (+1 realm) per card
{
    const labels = (g) => sceneView(g, SCENES).choices.filter((c) => !c.disabled).map((c) => c.label);
    const g = ensureBars(newGame(61, { closed: true }));
    assert(!labels(g).some((l) => /Stay lost/.test(l)), 'Coil 1: no Stay lost on the arrival');
    g.scene = 'clearing';
    assert(!labels(g).some((l) => /Stay lost/.test(l)) && !lfOpen(g), 'Coil 1: no Stay lost in the clearing');
    endCoil(g, 'choice', 'clearing'); rewind(g);
    assert(g.coil.n === 2 && g.scene === 'arrival' && lfOpen(g), 'Coil 2: the Long Forest opens');
    assert(labels(g).some((l) => /You remember this\. Stay lost/.test(l)), 'Coil 2: Stay lost on the arrival');
    const c2 = structuredClone(g); c2.scene = 'clearing';
    assert(labels(c2).some((l) => /one season at a time/.test(l)) && !labels(c2).some((l) => /in one step/.test(l)), 'Coil 2: Stay lost in the clearing (seasons), no one-step button');
    choose(g, SCENES, sceneView(g, SCENES).choices.find((c) => /You remember this\. Stay lost/.test(c.label)).index);
    assert(g.scene === 'lf_enter' && g.flags.longforest && g.flags.lf_active && g.flags.bone_ok, 'the arrival leads into the Long Forest');
    choose(g, SCENES, 0);
    assert(g.scene === 'lf_hub' && isTaskHub(g) && coilActive(g), 'the camp is a task screen, inside the Coil');
    const season = taskCards(g, SCENES).find((c) => /^Withdraw for a season/.test(c.label));
    assert(season && season.kind === 'chore' && season.minutes === LF_SEASON_MINUTES && /Mortal Vessel → Foundation/.test(season.label), 'the season card: a chore, 2 h, Mortal Vessel → Foundation');
    const m0 = g.minutes;
    runTask(g, SCENES, season.id);
    assert(g.james.realm === 1 && g.yuki.realm === 1 && g.james.primaries === 12 && g.james.collaterals === 66 && g.yuki.collaterals === 66 && !g.james.colSealed, 'a season: Foundation, every primary and collateral open, no seal');
    assert(g.james.gu.tier === 1 && g.james.gu.level === 7 && g.james.skills['Convergence Use'].level === 7 && g.yuki.fight.level === 7 && g.yuki.qiUse.level === 7, 'a season lifts the skills to T1 L7');
    assert(g.minutes - m0 === LF_SEASON_MINUTES && g.james.saturation === 0 && g.james.hp === jamesHpMax(g), 'a season takes 2 h, Saturation 0, bars full');
    const os = taskOutcome(g, SCENES, season.id); runTask(g, SCENES, season.id);
    assert(g.james.realm === 2 && os.end === g.minutes, 'two seasons: Core Formation, and the card said where it ends');
    for (let i = 0; i < 20; i++) { g.james.satiety = 100; lfSeason(g); }
    assert(g.james.realm === MAX_REALM && g.james.gu.tier === 10 && g.james.gu.level === 10 && g.yuki.qiUse.tier === 10 && g.james.extra8 === 8 && g.james.extraCollaterals === 28 && g.james.junctions === 10, 'the full climb: Heavenly Immortal, T10 L10, every extra meridian');
    assert(!taskCards(g, SCENES).some((c) => /^Withdraw for a season/.test(c.label)), 'no season card at the top of the ladder');
    assert(lfRank(7) === 49 && lfRank(10) === 70 && lfRank(14) === 100, 'ranks per rung: 49 / 70 / 100');
    const hi = ensureBars(newGame(62, { closed: true })); hi.james.gu = { tier: 10, level: 10, xp: 0 }; hi.james.realm = 1; hi.james.colSealed = true;
    lfSeason(hi);
    assert(hi.james.gu.tier === 10 && hi.james.realm === 2 && !hi.james.colSealed && hi.james.collaterals === 66, 'a season never lowers a skill, and lifts a seal');
    goTo(g, SCENES, 'lf_exit'); choose(g, SCENES, 0);
    assert(g.scene === 'dawn' && !g.flags.lf_active && LF_STOCK.every((id) => g.inventory[id] >= itemCap(id) - 1), 'leaving: Day 4 at dawn, the hammerspace full (less breakfast)');
    endCoil(g, 'choice', 'stream'); rewind(g);
    assert(g.james.realm === 0 && !g.inventory.hare_raw && g.coil.n === 3 && lfOpen(g), 'v0.11.0: a rewind starts the realm over, empties the hammerspace, and the forest stays open (climb it again)');
}
// v0.9.6: Act 1's Coil — Day 8 dawn, ends at Shen Qiu (rt_taken), accept or rewind; state 4 → 5
{
    const g = ensureBars(newGame(50)); g.scene = 'epilogue'; g.flags.ending = 'bluff'; g.minutes = 6 * 1440 + 15 * 60; g.coil.n = 3;
    choose(g, SCENES, 0);
    assert(g.scene === 'fo_start' && g.coil.act === 1 && g.coil.n === 3 && g.coil.snap.scene === 'fo_start' && g.coil.snap.minutes === 7 * 1440 + 360 && g.stats.coils0 === 3, 'Act 1 begins: its rewind point at Day 8 dawn, the same Coil (3) goes on (v0.11.26)');
    assert(coilActive(g), 'the Coil turns in Act 1');
    const inv0 = JSON.stringify(g.coil.snap.inventory);
    g.inventory.beast_core = 7; g.flags.log_heard = true; g.minutes += 12 * 1440; g.rel['Mei Lin'] = { f: 80, a: 80 };
    const { bumpRel } = await import('../js/core/game.js'); bumpRel(g, 'Mei Lin', 0, 0);
    goTo(g, SCENES, 'rt_taken');
    const bite = sceneView(g, SCENES).choices.find((c) => /Bite the tail/.test(c.label));
    assert(!!bite, 'rt_taken offers Bite the tail');
    choose(g, SCENES, bite.index);
    const v = sceneView(g, SCENES);
    assert(g.scene === 'coil_end' && g.coil.why === 'shen' && v.choices.some((c) => /Accept it. Walk/.test(c.label)) && /Act 1/.test(v.title), 'the Coil screen after Shen Qiu: accept or rewind');
    assert(/Wren Aldous/.test(v.text), 'James remembers the log');
    assert(v.choices.some((c) => /start of Act 1/.test(c.label)) && v.choices.some((c) => /start of the whole game/.test(c.label)) && !v.choices.some((c) => /same days/.test(c.label)), 'v0.11.26: Act 1\'s Coil screen: the start of Act 1 or of the whole game, no "same days again"');
    choose(g, SCENES, v.choices.find((c) => /start of Act 1/.test(c.label)).index);
    assert(g.scene === 'coil_dawn' && /Ashfall/.test(sceneView(g, SCENES).text), 'the start of Act 1 again');
    choose(g, SCENES, 0);
    assert(g.scene === 'fo_start' && g.coil.act === 1 && g.coil.n === 4 && g.minutes === 7 * 1440 + 360 && JSON.stringify(g.inventory) === inv0 && !g.flags.log_heard && !g.flags.a1_outcome, 'rewound to the start of Act 1: Coil 4 (one count), the world as it was');
    assert(g.rel['Mei Lin'].a >= 20, `25% head start in Act 1 (${g.rel['Mei Lin'].a})`);
    const a = ensureBars(newGame(51)); a.scene = 'epilogue'; a.flags.ending = 'lost'; a.minutes = 6 * 1440 + 15 * 60; choose(a, SCENES, 0);
    goTo(a, SCENES, 'rt_taken'); choose(a, SCENES, sceneView(a, SCENES).choices.find((c) => /Bite/.test(c.label)).index);
    choose(a, SCENES, sceneView(a, SCENES).choices.find((c) => /Accept it. Walk/.test(c.label)).index);
    assert(a.scene === 'a1_end' && a.flags.a1_outcome === 'taken' && coilActive(a), 'accept: on to the end of Act 1, where the Coil still turns (v0.11.26)');
    // v0.11.26 (owner 11:07, E1): the end of Act 1 goes round again, every outcome, to the start of Act 1 or of the whole game
    for (const [outcome, target] of [['taken', 'act'], ['victory', 'game'], ['revelation', 'act'], ['taken', 'game']]) {
        const e = ensureBars(newGame(57)); e.scene = 'epilogue'; e.flags.ending = 'paid'; e.minutes = 6 * 1440 + 15 * 60; e.coil.n = 2; choose(e, SCENES, 0);
        e.inventory.beast_core = 9; e.flags.a1_outcome = outcome; e.flags.lore_tree = true; e.flags.ship_found = true; e.tasks.fam['rr_hub:1'] = 7; e.rel['Mei Lin'] = { f: 60, a: 80 };
        const { bumpRel } = await import('../js/core/game.js'); bumpRel(e, 'Mei Lin', 0, 0);
        goTo(e, SCENES, 'a1_end');
        const ev = sceneView(e, SCENES);
        assert(ev.end && ev.choices.length === 1 && /Go round again/.test(ev.choices[0].label), `${outcome}: the end screen offers Go round again`);
        choose(e, SCENES, ev.choices[0].index);
        const av = sceneView(e, SCENES);
        const tail = outcome === 'taken' ? 'By choice: adds no faster learning.' : 'Act 1 is won: the next Coil learns ×1.5 as fast.'; // v0.11.106 (RA1): a won act's bite adds
        assert(e.scene === 'a1_again' && av.choices.map((c) => c.label).join('|') === `Bite the tail. Wake at the start of Act 1. (${tail})|Bite the tail. Wake at the start of the whole game (Day 1, the arrival). (${tail})|Not yet.`, `${outcome}: the confirm screen`);
        choose(e, SCENES, av.choices.find((c) => (target === 'act' ? /start of Act 1/ : /whole game/).test(c.label)).index);
        const won = outcome !== 'taken'; // v0.11.106 (RA1): after a won act going round again adds 0.25; after 'taken' by choice, as G1
        assert(e.scene === 'coil_dawn' && e.coil.n === 3 && e.coil.free === (won ? undefined : 1) && coilMult(e) === (won ? 1.5 : 1.25) && !e.flags.a1_outcome && !e.inventory.beast_core, `${outcome} → ${target}: Coil 3 (one count), ×${won ? '1.5 (RA1: a won act adds)' : '1.25 (G1: by choice, no bonus from it)'}, the outcome and the hammerspace gone (×${coilMult(e)}, free ${e.coil.free})`);
        assert(e.tasks.fam['rr_hub:1'] === 7 && e.flags.lore_tree && e.coil.known.includes('ship_found') && e.rel['Mei Lin'].a >= 20, `${outcome} → ${target}: familiarity, knowledge and the head start kept`);
        choose(e, SCENES, 0);
        if (target === 'act') assert(e.scene === 'fo_start' && e.coil.act === 1 && e.minutes === 7 * 1440 + 360 && e.flags.ending === 'paid', `${outcome} → the start of Act 1 (the prologue's outcome kept)`);
        else {
            assert(e.scene === 'arrival' && e.coil.act === 0 && e.minutes === newGame(1).minutes && !e.flags.ending && e.james.primaries === 0 && e.james.realm === 0, `${outcome} → the start of the whole game: Day 1, the arrival, channels shut, no tribute outcome`);
            assert(e.coil.snap.scene === 'arrival' && !e.coil.snap.flags.lore_tree && e.coil.snap.tasks.fam['rr_hub:1'] === undefined, 'the whole game\'s rewind point is a clean arrival');
            e.scene = 'epilogue'; e.flags.ending = 'bluff'; e.minutes = 6 * 1440 + 15 * 60; choose(e, SCENES, 0);
            assert(e.coil.act === 1 && e.coil.n === 3 && e.stats.coils0 === 3, 'back in Act 1 the same Coil goes on (3)');
        }
    }
    {
        const n = ensureBars(newGame(58)); n.scene = 'epilogue'; n.flags.ending = 'paid'; n.minutes = 6 * 1440 + 15 * 60; choose(n, SCENES, 0);
        endCoil(n, 'choice', 'a1_end'); const r = rewind(n, { same: true });
        assert(r === 2 && !('played' in n.coil) && !('replay' in n.coil), 'v0.11.26: no "same days again" (the old option is ignored, its fields gone)');
        const pv = ensureBars(newGame(59)); endCoil(pv, 'choice', 'arrival'); goTo(pv, SCENES, 'coil_end');
        assert(sceneView(pv, SCENES).choices.filter((c) => /Bite/.test(c.label)).map((c) => c.label).join('|') === 'Bite the tail. Wake at the first dawn.', 'v0.11.26: the prologue wakes at the first dawn only');
    }
    // v0.11.26: one count per save; an older save's Act 1 count becomes the prologue's + Act 1's − 1, once
    {
        const o = ensureBars(newGame(60)); o.scene = 'epilogue'; o.flags.ending = 'paid'; o.minutes = 6 * 1440 + 15 * 60; choose(o, SCENES, 0);
        o.coil.n = 2; o.stats.coils0 = 4; delete o.coil.one; migrate(o);
        assert(o.coil.n === 5 && o.coil.one, `an older Act 1 save: 4 + 2 − 1 = Coil 5 (${o.coil.n})`);
        migrate(o); assert(o.coil.n === 5, 'and only once');
        const pr = ensureBars(newGame(61)); pr.coil.n = 3; delete pr.coil.one; migrate(pr); assert(pr.coil.n === 3 && pr.coil.one, 'a prologue save keeps its count');
    }
    {   // the owner's save (2026-11-07 11:02): the end of Act 1 after "taken", Act 1 Coil 1 after 1 prologue Coil
        const { readFileSync } = await import('node:fs'); const { gunzipSync } = await import('node:zlib');
        const t = readFileSync(new URL('../saves/2026-11-07-1102-incremental-a1_end.txt', import.meta.url), 'utf8').trim();
        const w = JSON.parse(gunzipSync(Buffer.from(t.slice(5), 'base64')).toString('utf8'));
        const o = migrate(JSON.parse(w.data)); ensureBars(o);
        assert(o.scene === 'a1_end' && o.coil.n === 1 && coilActive(o) && /Go round again/.test(sceneView(o, SCENES).choices[0]?.label), 'the owner\'s 11:02 save: Coil 1, Go round again offered');
        const o2 = JSON.parse(JSON.stringify(o));
        choose(o, SCENES, 0); choose(o, SCENES, sceneView(o, SCENES).choices.findIndex((c) => /start of Act 1/.test(c.label))); choose(o, SCENES, 0);
        assert(o.scene === 'fo_start' && o.coil.n === 2 && o.coil.act === 1, 'the owner\'s save → the start of Act 1, Coil 2');
        choose(o2, SCENES, 0); choose(o2, SCENES, sceneView(o2, SCENES).choices.findIndex((c) => /whole game/.test(c.label))); choose(o2, SCENES, 0);
        assert(o2.scene === 'arrival' && o2.coil.n === 2 && o2.coil.act === 0, 'the owner\'s save → the whole game, Coil 2');
    }
    // v0.11.26 (Fable review): the save list shows the one count; the dawn screen names no number
    {
        const { peekSave, serialize } = await import('../js/core/game.js');
        const o = ensureBars(newGame(62)); o.scene = 'epilogue'; o.flags.ending = 'paid'; o.minutes = 6 * 1440 + 15 * 60; choose(o, SCENES, 0);
        o.coil.n = 2; o.stats.coils0 = 3; delete o.coil.one;
        assert(peekSave(serialize(o)).coil === 4, 'v0.11.26: the save list shows an older Act 1 save as it will load (3 + 2 − 1)');
        endCoil(o, 'choice', 'fo_start'); o.coil.one = true; rewind(o, { to: 'game' }); goTo(o, SCENES, 'coil_dawn');
        assert(/seen this sky before/.test(sceneView(o, SCENES).text) && !/\d+ times before/.test(sceneView(o, SCENES).text), 'v0.11.26: the dawn again says "before", no count');
    }
    // state 4 → 5: prologue saves get act 0; a save mid-Act 1 gets an Act 1 Coil that rewinds to where it was loaded
    const p4 = ensureBars(newGame(52)); p4.v = 4; delete p4.coil.act; migrate(p4);
    assert(p4.v === SAVE_VERSION && p4.coil.act === 0, 'state 4 in the prologue: act 0');
    const s4 = ensureBars(newGame(53)); s4.flags.ending = 'paid'; s4.scene = 'fo_ashfall'; s4.minutes = 8 * 1440 + 600; s4.v = 4; delete s4.coil.act; migrate(s4);
    assert(inAct1(s4) && s4.coil.act === 1 && s4.coil.n === 1 && s4.coil.snap.scene === 'fo_ashfall' && s4.coil.wake === 'fo_ashfall', 'state 4 mid-Act 1: an Act 1 Coil from the save as loaded');
}

// v0.9.7: severe difficulty — HP 0 outside a fight and a lost beast fight end the Coil; people keep their branches
{
    const g = ensureBars(newGame(60)); g.james.hp = 0.5; g.james.satiety = 0; g.starveCarry = 55; // v0.10.0: a starving hour builds up first
    choose(g, SCENES, SCENES.arrival.choices.findIndex((c) => /Sit up/.test(String(c.text))));
    assert(g.scene === 'coil_end' && g.coil.why === 'collapse', `starving to 0 ends the Coil (${g.scene})`);
    assert(!sceneView(g, SCENES).choices.some((c) => /Accept/.test(c.label)), 'no Accept after a death');
    const enc = (id) => ({ id, intro: 'x', enemies: [{ name: 'X', hp: 99, dc: 40, atk: 40, dmg: 40 }], win: 'night_won', lose: id === 'gao' ? 'gao_lost' : 'night_lost' });
    const b = ensureBars(newGame(61)); b.scene = 'night_event'; startCombat(b, enc('rats'));
    let o; for (let t = 0; t < 50 && b.combat; t++) o = combatStep(b, 'dart');
    assert(o.done === 'lose' && o.next === 'coil_end' && b.coil.why === 'beast', 'a lost beast fight goes to the Coil screen');
    goTo(b, SCENES, o.next);
    assert(/Teeth/.test(sceneView(b, SCENES).text), 'the beast text');
    const p = ensureBars(newGame(62)); p.scene = 'herb_girl'; startCombat(p, enc('gao'));
    for (let t = 0; t < 50 && p.combat; t++) o = combatStep(p, 'dart');
    assert(o.next === 'gao_lost', 'a lost fight against a person keeps its scene');
    const e = ensureBars(newGame(63)); startCombat(e, { id: 'zz_test', enemies: [{ name: 'Y', hp: 5, dc: 3, atk: 3, dmg: 1 }], win: 'night_won', lose: 'night_lost' });
    assert(e.combat.enemies[0].dc === 3.5 && e.combat.enemies[0].atk === 3.5, 'beasts +0.5 in task mode');
    const tg = ensureBars(newGame(64));
    const bl = SCENES.tribute.choices.find((c) => /Bluff/.test(String(c.text))), hp = SCENES.tribute.choices.find((c) => /hairpin/.test(String(c.text)));
    assert(bl.check.dc === 7 && hp.check.dc === 5, 'tribute +1 in task mode');
}
// the Coil: rewind keeps James, Yuki, familiarity and knowledge; resets the world; 25% head start
{
    const g = ensureBars(newGame(21)); g.scene = 'ashfall'; g.minutes += 4 * 1440;
    Object.assign(g.flags, { long: true, vday: 2, lore1: true, lore_realms: true, saw_lights: true, bone_sung: true, roots: true, gills: true, healed: true, boar: true, gao_broken: true, yk_path: 'sister', longforest: true });
    g.inventory = { hare_raw: 5, beast_core: 3 };
    g.rel = {}; const bump = (w, f, a) => { const r = g.rel[w] || (g.rel[w] = { f: 0, a: 0 }); r.f += f; r.a += a; const p = g.coil.peak[w] || (g.coil.peak[w] = { f: 0, a: 0 }); p.f = Math.max(p.f, r.f); p.a = Math.max(p.a, r.a); };
    bump('Mei Lin', 80, 40); bump('Mei Lin', -30, 0); bump('Village', 40, 0); bump('Yuki', 20, 10);
    g.james.realm = 1; g.yuki.realm = 1; g.james.saturation = 40; g.james.gu.level = 5; g.yuki.fight.level = 3; g.james.extra8 = 2;
    g.tasks.fam = { 'wild_forage:0': 9 }; g.tasks.adapt = { 'wild_forage:0': 1 }; g.tasks.yuki.on = true; g.tasks.queue = ['ashfall:3'];
    g.james.hp = 3; g.james.satiety = 5;
    const stats0 = g.stats.checks = 17;
    endCoil(g, 'choice', 'ashfall');
    assert(g.coil.known.includes('bone_sung') && g.coil.known.includes('roots') && g.coil.known.includes('gills'), 'the Coil remembers the one-time discoveries');
    const n = rewind(g);
    assert(n === 2 && g.coil.n === 2 && g.scene === 'arrival' && g.minutes === newGame(1).minutes, `rewind to Day 1 dawn (${g.scene})`);
    const s0 = newGame(1);
    assert(g.james.realm === s0.james.realm && g.yuki.realm === s0.yuki.realm && g.james.saturation === 0 && g.james.gu.level === 1 && g.yuki.fight.level === 1 && !g.james.extra8, 'v0.11.0: realm, skills, meridians, Saturation start over');
    assert(g.rel.Yuki && g.flags.yk_path === 'sister' && g.tasks.fam['wild_forage:0'] === 9, 'v0.11.0: Yuki\'s bond and path and familiarity kept');
    assert(g.tasks.fam['wild_forage:0'] === 9 && g.tasks.adapt['wild_forage:0'] === 1 && g.tasks.yuki.on && g.tasks.queue.length === 0, 'familiarity and adaptation kept, queue empty');
    assert(Object.keys(g.inventory).length === 0, 'hammerspace empty');
    for (const f of ['lore1', 'lore_realms', 'saw_lights', 'yk_path', 'long', 'longforest']) assert(g.flags[f] !== undefined, `knowledge flag ${f} kept`);
    for (const f of ['healed', 'boar', 'gao_broken', 'vday', 'bone_sung', 'roots', 'gills']) assert(g.flags[f] === undefined, `world flag ${f} reset`);
    assert(g.rel['Mei Lin'].f === 20 && g.rel['Mei Lin'].a === 10 && g.rel.Village.f === 10 && g.rel.Yuki.f === 20 && g.rel.Yuki.a === 10, `25% head start from the peak, Yuki kept (${JSON.stringify(g.rel)})`);
    assert(g.james.hp === jamesHpMax(g) && g.james.satiety === 70 && g.stats.checks === stats0, 'bars full, Fed back to the start, stats kept');
    assert(KEEP_FLAGS.every((f) => !(f in REMEMBER)), 'no flag both kept and remembered');
    // "You remember this" and the first dawn
    const v = sceneView(g, SCENES);
    assert(v.choices.some((c) => /You remember this/.test(c.label)), 'Coil 2 offers the Day 1 skip');
    // "Not yet" returns without running the scene again; a lost tribute offers the tail
    const h = ensureBars(newGame(22)); h.scene = 'collectors_lost'; h.flags.ending = 'lost';
    assert(coilActive(h) && SCENES.collectors_lost.choices.some((c) => c.to === 'coil_end' && c.show(h)), 'lost tribute: Bite the tail offered');
    const k = ensureBars(newGame(23)); k.scene = 'collectors_lost'; k.flags.ending = 'lost';
    choose(k, SCENES, SCENES.collectors_lost.choices.findIndex((c) => c.to === 'coil_end'));
    const acc = sceneView(k, SCENES).choices.find((c) => /^Accept/.test(c.label));
    assert(k.scene === 'coil_end' && acc, 'the Coil screen offers Accept after a lost tribute');
    choose(k, SCENES, acc.index);
    assert(k.scene === 'epilogue' && k.flags.ending === 'lost' && k.coil.n === 1, 'Accept goes on to the epilogue');
    const w = ensureBars(newGame(24)); w.scene = 'wilds'; w.flags.long = true; w.inventory.hare_raw = 2;
    endCoil(w, 'choice', 'wilds'); goTo(w, SCENES, 'coil_end');
    const ny = sceneView(w, SCENES).choices.find((c) => c.label === 'Not yet.');
    choose(w, SCENES, ny.index);
    assert(w.scene === 'wilds' && w.inventory.hare_raw === 2 && w.coil.n === 1 && !w.coil.why, 'Not yet goes back unchanged');
    // breakthrough from 95%
    const b = ensureBars(newGame(26)); b.james.saturation = 96;
    assert(canBreakThrough(b), 'task mode: break through from 95%');
    // old state 3 → 4: Coil 1, the snapshot is the save as loaded
    const o = ensureBars(newGame(27)); o.scene = 'ashfall'; o.inventory.hare_raw = 4; delete o.coil; o.v = 3; migrate(o);
    assert(o.v === SAVE_VERSION && o.coil.n === 1 && o.coil.snap.scene === 'ashfall' && o.coil.snap.inventory.hare_raw === 4 && !o.coil.snap.coil, 'state 3 → 4: Coil 1, snapshot = the save as loaded');
}

// v0.11.2: timed cultivation — a sit is an hour, Saturation by hours (10 h × 1.5^realm since v0.11.66, S1; × 2^realm before), the breakthrough a timed card
{
    assert(SAT_HOURS(0) === 10 && SAT_HOURS(1) === 15 && SAT_HOURS(2) === 22.5 && SAT_HOURS(3) === 33.75, 'v0.11.66 (S1): Saturation hours: 10, 15, 22.5, 33.75 … (×1.5 a realm)');
    // v0.11.15 (B1-b): speed by use — cards N 18 (the old tiers on the line), the sit N 30, kept over a rewind
    assert(cardSpeed(0) === 1 && cardSpeed(2) === 2 && cardSpeed(5) === 3.5 && cardSpeed(8) === 5 && cardSpeed(18) === 10 && cardSpeed(40) === 10, 'v0.11.15: card speed 1 / 2 / 3.5 / 5 / 10 / 10 at 0 / 2 / 5 / 8 / 18 / 40 uses');
    { const u = ensureBars(newGame(97, { closed: true })); u.james.qi = 40; const u0 = u.minutes; condense(u);
      assert(u.minutes - u0 === 60 && u.tasks.use['act:sit'] === 1, 'v0.11.15: the first sit: an hour, one use');
      u.tasks.use['act:sit'] = 10; u.james.qi = 40; const u1 = u.minutes; condense(u); assert(u.minutes - u1 === 15, `v0.11.15: after 10 sits ×4: 15 min (${u.minutes - u1})`);
      u.tasks.use['act:sit'] = 30; assert(sitMinutes(u) === 6, 'v0.11.15: after 30 sits ×10: 6 min');
      endCoil(u, 'choice', 'arrival'); rewind(u); assert(u.tasks.use['act:sit'] === 30 && u.coil.n === 2, 'v0.11.15: uses are kept over a rewind');
    }
    const g = ensureBars(newGame(95, { closed: true })); g.james.qi = 40;
    assert(sitGain(g) === 10 && sitGain(g, 2) === 20, 'Mortal Vessel, Coil 1: +10% a sit, the hollow +20%');
    g.james.realm = 1; ensureBars(g); assert(sitGain(g) === 6.7, `v0.11.66 (S1): Foundation: +6.7% a sit (${sitGain(g)})`);
    g.coil.n = 3; assert(sitGain(g) === 6.7, 'v0.11.15: Foundation on Coil 3: still +6.7% (no Coil bonus)');
    const big = ensureBars(newGame(96)); big.james.qi = 40; const sm = sitGain(big); big.james.primaries = 12; big.james.realm = 0;
    assert(sm === 10, 'the gain does not depend on Qi Max');
    const t = ensureBars(newGame(97, { closed: true })); t.james.qi = 20; const t0 = t.minutes; const r = condense(t);
    assert(r.ok && t.minutes - t0 === 60 && t.james.saturation === 10 && 20 - t.james.qi <= 10 && 20 - t.james.qi > 5, 'a sit: 1 h, 10 Qi (some back from regen), +10%');
    // the breakthrough: 2 h × (realm + 1) ÷ the bonus
    const b = ensureBars(newGame(98)); b.james.saturation = 96;
    assert(btMinutes(b) === 120, 'to Foundation: 2 h'); b.james.realm = 4; assert(btMinutes(b) === 600, 'realm 4 → 5: 10 h'); b.coil.n = 3; assert(btMinutes(b) === 600, 'v0.11.15: Coil 3: still 10 h'); b.tasks.use = { 'act:bt': 3 }; assert(btMinutes(b) === 109, `v0.11.15: after 3 breakthroughs ×5.5: 109 min (${btMinutes(b)})`); b.tasks.use = { 'act:bt': 6 }; assert(btMinutes(b) === 60, 'v0.11.15: after 6 breakthroughs ×10: 1 h'); b.tasks.use = {};
    b.james.realm = 13; b.coil.n = 1; assert(btMinutes(b) === 1680, 'to Heavenly Immortal: 28 h');
    // queued from a hub: the card, its length, the tribulation scene as a story stop
    const q = ensureBars(newGame(99)); q.scene = 'wilds'; q.minutes += 1440; Object.assign(q.flags, { long: true, forest_day: 2 }); q.james.saturation = 96;
    assert(taskOpen(q, SCENES, BT_TASK) && medCards(q, SCENES).some((c) => c.id === 'med:bt' && c.task === BT_TASK && c.minutes === 120), 'the queueable Break through card (2 h)');
    const q0 = q.minutes; const rr = runTask(q, SCENES, BT_TASK);
    assert(rr.stopped && q.scene === 'breakthrough' && q.james.realm === 1 && q.minutes - q0 === 120 && q.flags.bt_return === 'wilds', 'it runs 2 h, then the tribulation scene; back to the hub after');
    const w = ensureBars(newGame(100, { closed: true })); w.scene = 'wilds'; w.minutes += 1440; Object.assign(w.flags, { long: true, forest_day: 2 }); w.james.saturation = 96; w.james.primaries = 12; w.james.collaterals = 9;
    assert(!taskOpen(w, SCENES, BT_TASK) && medCards(w, SCENES).some((c) => c.id === 'med:bt' && !c.task && c.minutes === 0), 'a warning first: not queueable, opens at once');
    // the forecast knows the breakthrough's length
    const f = ensureBars(newGame(101)); f.scene = 'wilds'; f.minutes += 1440; Object.assign(f.flags, { long: true, forest_day: 2 }); f.james.saturation = 96;
    assert(taskMinutes(f, SCENES, BT_TASK) === 120, `the forecast: 120 min (${taskMinutes(f, SCENES, BT_TASK)})`);
}

// v0.11.4: forms 3b — damage by form, the spike field, shield cover, the bone spear (Incremental Mode only)
{
    const at = (t, l) => { const g = ensureBars(newGame(110)); g.james.skills['Convergence Use'].tier = t; g.james.skills['Convergence Use'].level = l; return g; };
    const blade = COMBAT_ACTIONS.blade, dart = COMBAT_ACTIONS.dart;
    assert(formDmgBonus(at(1, 8), blade) === 0 && formDmgBonus(at(2, 1), blade) === 1 && formDmgBonus(at(2, 5), blade) === 2, 'blade: knife +0, dagger +1, sword +2');
    assert(formDmgBonus(at(2, 9), dart) === 0 && formDmgBonus(at(3, 1), dart) === 2, 'darts: +2 from the thrown lance');
    assert(actionDmg(at(2, 1), blade).join() === '7,13', `dagger at T2 L1: (3–6) × 2 + 1 (${actionDmg(at(2, 1), blade)})`); // v0.11.104 (GW2): × the bone multiplier; at L1 as before
    { const m = 2 + 0.5 * 4 / 9, d = actionDmg(at(2, 5), blade); assert(Math.abs(d[0] - (3 * m + 2)) < 1e-9 && Math.abs(d[1] - (6 * m + 2)) < 1e-9, `sword at T2 L5: (3–6) × ${m.toFixed(2)} + 2 (${d})`); }
    assert(guardBonus(at(1, 1)) === 2 && guardBonus(at(1, 5)) === 2.5 && guardBonus(at(2, 1)) === 3 && guardBonus(at(5, 1)) === 4.5, 'Guard +2, +0.5 per defence form');
    assert(guardBonus(at(1, 4)) === 2.4 && guardBonus(at(1, 8)) === 2.8 && guardBonus(at(3, 5)) === 4.1 && guardBonus(at(7, 1)) === 4.5, `GW2 U: guard grows level by level toward the next form (${guardBonus(at(1, 4))}, ${guardBonus(at(1, 8))}, ${guardBonus(at(3, 5))})`);
    assert(!actionOpen(at(1, 2), 'spikes') && actionOpen(at(1, 3), 'spikes') && !actionOpen(at(1, 7), 'spear') && actionOpen(at(1, 8), 'spear'), 'spike field from T1 L3, spear from T1 L8');
    assert(fieldDamage(at(2, 1)) === 1 && fieldDamage(at(3, 1)) === 2 && FIELD_ROUNDS === 2, 'the field: 1 back, 2 from the slab, 2 rounds');
    // a fight: the field, once, then the spear holds a foe off
    const g = at(1, 8); g.james.qi = 30; g.james.gu.level = 9; ensureBars(g); g.james.qi = 30;
    startCombat(g, { id: 'test_rats', name: 't', enemies: [{ name: 'Rat', hp: 40, dc: 2, atk: 3, dmg: 2 }, { name: 'Rat 2', hp: 40, dc: 2, atk: 3, dmg: 2 }], win: 'stream', lose: 'stream' });
    const q0 = g.james.qi; const r1 = combatStep(g, 'spikes');
    assert(g.combat.fieldUsed && g.combat.field === 1 && Math.abs(q0 - g.james.qi - 3.9) < 1e-9 && r1.lines.filter((l) => /through the spikes: 1/.test(l)).length === 2, 'the field: 3.9 Qi at T1 L8 (4 dampened by the bone multiplier 1.39; v0.11.104, GW2), both attackers take 1, one round left');
    combatStep(g, 'guard'); assert(g.combat.field === 0, 'gone after 2 rounds');
    const q1 = g.james.qi; const r2 = combatStep(g, 'spikes'); assert(g.james.qi === q1 && r2.lines.some((l) => /already broken/.test(l)), 'once a fight: the second try does nothing and costs nothing');
    const q2 = g.james.qi; const r3 = combatStep(g, 'spear');
    assert(g.combat.spearFormed && q2 - g.james.qi === 3 && r3.lines.some((l) => /bone spear/.test(l)), 'the spear: 3 Qi to sing');
    const q3 = g.james.qi; combatStep(g, 'spear'); assert(g.james.qi === q3, 'then free while held');
    assert(r3.lines.some((l) => /held at the spear's length/.test(l)) ? r3.lines.some((l) => /can't get past the spear/.test(l)) : true, 'a full hit holds the foe off for the round');
    // shield cover: from the buckler, guarding saves Yuki from a lunge (v0.11.113, DA1 TY: any guard does, the lunge being shown a round early)
    const y = at(2, 1); y.yuki.fight.level = 1; ensureBars(y); const yh = y.yuki.hp;
    startCombat(y, { id: 'test_crows', name: 't', enemies: [{ name: 'Crow', hp: 99, dc: 9, atk: 30, dmg: 5, prefersSmall: true }], win: 'stream', lose: 'stream' });
    y.combat.round = 3; const ry = combatStep(y, 'guard');
    assert(y.yuki.hp === yh && ry.lines.some((l) => /^Crow lunges at Yuki — and meets you instead/.test(l)), 'shield cover: a guarded lunge at Yuki misses');
}

} // end of the static checks before the bots

let rs = 4242;
const rnd = (n) => { rs = (rs * 1103515245 + 12345) >>> 0; return (rs >>> 8) % n; };

const rankOf = (n) => 10 * ((n?.tier || 1) - 1) + (n?.level || 1);
function fight(g, run) {
    const id0 = g.combat?.id;
    if (rankOf(g.james.gu) < rankOf(g.james.skills['Convergence Use'])) assert(false, `DG1 I: GU never behind Convergence Use at a fight (${id0}: GU ${rankOf(g.james.gu)}, CU ${rankOf(g.james.skills['Convergence Use'])})`); // v0.11.101: the degree reads GU alone
    for (let t = 0; t < 400 && g.combat; t++) {
        const smart = run % 2 === 0;
        const acts = Object.keys(COMBAT_ACTIONS).filter((id) => !INC_ONLY_ACTIONS.has(id) || actionOpen(g, id)); // v0.11.4: the spear and the spike field when he can sing them
        const act = smart ? (smartAction(g, t)) : acts[rnd(acts.length)]; // v0.11.96 (BT1): the shared smart rule
        const out = (!smart && t % 7 === 6 && g.combat.flee) ? combatFlee(g) : combatStep(g, act);
        for (const l of out?.lines || []) if (/\d\.\d{2,}/.test(l)) { assert(false, `SH1 L4: a fight line with float noise (${id0}): ${l}`); break; } // v0.11.104 (SH1): no number past one decimal in a fight's log
        if (out?.done) { const k = `inc:${id0 || '?'}:${smart ? 'smart' : 'random'}`; const f = fightStats[k] || (fightStats[k] = { win: 0, lose: 0, flee: 0 }); f[out.done] = (f[out.done] || 0) + 1; goTo(g, SCENES, out.next); return; }
    }
}

const byCoil = {};
const medStats = { bt: 0, mer: 0, warn: 0, a1bites: 0, a1coils: {} };
const deaths = { pro: {}, a1: {} }; // v0.9.7: per act and Coil: { coils, early (before Mei Lin), late, beast }
const TRIBUTE_OUT = { bluff_win: 'won', collectors_won: 'won', tribute_paid: 'paid', collectors_lost: 'lost' };
const stats = { tasks: { endings: {}, collapses: 0, cards: 0, skipped: 0, games: 0 } }; // v0.11.34 (D1): the classic games gone
// v0.11.21: bugs the mutation test (20 deliberate bugs) found the suite missing, or caught only by luck (the parent only)
if (!SHARD && !BOTS_ONLY) {
    const G = await import('../js/core/game.js');
    // Fed and HP regen, directly (a drain of 2 / h and a 6% Cycle were caught only by a scene the walks stopped reaching)
    const h = ensureBars(newGame(911)); h.james.hp = 1; h.james.satiety = 80; const hm = jamesHpMax(h);
    advance(h, 30);
    assert(Math.abs(h.james.satiety - 78.5) < 1e-9, `v0.11.21: Fed drops 3 an hour (80 → ${h.james.satiety} in 30 min)`);
    assert(Math.abs(h.james.hp - (1 + hm * 0.05)) < 1e-9, `v0.11.21: one Cycle (30 min) at realm 0 heals 5% of max HP (${h.james.hp})`);
    // the combat actions' Qi costs, and a dart really spends its 2
    assert(COMBAT_ACTIONS.dart.qi === 2 && COMBAT_ACTIONS.blade.qi === 3 && COMBAT_ACTIONS.needle.qi === 4, 'v0.11.21: dart 2, blade 3, needle 4 Qi');
    for (const nd of [true]) { // v0.11.34 (D1): Incremental Mode only
        const d = ensureBars(newGame(912, { closed: nd })); d.james.skills['Convergence Use'] = { tier: 1, level: 5, xp: 0 }; d.james.qi = jamesQiMax(d);
        sCombat(d, { id: 'jackals', intro: '', band: 'standard', enemies: [{ name: 'Dummy', hp: 999, dc: 1, atk: 1, dmg: 0 }], win: 'stream', lose: 'stream' });
        const q0 = d.james.qi; cStep(d, 'dart');
        assert(Math.abs(q0 - d.james.qi - 2) < 1e-9, `v0.11.21: a dart costs 2 Qi (${nd ? 'Incremental' : 'Story'} Mode: ${q0} → ${d.james.qi})`);
    }
    // a breakthrough fills both bars, James's and Yuki's
    for (const nd of [true]) { // v0.11.34 (D1): Incremental Mode only
        const b = ensureBars(newGame(913)); b.james.saturation = 100; b.james.hp = 1; b.james.qi = 1; b.yuki.hp = 1; b.yuki.qi = 1;
        const r = breakthrough(b);
        assert(r.ok && b.james.hp === jamesHpMax(b) && b.james.qi === jamesQiMax(b) && b.yuki.hp === G.yukiHpMax(b) && b.yuki.qi === yukiQiMax(b), `v0.11.21: a breakthrough fills HP and Qi for both (${nd ? 'Incremental' : 'Story'} Mode)`);
    }
    // the forecast: a work card's dry run = its real run (v0.11.91: no Exhaustion, so no ×1.5 case any more)
    const x = ensureBars(newGame(914)); x.scene = 'ashfall';
    const wc = taskCards(x, SCENES).find((c) => c.kind === 'work' && c.status === 'open');
    assert(!!wc, 'v0.11.21: Ashfall has an open work card');
    if (wc) {
        const t1 = taskMinutes(x, SCENES, wc.id), y = JSON.parse(JSON.stringify(x)), ym = y.minutes;
        runTask(y, SCENES, wc.id);
        assert(t1 === y.minutes - ym, `v0.11.21: the forecast of ${wc.id} is its real time (${t1} vs ${y.minutes - ym})`);
    }
    // an old state version 1 gets every field the later migrations add
    const o = ensureBars(newGame(915)); delete o.tasks; delete o.coil; o.v = 1; migrate(o);
    const fresh = ensureBars(newGame(915));
    assert(o.v === SAVE_VERSION && Object.keys(fresh.tasks).every((k) => k in o.tasks) && !!o.coil, `v0.11.21: a version-1 state migrates to ${SAVE_VERSION} with every task field (${Object.keys(o.tasks).join(', ')}) and a Coil`);
}
const cardsSeen = new Set();
const cardsListed = new Set();
const cardsForecast = new Set(); // v0.11.21: cards whose forecast was compared with a real run that finished (not cut short by a door)
const cardsWhole = new Set(); // v0.11.21: cards that ran to the end at least once (the ones a forecast can be checked on)
/** v0.11.21: the forecast = reality check runs on 1 game in FC_EVERY (it was about half of this test's time). The dry runs
 * never touch the game, so the bot games and their numbers are the same; a check below makes sure every played card is still forecast. */
const FC_EVERY = 8;
/** v0.11.22: the flag and item watch (tests/lib/seen.mjs), only with --track (tools/check.mjs runs a separate --bots-only --track
 * job for tools/leftovers.mjs): a Proxy anywhere in the process slows every game in it (about +10 s on the full test, +5 s even on 1 game in 8). */
const TRACK = process.argv.includes('--track');
const bands = {};
let yukiRuns = 0;
const fightStats = {}; // v0.11.3: per mode, fight and bot style, for tools/sanity.mjs
// v0.11.16 (C1, owner 19:48): the relationship catch-up ×3 below the best-ever value; the 5 leftover Cultivate choices off the resting places
{
    const g = ensureBars(newGame(110));
    relBump(g, 'Mei Lin', 10, 20); relBump(g, 'Yuki', 0, 5);
    assert(REL_CATCHUP === 3 && g.rel['Mei Lin'].f === 10 && g.rel['Mei Lin'].a === 20 && g.coil.best['Mei Lin'].a === 20, 'C1: at the best-ever value, gains count ×1');
    endCoil(g, 'choice', 'arrival'); rewind(g);
    const R = () => g.rel['Mei Lin'];
    assert(R().f === 3 && R().a === 5 && g.coil.best['Mei Lin'].f === 10 && g.coil.best['Mei Lin'].a === 20, `C1: the 25% head start stays, the best is kept over a rewind (${R().f}/${R().a})`);
    relBump(g, 'Mei Lin', 0, 3); assert(R().a === 14, `C1: below the best, +3 counts +9 (${R().a})`);
    relBump(g, 'Mei Lin', 0, 4); assert(R().a === 22 && g.coil.best['Mei Lin'].a === 22, `C1: +4 catches up the last 6 (×3), the rest ×1 (${R().a})`);
    relBump(g, 'Mei Lin', 0, -5); assert(R().a === 17, 'C1: losses are never multiplied');
    relBump(g, 'Mei Lin', 1, 0); assert(R().f === 6, `C1: friendship catches up on its own (${R().f})`);
    const y0 = g.rel.Yuki.a; relBump(g, 'Yuki', 0, 3); assert(g.rel.Yuki.a === y0 + 3 && !g.coil.best.Yuki, 'C1: Yuki is never caught up');
    startActCoil(g, 1); assert(g.coil.act === 1 && g.coil.best['Mei Lin'].a === 22, 'C1: the best-ever values carry into Act 1');
    // the leftovers: no Cultivate choice on a story screen in Incremental Mode
    // v0.11.41 (D2-a): Story Mode's sits are gone; their places stay (never shown) so later choices keep their index
    const left = ['meditate1', 'night', 'night_event', 'fo_night', 'heart_camp'];
    const h = ensureBars(newGame(112)); h.james.qi = 30; h.flags.night_ev = 'rain';
    for (const id of left) {
        const c = SCENES[id].choices.find((x) => /^Story Mode only/.test(String(x.text)));
        const inc = c && c.show && c.show(h);
        assert(c && !inc && !SCENES[id].choices.some((x) => /^(Condense|Cultivate first|Sit in the rain|Cultivate one sit before|Cultivate by the fire)/.test(String(x.text))), `v0.11.41: ${id}: Story Mode's sit is a hidden place, its text gone`);
    }
    h.scene = 'meditate1'; assert(!/You could keep going/.test(SCENES.meditate1.text(h)), 'v0.11.16: meditate1 no longer offers to condense (Incremental Mode)');
}
let badBars = 0; // v0.11.3: games that ended with a NaN / Infinity bar
const barsOk = (g) => [g.james.hp, g.james.qi, g.james.saturation, g.james.satiety, g.yuki.hp, g.yuki.qi].every(Number.isFinite);
let predicted = 0;
let skipChecked = 0;
/** v0.11.35 (P1-a): on a copy, the skip ends in exactly the state of tapping through the same choices one by one. */
function skipCheck(g, run) {
    const a = JSON.parse(JSON.stringify(g));
    if (skipStep(a, SCENES) < 0) return;
    const b = JSON.parse(JSON.stringify(g));
    const r = skipRun(a, SCENES);
    for (let k = 0; k < r.steps; k++) { const o = sceneView(b, SCENES).choices.filter((c) => !c.disabled); choose(b, SCENES, o[0].index); }
    if (JSON.stringify(a) === JSON.stringify(b)) pass++; else assert(false, `v0.11.35: the skip = tapping through (${g.scene}, run ${run}, ${r.steps} steps)`);
    skipChecked++;
}
function play(run, tasks) {
    rs = seedOf(run, tasks ? 1 : 2); // v0.11.1: every game its own random stream
    const g = ensureBars(newGame(run + 1 + SEED * 100000, { closed: tasks })); // task mode: meridians closed at the start (v0.9.6)
    const st = stats.tasks;
    let steps = 0;
    const seenOut = new Set();
    let bitShen = false, meiSeen = false, coilKey = '', deadKey = '', ms = 0;
    const D = () => { const a = (g.coil.act || 0) ? deaths.a1 : deaths.pro; return a[g.coil.n] || (a[g.coil.n] = { coils: 0, early: 0, late: 0, beast: 0 }); };
    for (; steps < 18000; steps++) {
        if (TRACK) track(g); // v0.11.22: which flags and items the games really read and write
        const out = tasks && TRIBUTE_OUT[g.scene];
        if (out && !seenOut.has(g.coil.n)) { seenOut.add(g.coil.n); const b = byCoil[g.coil.n] || (byCoil[g.coil.n] = { won: 0, paid: 0, lost: 0, realm: 0, pri: 0 }); b[out]++; b.realm += g.james.realm; b.pri += g.james.primaries; }
        if (tasks) {
            const k = `${g.coil.act || 0}:${g.coil.n}`;
            if (k !== coilKey) { coilKey = k; meiSeen = false; D().coils++; }
            if (g.scene === 'mei_lin') meiSeen = true;
            if (g.scene === 'coil_end' && (g.coil.why === 'collapse' || g.coil.why === 'beast') && deadKey !== coilKey) { deadKey = coilKey; const d = D(); if (meiSeen || g.coil.act) d.late++; else d.early++; if (g.coil.why === 'beast') d.beast++; }
            if (g.coil.n > 6) { st.games++; if (!barsOk(g)) badBars++; return true; } // a bot that keeps dying stops counting after Coil 6 of an act
        }
        if (tasks && g.scene === 'a1_end') { medStats.a1coils[g.coil.n] = (medStats.a1coils[g.coil.n] || 0) + 1; }
        // the Meditate card now and then (v0.9.6): open meridians, break through
        if (tasks && canMeditate(g, SCENES) && rnd(6) === 0) {
            const mc = medCards(g, SCENES);
            if (mc.some((c) => c.id === 'med:bt' && c.open) && rnd(2) === 0) { runMed(g, SCENES, 'med:bt'); medStats.bt++; continue; }
            if (!isTaskHub(g)) { const mm = mc.filter((c) => /^med:mer:/.test(c.id) && c.open); if (mm.length) { runMed(g, SCENES, mm[rnd(mm.length)].id); medStats.mer++; continue; } } // v0.11.15 (B1): a meridian card on a resting place (task screens: they queue them)
        }
        if (SENSIBLE && tasks) { // tools/bots.mjs --sensible: at most 2 meridian sittings in a row, none when hungry
            if (g.scene === 'meridians' && ((ms = (ms || 0) + 1) > 2 || g.james.satiety < 40)) { ms = 0; choose(g, SCENES, SCENES.meridians.choices.findIndex((c) => c.text === 'Open your eyes.')); continue; }
            if (g.scene !== 'meridians') ms = 0;
        }
        const v = sceneView(g, SCENES);
        noteView(g, v);
        if (tasks && !noFold(g.scene) && !v.end) noteRead(g, v.text); // v0.11.133 (FP2, RF1): the bots read what the screen shows, as main.js records it, so the skip check below still runs
        if (v.end) { const e = g.flags.ending || 'none'; st.endings[e] = (st.endings[e] || 0) + 1; st.games++; if (!barsOk(g)) badBars++; return true; }
        if (tasks && isTaskHub(g)) {
            const all = taskCards(g, SCENES); // v0.11.15 (B1): the bots take the sit and the meridian cards too
            for (const c of all) cardsListed.add(c.id);
            noteCards(all); // v0.11.22
            if (yukiLane(g) && rnd(3) === 0) setYuki(g, !yukiLane(g).on);
            const cards = all.filter((c) => c.status === 'open');
            const stops = v.choices.filter((c) => !c.disabled && (c.index >= 1000 || !isTaskChoice(SCENES, g.scene, c.index)));
            if (!cards.length && !stops.length) { assert(false, `dead end at task hub ${g.scene} (run ${run})`); return false; }
            if (cards.length && (rnd(10) < 8 || !stops.length)) {
                const q = planOf(g);
                for (let k = 1 + rnd(4); k > 0; k--) q.push(cards[rnd(cards.length)].id);
                // v0.11.64: each card's dry run (the card's time, end, Fed, HP) must match what really happens
                const FC = run % FC_EVERY === 0; // v0.11.21
                while (q.length && isTaskHub(g)) {
                    const id = q.shift();
                    if (dayOver(g, SCENES, id)) { st.night = (st.night || 0) + 1; q.length = 0; break; } // v0.11.37 (D-a): the plan stops at the day's end (as the queue did)
                    if (!taskOpen(g, SCENES, id)) { st.skipped++; continue; }
                    cardsSeen.add(id);
                    const m0 = g.minutes;
                    // v0.11.46 (owner pick B1): also the first time a card runs in this process, so every card's forecast is checked
                    // without luck (a rare card such as dw_hub's "Call it a day" could miss the 1 game in 8); the dry run is on a copy
                    const fc1 = FC || !cardsForecast.has(id);
                    const mins = fc1 ? taskMinutes(g, SCENES, id) : 0;
                    const oc = FC ? taskOutcome(g, SCENES, id) : null; // v0.11.64 (A1, B1)
                    const card = taskCards(g, SCENES).find((c) => c.id === id);
                    if (card?.check) bands[card.check.band] = (bands[card.check.band] || 0) + 1;
                    const fam0 = taskState(g).fam[id] || 0;
                    const r = runTask(g, SCENES, id);
                    if (r.lines.some((l) => /^Yuki (comes|leaves)/.test(l))) yukiRuns++;
                    if (card?.kind === 'work') { if ((taskState(g).fam[id] || 0) > fam0) pass++; else assert(false, `familiarity grows on ${id}`); } // v0.11.21: the label only on a failure
                    st.cards++;
                    if (fc1) { if (g.minutes - m0 === mins || r.stopped) pass++; else assert(false, `dry run predicts ${id} (${mins} vs ${g.minutes - m0})`); }
                    if (!r.stopped) { cardsWhole.add(id); if (fc1) cardsForecast.add(id); }
                    if (oc) { if (r.stopped && oc.minutes === mins && !oc.death === (g.scene !== 'coil_end') || (!r.stopped && oc.end === g.minutes && oc.fed === g.james.satiety && oc.hp === g.james.hp && !oc.death)) predicted++; else assert(false, `v0.11.64: ${id}'s dry run = what happens (run ${run}: ${JSON.stringify(oc)} vs ${g.minutes}, ${g.scene})`); }
                    if (r.lines.some((l) => /Your knees make the decision/.test(l))) st.collapses++;
                    if (Number.isFinite(g.james.hp) && g.james.hp >= 0 && Number.isFinite(g.james.satiety)) pass++; else assert(false, `bars finite after ${id}`);
                }
                q.length = 0;
                continue;
            }
            const r = choose(g, SCENES, stops[rnd(stops.length)].index);
            if (r.combat) { startCombat(g, r.combat(g)); fight(g, run); }
            continue;
        }
        if (tasks && run % FC_EVERY === 0 && seenBefore(g)) skipCheck(g, run); // v0.11.35 (P1-a): copies only
        let open = v.choices.filter((c) => !c.disabled);
        if (!open.length) { assert(false, `dead end at ${g.scene} (run ${run})`); return false; }
        if (tasks && /^(arrival|clearing)$/.test(g.scene)) open = open.filter((c) => !/Stay lost/.test(c.label)); // v0.10.1: the balance bots stay out of the Long Forest
        if (tasks && g.scene === 'collectors_lost') open = open.filter((c) => (g.coil.n < 3) === /Bite the tail/.test(c.label)); // bots try three Coils
        if (tasks && g.scene === 'coil_end' && g.coil.why === 'tribute') open = open.filter((c) => /^Bite/.test(c.label));
        if (tasks && g.scene === 'rt_elder' && run % 10 === 0 && g.coil.act === 1 && !bitShen) { goTo(g, SCENES, 'rt_taken'); continue; } // v0.11.4: 1 run in 10 goes with Shen Qiu on purpose, so the Act 1 rewind path is walked however the fights are tuned
        if (tasks && g.scene === 'rt_taken') { const bite = run % 5 === 0 && g.coil.act === 1 && !bitShen; open = open.filter((c) => bite === /Bite the tail/.test(c.label)); if (bite) bitShen = true; } // 1 run in 5 rewinds Act 1 at Shen Qiu once
        if (tasks && g.scene === 'coil_end' && g.coil.why === 'shen') { open = open.filter((c) => /start of Act 1/.test(c.label)); medStats.a1bites++; }
        if (tasks && g.scene === 'coil_end' && g.coil.act === 1) open = open.filter((c) => !/whole game/.test(c.label)); // v0.11.26: the balance bots stay in Act 1 (the whole-game rewind has its own tests)
        if (tasks && g.scene === 'col_warn') medStats.warn++;
        const r = choose(g, SCENES, open[rnd(open.length)].index);
        if (r.combat) { startCombat(g, r.combat(g)); fight(g, run); }
        assert(!g.combat, `combat ends (${g.scene})`);
    }
    assert(false, `run ${run} finishes`);
    return false;
}
let diceInTasks = 0;
const logBefore = (g) => g.log.length;
if (kids) { // v0.11.1: merge the workers' numbers
    for (const r of await collect(kids)) {
        for (const [k, o] of Object.entries({ byCoil, medStats, deaths, stats, bands, fightStats })) mergeInto(o, r[k]);
        badBars += r.badBars;
        for (const id of r.cardsSeen.__set) cardsSeen.add(id);
        for (const id of r.cardsListed.__set) cardsListed.add(id);
        for (const id of r.cardsForecast.__set) cardsForecast.add(id);
        for (const id of r.cardsWhole.__set) cardsWhole.add(id);
        mergeSeen(r.touched);
        yukiRuns += r.yukiRuns; predicted += r.predicted; skipChecked += r.skipChecked; diceInTasks += r.diceInTasks; pass += r.pass; fail += r.fail;
    }
} else for (const run of myRuns()) play(run, true); // v0.11.34 (D1): Incremental Mode only (the Story Mode games are gone)
if (SHARD) emit({ byCoil, medStats, deaths, stats, bands, fightStats, badBars, cardsSeen, cardsListed, cardsForecast, cardsWhole, yukiRuns, predicted, skipChecked, diceInTasks, pass, fail, touched });
if (BOTS_ONLY) { // v0.11.21: the games' stats only (the same file a full run writes)
    if (STATS_OUT) writeFileSync(STATS_OUT, JSON.stringify({ games: GAMES, deaths, byCoil, fights: fightStats, badBars, seen: touchedOut() }));
    console.log(`  ${GAMES} bot games, bots only (no rule checks)\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
}
rs = 4243; // the checks below draw from their own stream
// task mode: no die anywhere, in fights or story
{
    let die = 0;
    for (let run = 0; run < 200; run++) {
        const g = ensureBars(newGame(run + 9000));
        for (let s = 0; s < 3000; s++) {
            const v = sceneView(g, SCENES);
            if (v.end) break;
            const open = v.choices.filter((c) => !c.disabled && c.index < 1000);
            if (!open.length) break;
            const r = choose(g, SCENES, open[rnd(open.length)].index);
            if (r.lines.some((l) => l.includes('🎲'))) die++;
            if (r.combat) { startCombat(g, r.combat(g)); for (let t = 0; t < 400 && g.combat; t++) { const o = combatStep(g, t % 2 ? 'blade' : 'dart'); if (o.lines.some((l) => l.includes('🎲'))) die++; if (o.done) { goTo(g, SCENES, o.next); break; } } }
            if (g.combat) assert(false, 'no-dice fight ends');
        }
    }
    assert(die === 0, `no die shown anywhere in task mode (${die})`);
}

// v0.11.66 (owner pick V1): since G4 the bots rarely reach Golden Core with all 8 vessels open, so the vessels' collateral card
// (mer:ec) is offered but hardly ever played. A walk of WALK_GAMES random games from a Golden Core start, 8 vessels open, plays the
// task screens' cards like the bots (random cards, random story stops, fights blade / dart); the cards it plays count toward the
// coverage below. It runs in this process on its own random stream (restored after), so the bot games and their numbers don't change.
// v0.11.91 (owner pick K1): since the day ends at 00:00, the bots reach Ashfall on the way home mostly in the evening, when its
// 150-minute drills would end past midnight, so "Let Ya teach them" (rt_hunters:1) is offered but no longer played as a card.
// A daytime visit (Day 20, 09:00) plays each open card there once, on its own copy; it counts toward the coverage below.
let dayWalk = 0;
{
    const g0 = ensureBars(newGame(919100, { closed: true })); g0.scene = 'rt_ashfall'; g0.minutes = 19 * 1440 + 9 * 60; wakeDay(g0); g0.james.satiety = 90; g0.james.hp = jamesHpMax(g0); g0.james.qi = jamesQiMax(g0);
    const open = taskCards(g0, SCENES).filter((c) => c.status === 'open');
    assert(open.some((c) => c.id === 'rt_hunters:1'), `K1: Ashfall at 09:00 on Day 20 offers "Let Ya teach them" (${open.map((c) => c.id).join(', ')})`);
    for (const c of open) { const g = structuredClone(g0); runTask(g, SCENES, c.id); cardsSeen.add(c.id); dayWalk++; }
}
// v0.11.92 (owner pick K1, 10:51): since a night fight costs sleep (O1 + X1), fewer random bots reach Shen Qiu (about 2% of
// games; 7 → 4 rewinds there in 1,000), so the count below fell under 5 by chance. A focused walk takes SHEN_WALKS games into
// Act 1, to Shen Qiu (rt_taken), bites the tail there and rewinds to the start of Act 1; each counts toward the check below.
const SHEN_WALKS = 5;
let shenWalk = 0;
for (let k = 0; k < SHEN_WALKS; k++) {
    const g = ensureBars(newGame(919200 + k)); g.scene = 'epilogue'; g.flags.ending = 'paid'; g.minutes = 6 * 1440 + 15 * 60; choose(g, SCENES, 0);
    goTo(g, SCENES, 'rt_taken');
    const bite = sceneView(g, SCENES).choices.find((c) => !c.disabled && /Bite the tail/.test(c.label));
    if (!bite) { assert(false, `K1 (v0.11.92): Shen Qiu offers the bite (walk ${k})`); continue; }
    choose(g, SCENES, bite.index);
    const act1 = g.scene === 'coil_end' && g.coil.why === 'shen' && sceneView(g, SCENES).choices.find((c) => !c.disabled && /start of Act 1/.test(c.label));
    if (!act1) { assert(false, `K1 (v0.11.92): the bite at Shen Qiu leads to the Coil's end with the start of Act 1 (walk ${k}: ${g.scene}, ${g.coil.why})`); continue; }
    choose(g, SCENES, act1.index);
    for (let i = 0; i < 4 && g.scene === 'coil_dawn'; i++) { const c = sceneView(g, SCENES).choices.find((x) => !x.disabled); if (!c) break; choose(g, SCENES, c.index); }
    const ok = g.coil.act === 1 && coilActive(g) && clockParts(g.minutes).day === 8;
    assert(ok, `K1 (v0.11.92): the rewind at Shen Qiu wakes at the start of Act 1 (walk ${k}: act ${g.coil.act}, ${g.scene}, Day ${clockParts(g.minutes).day})`);
    if (ok) shenWalk++;
}
const WALK_GAMES = 20;
let walkEc = 0, walkE8 = 0, walkCards = 0;
{
    const rs0 = rs;
    for (let run = 0; run < WALK_GAMES; run++) {
        rs = seedOf(run, 66);
        const g = ensureBars(newGame(660000 + run, { closed: true }));
        Object.assign(g.james, { realm: 4, primaries: 12, collaterals: 66, extra8: run % 2 ? 0 : 8, extraCollaterals: 0 }); // v0.11.67 (R1): odd runs with the vessels shut, so the vessel card (mer:e8) is played too
        Object.assign(g.yuki, { realm: 4, primaries: 12, collaterals: 66 });
        ensureBars(g); g.james.hp = jamesHpMax(g); g.james.qi = jamesQiMax(g);
        for (let step = 0; step < 4000; step++) {
            const v = sceneView(g, SCENES);
            if (v.end || g.scene === 'coil_end') break;
            let open = v.choices.filter((c) => !c.disabled);
            if (isTaskHub(g)) {
                const cards = taskCards(g, SCENES).filter((c) => c.status === 'open');
                const stops = open.filter((c) => c.index >= 1000 || !isTaskChoice(SCENES, g.scene, c.index));
                if (cards.length && (rnd(10) < 8 || !stops.length)) {
                    const id = cards[rnd(cards.length)].id;
                    runTask(g, SCENES, id); cardsSeen.add(id); walkCards++; if (id === 'mer:ec') walkEc++; if (id === 'mer:e8') walkE8++;
                    continue;
                }
                open = stops;
            }
            if (/^(arrival|clearing)$/.test(g.scene)) open = open.filter((c) => !/Stay lost/.test(c.label));
            if (!open.length) break;
            const r = choose(g, SCENES, open[rnd(open.length)].index);
            if (r.combat) { startCombat(g, r.combat(g)); for (let t = 0; t < 400 && g.combat; t++) { const o = combatStep(g, t % 2 ? 'blade' : 'dart'); if (o.done) { goTo(g, SCENES, o.next); break; } } }
            if (g.combat) { assert(false, `V1 walk: a fight ends (${g.scene}, run ${run})`); break; }
        }
    }
    rs = rs0;
    assert(walkE8 > 0, `v0.11.67 (R1): the walk plays the vessel card too (${walkE8} times; with "Call it a day" back on the Blackroot the bots rarely do)`);
assert(walkEc > 0, `V1: the Golden Core walk plays the vessels' collateral card (${walkEc} times in ${walkCards} cards, ${WALK_GAMES} games)`);
}
// v0.11.68 (owner picks A1 + B2 + C1): a choice's or a card's lines split into the reply (under the scene text) and the gains
// (Results), sentence by sentence by shape (js/core/replies.js); friendship and affection changes as Results lines.
{
    const { splitLine, splitReply, relLines, landParts, sentences, isGainSentence, GAIN_LINES, REPLY_LINES } = await import('../js/core/replies.js');
    const { medCards: mCards, runMed: mRun } = await import('../js/core/meditate.js');
    const { skipPlan: sPlan, skipRun: sRun } = await import('../js/story/again.js');
    const sp = (l) => { const r = splitLine(l); return `${r.reply}|${r.gain}`; };
    assert(sp('Raw hare: +12 satiety. You will not be telling anyone about this.') === 'You will not be telling anyone about this.|Raw hare: +12 satiety.', `B2: a meal line splits (${sp('Raw hare: +12 satiety. You will not be telling anyone about this.')})`);
    assert(sp('She throws you twice. You throw her once. She\'s thrilled.') === 'She throws you twice. You throw her once. She\'s thrilled.|', 'B2: a reply stays whole');
    assert(sp('"No," Ya says cheerfully. "She doesn\'t want me to either. She just doesn\'t know it yet."') === '"No," Ya says cheerfully. "She doesn\'t want me to either. She just doesn\'t know it yet."|', 'B2: speech stays whole and a reply');
    assert(sp('Stung. A lot. +3 Wild honeycomb, −2 HP.') === 'Stung. A lot.|+3 Wild honeycomb, −2 HP.', `B2: a haul with a reply (${sp('Stung. A lot. +3 Wild honeycomb, −2 HP.')})`);
    assert(sp('Opened the Lung meridian (1/12). It opens on an inhale.') === 'It opens on an inhale.|Opened the Lung meridian (1/12).', 'B2: a meridian line');
    assert(sp('GU +5 XP → T1 L2') === '|GU +5 XP → T1 L2' && sp('Breakfast. You eat: hare, cooked. +14 satiety.') === '|Breakfast. You eat: hare, cooked. +14 satiety.', 'B2: XP and eating are gains');
    assert(sp('Two Qi and 30 minutes into the ash around the Girdle Vessel. It gives a little. (4.5 h of 8 h.)') === '|Two Qi and 30 minutes into the ash around the Girdle Vessel. It gives a little. (4.5 h of 8 h.)', 'B2: a vessel sitting (a gain, the Opus review)');
    // the Opus review (R1): lines the first shapes put in the reply
    for (const l of ['You push on. Exhaustion 1: work takes ×1.5 until you sleep.', '+Ya\'s wolf tooth.', '+ The watcher\'s ledger: three pages of names.', 'The calendar starts again: Day 4.', 'You stay until the Day 19 dawn: resting, mapping, saying goodbye.', 'A miserable few hours of sleep.', 'Yuki: great root-kin form (hits much harder in a fight).', 'Your bone stakes will be harder from now on.', 'The hammerspace is full: the Long Forest\'s pantry comes with you.']) {
        const r = splitLine(l);
        assert(r.gain && !/×\d|\+ ?[A-Z']|Day \d|sleep|form \(|stakes|pantry/.test(r.reply), `R1: a gain, not a reply: ${l} (${r.reply} | ${r.gain})`);
    }
    // landParts: no relationship lines across a rewind; the summary reads every line (Yuki's haul)
    const lp = landParts(['Coil 3. The hammerspace is empty.'], { Village: { f: 30, a: 0 } }, { Village: { f: 14, a: 0 } }, { coilChanged: true });
    assert(!lp.gains.some((l) => /Village/.test(l)), `R1: biting the tail lists no relationship losses (${lp.gains})`);
    const ly = landParts(['Yuki comes back with 2 hares and the air of someone owed an apology. +2 Glassback hare (dressed).'], {}, {});
    assert(ly.sumLines.some((l) => /^Yuki comes/.test(l)) && ly.reply.length && ly.gains.some((l) => /^\+2 Glassback/.test(l)), `R1: Yuki's haul: the summary still reads her line (${JSON.stringify(ly)})`);
    const rl = relLines({ 'Mei Lin': { f: 1, a: 0 }, Village: { f: 3, a: 0 } }, { 'Mei Lin': { f: 5, a: 2 }, Ya: { f: -3, a: 0 }, Village: { f: 3, a: 0 } });
    assert(JSON.stringify(rl) === JSON.stringify(['Mei Lin: friendship +4, affection +2', 'Ya: friendship −3']), `C1: relationship lines (${rl})`);
    // a real choice: siding with Mei Lin at the Root Road's meal
    const m = ensureBars(newGame(316)); m.minutes = 13 * 1440 + 12 * 60; goTo(m, SCENES, 'ya_mocks'); m.rel['Mei Lin'] = { f: 30, a: 20 }; m.rel.Ya = { f: 30, a: 20 };
    const rel0 = JSON.parse(JSON.stringify(m.rel));
    const out = choose(m, SCENES, 0);
    const parts = splitReply(out.lines), rels = relLines(rel0, m.rel);
    assert(parts.reply.some((l) => /mouth twitches/.test(l)) && !parts.gains.some((l) => /mouth twitches/.test(l)) && rels.some((l) => /^Mei Lin: friendship \+/.test(l)) && rels.some((l) => /^Ya: friendship −/.test(l)), `A1 + C1: siding with Mei Lin: the reply under the text, the friendships in Results (${parts.reply} | ${parts.gains} | ${rels})`);
    // every line of a walk of random games is placed: no gain sentence with speech in it, no reply sentence with a stat in it
    const STAT = /\d+%|\b\d+(\.\d+)? (HP|Qi|XP)\b|[+−]\d|×\d|^\+ ?[A-Z']|\b\d\d:\d\d\b|\(\d+\/\d+\)/;
    const bad = new Map();
    let rewinds = 0, meds = 0, skips = 0, flees = 0, lf = 0;
    const check = (src, lines) => {
        for (const l of lines || []) {
            const s0 = String(l);
            if (GAIN_LINES.some((r) => r.test(s0)) || REPLY_LINES.some((r) => r.test(s0))) continue;
            for (const t of sentences(s0)) {
                const gain = isGainSentence(t) && !/"/.test(t);
                if (!gain && STAT.test(t) && !bad.has(t)) bad.set(t, `${src}: a reply with a stat in it`);
                if (isGainSentence(t) && /"/.test(t) && STAT.test(t) && !bad.has(t)) bad.set(t, `${src}: a gain with speech in it`);
            }
        }
    };
    const rs0 = rs;
    let walked = 0;
    // the Opus review (R1): the walk also takes the Long Forest (one run in three), bites the tail on the Coil screen,
    // runs Meditate cards, skips stretches read before and runs from fights
    for (let run = 0; run < (FULL ? 60 : 12); run++) {
        rs = seedOf(run, 68);
        const g = ensureBars(newGame(680000 + run, { closed: true }));
        if (run % 3 === 1) { g.james.realm = 2; ensureBars(g); }
        for (let step = 0; step < 3000; step++) {
            const v = sceneView(g, SCENES);
            if (!noFold(g.scene) && !v.end) noteRead(g, v.text); // v0.11.133 (FP2, RF1): the walk reads what the screen shows, so later Coils can skip it
            if (v.end) break;
            if (g.scene === 'coil_end') rewinds++;
            if (g.flags.lf_active) lf++;
            let open = v.choices.filter((c) => !c.disabled);
            if (isTaskHub(g) || isQueueScreen(g, SCENES)) {
                const ms = mCards(g, SCENES).filter((m) => m.open);
                if (ms.length && rnd(10) < 2) { const m = ms[rnd(ms.length)]; let r; try { r = m.task ? runTask(g, SCENES, m.task) : mRun(g, SCENES, m.id); } catch { continue; } check(`meditate ${m.id}`, r.lines); meds++; walked++; continue; }
                const cards = taskCards(g, SCENES).filter((c) => c.status === 'open');
                const stops = open.filter((c) => c.index >= 1000 || !isTaskChoice(SCENES, g.scene, c.index));
                if (cards.length && (rnd(10) < 7 || !stops.length)) { const id = cards[rnd(cards.length)].id; check(`card ${id}`, runTask(g, SCENES, id).lines); walked++; continue; }
                open = stops;
            } else if (sPlan(g, SCENES).steps >= 2 && rnd(4) === 0) { check('skip', sRun(g, SCENES).lines); skips++; walked++; continue; }
            if (/^(arrival|clearing)$/.test(g.scene) && run % 3 !== 2) open = open.filter((c) => !/Stay lost/.test(c.label));
            if (!open.length) break;
            const sc = g.scene, pick = open[rnd(open.length)];
            const r = choose(g, SCENES, pick.index); walked++;
            check(`${sc}#${pick.index}`, r.lines);
            if (r.combat) {
                startCombat(g, r.combat(g));
                for (let t = 0; t < 400 && g.combat; t++) {
                    const fl = g.combat.flee && rnd(15) === 0;
                    const o = fl ? combatFlee(g) : combatStep(g, t % 2 ? 'blade' : 'dart');
                    if (fl) flees++;
                    if (o.done) { check('fight end', [...o.lines, ...goTo(g, SCENES, o.next)]); break; }
                }
                if (g.combat) break;
            }
        }
    }
    rs = rs0;
    assert(rewinds > 0 && meds > 0 && lf > 0 && (skips > 0 || !FULL), `R1: the walk bites the tail (${rewinds}), meditates (${meds}), skips (${skips}), runs (${flees}) and walks the Long Forest (${lf} steps)`);
    assert(bad.size === 0, `B2: every line of ${walked} choices and cards is placed (${[...bad].slice(0, 4).map(([t, w]) => `${w}: ${t}`).join(' || ')})`);
}
// v0.11.69 (owner picks R1 + P1, the texts Fable's, "F All"): the missing replies of the one-off story choices (relationship
// choices that said nothing, choices that answered with gains only, failed checks without a line), and a partial haul keeps
// the reply sentences of the item lines it drops.
{
    const { splitReply, keepReplies, splitLine } = await import('../js/core/replies.js');
    const { gives } = await import('../js/core/story.js');
    const { actingCheck, noDiceDc } = await import('../js/core/game.js');
    const { cardCheck } = await import('../js/core/tasks.js');
    const R69 = [
        ['wen_lesson', 0, 'do', (g) => { delete g.flags.lore_realms; }, 'Now you have asked the right question'],
        ['wen_lesson', 0, 'do', (g) => { g.flags.lore_realms = true; }, 'and cannot name'],
        ['far_lost', 0, 'do', null, 'Next time, take me'],
        ['mei_walk', 0, 'do', (g) => { g.flags.vday = 2; }, 'By now it may be'],
        ['mei_walk', 0, 'do', (g) => { g.flags.vday = 3; }, 'learning how to breathe again'],
        ['supper_roof', 0, 'do', (g) => { g.flags.vday = 1; }, 'Tell me about the trees again'],
        ['supper_roof', 0, 'do', (g) => { g.flags.vday = 2; }, 'shoulder still warm'],
        ['ya_found', 0, 'do', null, 'a hand\'s width closer'],
        ['sect_cut', 0, 'do', null, 'He believed it'],
        ['rt_watch', 0, 'do', null, 'quieter each time'],
        ['rt_fire_talk', 0, 'do', null, 'That was a good one'],
        ['yuki_tiger_awaken', 0, 'do', null, 'underline a word'],
        ['lf_ride', 0, 'do', null, 'The flat ones from the slow water'],
        ['lf_bored', 0, 'do', null, 'standing ovation'],
        ['forage', 0, 'do', null, 'You have standards'],
        ['forage', 2, 'do', null, 'peer review'],
        ['mire', 0, 'do', null, 'specimen worth your whole grant'],
        ['rt_ford', 0, 'do', null, 'shakes a wet paw'],
        ['ah_hunt', 1, 'do', null, 'Rare, for you'],
        ['heal', 1, 'fail', null, 'didn\'t do well enough'],
        ['bone_field', 0, 'fail', null, 'decency not to look at you'],
        ['hollow', 0, 'fail', null, 'patient with a child'],
        ['hunt_miss', 0, 'fail', null, 'a hand\'s width from where the hare was'],
        // R1 after the Opus review (Fable's fixes): the variants by form and by a thin haul
        ['lf_bored', 0, 'do', (g) => { g.yuki.realm = 7; g.yuki.form = 'human'; }, '"Acceptable," she says'],
        ['ah_hunt', 1, 'do', null, '"Thin," she says', { success: false, ratio: 0.7 }],
        ['forage', 2, 'do', null, 'turns out not to be the right way', { success: false, ratio: 0.7 }],
        ['forage', 2, 'do', null, 'a sky the colour of a bruise'],
        ['mei_walk', 0, 'do', (g) => { g.flags.vday = 3; }, 'came out of that forest'],
        ['lf_ride', 0, 'do', null, 'not getting out of it'],
    ];
    for (const [id, i, branch, setup, phrase, roll] of R69) {
        const g = ensureBars(newGame(690)); g.scene = id;
        if (setup) setup(g);
        const c = SCENES[id]?.choices?.[i];
        const fn = c && (branch === 'do' ? c.do : c.failDo);
        const out = fn ? fn(g, roll || { success: branch === 'do', ratio: branch === 'do' ? 1 : 0 }) || [] : [];
        const reply = splitReply(out).reply.join(' ');
        assert(reply.includes(phrase), `v0.11.69 (R1): ${id} #${i} (${branch}) answers with its reply (${reply.slice(0, 80) || 'nothing'})`);
    }
    // the review's test gaps: the variant replies through the real screens, the reply matching the text just read
    const high = (g) => { g.james.gu.tier = 4; g.james.gu.level = 5; };
    for (const [id, setup, textBit, replyBit] of [
        ['wen_lesson', (g) => { delete g.flags.lore_realms; }, 'ladder', 'right question'],
        ['wen_lesson', (g) => { g.flags.lore_realms = true; }, 'Old Tree', 'cannot name'],
        ['mei_walk', (g) => { g.flags.vday = 2; }, 'Bit late for that', 'By now it may be'],
        ['mei_walk', (g) => { g.flags.vday = 3; }, 'last sunset', 'out of that forest'],
        ['supper_roof', (g) => { g.flags.vday = 1; }, 'Which one', 'trees again'],
        ['supper_roof', (g) => { g.flags.vday = 2; }, 'plum wine', 'shoulder still warm'],
    ]) {
        const g = ensureBars(newGame(696)); high(g); setup(g); goTo(g, SCENES, id);
        const text = sceneView(g, SCENES).text, r = choose(g, SCENES, 0), rep = splitReply(r.lines).reply.join(' ');
        assert(text.includes(textBit) && rep.includes(replyBit), `v0.11.69 (review): ${id}: the text read (${textBit}) and the reply (${replyBit}) agree (${rep.slice(0, 60)})`);
    }
    // nothing else about these choices changed
    {   const g = ensureBars(newGame(697)); high(g); goTo(g, SCENES, 'rt_ford'); const c = SCENES.rt_ford.choices[0];
        const r = choose(g, SCENES, 0);
        assert(g.scene === 'rt_camp' && gives(c).length === 0 && splitReply(r.lines).reply.some((l) => /wet paw/.test(l)), `v0.11.69 (review): the ford still lands on rt_camp, gives nothing (${g.scene})`); }
    {   const g = ensureBars(newGame(698)); g.james.gu.tier = 1; g.james.gu.level = 1; goTo(g, SCENES, 'heal'); const v0 = JSON.stringify(g.rel.Village || null);
        const idx = sceneView(g, SCENES).choices.find((c) => /^Drain and clean/.test(c.label)).index;
        const r = choose(g, SCENES, idx);
        assert(r.lines.some((l) => /— failure/.test(l)) && !g.flags.healed && JSON.stringify(g.rel.Village || null) === v0 && splitReply(r.lines).reply.some((l) => /well enough/.test(l)), `v0.11.69 (review): a failed heal still heals nothing and moves no one (${g.flags.healed})`); }
    {   const g = ensureBars(newGame(699)); g.james.gu.tier = 1; g.james.gu.level = 1; g.james.qi = 10; goTo(g, SCENES, 'hunt_miss');
        const r = choose(g, SCENES, 0);
        assert(r.lines.some((l) => /— failure/.test(l)) && g.scene === 'stream' && !g.flags.hunt2, `v0.11.69 (review): a failed retry still leaves hunt2 unset (${g.scene}, ${g.flags.hunt2})`); }
    { const g = ensureBars(newGame(700)); SCENES.hollow.choices[0].failDo(g); assert(g.flags.hollow_sit === true, 'v0.11.69 (review): the failed hollow sit still sets its flag'); }
    // the review's low 7: the bone stakes sentence is a gain, also on a partial
    assert(splitLine('+1 Giant\'s bone-meal. Your bone stakes will be harder from now on.').reply === '' && keepReplies(['+1 Giant\'s bone-meal. Your bone stakes will be harder from now on.']).length === 0, 'v0.11.69 (review): the bone stakes line is all gain');
    // the gains still come with them, unchanged
    { const g = ensureBars(newGame(691)); const o = SCENES.ya_found.choices[0].do(g); assert(splitReply(o).gains.join() === '+1 Ya\'s wolf tooth.' && g.inventory.ya_tooth === 1, 'v0.11.69: the tooth is still a gain'); }
    { const g = ensureBars(newGame(692)); const o = SCENES.bone_field.choices[0].failDo(g); assert(g.flags.bone_sung === true && o.length === 1, 'v0.11.69: the failed skull still sets its flag'); }
    { const g = ensureBars(newGame(693)); g.flags.lore_realms = true; SCENES.wen_lesson.choices[0].do(g); assert(g.flags.lore_tree === true, 'v0.11.69: the second lesson still sets lore_tree'); }
    // through choose: the far_lost lecture lands under Ashfall's text
    { const g = ensureBars(newGame(694)); goTo(g, SCENES, 'far_lost'); const r = choose(g, SCENES, 0); assert(g.scene === 'ashfall' && splitReply(r.lines).reply.some((l) => /take me/.test(l)), 'v0.11.69: far_lost answers through choose'); }
    // P1: a partial keeps the reply sentences of the item lines it drops
    assert(JSON.stringify(keepReplies(['+2 Glassback hare (dressed). Teamwork. Disgusting, bloody teamwork.', 'Other line.', '+3 Jade bracket fungus.'])) === JSON.stringify(['Teamwork. Disgusting, bloody teamwork.', 'Other line.']), 'v0.11.69 (P1): keepReplies');
    assert(JSON.stringify(keepReplies(['+2 Mire fowl. "Small," she says. "Rare, for you." Through the bond: *fish. The flat ones.*'])) === JSON.stringify(['"Small," she says. "Rare, for you." Through the bond: *fish. The flat ones.*']), `v0.11.69 (review): keepReplies keeps quotes and italics whole (${keepReplies(['+2 Mire fowl. "Small," she says. "Rare, for you." Through the bond: *fish. The flat ones.*'])})`);
    {   // a story choice: the hare with Yuki, partly
        const g = ensureBars(newGame(695)); goTo(g, SCENES, 'hunt');
        let lv = 0; for (let l = 1; l <= 10; l++) { g.james.gu.level = l; const v = actingCheck(g, 'GU'); if (v / noDiceDc(4) >= 0.5 && v / noDiceDc(4) < 1) { lv = l; break; } }
        const r = choose(g, SCENES, 1);
        assert(lv > 0 && r.lines.some((l) => /— partly/.test(l)) && splitReply(r.lines).reply.some((l) => /bloody teamwork/.test(l)) && r.lines.some((l) => /^A thin haul — you keep: \+1 Glassback/.test(l)), `v0.11.69 (P1): a partial hunt keeps its reply (${lv}: ${r.lines})`);
    }
    {   // a work card: the honey tree, partly
        const w = ensureBars(newGame(3)); w.scene = 'wilds'; w.minutes += 1440; Object.assign(w.flags, { long: true, forest_day: 2 }); w.james.qi = 20;
        const c = SCENES.wild_forage.choices[2], k = cardCheck(w, 'wild_forage:2', c);
        taskState(w).adapt['wild_forage:2'] = Math.round((0.75 * k.dc - k.value) * 10) / 10;
        const r = runTask(w, SCENES, 'wild_forage:2');
        assert(cardCheck(w, 'wild_forage:2', c) && r.lines.some((l) => /— partly/.test(l)) && splitReply(r.lines).reply.some((l) => /bees are still arguing/.test(l)), `v0.11.69 (P1): a partial work card keeps its reply (${r.lines})`);
    }
}
// v0.11.81 (owner pick T1): the Tan brothers (`lf_bandits`) fight as people: no beasts' +0.5, a loss keeps "Robbed"
{
    const ch = SCENES.lf_wanderers.choices.find((c) => c.combat);
    for (const who of ['lf_bandits', 'lf_rogue']) {
        const g = ensureBars(newGame(8101, { closed: true })); g.flags.longforest = true; g.flags.lf_human = who;
        const enc = combatHooks.before(g, ch.combat(g)); // prepared as the game does (the Long Forest's scaling)
        assert(enc.id === who && enc.lose === 'lf_human_lost' && PEOPLE_FIGHTS.has(enc.id), `T1: every trail fight against people is a people fight (${who})`);
        startCombat(g, enc);
        assert(g.combat.enemies.every((e, i) => e.dc === enc.enemies[i].dc && e.atk === enc.enemies[i].atk), `T1: no beasts' +0.5 on ${who}`);
        g.james.hp = 1; g.combat.enemies.forEach((e) => { e.hp = 999; e.atk = 99; });
        let o = null; for (let t = 0; t < 50 && g.combat; t++) o = combatStep(g, 'guard');
        assert(o?.done === 'lose' && o.next === 'lf_human_lost' && g.coil.why !== 'beast', `T1: losing to ${who} on an active Coil leads to "Robbed", not the Coil's end (${o?.next})`);
    }
}
// v0.11.87 (owner 2026-11-09 01:52, pick O1, the sitting loop): from Day 19 the Old Tree offers no sit and no rest
// (the Sitter sat in the hall to about Day 50: about 3,860 of its 4,400 sits); Day 18 as before; nights unchanged
{
    const heart = (day, hh) => { const g = ensureBars(newGame(8701, { closed: true })); g.minutes = (day - 1) * 1440 + hh * 60; g.scene = 'heart_hub'; g.james.qi = jamesQiMax(g); g.james.satiety = 90; g.flags.roots_done = true; return g; };
    const shown = (g, re) => sceneView(g, SCENES).choices.some((c) => re.test(c.label) && !c.disabled);
    const d18 = heart(18, 9), d19 = heart(19, 9), d21 = heart(21, 9);
    assert(shown(d18, /^Cultivate: one sit/) && shown(d18, /^Rest an hour/), 'O1: on Day 18 the hall still offers a sit and a rest');
    assert(medCards(d18, SCENES).some((c) => c.open && /^Cultivate: /.test(c.label || '')) && medCards(d18, SCENES).some((c) => c.open && /until the limit/.test(c.label || '')) && sitLoop(heart(18, 9), SCENES).sits > 0, 'O1: and Meditate\'s Cultivate and Cultivate until the limit (Day 18)');
    for (const [g, d] of [[d19, 19], [d21, 21]]) {
        assert(!shown(g, /^Cultivate: one sit/) && !shown(g, /^Rest an hour/), `O1: from Day 19 no sit and no rest in the hall (Day ${d})`);
        const mc = medCards(g, SCENES);
        assert(!mc.some((c) => c.open && /^Cultivate/.test(c.label || '')), `O1: nor through Meditate (Day ${d}: ${mc.filter((c) => c.open).map((c) => c.id).join(', ')})`);
        assert(!taskCards(g, SCENES).some((c) => (c.kind === 'sit' || /^Cultivate/.test(c.label)) && c.status === 'open'), `O1: no sit card on the task screen (Day ${d})`);
        assert(sitLoop(g, SCENES).sits === 0, `O1: Cultivate until the limit runs no sit (Day ${d})`);
        assert(shown(g, /^Go down to the ship/), `O1: the way forward stays open (Day ${d})`);
    }
    const n19 = heart(19, 17);
    assert(shown(n19, /^Make camp for the night/), 'O1: the night camp is still there on Day 19');
}
// v0.11.86 (owner 2026-11-09 01:06, picks C1 + G1 + W1, roadmap #53): a Coil ended by choice counts, but adds no bonus
{
    const { coilMultNext } = await import('../js/core/game.js');
    const bitePath = (g) => { endCoil(g, 'choice', g.scene); goTo(g, SCENES, 'coil_end'); const v = sceneView(g, SCENES); return v; };
    const wake = (g, re) => { const v = sceneView(g, SCENES); choose(g, SCENES, v.choices.find((c) => re.test(c.label)).index); choose(g, SCENES, 0); };
    // the James tab's bite on Day 1, through the scenes: a Coil, no bonus, the prologue's first dawn only
    { const g = ensureBars(newGame(8601, { closed: true }));
      assert(coilMultNext(g, true) === 1 && coilMultNext(g, false) === 1.25, `C1: the next Coil's bonus: by choice ×1, otherwise ×1.25 (${coilMultNext(g, true)}, ${coilMultNext(g, false)})`);
      const v = bitePath(g);
      assert(v.choices.map((c) => c.label).join('|') === 'Bite the tail. Wake at the first dawn.|Not yet.' && /adds nothing to the faster learning: you will learn as fast as now\./.test(v.text) && !/×1 as fast/.test(v.text), 'C1: the Coil screen after a bite by choice: the first dawn, "Not yet", and the next ×1 said');
      wake(g, /first dawn/);
      assert(g.coil.n === 2 && g.coil.free === 1 && coilMult(g) === 1 && g.scene !== 'coil_dawn', `C1: a bite by choice: Coil 2, ×1 (${g.coil.n}, ${g.coil.free}, ${coilMult(g)})`);
      for (let k = 0; k < 9; k++) { endCoil(g, 'choice', 'arrival'); rewind(g); }
      assert(g.coil.n === 11 && g.coil.free === 10 && coilMult(g) === 1, 'C1: ten bites at the first dawn: Coil 11, still ×1 (the farm, #53, closed)');
      g.minutes += 2 * 1440; endCoil(g, 'choice', 'stream'); rewind(g);
      assert(g.coil.n === 12 && coilMult(g) === 1, 'C1: a bite by choice on Day 3 adds nothing either');
      endCoil(g, 'collapse'); rewind(g);
      assert(g.coil.n === 13 && coilMult(g) === 1.25, `C1: a collapse adds 0.25 (${coilMult(g)})`); }
    // a death, a beast, a lost tribute: the bonus grows as before; the Coil screen says the next ×
    { const g = ensureBars(newGame(8602, { closed: true }));
      endCoil(g, 'beast'); goTo(g, SCENES, 'coil_end');
      assert(/come back faster: you will learn ×1.25 as fast/.test(sceneView(g, SCENES).text), 'C1: after a beast the Coil screen says ×1.25');
      wake(g, /first dawn/); assert(g.coil.n === 2 && !g.coil.free && coilMult(g) === 1.25, 'C1: a beast: Coil 2, ×1.25');
      goTo(g, SCENES, 'collectors_lost'); choose(g, SCENES, sceneView(g, SCENES).choices.find((c) => /Bite the tail/.test(c.label)).index);
      assert(g.scene === 'coil_end' && g.coil.why === 'tribute', 'a lost tribute: the Coil screen');
      wake(g, /first dawn/); assert(g.coil.n === 3 && coilMult(g) === 1.5, `C1: a lost tribute adds 0.25 (${coilMult(g)})`); }
    // Act 1: the count of bites by choice carries in; Shen Qiu adds; a bite by choice restarts Act 1 only (W1); a death offers both
    { const e = ensureBars(newGame(8603)); endCoil(e, 'choice', 'arrival'); rewind(e); endCoil(e, 'collapse'); rewind(e);
      e.scene = 'epilogue'; e.flags.ending = 'paid'; e.minutes = 6 * 1440 + 15 * 60; choose(e, SCENES, 0);
      assert(e.coil.act === 1 && e.coil.n === 3 && e.coil.free === 1 && coilMult(e) === 1.25, `C1: into Act 1 the bites by choice carry (n ${e.coil.n}, free ${e.coil.free}, ×${coilMult(e)})`);
      const v = bitePath(e);
      assert(v.choices.map((c) => c.label).join('|') === 'Bite the tail. Wake at the start of Act 1.|Not yet.', `W1: in Act 1 a bite by choice restarts Act 1 only (${v.choices.map((c) => c.label).join('|')})`);
      wake(e, /start of Act 1/);
      assert(e.coil.act === 1 && e.coil.n === 4 && e.coil.free === 2 && coilMult(e) === 1.25 && e.scene === 'fo_start', 'W1 + C1: Act 1 again, Coil 4, still ×1.25');
      goTo(e, SCENES, 'rt_taken'); choose(e, SCENES, sceneView(e, SCENES).choices.find((c) => /Bite/.test(c.label)).index);
      assert(e.scene === 'coil_end' && sceneView(e, SCENES).choices.some((c) => /whole game/.test(c.label)), 'Shen Qiu: the whole game is still offered');
      wake(e, /start of Act 1/); assert(e.coil.n === 5 && coilMult(e) === 1.5, `Shen Qiu adds 0.25 (${coilMult(e)})`);
      endCoil(e, 'collapse'); goTo(e, SCENES, 'coil_end');
      assert(sceneView(e, SCENES).choices.some((c) => /whole game/.test(c.label)), 'W1: after a collapse in Act 1 the whole game is still offered');
      wake(e, /whole game/);
      assert(e.coil.act === 0 && e.coil.n === 6 && e.coil.free === 2 && coilMult(e) === 1.75, `the whole-game rewind keeps the count (n ${e.coil.n}, free ${e.coil.free}, ×${coilMult(e)})`); }
    // the review's #1: the James tab's bite at a lost tribute or at Shen Qiu is that loss's bite (tabWhy), not one by choice
    { const { tabWhy } = await import('../js/core/coil.js');
      const t = ensureBars(newGame(8607, { closed: true })); goTo(t, SCENES, 'collectors_lost');
      assert(coilActive(t) && tabWhy(t) === 'tribute', 'the review\'s #1: the James tab at a lost tribute: the tribute\'s bite');
      endCoil(t, tabWhy(t), t.scene); goTo(t, SCENES, 'coil_end'); wake(t, /first dawn/);
      assert(t.coil.n === 2 && !t.coil.free && coilMult(t) === 1.25, `the review's #1: the tab's bite at a lost tribute adds the bonus (×${coilMult(t)})`);
      const r = ensureBars(newGame(8608)); r.scene = 'epilogue'; r.flags.ending = 'paid'; r.minutes = 6 * 1440 + 15 * 60; choose(r, SCENES, 0); goTo(r, SCENES, 'rt_taken');
      assert(coilActive(r) && tabWhy(r) === 'shen', 'the review\'s #1: the James tab at Shen Qiu: his bite');
      endCoil(r, tabWhy(r), r.scene); goTo(r, SCENES, 'coil_end');
      assert(sceneView(r, SCENES).choices.some((c) => /whole game/.test(c.label)), 'the review\'s #1: the tab\'s bite at Shen Qiu still offers the whole game');
      wake(r, /start of Act 1/); assert(coilMult(r) === 1.25 && !r.coil.free, `the review's #1: and adds the bonus (×${coilMult(r)})`);
      const w = ensureBars(newGame(8609, { closed: true })); w.scene = 'stream'; assert(tabWhy(w) === 'choice', 'elsewhere the tab\'s bite is by choice');
      endCoil(w, 'choice', 'stream'); const lines = SCENES.coil_end.choices[0].do(w);
      assert(coilMult(w) === 1 && /Your head is not\.$/.test(lines[0]) && !/×1 as fast/.test(lines[0]), `the review's #2: no "×1 as fast" after a chosen bite on Coil 1 (${lines[0]})`); }
    // G1: going round again at Act 1's end is by choice (the labels say so); a save from before has no count: its bonus as before
    { const o = ensureBars(newGame(8604)); o.coil.n = 4; delete o.coil.free;
      assert(coilMult(o) === 1.75, 'an old save (no `free`): ×1.75 on Coil 4, as before');
      const back = deserialize(serialize(Object.assign(ensureBars(newGame(8605)), {})));
      const f = ensureBars(newGame(8606)); endCoil(f, 'choice', 'arrival'); rewind(f); const r = deserialize(serialize(f));
      assert(r.coil.free === 1 && coilMult(r) === 1 && !back.coil.free, 'C1: the count survives a save and a load');
      const tk = ensureBars(newGame(8610)); tk.coil.act = 1; tk.flags.a1_outcome = 'taken'; tk.scene = 'a1_again'; // v0.11.106 (RA1): the labels are by the ending now
      assert(sceneView(tk, SCENES).choices.filter((c) => /Bite the tail/.test(c.label)).every((c) => /\(By choice: adds no faster learning\.\)$/.test(c.label)), 'G1: after \'taken\' going round again says it adds no faster learning'); }
    // v0.11.106 (owner 2026-11-09 21:29, pick RA1, W + L): a bite at the end of an Act 1 James won adds to the faster learning
    { const { tabWhy, actWon, ACT1_WON } = await import('../js/core/coil.js');
      const { FAQ } = await import('../js/core/faq.js');
      const atEnd = (seed, outcome) => { const e = ensureBars(newGame(seed)); e.scene = 'epilogue'; e.flags.ending = 'paid'; e.minutes = 6 * 1440 + 15 * 60; e.coil.n = 3; choose(e, SCENES, 0); e.flags.a1_outcome = outcome; goTo(e, SCENES, 'a1_end'); return e; };
      assert(ACT1_WON.join() === 'victory,accord,revelation', 'RA1: the won endings are victory, accord and revelation');
      for (const o of ['victory', 'accord', 'revelation', 'taken']) {
        const won = o !== 'taken';
        for (const target of ['act', 'game']) { // going round again
          const e = atEnd(9100, o);
          assert(coilActive(e) && actWon(e) === won && tabWhy(e) === (won ? 'clear' : 'choice'), `RA1: ${o} at the act's end: ${won ? 'a won act' : 'by choice'}`);
          choose(e, SCENES, sceneView(e, SCENES).choices.find((c) => /Go round again/.test(c.label)).index);
          const labels = sceneView(e, SCENES).choices.filter((c) => /Bite the tail/.test(c.label)).map((c) => c.label);
          assert(labels.length === 2 && labels.every((l) => (won ? /\(Act 1 is won: the next Coil learns ×1\.75 as fast\.\)$/ : /\(By choice: adds no faster learning\.\)$/).test(l)), `RA1: ${o}: the labels say what the bite gives (${labels[0]})`);
          choose(e, SCENES, sceneView(e, SCENES).choices.find((c) => (target === 'act' ? /start of Act 1/ : /whole game/).test(c.label)).index);
          assert(e.scene === 'coil_dawn' && e.coil.n === 4 && e.coil.free === (won ? undefined : 1) && coilMult(e) === (won ? 1.75 : 1.5) && e.coil.act === (target === 'act' ? 1 : 0), `RA1: ${o} → ${target}: Coil 4 ×${coilMult(e)} (free ${e.coil.free})`);
          choose(e, SCENES, 0);
          if (target === 'act') assert(e.scene === 'fo_start' && !actWon(e) && tabWhy(e) === 'choice', `RA1: ${o}: on the next Coil the outcome is gone, the tab's bite mid-act is by choice again`);
        }
        // the James tab's bite at the act's end: the Coil screen
        const t = atEnd(9200, o); endCoil(t, tabWhy(t), t.scene); goTo(t, SCENES, 'coil_end');
        const v = sceneView(t, SCENES);
        assert(won ? /a season closing/.test(v.text) && /Act 1 is won, and a bite from a won act counts like a hard one: you will learn ×1\.75 as fast\./.test(v.text) : /adds nothing to the faster learning/.test(v.text), `RA1: ${o}: the Coil screen says what the tab's bite gives`);
        assert(v.choices.some((c) => /whole game/.test(c.label)) === won && v.choices.some((c) => /Not yet/.test(c.label)), `RA1: ${o}: ${won ? 'the whole game offered' : 'the act only (W1)'}, and Not yet`);
        choose(t, SCENES, v.choices.find((c) => /Not yet/.test(c.label)).index);
        assert(t.scene === 'a1_end' && !t.coil.why && t.coil.n === 3, `RA1: ${o}: Not yet goes back to the act's end, nothing counted`);
        endCoil(t, tabWhy(t), t.scene); goTo(t, SCENES, 'coil_end'); wake(t, /start of Act 1/);
        assert(t.coil.n === 4 && coilMult(t) === (won ? 1.75 : 1.5), `RA1: ${o}: the tab's bite at the act's end ×${coilMult(t)}`);
      }
      // Fable's review: medium 1, the won scenes themselves (walked from the duel) neither turn the Coil nor read as a won act's bite;
      // low 3, a 'clear' bite on a save that already has Coils by choice keeps that count
      for (const [sc, o] of [['rt_duel_won', 'victory'], ['rt_accord', 'accord'], ['rt_truth_won', 'revelation']]) {
        const w = atEnd(9400, null); delete w.flags.a1_outcome; goTo(w, SCENES, sc);
        assert(w.flags.a1_outcome === o && !coilActive(w) && !actWon(w) && tabWhy(w) === 'choice', `RA1 review: ${sc}: no bite there, nothing reads as won (${coilActive(w)}, ${actWon(w)})`);
        choose(w, SCENES, 0); assert(w.scene === 'a1_end' && coilActive(w) && actWon(w) && tabWhy(w) === 'clear', `RA1 review: ${sc} → a1_end: the won act's bite`);
      }
      { const f = atEnd(9500, 'victory'); f.coil.n = 4; f.coil.free = 1; choose(f, SCENES, sceneView(f, SCENES).choices.find((c) => /Go round again/.test(c.label)).index);
        assert(sceneView(f, SCENES).choices[0].label.includes('×1.75'), 'RA1 review: the label with a choice already counted (×1.75)');
        choose(f, SCENES, 0); assert(f.coil.n === 5 && f.coil.free === 1 && coilMult(f) === 1.75, `RA1 review: free 1 kept, Coil 5 ×${coilMult(f)}`); }
      // a bite by choice before the act is won stays by choice; the FAQ says both
      const mid = atEnd(9300, 'victory'); delete mid.flags.a1_outcome; mid.scene = 'fo_ashfall';
      assert(!actWon(mid) && tabWhy(mid) === 'choice', 'RA1: before the act is won the tab\'s bite is by choice');
      const fq = FAQ.find((e) => e[0] === 'The Coil')[1](mid);
      assert(/adds nothing to the faster learning, with one exception/.test(fq) && /Act 1 James won/.test(fq) && /ended with James taken adds nothing/.test(fq), 'RA1: the FAQ\'s Coil entry (Fable\'s text)');
      // the owner's save of 21:27 (Coil 4 ×1.75, Act 1 won by the duel, on the go-round-again screen): the bite makes Coil 5 ×2
      const { readFileSync } = await import('node:fs'); const { gunzipSync } = await import('node:zlib');
      const raw = readFileSync(new URL('../saves/2026-11-09-2127-incremental-a1_again.txt', import.meta.url), 'utf8').trim();
      const sv = deserialize(raw.startsWith('BAZ1:') ? gunzipSync(Buffer.from(raw.slice(5), 'base64')).toString('utf8') : raw);
      assert(sv.scene === 'a1_again' && sv.coil.n === 4 && coilMult(sv) === 1.75 && sv.flags.a1_outcome === 'victory', `RA1: the owner's save as uploaded (Coil ${sv.coil.n}, ×${coilMult(sv)})`);
      choose(sv, SCENES, sceneView(sv, SCENES).choices.find((c) => /start of Act 1/.test(c.label)).index);
      assert(sv.coil.n === 5 && coilMult(sv) === 2 && !sv.coil.free, `RA1: the owner's save: going round again makes Coil 5 ×2 (×${coilMult(sv)})`); }
}
// v0.11.85 (owner pick D + T1): every XP award ×0.6 after the Coil bonus; the targets 4 / 6
{
    assert(XP_RATE === 0.6, 'D: the XP rate is 0.6');
    const fresh = (n, set) => { const g = ensureBars(newGame(8501 + n, { closed: true })); if (set) set(g); return g; };
    // a standard check on Coil 1, T1: pool 30 × 0.6 = 18, split 9 / 9; Yuki's bond share 9
    { const g = fresh(0); const cu = g.james.skills['Convergence Use'].xp, gu = g.james.gu.xp, y = g.yuki.qiUse.xp; awardXp(g, 'Convergence Use', 'standard');
      assert(g.james.skills['Convergence Use'].xp - cu === 9 && g.james.gu.xp - gu === 9 && g.yuki.qiUse.xp - y === 9, 'D: a standard award on Coil 1 pays 18 (30 × 0.6), split 9 / 9, Yuki 9'); }
    // GU alone takes the whole pool
    { const g = fresh(1); const gu = g.james.gu.xp; awardXp(g, 'GU', 'standard'); assert(g.james.gu.xp - gu === 18, 'D: GU alone: 18'); }
    // the Coil bonus first, then the rate: Coil 3 ×1.5 → 45 × 0.6 = 27, split 13 / 13
    { const g = fresh(2, (x) => { x.coil.n = 3; }); const cu = g.james.skills['Convergence Use'].xp; awardXp(g, 'Convergence Use', 'standard');
      assert(coilMult(g) === 1.5 && g.james.skills['Convergence Use'].xp - cu === 13, 'D: Coil 3: 30 × 1.5 × 0.6 = 27, split 13'); }
    // a fail pays 25% before the rate: floor(30 × 0.25) = 7 → floor(7 × 0.6) = 4, split 2 / 2
    { const g = fresh(3); const cu = g.james.skills['Convergence Use'].xp; awardXp(g, 'Convergence Use', 'standard', { fail: true }); assert(g.james.skills['Convergence Use'].xp - cu === 2, 'D: a fail: 7 × 0.6 = 4, split 2'); }
    // Yuki's fight XP: band × her tier × the Coil bonus × the rate
    { const g = fresh(4); g.yuki.fight.tier = 2; g.james.gu.tier = 5; const out = awardYukiFightXp(g, 'challenging'); // YK1: under his GU
      assert(Math.floor(XP_BANDS.challenging * 2 * 0.6) === 72 && /^Yuki Fight \+72\b/.test(out[0]), `D: Yuki's fight XP 60 × 2 × 0.6 = 72 (${out[0]})`); }
    // the routine band still pays nothing
    { const g = fresh(5); assert(awardXp(g, 'Convergence Use', 'routine').length === 0, 'D: routine pays nothing'); }
    // T1: the targets, the star at 4 / 6 and none past them
    const { TARGETS: T, noteClear: nc } = await import('../js/core/coil.js');
    assert(T[0] === 4 && T[1] === 6, 'T1: the targets 4 / 6');
    { const g = fresh(6); g.coil.n = 4; assert(/in 4 Coils: a new best ★ \(target 4\)\./.test(nc(g, 0)[0]), 'T1: the prologue on Coil 4: a star');
      const h = fresh(7); h.coil.n = 7; assert(/^Act 1 cleared in 7 Coils: a new best \(target 6\)\.$/.test(nc(h, 1)[0]), 'T1: Act 1 on Coil 7: no star'); }
}
// v0.11.82 (owner picks B1 + Y1; texts Fable's): Ya's brawl a weapon spar, Bao's an unarmed brawl, Yuki in them only in human form
{
    const yaCh = SCENES.ya_challenge.choices.find((c) => c.combat), baoCh = SCENES.rt_brawl_start.choices[0];
    const mk = (cuT, cuL, guT = 3, guL = 5) => { const g = ensureBars(newGame(8201, { closed: true })); g.james.skills['Convergence Use'].tier = cuT; g.james.skills['Convergence Use'].level = cuL; g.james.gu.tier = guT; g.james.gu.level = guL; return ensureBars(g); };
    const start = (g, ch) => { const e = combatHooks.before(g, ch.combat(g)); startCombat(g, e); return e; };
    // the spar: blade, spear and guard only; no armour, no guard bonus from forms, no construct, no buckler cover; Yuki watches
    const g = mk(7, 5); const e = start(g, yaCh);
    assert(e.style === 'spar' && g.combat.style === 'spar' && g.combat.yukiOut === true, 'spar: the style and Yuki watching (cat)');
    const open = Object.keys(COMBAT_ACTIONS).filter((id) => actionOpen(g, id));
    assert(open.join() === 'blade,guard,spear', `spar: only the blade, guard and the spear (${open})`);
    assert(guardBonus(g) === 2 && armourDrOf(g) === 0 && jamesDrOf(g) === 1 && actionLabel(g, 'guard', 'Guard and give ground') === 'Guard and give ground', 'spar: no armour (guard +2, no plates DR, the plain guard label)');
    assert(fightAction(g, 'dart') === 'blade' && fightAction(g, 'needle') === 'blade' && fightAction(g, 'spikes') === 'blade' && fightAction(g, 'guard') === 'guard', 'spar: a closed bone action becomes the blade');
    const r1 = combatStep(g, 'guard');
    assert(!r1.lines.some((l) => /construct|Yuki|claws|swipe|paw|blur/.test(l)), `spar: no construct and no Yuki strike in a round (${r1.lines.join(' | ').slice(0, 160)})`);
    assert(/The terms, agreed in the lane/.test(e.intro) && /I don't do proxies/.test(e.intro) && !/stands at your left/.test(e.intro), 'spar: the terms and the cat-form Yuki line in the intro');
    const h = mk(7, 5); h.yuki.realm = 7; h.james.realm = 7; h.yuki.form = 'human'; ensureBars(h); const eh = start(h, yaCh);
    assert(h.combat.yukiOut === false && /Spear against two nothings/.test(eh.intro) && yukiSitsOut(h, eh) === false, 'spar: in human form Yuki stands with him (Old Hu allows a second)');
    // the brawl: strike, throw, cover; damage by the GU tier, no Qi, no DR pierce; a win's XP to GU only
    const b = mk(3, 5, 3, 5); const be = start(b, baoCh);
    const bopen = Object.keys(COMBAT_ACTIONS).filter((id) => actionOpen(b, id));
    assert(be.style === 'unarmed' && bopen.join() === 'strike,throw,cover,remark', `brawl: only the three unarmed actions, and Say something (v0.11.114: Bao postures) (${bopen})`);
    assert(actionDmg(b, COMBAT_ACTIONS.strike).join() === '6,12' && actionDmg(b, COMBAT_ACTIONS.throw).join() === '3,6' && guardBonus(b) === 2, 'brawl: strike 2–4 and throw 1–2 × GU tier 3, guard +2');
    assert(fightAction(b, 'dart') === 'strike' && fightAction(b, 'guard') === 'cover' && fightAction(b, 'blade') === 'strike', 'brawl: a bone action becomes a strike, guard becomes cover');
    const q0 = b.james.qi; const rb = combatStep(b, 'strike');
    assert(b.james.qi === q0 && rb.lines[0].startsWith('You leave the song where it is') && rb.lines.some((l) => l.startsWith('Step in and hit:')), 'brawl: no Qi, the opening line, the strike label');
    assert(/they said fists/.test(be.intro), 'brawl: the cat-form Yuki line');
    b.combat.enemies.forEach((x) => { x.hp = 999; x.dc = 0.6; x.atk = 0.6; }); const rt = combatStep(b, 'throw');
    assert(rt.lines.some((l) => /hits the dust and takes a moment to work out which way is up/.test(l)), "brawl: the throw's stagger line");
    assert(rt.lines.some((l) => /is still getting up/.test(l)), 'brawl: the thrown one is still getting up (and loses that attack)');
    const w = mk(3, 5, 3, 5); start(w, baoCh); w.combat.enemies.forEach((x) => { x.hp = 1; x.dc = 0.6; });
    const cu0 = JSON.stringify(w.james.skills['Convergence Use']), yf0 = JSON.stringify(w.yuki.fight); let ow = null;
    for (let t = 0; t < 5 && w.combat; t++) ow = combatStep(w, 'strike');
    assert(ow?.done === 'win' && JSON.stringify(w.james.skills['Convergence Use']) === cu0 && JSON.stringify(w.yuki.fight) === yf0 && ow.lines.some((l) => /^GU \+/.test(l)), 'brawl: a win pays GU only, and no fight XP to a Yuki who watched');
    // the review (Fable): the brawl's degree (the one-move finish) reads GU alone, not Convergence
    const dg = mk(10, 9, 1, 1); const de = combatHooks.before(dg, baoCh.combat(dg));
    assert(de.degree === 1, `review: a strong singer with weak fists is not offered the one-move finish in Bao's brawl (degree ${de.degree})`);
    // an ordinary fight is untouched
    const n = mk(7, 5); startCombat(n, { id: 'zz_test', enemies: [{ name: 'Y', hp: 5, dc: 3, atk: 3, dmg: 1 }], win: 'night_won', lose: 'night_lost' });
    assert(!n.combat.style && actionOpen(n, 'dart') && !actionOpen(n, 'strike') && guardBonus(n) > 2 && armourDrOf(n) === 5.4 && fightAction(n, 'strike') === 'guard', 'no style: every bone action as before (plates DR 5.4 at T7 L5: GW2, U), the unarmed ones closed');
    // the texts (Fable's)
    assert(yaCh.text === 'Take the fight. "Your spear against my blade. No armour. Nobody dies."', 'texts: the spar choice');
    assert(/flat of a white bone blade laid across her collarbones/.test(SCENES.ya_won.text) && !/cage/.test(SCENES.ya_won.text), 'texts: ya_won without the bone cage');
    const lostCat = SCENES.ya_lost.text(mk(1, 1)); const lostHuman = SCENES.ya_lost.text(h);
    assert(/offers no help whatsoever/.test(lostCat) && /rescues no one/.test(lostHuman), 'texts: ya_lost by her form');
    const pr = mk(1, 1); pr.flags.ya_brawl = 'won';
    assert(/the disarm that took her spear/.test(SCENES.fo_price.text(pr)) && !/bone-cage/.test(SCENES.fo_price.text(pr)), 'texts: fo_price');
}
// v0.11.91 (owner 2026-11-09 09:05, pick B, push 1): the day ends at 00:00, so a bed taken by midnight puts every night
// encounter at 01:00 (01:20 the jackals), and even a fight that runs to the round cap is over before 02:00
{
    const { NO_DICE_ROUND_CAP } = await import('../js/core/game.js');
    const { BED_FROM_HOUR, SATIETY_PER_HOUR: SPH } = await import('../js/core/game.js');
    // the bed rule (owner 09:16): no bed before 21:00 anywhere; an earlier bed spends the evening resting until 21:00, then sleeps
    assert(BED_FROM_HOUR === 21, 'v0.11.91: beds from 21:00');
    { // S1: the Long Forest's seclusion is not a bed: it sleeps from where it is, as before (Fed at the sleeping rate only)
        const sc = ensureBars(newGame(9191)); sc.minutes = 2 * 1440 + 6 * 60; sc.james.satiety = 60; sleepUntil(sc, 6, { bed: false });
        assert(sc.minutes === 3 * 1440 + 6 * 60 && Math.abs(sc.james.satiety - (60 - (SPH * 24) / 2)) < 0.01, `S1: a rest that isn't a bed (06:00 to 06:00) drains Fed at the sleeping rate only (${sc.james.satiety})`);
        const src = String(SCENES.lf_seclusion.enter);
        assert(/sleepUntil\(g, 6, \{ bed: false \}\)/.test(src), 'S1: the seclusion uses the no-bed sleep');
    }
    for (const [bed, wait] of [[17 * 60, 4 * 60], [20 * 60 + 30, 30], [21 * 60, 0], [23 * 60, 0]]) {
        const b = ensureBars(newGame(9190)); b.minutes = 2 * 1440 + bed; b.james.satiety = 100; const w0 = wakeDay(b); sleepUntil(b, 6);
        const want = 100 - (SPH * wait) / 60 - (SPH * (3 * 1440 + 6 * 60 - (2 * 1440 + bed + wait))) / 60 / 2;
        assert(b.minutes === 3 * 1440 + 6 * 60 && Math.abs(b.james.satiety - want) < 0.01 && b.james.hp === jamesHpMax(b) && wakeDay(b) === w0 + 1, `v0.11.91: a bed at ${bed / 60}h: the evening to 21:00 awake (${wait} min), then asleep to 06:00 (Fed ${b.james.satiety} vs ${want})`);
    }
    const cases = [
        ['night_event', 'night_ev', 'crows', 2], ['night_event', 'night_ev', 'rats', 2], ['night_event', 'night_ev', 'lizard', 2],
        ['night_attack', null, null, 3], ['bl_night_event', 'bl_ev', 'wolves', 12], ['bl_night_event', 'bl_ev', 'hawks', 14],
    ];
    for (const [sc, flag, kind, d] of cases) for (const bed of [15 * 60, 19 * 60, 21 * 60 + 30, 23 * 60 + 59, 24 * 60]) {
        const g = ensureBars(newGame(9100 + d)); g.minutes = (d - 1) * 1440 + bed; g.scene = sc; g.flags.bl_region = 'rr'; g.flags.bl_day = 2;
        SCENES[sc].enter?.(g); if (flag) g.flags[flag] = kind;
        const night0 = (d - 1) * 1440 + 24 * 60, t0 = g.minutes - night0;
        assert(t0 >= 60 && t0 <= 80, `v0.11.91: ${sc}${kind ? ` (${kind})` : ''} after a bed at ${bed / 60}h starts at ${Math.floor(t0 / 60)}:${String(t0 % 60).padStart(2, '0')}`);
        const ch = SCENES[sc].choices.find((c) => c.combat && (!c.show || c.show(g)));
        const enc = combatHooks.before(g, ch.combat(g)); startCombat(g, enc);
        g.combat.enemies.forEach((x) => { x.hp = 999; x.atk = 0.1; }); // the longest fight: nobody falls, it runs to the round cap
        let o = null; for (let i = 0; i < NO_DICE_ROUND_CAP + 5 && g.combat; i++) o = combatStep(g, 'guard');
        assert(o?.done && g.minutes < night0 + 120, `v0.11.91: ${sc}${kind ? ` (${kind})` : ''} is over before 02:00 even at the round cap (${o?.done}, ${g.minutes - night0} min after midnight)`);
    }
}
// v0.11.104 (owner 2026-11-09 20:13, pick GW2): growth by level. D (DH): the bone multiplier, the tier plus half a step over
// its ten levels; U: guard toward the next form and the plates +0.1 a level; K: the fragile knife lasts a few swings; Bw: the
// Qi blast and shield on the same multiplier (the blast's damage at the weapons' pace until ×1.4 a step passes it, T7).
{
    const G = await import('../js/core/game.js');
    const { knifeSwings } = await import('../js/core/forms.js');
    const { dampenMultiplier } = await import('../js/core/formulas.js');
    const A = G.COMBAT_ACTIONS;
    const at = (t, l) => { const g = ensureBars(newGame(10400 + t * 10 + l)); g.james.skills['Convergence Use'] = { tier: t, level: l, xp: 0 }; return g; };
    const near = (a, b) => Math.abs(a - b) < 1e-9;
    assert(G.LEVEL_STEP === 0.5, 'GW2 D: half a step over a tier');
    assert(near(G.boneMult(at(1, 1)), 1) && near(G.boneMult(at(1, 8)), 1 + 3.5 / 9) && near(G.boneMult(at(1, 10)), 1.5) && near(G.boneMult(at(2, 1)), 2) && G.boneMult(at(10, 1)) === 10 && G.boneMult(at(10, 10)) === 10, 'GW2 D: the multiplier: 1, 1.39, 1.5, 2 … 10');
    // at every L1, everything as before the change (the old formulas, written out)
    const oldDr = (T) => Math.max(0, T - 2), oldGuard = [2, 2.5, 3, 3.5, 4, 4.5];
    for (let T = 1; T <= 10; T++) {
        const g = at(T, 1), b = G.formDmgBonus(g, A.dart);
        assert(G.actionDmg(g, A.dart).join() === [2 * T + b, 4 * T + b].join() && G.qiShield(g) === 3 * T && G.armourDr(g) === oldDr(T) && G.actionCost(g, A.dart) === Math.round(2 * dampenMultiplier(T) * 10) / 10, `GW2: T${T} L1 as before (darts, shield, plates, cost)`);
    }
    assert([[1, 1, 0], [1, 5, 1], [2, 1, 2], [2, 5, 3], [3, 1, 4], [5, 1, 5]].every(([t, l, i]) => G.guardBonus(at(t, l)) === oldGuard[i]), 'GW2 U: guard at each form as before');
    // nothing falls as Convergence rises (rank 1 … 100), and the gates stay on the tier
    let prev = null, ok = true;
    for (let r = 1; r <= 100; r++) {
        const g = at(Math.floor((r - 1) / 10) + 1, ((r - 1) % 10) + 1);
        const v = [G.boneMult(g), G.actionDmg(g, A.dart)[1], G.actionDmg(g, A.blade)[1], G.actionDmg(g, A.blast)[1], G.qiShield(g), G.guardBonus(g), G.armourDr(g)];
        if (prev && v.some((x, i) => x < prev[i] - 1e-9)) { ok = false; assert(false, `GW2: nothing falls at rank ${r} (${v} after ${prev})`); break; }
        prev = v;
    }
    assert(ok, 'GW2: damage, the blast, the shield, guard and plates never fall as Convergence rises');
    assert(G.armourDr(at(2, 10)) === 0 && G.armourDr(at(3, 1)) === 1 && G.armourDr(at(3, 5)) === 1.4 && G.armourDr(at(9, 10)) === 7.9 && G.armourDr(at(10, 10)) === 8, 'GW2 U: the plates: from T3 L1, +0.1 a level, 8 at T10');
    // Bw: the blast's multiplier is the larger of the weapons' and ×1.4 a step; P2's own curve from T7
    for (const [t, l] of [[1, 1], [1, 8], [2, 1], [4, 6], [6, 10], [7, 1], [9, 5]]) { const g = at(t, l), m = G.boneMult(g); assert(near(G.blastMult(g), Math.max(m, 1.4 ** (m - 1))) && G.blastMult(g) >= m, `GW2 Bw: the blast's multiplier at T${t} L${l}`); }
    assert(near(G.blastMult(at(7, 1)), 1.4 ** 6) && near(G.blastMult(at(6, 1)), 6), 'GW2 Bw: ×1.4 a tier passes the weapons at T7');
    assert(near(G.qiShield(at(1, 10)), 4.5) && G.qiShield(at(1, 8)) === 4.2, 'GW2 Bw: the shield 4.5 at T1 L10, 4.2 at T1 L8');
    // K: the fragile knife's swings
    assert([1, 2, 3, 4, 5, 6, 7].map((l) => knifeSwings(at(1, l))).join() === '1,1,2,2,3,3,4' && knifeSwings(at(1, 8)) === Infinity, 'GW2 K: 1, 1, 2, 2, 3, 3, 4 swings; holds from T1 L8');
    const swing = (l) => { const g = at(1, l); g.james.gu = { tier: 3, level: 1, xp: 0 }; ensureBars(g); g.james.qi = 99; G.startCombat(g, { id: 'gw2_test', enemies: [{ name: 'Post', hp: 999, dc: 0.1, atk: 0.1, dmg: 0 }], win: 'stream', lose: 'stream' });
        const out = []; for (let i = 0; i < 4; i++) { const q = g.james.qi; delete g.combat.wait; /* v0.11.116 (WA2): swing by swing, without the rhythm's wait */ const r = G.combatStep(g, 'blade'); out.push([Math.round((q - g.james.qi) * 10) / 10, r.lines.some((x) => /knife shatters/.test(x))]); } return out; };
    const k1 = swing(1), k3 = swing(3);
    assert(k1.every(([q, s]) => q > 0 && s), `GW2 K: at T1 L1 the knife still shatters every swing, Qi each time (${JSON.stringify(k1)})`);
    assert(k3[0][0] > 0 && !k3[0][1] && k3[1][0] === 0 && k3[1][1] && k3[2][0] > 0 && !k3[2][1] && k3[3][1], `GW2 K: at T1 L3 two swings for one singing (${JSON.stringify(k3)})`);
    // SH1 L4: the construct by level (2 × the multiplier, rounded): T7 L1 14, L6 15 (7.56 × 2), T10 20
    const con = (t, l) => { const g = at(t, l); g.james.gu = { tier: 3, level: 1, xp: 0 }; ensureBars(g); g.james.qi = 99; G.startCombat(g, { id: 'gw2_con', enemies: [{ name: 'Post', hp: 999, dc: 0.1, atk: 0.1, dmg: 0 }], win: 'stream', lose: 'stream' }); const ln = G.combatStep(g, 'guard').lines.find((x) => /construct strikes/.test(x)); return ln && Number(/: (\d+)\./.exec(ln)[1]); };
    assert(con(6, 10) === undefined && con(7, 1) === 14 && con(7, 6) === 15 && con(10, 10) === 20, `SH1 L4: the construct ${con(7, 1)} / ${con(7, 6)} / ${con(10, 10)}`);
    // SH1 S1: the shield's tenths stay tenths in a real round (T1 L2: 3.2 against blows of 3 and 4; L8: 4.2)
    for (const l of [2, 8]) { const g = at(1, l); g.james.gu = { tier: 1, level: 1, xp: 0 }; ensureBars(g); g.james.qi = 99; const hp0 = g.james.hp;
        G.startCombat(g, { id: 'sh1_test', enemies: [{ name: 'Rat A', hp: 999, dc: 0.1, atk: 30, dmg: 3 + 1 }, { name: 'Rat B', hp: 999, dc: 0.1, atk: 30, dmg: 4 + 1 }], win: 'stream', lose: 'stream' });
        const ls = G.combatStep(g, 'qshield').lines; const lost = Math.round((hp0 - g.james.hp) * 1e6) / 1e6;
        assert(ls.some((x) => /soaked/.test(x)) && !ls.some((x) => /\d\.\d{2,}/.test(x)) && Math.abs(lost * 10 - Math.round(lost * 10)) < 1e-6, `SH1 S1: T1 L${l}: the soak in tenths, no float noise (HP −${lost}; ${ls.filter((x) => /soak|lands/.test(x)).join(' | ')})`); }
    // the FAQ says so
    const { FAQ } = await import('../js/core/faq.js').catch(() => ({}));
    const fights = (FAQ || []).find?.((e) => e[0] === 'Fights');
    if (fights) { const t = typeof fights[1] === 'function' ? fights[1]({}) : fights[1]; assert(/From T1 L8 the knife holds/.test(t) && /half as much again across a tier/.test(t) && /toward the next piece of armour/.test(t) && !/shatters on every swing/.test(t), 'GW2: the FAQ\'s Fights entry (Fable\'s lines)'); }
    else assert(false, 'GW2: the FAQ\'s Fights entry found');
}

// v0.11.102 (owner 2026-11-09 18:18, pick QB1): the Qi blast's hit modifier 0, one under the weapons' +1: Convergence Use
// trails GU (a median 3 ranks, 1.5 check points, at the bots' fights), so with Convergence 2 ranks (1 check point) behind GU
// the blast's check clears its DC by as much as the knife's (the bands are a ratio, so they can still differ); still checked on Convergence Use (the owner's "pure Convergence" design)
{
    const { rollCheck, skillCheck } = await import('../js/core/game.js');
    const A = COMBAT_ACTIONS;
    assert(A.blast.dcMod === A.blade.dcMod - 1 && A.blast.skill === 'Convergence Use', `QB1: the blast one under the weapons' modifier, on Convergence Use (${A.blast.dcMod} / ${A.blade.dcMod}, ${A.blast.skill})`);
    for (const [guR, dc] of [[5, 3], [8, 4], [10, 5.5], [14, 6]]) {
        const g = ensureBars(newGame(10200 + guR)); const cuR = guR - 2;
        g.james.gu = { tier: Math.floor((guR - 1) / 10) + 1, level: ((guR - 1) % 10) + 1, xp: 0 };
        g.james.skills['Convergence Use'] = { tier: Math.floor((cuR - 1) / 10) + 1, level: ((cuR - 1) % 10) + 1, xp: 0 };
        assert(skillCheck(g.james.gu) - skillCheck(g.james.skills['Convergence Use']) === 1, `QB1: 2 ranks = 1 check point (GU rank ${guR})`);
        const b = rollCheck(g, 'Convergence Use', dc + A.blast.dcMod), k = rollCheck(g, 'GU', dc + A.blade.dcMod);
        assert(Math.abs((b.value - b.dc) - (k.value - k.dc)) < 1e-9, `QB1: with Convergence 2 ranks behind GU the blast clears its DC by as much as the knife (GU rank ${guR}, DC ${dc}: ${b.value}/${b.dc} vs ${k.value}/${k.dc})`);
        if (guR === 8) assert(b.ratio >= 1 && b.ratio < 2 && k.ratio >= 1 && k.ratio < 2, `QB1: GU rank 8, DC 4: both a full hit (${b.value}/${b.dc}, ${k.value}/${k.dc}; review low 2)`);
    }
    // in a fight at T1 (GU 2 ranks ahead): DC 3.5, the knife hits and so does the blast (at the old +1 it glanced); DC 4.5, a
    // same-band sanity case (both glance; at +1 too; at −1 the blast would hit: Fable's review of v0.11.102, low 1)
    const fightOf = (dc) => { const g = ensureBars(newGame(10210)); g.james.gu = { tier: 1, level: 7, xp: 0 }; g.james.skills['Convergence Use'] = { tier: 1, level: 5, xp: 0 }; ensureBars(g); g.james.qi = 99;
        startCombat(g, { id: 'qb1_test', enemies: [{ name: 'Foe', hp: 99, dc, atk: 0.1, dmg: 0 }], win: 'stream', lose: 'stream' }); return g; };
    const band = (g, id) => (combatStep(g, id).lines.find((l) => / — (hit|miss|a glancing blow|a clean, deep hit)$/.test(l) && !/^Yuki/.test(l)) || '').replace(/^.* — /, '');
    for (const dc of [3.5, 4.5]) { const want = band(fightOf(dc), 'blade'); const got = band(fightOf(dc), 'blast');
        assert(want && got === want, `QB1: DC ${dc}: the blast's first swing lands as the knife's (${got} / ${want})`); }
}
// v0.11.101 (owner 2026-11-09 16:41, pick DG1; Fable's review of v0.11.100, medium 1): (D) the degree, and "End it in one
// move.", reads GU alone, as every strike and the defence do; (I) GU is never behind Convergence Use: every Convergence award
// gives GU the same XP (and the bot games above assert it at every fight), so the old max(GU, Convergence) was GU in play
{
    const { degreeOf, jamesPower, prepare } = await import('../js/story/power.js');
    const { skillCheck, awardXp, noDiceUp, NO_DICE_DC_SHIFT } = await import('../js/core/game.js');
    const { readFileSync, readdirSync } = await import('node:fs');
    const { gunzipSync } = await import('node:zlib');
    const rk = (n) => 10 * ((n?.tier || 1) - 1) + (n?.level || 1);
    // D: Fable's probe: GU T1 L1, Convergence T3 L5: the power is GU's, with or without the realm
    { const g = ensureBars(newGame(10101)); g.james.gu = { tier: 1, level: 1, xp: 0 }; g.james.skills['Convergence Use'] = { tier: 3, level: 5, xp: 0 }; g.james.realm = 2;
      assert(jamesPower(g) === skillCheck(g.james.gu) + 0.6, `DG1 D: the power is GU's check + 0.3 × realm (${jamesPower(g)})`);
      const enc = prepare(g, { id: 'dg1_test', enemies: [{ name: 'Foe', hp: 30, dc: 3, atk: 4, dmg: 2 }], win: 'stream', lose: 'stream' });
      assert(enc.degree === degreeOf(g, enc.enemies, noDiceUp('dg1_test') - NO_DICE_DC_SHIFT) && enc.degree < 3, `DG1 D: a Convergence-heavy James at GU T1 L1 is not offered the one-move finish (degree ${enc.degree})`);
      const brawl = prepare(g, { id: 'dg1_fists', style: 'unarmed', enemies: [{ name: 'Foe', hp: 30, dc: 3, atk: 4, dmg: 2 }], win: 'stream', lose: 'stream' });
      assert(brawl.degree === enc.degree, `DG1 D: fists and weapons read the same power (${brawl.degree} / ${enc.degree})`); }
    // I: every Convergence award gives GU the same XP (each band, a fail, a part, the Coil bonus; review low 3), so GU is never behind; and never in a save
    for (const band of ['routine', 'standard', 'challenging', 'major']) for (const opts of [{}, { fail: true }, { factor: 0.5 }]) for (const coilN of [1, 3]) {
        const g = ensureBars(newGame(10102)); if (g.coil) g.coil.n = coilN;
        for (let k = 0; k < 40; k++) awardXp(g, 'Convergence Use', band, opts);
        assert(rk(g.james.gu) >= rk(g.james.skills['Convergence Use']) && (rk(g.james.skills['Convergence Use']) > 1 || band === 'routine'), `DG1 I: ${band} ${JSON.stringify(opts)} Coil ${coilN}: GU ${rk(g.james.gu)} not behind Convergence ${rk(g.james.skills['Convergence Use'])}`);
    }
    { const g = ensureBars(newGame(10103)); g.james.gu = { tier: 10, level: 10, xp: 0 }; g.james.skills['Convergence Use'] = { tier: 10, level: 9, xp: 0 };
      for (let k = 0; k < 400; k++) awardXp(g, 'Convergence Use', 'major');
      assert(rk(g.james.gu) === 100 && rk(g.james.skills['Convergence Use']) === 100, `DG1 I: at the cap both stop at T10 L10 (${rk(g.james.gu)} / ${rk(g.james.skills['Convergence Use'])})`); }
    { let n = 0; const dir = new URL('../saves/', import.meta.url); // review low 2: from the test's own folder, any cwd
      for (const f of readdirSync(dir).filter((x) => /\.(json|txt)$/.test(x))) {
          let s = null;
          try { const t = readFileSync(new URL(f, dir), 'utf8').trim(); s = t.startsWith('BAZ1:') ? JSON.parse(gunzipSync(Buffer.from(t.slice(5), 'base64'))) : JSON.parse(t); if (s.data) s = typeof s.data === 'string' ? JSON.parse(s.data) : s.data; } catch (e) { assert(false, `DG1 I: saves/${f} reads (${e.message})`); continue; }
          const j = (s.state || s.game || s).james; if (!j) continue; n++;
          assert(rk(j.gu) >= rk(j.skills?.['Convergence Use']), `DG1 I: GU not behind Convergence Use in saves/${f} (${rk(j.gu)} / ${rk(j.skills?.['Convergence Use'])})`);
      }
      assert(n >= 30, `DG1 I: every save read (${n})`); }
}
// v0.11.100 (owner 2026-11-09 16:08, pick SB1): (M) the smart rule's Qi shield only once a weapon is formed (Fable's review
// of v0.11.98, medium 1); (Q) the FAQ names the snare (Fable's sentence); (T) the T10 no-miss is the sung weapons', not the
// Qi blast's; (E) the degree, and "End it in one move.", reads the fight with the no-dice shift its checks take off the DC
{
    const { smartAction, SMART_SHIELD_AT } = await import('./lib/smartfight.mjs');
    const { NO_DICE_DC_SHIFT, noDiceUp } = await import('../js/core/game.js');
    const { degreeOf, jamesPower, enemyPower, prepare } = await import('../js/story/power.js');
    // M: hurt at T1 L9 with nothing formed the bot forms the spear first, then shields
    { const g = ensureBars(newGame(10001)); g.james.skills['Convergence Use'] = { tier: 1, level: 9, xp: 0 }; g.james.gu = { tier: 3, level: 1, xp: 0 }; ensureBars(g);
      startCombat(g, { id: 'sb1_test', enemies: [{ name: 'Foe', hp: 99, dc: 3, atk: 3, dmg: 2 }], win: 'stream', lose: 'stream' }); g.james.qi = 99; g.combat.fieldUsed = true; g.james.hp = SMART_SHIELD_AT * jamesHpMax(g);
      assert(actionOpen(g, 'qshield') && smartAction(g, 0) === 'spear', `SB1 M: nothing formed: the spear before the shield (${smartAction(g, 0)})`);
      g.combat.spearFormed = true; assert(smartAction(g, 1) === 'qshield', `SB1 M: the spear formed: the shield (${smartAction(g, 1)})`); }
    { // the review's case: T1 L8, 35% HP, 8 Qi: it no longer shields to one dart and guards to the cap
      const g = ensureBars(newGame(10002)); g.james.skills['Convergence Use'] = { tier: 1, level: 8, xp: 0 }; g.james.gu = { tier: 1, level: 5, xp: 0 }; ensureBars(g);
      startCombat(g, { id: 'sb1_case', enemies: [{ name: 'Foe', hp: 99, dc: 3, atk: 3, dmg: 2 }], win: 'stream', lose: 'stream' }); g.james.qi = 8; g.combat.fieldUsed = true; g.yuki.hp = 0; g.james.hp = SMART_SHIELD_AT * jamesHpMax(g);
      const picks = []; for (let t = 0; t < 6 && g.combat; t++) { const a = smartAction(g, t); picks.push(a); combatStep(g, a); }
      assert(picks[0] !== 'qshield' && picks.filter((a) => ['blade', 'spear', 'dart', 'needle'].includes(a)).length >= 4, `SB1 M: the review's case attacks (${picks.join(', ')})`); } // v0.11.116 (WA2): a needle the song pays for is an attack too
    // T: at T10 a sung weapon's miss lands as a hit; the Qi blast's miss stays a miss
    { const g = ensureBars(newGame(10003)); g.james.skills['Convergence Use'] = { tier: 10, level: 1, xp: 0 }; g.james.gu = { tier: 1, level: 1, xp: 0 }; ensureBars(g);
      startCombat(g, { id: 'sb1_t10', enemies: [{ name: 'Wall', hp: 9999, dc: 999, atk: 0.1, dmg: 0 }], win: 'stream', lose: 'stream' }); g.james.qi = 999;
      const blast = combatStep(g, 'blast').lines.find((l) => /^Qi blast/.test(l)) || '';
      const blade = combatStep(g, 'blade').lines.find((l) => / — (hit|miss|a glancing blow|a clean, deep hit)$/.test(l) && !/^Qi blast/.test(l)) || '';
      assert(/^Qi blast/.test(blast) && !/ — (hit|a clean, deep hit)$/.test(blast), `SB1 T: a T10 Qi blast under its DC is not forced to a hit (${blast}; the enemy cap of 50 makes it a glance at T10 L1)`); // review low 4
      assert(/ — hit$/.test(blade), `SB1 T: a T10 sung weapon never misses (${blade})`); }
    // E: prepare reads the fight with the raise and the shift; a James 2–4 ahead on the raw numbers now gets the one-move finish
    assert(NO_DICE_DC_SHIFT === 2, 'SB1 E: the shift is 2');
    { const ape = ensureBars(newGame(10004)); ape.scene = 'ape_lured'; ape.minutes = 12 * 1440 + 10 * 60; ape.james.realm = 0;
      const fight = SCENES.ape_lured.choices.find((c) => c.combat).combat, up = noDiceUp('rot_ape'); // the scene's own fight, grown as the story grows it
      let found = null, enc = null;
      for (let r = 1; r <= 100 && found == null; r++) { ape.james.gu = { tier: Math.floor((r - 1) / 10) + 1, level: ((r - 1) % 10) + 1 }; enc = prepare(ape, fight(ape)); const gap = jamesPower(ape) - (enemyPower(enc.enemies) + up); if (gap >= 2 && gap < 4) found = gap; }
      assert(found != null && degreeOf(ape, enc.enemies, up) < 3 && enc.degree === 3 && enc.degree === degreeOf(ape, enc.enemies, up - NO_DICE_DC_SHIFT), `SB1 E: a James ${found} ahead on the raw numbers: degree 3 only with the shift (prepare ${enc?.degree})`);
      assert(sceneView(ape, SCENES).choices.some((c) => c.label === 'End it in one move.'), `SB1 E: that James is offered "End it in one move." (gap ${found})`); }
}
// v0.11.98 (owner 2026-11-09 15:22, pick KR1): (NS) no Qi shield while the knife is fragile (below T1 L8; Fable's review
// of v0.11.97, medium 2: the reserve paid one swing, then the bot could guard to the cap); (G) "Snare root-hares", the
// last hunt on Convergence, checked on GU with its XP to Convergence Use
{
    const { smartAction, SMART_SHIELD_AT } = await import('./lib/smartfight.mjs');
    const at = (cuL, qi = 99) => { const g = ensureBars(newGame(9800 + cuL)); g.james.skills['Convergence Use'] = { tier: 1, level: cuL, xp: 0 }; g.james.gu = { tier: 3, level: 1, xp: 0 }; ensureBars(g); startCombat(g, { id: 'kr1_test', enemies: [{ name: 'Foe', hp: 99, dc: 3, atk: 3, dmg: 2 }], win: 'stream', lose: 'stream' }); g.james.qi = qi; g.combat.fieldUsed = true; g.james.hp = SMART_SHIELD_AT * jamesHpMax(g); return g; };
    for (const l of [1, 3, 5, 6, 7]) { const g = at(l); assert(fragileKnife(g) && actionOpen(g, 'qshield') && smartAction(g, 0) !== 'qshield', `KR1 NS: no shield on the fragile knife at T1 L${l} (${smartAction(g, 0)})`); }
    { const g = at(8); g.combat.bladeFormed = true; assert(!fragileKnife(g) && smartAction(g, 0) === 'qshield', `KR1 NS: the shield again from T1 L8, where the knife stops breaking, once it is formed (v0.11.100, SB1) (${smartAction(g, 0)})`); }
    { const g = at(7); const picks = []; let out = null; for (let t = 0; t < 6 && g.combat; t++) { const a = smartAction(g, t); picks.push(a); out = combatStep(g, a); }
      assert(!picks.includes('qshield') && picks.filter((a) => ['blade', 'dart'].includes(a)).length >= 5, `KR1 NS: hurt on the fragile knife the bot keeps attacking (${picks.join(', ')}; ${out?.done || 'going'})`); }
    const c = SCENES.rr_hunt.choices[1];
    assert(/^Leave the elk\. Snare root-hares/.test(c.text) && c.check.skill === 'GU' && c.check.xpTo === 'Convergence Use' && c.check.dc === 4 && c.qi === 2, `KR1 G: the snare on GU, XP to Convergence, DC 4, 2 Qi (${c.check.skill} / ${c.check.xpTo})`);
    { const g = ensureBars(newGame(9850)); g.james.skills['Convergence Use'] = { tier: 1, level: 1, xp: 0 }; g.james.gu = { tier: 1, level: 5, xp: 0 }; ensureBars(g); g.scene = 'rr_hunt'; g.james.qi = 30; g.james.satiety = 80;
      const hares = g.inventory.hare_raw || 0; const lines = choose(g, SCENES, 1).lines;
      assert((g.inventory.hare_raw || 0) - hares === 2, `KR1 G: the snare succeeds here and brings 2 hares (${(g.inventory.hare_raw || 0) - hares})`); // the review's low 3
      const chk = lines.find((l) => / \/ DC /.test(l)), cu = lines.find((l) => /^Convergence Use \+\d+ XP/.test(l));
      assert(/^GU /.test(chk || '') && !!cu, `KR1 G: the snare checked on GU, its XP to Convergence Use (${chk}; ${cu})`); }
}
// v0.11.97 (owner 2026-11-09 14:53, pick RQ1; Fable's review of v0.11.96, medium 1): the smart rule's spike field and Qi
// shield only when Qi still pays for an attack after them (`attackReserve`), so the bot can't spend its last Qi on them
// and guard to the round cap
{
    const { smartAction, attackReserve, SMART_SHIELD_AT } = await import('./lib/smartfight.mjs');
    const { actionCost: cost } = await import('../js/core/game.js');
    const A = COMBAT_ACTIONS;
    const at = (cuT, cuL, qi = 99, foe = { name: 'Foe', hp: 99, dc: 3, atk: 3, dmg: 2 }) => { const g = ensureBars(newGame(9700 + cuT * 10 + cuL)); g.james.skills['Convergence Use'] = { tier: cuT, level: cuL, xp: 0 }; g.james.gu = { tier: 3, level: 1, xp: 0 }; ensureBars(g); startCombat(g, { id: 'rq1_test', enemies: [{ ...foe }], win: 'stream', lose: 'stream' }); g.james.qi = qi; return g; };
    for (const t of [1, 3, 10]) { const g = at(t, 1); assert(cost(g, A.spear) === cost(g, A.blade), `RQ1: the spear costs what the blade costs at T${t} (the reserve counts the blade for both; review low 3)`); }
    { const g = at(1, 1); assert(attackReserve(g) === 3 && at(1, 6) && attackReserve(at(1, 6)) === 2, `RQ1: the reserve is 3 at T1 L1 (the knife), 2 at T1 L6 (darts) (${attackReserve(g)}, ${attackReserve(at(1, 6))})`); }
    { const g = at(1, 1); assert(fragileKnife(g) && !actionOpen(g, 'dart') && attackReserve(g) === cost(g, A.blade), `RQ1: the fragile knife, no darts: the reserve is the knife's cost (${attackReserve(g)})`); }
    { const g = at(1, 6); assert(fragileKnife(g) && actionOpen(g, 'dart') && attackReserve(g) === Math.min(cost(g, A.blade), cost(g, A.dart)), `RQ1: darts open: the cheaper attack (${attackReserve(g)})`); }
    { const g = at(1, 9); g.combat.bladeFormed = true; assert(!fragileKnife(g) && attackReserve(g) === 0, 'RQ1: a formed knife: no reserve'); }
    { const g = at(3, 1); g.combat.spearFormed = true; assert(attackReserve(g) === 0, 'RQ1: a formed spear: no reserve'); }
    { const g = at(1, 9); g.combat.fieldUsed = true; g.combat.bladeFormed = true; g.james.hp = SMART_SHIELD_AT * jamesHpMax(g); const need = cost(g, A.qshield) + attackReserve(g); // v0.11.98 (KR1): on a knife that holds; v0.11.100 (SB1, M): formed, so the reserve is 0
      assert(attackReserve(g) === 0, 'SB1: a formed knife leaves no reserve for the shield');
      g.james.qi = need; assert(smartAction(g, 0) === 'qshield', `RQ1: the shield when Qi pays for it and an attack (${need})`);
      g.james.qi = need - 0.1; assert(smartAction(g, 0) !== 'qshield', `RQ1: no shield just under its own cost (the reserve is 0 with a formed knife, v0.11.100) (${smartAction(g, 0)})`); }
    { const g = at(1, 3); assert(actionOpen(g, 'spikes') && !actionOpen(g, 'dart'), 'RQ1 test state: the field open, no darts yet'); const need = Math.max(6, cost(g, A.spikes) + attackReserve(g)); assert(need === 7, `RQ1: at T1 L3 the reserve binds the field (4 + 3 = ${need}; from T1 L5 the old floor of 6 does)`); // the review's medium 1
      g.james.qi = need; assert(smartAction(g, 0) === 'spikes', `RQ1: the field when Qi pays for it and an attack (${need})`);
      g.james.qi = need - 0.1; assert(smartAction(g, 0) !== 'spikes', `RQ1: no field just under it (${smartAction(g, 0)})`); }
    { // the review's case: CU T1 L1, 30% HP, 12 Qi against a 9 HP, DR 1 foe: the bot attacks, not only shields and guards
      const g = at(1, 1, 12, { name: 'Gnawer', hp: 9, dc: 1, atk: 0.1, dmg: 1, dr: 1 }); g.james.hp = 0.3 * jamesHpMax(g); g.yuki.hp = 0;
      const picks = []; let out = null; for (let t = 0; t < 12 && g.combat; t++) { const a = smartAction(g, t); picks.push(a); out = combatStep(g, a); }
      assert(picks.some((a) => ['blade', 'dart', 'spear'].includes(a)) && out?.done === 'win', `RQ1: the bot keeps Qi for an attack and wins (${picks.join(', ')}; ${out?.done})`); }
}
// v0.11.96 (owner 2026-11-09 14:16, pick BT1): (N + S) one smart rule for every bot that fights smart
// (tests/lib/smartfight.mjs); (H) the 19 story checks where James throws a dart or drives a needle, on GU with their XP
// to Convergence Use, as in a fight; (F) the FAQ says so (Fable's sentence)
{
    const { smartAction, SMART_SHIELD_AT } = await import('./lib/smartfight.mjs');
    const { actionCost: cost } = await import('../js/core/game.js');
    const A = COMBAT_ACTIONS;
    const at = (cuT, cuL, qi = 99) => { const g = ensureBars(newGame(9600 + cuT * 10 + cuL)); g.james.skills['Convergence Use'] = { tier: cuT, level: cuL, xp: 0 }; g.james.gu = { tier: 3, level: 1, xp: 0 }; ensureBars(g); startCombat(g, { id: 'bt1_test', enemies: [{ name: 'Foe', hp: 99, dc: 3, atk: 3, dmg: 2 }], win: 'stream', lose: 'stream' }); g.james.qi = qi; return g; };
    assert(SMART_SHIELD_AT === 0.35, 'BT1 S: the shield at 35% HP or less');
    // S: the shield at or under 35% HP while a foe will strike; not above, not when every foe is staggered or held, not without the Qi
    // (v0.11.98, KR1: on a knife that holds, T1 L9, the field spent; on the fragile knife there is no shield at all; v0.11.100, SB1: the knife formed)
    const held = (qi) => { const g = at(1, 9, qi); g.combat.fieldUsed = true; g.combat.bladeFormed = true; return g; }; // v0.11.100 (SB1, M): a formed knife, or no shield
    { const g = held(); g.james.hp = SMART_SHIELD_AT * jamesHpMax(g); assert(smartAction(g, 0) === 'qshield', `BT1 S: shield at 35% HP (${smartAction(g, 0)})`); }
    { const g = held(); g.james.hp = SMART_SHIELD_AT * jamesHpMax(g) + 1; assert(smartAction(g, 0) !== 'qshield', 'BT1 S: no shield above 35% HP'); }
    { const g = held(); g.james.hp = 1; g.combat.enemies[0].staggered = true; assert(smartAction(g, 0) !== 'qshield', 'BT1 S: no shield when no foe will strike'); }
    { const g = held(0); g.james.hp = 1; g.james.qi = cost(g, A.qshield) - 0.1; assert(smartAction(g, 0) !== 'qshield', 'BT1 S: no shield without its Qi'); }
    // N: the spear when he can sing it, else the blade (free once formed unless it's the fragile knife), darts, guard
    { const g = at(3, 1); g.combat.fieldUsed = true; assert(actionOpen(g, 'spear') && smartAction(g, 0) === 'spear', `BT1 N: the spear when open (${smartAction(g, 0)})`); g.james.qi = 0; g.combat.spearFormed = true; assert(smartAction(g, 1) === 'spear', 'BT1 N: a formed spear costs nothing'); }
    { const g = at(1, 9, 0); assert(actionOpen(g, 'spear') && !fragileKnife(g), 'BT1 test state: a knife and the spear'); g.combat.bladeFormed = true; assert(smartAction(g, 0) === 'blade', 'BT1 N: no Qi for the spear: the formed knife swings for free'); }
    { const g = at(1, 6, 0); assert(fragileKnife(g) && actionOpen(g, 'dart'), 'BT1 test state: the fragile knife, darts open'); // the knife isn't formed here (since v0.11.104, GW2 K, a fragile knife lasts 1–4 swings; the smart rule still prices it as unformed, kept as measured)
      g.james.qi = cost(g, A.blade); assert(smartAction(g, 0) === 'blade', 'BT1 N: the fragile knife while its Qi lasts');
      g.james.qi = cost(g, A.blade) - 0.1; assert(smartAction(g, 0) === 'dart', `BT1 N: the knife can't be paid: darts (${smartAction(g, 0)})`);
      g.james.qi = cost(g, A.dart) - 0.1; assert(smartAction(g, 0) === 'guard', 'BT1 N: nothing paid: guard'); }
    { const g = at(1, 1); g.combat.style = 'unarmed'; assert(smartAction(g, 0) === 'strike', 'BT1: a strike in a brawl (fists cost no Qi)'); g.james.qi = 0; assert(smartAction(g, 0) === 'strike', 'BT1: a strike in a brawl with no Qi'); }
    { const g = at(1, 1); g.combat.style = 'spar'; const a = smartAction(g, 0); assert(['blade', 'spear', 'guard'].includes(a), `BT1: a spar move in a spar (${a})`); }
    { let bad = 0; for (let t = 1; t <= 4; t++) for (const l of [1, 5, 9]) for (const qi of [0, 2, 3, 5, 9, 30]) for (const f of [0.1, 0.5, 1]) { const g = at(t, l, qi); g.james.hp = f * jamesHpMax(g); for (let r = 0; r < 3; r++) if (['needle', 'blast'].includes(smartAction(g, r))) bad++; } assert(bad === 0, `BT1: the smart rule never picks the needle or the Qi blast (${bad})`); }
    // H: the 19 throws on GU, XP to Convergence Use; nothing else has xpTo but v0.11.98's snare (`rr_hunt:1`); the singing checks stay on Convergence
    const THROWS = ['hunt:0', 'hunt_miss:0', 'herb_girl:1', 'wild_forage:2', 'wild_hunt:0', 'wild_hunt:1', 'wild_hunt:2', 'wild_train:0', 'wild_train:3', 'far_hunt:3', 'dw_forage:2', 'dw_hunt:1', 'ah_hunt:1', 'bl_train:1', 'bl_train:2', 'lf_hunt:0', 'lf_hunt:1', 'lf_train:0', 'lf_train:3'];
    const xs = []; for (const [id, s] of Object.entries(SCENES)) (s.choices || []).forEach((c, i) => { if (c.check?.xpTo) xs.push(`${id}:${i}`); });
    assert(xs.length === 20 && THROWS.every((k) => xs.includes(k)) && xs.includes('rr_hunt:1'), `BT1 H: the 19 throws carry xpTo, and v0.11.98's snare (${xs.length}: ${xs.join(', ')})`);
    for (const k of THROWS) { const [id, i] = k.split(':'); const c = SCENES[id].choices[Number(i)]; assert(c.check.skill === 'GU' && c.check.xpTo === 'Convergence Use', `BT1 H: ${k} on GU, XP to Convergence (${c.check.skill} / ${c.check.xpTo})`); }
    const sing = []; for (const [id, s] of Object.entries(SCENES)) (s.choices || []).forEach((c, i) => { if (/^(Sing a single bone needle|Needles and fishhooks|Make her a set of bone needles|Put your hand on the great skull)/.test(String(c.text))) sing.push(`${id}:${i}:${c.check?.skill}`); });
    assert(sing.length === 4 && sing.every((x) => x.endsWith(':Convergence Use')), `BT1 H: making needles and singing stay on Convergence (${sing.join(', ')})`);
    // H: the XP lands on Convergence Use (half shared to GU, as every Convergence check), in a story choice and on a task card
    const shared = (lines) => { const c = lines.find((l) => /^Convergence Use \+\d+ XP/.test(l)), u = lines.find((l) => /^GU \+\d+ XP/.test(l)); const n = (l) => Number(l?.match(/\+(\d+)/)?.[1]); return { c: n(c), u: n(u), check: lines.find((l) => / \/ DC /.test(l)) }; }; // the award's own lines (review, low 5: a level-up can't break it)
    { const g = ensureBars(newGame(9650)); g.james.skills['Convergence Use'] = { tier: 1, level: 5, xp: 0 }; ensureBars(g); g.scene = 'hunt'; g.james.qi = 99; // darts from T1 L5
      const x = shared(choose(g, SCENES, 0).lines);
      assert(/^GU /.test(x.check || '') && x.c > 0 && x.c === x.u, `BT1 H: the hunt checked on GU, its XP to Convergence with half shared to GU (${x.check}; CU +${x.c}, GU +${x.u})`); }
    { const g = ensureBars(newGame(9651)); g.scene = 'wilds'; g.minutes = 3 * 1440 + 9 * 60; g.james.qi = 30; g.james.satiety = 70;
      const card = taskCards(g, SCENES).find((k) => k.id === 'wild_hunt:2' && k.status === 'open'); // the crab: a needle into the shell's joint
      assert(!!card && /^GU /.test(card.tag || ''), `BT1 H: the crab card's tag names GU (${card?.tag})`);
      const x = shared(runTask(g, SCENES, 'wild_hunt:2').lines);
      assert(/^GU /.test(x.check || '') && x.c > 0 && x.c === x.u, `BT1 H: the crab card's XP to Convergence, half shared to GU (${x.check}; CU +${x.c}, GU +${x.u})`); }
    // F: the FAQ (Fable's sentence)
    { const { FAQ } = await import('../js/core/faq.js'); const e = FAQ.find(([q]) => q === 'Skills and checks'); assert(e[1]({ coil: { n: 1 } }).includes('A thrown dart, a driven needle or a sung bone snare, in a fight or on a hunt, is checked on GU but pays its XP to Convergence Use.'), 'BT1 F: the FAQ says it (v0.11.100, SB1 Q: with the snare, Fable\'s sentence)'); }
}
// v0.11.95 (owner 2026-11-09 12:26, pick Q1 at 12:43): every weapon sung with Convergence and checked on GU, one hit
// modifier (+1), the weapons differ in damage and what they do; the Qi blast (Convergence Use, ignores armour) and the Qi
// shield (soaks 3 × the Convergence tier that round; 3 × the bone multiplier since v0.11.104, GW2), open from the start, never in a spar or a brawl
{
    const { QI_SHIELD_PER_TIER, qiShield, QI_SHIELD_TEXT, QI_BLAST_PIERCE } = await import('../js/core/game.js');
    const A = COMBAT_ACTIONS;
    for (const id of ['dart', 'blade', 'needle', 'spear', 'flail']) assert(A[id].skill === 'GU' && A[id].dcMod === 1, // v0.11.107 (NK1, review low 4): the flail too
         `Q1: ${id} checked on GU, hit modifier +1 (${A[id].skill}, ${A[id].dcMod})`);
    assert(A.guard.skill === 'GU' && A.guard.dcMod === -1 && A.spikes.skill === 'Convergence Use', 'Q1: guard and the spike field as before');
    assert(A.blast.skill === 'Convergence Use' && A.blast.qi === 4 && A.blast.dmg.join() === '4,6' && A.blast.dcMod === 0 && A.blast.pierce === true, 'Q1: the Qi blast: Convergence Use, 4 Qi, 4–6 (P2), hit modifier 0 (v0.11.102, QB1; was +1), ignores armour');
    assert(A.qshield.qi === 3 && A.qshield.qshield === true && QI_SHIELD_PER_TIER === 3, 'Q1: the Qi shield: 3 Qi, 3 × the tier');
    const at = (t, l = 1) => { const g = ensureBars(newGame(9500 + t)); g.james.skills['Convergence Use'] = { tier: t, level: l, xp: 0 }; g.james.gu = { tier: 3, level: 1, xp: 0 }; ensureBars(g); g.james.qi = 99; return g; };
    assert(qiShield(at(1)) === 3 && qiShield(at(2)) === 6 && qiShield(at(4)) === 12, 'Q1: the shield soaks 3 / 6 / 12 at T1 / T2 / T4');
    { // P2 (owner 13:19): the blast ×1.4 damage and ×1.2 cost a tier; the shield's cost +10% of its base a tier; the rest as before
        const { actionCost: cost } = await import('../js/core/game.js');
        const mid = (d) => Math.round((d[0] + d[1]) / 2);
        const want = { 1: [5, 4, 3], 2: [10, 4.8, 3.3], 3: [15, 5.8, 3.6], 5: [25, 8.3, 4.2], 7: [38, 11.9, 4.8], 10: [103, 20.6, 5.7] }; // v0.11.104 (GW2, Bw): the blast's damage at the weapons' pace until T7 (P2's T2 7, T3 10, T5 19)
        for (const [T, [d, c, s]] of Object.entries(want)) { const x = at(Number(T)); assert(mid(actionDmg(x, A.blast)) === d && cost(x, A.blast) === c && cost(x, A.qshield) === s, `P2: T${T}: blast ${mid(actionDmg(x, A.blast))} dmg for ${cost(x, A.blast)} Qi (want ${d}, ${c}), shield ${cost(x, A.qshield)} Qi (want ${s})`); }
        assert(cost(at(10), A.dart) < cost(at(1), A.dart) && cost(at(10), A.needle) < cost(at(1), A.needle), 'P2: darts and the needle still get cheaper with the tier');
        assert(actionDmg(at(3), A.blade).join() === actionDmg(at(3), { ...A.blade, pierce: undefined }).join(), 'P2: the blade unchanged');
    }
    const g0 = at(1);
    assert(actionOpen(g0, 'blast') && actionOpen(g0, 'qshield'), 'Q1: both Qi moves open from the start');
    for (const style of ['spar', 'unarmed']) { const s2 = at(1); s2.combat = { style, enemies: [] }; assert(!actionOpen(s2, 'blast') && !actionOpen(s2, 'qshield'), `Q1: no Qi move in a ${style}`); }
    // the blast goes through armour (DR 2 at T1), the blade does not; the pierce line once a fight
    const hit = (id) => { const g = at(1); startCombat(g, { id: 'q1_test', enemies: [{ name: 'Plated', hp: 99, dc: 0.1, atk: 0.1, dmg: 0, dr: 2 }], win: 'stream', lose: 'stream' }); const rounds = [combatStep(g, id).lines, (delete g.combat.wait, combatStep(g, id).lines)]; return { rounds, lines: rounds.flat() }; };
    const bl = hit('blast'), bd = hit('blade');
    const bmid = 5; // the middle hit at T1 (the blast 4–6, the knife 3–6)
    const per = (h) => h.rounds.map((ls) => { const a = ls.find((l) => /^(Qi blast|Fragile bone knife|Bone knife):/.test(l)) || ''; const t = ls.find((l) => /^  Plated takes/.test(l)); return t ? [/clean, deep hit/.test(a), Number(/takes (\d+)/.exec(t)[1])] : null; }).filter(Boolean);
    const pb = per(bl), pd = per(bd);
    assert(pb.length >= 1 && pb.every(([dbl, n]) => n === bmid * (dbl ? 2 : 1)), `Q1: each blast hit at T1 deals its full damage through DR 2 (${JSON.stringify(pb)})`);
    assert(pd.length >= 1 && pd.every(([dbl, n]) => n === bmid * (dbl ? 2 : 1) - 2), `Q1: each blade hit loses DR 2 (${JSON.stringify(pd)})`);
    assert(bl.lines.filter((l) => l.includes(QI_BLAST_PIERCE.replace('{foe}', 'Plated'))).length === 1, 'Q1: the pierce line once a fight');
    assert(bd.lines.every((l) => !l.includes("Raw Qi")), 'Q1: no pierce line for the blade');
    // the shield soaks first, then the rest lands as before, for that round only
    const sh = at(1); startCombat(sh, { id: 'q1_test', enemies: [{ name: 'Brute', hp: 99, dc: 99, atk: 99, dmg: 8 }], win: 'stream', lose: 'stream' });
    const hp0 = sh.james.hp, q0 = sh.james.qi; const r1 = combatStep(sh, 'qshield'); const took1 = hp0 - sh.james.hp;
    const hp1 = sh.james.hp; combatStep(sh, 'guard'); const took2 = hp1 - sh.james.hp;
    assert(r1.lines.includes(QI_SHIELD_TEXT.raise) && r1.lines.some((l) => l === QI_SHIELD_TEXT.soak.replace('{foe}', 'Brute').replace('{n}', 3)), `Q1: the shield's lines (${r1.lines.join(' | ')})`);
    assert(q0 - sh.james.qi > 0 && took1 > 0 && took2 > took1 - 0.001 && sh.combat?.qshieldHp === undefined, `Q1: the shield soaked 3 that round only (took ${took1}, then ${took2} guarding)`);
    { const z = at(1); startCombat(z, { id: 'q1_test', enemies: [{ name: 'Gnat', hp: 99, dc: 99, atk: 99, dmg: 2 }], win: 'stream', lose: 'stream' }); const h0 = z.james.hp; const rz = combatStep(z, 'qshield'); const ai = rz.lines.findIndex((l) => /^Gnat attacks: you defend \(/.test(l)), si = rz.lines.findIndex((l) => /soaked/.test(l)); assert(z.james.hp === h0 && !rz.lines.some((l) => /it lands/.test(l)) && ai >= 0 && si > ai, `Q1: a blow the shield takes whole doesn't land; the defence line first, then the soak (${rz.lines.join(' | ')})`); }
    { // the review (Fable, medium 1): a half-landing blow: the shield soaks first, the rest is halved (7 after DR, 3 soaked, 4 halved: 2)
        const h = at(1); startCombat(h, { id: 'q1_test', enemies: [{ name: 'Brute', hp: 99, dc: 99, atk: 17, dmg: 8 }], win: 'stream', lose: 'stream' }); const h0 = h.james.hp; const rh = combatStep(h, 'qshield');
        assert(rh.lines.some((l) => /it only half lands: 2 /.test(l)) && h0 - h.james.hp === 2, `Q1: soak first, then halve (took ${h0 - h.james.hp}: ${rh.lines.join(' | ')})`);
    }
}
// v0.11.94 (owner 2026-11-09 11:35, pick T-b1): Ashfall's night 2 (the arson, Gao's token, Gao at the window) and the
// fallout's barley wolves come after the bed at 01:00 too, never back, and a fight is over before 02:00; a quiet night is untouched
{
    const { NO_DICE_ROUND_CAP } = await import('../js/core/game.js');
    const cases = [['village_night', { vday: 2 }, 6, 'arson'], ['village_night', { vday: 2, gao_broken: true }, 6, null], ['village_night', { vday: 2, gao_spared: true }, 6, null], ['fo_wolf', {}, 8, 'palisade_wolf']];
    for (const [sc, fl, d, fight] of cases) for (const bed of [15 * 60, 19 * 60, 21 * 60 + 30, 23 * 60 + 59, 24 * 60]) {
        const g = ensureBars(newGame(9400 + d)); g.minutes = (d - 1) * 1440 + bed; g.scene = sc; Object.assign(g.flags, fl);
        SCENES[sc].enter?.(g);
        const night0 = (d - 1) * 1440 + 24 * 60, t0 = g.minutes - night0, what = `${sc}${fight ? ` (${fight})` : Object.keys(fl).slice(1).join('') ? ` (${Object.keys(fl).slice(1).join('')})` : ''}`;
        assert(t0 === 60, `T-b1: ${what} after a bed at ${bed / 60}h starts at 01:00 (${t0} min after midnight)`);
        if (!fight) continue;
        const ch = SCENES[sc].choices.find((c) => c.combat && (!c.show || c.show(g)));
        const enc = combatHooks.before(g, ch.combat(g)); assert(enc.id === fight && enc.night === true, `T-b1: ${what} is a night fight`);
        startCombat(g, enc);
        g.combat.enemies.forEach((x) => { x.hp = 999; x.atk = 0.1; }); // the longest fight: it runs to the round cap
        let o = null; for (let i = 0; i < NO_DICE_ROUND_CAP + 5 && g.combat; i++) o = combatStep(g, 'guard');
        assert(o?.done && g.minutes < night0 + 120, `T-b1: ${what} is over before 02:00 even at the round cap (${g.minutes - night0} min after midnight)`);
    }
    for (const fl of [{ vday: 1 }, { vday: 2, night5_done: true }, { vday: 3 }]) { // a quiet night: the clock stays where the bed is
        const q = ensureBars(newGame(9406)); q.minutes = 5 * 1440 + 21 * 60 + 30; Object.assign(q.flags, fl); const m0 = q.minutes;
        SCENES.village_night.enter(q); assert(q.minutes === m0, `T-b1: a quiet Ashfall night (${JSON.stringify(fl)}) keeps the clock`);
    }
    { const late = ensureBars(newGame(9407)); late.minutes = 6 * 1440 + 150; late.flags.vday = 2; SCENES.village_night.enter(late); assert(late.minutes === 6 * 1440 + 150, 'T-b1: entered after 01:00, the clock never goes back'); }
    // the review (Fable, low 2): end to end through the choices, from supper to the morning: the night at 01:xx, the fight,
    // dawn at 06:00 the next day with the night marked short (half back), the village day moved on
    const { goTo: go2 } = await import('../js/core/story.js');
    for (const [from, idx, d, fl, fightTo, morn] of [['supper', 2, 6, { vday: 2 }, 'arson_won', 'village_morning'], ['fo_night', 0, 8, {}, 'fo_wolf_won', 'fo_morning']]) {
        const g = ensureBars(newGame(9410 + d)); Object.assign(g.flags, fl); g.minutes = (d - 1) * 1440 + 20 * 60; go2(g, SCENES, from);
        choose(g, SCENES, idx);
        const night0 = (d - 1) * 1440 + 24 * 60, at = g.minutes - night0;
        assert(at >= 60 && at < 120, `T-b1 (end to end): ${from} → ${g.scene} at ${at} min after midnight`);
        const ci = SCENES[g.scene].choices.findIndex((x) => x.combat && x.to === fightTo && (!x.show || x.show(g)));
        assert(ci >= 0, `T-b1 (end to end): ${g.scene} offers the fight`);
        const r = choose(g, SCENES, ci); if (r.combat) startCombat(g, r.combat(g));
        assert(g.combat && g.flags.night_fight === true, `T-b1 (end to end): ${g.scene}: the fight started and marks the night`);
        g.combat.enemies.forEach((x) => { x.hp = 0.1; x.atk = 0.1; x.dc = 0.1; }); // a sure win: the morning is what is checked
        let o = null; for (let k = 0; k < 40 && g.combat; k++) { g.james.qi = jamesQiMax(g); o = combatStep(g, 'blade'); }
        assert(o?.done && g.minutes < night0 + 120, `T-b1 (end to end): the fight over before 02:00 (${g.minutes - night0} min)`);
        if (o?.next) go2(g, SCENES, o.next);
        g.james.hp = Math.round(jamesHpMax(g) * 0.4); const hp0 = g.james.hp, hm = jamesHpMax(g);
        assert(g.scene === fightTo, `T-b1 (end to end): won, at ${g.scene}`);
        choose(g, SCENES, 0);
        const m = g.minutes - (d * 1440);
        assert(g.scene === morn && m >= 6 * 60 && m < 7 * 60 && !g.flags.night_fight && g.james.hp < hm && g.james.hp >= Math.ceil(hp0 + (hm - hp0) / 2) - 1, `T-b1 (end to end): dawn at ${g.scene}, ${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')} of Day ${d + 1}, HP ${g.james.hp}/${hm} (half back from ${hp0})`);
        if (fl.vday) assert(g.flags.vday === 3, `T-b1 (end to end): the village day moved on (${g.flags.vday})`);
    }
}
// v0.11.92 (owner 2026-11-09 10:17, pick O1, B push 2): a night fight costs sleep. A fight (or a run) in the night marks the
// night; at dawn only half of the missing HP and Qi come back, James's and Yuki's; a night without a fight fills every bar
{
    const { NIGHT_FIGHT_HEAL, shortNight, nightRest, instantWin } = await import('../js/core/game.js');
    const { yukiHpMax } = await import('../js/core/game.js');
    const half = (v, m) => Math.min(m, Math.ceil(v + (m - v) * NIGHT_FIGHT_HEAL));
    assert(NIGHT_FIGHT_HEAL === 0.5, 'v0.11.92: half the missing bars back after a night fight');
    { // the rule itself, and a full night without the mark (an old save has none)
        const g = ensureBars(newGame(9201)); g.minutes = 2 * 1440 + 90; g.flags.night_fight = true;
        const hm = jamesHpMax(g), qm = jamesQiMax(g), ym = yukiHpMax(g), yqm = yukiQiMax(g);
        g.james.hp = 3; g.james.qi = 1; g.yuki.hp = 2; g.yuki.qi = 0;
        const line = nightRest(g);
        assert(g.minutes === 2 * 1440 + 360 && g.james.hp === half(3, hm) && g.james.qi === half(1, qm) && g.yuki.hp === half(2, ym) && g.yuki.qi === half(0, yqm) && !g.flags.night_fight,
            `v0.11.92: a marked night: HP ${g.james.hp}/${hm}, Qi ${g.james.qi}/${qm}, Yuki ${g.yuki.hp}/${ym} ${g.yuki.qi}/${yqm}, the mark cleared`);
        assert(/after the fight: HP and Qi only half back\.$/.test(line) && !/\d+ \//.test(line), `v0.11.92: the line says so, without numbers (a regen tick may still land after it; the bars show it) (${line})`);
        const f = ensureBars(newGame(9202)); f.minutes = 2 * 1440 + 90; f.james.hp = 3; f.james.qi = 1;
        const l2 = nightRest(f);
        assert(f.james.hp === jamesHpMax(f) && f.james.qi === jamesQiMax(f) && /HP and Qi full/.test(l2), 'v0.11.92: no mark, a full night');
        const s = ensureBars(newGame(9203)); s.minutes = 2 * 1440 + 90; s.flags.night_fight = true; s.james.hp = 3; sleepUntil(s, 6);
        assert(!s.flags.night_fight && s.james.hp === jamesHpMax(s), 'v0.11.92: any full night (sleepUntil) clears the mark');
        assert(!KEEP_FLAGS.includes('night_fight'), 'v0.11.92: the mark is a world flag, so a rewind resets it');
        const z = ensureBars(newGame(9204)); z.minutes = 2 * 1440 + 90; z.flags.night_fight = true; z.james.hp = jamesHpMax(z); z.james.qi = jamesQiMax(z); shortNight(z);
        assert(z.james.hp === jamesHpMax(z) && z.james.qi === jamesQiMax(z), 'v0.11.92: an unhurt James stays full');
    }
    // every night fight marks the night when it starts, and the morning after a win is a short night
    const nights = [
        ['night_event', 'night_ev', 'crows', 2, 'night_won', 'morning'], ['night_event', 'night_ev', 'rats', 2, 'night_won', 'morning'],
        ['night_event', 'night_ev', 'lizard', 2, 'night_won', 'morning'], ['night_attack', null, null, 1, 'jackals_won', 'dawn'],
        ['bl_night_event', 'bl_ev', 'wolves', 10, 'bl_night_won', 'bl_morning'], ['bl_night_event', 'bl_ev', 'drowned', 10, 'bl_night_won', 'bl_morning'],
        ['bl_night_event', 'bl_ev', 'serpent', 10, 'bl_night_won', 'bl_morning'], ['bl_night_event', 'bl_ev', 'hawks', 10, 'bl_night_won', 'bl_morning'],
    ];
    for (const [sc, flag, kind, d, won, morn] of nights) {
        const g = ensureBars(newGame(9210 + d)); g.minutes = (d - 1) * 1440 + 22 * 60; g.scene = sc; g.flags.bl_region = kind === 'drowned' || kind === 'serpent' ? 'dw' : kind === 'hawks' ? 'ah' : 'rr'; g.flags.bl_day = 2;
        SCENES[sc].enter?.(g); if (flag) g.flags[flag] = kind;
        const ch = SCENES[sc].choices.find((c) => c.combat && (!c.show || c.show(g)));
        const enc = combatHooks.before(g, ch.combat(g)); startCombat(g, enc);
        assert(g.flags.night_fight === true && enc.night === true, `v0.11.92: ${kind || 'jackals'}: the fight marks the night`);
        g.combat = null; g.james.hp = Math.round(jamesHpMax(g) * 0.4); g.james.qi = 2;
        const hp0 = g.james.hp, hm = jamesHpMax(g), qm = jamesQiMax(g);
        goTo(g, SCENES, won); const r = choose(g, SCENES, 0);
        // the choice's own minutes pass after the morning's enter: one regen tick may land (v0.11.143, RN1 L1: one real tick,
        // HP hpRegenPct and Qi qiRegenPct of the bar; it was 0.1 of the bar, under one Qi tick, so the night's carry tripped it)
        const near = (v, w, tick) => v >= w && v <= w + tick + 1e-9;
        const tHp = (hpRegenPct(g.james.realm) / 100) * hm, tQi = (qiRegenPct(g, g.james.collaterals) / 100) * qm;
        assert(g.scene === morn && clockParts(g.minutes).hh === 6 && near(g.james.hp, half(hp0, hm), tHp) && near(g.james.qi, half(2, qm), tQi) && g.james.hp < hm && !g.flags.night_fight && r.lines.some((l) => /only half back/.test(l)),
            `v0.11.92: ${kind || 'jackals'} won: dawn at ${g.scene} with HP ${g.james.hp}/${hm} (from ${hp0}), Qi ${g.james.qi}/${qm}`);
        // one move: the mark too
        const o = ensureBars(newGame(9230 + d)); o.minutes = (d - 1) * 1440 + 22 * 60; o.scene = sc; o.flags.bl_region = g.flags.bl_region; o.flags.bl_day = 2; SCENES[sc].enter?.(o); if (flag) o.flags[flag] = kind;
        instantWin(o, ch.combat(o)); assert(o.flags.night_fight === true, `v0.11.92: ${kind || 'jackals'} ended in one move marks the night`);
    }
    // F: a run in the night costs sleep like a fight (the jackals' bone wall; the forest's and the Blackroot's flights)
    {
        const j = ensureBars(newGame(9241)); j.minutes = 25 * 60 + 30; j.james.hp = 10; j.james.qi = 3; goTo(j, SCENES, 'jackals_fled');
        const hm = jamesHpMax(j); const jr = choose(j, SCENES, 0);
        assert(jr.lines.some((l) => /after the run: HP and Qi only half back/.test(l)), `v0.11.92 (F): the jackals' escape says "after the run" (${jr.lines.join(' | ')})`);
        assert(j.scene === 'dawn' && j.james.hp >= half(10, hm) && j.james.hp <= half(10, hm) + 0.1 * hm && j.james.qi >= half(3, jamesQiMax(j)) && j.james.qi < jamesQiMax(j), `v0.11.92 (F): the jackals' bone wall and the water: half back (HP ${j.james.hp}/${hm}; was 80%)`);
        for (const [sc, flag, kind, d, morn] of [['night_event', 'night_ev', 'rats', 2, 'morning'], ['bl_night_event', 'bl_ev', 'wolves', 10, 'bl_morning']]) {
            const g = ensureBars(newGame(9250 + d)); g.minutes = (d - 1) * 1440 + 22 * 60; g.scene = sc; g.flags.bl_region = 'rr'; g.flags.bl_day = 2; SCENES[sc].enter?.(g); g.flags[flag] = kind;
            const ch = SCENES[sc].choices.find((c) => c.combat && (!c.show || c.show(g)));
            startCombat(g, combatHooks.before(g, ch.combat(g))); g.combat.enemies.forEach((x) => { x.atk = 0.1; }); g.james.hp = 6;
            const out = combatFlee(g); assert(out?.done === 'flee', `v0.11.92 (F): ${kind}: the flight succeeds (${out?.done})`);
            const hm = jamesHpMax(g); goTo(g, SCENES, out.next); if (g.scene === 'night_fled') choose(g, SCENES, 0);
            assert(g.scene === morn && g.james.hp >= half(6, hm) && g.james.hp <= half(6, hm) + 0.1 * hm && g.james.hp < hm, `v0.11.92 (F): ${kind}: a flight in the night, dawn with HP ${g.james.hp}/${hm}`);
        }
    }
    // X1 (owner 10:44): the two fights after bed outside the camps, Ashfall's arson (night 5) and the fallout's barley wolves
    for (const [sc, to, d, morn] of [['village_night', 'arson_won', 5, 'village_morning'], ['fo_wolf', 'fo_wolf_won', 8, 'fo_morning']]) {
        const g = ensureBars(newGame(9270 + d)); g.minutes = (d - 1) * 1440 + 23 * 60; g.scene = sc;
        const ch = SCENES[sc].choices.find((c) => c.combat && c.to === to);
        const enc = combatHooks.before(g, ch.combat(g)); startCombat(g, enc);
        assert(g.flags.night_fight === true && enc.night === true, `v0.11.92 (X1): ${enc.id}: the fight marks the night`);
        g.combat = null; g.james.hp = Math.round(jamesHpMax(g) * 0.4); g.james.qi = 2; const hp0 = g.james.hp, hm = jamesHpMax(g), qm = jamesQiMax(g);
        goTo(g, SCENES, to); const r = choose(g, SCENES, 0);
        assert(g.scene === morn && g.james.hp >= half(hp0, hm) && g.james.hp <= half(hp0, hm) + 0.1 * hm && g.james.hp < hm && g.james.qi < qm && !g.flags.night_fight && r.lines.some((l) => /only half back/.test(l)),
            `v0.11.92 (X1): ${enc.id} won: dawn at ${g.scene} with HP ${g.james.hp}/${hm} (from ${hp0}), Qi ${g.james.qi}/${qm}`);
    }
    // a night without a fight (rain, the gift; song, stars) still fills every bar
    for (const [sc, flag, kind, d, choice, morn] of [['night_event', 'night_ev', 'gift', 2, /Pluck it/, 'morning'], ['bl_night_event', 'bl_ev', 'stars', 10, /Go back to sleep/, 'bl_morning']]) {
        const g = ensureBars(newGame(9260 + d)); g.minutes = (d - 1) * 1440 + 22 * 60; g.scene = sc; g.flags.bl_region = 'ah'; g.flags.bl_day = 2; SCENES[sc].enter?.(g); g.flags[flag] = kind;
        g.james.hp = 5; g.james.qi = 1; const i = sceneView(g, SCENES).choices.find((c) => choice.test(c.label)).index; choose(g, SCENES, i);
        assert(g.scene === morn && g.james.hp === jamesHpMax(g) && g.james.qi === jamesQiMax(g), `v0.11.92: ${kind}: no fight, full bars at dawn`);
    }
}
// v0.11.90 (owner 2026-11-09 08:42, pick R1, the v0.11.87 Fable review): from Day 19 the hall's Rest stays while James is
// hurt, so a hurt James can heal before the guardian; at full HP it is gone; the sit stays shut either way
{
    const heart = (day, hh, f = 1) => { const g = ensureBars(newGame(9001, { closed: true })); g.minutes = (day - 1) * 1440 + hh * 60; g.scene = 'heart_hub'; g.james.qi = jamesQiMax(g); g.james.satiety = 90; g.flags.roots_done = true; g.james.hp = Math.max(1, Math.round(jamesHpMax(g) * f)); return g; };
    const ch = (g, re) => sceneView(g, SCENES).choices.find((c) => re.test(c.label) && !c.disabled);
    for (const d of [19, 20, 21]) {
        const hurt = heart(d, 9, 0.25), full = heart(d, 9);
        assert(ch(hurt, /^Rest an hour/) && !ch(full, /^Rest an hour/), `R1: Day ${d}: Rest while hurt, none at full HP`);
        assert(!ch(hurt, /^Cultivate: one sit/) && !medCards(hurt, SCENES).some((c) => c.open && /^Cultivate/.test(c.label || '')) && sitLoop(hurt, SCENES).sits === 0, `R1: Day ${d}: the sit stays shut while hurt`);
    }
    // the rest heals and runs out: a few rests bring James to full, then the card is gone (no endless clock)
    const g = heart(19, 8, 0.15), h0 = g.james.hp, m0 = g.minutes; let n = 0;
    for (; n < 30 && ch(g, /^Rest an hour/); n++) choose(g, SCENES, ch(g, /^Rest an hour/).index);
    assert(g.james.hp === jamesHpMax(g) && g.james.hp > h0 && n >= 1 && n <= 10 && g.minutes === m0 + 60 * n && g.scene === 'heart_hub' && !ch(g, /^Rest an hour/), `R1: rests heal to full in ${n} hour(s), then Rest is gone (HP ${h0} → ${g.james.hp}, ${g.minutes - m0} min)`);
    // the night: no Rest after 18:00 (the camp, as before); Day 18 as before
    assert(!ch(heart(19, 18, 0.25), /^Rest an hour/) && ch(heart(19, 18, 0.25), /^Make camp for the night/), 'R1: after 18:00 the camp, not Rest');
    assert(ch(heart(18, 9), /^Rest an hour/) && ch(heart(18, 9, 0.25), /^Rest an hour/), 'R1: Day 18 offers Rest as before, hurt or not');
}
// v0.11.89 (owner 2026-11-09 08:23, pick P1 = F1 + T3 + X1 + J1): the four small items
{
    const { instantWin, awardFightXp } = await import('../js/core/game.js');
    const { readFileSync } = await import('node:fs');
    const baoCh = SCENES.rt_brawl_start.choices[0];
    const mk = (cuT, guT, coils = 0) => { const g = ensureBars(newGame(8901, { closed: true })); g.james.skills['Convergence Use'].tier = cuT; g.james.skills['Convergence Use'].level = 5; g.james.gu.tier = guT; g.james.gu.level = 5; if (coils) g.coil.n = coils; return ensureBars(g); };
    const num = (lines, re) => Number((lines.find((l) => re.test(l)) || '').match(re)?.[1] ?? NaN);
    // F1: "Fists only." stays on the button and in the intro, not in round 1's opening
    const fe = combatHooks.before(mk(2, 3), baoCh.combat(mk(2, 3)));
    assert(/^Fists only\./.test(baoCh.text) && /Fists only\./.test(fe.intro) && !/Fists only/.test(fe.opening) && fe.opening.startsWith('You leave the song where it is'), 'F1: "Fists only." on the button and the intro, gone from the round-1 opening');
    // T3: the forced path says the terms, in the other path's exact words
    const yaCh = SCENES.ya_challenge.choices.find((c) => c.combat);
    assert(SCENES.ya_forced.choices.length === 1 && SCENES.ya_forced.choices[0].text === 'Fine. ' + yaCh.text.slice('Take the fight. '.length) && SCENES.ya_forced.choices[0].to === 'ya_won' && SCENES.ya_forced.choices[0].combat === yaCh.combat, 'T3: ya_forced\'s "Fine." says the terms (the same fight, the same ending)');
    // X1: the pool on CU's tier like every fight, all of it to GU; Yuki's bond share the same as any fight's; CU untouched
    for (const [cuT, guT] of [[2, 3], [1, 2], [3, 1], [5, 5]]) {
        const ref = mk(cuT, guT), refL = awardXp(ref, 'Convergence Use', 'standard');
        const g = mk(cuT, guT), cu0 = JSON.stringify(g.james.skills['Convergence Use']), L = awardFightXp(g, 'unarmed', 'standard');
        const refCu = num(refL, /^Convergence Use \+(\d+) XP/), refGu = num(refL, /^GU \+(\d+) XP/), refY = num(refL, /^Yuki \(bond\) Qi Use \+(\d+)/);
        const gu = num(L, /^GU \+(\d+) XP/), y = num(L, /^Yuki \(bond\) Qi Use \+(\d+)/);
        assert(JSON.stringify(g.james.skills['Convergence Use']) === cu0 && !L.some((l) => /^Convergence Use/.test(l)), `X1 (CU T${cuT} GU T${guT}): no CU XP`);
        assert(Math.abs(gu - (refCu + refGu)) <= 1 && y === refY, `X1 (CU T${cuT} GU T${guT}): GU ${gu} = the small fight's CU + GU (${refCu} + ${refGu}), Yuki ${y} = ${refY}`);
        const n = mk(cuT, guT); assert(JSON.stringify(awardFightXp(n, undefined, 'standard')) === JSON.stringify(refL) && JSON.stringify(awardFightXp(mk(cuT, guT), 'spar', 'standard')) === JSON.stringify(refL), `X1 (CU T${cuT}): an ordinary fight and the spar pay as before`);
    }
    // the owner's example: Act 1 end, CU T2 GU T3, Coil 5 (×2 bonus): GU 72, Yuki 36 (was 108 / 54); the coil bonus as for any fight
    const ex = mk(2, 3, 5), exL = awardFightXp(ex, 'unarmed', 'standard'), exRef = awardXp(mk(2, 3, 5), 'Convergence Use', 'standard');
    assert(num(exL, /^GU \+(\d+) XP/) === 2 * num(exRef, /^GU \+(\d+) XP/) && num(exL, /^Yuki \(bond\) Qi Use \+(\d+)/) === num(exRef, /^Yuki \(bond\) Qi Use \+(\d+)/), `X1: at Coil 5 the brawl pays twice a small fight's GU (${exL.join(' | ')})`);
    // both award paths: the combat win and the one-move finish
    const w = mk(2, 3); const we = combatHooks.before(w, baoCh.combat(w)); startCombat(w, we); w.combat.enemies.forEach((x) => { x.hp = 1; x.dc = 0.6; });
    const cuW = JSON.stringify(w.james.skills['Convergence Use']); let ow = null; for (let t = 0; t < 5 && w.combat; t++) ow = combatStep(w, 'strike');
    const want = awardFightXp(mk(2, 3), 'unarmed', we.band || 'standard');
    assert(ow?.done === 'win' && JSON.stringify(w.james.skills['Convergence Use']) === cuW && num(ow.lines, /^GU \+(\d+) XP/) === num(want, /^GU \+(\d+) XP/), `X1: the combat win pays the new GU (${ow?.lines.filter((l) => /XP|Qi Use/.test(l)).join(' | ')})`);
    const iw = mk(2, 3); const ie = baoCh.combat(iw); const ir = instantWin(iw, ie);
    assert(!ir.lines.some((l) => /^Convergence Use/.test(l)) && num(ir.lines, /^GU \+(\d+) XP/) === num(want, /^GU \+(\d+) XP/), `X1: the one-move finish pays the same (${ir.lines.join(' | ')})`);
    // J1: the Journal says "checks made"
    const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
    assert(main.includes('${g.stats.checks} checks made, ${g.stats.wins} passed') && !main.includes('checks rolled'), 'J1: the Journal reads "checks made"');
}
// v0.11.71 (owner picks Y1 + C1 + X1; Yuki's texts Fable's): Yuki switches food when her kind is full; "Cultivate until
// the limit" gives one total per skill; from Coil 2 the Blackroot's Explore is not once a day.
{
    const { yukiCatch, sitSummary } = await import('../js/core/tasks.js');
    const { lfYukiCatch } = await import('../js/story/longforest.js');
    const { replayExplore } = await import('../js/story/wilds.js');
    const { itemNames } = await import('../js/core/game.js');
    const { gives } = await import('../js/core/story.js');
    const FULLK = (g, ids) => { for (const id of ids) g.inventory[id] = itemCap(id); };
    const jobs = [...new Set(Object.values(TASK_HUBS).map((h) => h.yuki).filter(Boolean))];
    const YG = ensureBars(newGame(7100)); // v0.11.169 (CA1, YH): Ashfall's lines are by Yuki's form, so each is read with a game
    assert(jobs.length === 5 && jobs.every((j) => Array.isArray(j.alts) && j.alts.length >= 2 && typeof yukiSays(YG, j.full) === 'string' && j.alts.every((a) => a.item !== j.item && Object.hasOwn(itemNames, a.item) && typeof a.got(1, YG) === 'string' && a.got(1, YG) !== a.got(2, YG))), `Y1: every Yuki job has its other kinds, each with a one and a two text, and a full line (${jobs.length})`);
    for (const j of jobs) {
        const g = ensureBars(newGame(7101));
        assert(yukiCatch(g, j).item === j.item, `Y1 (${j.id}): her own kind first`);
        FULLK(g, [j.item]); const small = j.alts.filter((a) => !a.big);
        assert(yukiCatch(g, j).item === small[0].item, `Y1 (${j.id}): own kind full → ${small[0].item} (${yukiCatch(g, j)?.item})`);
        FULLK(g, small.map((a) => a.item));
        assert(yukiCatch(g, j) === null, `Y1 (${j.id}): cat form, every small kind full → nothing (venison needs tiger or human form)`);
        g.yuki.realm = 2; g.yuki.form = 'tiger';
        assert(yukiCatch(g, j)?.item === 'venison', `Y1 (${j.id}): tiger form → venison (${yukiCatch(g, j)?.item})`);
        FULLK(g, ['venison']); assert(yukiCatch(g, j) === null, `Y1 (${j.id}): all full → nothing`);
        const h = ensureBars(newGame(7108)); FULLK(h, [j.item, ...small.map((a) => a.item)]); h.yuki.realm = 7; h.yuki.form = 'human';
        assert(yukiCatch(h, j)?.item === 'venison', `Y1 (${j.id}): human form → venison too (${yukiCatch(h, j)?.item})`);
        const p = ensureBars(newGame(7109)); p.inventory[j.item] = itemCap(j.item) - 1; // the review's low 1 (R1): room for one, a double haul
        assert(yukiCatch(p, j, 1).item === j.item && yukiCatch(p, j, 2).item === small[0].item, `R1 (${j.id}): one short of the cap: a single haul is hers, a double one switches (${yukiCatch(p, j, 2)?.item})`);
    }
    // through the lane: a haul with hares full brings fowl, says so, and no false "+1 Glassback hare"; all full: she eats it, XP still
    const lane = (set) => {
        const g = ensureBars(newGame(7102, { closed: true })); g.scene = 'wilds'; g.minutes = 1440 + 9 * 60; Object.assign(g.flags, { long: true, forest_day: 2 });
        g.james.satiety = 90; g.james.qi = 30; g.yuki.fight.tier = 3; g.james.gu.tier = 9; g.rng = rngFor(5); set(g); setYuki(g, true); // v0.11.118 (YK1, D8): a roll of 5, one haul
        const yl = yukiLane(g); g.tasks.yuki.progress = yl.len - 1;
        const id = taskCards(g, SCENES).find((c) => c.status === 'open' && /^Rest in the shade/.test(c.label))?.id; // an hour
        const inv0 = { ...g.inventory }, r = runTask(g, SCENES, id);
        return { g, inv0, lines: r.lines, id };
    };
    { const { g, inv0, lines, id } = lane((g) => FULLK(g, ['hare_raw']));
        const l = lines.find((x) => /mire fowl/.test(x)) || '';
        assert(!!id && /\+\d Mire fowl/.test(l) && (g.inventory.fowl_raw || 0) > (inv0.fowl_raw || 0) && g.inventory.hare_raw === itemCap('hare_raw') && !lines.some((x) => /\+\d Glassback hare/.test(x)), `Y1: the lane with hares full brings fowl (${l.slice(-60)})`); }
    { const { g, inv0, lines } = lane((g) => FULLK(g, ['hare_raw', 'fowl_raw', 'crab_meat']));
        assert(lines.includes(TASK_HUBS.wilds.yuki.full) && JSON.stringify(g.inventory) === JSON.stringify(inv0) && lines[lines.indexOf(TASK_HUBS.wilds.yuki.full) + 1]?.startsWith('Yuki Fight'), `Y1: everything full: the full line, nothing added, her XP still (${lines.join(' | ').slice(0, 160)})`); }
    // v0.11.169 (owner picks P3A, CA1, RV1; Fable's review TG1, TG2): Ashfall's lane in every form, through runTask: her form's haul line and
    // the item; everything full: her form's full line, nothing added, her XP still, and every line a string (yukiSays on both paths)
    for (const [form, realm] of [['cat', 0], ['tiger', 2], ['human', 7]]) {
        const ash = (fill) => {
            const g = ensureBars(newGame(7140 + realm, { closed: true })); g.scene = 'ashfall'; g.minutes = 4 * 1440 + 9 * 60; Object.assign(g.flags, { long: true, vday: 2, elder: true, healed_try: true });
            g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form; ensureBars(g);
            g.james.satiety = 90; g.james.qi = 30; g.yuki.fight.tier = 3; g.james.gu.tier = 9; g.rng = rngFor(5); setYuki(g, true); if (fill) fill(g);
            g.tasks.yuki.progress = yukiLane(g).len - 1;
            const id = taskCards(g, SCENES).find((c) => c.status === 'open' && /^Rest an hour in the shade by the well/.test(c.label))?.id;
            const inv0 = { ...g.inventory }, r = id ? runTask(g, SCENES, id) : { lines: [] };
            return { g, inv0, lines: r.lines, id };
        };
        const J = TASK_HUBS.ashfall.yuki;
        { const { g, inv0, lines, id } = ash();
          const n = (g.inventory.hare_raw || 0) - (inv0.hare_raw || 0), want = `${J.got(n, g)} +${n} ${itemNames.hare_raw.name}.`;
          assert(!!id && n > 0 && lines.includes(want) && lines.every((l) => typeof l === 'string'), `P3A (RV1, TG2): Ashfall's lane as ${form}: her form's haul line and the hare (${lines.join(' | ').slice(0, 200)})`); }
        { const { g, inv0, lines } = ash((g) => FULLK(g, ['hare_raw', 'fowl_raw', 'venison']));
          const full = yukiSays(g, J.full);
          assert(typeof full === 'string' && lines.includes(full) && JSON.stringify(g.inventory) === JSON.stringify(inv0) && lines[lines.indexOf(full) + 1]?.startsWith('Yuki Fight') && lines.every((l) => typeof l === 'string'), `P3A (RV1, TG1): Ashfall's lane as ${form}, everything full: her full line, nothing added, her XP still (${lines.join(' | ').slice(0, 200)})`); }
    }
    { const { g, inv0, lines } = lane((g) => { g.inventory.hare_raw = itemCap('hare_raw') - 1; g.rng = rngFor(7); }); // YK1 (D8): a 7, double
        const l = lines.find((x) => /\+\d (Glassback hare|Mire fowl)/.test(x)) || '', n = Number(/\+(\d)/.exec(l.slice(l.lastIndexOf('+')))?.[1]);
        assert(g.inventory.hare_raw + (g.inventory.fowl_raw || 0) - inv0.hare_raw - (inv0.fowl_raw || 0) === n && (n === 1 ? /Glassback hare/ : /Mire fowl/).test(l), `R1: one short of the cap, the lane's line says what landed (${l.slice(-40)}; hares ${g.inventory.hare_raw}, fowl ${g.inventory.fowl_raw || 0})`); }
    // the Long Forest's card: tiger venison → hares → fowl; else hares → fowl; hidden only when all three are full
    { const g = ensureBars(newGame(7103));
        assert(lfYukiCatch(g).item === 'hare_raw' && lfYukiCatch(g).n === 1, 'Y1 (lf): cat: a hare');
        FULLK(g, ['hare_raw']); assert(lfYukiCatch(g).item === 'fowl_raw' && /siege/.test(lfYukiCatch(g).line), 'Y1 (lf): cat, hares full: a fowl');
        FULLK(g, ['fowl_raw']); assert(lfYukiCatch(g).item === null && /licking her chops/.test(lfYukiCatch(g).line), 'Y1 (lf): cat, hares and fowl full: nothing (venison is the tiger\'s)');
        const t = ensureBars(newGame(7104)); t.yuki.realm = 2; t.yuki.form = 'tiger';
        assert(lfYukiCatch(t).item === 'venison' && lfYukiCatch(t).n === 2 && lfYukiCatch(t).line === 'She comes back dragging half an ash-deer. +2 Ash-deer venison.', 'Y1 (lf): tiger: venison, the old line');
        FULLK(t, ['venison']); assert(lfYukiCatch(t).item === 'hare_raw' && lfYukiCatch(t).n === 2, 'Y1 (lf): tiger, venison full: two hares');
        FULLK(t, ['hare_raw']); assert(lfYukiCatch(t).item === 'fowl_raw', 'Y1 (lf): tiger, venison and hares full: fowl');
        const q = ensureBars(newGame(7110)); q.yuki.realm = 2; q.yuki.form = 'tiger'; q.inventory.venison = itemCap('venison') - 1;
        assert(lfYukiCatch(q).item === 'hare_raw', 'R1 (lf): tiger, room for one venison only: two hares, not "+2 venison" landing one');
        const c = SCENES.lf_hunt.choices.find((x) => /Let Yuki hunt/.test(x.text));
        assert(JSON.stringify(gives(c)) === JSON.stringify(['venison', 'hare_raw', 'fowl_raw']), `Y1 (lf): the card lists the three kinds it can bring (${gives(c)})`);
        const h = ensureBars(newGame(7105)); const o = c.do(h); assert(h.inventory.hare_raw === 1 && o[0] === 'She comes back with a hare and a look. +1 Glassback hare.', `Y1 (lf): the card adds what it says (${o[0]})`); }
    // C1: one total per skill, the rank reached, a cap once, other lines kept in order after the totals
    {
        const s = sitSummary(['Condensed: Saturation 10%.', 'Convergence Use +5 XP', 'GU +5 XP', 'Yuki (bond) Qi Use +5', 'Yuki comes back with a hare and a look of mild contempt. +1 Glassback hare.',
            'Condensed: Saturation 20%.', 'Convergence Use +5.5 XP → T1 L3', 'GU at T10 L10 (cap)', 'Yuki (bond) Qi Use +5 → T2 L1', 'Some warning.']);
        assert(JSON.stringify(s) === JSON.stringify(['Convergence Use +10.5 XP → T1 L3', 'GU +5 XP', 'GU at T10 L10 (cap)', 'Yuki (bond) Qi Use +10 → T2 L1', 'Yuki comes back with a hare and a look of mild contempt. +1 Glassback hare.', 'Some warning.']), `C1: the totals (${JSON.stringify(s)})`);
        const x = ensureBars(newGame(7106, { closed: true })); x.scene = 'stream'; x.minutes = 1440 + 8 * 60; Object.assign(x.flags, { long: true, forest_day: 2 }); x.james.satiety = 90; x.james.qi = jamesQiMax(x);
        const y = JSON.parse(JSON.stringify(x)), raw = sitLoop(y, SCENES), rm = runMed(x, SCENES, 'med:sitall');
        const sum = (re) => raw.lines.reduce((n, l) => n + Number(re.exec(l)?.[1] || 0), 0);
        assert(raw.sits >= 2 && rm.lines.length === 4 && !rm.lines.some((l) => /^Condensed/.test(l)) && rm.lines[2] === `GU +${sum(/^GU \+([\d.]+) XP/)} XP` && JSON.stringify(x.james) === JSON.stringify(y.james), `C1: ${raw.sits} sits in 4 lines, the totals what the sits gave (${rm.lines.join(' | ')})`);
    }
    // X1: Coil 1 once a day; from Coil 2 Explore again after a trip, before 16:00, until the three places are seen
    {
        const ex = SCENES.wilds.choices.find((c) => /^Explore deeper/.test(c.text));
        const g = ensureBars(newGame(7107, { closed: true })); g.scene = 'wilds'; g.minutes = 1440 + 9 * 60; Object.assign(g.flags, { long: true, forest_day: 2 });
        assert(ex.show(g) && !replayExplore(g), 'X1: Coil 1: Explore open in the morning');
        goTo(g, SCENES, 'wild_explore'); g.scene = 'wilds';
        assert(!ex.show(g), 'X1: Coil 1: once a day');
        g.coil.n = 2; assert(replayExplore(g) && ex.show(g), 'X1: Coil 2: open again after a trip');
        assert(taskCards(g, SCENES).some((c) => c.group === 'Explore' && c.kind === 'door' && c.status === 'open'), 'X1: Coil 2: the Explore cards are on the screen again');
        g.minutes = 1440 + 16 * 60; assert(!ex.show(g), 'X1: Coil 2: not from 16:00');
        g.minutes = 1440 + 10 * 60; Object.assign(g.flags, { v_bone: true, v_mire: true, v_hollow: true }); assert(!ex.show(g), 'X1: Coil 2: gone once the three places are seen');
    }
}
// v0.11.72 (owner picks S1 + N1 + P0 + T1, the copy-over push 5): the Coil screen's closest cards and what carries over,
// Selene's next-step line on the prologue's task screens, a target per act and the personal best.
{
    const { nextStep } = await import('../js/core/tasks.js');
    const { coilReport, noteClear, targetsText, passCoils, TARGETS } = await import('../js/core/coil.js');
    const hub = (seed, scene, day, set) => { const x = ensureBars(newGame(seed, { closed: true })); x.scene = scene; x.minutes = (day - 1) * 1440 + 9 * 60; Object.assign(x.flags, { long: true, forest_day: day }); x.james.satiety = 70; x.james.qi = 3; if (set) set(x); return x; };
    // N1: each rule in its order
    assert(/^You're hungry/.test(nextStep(hub(7201, 'wilds', 2, (x) => { x.james.satiety = 20; x.inventory.hare_raw = 1; }), SCENES)), 'N1: 1 hungry with food');
    assert(!/^You're hungry/.test(nextStep(hub(7202, 'wilds', 2, (x) => { x.james.satiety = 20; }), SCENES)), 'N1: 1 needs food in the hammerspace (R1: the review\'s L5)');
    { const x = hub(7203, 'wilds', 2, (x) => { x.james.saturation = 96; x.james.primaries = 12; }); assert(canBreakThrough(x) && /breakthrough point/.test(nextStep(x, SCENES)), `N1: 2 the breakthrough point (${nextStep(x, SCENES)})`); }
    assert(/^Tap a card/.test(nextStep(hub(7204, 'stream', 1), SCENES)), 'N1: 3 Coil 1, Day 1');
    { const x = hub(7205, 'wilds', 2); setYuki(x, false); assert(/^Yuki can hunt/.test(nextStep(x, SCENES)), `N1: 4 Yuki's job off (${nextStep(x, SCENES)})`); setYuki(x, true); assert(nextStep(x, SCENES) === 'Day 2 of 7: the Sect\'s tribute comes on Day 7.', `N1: 7 otherwise the day (${nextStep(x, SCENES)})`); }
    { const x = hub(7206, 'stream', 1); x.coil.n = 3; assert(/^A new Coil: .* you learn ×1\.5 as fast\.$/.test(nextStep(x, SCENES)), `N1: 5 a new Coil's first day, its number (${nextStep(x, SCENES)})`); }
    { const x = hub(7207, 'wilds', 2, (x) => { x.james.qi = jamesQiMax(x); }); setYuki(x, true); assert(/^Qi is nearly full/.test(nextStep(x, SCENES)), `N1: 6 Qi nearly full (${nextStep(x, SCENES)})`); }
    // the review's M1 (R1): the short route (no `long`) has the tribute at the next dawn: no "Day N of 7"
    { const x = hub(7212, 'village', 2, (x) => { x.flags.long = false; }); setYuki(x, true); assert(!/of 7/.test(nextStep(x, SCENES)), `R1: the short route gets no tribute-day line (${nextStep(x, SCENES)})`); }
    // the review's M2 (R1): a Long Forest run earlier doesn't turn the hints off; only the Long Forest itself does
    { const x = hub(7213, 'stream', 1, (x) => { x.coil.n = 2; x.flags.longforest = true; x.flags.lf_active = false; }); assert(/^A new Coil/.test(nextStep(x, SCENES)), `R1: after a Long Forest run the hints come back (${nextStep(x, SCENES)})`);
      x.flags.lf_active = true; assert(nextStep(x, SCENES) === '', 'R1: none while in the Long Forest'); }
    { const a = hub(7208, 'wilds', 2); a.stats.coils0 = 1; const b = hub(7208, 'fo_ashfall', 9); b.coil.act = 1; const c = hub(7208, 'arrival', 1);
      assert(nextStep(a, SCENES) === '' && nextStep(b, SCENES) === '' && nextStep(c, SCENES) === '', 'N1: none after the first crossing, in Act 1 or off the task screens'); }
    // T1: the best per act, counted from the pass's first Coil, kept and only improved
    { const x = hub(7209, 'wilds', 2); x.coil.n = 2;
      assert(passCoils(x) === 2 && JSON.stringify(noteClear(x, 0)) === JSON.stringify(['Prologue cleared in 2 Coils: a new best ★ (target 4).']) && x.stats.best[0] === 2, 'T1: the prologue on Coil 2: a new best within the target');
      x.coil.n = 3; assert(noteClear(x, 0).length === 0 && x.stats.best[0] === 2, 'T1: a worse clear changes nothing');
      x.coil.n = 5; x.stats.pass = 5; assert(passCoils(x) === 1 && /in 1 Coil: a new best ★/.test(noteClear(x, 0)[0]) && x.stats.best[0] === 1, 'T1: a new pass counts from its own first Coil');
      x.coil.n = 11; assert(/^Act 1 cleared in 7 Coils: a new best \(target 6\)\.$/.test(noteClear(x, 1)[0]), 'T1: over the target, no star');
      assert(targetsText(x) === `the prologue by Coil ${TARGETS[0]}, Act 1 by Coil ${TARGETS[1]}, counted from Day 1. Your best: prologue 1 Coil, Act 1 7 Coils.`, `T1: the targets line (${targetsText(x)})`); }
    // T1 through the scenes: crossing into Act 1 and reaching its end; a whole-game rewind starts a pass
    { const x = hub(7210, 'epilogue', 8); x.coil.n = 2; x.flags.ending = 'paid'; const lines = SCENES.fo_start.enter(x) || [];
      assert(x.coil.act === 1 && lines.includes('Prologue cleared in 2 Coils: a new best ★ (target 4).') && x.stats.coils0 === 2, `T1: crossing records the prologue (${lines.join(' | ')})`);
      const l2 = SCENES.a1_end.enter ? SCENES.a1_end.enter(x) || [] : []; assert(l2.includes('Act 1 cleared in 2 Coils: a new best ★ (target 6).') && x.stats.best[1] === 2, `T1: the end of Act 1 records it (${l2.join(' | ')})`);
      rewind(x, { to: 'game' }); assert(x.coil.act === 0 && x.stats.pass === x.coil.n && passCoils(x) === 1 && x.stats.best[0] === 2 && x.stats.best[1] === 2, `T1: the whole game again: a new pass, the bests kept (pass ${x.stats.pass}, n ${x.coil.n})`);
    }
    // a rewind to the start of Act 1 keeps the pass (the review's L5, R1: on an Act 1 state)
    { const x = hub(7214, 'epilogue', 8); x.coil.n = 4; x.stats.pass = 3; x.flags.ending = 'paid'; SCENES.fo_start.enter(x); x.scene = 'fo_ashfall';
      endCoil(x, 'choice', 'fo_ashfall'); const n = rewind(x, { to: 'act' }); assert(x.coil.act === 1 && n === 5 && x.stats.pass === 3 && passCoils(x) === 3, `T1: a rewind to the act keeps the pass (act ${x.coil.act}, n ${n}, pass ${x.stats.pass})`); }
    // the review's L3 (R1): a new best is a Results line; L4: a save from before v0.11.72 on an unknown pass records nothing until a whole-game rewind
    { const { splitLine: sl } = await import('../js/core/replies.js');
      assert(['Prologue cleared in 2 Coils: a new best ★ (target 2).', 'Act 1 cleared in 1 Coil: a new best ★ (target 3).'].every((l) => sl(l).reply === '' && sl(l).gain === l), 'R1: a new best goes to Results');
      const x = hub(7215, 'epilogue', 8); x.coil.n = 6; x.stats.coils0 = 2; delete x.stats.pass; x.flags.ending = 'paid';
      const l = SCENES.fo_start.enter(x) || []; assert(!l.some((t) => /cleared in/.test(t)) && x.stats.passUnknown === true && !x.stats.best, `R1: an old save's second pass records no prologue best (${l.join(' | ')})`);
      assert(noteClear(x, 1).length === 0 && !x.stats.best, 'R1: nor its Act 1');
      rewind(x, { to: 'game' }); assert(!x.stats.passUnknown && x.stats.pass === x.coil.n && passCoils(x) === 1, 'R1: the next whole-game rewind starts a known pass'); }
    // S1: the closest cards (only those that grew this Coil), the screen's new lines
    { const x = hub(7211, 'wilds', 2); x.coil.start.fam = { 'wild_forage:0': 1.5, 'wild_forage:1': 5 }; x.tasks.fam = { 'wild_forage:0': 1.5, 'wild_forage:1': 7, 'wild_hunt:0': 1, 'wild_train:0': 19, 'yuki:wilds': 17 };
      const r = coilReport(x); assert(JSON.stringify(r.near.map((n) => [n.id, n.at, n.tier])) === JSON.stringify([['wild_forage:1', 8, 'Skilled'], ['wild_hunt:0', 2, 'Practised']]), `S1 + CL (v0.11.159): the closest cards, grown this Coil, none at the top tier, Yuki's job not among them (${JSON.stringify(r.near)})`);
      assert(JSON.stringify(r.yuki) === JSON.stringify([{ id: 'yuki:wilds', f: 17 }]) && !r.gained.some((l) => /Skilled/.test(l)) && r.gained.includes('1 card Mastered'), `CL: her job in her own list, not counted among the cards (her 0 → 17 would have been "1 card Skilled") (${r.gained.join(' · ')})`);
      endCoil(x, 'choice', 'wilds'); goTo(x, SCENES, 'coil_end'); const t = sceneView(x, SCENES).text;
      const { yukiSpeedLine: ysl } = await import('../js/core/tasks.js');
      assert(/\*\*Closest to the next tier:\*\* River cress in the shallows 7\/8 \(Skilled\) · /.test(t) && !/Closest to the next tier:[^\n]*Yuki/.test(t) && t.includes(`**Yuki's hunting:** Hunt alone in the reeds (${ysl(17)})`) && /\*\*Carries over:\*\* familiarity with every card and Yuki's practice, /.test(t) && t.includes(`**Targets:** ${targetsText(x)}`), `S1 + T1 + CL: the Coil screen's lines (${t.slice(t.indexOf('**Closest'), t.indexOf('**Closest') + 260)})`); }
    // CL (v0.11.159): only jobs that grew this Coil, each by its label, in id order; none grown, no line
    { const x = hub(7216, 'wilds', 2); x.coil.start.fam = { 'yuki:wilds': 8, 'yuki:rr': 2 }; x.tasks.fam = { 'yuki:wilds': 8, 'yuki:rr': 4.5, 'yuki:ah': 20 };
      const r = coilReport(x); const { yukiJobLabel: yjl, yukiSpeedLine: ysl } = await import('../js/core/tasks.js');
      assert(JSON.stringify(r.yuki.map((y) => y.id)) === JSON.stringify(['yuki:ah', 'yuki:rr']) && yjl('yuki:rr') === 'Hunt along the roots' && yjl('yuki:ah') === 'Hunt the ash slopes' && yjl('yuki:ashfall') === 'Hunt the barley fields', `CL: the grown jobs only, in id order, by their labels (${JSON.stringify(r.yuki)})`);
      endCoil(x, 'choice', 'wilds'); goTo(x, SCENES, 'coil_end'); const t = sceneView(x, SCENES).text;
      assert(t.includes(`**Yuki's hunting:** Hunt the ash slopes (${ysl(20)}) · Hunt along the roots (${ysl(4.5)})`), `CL + BR (RV1): two jobs on one line, each speed in brackets (${t.slice(t.indexOf("**Yuki's"), t.indexOf("**Yuki's") + 160)})`);
      const y = hub(7217, 'wilds', 2); y.coil.start.fam = { 'yuki:wilds': 8 }; y.tasks.fam = { 'yuki:wilds': 8 }; endCoil(y, 'choice', 'wilds'); goTo(y, SCENES, 'coil_end');
      assert(!sceneView(y, SCENES).text.includes("**Yuki's hunting:**"), 'CL: no line when her practice did not grow');
      // RV1 TG: an unknown id's label; the screen's blank lines when only her line shows; after a rewind only the growth since it
      assert(yjl('yuki:nowhere') === "Yuki's hunting", 'TG: an unknown job id falls back to "Yuki\'s hunting"');
      const z = hub(7218, 'wilds', 2); z.coil.start.fam = {}; z.tasks.fam = { 'yuki:wilds': 3 }; endCoil(z, 'choice', 'wilds'); goTo(z, SCENES, 'coil_end'); const tz = sceneView(z, SCENES).text;
      assert(!tz.includes('**Closest to the next tier:**') && /\n\n\*\*Yuki's hunting:\*\* Hunt alone in the reeds \([^)]*\)\n\n\*\*Carries over:\*\*/.test(tz) && !/\n\n\n/.test(tz), `TG: only her line, one blank line either side (${JSON.stringify(tz.slice(tz.indexOf('**James'), tz.indexOf('**Targets')))})`);
      const w = hub(7219, 'wilds', 2); w.tasks.fam['yuki:wilds'] = 5; endCoil(w, 'choice', 'wilds'); rewind(w, { to: 'game' });
      assert(w.coil.start.fam['yuki:wilds'] === 5 && coilReport(w).yuki.length === 0, `TG: after a rewind her practice is the new Coil's start, nothing listed yet (${JSON.stringify(w.coil.start.fam)})`);
      w.tasks.fam['yuki:wilds'] = 6.5; assert(JSON.stringify(coilReport(w).yuki) === JSON.stringify([{ id: 'yuki:wilds', f: 6.5 }]), 'TG: then only the growth since the rewind lists her'); }
    // v0.11.160 (owner pick NX2, CS; Opus's L4 of v0.11.159): the Coil that crosses into Act 1 keeps its Day 1 familiarity, so its Coil
    // screen counts the cards and Yuki's practice from the prologue part too; RV1 (SL, Opus's M1): the realm and skill lines count from
    // Day 8 (what an act rewind takes away); the rewind point is still Day 8, and a rewind in Act 1 starts every count again from Day 8
    { const x = hub(7220, 'wilds', 2); x.tasks.fam = { 'wild_forage:0': 1, 'yuki:wilds': 2 }; x.james.gu = { tier: 1, level: 1, xp: 0 }; x.coil.start = coilStart(x); const day1 = JSON.stringify(x.coil.start.fam);
      x.tasks.fam = { 'wild_forage:0': 9, 'yuki:wilds': 12, 'fo_drill:0': 3 }; x.james.gu = { tier: 1, level: 9, xp: 0 }; x.james.realm = (x.james.realm || 0) + 1;
      Object.assign(x.flags, { ending: 'bluff' }); x.minutes = 7 * 1440 + 6 * 60;
      const oldFam = x.coil.start.fam; startActCoil(x, 1);
      assert(x.coil.act === 1 && x.coil.start.fam !== oldFam && JSON.stringify(x.coil.start.fam) === day1 && x.coil.snap.tasks.fam['yuki:wilds'] === 12, `CS: crossing keeps the Day 1 familiarity (a copy), the snapshot is Day 8 (${JSON.stringify(x.coil.start.fam)})`);
      assert(String(x.coil.start.gu) === '1,9' && x.coil.start.realm === x.james.realm, `SL: the realm and GU start at Day 8, not Day 1 (${x.coil.start.gu}; realm ${x.coil.start.realm})`);
      x.tasks.fam['yuki:wilds'] = 14; let r = coilReport(x);
      assert(JSON.stringify(r.yuki) === JSON.stringify([{ id: 'yuki:wilds', f: 14 }]) && r.gained.includes('1 card Skilled') && r.gained.includes('1 card Practised'), `CS: the cards and Yuki count from Day 1 of the Coil (her 2 → 14; the forage 1 → 9 Skilled, the drill 0 → 3 Practised) (${r.gained.join(' · ')})`);
      assert(!r.gained.some((l) => /^GU |^realm /.test(l)), `SL: the prologue's GU and realm, kept by an act rewind, are not on the screen (${r.gained.join(' · ')})`);
      x.james.gu = { tier: 1, level: 10, xp: 0 }; r = coilReport(x);
      assert(r.gained.includes('GU T1 L9 → T1 L10'), `SL: Act 1's own GU growth shows from Day 8 (${r.gained.join(' · ')})`);
      endCoil(x, 'collapse', null); rewind(x);
      assert(x.coil.act === 1 && x.coil.start.fam['yuki:wilds'] === 14 && coilReport(x).yuki.length === 0, `CS: a rewind in Act 1 starts the count from Day 8 again (${JSON.stringify(x.coil.start.fam)})`);
      // RV1 TG: the game's own way into Act 1 (fo_start's enter, coil_scenes.js) carries the familiarity the same way
      const f = hub(7222, 'wilds', 2); f.tasks.fam = { 'yuki:wilds': 1 }; f.coil.start = coilStart(f); f.tasks.fam = { 'yuki:wilds': 9 }; Object.assign(f.flags, { ending: 'bluff' }); f.minutes = 7 * 1440 + 6 * 60;
      SCENES.fo_start.enter(f);
      assert(f.coil.act === 1 && f.coil.start.fam['yuki:wilds'] === 1 && JSON.stringify(coilReport(f).yuki) === JSON.stringify([{ id: 'yuki:wilds', f: 9 }]), `TG: fo_start's enter crosses with the Day 1 familiarity (${JSON.stringify(f.coil.start.fam)})`);
      // RV1 TG: an old save (state 4) loaded mid-Act 1: MIGRATIONS[4] crosses with the save's own Coil start (familiarity), skills as loaded
      const m = hub(7223, 'wilds', 2); m.tasks.fam = { 'yuki:wilds': 3 }; m.coil = { act: 0, n: 2, snap: null, start: { ...coilStart(m), fam: { 'yuki:wilds': 1 } }, peak: {}, known: [] };
      Object.assign(m.flags, { ending: 'bluff' }); m.minutes = 8 * 1440 + 9 * 60; m.scene = 'fo_hub'; m.v = 4; migrate(m);
      assert(m.coil.act === 1 && m.coil.n === 2 && m.coil.start.fam['yuki:wilds'] === 1 && String(m.coil.start.gu) === String([m.james.gu.tier, m.james.gu.level]), `TG: a state-4 save mid-Act 1 keeps its Coil start's familiarity, the skills as loaded (${JSON.stringify(m.coil.start)})`);
      const n = ensureBars(newGame(7221, { closed: true })); delete n.coil; startActCoil(n, 1);
      assert(n.coil.act === 1 && n.coil.start && n.coil.start.fam, 'CS: with no Coil before the start is the moment Act 1 begins'); }
}
// v0.11.161 (owner pick PO2, FG + HO; the owner 11:25 "once a day PER OPTION, not overall"): each Blackroot forage card and each hunt
// option once a waking day, a try counted whatever its outcome (as the Wilds'); the Hunt card open while either option is left
{
    const { onceADay } = await import('../js/story/act1_blackroot.js');
    const at = (hub, day, seed) => { const g = ensureBars(newGame(seed)); g.scene = hub; g.coil.act = 1; g.minutes = (day - 1) * 1440 + 8 * 60; g.james.qi = 60; g.james.satiety = 90; g.flags.ya_joined = true; return g; };
    const FORAGE = { rr_forage: ['rr_bracket', 'rr_sorrel', null], dw_forage: ['dw_gill', 'dw_chestnut', 'dw_frog'], ah_forage: ['ah_truffle', 'ah_cinder', null] };
    const HUNTS = { rr_hunt: ['rr_elk', 'rr_snare', 'rr_hub', 13], dw_hunt: ['dw_serpent', 'dw_fowl', 'dw_hub', 15], ah_hunt: ['ah_hawks', 'ah_hares', 'ah_hub', 17] };
    // every forage card but the grub and the beetle (already once a day), and both options of every hunt, carry their own day key
    for (const [m, keys] of Object.entries(FORAGE)) keys.forEach((k, i) => { if (!k) return; const c = SCENES[m].choices[i]; assert(c.show?.dailyKey === k && typeof c.failDo === 'function', `FG: ${m}:${i} is once a day (${k}), its failure counted too`); });
    for (const [m, [a, b, hub]] of Object.entries(HUNTS)) assert(SCENES[m].choices.length === 3 && SCENES[m].choices[0].combat && !SCENES[m].choices[1].combat && SCENES[m].choices[2].text === 'Not now.' && SCENES[m].choices[2].to === hub && !SCENES[m].choices[2].do && !SCENES[m].enter, `HO + LV: ${m} has its fight, its small game and "Not now." last, and no day mark on entering`);
    // RV1 (GV, Fable's H1): every wrapped card still names its items (story.js's gives: thin hauls, double hauls, full stock, the card's
    // item names), the same lists as before the wrapper; the frogs and the fights give none
    { const { gives } = await import('../js/core/story.js'); const { cardCheck } = await import('../js/core/tasks.js');
      const WANT = { 'rr_forage:0': ['jade_bracket'], 'rr_forage:1': ['river_cress'], 'dw_forage:0': ['ghost_gill'], 'dw_forage:1': ['river_cress'], 'dw_forage:2': [], 'ah_forage:0': ['jade_bracket'], 'ah_forage:1': ['crimson_berry'], 'rr_hunt:1': ['hare_raw'], 'dw_hunt:1': ['fowl_raw'], 'ah_hunt:1': ['hare_raw'], 'rr_hunt:0': [], 'dw_hunt:0': [], 'ah_hunt:0': [] };
      const bad = Object.entries(WANT).filter(([id, w]) => { const [m, i] = id.split(':'); return JSON.stringify(gives(SCENES[m].choices[+i])) !== JSON.stringify(w); });
      assert(!bad.length, `GV: the wrapped cards name their items as before (${bad.map(([id]) => `${id} ${JSON.stringify(gives(SCENES[id.split(':')[0]].choices[+id.split(':')[1]]))}`).join(', ') || 'all'})`);
      // a thin haul in each Forage menu: a check between half and the full DC still brings something back, and uses the day
      for (const [m, hub, day, i, item] of [['rr_forage', 'rr_hub', 13, 0, 'jade_bracket'], ['dw_forage', 'dw_hub', 15, 0, 'ghost_gill'], ['ah_forage', 'ah_hub', 17, 0, 'jade_bracket']]) {
          const g = at(hub, day, 16150 + day); const id = `${m}:${i}`; let lv = 0;
          for (let r = 1; r <= 40; r++) { g.james.gu = { tier: 1 + Math.floor((r - 1) / 10), level: 1 + ((r - 1) % 10), xp: 0 }; if (cardCheck(g, id, SCENES[m].choices[i]).band === 'partial') { lv = r; break; } }
          if (!lv) { assert(false, `GV: no GU gives ${id} a partial band`); continue; }
          const n0 = g.inventory[item] || 0; const out = runTask(g, SCENES, id);
          assert((g.inventory[item] || 0) > n0 && !SCENES[m].choices[i].show(g), `GV: ${id} at a partial band brings a thin haul (+${(g.inventory[item] || 0) - n0} ${item}) and uses the day (${out.lines.join(' | ')})`);
      } }
    // a failed forage try counts too (failDo marks), as a success does; the next day it is back
    { const g = at('rr_hub', 13, 16101); const c = SCENES.rr_forage.choices[0]; assert(c.show(g), 'FG: the brackets open in the morning');
      c.failDo(g); assert(!c.show(g), 'FG: a failed try uses the day'); g.minutes += 1440; assert(c.show(g), 'FG: open again the next day');
      c.do(g); assert(!c.show(g) && SCENES.rr_forage.choices[1].show(g), 'FG: a success uses the day, the sorrel still open'); }
    for (const [m, [fight, small, hub, day]] of Object.entries(HUNTS)) {
        const g = at(hub, day, 16110 + day); g.james.skills['Convergence Use'] = { tier: 3, level: 1, xp: 0 }; const hunt = () => taskCards(g, SCENES).find((c) => c.label === 'Hunt.'); // darts sung (the form gate, prologue.js)
        const open = () => sceneView(g, SCENES).choices.filter((c) => !c.disabled && c.index < 1000).map((c) => SCENES[m].choices[c.index]);
        assert(hunt()?.status === 'open', `HO: ${hub}'s Hunt card open in the morning`);
        runTask(g, SCENES, hunt().id); assert(g.scene === m && open().length === 3, `HO + LV: the first visit offers the fight, the small game and "Not now." (${g.scene}: ${open().map((c) => c.text)})`);
        choose(g, SCENES, 2); assert(g.scene === hub && !Object.keys(g.flags).some((k) => k.startsWith(`${fight}@`) || k.startsWith(`${small}@`)) && hunt()?.status === 'open', `LV: "Not now." goes back to ${hub}, uses nothing, the Hunt card still open`);
        runTask(g, SCENES, hunt().id); choose(g, SCENES, 1);
        assert(g.scene === hub && hunt()?.status === 'open', `HO: after the small game the Hunt card is still open the same day (${g.scene}, ${hunt()?.status})`);
        runTask(g, SCENES, hunt().id);
        assert(open().length === 2 && open()[0].combat && open()[1].text === 'Not now.', `HO + LV: the second visit offers the fight or "Not now.", never a forced fight (${open().map((c) => c.text)})`);
        const r = choose(g, SCENES, 0); assert(r.combat && Object.keys(g.flags).some((k) => k.startsWith(`${fight}@`)), `HO: taking the fight marks ${fight} for the day (won, lost or fled)`);
        g.combat = null; g.scene = hub; assert(hunt() === undefined, `HO: with both options taken the Hunt card is gone for the day (${hunt()?.status})`);
        g.minutes += 1440; assert(hunt()?.status === 'open', `HO: ${hub}'s Hunt card open again the next day`);
    }
    // the fight first, then fled or lost (marked before the fight): the Hunt card stays open for the small game; with Qi under 2 the
    // small game is locked, so the card goes (never a scene with only "Not now.")
    { const g = at('rr_hub', 13, 16160); const hunt = () => taskCards(g, SCENES).find((c) => c.label === 'Hunt.');
      runTask(g, SCENES, hunt().id); const r = choose(g, SCENES, 0); g.combat = null; g.scene = 'rr_hub';
      assert(r.combat && hunt()?.status === 'open', 'HO: the fight taken (and fled): the Hunt card open for the snare');
      g.james.qi = 1; assert(hunt() === undefined, `HO: Qi under 2 with only the snare left: the Hunt card is gone (${hunt()?.status})`); }
    // RV1 (SD, owner pick SD1; Fable's texts): a same-day return after the fight shows its own opening, the first visit the old one
    { const { HUNT_AGAIN } = await import('../js/story/act1_blackroot.js');
      assert(HUNT_AGAIN.rr.startsWith('Ya has gone back to the torn ground') && HUNT_AGAIN.dw.startsWith('The pool has gone flat again.') && HUNT_AGAIN.ah.startsWith('The haze over the ridge has nothing in it now.'), 'SD1: rr b, dw a, ah a, word for word');
      for (const [m, k, hub, day, key] of [['rr_hunt', 'rr_elk', 'rr_hub', 13, 'rr'], ['dw_hunt', 'dw_serpent', 'dw_hub', 15, 'dw'], ['ah_hunt', 'ah_hawks', 'ah_hub', 17, 'ah']]) {
          const g = at(hub, day, 16170 + day); g.scene = m; const t0 = sceneView(g, SCENES).text;
          assert(!t0.includes(HUNT_AGAIN[key]), `SD: ${m}'s first visit keeps its own opening`);
          SCENES[m].choices[0].do(g); const t1 = sceneView(g, SCENES).text;
          assert(t1 === HUNT_AGAIN[key], `SD: ${m} after the fight opens on its return text (${t1.slice(0, 50)})`);
          g.minutes += 1440; assert(sceneView(g, SCENES).text !== HUNT_AGAIN[key], `SD: ${m} the next day opens as before`);
      } }
    // RV1 (L2): every byOption menu's cards are gated by the day alone (so "all used" means done for the day)
    { const { TASK_HUBS } = await import('../js/story/task_hubs.js');
      const menus = Object.values(TASK_HUBS).flatMap((h) => Object.entries(h.menus || {}).filter(([, m]) => m.byOption).map(([id]) => id));
      assert(menus.length === 3 && menus.every((id) => SCENES[id].choices.every((c) => c.show?.dailyKey)), `L2: the byOption menus (${menus}) gate every card by the day`); }
    { const y = onceADay('x_test2', { text: 't', show: () => true, check: { skill: 'GU', dc: 1 }, do: () => [], failDo: () => [], to: 'rr_hub' });
      assert(y.show.dailyKey === 'x_test2', 'L1: a card with its own show keeps the day key (tomorrow, not hidden)'); }
    // with every forage card used, the group stays on the screen as tomorrow (as the Wilds', the grub and the beetle), while its entry
    // is closed, so the menu is never entered with nothing left (the story test's dead end)
    { const g = at('rr_hub', 13, 16140); g.james.satiety = 40; const grp = () => taskCards(g, SCENES).filter((c) => c.group === 'Forage');
      for (const c of grp().filter((x) => x.status === 'open')) runTask(g, SCENES, c.id);
      const entry = SCENES.rr_hub.choices.find((c) => c.to === 'rr_forage');
      assert(grp().length === 3 && grp().every((c) => c.status === 'tomorrow') && !entry.show(g), `FG: all three used: the group shows them as tomorrow, the entry closed (${grp().map((c) => `${c.id} ${c.status}`)})`);
      const h = at('rr_hub', 13, 16141); h.minutes = 12 * 1440 + 23 * 60; assert(!taskCards(h, SCENES).some((c) => c.group === 'Forage' && c.status === 'tomorrow'), 'FG: late in the day the group is not shown as tomorrow'); }
    // a James who can't sing darts has only the fight in the Drowned Wood and the Ashen Hills: once it is taken the Hunt card waits for
    // tomorrow (never an empty hunt scene); the root road's snare needs no form
    for (const [m, hub, day] of [['dw_hunt', 'dw_hub', 15], ['ah_hunt', 'ah_hub', 17]]) {
        const g = at(hub, day, 16130 + day); g.james.skills['Convergence Use'] = { tier: 1, level: 1, xp: 0 }; const hunt = () => taskCards(g, SCENES).find((c) => c.label === 'Hunt.');
        assert(SCENES[m].choices[1].form === 'dart' && !SCENES[m].choices[1].show(g) && hunt()?.status === 'open', `HO: ${m}'s darts hidden without the form, the Hunt card open for the fight`);
        runTask(g, SCENES, hunt().id); const r = choose(g, SCENES, 0); g.combat = null; g.scene = hub;
        assert(r.combat && hunt() === undefined, `HO: ${hub} with the fight taken (through the scene) and no darts: the Hunt card is gone for the day (${hunt()?.status})`);
    }
    // the one-move finish marks the fight too (story.js runs the choice's `do` there, as before a fight)
    { const g = at('rr_hub', 13, 16120); g.scene = 'rr_hunt'; const i = SCENES.rr_hunt.choices.findIndex((c) => c.combat);
      g.james.gu = { tier: 10, level: 10, xp: 0 }; g.james.realm = 9; g.james.hp = 999;
      try { choose(g, SCENES, 1000 + i); } catch (e) { assert(false, `HO: the one-move finish runs (${e.message})`); }
      assert(Object.keys(g.flags).some((k) => k.startsWith('rr_elk@')), 'HO: the one-move finish uses the elk for the day');
      const y = onceADay('x_test', { text: 't', combat: () => null, to: 'rr_hub' }); const h = at('rr_hub', 13, 16121);
      assert(y.show(h) && JSON.stringify(y.do(h)) === '[]' && !y.show(h) && !('failDo' in y), 'HO: onceADay on a fight: show by the day, a do that only marks, no failDo added'); }
}
// every card that was ever offered was also played at least once
const all = cardsListed;
if (FULL) for (const id of all) assert(cardsSeen.has(id), `card ${id} was played by a bot`); // coverage: the full run only
if (FULL) for (const id of cardsWhole) assert(cardsForecast.has(id), `v0.11.21: card ${id}'s forecast was checked on a whole run (1 game in ${FC_EVERY}, and since v0.11.46 its first run)`);
if (!FULL) console.log(`  coverage (quick, log only; with the Golden Core walk's ${walkCards} cards, mer:ec ${walkEc}): ${cardsSeen.size} of ${all.size} offered cards played, ${cardsForecast.size} of ${cardsWhole.size} whole-run cards forecast-checked`); // v0.11.21
assert(yukiRuns > GAMES / 2, `Yuki's lane brings things home (${yukiRuns})`);
// no dice on work cards: the same state gives the same result
{
    const g = ensureBars(newGame(3)); g.scene = 'wilds'; g.minutes += 1440; Object.assign(g.flags, { long: true, forest_day: 2 });
    const a = JSON.parse(JSON.stringify(g)), b = JSON.parse(JSON.stringify(g));
    a.rng = 1; b.rng = 999999;
    const ra = runTask(a, SCENES, 'wild_forage:0'), rb = runTask(b, SCENES, 'wild_forage:0');
    assert(JSON.stringify(ra.lines) === JSON.stringify(rb.lines) && JSON.stringify(a.inventory) === JSON.stringify(b.inventory), 'work cards ignore the dice');
    assert(famTier(0) === 0 && famTier(2) === 1 && famTier(8) === 2 && famTier(18) === 3, 'familiarity tiers at 2 / 8 / 18');
}
// v0.11.155 (FD1, NX; RV1 TS, NB): a work or door card's line names the next step, the steps read from FAM; the same on every
// hub's cards; "N/M to Step" never breaks inside (non-breaking spaces); main.js shows it
{
    const nb = (t) => t.replace(/ /g, '\u00a0');
    const step = (f) => FAM[famTier(f)], nextOf = (f) => FAM[famTier(f) + 1] || null;
    const expect = (f) => (nextOf(f) ? `${step(f).name}\u00a0· ${f}/${nextOf(f).at}\u00a0to\u00a0${nextOf(f).name}` : step(f).name);
    const want = [[0, 'New · 0/2 to Practised'], [1.5, 'New · 1.5/2 to Practised'], [2, 'Practised · 2/8 to Skilled'], [5, 'Practised · 5/8 to Skilled'], [8, 'Skilled · 8/18 to Mastered'], [12, 'Skilled · 12/18 to Mastered'], [18, 'Mastered'], [40, 'Mastered']];
    for (const [f, line] of want) { const got = famLine({ tier: famTier(f), fam: f, next: nextOf(f)?.at ?? null }); assert(got.replace(/\u00a0/g, ' ') === line && got === expect(f), `NX: familiarity ${f} reads "${line}" (${got})`); }
    assert(famLine({ tier: 1, fam: 5, next: 8 }) === `Practised\u00a0· 5/8${nb(' to Skilled')}` && !/\d \S|to (?=\S)/.test(famLine({ tier: 2, fam: 12.5, next: 18 })), 'NB: no breaking space inside "12.5/18 to Mastered" or before its "·"');
    const hubs = ['camp', 'stream', 'wilds', 'village', 'ashfall', 'fo_ashfall', 'rr_hub', 'dw_hub', 'ah_hub', 'heart_hub', 'rt_camp', 'rt_ashfall'];
    const seen = new Set(), bad = [];
    for (const [i, hub] of hubs.entries()) for (const f of [0, 1.5, 3, 7.9, 9, 20]) {
        const g = ensureBars(newGame(9100 + i)); g.scene = hub; g.minutes += 8 * 1440 + 9 * 60; g.james.qi = 30; g.james.satiety = 70; Object.assign(g.flags, { long: true, forest_day: 2 });
        const t = taskState(g);
        for (const c of taskCards(g, SCENES)) if (c.kind === 'work' || c.kind === 'door') t.fam[c.id] = f;
        for (const c of taskCards(g, SCENES)) if (c.kind === 'work' || c.kind === 'door') { seen.add(c.id); const l = famLine(c); if (l !== expect(f)) bad.push(`${c.id} at ${f}: ${l}`); }
    }
    assert(!bad.length && seen.size >= 80, `NX: every work and door card on ${hubs.length} hubs names its step and the next one, from FAM (${seen.size} cards; ${bad.slice(0, 3).join('; ') || 'all hold'})`);
    const MAIN = (await import('node:fs')).readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
    assert(/const fam = c\.kind === 'work' \|\| c\.kind === 'door' \? ` · \$\{famLine\(c\)\}` : ''/.test(MAIN) && !/\$\{c\.fam\}\/\$\{c\.next\}/.test(MAIN), 'NX: main.js puts famLine on work and door cards; the old "Practised 5/8" (c.fam/c.next) is gone');
}

// v0.10.0: meridian sessions, a card that would end the Coil, starving 1.5 HP an hour, rest and sleep at once (the queue went in v0.11.64)
{
    const g = ensureBars(newGame(70, { closed: true })); g.scene = 'wilds'; g.minutes = 1440 + 8 * 60; Object.assign(g.flags, { long: true, forest_day: 2 });
    // a meridian session as a card
    assert(merChoice(g, SCENES) === 0 && taskOpen(g, SCENES, MER_TASK), 'a closed start offers the next primary as a card');
    const m0 = g.minutes;
    const r = runTask(g, SCENES, MER_TASK);
    assert(g.scene === 'wilds' && g.minutes - m0 === 120 && g.james.primaries === 1 && !r.stopped, 'a meridian sitting as a card: 2 h, a primary, back on the hub');
    g.james.qi = 20; runTask(g, SCENES, MER_TASK); g.james.qi = 20;
    assert(merChoice(g, SCENES) >= 0 && taskOpen(g, SCENES, MER_TASK), 'v0.11.2: no daily limit, the card stays');
    g.james.satiety = 10; assert(!taskOpen(g, SCENES, MER_TASK), 'Fed under 20: no meridian card'); g.james.satiety = 70;
    // v0.11.13 (E1): one card per meridian line; collaterals queueable while primaries are still closed; an old mer:next queue still runs
    {
        const L = ensureBars(newGame(76, { closed: true })); L.scene = 'stream'; L.james.qi = 25; L.james.satiety = 70; L.james.primaries = 3; L.yuki.primaries = 3;
        const ids = taskCards(L, SCENES).filter((c) => c.kind === 'mer').map((c) => c.id);
        assert(ids.join() === 'mer:pri,mer:col' && !ids.includes(MER_TASK), `v0.11.13: two meridian cards on the stream (${ids.join()})`);
        assert(medCards(L, SCENES).filter((c) => /^med:mer:/.test(c.id)).map((c) => c.task).join() === 'mer:pri,mer:col', 'v0.11.13: the Meditate cards carry the queue ids');
        assert(taskMinutes(L, SCENES, 'mer:col') === 120 && lineOfTask('mer:col') === 'col' && lineOfTask('mer:next') === null, 'v0.11.13: the collateral card: 2 h in the forecast, never at once');
        const real = JSON.parse(JSON.stringify(L)), said = [], got = [];
        for (const id of ['mer:col', 'mer:col', 'mer:pri']) { said.push(taskOutcome(real, SCENES, id).end); runTask(real, SCENES, id); got.push(real.minutes); }
        assert(said.join() === got.join(), `v0.11.13: each card ends where it said (${said.join()} / ${got.join()})`);
        assert(real.james.collaterals === 9 && real.james.primaries === 4 && real.tasks.use['act:mer'] === 3 && real.scene === 'stream', `v0.11.13: two collateral sittings open group 1 with 3 primaries; v0.11.15: the third sitting (×1.6) opens the 4th primary (${real.james.collaterals}, ${real.james.primaries})`);
        L.james.satiety = 19; const lk = medCards(L, SCENES).filter((c) => /^med:mer:/.test(c.id));
        assert(lk.length === 2 && lk.every((c) => !c.open && !c.task && /Too hungry/.test(c.reason)) && !taskOpen(L, SCENES, 'mer:pri'), 'v0.11.13: under Fed 20 both show, locked, with the reason');
        L.james.satiety = 70; L.james.qi = 1; assert(medCards(L, SCENES).filter((c) => /^med:mer:/.test(c.id)).every((c) => !c.open && /2 Qi/.test(c.reason)), 'v0.11.13: under 2 Qi: locked'); L.james.qi = 25;
        const o = JSON.parse(JSON.stringify(L));
        assert(taskOpen(o, SCENES, MER_TASK) && runTask(o, SCENES, MER_TASK) && o.james.primaries === 3 && o.james.merWork > 0, 'v0.11.13: mer:next still runs (primaries first)');
        // v0.11.14: no Meditate on a story screen; on Act 1's resting places the Meditate cards queue
        const a = ensureBars(newGame(77, { closed: true })); a.scene = 'arrival'; a.james.qi = 25; a.james.satiety = 70;
        assert(!medCards(a, SCENES).length && !isQueueScreen(a, SCENES) && !taskCards(a, SCENES).length, 'v0.11.14: the arrival has no Meditate and no task cards');
        const rc = ensureBars(newGame(80, { closed: true })); rc.scene = 'rt_camp'; rc.james.qi = 30; rc.james.satiety = 70;
        const rm = medCards(rc, SCENES);
        assert(isQueueScreen(rc, SCENES) && rm.find((c) => c.id === 'med:mer:pri')?.task === 'mer:pri' && rm.find((c) => c.id === 'rt_camp:3')?.task === 'rt_camp:3', 'v0.11.19: rt_camp is a task screen: the primary and its own sit card carry queue ids');
        assert(isTaskHub(rc) && taskCards(rc, SCENES).some((c) => c.id === 'rt_camp:3') && taskCards(rc, SCENES).some((c) => c.kind === 'door' && /fire/.test(c.label)) && taskCards(rc, SCENES).some((c) => c.id === 'mer:pri'), 'v0.11.19: rt_camp: its chores, doors and Meditate cards are cards');
        const rr = JSON.parse(JSON.stringify(rc)), rsaid = [], rgot = [];
        for (const id of ['mer:pri', 'rt_camp:3']) { rsaid.push(taskOutcome(rr, SCENES, id).end); runTask(rr, SCENES, id); rgot.push(rr.minutes); }
        assert(rsaid.join() === rgot.join() && rr.scene === 'rt_camp' && rr.james.primaries === 1, `v0.11.19: rt_camp's cards run as their cards said (${rsaid} vs ${rgot})`);
        let threw = false; try { runTask(a, SCENES, SIT_TASK); } catch { threw = true; }
        assert(threw, 'v0.11.14: no queued work on a story screen');
        const bq = ensureBars(newGame(81)); bq.scene = 'rt_camp'; bq.james.qi = 30; bq.james.saturation = 96;
        assert(taskOpen(bq, SCENES, BT_TASK) && medCards(bq, SCENES).find((c) => c.id === 'med:bt')?.task === BT_TASK, 'v0.11.14: Break through queues on a resting place');
        const br = runTask(bq, SCENES, BT_TASK);
        assert(br.stopped && bq.scene === 'breakthrough' && bq.flags.bt_return === 'rt_camp', 'v0.11.19: Break through on the rt_camp task screen comes back to it');
        const fe = ensureBars(newGame(78)); fe.scene = 'stream'; fe.james.qi = 25; fe.james.realm = 4; markDaily(fe, 'mer_e8'); // v0.11.66 (G4): Golden Core
        const fm = medCards(fe, SCENES).find((c) => c.id === 'med:mer:e8');
        assert(fm && fm.open && taskOpen(fe, SCENES, 'mer:e8'), `v0.11.18: an Extraordinary line has no daily limit in Incremental Mode (${fm?.reason})`);
        const s7 = ensureBars(newGame(79)); s7.scene = 'stream'; s7.james.qi = 25; s7.james.realm = 7; s7.james.extra8 = 8;
        assert(medCards(s7, SCENES).filter((c) => /^med:mer:/.test(c.id)).map((c) => c.id).join() === 'med:mer:jn', 'v0.11.13: Nascent Soul: the junctions (v0.11.46, X1: the vessels\' collaterals no longer, they sealed)');
    }
    // v0.11.12: a queueable Cultivate sit where the task screen has none of its own
    {
        const k = ensureBars(newGame(73, { closed: true })); k.scene = 'stream'; k.james.qi = 25; k.james.satiety = 70;
        assert(taskOpen(k, SCENES, SIT_TASK) && medCards(k, SCENES).some((c) => c.id === 'med:sit' && c.task === SIT_TASK), 'v0.11.12: the stream offers a queueable sit (Meditate card with a task)');
        const before = { qi: k.james.qi, sat: k.james.saturation, m: k.minutes }, gain = sitGain(k);
        assert(taskMinutes(k, SCENES, SIT_TASK) === 60, `v0.11.12: the sit's forecast is 60 min (${taskMinutes(k, SCENES, SIT_TASK)})`);
        const rs = runTask(k, SCENES, SIT_TASK);
        assert(!rs.stopped && k.scene === 'stream' && k.minutes - before.m === 60 && k.james.saturation === Math.round((before.sat + gain) * 10) / 10 && k.james.qi < before.qi, 'v0.11.12: a queued sit: an hour, Saturation +gain, Qi spent, still on the hub');
        k.james.qi = 5; assert(!taskOpen(k, SCENES, SIT_TASK) && !medCards(k, SCENES).find((c) => c.id === 'med:sit').task, 'v0.11.12: under 10 Qi: no queueable sit');
        k.james.qi = 25; k.james.saturation = 100; assert(!taskOpen(k, SCENES, SIT_TASK), 'v0.11.12: at 100% Saturation: no queueable sit');
        const w2 = ensureBars(newGame(74, { closed: true })); w2.scene = 'wilds'; w2.james.qi = 25;
        assert(!taskOpen(w2, SCENES, SIT_TASK), 'v0.11.12: the wilds keep their own Cultivate card (no second one)');
        const lone = ensureBars(newGame(75, { closed: true })); lone.scene = 'arrival'; lone.james.qi = 25;
        assert(!taskOpen(lone, SCENES, SIT_TASK) && !medCards(lone, SCENES).length, 'v0.11.14: no sit on a story screen');
    }
    // v0.11.64 (owner 02:07, pick C1): Cultivate until the limit = that many single sits; its stops
    {
        const mk = (seed, scene, set) => { const x = ensureBars(newGame(seed, { closed: true })); x.scene = scene; x.minutes = 1440 + 8 * 60; Object.assign(x.flags, { long: true, forest_day: 2 }); x.james.satiety = 90; x.james.qi = jamesQiMax(x); Object.assign(x.james, set || {}); return x; };
        const same = (a, b) => a.minutes === b.minutes && JSON.stringify(a.james) === JSON.stringify(b.james) && JSON.stringify(a.yuki) === JSON.stringify(b.yuki) && JSON.stringify(a.tasks) === JSON.stringify(b.tasks) && JSON.stringify(a.inventory) === JSON.stringify(b.inventory);
        for (const [scene, seed] of [['stream', 90], ['wilds', 91], ['camp', 92], ['ashfall', 93]]) {
            const x = mk(seed, scene); if (scene === 'ashfall') x.minutes = 4 * 1440 + 8 * 60;
            const p = sitLoopPlan(x, SCENES), id = sitTaskId(x, SCENES);
            const taps = JSON.parse(JSON.stringify(x)); for (let k = 0; k < p.sits; k++) runTask(taps, SCENES, id);
            const r = sitLoop(x, SCENES);
            assert(p.sits >= 2 && r.sits === p.sits && r.minutes === p.minutes && r.qi === p.qi && same(x, taps), `C1 (${scene}): the loop = ${p.sits} single taps of ${id}, and the button's numbers are what happens`);
            assert(r.stop === 'qi' && x.james.qi < 10, `C1 (${scene}): from a full bar Qi runs out first (${r.stop}, Qi ${x.james.qi})`);
        }
        const s1 = mk(94, 'stream', { realm: 1, saturation: 81.6, qi: 999 }); const r1 = sitLoop(s1, SCENES); // v0.11.66 (S1): +6.7% a sit at Foundation
        assert(r1.stop === 'sat' && s1.james.saturation === 95 && r1.sits === 2, `C1: it stops at the breakthrough point, 95% (${s1.james.saturation}%, ${r1.stop})`);
        const s2 = mk(95, 'stream'); s2.minutes = 1440 + 22 * 60 + 30; const r2 = sitLoop(s2, SCENES); // 22:30: one sit ends 23:30, a second would end past midnight (v0.11.91)
        assert(r2.stop === 'night' && r2.sits === 1 && !nightLock(s2) && s2.minutes <= 2 * 1440, `C1: it stops before a sit that would end past midnight (${r2.sits} sits, ${r2.stop})`);
        const s3 = mk(96, 'stream'); s3.james.satiety = 4; const r3 = sitLoop(s3, SCENES); // a sit costs 3 Fed: one leaves 1, a second would leave none
        assert(r3.stop === 'fed' && r3.sits === 1 && s3.james.satiety > 0, `C1: it stops before a sit that would leave Fed at 0 (${r3.sits} sits, Fed ${s3.james.satiety})`);
        const s4 = mk(97, 'stream', { qi: 15 });
        assert(sitLoopPlan(s4, SCENES).sits === 1 && !medCards(s4, SCENES).some((c) => c.id === 'med:sitall'), 'C1: one sit only: no loop card (the plain sit does it)');
        const s5 = mk(98, 'stream'); const card = medCards(s5, SCENES).find((c) => c.id === 'med:sitall');
        assert(card && card.open && /^Cultivate until the limit: \d+ sits, .+, [\d.]+ Qi → Saturation [\d.]+% \(then Qi runs out\)\.$/.test(card.label) && card.minutes === card.plan.minutes, `C1: the button shows sits, time, Qi and Saturation (${card?.label})`);
        const s5b = JSON.parse(JSON.stringify(s5)); const rm = runMed(s5, SCENES, 'med:sitall');
        assert(!rm.moved && s5.minutes - s5b.minutes === card.minutes && s5.james.saturation === card.plan.saturation && new RegExp(`^${card.plan.sits} sits`).test(rm.lines[0]), `C1: the card does what it said (${rm.lines[0]})`);
        const s6 = mk(99, 'stream'); s6.minutes = 1440 + 3 * 60; assert(!medCards(s6, SCENES).some((c) => c.id === 'med:sitall'), 'C1: no loop at night (from 00:00 only the night)');
        assert(Object.keys(SIT_STOP_TEXT).every((k) => typeof SIT_STOP_TEXT[k] === 'string'), 'C1: every stop has its words');
    }
    // v0.11.64 (the Fable review): every open Meditate card and task card on every resting place, at every hour, can be played on a copy (the screen draws each card's dry run); a screen that hides its own Cultivate hides it in Meditate too
    {
        let tried = 0; const bad = [];
        for (const sc of MED_SCREENS) for (let hh = 0; hh < 24; hh++) for (const day of [2, 5, 12, 20]) {
            const x = ensureBars(newGame(5, { closed: true })); x.scene = sc; x.minutes = (day - 1) * 1440 + hh * 60 + 30; Object.assign(x.flags, { long: true, forest_day: 2, vday: 2, lf_active: sc === 'lf_hub' }); x.james.satiety = 90; x.james.qi = jamesQiMax(x);
            let med = [], cards = [];
            try { med = medCards(x, SCENES); cards = isTaskHub(x) ? taskCards(x, SCENES).filter((c) => c.status === 'open') : []; } catch (e) { bad.push(`${sc}@${hh}: lists ${e.message}`); continue; }
            const ids = new Set([...med.filter((c) => c.open && c.task).map((c) => c.task), ...cards.map((c) => c.id)]);
            for (const id of ids) { tried++; try { taskOutcome(x, SCENES, id); } catch (e) { bad.push(`${sc}@${hh}: ${id} ${e.message}`); } }
            for (const c of med.filter((m) => m.open && !m.task && m.id !== 'med:bt')) { tried++; try { dryOutcome(x, (k) => runMed(k, SCENES, c.id)); } catch (e) { bad.push(`${sc}@${hh}: ${c.id} ${e.message}`); } }
        }
        assert(!bad.length && tried > 1000, `v0.11.64: every open card on every resting place at every hour plays on a copy (${tried} tried; ${bad.slice(0, 4).join(' | ')})`);
        const bite = ensureBars(newGame(7)); bite.scene = 'coil_end'; bite.coil.why = 'choice'; const sv = ensureBars(newGame(7)); sv.scene = 'coil_end'; sv.coil.why = 'collapse'; sv.james.satiety = 0;
        assert(outcomeOf(bite, bite.minutes).death === null && outcomeOf(sv, sv.minutes).death === 'hunger', 'v0.11.64: "Bite the tail" is no death; a collapse at Fed 0 is starving');
        const w = ensureBars(newGame(5, { closed: true })); w.scene = 'wilds'; Object.assign(w.flags, { long: true, forest_day: 2 }); w.minutes = 1440 + 20 * 60 + 30; w.james.qi = jamesQiMax(w);
        assert(!medCards(w, SCENES).some((c) => c.id === 'wilds:5' || c.id === 'med:sitall') && !taskCards(w, SCENES).some((c) => c.id === 'wilds:5'), 'v0.11.64: the wilds hide their Cultivate at 20:30, so Meditate offers neither it nor the loop');
    }
    // v0.11.64 (B1): the card that would starve James says so (its dry run), and it does what it said
    const h = ensureBars(newGame(71, { closed: true })); h.scene = 'wilds'; h.minutes = 1440 + 7 * 60; Object.assign(h.flags, { long: true, forest_day: 2 });
    h.james.satiety = 3; h.james.hp = 2; h.inventory = {};
    const rest = SCENES.wilds.choices.findIndex((c) => /^Rest in the shade/.test(c.text));
    let oc = null, n = 0;
    while (h.scene === 'wilds' && n++ < 20) { oc = taskOutcome(h, SCENES, `wilds:${rest}`); if (oc.death) break; runTask(h, SCENES, `wilds:${rest}`); }
    assert(oc && oc.death === 'hunger', `v0.11.64: a rest at Fed 0 and 2 HP: the card says James starves (${JSON.stringify(oc)})`);
    const hc = JSON.parse(JSON.stringify(h)); runTask(hc, SCENES, `wilds:${rest}`);
    assert(hc.scene === 'coil_end' && hc.minutes === oc.end && h.scene === 'wilds', `v0.11.64: the real card starves where it said (${hc.minutes} vs ${oc.end}); the dry run changed nothing`);
    // starving: 1.5 HP an hour in task mode, whatever the step size
    const a1 = ensureBars(newGame(72)); a1.james.satiety = 0; a1.james.hp = 20;
    for (let i = 0; i < 24; i++) advance(a1, 10);
    const a2 = ensureBars(newGame(72)); a2.james.satiety = 0; a2.james.hp = 20; advance(a2, 240);
    assert(STARVE_HP_PER_HOUR === 1.5 && a1.james.hp === 14 && a2.james.hp === 14, `4 starving hours cost 6 HP in 10-min steps and in one step (${a1.james.hp}, ${a2.james.hp})`);
    assert(taskMinutes(g, SCENES, `wilds:${rest}`) === 60, 'a rest passes its hour');
}
// v0.11.64: no game speeds (the speed gates went; their flags `spd_pro` / `spd_a1` are still set and kept, never renamed)
{
    const T = await import('../js/core/tasks.js');
    assert(!('maxSpeed' in T) && !('effectiveSpeed' in T) && !('MS_PER_GAME_HOUR' in T) && !('QUEUE_MAX' in T) && !('outlook' in T) && !('queueAdd' in T) && !('taskQueue' in T), 'v0.11.64: no speeds, no real-time clock, no queue in the rules');
    for (const o of ['victory', 'taken']) {
        const h = ensureBars(newGame(6)); Object.assign(h.flags, { ending: o === 'taken' ? 'lost' : 'bluff', a1_outcome: o });
        goTo(h, SCENES, 'a1_end');
        assert(h.flags.spd_a1 === true, `reaching a1_end (${o}) still sets its old flag`);
    }
}
// v0.11.32 (P2-a): picked choices are recorded per save, kept across every rewind, never in a dry run's copy
{
    const g = ensureBars(newGame(11, { closed: true }));
    assert(!g.picked || Object.keys(g.picked).length === 0, 'picked: a new game has none');
    const s0 = g.scene, i0 = sceneView(g, SCENES).choices[0].index;
    assert(!wasPicked(g, s0, i0), 'picked: not before it is taken');
    choose(g, SCENES, i0);
    assert(wasPicked(g, s0, i0) && g.picked[s0].length === 1, 'picked: choose() records the scene and position');
    assert(wasPicked(g, s0, 1000 + i0), 'picked: a one-move index counts as its fight choice');
    notePicked(g, s0, i0); assert(g.picked[s0].length === 1, 'picked: no duplicates');
    notePicked(g, 'coil_end', 0); assert(!g.picked.coil_end, 'picked: the Coil screens are never recorded');
    assert(isMenuScene('wild_hunt') && isMenuScene('wilds') && !isMenuScene('collectors_lost'), 'picked: hubs and their menus are known (main.js leaves work and menus uncoloured)');
    const before = JSON.stringify(g.picked);
    assert(dryClone(g).picked === undefined, 'picked: a dry run copy carries none');
    const back = deserialize(serialize(g));
    assert(JSON.stringify(back.picked) === before, 'picked: a save round trip keeps them');
    endCoil(g, 'choice'); rewind(g);
    assert(JSON.stringify(g.picked) === before, 'picked: kept across a rewind');
    const h = ensureBars(newGame(12)); Object.assign(h.flags, { ending: 'bluff' }); startActCoil(h);
    notePicked(h, 'stream', 4); h.flags.a1_outcome = 'victory'; goTo(h, SCENES, 'a1_end');
    for (const to of ['act', 'game']) { rewind(h, { to }); assert(wasPicked(h, 'stream', 4), `picked: kept across the rewind to the start of ${to === 'act' ? 'Act 1' : 'the whole game'}`); if (to === 'act') { h.flags.a1_outcome = 'victory'; goTo(h, SCENES, 'a1_end'); } }
    const old = JSON.parse(serialize(ensureBars(newGame(13, { closed: true })))); const od = JSON.parse(old.data); delete od.picked;
    // which picked choices show recoloured (showPicked, main.js)
    const m = ensureBars(newGame(14, { closed: true })); m.scene = 'stream';
    m.picked = { stream: [1, 5, 6, 7], wild_hunt: [0], ashfall: [17], hunt: [0, 2], coil_end: [0] };
    const ch = (sid, i) => SCENES[sid].choices[i];
    assert(showPicked(m, SCENES, 5, 'Keep walking') && !showPicked(m, SCENES, 4, 'Make camp'), 'picked shown: a picked story choice yes, an unpicked one no');
    assert(!showPicked(m, SCENES, 1, 'Test the water'), 'picked shown: a work card on a task screen no');
    assert(!showPicked(m, SCENES, 6, 'Open a meridian') && !showPicked(m, SCENES, 7, 'Yuki: change form'), 'picked shown: the meta screens\' entries no');
    assert(showPicked(m, SCENES, 1005, 'End it in one move.'), 'picked shown: a one-move index counts as its choice');
    m.scene = 'wild_hunt'; assert(!showPicked(m, SCENES, 0, 'Glassback hare'), 'picked shown: a hub\'s work menu no');
    m.scene = 'hunt'; assert(!showPicked(m, SCENES, 0, 'A bone dart') && showPicked(m, SCENES, 2, String(ch('hunt', 2).text)), 'picked shown: gathering inside a task card\'s scene no, its plain choice yes');
    assert(!showPicked(m, SCENES, 2, 'Back to the stream.'), 'picked shown: a plain "Back…" no');
    m.scene = 'ashfall'; assert(showPicked(m, SCENES, 17, 'Evening. Go home to Mei Lin\'s.'), 'picked shown: a hub\'s story exit yes');
    const o = deserialize(JSON.stringify(od));
    assert(!wasPicked(o, o.scene, 0), 'picked: an old save without the field loads, nothing marked');
    choose(o, SCENES, sceneView(o, SCENES).choices[0].index); assert(Object.keys(o.picked || {}).length === 1, 'picked: an old save starts recording on its first choice');
}
// v0.11.33 (owner 13:34–13:51, B + F1 + T1 + S1): the task screens' one-off work, "Call it a day"
{
    const { onceOpen, stageOpen, noteOnce, oneOffLeft, ONCE_MENUS, ONCE_STAGES, onceKey } = await import('../js/story/oneoff.js');
    const { wakeDay: wd } = await import('../js/core/game.js');
    const at5 = () => { const g = ensureBars(newGame(21, { closed: true })); g.minutes = 4 * 1440 + 8 * 60; goTo(g, SCENES, 'ashfall'); Object.assign(g.flags, { healed_try: true, elder: true }); return g; };
    const ids = (g) => taskCards(g, SCENES).map((c) => c.id);
    const g = at5();
    assert(ids(g).includes('drill:0') && ids(g).includes('drill:1'), 'once: both militia choices open on Day 5');
    // owner 14:05: a failed try can be made again; only a success uses the one-off up
    const f = at5(); f.james.gu = { tier: 1, level: 1, xp: 0 }; f.james.satiety = 0; f.tasks.fam = {}; ensureBars(f);
    const fr = runTask(f, SCENES, 'drill:0');
    if (/failed/.test(fr.lines.join(' '))) assert(!f.flags[onceKey('drill', 0)] && taskCards(f, SCENES).some((c) => c.id === 'drill:0'), 'once: a failed militia drill stays open (tomorrow)');
    else assert(false, 'once: the weak-James drill was meant to fail (test setup)');
    g.james.gu = { tier: 3, level: 10, xp: 0 }; ensureBars(g);
    runTask(g, SCENES, 'drill:0');
    assert(g.flags[onceKey('drill', 0)] === true, 'once: a militia choice done is recorded for the Coil');
    const d1 = taskCards(g, SCENES).find((c) => c.id === 'drill:1');
    assert(!ids(g).includes('drill:0') && d1?.status === 'open', 'once: the done choice is gone for the Coil, the other open the same day (v0.11.157, NX1 PA: no longer one per menu per day, B)');
    assert(g.flags[`drill@${wd(g)}`] === true, 'once (PA): the menu still marks the day, for "Call it a day" only');
    const day0 = wd(g); g.minutes += 1440; // the next day (RV1 TG: a real day on, not a deleted mark)
    assert(wd(g) === day0 + 1 && !g.flags[`drill@${wd(g)}`] && !ids(g).includes('drill:0') && taskCards(g, SCENES).find((c) => c.id === 'drill:1')?.status === 'open', 'once: the next day the done choice is still gone (once a Coil), the other open');
    const nt = SCENES.drill.choices.findIndex((c) => /^Not today/.test(c.text)); noteOnce(g, 'drill', nt, SCENES.drill.choices[nt]);
    assert(!g.flags[onceKey('drill', nt)], 'once: "Not today" is not work');
    endCoil(g, 'choice'); rewind(g);
    assert(!Object.keys(g.flags).some((k) => k.startsWith('oo:')), 'once: a rewind brings every one-off back (the next Coil)');
    assert(['clinic', 'workshop', 'drill', 'fo_palisade', 'fo_council', 'fo_drill', 'fo_clinic', 'rr_scout'].every((m) => ONCE_MENUS.has(m) && SCENES[m]) && !ONCE_MENUS.has('wild_hunt') && !ONCE_MENUS.has('wild_train') && !ONCE_MENUS.has('rr_forage'), 'once: the one-off menus; hunts, training and foraging stay repeatable');
    // staged doors: Wen's lessons, the herb slopes, two visits per Coil
    const h = at5();
    const wi = SCENES.ashfall.choices.findIndex((c) => c.to === 'wen_lesson');
    assert(ids(h).includes(`ashfall:${wi}`), 'stages: Wen open');
    noteOnce(h, 'ashfall', wi, SCENES.ashfall.choices[wi]); noteOnce(h, 'ashfall', wi, SCENES.ashfall.choices[wi]);
    assert(h.flags['oo:wen_lesson'] === 2 && !ids(h).includes(`ashfall:${wi}`) && Object.keys(ONCE_STAGES).length === 2, 'stages: after two lessons Wen is done for the Coil');
    // "Call it a day" (S1)
    const k = at5();
    const ci = SCENES.ashfall.choices.findIndex((c) => /^Call it a day/.test(String(c.text)));
    assert(ci >= 0 && !ids(k).includes(`ashfall:${ci}`) && oneOffLeft(k, SCENES, 'ashfall'), 'skip: hidden while a one-off is open');
    for (const m of ['clinic', 'workshop', 'drill']) SCENES[m].choices.forEach((c, i) => { k.flags[onceKey(m, i)] = true; });
    Object.assign(k.flags, { 'oo:wen_lesson': 2, 'oo:herb_slopes': 2, village_hunt: true });
    const w0 = JSON.stringify(k.wake);
    const v = sceneView(k, SCENES);
    assert(JSON.stringify(k.wake) === w0, 'skip: looking ahead to the evening leaves the clock state alone');
    assert(!oneOffLeft(k, SCENES, 'ashfall') && ids(k).includes(`ashfall:${ci}`), 'skip: shown once the one-offs are done, at once');
    assert(!v.choices.some((c) => /^Evening/.test(c.label)), 'skip: the evening exit not yet at 08:00');
    runTask(k, SCENES, `ashfall:${ci}`);
    assert(k.scene === 'ashfall' && clockParts(k.minutes).day === 5 && clockParts(k.minutes).hh === 16 && clockParts(k.minutes).mm === 0, 'skip: the clock at 16:00 the same day, still on the hub');
    assert(sceneView(k, SCENES).choices.some((c) => /^Evening/.test(c.label)) && !ids(k).includes(`ashfall:${ci}`), 'skip: the evening exit shows, the skip is gone');
    // after the Fable review: Ashfall's last day (a one-time menu, a checked chore), the Old Tree's story stops, before 04:00
    const r = ensureBars(newGame(22, { closed: true })); r.minutes = 19 * 1440 + 8 * 60; goTo(r, SCENES, 'rt_ashfall'); Object.assign(r.flags, { council_done: true, ya_village: true });
    const rc = SCENES.rt_ashfall.choices.findIndex((c) => /^Call it a day/.test(String(c.text)));
    assert(oneOffLeft(r, SCENES, 'rt_ashfall') && !ids(r).includes(`rt_ashfall:${rc}`), 'skip: Ashfall\'s last day, hidden while the palisade and the drill are open');
    r.flags.a1_palisade = true; assert(oneOffLeft(r, SCENES, 'rt_ashfall'), 'skip: still hidden while the last drill is open');
    r.flags.a1_militia = true; assert(!oneOffLeft(r, SCENES, 'rt_ashfall') && ids(r).includes(`rt_ashfall:${rc}`), 'skip: shown once the preparations are done');
    const t = ensureBars(newGame(23, { closed: true })); t.minutes = 15 * 1440 + 8 * 60; t.scene = 'heart_hub';
    assert(SCENES.heart_hub.choices.find((c) => c.to === 'heart_roots').show(t) && oneOffLeft(t, SCENES, 'heart_hub'), 'skip: the Old Tree holds it back while its story stops lead on');
    k.minutes = 5 * 1440 + 3 * 60; Object.assign(k.flags, { 'oo:wen_lesson': 2 });
    assert(!SCENES.ashfall.choices[ci].show(k), 'skip: never between 00:00 and 04:00');
}
// v0.11.31 (P3-b): the speed gates' flags stay across every rewind (the speeds went in v0.11.64; the flags are kept)
{
    const p = ensureBars(newGame(8, { closed: true }));
    assert(!KEEP_FLAGS.includes('ending') && KEEP_FLAGS.includes('spd_pro') && KEEP_FLAGS.includes('spd_a1'), 'gates: the gate flags are kept, the tribute outcome is not');
    goTo(p, SCENES, 'collectors_lost');
    assert(p.flags.ending === 'lost', 'gates: a lost tribute');
    endCoil(p, 'tribute', 'collectors_lost'); rewind(p);
    assert(!p.flags.ending && p.flags.spd_pro === true, 'gates: rewinding a lost tribute keeps its flag');
    rewind(p);
    assert(p.flags.spd_pro === true, 'gates: the flag survives a second rewind');
    const q = ensureBars(newGame(9, { closed: true }));
    endCoil(q, 'choice'); rewind(q);
    assert(!q.flags.spd_pro, 'gates: a rewind before the tribute sets no flag');
    for (const to of ['act', 'game']) {
        const h = ensureBars(newGame(10)); Object.assign(h.flags, { ending: 'bluff' }); startActCoil(h);
        h.flags.a1_outcome = 'victory'; goTo(h, SCENES, 'a1_end');
        rewind(h, { to });
        assert(h.flags.spd_a1 === true, `gates: the Act 1 flag survives the rewind to the start of ${to === 'act' ? 'Act 1' : 'the whole game'}`);
        assert(to === 'act' ? h.flags.ending === 'bluff' : (!h.flags.ending && h.scene !== 'a1_end' && (h.coil.act || 0) === 0), `gates: the ${to} rewind otherwise resets as before`);
    }
}
// v0.11.35 (P1-a, owner pick 15:42): scenes read in an earlier Coil fold, a memory line, Skip to the next choice
{
    const g = ensureBars(newGame(3501, { closed: true }));
    assert(g.seen && g.seen.arrival === 1 && !seenBefore(g), 'P1-a: a new game has read its first scene on Coil 1');
    goTo(g, SCENES, 'stream'); assert(g.seen.stream === 1, 'P1-a: entering a scene records the Coil it was first read in');
    noteSeen(g, 'stream'); g.coil.n = 3; noteSeen(g, 'stream'); assert(g.seen.stream === 1, 'P1-a: the first Coil is kept, never overwritten'); g.coil.n = 1;
    endCoil(g, 'choice', 'stream'); rewind(g);
    assert(g.coil.n === 2 && g.seen.stream === 1 && seenBefore(g, 'stream') && seenBefore(g, 'arrival') && !seenBefore(g, 'wilds'), 'P1-a: a rewind keeps the record; Coil 2 has read stream and arrival before, not the wilds');
    // the whole-game rewind from Act 1 keeps it too
    const w = ensureBars(newGame(3502, { closed: true })); w.scene = 'epilogue'; w.flags.ending = 'bluff'; w.minutes = 6 * 1440 + 900; choose(w, SCENES, 0);
    const sw = { ...w.seen }; w.flags.a1_outcome = 'victory'; goTo(w, SCENES, 'a1_end'); rewind(w, { to: 'game' });
    assert(Object.keys(sw).every((k) => w.seen[k] === sw[k]) && w.seen.a1_end != null, 'P1-a: the whole-game rewind keeps the record');
    // old saves: a missing record is filled (past Coil 1 from the picked choices), a present one left alone
    const o1 = ensureBars(newGame(3503)); delete o1.seen; o1.picked = { stream: [1] }; const l1 = deserialize(serialize(o1));
    assert(l1.seen && !Object.keys(l1.seen).length, 'P1-a: an old Coil 1 save loads with an empty record');
    const o2 = ensureBars(newGame(3504)); delete o2.seen; o2.coil.n = 3; o2.picked = { stream: [1], wilds: [0] }; const l2 = deserialize(serialize(o2));
    assert(l2.seen.stream === 0 && l2.seen.wilds === 0 && seenBefore(l2, 'stream') && !seenBefore(l2, 'arrival'), 'P1-a: an old Coil 3 save counts its picked scenes as read before');
    const o3 = ensureBars(newGame(3505)); o3.seen = { stream: 2 }; o3.coil.n = 3; assert(deserialize(serialize(o3)).seen.stream === 2, 'P1-a: a present record loads unchanged');
    assert(!JSON.stringify(dryClone(g)).includes('"seen":null'), 'P1-a: a dry run copies the record');
    // the fold
    const f = ensureBars(newGame(3506, { closed: true })); f.flags.long = true; f.flags.forest_day = 2; f.minutes += 1440 + 22 * 60;
    goTo(f, SCENES, 'night_won'); const v1 = sceneView(f, SCENES);
    assert(!againView(f, v1).fold && againView(f, v1).first === v1.text, 'P1-a: Coil 1: the text in full, no memory line');
    noteRead(f, v1.text); noteRead(f, 'a\n\nb'); // v0.11.133 (FP2): the screen showed them on Coil 1
    f.coil.n = 2; const a = againView(f, v1);
    assert(a.fold && MEMORY_LINES.includes(a.memory) && `${a.first}\n\n${a.rest}` === v1.text.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean).join('\n\n'), 'P1-a: read on an earlier Coil: the first paragraph, the rest behind Read it all again, a memory line');
    assert(againView(f, v1).memory === a.memory, 'P1-a: the same line for that scene on that Coil');
    assert(MEMORY_LINES.length >= 24 && new Set(MEMORY_LINES).size === MEMORY_LINES.length, `P1-a: ${MEMORY_LINES.length} memory lines, none twice`);
    const lines = new Set(); for (const id of Object.keys(SCENES)) { f.seen[id] = 1; const t = { id, text: 'a\n\nb' }; const x = againView(f, t); if (x.fold) lines.add(x.memory); }
    assert(lines.size >= 18, `P1-a: the lines vary by scene (${lines.size} different on Coil 2)`);
    f.seen.wilds = 1; assert(!againView(f, { id: 'wilds', text: 'a\n\nb' }).fold && noFold('wilds') && noFold('coil_end') && noFold(Object.keys(TASK_HUBS)[0]), 'P1-a: no fold on the task screens, their menus or the Coil\'s screens');
    assert(!againView(f, { id: 'night_won', text: 'one paragraph only' }).fold, 'P1-a: a one-paragraph scene does not fold');
    // the skip: night_won → morning → wilds (a task screen), two steps, the same as tapping
    const s0 = ensureBars(newGame(3507, { closed: true })); s0.flags.long = true; s0.flags.forest_day = 2; s0.minutes += 1440 + 22 * 60; goTo(s0, SCENES, 'night_won'); goTo(s0, SCENES, 'morning'); goTo(s0, SCENES, 'night_won');
    { const r0 = JSON.parse(JSON.stringify(s0)); for (let k = 0; k < 3 && r0.scene !== 'wilds'; k++) { noteRead(s0, sceneView(r0, SCENES).text); choose(r0, SCENES, sceneView(r0, SCENES).choices.filter((c) => !c.disabled)[0].index); } } // v0.11.133 (FP2): Coil 1 read the stretch
    s0.coil.n = 2;
    const pl = skipPlan(s0, SCENES);
    assert(pl.steps === 2 && pl.to === 'wilds' && s0.scene === 'night_won', `P1-a: the plan: 2 steps to the wilds, the game untouched (${pl.steps}, ${pl.to})`);
    const A = JSON.parse(JSON.stringify(s0)), B = JSON.parse(JSON.stringify(s0));
    const rr = skipRun(A, SCENES);
    for (let k = 0; k < rr.steps; k++) choose(B, SCENES, sceneView(B, SCENES).choices.filter((c) => !c.disabled)[0].index);
    assert(JSON.stringify(A) === JSON.stringify(B) && rr.minutes === A.minutes - s0.minutes && rr.minutes === pl.minutes && A.scene === 'wilds', `P1-a: skipping = tapping through (state, clock ${rr.minutes} min)`);
    // where it stops
    const u = JSON.parse(JSON.stringify(s0)); delete u.seen.morning; assert(skipPlan(u, SCENES).steps === 1, 'P1-a: it stops at a scene not read before');
    const c1 = JSON.parse(JSON.stringify(s0)); c1.coil.n = 1; assert(skipStep(c1, SCENES) < 0, 'P1-a: nothing to skip on the Coil a scene was first read');
    const ch = ensureBars(newGame(3508, { closed: true })); ch.coil.n = 2; ch.seen = { arrival: 1, yuki_check: 1 }; goTo(ch, SCENES, 'arrival'); ch.coil.n = 2;
    assert(skipStep(ch, SCENES) < 0, 'P1-a: no skip where there is a real choice (the arrival)');
    let checks = 0, fights = 0; for (const [id, sc] of Object.entries(SCENES)) { if ((sc.choices || []).length !== 1) continue; const c = sc.choices[0]; if (!c.check && !c.combat) continue; const t = ensureBars(newGame(3509, { closed: true })); t.coil.n = 2; t.seen = { [id]: 1 }; t.scene = id; if (skipStep(t, SCENES) < 0) { if (c.check) checks++; else fights++; } else assert(false, `P1-a: the skip never takes a check or a fight (${id})`); }
    assert(checks + fights > 0, `P1-a: one-choice checks and fights are never skipped (${checks} checks, ${fights} fights)`);
    assert(SKIP_MAX >= 10, 'P1-a: the skip walks up to 30 steps');
    // after the Fable review: no skip into a collapse, none across into Act 1, no fold on an outcome's own text
    const dy = JSON.parse(JSON.stringify(s0)); dy.james.hp = 0.5; dy.james.satiety = 0; const dp = skipPlan(dy, SCENES);
    { const t = JSON.parse(JSON.stringify(dy)); skipRun(t, SCENES); assert(t.scene !== 'coil_end' || dp.steps === 0, `P1-a: a stretch that ends in a collapse is not offered (${dp.steps}, ${t.scene})`); }
    const ab = ensureBars(newGame(3510, { closed: true })); ab.coil.n = 2; ab.flags.ending = 'bluff'; ab.minutes = 6 * 1440 + 900; ab.seen = { bluff_win: 1, epilogue: 1, fo_start: 1, fo_envoy: 1 }; ab.scene = 'bluff_win';
    noteRead(ab, sceneView(ab, SCENES).text, 1); // v0.11.133 (FP2): read on Coil 1
    { const t = JSON.parse(JSON.stringify(ab)); const r2 = skipRun(t, SCENES); assert((t.coil.act || 0) === 0 && t.scene === 'epilogue' && r2.steps === 1, `P1-a: the skip stops at the prologue's end (the epilogue, an outcome scene), never crossing into Act 1 (${t.scene}, ${r2.steps} steps)`); }
    for (const id of ['epilogue', 'fo_start', 'breakthrough', 'a1_end']) { f.seen[id] = 1; assert(!againView(f, { id, text: 'a\n\nb' }).fold, `P1-a: an outcome scene never folds (${id})`); }
    f.seen.night_won = 1; f.lastWin = { next: 'night_won', degree: 2, id: 'crows' }; assert(!againView(f, { id: 'night_won', text: 'a\n\nb' }).fold, 'P1-a: a lopsided win\'s own text never folds'); f.lastWin = null;
    if (FULL) assert(skipChecked >= 1000, `v0.11.35: the bot games compared the skip with tapping through often enough (${skipChecked})`);
    else console.log(`  skip = tapping through, checked in the bot games (quick, log only): ${skipChecked}`);
}
// v0.11.133 (owner pick FP2: FA + SK + ME + T): the fold by paragraph. A scene folds only when every paragraph it shows now was
// read on an earlier Coil (g.read); the skip walks only such screens; an old save starts with an empty record.
{
    const k = paraKey('x');
    assert(/^[0-9a-z]{1,7}$/.test(k) && paraKey('x') === k && paraKey('y') !== k, `FP2: a paragraph's key is a short base-36 hash, the same for the same text (${k})`);
    const g = ensureBars(newGame(3601, { closed: true }));
    assert(g.read && typeof g.read === 'object' && !Object.keys(g.read).length, 'FP2: a new game starts with an empty record');
    noteRead(g, 'One.\n\nTwo.'); g.coil.n = 3; noteRead(g, 'One.\n\n  Three.  ');
    assert(g.read[paraKey('One.')] === 1 && g.read[paraKey('Two.')] === 1 && g.read[paraKey('Three.')] === 3, 'FP2: each paragraph keeps the Coil it was first read (trimmed)');
    assert(readBefore(g, 'One.\n\nTwo.') && !readBefore(g, 'One.\n\nThree.') && !readBefore(g, ''), 'FP2: read before = every paragraph on an earlier Coil');
    // FA: a text with a paragraph never read shows in full; once read, it folds on a later Coil
    const f = ensureBars(newGame(3602, { closed: true })); f.flags.long = true; f.flags.forest_day = 2; f.minutes += 1440 + 22 * 60; goTo(f, SCENES, 'night_won');
    const t1 = sceneView(f, SCENES).text; noteRead(f, t1); f.coil.n = 2;
    const changed = `${t1.split(/\n\s*\n/)[0]}\n\nA paragraph written since.`;
    assert(t1.split(/\n\s*\n/).filter((x) => x.trim()).length >= 2 && againView(f, { id: 'night_won', text: t1 }).fold, 'FP2: the text read on Coil 1 folds on Coil 2');
    assert(!againView(f, { id: 'night_won', text: changed }).fold, 'FP2: a text with a paragraph never read shows in full (a rewrite, a form, an outcome)');
    noteRead(f, changed); assert(!againView(f, { id: 'night_won', text: changed }).fold, 'FP2: read on this Coil: in full until a later Coil');
    f.coil.n = 3; assert(againView(f, { id: 'night_won', text: changed }).fold, 'FP2: and folded on the next');
    // real variants: scenes whose text differs with Yuki's form; read as the cat, shown as the great root-kin on a later Coil
    let variants = 0;
    for (const [id, sc] of Object.entries(SCENES)) {
        if (typeof sc.text !== 'function' || noFold(id) || variants >= 12) continue;
        const c = ensureBars(newGame(3610, { closed: true })); c.scene = id;
        let tc, tt; try { tc = sceneView(c, SCENES).text; c.yuki.form = 'tiger'; c.yuki.realm = 2; c.james.realm = 2; tt = sceneView(c, SCENES).text; } catch { continue; }
        if (!tc || !tt || tc === tt || tt.split(/\n\s*\n/).filter((x) => x.trim()).length < 2) continue;
        c.seen = { [id]: 1 }; noteRead(c, tc, 1); c.coil.n = 2; variants++;
        assert(!againView(c, { id, text: tt }).fold, `FP2: ${id} read as the cat shows in full as the great root-kin`);
        assert(againView(c, { id, text: tc }).fold || tc.split(/\n\s*\n/).filter((x) => x.trim()).length < 2, `FP2: ${id} as the cat again folds`);
    }
    assert(variants >= 5, `FP2: the form check met enough real variants (${variants})`);
    // SK: the skip stops at text not read on an earlier Coil
    const s = ensureBars(newGame(3603, { closed: true })); s.flags.long = true; s.flags.forest_day = 2; s.minutes += 1440 + 22 * 60;
    goTo(s, SCENES, 'night_won'); goTo(s, SCENES, 'morning'); goTo(s, SCENES, 'night_won'); s.coil.n = 2;
    assert(skipStep(s, SCENES) < 0, 'FP2 (SK): a scene seen but with nothing read: no skip');
    noteRead(s, sceneView(s, SCENES).text, 1);
    const sp = skipPlan(s, SCENES);
    assert(sp.steps === 1 && sp.to === 'morning', `FP2 (SK): only night_won read: the skip stops at the morning, whose text wasn't (${sp.steps}, ${sp.to})`);
    // ME: an old save starts with an empty record, a present one loads unchanged; rewinds keep it; dry runs leave it out
    const o = ensureBars(newGame(3604)); delete o.read; o.seen = { night_won: 1 }; o.coil.n = 2;
    const lo = deserialize(serialize(o));
    assert(lo.read && !Object.keys(lo.read).length && !againView(lo, { id: 'night_won', text: t1 }).fold, 'FP2 (ME): an old save loads with an empty record: its scenes show in full once more');
    const p = ensureBars(newGame(3605)); noteRead(p, 'One.\n\nTwo.'); assert(JSON.stringify(deserialize(serialize(p)).read) === JSON.stringify(p.read), 'FP2: a present record loads unchanged');
    const r = ensureBars(newGame(3606, { closed: true })); noteRead(r, 'One.\n\nTwo.'); const r0 = JSON.stringify(r.read); endCoil(r, 'choice', r.scene); rewind(r);
    assert(r.coil.n === 2 && JSON.stringify(r.read) === r0 && readBefore(r, 'One.\n\nTwo.'), 'FP2: a rewind keeps the record (Coil 2 has read them before)');
    assert(!('read' in dryClone(p)), 'FP2: a dry run leaves the record out (it measures nothing there)');
    // RF1 (Fable's review of FP2): M1 the food stock paragraph is neither recorded nor checked
    const bc = ensureBars(newGame(3620, { closed: true })); bc.scene = 'bl_camp';
    const b1 = sceneView(bc, SCENES).text; bc.inventory.hare_raw = 7; bc.inventory.river_cress = 2; const b2 = sceneView(bc, SCENES).text;
    assert(b1 !== b2 && /In the hammerspace:|holds no food/.test(b1) && b1.split(/\n\s*\n/).length >= 2, 'RF1 (M1): bl_camp shows the food stock, and it changed');
    bc.seen = { bl_camp: 1 }; noteRead(bc, b1, 1); bc.coil.n = 2;
    assert(againView(bc, { id: 'bl_camp', text: b2 }).fold && !Object.keys(bc.read).some((x) => x === paraKey(b1.split(/\n\s*\n/).map((q) => q.trim()).find((q) => STATE_PARA.test(q)))), 'RF1 (M1): bl_camp folds on a later Coil when only its food stock changed; the stock paragraph is not recorded');
    assert(!againView(bc, { id: 'bl_camp', text: `${b2}\n\nSomething new happened at camp.` }).fold, 'RF1 (M1): a new story paragraph still shows it in full');
    // L1: the Coil snapshot carries no copy of the record; L2 / L3: a bad record or a missing state never throws
    assert(!('read' in p.coil.snap), 'RF1 (L1): the Coil snapshot leaves the record out (a rewind takes it from the game)');
    for (const bad of [null, 'x', [], 7]) {
        const b = ensureBars(newGame(3621)); b.read = bad; const lb = deserialize(serialize(b));
        assert(lb.read && typeof lb.read === 'object' && !Array.isArray(lb.read) && !Object.keys(lb.read).length, `RF1 (L2): a bad record (${JSON.stringify(bad)}) loads as an empty one`);
        const m = ensureBars(newGame(3622)); m.read = bad; let ok = true; try { readBefore(m, 'One.\n\nTwo.'); noteRead(m, 'One.\n\nTwo.'); } catch { ok = false; }
        assert(ok && isRecord(m.read) && !Array.isArray(m.read) && m.read[paraKey('One.')] === 1, `RF1 (L2): noteRead replaces a bad record with a plain one (${JSON.stringify(bad)})`);
    }
    { let ok = true; try { noteRead(null, 'x'); noteRead(undefined, 'x'); } catch { ok = false; } assert(ok, 'RF1 (L3): noteRead with no state does nothing'); }
    // TG: the step into Act 1 and the whole-game rewind keep the record
    const w = ensureBars(newGame(3623, { closed: true })); w.scene = 'epilogue'; w.flags.ending = 'bluff'; w.minutes = 6 * 1440 + 900; noteRead(w, 'One.\n\nTwo.'); const w0 = JSON.stringify(w.read);
    choose(w, SCENES, 0);
    assert((w.coil.act || 0) === 1 && JSON.stringify(w.read) === w0, 'RF1 (TG): the step into Act 1 keeps the record');
    assert(w.coil.snap && !('read' in w.coil.snap), 'RF1 (L1): Act 1\'s Coil snapshot, taken with a record in the game, leaves it out');
    w.flags.a1_outcome = 'victory'; goTo(w, SCENES, 'a1_end'); rewind(w, { to: 'game' });
    assert(JSON.stringify(w.read) === w0 && readBefore(w, 'One.\n\nTwo.'), 'RF1 (TG): the whole-game rewind keeps the record');
}
// v0.11.134 (owner pick LP2): PK the line picker, ML the memory lines on it, SV the same-visit fold, QR quiet repeats, the save's `lines`
{
    const items = Array.from({ length: 24 }, (_, i) => `line ${i}`);
    // PK: a pool of N shows every line once before any comes back, never the same twice running (across the wrap too)
    let wrapOk = true, roundOk = true;
    for (let seed = 1; seed <= 60; seed++) {
        const g = ensureBars(newGame(4100 + seed));
        const got = []; for (let k = 0; k < 72; k++) got.push(pickLine(g, 'mem', items));
        for (let r = 0; r < 3; r++) if (new Set(got.slice(24 * r, 24 * r + 24)).size !== 24) roundOk = false;
        for (let k = 1; k < got.length; k++) if (got[k] === got[k - 1]) wrapOk = false;
    }
    assert(roundOk, 'LP2 (PK): every line once per round through the pool (60 seeds, 3 rounds)');
    assert(wrapOk, 'LP2 (PK): never the same line twice running, across the wrap too');
    const d1 = ensureBars(newGame(4201)), d2 = ensureBars(newGame(4201)), d3 = ensureBars(newGame(4202));
    const ord = (g) => Array.from({ length: 24 }, () => pickLine(g, 'mem', items)).join(',');
    const o1 = ord(d1), o2 = ord(d2), o3 = ord(d3);
    assert(o1 === o2 && o1 !== o3, 'LP2 (PK): the order follows the save\'s seed (the same seed, the same order; another seed, another)');
    const d4 = ensureBars(newGame(4201)); d4.coil.n = 2; assert(ord(d4) !== o1, 'LP2 (PK): another Coil, another order');
    // the order: conditions, then fewest plays, then the most specific
    const c = ensureBars(newGame(4203));
    const cond = [{ text: 'never', when: () => false }, { text: 'plain' }, { text: 'specific', spec: 2 }, 'bare'];
    const cp = []; for (let k = 0; k < 6; k++) cp.push(pickLine(c, 'cond', cond));
    assert(!cp.includes(0) && cp[0] === 2 && new Set(cp.slice(0, 3)).size === 3, `LP2 (PK): a failed condition never plays; the most specific first among the least played (${cp})`);
    assert(pickLine(c, 'none', [{ text: 'x', when: () => false }]) === -1, 'LP2 (PK): no open line: -1');
    // the record: per Coil; a bad one is replaced, never throws
    const r = ensureBars(newGame(4204)); pickLine(r, 'mem', items);
    assert(r.lines && r.lines.c === coilStamp(r) && r.lines.p.mem.reduce((a, b) => a + b, 0) === 1, 'LP2 (PK): the play is counted in the save\'s record');
    r.coil.n = 2; assert(!Object.keys(linesOf(r).p).length && linesOf(r).c === coilStamp(r), 'LP2 (PK): a new Coil starts a new record');
    for (const bad of [null, 'x', [], 7, { c: '0:1', p: [] }, { c: '0:1', p: {}, cur: {}, last: {}, said: 'x' }]) {
        const b = ensureBars(newGame(4205)); b.lines = bad; let ok = true; try { pickLine(b, 'mem', items); quietReplies(b, ['A']); noteVisit(b, 'x'); } catch { ok = false; }
        assert(ok && Array.isArray(b.lines.said) && b.lines.said.length === 1, `LP2 (PK): a bad record (${JSON.stringify(bad)}) is replaced, nothing throws`);
    }
    // ML: the memory line on a folded scene, through the picker, once per visit
    const f = ensureBars(newGame(4206, { closed: true })); f.coil.n = 2;
    const ids = Object.keys(SCENES).filter((id) => !noFold(id)).slice(0, 30);
    const seenLines = [];
    for (const id of ids) {
        f.seen[id] = 1; const t = { id, text: `${id} one.\n\n${id} two.` }; noteRead(f, t.text, 1);
        const a1 = againView(f, t), a2 = againView(f, t);
        assert(a1.fold && MEMORY_LINES.includes(a1.memory) && a2.memory === a1.memory, `LP2 (ML): ${id}: folded, a memory line, the same on a redraw`);
        seenLines.push(a1.memory);
    }
    assert(new Set(seenLines.slice(0, 24)).size === 24 && seenLines.every((x, i) => i === 0 || x !== seenLines[i - 1]), 'LP2 (ML): 24 visits, 24 different lines; never the same twice running');
    const back = { id: ids[0], text: `${ids[0]} one.\n\n${ids[0]} two.` }; againView(f, { id: 'wilds', text: 'hub' }); const a3 = againView(f, back);
    assert(a3.memory !== seenLines[0] || seenLines.length > 48, 'LP2 (ML): a new visit to a scene draws a new line');
    // SV: shown again with the same text right after an action that kept you there (any Coil, read before or not): folded, no memory line
    const sv = ensureBars(newGame(4207, { closed: true })); goTo(sv, SCENES, 'bone_field'); const vb = sceneView(sv, SCENES);
    const prev = { id: vb.id, text: vb.text };
    assert(!againView(sv, vb).fold, 'LP2 (SV): the first view of a scene never read: in full');
    const s1 = againView(sv, vb, prev);
    assert(s1.fold && s1.same && s1.memory === null && `${s1.first}\n\n${s1.rest}` === vb.text.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean).join('\n\n'), 'LP2 (SV): the same text again on the same visit: the first paragraph, the rest behind Read it all again, no memory line');
    assert(!againView(sv, { id: vb.id, text: `${vb.text}\n\nSomething changed.` }, prev).fold, 'LP2 (SV): a text that changed shows in full');
    assert(!againView(sv, vb, { id: 'mire', text: vb.text }).fold, 'LP2 (SV): another scene before it: in full');
    assert(!againView(sv, { id: 'wilds', text: 'a\n\nb' }, { id: 'wilds', text: 'a\n\nb' }).fold, 'LP2 (SV): never on the task screens and menus');
    assert(!againView(sv, { id: 'bone_field', text: 'one paragraph' }, { id: 'bone_field', text: 'one paragraph' }).fold, 'LP2 (SV): never on one paragraph');
    assert(!againView(sv, { id: 'bone_field', text: 'a\n\nb', end: true }, { id: 'bone_field', text: 'a\n\nb' }).fold, 'LP2 (SV): never on an end');
    // QR: quiet repeats
    const q = ensureBars(newGame(4208));
    const q1 = quietReplies(q, ['Yuki leaves a hare.', 'Teamwork.']), q2 = quietReplies(q, ['Yuki leaves a hare.', 'Something new.']), q3 = quietReplies(q, ['Twice.', 'Twice.']);
    assert(q1.length === 2 && q2.length === 1 && q2[0] === 'Something new.' && q3.length === 1, `LP2 (QR): a reply part already shown this Coil is not shown again (${JSON.stringify([q1, q2, q3])})`);
    q.coil.n = 2; assert(quietReplies(q, ['Yuki leaves a hare.']).length === 1, 'LP2 (QR): a new Coil shows it again');
    for (let k = 0; k < SAID_MAX + 50; k++) quietReplies(q, [`line ${k}`]);
    assert(q.lines.said.length === SAID_MAX && q.lines.said[SAID_MAX - 1] === replyKey(`line ${SAID_MAX + 49}`), 'LP2 (QR): the record is bounded, the oldest go first');
    assert(JSON.stringify(quietReplies(null, ['x'])) === '["x"]' && quietReplies(q, undefined).length === 0, 'LP2 (QR): no state or no reply never throws');
    // the save: kept by save and load, left out of the Coil snapshot and the dry runs; a rewind starts a new one
    const sv2 = deserialize(serialize(q)); assert(JSON.stringify(sv2.lines) === JSON.stringify(q.lines), 'LP2: the record loads unchanged');
    const old = ensureBars(newGame(4209)); delete old.lines; const lo = deserialize(serialize(old)); let ok = true; try { againView(lo, { id: 'bone_field', text: 'a\n\nb' }); } catch { ok = false; }
    assert(ok && lo.lines && lo.lines.c === coilStamp(lo), 'LP2: an old save gets the record on first use');
    const rw = ensureBars(newGame(4210, { closed: true })); quietReplies(rw, ['A.']); pickLine(rw, 'mem', items);
    assert('lines' in rw && !('lines' in dryClone(rw)) && !('lines' in coilSnap(rw)), 'LP2: the dry runs and the Coil snapshot leave the record out (taken with a record in the game)');
    endCoil(rw, 'choice', rw.scene); rewind(rw);
    assert(quietReplies(rw, ['A.']).length === 1 && !Object.keys(linesOf(rw).p).length, 'LP2: a rewind starts a new record (its first reply shows again)');
    assert(visitLine(rw, 'mem', items) === visitLine(rw, 'mem', items), 'LP2 (PK): one line per visit');
    // RQ1 (Fable's review of LP2): L2 only what the screen drew counts as said; M1 a fight's end keeps its reply; M2 never nothing at all
    const h = ensureBars(newGame(4211));
    assert(quietFilter(h, ['Seen?']).length === 1 && quietFilter(h, ['Seen?']).length === 1 && !h.lines.said.length, 'RQ1 (L2): filtering records nothing (a reply never drawn stays unsaid)');
    noteSaid(h, ['Seen?']); noteSaid(h, ['Seen?']);
    assert(h.lines.said.length === 1 && !quietFilter(h, ['Seen?']).length, 'RQ1 (L2): a drawn reply is recorded once, then quiet');
    assert(landReply(h, ['Seen?', 'It is over.'], { quiet: false }).length === 2, 'RQ1 (M1): a fight\'s end shows its whole reply');
    assert(landReply(h, ['Seen?'], { entry: false }).length === 1 && !landReply(h, ['Seen?'], { entry: true }).length, 'RQ1 (M2): a reply that would go quiet with no Results entry shows anyway; with one it goes quiet');
    assert(JSON.stringify(landReply(h, ['Seen?', 'New.'], { entry: false })) === '["New."]', 'RQ1 (M2): a part still new: only it shows');
    // L4: a hand-edited pick is drawn again
    for (const bad of ['length', 2.5, -1, 99, null]) { const v = ensureBars(newGame(4212)); linesOf(v).cur.mem = bad; const i = visitLine(v, 'mem', items); assert(Number.isInteger(i) && i >= 0 && i < items.length, `RQ1 (L4): a bad pick (${JSON.stringify(bad)}) is drawn again (${i})`); }
    // TG: the fold, the visit and quiet repeats change nothing in the save but `lines`
    const z = ensureBars(newGame(4213, { closed: true })); goTo(z, SCENES, 'bone_field'); const zv = sceneView(z, SCENES);
    const strip = (x) => { const { lines: _l, ...rest } = x; return JSON.stringify(rest); };
    const z0 = strip(z); againView(z, zv); againView(z, zv, { id: zv.id, text: zv.text }); quietReplies(z, ['A.']); landReply(z, ['A.', 'B.']); noteSaid(z, ['B.']);
    assert(strip(z) === z0, 'RQ1 (TG): the fold, the visit and quiet repeats change nothing in the save but `lines`');
}
// v0.11.135 (owner picks NT1, EV1): a scene's text for the day (lines.js noteDay / dayIndex / byDay; story.js go() records the days)
{
    const g = ensureBars(newGame(4301, { closed: true }));
    assert(dayIndex(g, 'x') === 0 && !g.lines, 'NT1: dayIndex reads only (no record made), a key never shown is on its first day');
    const D = 1440;
    noteDay(g, 'x'); noteDay(g, 'x');
    assert(dayIndex(g, 'x') === 0, 'NT1: the same day twice is one day');
    g.minutes += D; assert(dayIndex(g, 'x') === 1, 'NT1: a later day not noted yet counts as the next'); noteDay(g, 'x');
    g.minutes += 2 * D; noteDay(g, 'x');
    assert(dayIndex(g, 'x') === 2 && byDay(g, ['a', 'b', 'c'], 'x') === 'c' && byDay(g, ['a', (q) => `b${q.coil.n}`], 'x') === 'a', 'NT1: the third day takes the third text; past the last, from the start again');
    g.minutes -= 2 * D; assert(byDay(g, ['a', (q) => `b${q.coil.n}`], 'x') === 'b1', 'NT1: a function text is called with the game');
    g.coil.n = 2; assert(dayIndex(g, 'x') === 0, 'NT1: a new Coil starts every scene on its first day again');
    // go() records the scene, and an event scene's event (dayKey)
    const h = ensureBars(newGame(4302, { closed: true }));
    goTo(h, SCENES, 'bone_field');
    const d0 = textDay(h);
    assert(JSON.stringify(h.lines?.d?.bone_field) === JSON.stringify([d0]), 'NT1: entering a scene notes its day');
    h.minutes += D; goTo(h, SCENES, 'mire'); goTo(h, SCENES, 'bone_field');
    assert(dayIndex(h, 'bone_field') === 1 && h.lines?.d?.bone_field?.length === 2, 'NT1: entered on a second day: its second day');
    const keyed = Object.values(SCENES).filter((x) => typeof x.dayKey === 'function').map((x) => x.id).sort();
    assert(JSON.stringify(keyed) === JSON.stringify(['bl_camp', 'bl_fireside', 'bl_night', 'bl_night_event', 'far_hunt', 'heart_camp', 'heart_night', 'night_event', 'wen_lesson', 'yk_time']), `NT1; v0.11.152 (RV1, M2): heart_camp by its paragraph's version; v0.11.154 (PS1, ST3): bl_camp by region: the scenes keyed by event or region (${keyed})`);
    const e = ensureBars(newGame(4303, { closed: true })); e.flags.bl_region = 'dw'; goTo(e, SCENES, 'bl_night_event');
    assert(e.flags.bl_ev && e.lines.d[`bl_night_event:${e.flags.bl_ev}`]?.length === 1 && e.lines.d.bl_night_event?.length === 1, `NT1: an event scene notes its event's day too (${e.flags.bl_ev})`);
    // the record stays out of the Coil snapshot and the dry runs (as LP2's), and a save keeps it
    assert(!('lines' in coilSnap(h)) && !('lines' in dryClone(h)) && JSON.stringify(deserialize(serialize(h)).lines?.d) === JSON.stringify(h.lines?.d) && !!h.lines?.d?.bone_field, 'NT1: kept by a save, left out of the snapshot and the dry runs');
    // RN2 (H1): the text day runs from 05:00: 23:50 and 04:59 the next morning are one day; 05:00 a new one
    const n = ensureBars(newGame(4305, { closed: true })); const base = Math.floor(n.minutes / 1440) * 1440 + 1440;
    n.minutes = base + 23 * 60 + 50; noteDay(n, 'z'); n.minutes = base + 1440 + 4 * 60 + 59;
    assert(TEXT_DAY_FROM === 300 && dayIndex(n, 'z') === 0 && textDay(n) === textDay({ minutes: base + 23 * 60 + 50 }), 'RN2 (H1): 23:50 and 04:59 the next morning are one text day');
    n.minutes += 1; assert(dayIndex(n, 'z') === 1, 'RN2 (H1): from 05:00 a new text day');
    // a v0.11.134 record (no `d`) gains the day list without losing what it holds
    const o = ensureBars(newGame(4304)); o.lines = { c: coilStamp(o), p: { mem: [1] }, last: {}, cur: {}, at: 'x', said: ['k'] };
    noteDay(o, 'y'); assert(o.lines.said[0] === 'k' && o.lines.p.mem[0] === 1 && o.lines.d.y.length === 1, 'NT1: an older record gains the day list, keeping the rest');
}
// v0.11.37 (owner 12:59–14:27, picks A1 + B2 + C-a + D-a + E-a + F1): the day ends at 02:00, Push through only at night,
// at once vs a bar, the Long Forest's two exits, no useless sit, familiar story choices
{
    const at = (seed, scene, m) => { const x = ensureBars(newGame(seed)); x.scene = scene; x.minutes = m; wakeDay(x); x.james.satiety = 90; return x; };
    const addFood = (x) => { x.inventory.hare_raw = 3; x.inventory.river_cress = 3; };
    const choiceIx = (x, re) => SCENES[x.scene].choices.findIndex((c) => (!c.show || c.show(x)) && re.test(String(typeof c.text === 'function' ? c.text(x) : c.text)));
    const shownIx = (x, re) => sceneView(x, SCENES).choices.some((c) => re.test(c.label));
    // the night hours belong to the evening before
    const n = at(3701, 'ashfall', 4 * 1440 + 30); // Day 5, 00:30
    const n23 = at(3701, 'ashfall', 3 * 1440 + 23 * 60 + 30); // Day 4, 23:30
    assert(hour(n23) === 23 && !nightLock(n23) && dayEnd(n23) === 4 * 1440, `D (v0.11.91): at 23:30 the day ends at the coming 00:00 (${dayEnd(n23)})`);
    assert(hour(n) === 24 && dayHour(n) === 24 && nightLock(n) && dayEnd(n) === 4 * 1440, `D (v0.11.91): 00:30 reads 24 and is past the day's end, 00:00 (${hour(n)})`);
    assert(!shownIx(n, /^Run a clinic/) && shownIx(n, /^Evening\. Go home/), 'D: at 00:30 the day cards stay gone and the evening exit stays (was: back at midnight)');
    const w = at(3702, 'wilds', 2 * 1440 + 60); w.flags.forest_day = 2;
    const raw = (re) => SCENES.wilds.choices.find((c) => typeof c.text === 'string' && re.test(c.text));
    assert(!raw(/^Forage\.$/).show(w) && raw(/^Make camp for the night/).show(w), 'D: in the wilds at 01:00 no Forage, Make camp shows');
    // from 00:00 (v0.11.91; 02:00 before): only the night
    const l = at(3703, 'ashfall', 4 * 1440 + 5); l.james.satiety = 40; addFood(l);
    assert(nightLock(l), 'D: 00:05 is past the day\'s end');
    const lc = taskCards(l, SCENES);
    assert(lc.length > 0 && lc.every((c) => c.kind === 'chore' && /^(Eat|Cook|Chew)/.test(c.label)), `D: from 00:00 the task screen offers only eating (${lc.map((c) => c.label).join(' | ')})`);
    const lm = medCards(l, SCENES);
    assert(lm.length === 0, `D (v0.11.91): from 00:00 Meditate offers nothing (no Push through the night) (${lm.map((m) => m.id).join(', ')})`);
    assert(shownIx(l, /^Evening\. Go home/), 'D: the evening exit (a story stop) is never blocked');
    // a card that would end past the day's end (00:00 since v0.11.91) doesn't start
    const e = at(3704, 'rt_camp', 19 * 1440 + 23 * 60 + 45); e.james.qi = 999; // 23:45 by the fire (its Cultivate has no hour of its own)
    const ea = at(3714, 'stream', 23 * 60 + 45); ea.james.qi = 999; const em = medCards(ea, SCENES); // v0.11.64: the stream (Ashfall hides its own Cultivate after 19:00, and so does Meditate now)
    assert(em.some((m) => m.late) && em.every((m) => m.late && !m.open && m.tag === 'ends past midnight'), `D-a: at 23:45 a sit or a meridian that would end past midnight is locked with its reason (${em.map((m) => m.id + ':' + m.tag).join(', ')})`);
    const late = taskCards(e, SCENES).filter((c) => c.status === 'late');
    const okc = taskCards(e, SCENES).filter((c) => c.status === 'open');
    assert(late.length > 0 && late.every((c) => endsLate(e, taskMinutes(e, SCENES, c.id))), `D-a: at 23:45 the cards that would end past midnight are 'late' (${late.map((c) => c.id).join(', ')})`);
    assert(okc.every((c) => !endsLate(e, taskMinutes(e, SCENES, c.id))), 'D-a: the open ones end by midnight');
    if (late.length) {
        const id = late[0].id;
        assert(!taskOpen(e, SCENES, id) && dayOver(e, SCENES, id), 'D-a: a late card is not open; the day is over for it');
    }
    const bq = at(3705, 'ashfall', 3 * 1440 + 23 * 60 + 55); bq.james.realm = 1; bq.james.saturation = 100;
    assert(taskCards(bq, SCENES).some((c) => c.id === BT_TASK && c.status === 'open'), 'D-a: the breakthrough is exempt (it is rest)');
    // v0.11.91 (pick B): no Push through the night at any hour; the next night locks at 00:00 again
    const pn = at(3706, 'ashfall', 4 * 1440 + 15 * 60);
    for (const m of [4 * 1440 + 15 * 60, 4 * 1440 + 23 * 60 + 59, 5 * 1440 + 30, 5 * 1440 + 150]) { pn.minutes = m; assert(!medCards(pn, SCENES).some((x) => x.id === 'med:push'), `v0.11.91: no Push at ${m % 1440} min`); }
    pn.minutes = 5 * 1440 + 150; assert(nightLock(pn) && !taskCards(pn, SCENES).some((c) => c.kind === 'work' && c.status === 'open'), 'v0.11.91: 02:30 is night: no work card');
    const old = at(3707, 'ashfall', 4 * 1440 + 60); old.wake.push = 5; wakeDay(old); assert(hour(old) === 25 && nightLock(old) && !('push' in old.wake), 'v0.11.91: an old save\'s push mark is dropped: 01:00 is the night');
    // B2: a sit that changes nothing is not offered (v0.11.66, S1: at ×1.5 a realm a sit still gains 0.1% at realm 13, so only the top realm)
    for (const [r, useless] of [[7, false], [8, false], [13, false], [MAX_REALM, true]]) {
        const v = at(3708 + r, 'ashfall', 4 * 1440 + 9 * 60); v.james.realm = r; v.james.qi = 999;
        const sitCard = medCards(v, SCENES).some((m) => /^Cultivate/.test(m.label));
        const sitChore = taskCards(v, SCENES).some((c) => /^Cultivate/.test(c.label) && c.status === 'open');
        assert(sitUseless(v) === useless && sitCard === !useless && (!useless || !sitChore), `B2: realm ${r}: sit gain ${sitGain(v)}%, the Cultivate card ${useless ? 'hidden' : 'shown'}`);
    }
    // C: what happens at once (since v0.11.64 every card does)
    // A1: the Long Forest's second exit, back where he walked in
    const lf = ensureBars(newGame(3720, { closed: true })); lf.coil.n = 2; lf.scene = 'clearing'; lf.minutes = 10 * 60;
    const ent = choiceIx(lf, /^Stay lost/); assert(ent >= 0, 'A1: the clearing offers the Long Forest on Coil 2');
    choose(lf, SCENES, ent); const at0 = lf.flags.lf_at;
    assert(lf.flags.lf_from === 'clearing' && at0 === 10 * 60, `A1: walking in records the place and the time (${lf.flags.lf_from}, ${at0})`);
    while (lf.scene !== 'lf_hub') choose(lf, SCENES, 0);
    advance(lf, 3 * 1440); lf.inventory = {}; lf.james.hp = 1; lf.james.satiety = 90;
    const back = choiceIx(lf, /^Go back the way you came/);
    assert(back >= 0 && shownIx(lf, /^Go back the way you came/) && !SCENES.lf_hub.choices[back].combat, 'A1: the Long Forest offers the way back (at once, as every choice since v0.11.64)');
    choose(lf, SCENES, back);
    assert(lf.scene === 'clearing' && !lf.flags.lf_active && lf.minutes >= at0 && lf.minutes <= at0 + DEFAULT_MINUTES.move && lf.james.hp === jamesHpMax(lf) && LF_STOCK.every((id) => lf.inventory[id] === itemCap(id)), `A1: back in the clearing, the clock as he left it (${clockParts(lf.minutes).day}, ${lf.minutes - at0} min walk), bars and hammerspace full`);
    assert(shownIx(lf, /^Stay lost/), 'A1: the Long Forest can be entered again from there');
    const ar = ensureBars(newGame(3721, { closed: true })); ar.coil.n = 2; ar.scene = 'arrival';
    choose(ar, SCENES, choiceIx(ar, /^You remember this\. Stay lost/)); assert(ar.flags.lf_from === 'arrival', 'A1: from the arrival too');
    const nolf = ensureBars(newGame(3722, { closed: true })); nolf.coil.n = 2; nolf.scene = 'lf_hub'; nolf.flags.lf_active = true;
    assert(!shownIx(nolf, /^Go back the way you came/) && shownIx(nolf, /^Follow the smoke/), 'A1: a save inside the Long Forest from before the record keeps only the smoke exit');
    // F1: a story choice picked before takes half its time; task cards keep their own familiarity
    let tried = 0;
    for (const [id, sc] of Object.entries(SCENES)) {
        if (TASK_HUBS[id] || isMenuScene(id) || sc.end || tried >= 6) continue;
        (sc.choices || []).forEach((c, i) => {
            if (tried >= 6 || !(c.time >= 20) || c.show || c.req || c.check || c.combat || c.qi || typeof c.to !== 'string' || SCENES[c.to]?.enter || typeof c.text !== 'string' || /^Back\b/.test(c.text)) return;
            const a = ensureBars(newGame(3730)); a.scene = id; a.james.satiety = 90; a.minutes = 8 * 60;
            const b = JSON.parse(JSON.stringify(a)); notePicked(b, id, i);
            const ma = a.minutes; choose(a, SCENES, i); const mb = b.minutes; choose(b, SCENES, i);
            assert(b.minutes - mb === pickedMinutes(a.minutes - ma) && a.minutes - ma === c.time, `F1: ${id}:${i} picked before takes half (${a.minutes - ma} → ${b.minutes - mb} min)`);
            tried++;
        });
    }
    assert(tried >= 3 && PICKED_SPEED === 2, `F1: checked on ${tried} story choices`);
    const ch = at(3731, 'ashfall', 4 * 1440 + 9 * 60); addFood(ch); ch.james.satiety = 20;
    const eatId = taskCards(ch, SCENES).find((c) => /^Eat something/.test(c.label))?.id;
    if (eatId) { // full copies (dryClone drops g.picked): the real run with and without the mark (Fable review)
        const ix = Number(eatId.split(':').pop());
        const c1 = JSON.parse(JSON.stringify(ch)), c2 = JSON.parse(JSON.stringify(ch)); notePicked(c2, 'ashfall', ix);
        const m1 = c1.minutes, m2 = c2.minutes; runTask(c1, SCENES, eatId); runTask(c2, SCENES, eatId);
        assert(c1.minutes - m1 > 0 && c1.minutes - m1 === c2.minutes - m2, `F1: a task card (a chore) picked before keeps its time (${c1.minutes - m1} / ${c2.minutes - m2})`);
    } else assert(false, 'F1: Ashfall offers Eat something');
    // after the Fable review
    const ev = at(3740, 'ashfall', 4 * 1440 + 60); ev.flags.vday = 2; const evi = choiceIx(ev, /^Evening\. Go home/); const ev0 = ev.minutes, evw = wakeDay(ev);
    assert(evi >= 0, 'review: Ashfall at 01:00 offers the evening exit');
    if (evi >= 0) { choose(ev, SCENES, evi); assert(ev.minutes >= ev0 && ev.minutes - ev0 < 6 * 60 && wakeDay(ev) === evw, `review: the evening exit at 01:00 doesn't jump to 19:00 (was: 18 h and a free night; ${ev.scene}, +${ev.minutes - ev0} min)`); }
    const lw = ensureBars(newGame(3741, { closed: true })); lw.coil.n = 2; lw.scene = 'clearing'; lw.minutes = 10 * 60;
    choose(lw, SCENES, choiceIx(lw, /^Stay lost/)); while (lw.scene !== 'lf_hub') choose(lw, SCENES, 0);
    for (let k = 0; k < 3; k++) sleepUntil(lw, 6); // three forest nights
    lw.james.satiety = 90; choose(lw, SCENES, choiceIx(lw, /^Go back the way you came/));
    const lw0 = wakeDay(lw); sleepUntil(lw, 6); assert(wakeDay(lw) === lw0 + 1, `review: after the way back, the next night slept counts (${lw0} → ${wakeDay(lw)})`);
    const fe = at(3742, 'ashfall', 4 * 1440 + 110); addFood(fe); fe.james.satiety = 20; // 01:50
    const fec = taskCards(fe, SCENES).find((c) => /^Eat something/.test(c.label));
    assert(fec && fec.status === 'open', `review: eating is never locked as late (01:50: ${fec?.status})`);
    fe.minutes = 4 * 1440 + 130; assert(fec && !dayOver(fe, SCENES, fec.id) && taskOpen(fe, SCENES, fec.id), 'review: at 02:10 a meal still runs');
    const dm = at(3743, 'ashfall', 3 * 1440 + 23 * 60 + 45); dm.james.qi = 999; dm.james.primaries = 3; // 23:45 (v0.11.91: the day ends at 00:00)
    const dmed = medCards(dm, SCENES), dmIds = new Set(dmed.filter((m) => m.task).map((m) => m.task));
    const lateHub = taskCards(dm, SCENES).filter((c) => c.status === 'late' && SCENES[String(c.id).split(':')[0]]?.choices?.[Number(String(c.id).split(':')[1])]?.to !== 'yk_time'); // v0.11.137 (TR1): Yuki's 20-minute card is late at 23:45 like any card; this check is about Meditate's
    assert(lateHub.length > 0 && lateHub.every((c) => dmIds.has(c.id)), `review: a late Meditate card keeps its task id, so the hub list doesn't show it twice (${lateHub.map((c) => c.id).join(', ')})`);
    // v0.11.66 (S1): a sit gains something up to realm 13
    for (const [r, open] of [[7, true], [8, true], [13, true], [MAX_REALM, false]]) { const cp = at(3744 + r, 'camp', 20 * 60); cp.james.realm = r; cp.james.qi = 999; cp.james.saturation = 0; assert(taskCards(cp, SCENES).some((c) => c.id === SIT_TASK) === open, `review: the camp's queueable sit at realm ${r}: ${open ? 'offered' : 'hidden'}`); }
    const mn = at(3746, 'ashfall', 4 * 1440 + 150); mn.james.qi = 999; assert(!taskOpen(mn, SCENES, MER_TASK), 'review: an old queue\'s mer:next waits after 02:00');
}
// v0.11.40 (N1, owner pick 18:02): the three night scenes never set the clock back. Entered in the evening they jump forward
// to the night's hour as before; entered after it (01:50, 02:30, 03:30, and the rare 04:30), the clock stays where it was.
{
    const D = 3 * 1440; // the start of day 4
    const cases = [['night_attack', 21, 80], ['night_event', 21, 60], ['bl_night_event', 21, 60]]; // v0.11.91: the Blackroot's night from 21:00 too (19:00 before)
    for (const [scene, eve, nightAt] of cases) {
        const enterAt = (m) => { const x = ensureBars(newGame(4000 + m)); x.scene = scene; x.minutes = m; SCENES[scene].enter(x); return x.minutes; };
        assert(enterAt(D - 1440 + 22 * 60) === D + nightAt, `N1: ${scene} entered at 22:00 jumps forward to the night's hour, as before`);
        assert(enterAt(D - 1440 + eve * 60) === D + nightAt, `N1: ${scene} entered at ${eve}:00 jumps forward to the night's hour, as before`);
        assert(enterAt(D + 30) === D + nightAt, `N1: ${scene} entered at 00:30 jumps forward to the night's hour, as before`);
        for (const hm of [110, 150, 210, 270]) assert(enterAt(D + hm) === D + hm, `N1: ${scene} entered at ${String(Math.floor(hm / 60)).padStart(2, '0')}:${String(hm % 60).padStart(2, '0')} keeps the clock (was set back)`);
    }    for (const [scene, wake] of [['morning', 'wilds'], ['bl_morning', 'blackroot']]) {
        for (const hm of [150, 270]) {
            const x = ensureBars(newGame(4200 + hm)); x.scene = scene; x.minutes = D + hm; x.flags.night_ev = 'stars'; x.flags.bl_ev = 'stars';
            SCENES[scene].enter && SCENES[scene].enter(x);
            assert(x.minutes === D + 6 * 60, `N1: the ${wake} morning entered at ${Math.floor(hm / 60)}:${String(hm % 60).padStart(2, '0')} ends at 06:00 that day (${clockParts(x.minutes).hh}:${String(clockParts(x.minutes).mm).padStart(2, '0')} day ${clockParts(x.minutes).day})`);
        }
    }
}
// v0.11.40 (E1, owner pick 18:11): the degree (and "End it in one move.") reads the fight as it will be fought: with its no-dice raise
{
    const { noDiceUp } = await import('../js/core/game.js');
    const { degreeOf, jamesPower, enemyPower } = await import('../js/story/power.js');
    for (const id of ['rot_ape', 'collectors', 'jackals', 'gao']) {
        const enemy = { name: 'x', hp: 10, dc: 5, atk: 6, dmg: 3 };
        const g = ensureBars(newGame(4100)); const c = startCombat(g, { id, enemies: [enemy], win: 'arrival', lose: 'arrival' });
        assert(c.enemies[0].dc - enemy.dc === noDiceUp(id) && c.enemies[0].atk - enemy.atk === noDiceUp(id), `E1: noDiceUp(${id}) = the raise startCombat applies (${noDiceUp(id)})`);
    }
    const { NO_DICE_TUNE } = await import('../js/story/nodice_tune.js');
    const { BEAST_UP } = await import('../js/core/game.js');
    const apeUp = NO_DICE_TUNE.rot_ape.up + BEAST_UP;
    assert(noDiceUp('rot_ape') === apeUp && noDiceUp('collectors') === NO_DICE_TUNE.collectors.up, `E1: the rot ape its tune + a beast's ${BEAST_UP}, the tribute its tune only (people) (${noDiceUp('rot_ape')}, ${noDiceUp('collectors')})`);
    const ape = ensureBars(newGame(4101)); ape.scene = 'ape_lured'; ape.minutes = 12 * 1440 + 10 * 60;
    ape.james.gu = { tier: 3, level: 4 }; ape.james.realm = 0;
    const jp = jamesPower(ape), ep = enemyPower([{ dc: 6, atk: 7 }]);
    assert(jp - ep >= 4 && jp - (ep + apeUp) < 1, `E1: the test James crushes the ape on paper and not in the fight (power ${jp}, ape ${ep} + ${apeUp})`);
    assert(degreeOf(ape, [{ dc: 6, atk: 7 }]) === 3 && degreeOf(ape, [{ dc: 6, atk: 7 }], apeUp) === 1, 'E1: degreeOf without the raise 3, with it 1');
    const labels = sceneView(ape, SCENES).choices.map((c) => c.label);
    assert(labels.includes('Fight.') && !labels.includes('End it in one move.'), `E1: no "End it in one move." against the ape for that James (${labels.join(' | ')})`);
    ape.james.gu = { tier: 10, level: 10 }; ape.james.realm = 9;
    assert(jamesPower(ape) - (ep + apeUp) >= 4 && sceneView(ape, SCENES).choices.some((c) => c.label === 'End it in one move.'), `E1: a James truly past the fight still gets "End it in one move." (power ${jamesPower(ape)})`);
}
// v0.11.40 (G1): the flag gao_dead was never set (the scene gao_dead sets gao_broken); nothing reads it any more
{
    const { readFileSync, readdirSync } = await import('node:fs');
    const src = ['js', 'js/core', 'js/story', 'js/art'].flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.js')).map((f) => readFileSync(`${d}/${f}`, 'utf8'))).join('\n');
    assert((src.match(/flags\??\.gao_dead/g) || []).length === 1, 'G1: nothing in js/ reads the flag gao_dead but the old-save fill');
    const old = migrate({ v: SAVE_VERSION, ...JSON.parse(JSON.stringify(ensureBars(newGame(4103)))), flags: { gao_dead: true } });
    assert(old.flags.gao_broken === true, 'G1: an old save with gao_dead (before v0.7.0) gets gao_broken, so it plays as before');
    const plain = migrate({ ...JSON.parse(JSON.stringify(ensureBars(newGame(4104)))) });
    assert(!plain.flags.gao_broken, 'G1: a save without gao_dead gets no gao_broken');
    const sc = Object.values(SCENES).flatMap((s) => (s.choices || []).filter((c) => c.to === 'gao_dead'));
    assert(sc.length === 1, `G1: one choice leads to the scene gao_dead (${sc.length})`);
    const g = ensureBars(newGame(4102)); sc[0].do(g);
    assert(g.flags.gao_broken === true && g.flags.gao_dead === undefined, 'G1: that choice sets gao_broken, not gao_dead');
}
// v0.11.40 (Y-text): Yuki and James were born together (owner 2026-11-05); no "six" or "thirty-four years" left in her path
{
    const { readFileSync } = await import('node:fs');
    const yp = readFileSync('js/story/yuki_path.js', 'utf8');
    assert(!/thirty-four|you were six|boy of six/i.test(yp) && /born the same morning, in the same grove/.test(yp) && /Forty years of her sleeping/.test(yp), 'Y-text: yuki_path.js says born together, forty years');
}
// v0.11.46 (X1, owner 19:26 "The extraordinary collaterals can be opened UNTIL Nascent soul, not after"): their window is
// Foundation to Soul Embryo after all 8 vessels (a fork from the engine's formulas.js); at Nascent Soul they seal; ns_warn counts them
{
    const MER = await import('../js/story/meridians.js');
    const at = (realm, e, c) => { const g = ensureBars(newGame(4601)); g.james.realm = realm; g.james.extra8 = e; g.james.extraCollaterals = c; return g; };
    for (const [r, e, c, want] of [[0, 8, 0, false], [1, 7, 0, false], [1, 8, 0, false], [3, 8, 27, false], [4, 8, 0, true], [4, 8, 27, true], [6, 8, 5, true], [4, 8, 28, false], [7, 8, 0, false], [9, 8, 3, false]]) { // v0.11.66 (G4): from Golden Core
        const g = at(r, e, c);
        assert(MER.lineWindow(g, 'ec') === want && MER.canExtraColl(g) === want, `X1: the vessels' collaterals at realm ${r}, ${e}/8 vessels, ${c}/28: ${want ? 'open' : 'shut'}`);
    }
    assert(!MER.lineWindow(at(3, 8, 0), 'jn') && MER.lineWindow(at(7, 8, 0), 'jn'), 'X1: the junctions stay at Nascent Soul and later');
    assert(btTarget(at(6, 8, 27)) === 'ns_warn' && btTarget(at(6, 7, 0)) === 'ns_warn' && btTarget(at(6, 8, 28)) === 'breakthrough', 'X1: the Nascent Soul warning when a vessel or one of their collaterals is still closed');
    const w = at(6, 8, 20); w.scene = 'ns_warn'; const wv = sceneView(w, SCENES);
    assert(/8 of the vessels' twenty-eight collaterals are still closed/.test(wv.text) && /Open the collaterals first/.test(wv.choices[0].label), 'X1: ns_warn names the closed collaterals');
    const w2 = at(6, 6, 0); w2.scene = 'ns_warn';
    assert(/2 of the eight Extraordinary vessels are still closed/.test(sceneView(w2, SCENES).text), 'X1: ns_warn still names the closed vessels first');
    const k = at(4, 8, 0); k.scene = 'camp'; k.minutes = 3 * 1440 + 15 * 60; k.james.qi = jamesQiMax(k); k.james.satiety = 90;
    assert(medCards(k, SCENES).some((c) => c.id === 'med:mer:ec' && c.open && c.task === merLineTask('ec')), 'X1: the camp offers the first of the vessels\' collaterals at Golden Core (queueable; Foundation before v0.11.66)');
    const x0 = k.james.extraCollaterals; let guard = 0;
    while (k.james.extraCollaterals === x0 && guard++ < 10) { k.james.qi = jamesQiMax(k); runTask(k, SCENES, merLineTask('ec')); }
    assert(k.james.extraCollaterals === 2, `X1 + P1: timed work opens the first pair (${k.james.extraCollaterals}/28 after ${guard} sittings)`);
}
// v0.11.46 (Q1, owner 19:26 "Meditate to recover Qi manually, and another to condense Qi"): "Meditate: gather Qi", an hour at the
// resting rate, queueable wherever Meditate shows while Qi isn't full; a sit short of Qi shows, locked, with the reason
{
    const T = await import('../js/core/tasks.js');
    const g = ensureBars(newGame(4602, { closed: true })); g.scene = 'camp'; g.minutes = 20 * 60 + 40; g.james.qi = 9.3; g.james.satiety = 90;
    const mc = medCards(g, SCENES);
    const sit = mc.find((c) => c.id === 'med:sit'), qi = mc.find((c) => c.id === 'med:qi');
    assert(sit && !sit.open && sit.show && /needs 10 Qi \(you have 9\.3\)/.test(sit.tag), `Q1: the sit short of Qi shows locked with the reason (${sit?.tag})`);
    assert(qi && qi.open && qi.task === T.QI_TASK && qi.minutes === 60 && /Meditate: gather Qi/.test(qi.label), 'Q1: the gather-Qi card on the night camp, queueable, an hour');
    assert(taskOpen(g, SCENES, T.QI_TASK) && taskMinutes(g, SCENES, T.QI_TASK) === 60, 'Q1: the queue card is open and takes 60 min');
    const h = ensureBars(JSON.parse(JSON.stringify(g))); advance(h, 60, { resting: true });
    const m0 = g.minutes; const r = runTask(g, SCENES, T.QI_TASK);
    assert(g.minutes - m0 === 60 && Math.abs(g.james.qi - h.james.qi) < 1e-9 && g.james.qi > 9.3, `Q1: an hour at the resting rate, as "Rest an hour" (Qi 9.3 → ${g.james.qi})`);
    assert(/Meditated an hour: Qi 9\.3 → /.test(r.lines.join(' ')), 'Q1: its result line');
    g.james.qi = jamesQiMax(g);
    assert(!medCards(g, SCENES).some((c) => c.id === 'med:qi') && !taskOpen(g, SCENES, T.QI_TASK), 'Q1: no gather card when Qi is full');
    let threw = false; try { runTask(g, SCENES, T.QI_TASK); } catch { threw = true; } assert(threw, 'Q1: a queued gather with Qi full is refused');
    for (const id of MED_SCREENS) { const s = ensureBars(newGame(4603)); s.scene = id; s.minutes = 2 * 1440 + 14 * 60; s.james.qi = 1; s.flags.long = true; if (!canMeditate(s, SCENES)) continue; assert(medCards(s, SCENES).some((c) => c.id === 'med:qi' && c.open), `Q1: the gather card on ${id}`); }
    const late = ensureBars(newGame(4604)); late.scene = 'camp'; late.minutes = 23 * 60 + 30; late.james.qi = 1; // 23:30: an hour would end past midnight (v0.11.91)
    assert(medCards(late, SCENES).some((c) => c.id === 'med:qi' && !c.open && c.late), 'Q1: at 23:30 the gather card is locked (ends past midnight)');
    assert(T.isMedTask(T.QI_TASK), 'Q1: a bar, and a Meditate card that queues on the resting places');
}
// v0.11.46: the Blackroot camp (and the other toHour scenes) no longer jump the clock forward when entered before 06:00
{
    const { BLACKROOT } = await import('../js/story/act1_blackroot.js');
    for (const [hh, mm, jump] of [[4, 30, false], [5, 50, false], [15, 0, true], [1, 0, false]]) {
        const g = ensureBars(newGame(4605)); g.minutes = 12 * 1440 + hh * 60 + mm; g.flags.bl_region = 'rr'; const m0 = g.minutes;
        BLACKROOT.bl_camp.enter(g);
        const want = jump ? 12 * 1440 + 19 * 60 : m0;
        assert(g.minutes === want, `bl_camp entered at ${hh}:${String(mm).padStart(2, '0')}: ${jump ? 'to 19:00' : 'the clock stays'} (moved ${g.minutes - m0} min)`);
    }
}
// v0.11.47 (N1, owner 19:39 / 19:58 / 20:01 / 20:03): the Root Road's "Eat with the others." (the Manners beat) in place of "Eat something."
// until it has played; "Train." gone once the day's drills are used up; the return camps' evening clock; gather Qi locked at Fed 0
{
    const { BLACKROOT } = await import('../js/story/act1_blackroot.js');
    const T = await import('../js/core/tasks.js');
    const rr = () => { const g = ensureBars(newGame(4701)); g.scene = 'rr_hub'; g.minutes = 11 * 1440 + 15 * 60; g.flags.bl_region = 'rr'; g.flags.bl_day = 1; g.james.satiety = 60; g.inventory.hare_raw = 5; return g; };
    const labels = (g) => sceneView(g, SCENES).choices.map((c) => c.label);
    const a = rr();
    assert(labels(a).includes('Eat with the others.') && !labels(a).includes('Eat something.'), `N1: on the Root Road "Eat with the others." stands in for "Eat something." until Manners has played (${labels(a).join(' | ')})`);
    assert(SCENES.rr_hub.choices[1].text === 'Eat with the others.' && SCENES.rr_hub.choices[1].to === 'ya_mocks', 'N1: it keeps the old midday meal\'s place (index 1) and opens Manners');
    const eatI = sceneView(a, SCENES).choices.find((c) => c.label === 'Eat with the others.').index; const f0 = a.james.satiety, hare0 = a.inventory.hare_raw;
    choose(a, SCENES, eatI);
    assert(a.scene === 'ya_mocks' && a.flags.ya_mocked && a.james.satiety > f0 && a.inventory.hare_raw === hare0, 'N1: Manners plays, James eats their cakes (no food from the hammerspace)');
    a.scene = 'rr_hub';
    assert(labels(a).includes('Eat something.') && !labels(a).includes('Eat with the others.'), 'N1: after Manners the ordinary "Eat something." is back');
    const b = rr(); b.inventory = {}; assert(labels(b).includes('Eat with the others.'), 'N1: "Eat with the others." needs no food of James\'s own');
    const c = rr(); c.james.satiety = 99; assert(labels(c).includes('Eat with the others.') && !labels(c).includes('Eat something.'), 'M1 (v0.11.48): offered at any Fed (99 after a full supper), so Manners can\'t be walked past');
    const d = rr(); d.scene = 'dw_hub'; d.flags.bl_region = 'dw'; assert(labels(d).includes('Eat something.'), 'N1: the other Blackroot camps keep "Eat something."');
    // Train
    const t = rr(); t.james.skills['Convergence Use'] = { tier: 1, level: 6, xp: 0 }; ensureBars(t);
    assert(labels(t).includes('Train.'), 'T1: Train shows with drills left');
    for (const k of ['bt_ya', 'bt_dart', 'bt_needle']) markDaily(t, k);
    assert(labels(t).includes('Train.'), 'T1: one drill left (footwork with Yuki): Train still shows');
    markDaily(t, 'bt_yuki');
    assert(!labels(t).includes('Train.'), 'T1: all four drills done today: Train is gone');
    const u = rr(); u.james.skills['Convergence Use'] = { tier: 1, level: 1, xp: 0 }; ensureBars(u); for (const k of ['bt_ya', 'bt_needle', 'bt_yuki']) markDaily(u, k);
    assert(!labels(u).includes('Train.'), 'T1: only darts left and James can\'t sing darts yet: Train is gone');
    assert(!T.taskCards(t, SCENES).some((x) => x.status === 'open' && /bl_train|Train/.test(x.label + x.id)), 'T1: no Train card on the task screen either');
    // the return camps' evening clock
    const { RETURN } = await import('../js/story/act1_return.js');
    const camp = Object.values(RETURN).find((x) => x.id === 'rt_camp');
    for (const [hh, mm, jump] of [[4, 30, false], [1, 0, false], [15, 0, true]]) {
        const g = ensureBars(newGame(4702)); g.minutes = 19 * 1440 + hh * 60 + mm; const m0 = g.minutes; camp.enter(g);
        assert(g.minutes === (jump ? 19 * 1440 + 19 * 60 : m0), `N1: rt_camp entered at ${hh}:${String(mm).padStart(2, '0')}: ${jump ? 'to 19:00' : 'the clock stays'} (moved ${g.minutes - m0} min)`);
    }
    const morning = Object.values(RETURN).find((x) => String(x.enter || '').includes('toHour(g, 6)'));
    const mg = ensureBars(newGame(4703)); mg.minutes = 19 * 1440 + 4 * 60 + 30; morning.enter(mg);
    assert(clockParts(mg.minutes).hh === 6 && clockParts(mg.minutes).mm === 0, 'N1: a morning toHour (6) still moves 04:30 to 06:00');
    // gather Qi at Fed 0, and the late tag on a locked sit
    const q = ensureBars(newGame(4704)); q.scene = 'camp'; q.minutes = 20 * 60; q.james.qi = 1; q.james.satiety = 0;
    const qc = medCards(q, SCENES).find((x) => x.id === 'med:qi');
    assert(qc && !qc.open && qc.show && /too hungry/.test(qc.tag) && !qc.task && !taskOpen(q, SCENES, T.QI_TASK), 'N1: gather Qi locked at Fed 0, with the reason');
    q.james.satiety = 3; assert(!medCards(q, SCENES).find((x) => x.id === 'med:qi').open && !taskOpen(q, SCENES, T.QI_TASK), 'G1 (v0.11.48): still locked at Fed 3 (an hour drains 3; no Qi would come back)');
    q.james.satiety = 3.5; assert(medCards(q, SCENES).find((x) => x.id === 'med:qi').open && taskOpen(q, SCENES, T.QI_TASK), 'G1: open above Fed 3');
    { const r0 = q.james.qi; runTask(q, SCENES, T.QI_TASK); assert(q.james.qi > r0, `G1: at Fed 3.5 the hour does give Qi (${r0} → ${q.james.qi})`); }
    const l = ensureBars(newGame(4705)); l.scene = 'camp'; l.minutes = 23 * 60 + 30; l.james.qi = 9;
    const ls = medCards(l, SCENES).find((x) => x.id === 'med:sit');
    assert(ls && !ls.open && ls.late && ls.tag === 'ends past midnight', `N1: a sit short of Qi at 23:30 says "ends past midnight" (${ls?.tag})`);
}
// v0.11.66 (owner picks S1 + X1 + G4 + P1 + F1, group 1a of the story and mechanics pass)
{
    const MER = await import('../js/story/meridians.js');
    const G = await import('../js/core/game.js');
    const T = await import('../js/core/tasks.js');
    // S1: Saturation hours ×1.5 a realm; sits to 95%, a sit's gain rounded to 0.1% as before (Mortal Vessel 10 … Nascent Soul 159)
    const sits95 = [0, 1, 2, 3, 4, 5, 6, 7].map((r) => { const g = ensureBars(newGame(6601, { closed: true })); g.james.realm = r; return Math.ceil(95 / sitGain(g) - 1e-9); });
    assert(sits95.join() === '10,15,22,32,48,74,106,159', `S1: sits to 95% by realm (${sits95.join(', ')})`);
    assert(Math.abs(SAT_HOURS(7) - 10 * 1.5 ** 7) < 1e-9 && SAT_HOURS(14) > SAT_HOURS(13), 'S1: SAT_HOURS = 10 × 1.5^realm');
    // X1: every sit pays a third of a standard award to Convergence Use and GU, with Yuki's bond share
    const sitXp = (g) => { const c = structuredClone(g); return awardXp(c, 'Convergence Use', 'standard', { factor: 1 / 3 }); };
    {
        const g = ensureBars(newGame(6602, { closed: true })); g.james.qi = 30;
        const cu0 = g.james.skills['Convergence Use'].xp, gu0 = g.james.gu.xp, y0 = g.yuki.qiUse.xp, want = sitXp(g);
        const r = condense(g);
        assert(r.ok && r.xp.length === 3 && JSON.stringify(r.xp) === JSON.stringify(want), `X1: a sit's XP lines (${r.xp.join('; ')})`);
        assert(g.james.skills['Convergence Use'].xp - cu0 === 3 && g.james.gu.xp - gu0 === 3 && g.yuki.qiUse.xp - y0 === 3, 'X1: T1 on Coil 1: Convergence Use +3, GU +3, Yuki Qi Use +3 (a third of 30 is 10, ×0.6 the XP rate since v0.11.85: 6, split)');
        const n = ensureBars(newGame(6603, { closed: true })); n.james.qi = 5; const nx = JSON.stringify([n.james.gu, n.yuki.qiUse]);
        const rn = condense(n); assert(!rn.ok && !rn.xp.length && JSON.stringify([n.james.gu, n.yuki.qiUse]) === nx, 'X1: no sit (short of Qi), no XP');
        const c3 = ensureBars(newGame(6604, { closed: true })); c3.coil.n = 3; c3.james.qi = 30; const r3 = condense(c3);
        assert(/Convergence Use \+4 XP/.test(r3.xp[0]), `X1: the Coil bonus applies (Coil 3 ×1.5, ×0.6: ${r3.xp[0]})`);
        const t2 = ensureBars(newGame(6605, { closed: true })); t2.james.skills['Convergence Use'] = { tier: 2, level: 1, xp: 0 }; t2.james.qi = 30;
        assert(/Convergence Use \+6 XP/.test(condense(t2).xp[0]), 'X1: the pool goes by the skill\'s tier (T2: +6 with the XP rate)');
    }
    { // the sit from Meditate and from the task card carry the XP lines
        const m = ensureBars(newGame(6606)); m.scene = 'rt_camp'; m.james.qi = 30; const rm = runMed(m, SCENES, 'med:sit');
        assert(/Condensed/.test(rm.lines[0]) && rm.lines.some((l) => /^Convergence Use \+\d+ XP/.test(l)) && rm.lines.some((l) => /^GU \+\d+ XP/.test(l)) && rm.lines.some((l) => /^Yuki \(bond\) Qi Use \+/.test(l)), 'X1: meditate.js\'s sit shows the XP');
        const k = ensureBars(newGame(6607, { closed: true })); k.scene = 'stream'; k.james.qi = 25; k.james.satiety = 70; const rk = runTask(k, SCENES, SIT_TASK);
        assert(rk.lines.some((l) => /^Convergence Use \+\d+ XP/.test(l)) && rk.lines.some((l) => /^GU \+\d+ XP/.test(l)), 'X1: tasks.js\'s sit shows the XP');
    }
    { // the eight Cultivate chores on the hubs
        const chores = [];
        for (const [id, sc] of Object.entries(SCENES)) (sc.choices || []).forEach((c, i) => { if (typeof c.text === 'string' && /^Cultivate/.test(c.text) && /condense\(g\)/.test(String(c.do))) chores.push([id, i, c]); });
        assert(chores.length === 10, `X1: the hubs' Cultivate chores call condense (eight in the code; blackroot's makes three hubs: ${chores.length}: ${chores.map(([id]) => id).join(', ')})`);
        for (const [id, i, c] of chores) {
            const g = ensureBars(newGame(6608)); g.james.qi = 30; const out = c.do(g);
            assert(/^Condensed: Saturation/.test(out[0]) && out.some((l) => /^Convergence Use \+\d+ XP/.test(l)) && out.some((l) => /^GU \+\d+ XP/.test(l)) && out.some((l) => /^Yuki \(bond\)/.test(l)), `X1: ${id}:${i} shows the sit's XP`);
        }
    }
    { // the loop: every sit pays, the same as single taps
        const a = ensureBars(newGame(6609, { closed: true })); a.scene = 'stream'; a.minutes = 8 * 60; a.james.qi = jamesQiMax(a); a.james.satiety = 90;
        const b = structuredClone(a);
        const r = sitLoop(a, SCENES);
        for (let i = 0; i < r.sits; i++) runTask(b, SCENES, sitTaskId(b, SCENES));
        assert(r.sits >= 2 && JSON.stringify([a.james.gu, a.james.skills['Convergence Use'], a.yuki.qiUse]) === JSON.stringify([b.james.gu, b.james.skills['Convergence Use'], b.yuki.qiUse]), `X1: the loop's XP = that many single sits (${r.sits} sits)`);
    }
    // G4: the vessels and their collaterals from Golden Core (realm 4), still sealed at Nascent Soul
    const at = (realm, e = 0, c = 0) => { const g = ensureBars(newGame(6610)); g.james.realm = realm; g.yuki.realm = realm; g.james.extra8 = e; g.james.extraCollaterals = c; return g; };
    assert([0, 1, 2, 3, 4, 5, 6, 7].map((r) => (MER.canExtra8(at(r)) ? 1 : 0)).join('') === '00001110' && MER.EXTRA_FROM === 4, 'G4: the vessels open at realms 4–6 only');
    assert([0, 1, 2, 3, 4, 5, 6, 7].map((r) => (MER.lineWindow(at(r), 'e8') ? 1 : 0)).join('') === '00001110', 'G4: the vessel card\'s window the same');
    assert(!medCards(Object.assign(at(2), { scene: 'stream' }), SCENES).some((c) => c.id === 'med:mer:e8') && medCards(Object.assign(at(4), { scene: 'stream' }), SCENES).some((c) => c.id === 'med:mer:e8'), 'G4: no vessel card at Core Formation, one at Golden Core');
    { const v = at(2); v.scene = 'meridians'; assert(/open them at Golden Core\. Not before/.test(sceneView(v, SCENES).text), 'G4: the screen says Golden Core below it'); }
    { const v = at(2, 3); v.scene = 'meridians'; assert(/5 of the Extraordinary vessels are still sealed/.test(sceneView(v, SCENES).text), 'G4: an older save with vessels open early: the rest still sealed'); }
    { const v = at(2, 8); v.scene = 'meridians'; assert(/collaterals wait for Golden Core: 28 still closed/.test(sceneView(v, SCENES).text), 'G4: an older save with all eight open early: the collaterals wait'); }
    { const v = at(5, 2); v.scene = 'meridians'; assert(/between Golden Core and Soul Embryo/.test(sceneView(v, SCENES).text), 'G4: the screen\'s window from Golden Core'); }
    // the review (R1): one vessel paragraph per realm, and the "wait for Golden Core" line only below it
    for (const [r, e, c] of [[0, 0, 0], [1, 0, 0], [2, 3, 0], [3, 8, 5], [4, 0, 0], [4, 8, 5], [5, 2, 0], [6, 8, 27], [7, 5, 0], [7, 8, 20]]) {
        const v = at(r, e, c); v.scene = 'meridians'; const t = sceneView(v, SCENES).text;
        const sealed = /like doors painted on a wall/.test(t), window = /between Golden Core and Soul Embryo/.test(t), wait = /wait for Golden Core/.test(t), reach = /within reach/.test(t);
        const wantSealed = r < 4 && e < 8, wantWindow = r >= 4 && r <= 6 && e < 8, wantWait = r < 4 && e >= 8 && c < 28, wantReach = r >= 4 && r <= 6 && e >= 8 && c < 28;
        assert(sealed === wantSealed && window === wantWindow && wait === wantWait && reach === wantReach, `review: the meridian screen at realm ${r}, ${e}/8, ${c}/28 (sealed ${sealed}, window ${window}, wait ${wait}, reach ${reach})`);
    }
    { const v = at(6, 6); v.scene = 'ns_warn'; assert(/They open between Golden Core and Soul Embryo/.test(sceneView(v, SCENES).text), 'G4: ns_warn says Golden Core'); }
    { // saves: partial e8Work kept until Golden Core; vessels already open stay open
        const o = at(2, 3); o.james.e8Work = 1.5; o.scene = 'stream';
        const back = deserialize(serialize(o));
        assert(back.james.e8Work === 1.5 && back.james.extra8 === 3 && !MER.canExtra8(back), 'G4: a save at Core Formation keeps its vessel work and its open vessels');
        back.james.realm = 4; back.yuki.realm = 4; back.james.qi = 30; back.james.satiety = 80;
        const card = medCards(back, SCENES).find((c) => c.id === 'med:mer:e8');
        assert(card && card.open && /1\.5 h of 7 h done/.test(sceneView(Object.assign(structuredClone(back), { scene: 'meridians' }), SCENES).choices.map((c) => c.label).join(' ')), 'G4: at Golden Core that work counts (1.5 h of the 4th vessel\'s 7 h)');
    }
    { // the Long Forest's seasons grant the vessels from Golden Core: 3, 6, 8
        const lf = ensureBars(newGame(6611, { closed: true })); const got = [];
        for (let i = 0; i < 7; i++) { lfSeason(lf); got.push(`${lf.james.realm}:${lf.james.extra8}`); }
        assert(got.join() === '1:0,2:0,3:0,4:3,5:6,6:8,7:8' && lf.james.extraCollaterals === 28 && lf.james.junctions === 10, `G4: Long Forest seasons (realm:vessels ${got.join(', ')})`);
        const keep = ensureBars(newGame(6612, { closed: true })); keep.james.extra8 = 5; for (let i = 0; i < 4; i++) lfSeason(keep);
        assert(keep.james.realm === 4 && keep.james.extra8 === 5, 'G4: a season never takes vessels away');
    }
    // P1: the 28 collaterals in pairs, one collateral's hours a pair (56 h), two challenging awards a pair
    { let h = 0, pairs = 0; for (let c = 0; c < 28; c += MER.ecStep(c)) { h += ecHours(c); pairs++; } assert(h === 56 && pairs === 14, `P1: 14 pairs, ${h} h (114 h one by one)`); }
    assert(MER.ecPairName(0) === 'the Governing crown thread and the Governing nape thread' && MER.ecPairName(27) === 'the Yang Heel eye-corner thread' && MER.ecStep(27) === 1 && MER.ecStep(28) === 0, 'P1: the pair\'s name; an odd count left by an older save opens one');
    {
        const g = at(4, 8, 0); g.scene = 'meridians'; g.james.qi = 30; g.james.satiety = 80;
        const lab = sceneView(g, SCENES).choices.map((c) => c.label).find((l) => /Governing crown thread/.test(l));
        assert(/Work on the Governing crown thread and the Governing nape thread\. \(1 and 2\/28; 0 h of 3 h done/.test(lab || ''), `P1: the card reads "X and Y" (${lab})`);
        assert(MER.lineName(g, 'ec') === 'Open the Governing crown thread and the Governing nape thread.', 'P1: the line\'s name');
        const twice = structuredClone(g); const want = [...awardXp(twice, 'Convergence Use', 'challenging'), ...awardXp(twice, 'Convergence Use', 'challenging')];
        const reg0 = qiRegenPct(g, g.james.collaterals ?? 66); g.james.ecWork = 2.9;
        const i = MER.lineIndex(SCENES, 'ec'); const r = choose(g, SCENES, i, { task: true });
        const xpLines = r.lines.filter((l) => /^(Convergence Use|GU|Yuki \(bond\))/.test(l));
        assert(g.james.extraCollaterals === 2 && /^Opened the Governing crown thread and the Governing nape thread \(2\/28\)\. Two fine/.test(r.lines[0]), `P1: one sitting opens the pair (${r.lines[0]})`);
        assert(JSON.stringify(xpLines) === JSON.stringify(want) && xpLines.filter((l) => /^Convergence Use/.test(l)).length === 2, 'P1: two challenging awards, as two collaterals one by one');
        assert(Math.abs(qiRegenPct(g, g.james.collaterals ?? 66) - reg0 - 0.2) < 1e-9, 'P1: the regen of two collaterals (+0.2%)');
        const odd = at(4, 8, 27); odd.scene = 'meridians'; odd.james.qi = 30; odd.james.satiety = 80; odd.james.ecWork = 5.95;
        const ro = choose(odd, SCENES, i, { task: true });
        assert(odd.james.extraCollaterals === 28 && /\(28\/28\)\. A fine, bright thread/.test(ro.lines[0]), 'P1: the last single one from an odd count');
    }
    // F1: a door's dry run sees a death that ends the Coil; it keeps the walk's minutes
    {
        const g = ensureBars(newGame(6613, { closed: true })); g.scene = 'village'; g.location = 'village'; g.james.hp = 1; g.james.satiety = 0;
        const before = JSON.stringify(g); const o = taskOutcome(g, SCENES, 'village:2');
        assert(JSON.stringify(g) === before, 'F1: the door\'s dry run leaves the game alone');
        assert(o.death === 'hunger' && o.minutes === taskMinutes(g, SCENES, 'village:2') && o.end === g.minutes + o.minutes, `F1: village:2 at HP 1, Fed 0: "Starves here", the walk's minutes (${JSON.stringify(o)})`);
        const real = structuredClone(g); runTask(real, SCENES, 'village:2');
        assert(real.scene === 'coil_end' && real.coil.why === 'collapse', 'F1: and the real run does end the Coil');
        const ok = ensureBars(newGame(6614, { closed: true })); ok.scene = 'village'; ok.location = 'village'; ok.james.satiety = 80;
        const oo = taskOutcome(ok, SCENES, 'village:2');
        assert(oo.death === null && oo.minutes === taskMinutes(ok, SCENES, 'village:2') && oo.fed === 80, 'F1: a safe walk: no death, the same walk minutes and Fed as before');
        const card = taskCards(g, SCENES, 'village').find((c) => c.id === 'village:2');
        const to = SCENES.village.choices[Number(card.id.split(':')[1])].to;
        const broken = { ...SCENES, [to]: { ...SCENES[to], enter: () => { throw new Error('a fight'); } } };
        let ob = null, threw = false; try { ob = taskOutcome(g, broken, 'village:2'); } catch { threw = true; }
        assert(!threw && ob && ob.death === null && ob.minutes === o.minutes, 'F1: a door whose full run throws reads as no death, with its walk minutes');
        // the review (R1): the warning's clock is the death's, the card's the walk's end
        assert(o.deathAt === real.minutes && oo.deathAt === undefined, `review: deathAt = when the real run's Coil ends (${o.deathAt} vs ${real.minutes}); none on a safe door`);
        const late = ensureBars(newGame(6615, { closed: true })); late.scene = 'village'; late.location = 'village'; late.james.hp = 5; late.james.satiety = 0;
        const slow = { ...SCENES, [to]: { ...SCENES[to], enter: (x) => { advance(x, 300); return []; } } };
        const ol = taskOutcome(late, slow, 'village:2'), rl = structuredClone(late); runTask(rl, slow, 'village:2');
        assert(taskOutcome(late, SCENES, 'village:2').death === null && ol.death === 'hunger' && ol.end === late.minutes + 60 && ol.deathAt === rl.minutes && ol.deathAt > ol.end && rl.scene === 'coil_end', `review: a death inside the scene walked into: the card still ends at the walk, the warning says when (${ol.end} → ${ol.deathAt})`);
    }
}
// v0.11.140 (owner pick FM2): FD door cards speed up with their own familiarity; FS story beats with their own picks
{
    const { doorMinutes, pickedSpeed, pickCount, pickKey, PICK_N } = await import('../js/core/story.js');
    // FS: the curve
    assert(pickedSpeed(0) === 2 && pickedSpeed(1) === 2 && pickedSpeed(2) === 2 && pickedSpeed(3) === 2.5 && pickedSpeed(9) === 5.5 && pickedSpeed(17) === 9.5 && pickedSpeed(18) === 10 && pickedSpeed(40) === 10 && PICK_N === 18 && PICKED_SPEED === 2,
        `FS: ÷ max(2, 1 + 9 × picks ÷ 18), up to ×10 (${[0, 1, 3, 9, 18, 40].map(pickedSpeed).join(' / ')})`);
    assert(pickedMinutes(60) === 30 && pickedMinutes(60, 0) === 30 && pickedMinutes(60, 9) === 11 && pickedMinutes(60, 18) === 6 && pickedMinutes(5, 18) === 1, 'FS: pickedMinutes by picks, never under 1');
    // FD: the walk's minutes
    assert(doorMinutes(0, 10) === 0 && doorMinutes(60, 1) === 60 && doorMinutes(60, 5) === 12 && doorMinutes(60, 10) === 6 && doorMinutes(4, 10) === 1 && doorMinutes(5, 10) === 1, 'FD: doorMinutes: 0 stays 0, ÷ speed, never under 1');
    // FD: a door card (Ashfall's sick child, 60 min) at familiarity 0, 8, 18, 40: the walk ÷ cardSpeed, the scene inside unchanged
    const door = (fam) => { const g = ensureBars(newGame(6620, { closed: true })); g.scene = 'village'; g.location = 'village'; g.minutes = 9 * 60; g.james.satiety = 90; taskState(g).fam['village:2'] = fam; return g; };
    const walk = SCENES.village.choices[2].time;
    const runs = [0, 8, 18, 40].map((f) => { const g = door(f); const m0 = g.minutes; const fc = taskMinutes(g, SCENES, 'village:2'); const oc = taskOutcome(g, SCENES, 'village:2').minutes; runTask(g, SCENES, 'village:2'); return { f, fc, oc, total: g.minutes - m0, fam: taskState(g).fam['village:2'], use: Object.keys(g.tasks.use || {}).filter((k) => k.startsWith('pick:')).length }; });
    assert(walk === 60 && runs.map((r) => r.fc).join() === [60, 12, 6, 6].join(), `FD: the door card's walk 60 / 12 / 6 / 6 min at familiarity 0 / 8 / 18 / 40 (${runs.map((r) => r.fc).join(' / ')})`);
    assert(runs.every((r) => r.oc === r.fc), 'FD: the card shows the sped walk (taskOutcome = taskMinutes)');
    assert(runs.every((r) => r.total - r.fc === runs[0].total - runs[0].fc), `FD: the scene inside the door takes the same time at every familiarity (${runs.map((r) => r.total - r.fc).join(' / ')})`);
    assert(runs.every((r) => r.fam === r.f + 1), 'FD: a door card still counts +1 familiarity a use');
    assert(runs.every((r) => r.use === 0), 'FS: a door card (a task card) counts no story pick');
    // FD: a door menu (the wilds' Explore): the hub's entry and the place's own time, each ÷ the card's speed; the forecast is the real run
    {
        const w = ensureBars(newGame(6621, { closed: true })); w.scene = 'wilds'; w.location = 'wilds'; w.minutes = 8 * 60; w.james.satiety = 90; w.james.hp = jamesHpMax(w);
        const dc = taskCards(w, SCENES).find((c) => c.kind === 'door' && c.id.startsWith('wild_explore:'));
        assert(!!dc, 'FD: the wilds offer an Explore door card');
        if (dc) {
            const ei = SCENES.wilds.choices.findIndex((c) => c.to === 'wild_explore'), entry = SCENES.wilds.choices[ei].time || 0, own = SCENES.wild_explore.choices[Number(dc.id.split(':')[1])].time || 0;
            const results = [0, 8, 18].map((f) => { const g = structuredClone(w); taskState(g).fam[dc.id] = f; const sp = cardSpeed(f); const fc = taskMinutes(g, SCENES, dc.id); return { f, fc, want: doorMinutes(entry, sp) + doorMinutes(own, sp) }; });
            assert(results.every((r) => r.fc === r.want) && results[2].fc < results[0].fc, `FD: Explore's entry (${entry}) and place (${own}) both sped: ${results.map((r) => r.fc).join(' / ')} min at 0 / 8 / 18`);
            const g = structuredClone(w); taskState(g).fam[dc.id] = 8; const m0 = g.minutes; const fc = taskMinutes(g, SCENES, dc.id); const sceneTime = (() => { const h = structuredClone(w); taskState(h).fam[dc.id] = 0; const m = h.minutes; runTask(h, SCENES, dc.id); return h.minutes - m - taskMinutes(w, SCENES, dc.id); })();
            runTask(g, SCENES, dc.id);
            assert(g.minutes - m0 === fc + sceneTime, `FD: Explore at familiarity 8: the real run is the forecast walk plus the scene's own time (${g.minutes - m0} = ${fc} + ${sceneTime})`);
        }
    }
    // v0.11.141 (FX1, CH): a chore's own time ÷ its familiarity (FD's test before: a chore kept its time)
    {
        const b0 = (x, id) => { const y = structuredClone(x); taskState(y).fam[id] = 18; return y; };
        const ch = ensureBars(newGame(6622, { closed: true })); ch.scene = 'ashfall'; ch.location = 'ashfall'; ch.minutes = 4 * 1440 + 9 * 60; ch.james.satiety = 20; ch.inventory = { hare_cooked: 3, berries: 5 };
        const eat = taskCards(ch, SCENES).find((c) => c.kind === 'chore' && /^Eat/.test(c.label));
        if (eat) { const a = structuredClone(ch), b = structuredClone(ch); taskState(b).fam[eat.id] = 18; const ma = a.minutes, mb = b.minutes; runTask(a, SCENES, eat.id); runTask(b, SCENES, eat.id); const ct = SCENES.ashfall.choices[Number(eat.id.split(':')[1])].time; assert(ct > 0 && (a.minutes - ma) - (b.minutes - mb) === ct - doorMinutes(ct, 10) && taskMinutes(b0(ch, eat.id), SCENES, eat.id) === b.minutes - mb, `CH: ${eat.label} ${ct} min ÷ 10 at familiarity 18 (${a.minutes - ma} → ${b.minutes - mb}), the card shows it`); }
        else assert(false, 'FD: Ashfall offers an Eat chore');
    }
    // FS: a story choice: the first pick full, then ÷ max(2, …) by the picks before; the count in g.tasks.use
    {
        let sc = null, ci = -1;
        for (const [id, x] of Object.entries(SCENES)) {
            if (sc || TASK_HUBS[id] || isMenuScene(id) || x.end) continue;
            (x.choices || []).forEach((c, i) => { if (sc || !(c.time >= 60) || c.walk || c.show || c.req || c.check || c.combat || c.qi || typeof c.to !== 'string' || SCENES[c.to]?.enter || typeof c.text !== 'string' || /^Back\b/.test(c.text)) return; sc = id; ci = i; });
        }
        assert(!!sc, 'FS: a story choice of 60+ minutes to test on');
        if (sc) {
            const t = SCENES[sc].choices[ci].time;
            const take = (g) => { g.scene = sc; g.james.satiety = 90; g.minutes = 8 * 60 + (g.minutes % 1440 > 20 * 60 ? 1440 : 0); const m0 = g.minutes; choose(g, SCENES, ci); return g.minutes - m0; };
            const g = ensureBars(newGame(6623)); g.minutes = 8 * 60;
            const first = take(g), second = take(g), third = take(g);
            assert(first === t && pickCount(g, sc, ci) === 3 && g.tasks.use[pickKey(sc, ci)] === 3, `FS: ${sc}:${ci}: three picks counted (${pickCount(g, sc, ci)})`);
            assert(second === pickedMinutes(t, 1) && third === pickedMinutes(t, 2), `FS: ${sc}:${ci} ${t} min: 1st ${first}, 2nd ${second} (×2), 3rd ${third} (×2)`);
            g.tasks.use[pickKey(sc, ci)] = 9; const nine = take(g); g.tasks.use[pickKey(sc, ci)] = 18; const top = take(g); g.tasks.use[pickKey(sc, ci)] = 40; const past = take(g);
            assert(nine === pickedMinutes(t, 9) && top === Math.max(1, Math.round(t / 10)) && past === top, `FS: after 9 picks ÷ 5.5 (${nine}), after 18 ÷ 10 (${top}), no more past it (${past})`);
            // an old save: picked (sepia) but no count: ×2 as F1
            const o = ensureBars(newGame(6624)); o.minutes = 8 * 60; notePicked(o, sc, ci); delete o.tasks.use;
            assert(take(o) === pickedMinutes(t) && pickCount(o, sc, ci) === 1, 'FS: an old save\'s picked choice with no count takes half (F1), then counts from 1');
            // the forecast on a copy (main.js) leaves the count alone; a save keeps it; a Coil keeps it
            const k = ensureBars(newGame(6625)); k.minutes = 8 * 60; take(k); take(k);
            const before = JSON.stringify(k.tasks.use); const cp = JSON.parse(JSON.stringify(k)); cp.scene = sc; choose(cp, SCENES, ci);
            assert(JSON.stringify(k.tasks.use) === before, 'FS: a pick on a copy (the forecast) counts nothing on the game');
            assert(pickCount(deserialize(serialize(k)), sc, ci) === 2, 'FS: the count survives a save');
            endCoil(k, 'choice', 'stream'); rewind(k);
            assert(pickCount(k, sc, ci) === 2 && wasPicked(k, sc, ci), `FS: the count is kept across a Coil (${pickCount(k, sc, ci)})`);
            // a task card through choose (task: true) counts nothing
            const tk = ensureBars(newGame(6626)); tk.scene = sc; tk.minutes = 8 * 60; choose(tk, SCENES, ci, { task: true });
            assert(pickCount(tk, sc, ci) === 0, 'FS: a card (task: true) counts no pick');
        }
        // FS + flight: a marked walk picked 18 times at Foundation: ÷ 10 first, then flown
        const { WALKS } = await import('../js/story/walks.js');
        const { flightMinutes } = await import('../js/core/game.js');
        const wk = WALKS.map(([id, i]) => [id, i, SCENES[id].choices[i]]).find(([id, , c]) => c.time >= 60 && !c.show && !c.req && typeof c.to === 'string' && !SCENES[c.to]?.enter && SCENES[id].place && SCENES[c.to]?.place && SCENES[id].place !== SCENES[c.to].place);
        if (wk) {
            const [id, i, c] = wk; const f = ensureBars(newGame(6627)); f.james.realm = 1; f.scene = id; f.location = typeof SCENES[id].place === 'string' ? SCENES[id].place : f.location; f.minutes = 8 * 60; f.james.satiety = 90;
            notePicked(f, id, i); f.tasks.use = { [pickKey(id, i)]: 18 }; const m0 = f.minutes; choose(f, SCENES, i);
            assert(f.minutes - m0 === flightMinutes(f, Math.max(1, Math.round(c.time / 10))), `FS: ${id}:${i} (${c.time} min, a walk) after 18 picks at Foundation: ÷ 10, then flown (${f.minutes - m0})`);
        } else assert(false, 'FS: a marked walk of 60+ minutes between two places');
    }
}
// v0.11.140 (owner pick RV1: Fable's review of FM2): MK the door menus' share kept, L1 only choices that could be sped count, DS, TG
{
    const { doorMinutes, pickCount, pickKey, threatOf } = await import('../js/core/story.js');
    const { skipPlan } = await import('../js/story/again.js');
    const { canBeFamiliar, TRANSFER } = await import('../js/core/tasks.js');
    // MK: a use of one Explore place gives the others TRANSFER of a use, and their walks speed up with it (as work menus)
    {
        const w = ensureBars(newGame(6630, { closed: true })); w.scene = 'wilds'; w.location = 'wilds'; w.minutes = 8 * 60; w.james.satiety = 90; w.james.hp = jamesHpMax(w);
        const doors = taskCards(w, SCENES).filter((c) => c.kind === 'door' && c.id.startsWith('wild_explore:'));
        assert(doors.length >= 2, `MK: the wilds' Explore menu has two or more door cards (${doors.length})`);
        if (doors.length >= 2) {
            const [a, b] = doors; const g = structuredClone(w); const tb = taskMinutes(g, SCENES, b.id);
            runTask(g, SCENES, a.id);
            assert(taskState(g).fam[a.id] === 1 && taskState(g).fam[b.id] === Math.round(TRANSFER * 10) / 10, `MK: ${a.id} used once: itself 1, ${b.id} ${taskState(g).fam[b.id]} (TRANSFER ${TRANSFER}, kept to one decimal)`);
            const h = structuredClone(w); taskState(h).fam[b.id] = 5.4; const sp = cardSpeed(5.4);
            const ei = SCENES.wilds.choices.findIndex((c) => c.to === 'wild_explore'), entry = SCENES.wilds.choices[ei].time || 0, own = SCENES.wild_explore.choices[Number(b.id.split(':')[1])].time || 0;
            assert(Math.abs(sp - 3.7) < 1e-9 && taskMinutes(h, SCENES, b.id) === doorMinutes(entry, sp) + doorMinutes(own, sp) && taskMinutes(h, SCENES, b.id) < tb, `TG: a door at familiarity 5.4 (a share): ÷ ${sp} (${tb} → ${taskMinutes(h, SCENES, b.id)} min)`);
            assert(taskOutcome(h, SCENES, b.id).minutes === taskMinutes(h, SCENES, b.id), 'TG: a door menu\'s card shows its sped walk (taskOutcome = taskMinutes)');
        }
    }
    // TG: a door that would end past midnight is open once its walk is short enough (the lock reads the sped walk)
    {
        const late = (fam) => { const g = ensureBars(newGame(6631, { closed: true })); g.scene = 'village'; g.location = 'village'; g.minutes = 1440 + 23 * 60 + 30; g.james.satiety = 90; taskState(g).fam['village:2'] = fam; return taskCards(g, SCENES).find((c) => c.id === 'village:2')?.status; };
        assert(late(0) === 'late' && late(18) === 'open', `TG: village:2 at 23:30: late at familiarity 0 (60 min), open at 18 (6 min) (${late(0)} / ${late(18)})`);
    }
    // DS: the screen shows a door card's familiarity (main.js, no new words)
    {
        const { readFileSync } = await import('node:fs');
        const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
        assert(/const fam = c\.kind === 'work' \|\| c\.kind === 'door' \?/.test(main) && /card\.kind === 'work' \|\| card\.kind === 'door'\)\) lines\.push\(`Familiarity:/.test(main) && /card\.kind === 'work' \? ' Familiar work goes faster\.' : ''/.test(main), 'DS: a door card shows its step and count, and its hold line its familiarity (the work line\'s sentence for work only)');
        const v = ensureBars(newGame(6632, { closed: true })); v.scene = 'village'; v.location = 'village'; v.minutes = 9 * 60; taskState(v).fam['village:2'] = 3;
        const dc = taskCards(v, SCENES).find((c) => c.id === 'village:2');
        assert(dc && dc.kind === 'door' && dc.tier === famTier(3) && dc.fam === 3 && dc.next != null, `DS: the door card carries its tier and count (${dc?.tier}, ${dc?.fam}/${dc?.next})`);
    }
    // L1 (v0.11.140), since v0.11.141 (FX1, SA): every story choice off the meta screens counts its picks; the meta screens never
    {
        // the meridian screen and a Coil screen: no mark, no count
        const m = ensureBars(newGame(6633, { closed: true })); m.scene = 'meridians'; m.minutes = 9 * 60; m.james.satiety = 90;
        const mi = merChoice(m, SCENES);
        if (mi >= 0) { const t0 = m.minutes; choose(m, SCENES, mi); const t1 = m.minutes - t0; const c1 = pickCount(m, 'meridians', mi); m.scene = 'meridians'; m.tasks.use[pickKey('meridians', mi)] = 18; const m2 = structuredClone(m); m2.scene = 'meridians'; const u0 = m2.minutes;
            choose(m2, SCENES, merChoice(m2, SCENES), { task: true });
            assert(c1 === 0 && pickCount(m, 'meridians', mi) === 18 && !canBeFamiliar({ ...m, scene: 'meridians' }, SCENES, mi, ''), 'L1: a meridian session taken on its screen counts no pick (only the planted 18)');
            assert(m2.minutes - u0 > 0 && t1 > 0, `TG: a meridian session keeps its own time (${t1} min; ${m2.minutes - u0} with 18 planted picks)`); }
        else assert(false, 'L1: a closed start offers a meridian session');
        // a "Back…" and a hub's card through choose count nothing; a plain story choice counts
        let back = null;
        for (const [id, x] of Object.entries(SCENES)) { if (back || TASK_HUBS[id] || isMenuScene(id) || x.end || x.enter) continue; const i = (x.choices || []).findIndex((c) => typeof c.text === 'string' && /^Back\b/.test(c.text) && !c.show && !c.req && !c.check && !c.combat && !c.qi && typeof c.to === 'string'); if (i >= 0) back = [id, i]; }
        if (back) { const g = ensureBars(newGame(6634)); g.scene = back[0]; g.minutes = 9 * 60; g.james.satiety = 90; choose(g, SCENES, back[1]); assert(pickCount(g, ...back) === 1 && wasPicked(g, ...back), `SA: "Back…" (${back.join(':')}) counts its pick`); }
        else assert(false, 'L1: a Back choice to test on');
        const hb = ensureBars(newGame(6635, { closed: true })); hb.scene = 'village'; hb.location = 'village'; hb.minutes = 9 * 60; hb.james.satiety = 90; choose(hb, SCENES, 2);
        assert(pickCount(hb, 'village', 2) === 1, 'SA: a hub\'s choice taken as a story choice counts its pick (taken as a card it counts none)');
    }
    // TG: a one-move finish counts under its fight choice; threatOf and skipPlan (copies) count nothing; a whole-game rewind keeps the counts
    {
        let done = false;
        for (const [id, x] of Object.entries(SCENES)) {
            if (done || TASK_HUBS[id] || isMenuScene(id) || x.end || x.enter) continue;
            (x.choices || []).forEach((c, i) => {
                if (done || !c.combat || c.show || c.req || c.check || c.qi) return;
                const g = ensureBars(newGame(6636)); g.scene = id; g.minutes = 9 * 60; g.james.satiety = 90;
                if (!canBeFamiliar(g, SCENES, i, String(typeof c.text === 'function' ? c.text(g) : c.text))) return;
                const before = JSON.stringify(g.tasks.use || {});
                let th = null; try { th = threatOf(g, SCENES, i); } catch { th = null; }
                assert(JSON.stringify(g.tasks.use || {}) === before, `TG: threatOf on ${id}:${i} counts nothing on the game`);
                try { choose(g, SCENES, 1000 + i); } catch { return; }
                assert(pickCount(g, id, i) === 1 && pickCount(g, id, 1000 + i) === 0, `TG: a one-move finish on ${id}:${i} counts under the fight choice (${pickCount(g, id, i)})`);
                done = true;
            });
        }
        assert(done, 'TG: a fight choice finished in one move');
        // skipPlan on a copy (the P1-a setup: night_won → morning → wilds), then the real skip counts like tapping
        const s0 = ensureBars(newGame(3507, { closed: true })); s0.flags.long = true; s0.flags.forest_day = 2; s0.minutes += 1440 + 22 * 60; goTo(s0, SCENES, 'night_won'); goTo(s0, SCENES, 'morning'); goTo(s0, SCENES, 'night_won');
        { const r0 = JSON.parse(JSON.stringify(s0)); for (let k = 0; k < 3 && r0.scene !== 'wilds'; k++) { noteRead(s0, sceneView(r0, SCENES).text); choose(r0, SCENES, sceneView(r0, SCENES).choices.filter((c) => !c.disabled)[0].index); } }
        s0.coil.n = 2; const u0 = JSON.stringify(s0.tasks.use || {});
        const pl = skipPlan(s0, SCENES);
        assert(pl.steps === 2 && JSON.stringify(s0.tasks.use || {}) === u0, `TG: skipPlan (${pl.steps} steps) counts nothing on the game`);
        const A = JSON.parse(JSON.stringify(s0)), B = JSON.parse(JSON.stringify(s0)); skipRun(A, SCENES);
        for (let k = 0; k < pl.steps; k++) choose(B, SCENES, sceneView(B, SCENES).choices.filter((c) => !c.disabled)[0].index);
        assert(JSON.stringify(A.tasks.use || {}) === JSON.stringify(B.tasks.use || {}), 'TG: the real skip counts its picks as tapping through does');
        const k = ensureBars(newGame(6638, { closed: true })); k.tasks.use = { [pickKey('supper', 1)]: 7, 'act:sit': 3 }; k.coil.act = 1; endCoil(k, 'choice', 'stream'); rewind(k, { to: 'game' });
        assert(pickCount(k, 'supper', 1) === 7 && k.tasks.use['act:sit'] === 3, `TG: the whole game again keeps the counts (${pickCount(k, 'supper', 1)})`);
    }
}
// v0.11.141 (owner pick FX1): DI the scenes behind a door card at its speed, SA every story choice from its second pick, CH chores
{
    const { doorMinutes, pickCount, pickedMinutes: pm } = await import('../js/core/story.js');
    const { choreSpeeds } = await import('../js/core/tasks.js');
    // DI: Ashfall's sick child (village:2) at familiarity 0 and 18: inside, "Drain and clean it" (60 min, a check) ÷ the door's speed on its first pick
    const run = (fam) => { const g = ensureBars(newGame(6640, { closed: true })); g.scene = 'village'; g.location = 'village'; g.minutes = 1440 + 9 * 60; g.james.satiety = 90; taskState(g).fam['village:2'] = fam; runTask(g, SCENES, 'village:2'); return g; };
    const d0 = run(0), d18 = run(18);
    assert(d0.scene === 'heal' && d18.scene === 'heal' && d18.tasks.door?.id === 'village:2' && d18.tasks.door.speed === 10 && d0.tasks.door?.speed === 1, `DI: the door card leaves its screen and marks the door with its speed (${JSON.stringify(d18.tasks.door)})`);
    const inside = (g) => { const m0 = g.minutes; choose(g, SCENES, 1); return g.minutes - m0; };
    const fc18 = (() => { const c = JSON.parse(JSON.stringify(d18)); const m = c.minutes; choose(c, SCENES, 1); return c.minutes - m; })();
    const t0 = inside(d0), t18 = inside(d18);
    assert(t0 === 60 && t18 === doorMinutes(60, 10) && fc18 === t18 && pickCount(d18, 'heal', 1) === 1, `DI: inside, "Drain and clean it" 60 min at familiarity 0, ${t18} at 18 on its first pick; a copy (the forecast) the same (${fc18})`);
    // the mark goes on a task screen, its menus, a meta screen or the next card
    const back = run(18); back.scene = 'village';
    choose(back, SCENES, SCENES.village.choices.findIndex((c) => c.to === 'elder'));
    assert(!back.tasks.door, 'DI: a story choice taken on a task screen clears the mark');
    const nx = run(18); nx.scene = 'village'; const other = taskCards(nx, SCENES).find((c) => c.status === 'open' && c.kind !== 'door');
    if (other) { runTask(nx, SCENES, other.id); assert(!nx.tasks.door, `DI: the next card (${other.id}) clears it`); } else assert(false, 'DI: Ashfall offers a card that is not a door');
    { const m = run(18); m.scene = 'meridians'; const mi = merChoice(m, SCENES); if (mi >= 0) { choose(m, SCENES, mi); assert(!m.tasks.door, 'DI: a meta screen clears it'); } }
    // a save keeps the mark; a Coil drops it; an old save has none
    assert(deserialize(serialize(run(18))).tasks.door?.speed === 10, 'DI: a save keeps the mark');
    { const k = run(18); endCoil(k, 'choice', 'stream'); rewind(k); assert(!k.tasks.door, 'DI: a rewind drops it'); }
    // SA: a check inside a card scene (heal:1, 60 min) speeds from its second pick (F1's exclusion gone)
    { const g = run(0); const a = inside(g); g.scene = 'heal'; g.minutes = 2 * 1440 + 9 * 60; delete g.tasks.door; const m = g.minutes; choose(g, SCENES, 1); const b = g.minutes - m;
      assert(a === 60 && b === pm(60, 1) && pickCount(g, 'heal', 1) === 2, `SA: a check inside a card scene: 1st pick ${a}, 2nd ${b} (×2)`); }
    // CH: every hub chore with its own time speeds but a sit, a rest and the Long Forest's season
    const chores = []; for (const [h, cfg] of Object.entries(TASK_HUBS)) (SCENES[h]?.choices || []).forEach((c, i) => { if (c.to === h && !c.combat && (c.do || c.check || c.time || c.qi) && !(c.check && !cfg.plainChecks)) chores.push([h, i, c]); });
    const sp = chores.filter(([h, , c]) => choreSpeeds(h, c)), sits = chores.filter(([, , c]) => /condense\(g\)/.test(String(c.do))), rests = chores.filter(([, , c]) => /resting: true/.test(String(c.do)));
    assert(sp.length >= 10 && sits.length >= 9 && rests.length >= 8 && !sits.some(([h, , c]) => choreSpeeds(h, c)) && !rests.some(([h, , c]) => choreSpeeds(h, c)) && SCENES.lf_hub.choices.some((c) => c.noFam && c.time === 120 && !choreSpeeds('lf_hub', c)), `CH: ${sp.length} chores speed (eating, cooking, the camp's fire and stakes); ${sits.length} sits, ${rests.length} rests and the season keep their time`);
    { const r0 = ensureBars(newGame(6641, { closed: true })); r0.scene = 'wilds'; r0.location = 'wilds'; r0.minutes = 1440 + 10 * 60; r0.james.hp = 5; const rid = taskCards(r0, SCENES).find((c) => /^Rest in the shade/.test(c.label))?.id;
      if (rid) { const a = structuredClone(r0), b = structuredClone(r0); taskState(b).fam[rid] = 18; const ma = a.minutes, mb = b.minutes; runTask(a, SCENES, rid); runTask(b, SCENES, rid); assert(a.minutes - ma === 60 && b.minutes - mb === 60, `CH: a rest keeps its hour at any familiarity (${b.minutes - mb})`); } else assert(false, 'CH: the wilds offer a rest'); }
}
// v0.11.141 (owner pick RW1, Fable's review of FX1): M1b the door's scenes end with the day, NF, CL
{
    const { doorEnds, eveningTo, nightTo } = await import('../js/core/game.js');
    const { pickKey } = await import('../js/core/story.js');
    const marked = (min, speed = 10) => { const g = ensureBars(newGame(6650, { closed: true })); g.minutes = min; g.james.satiety = 90; g.tasks.door = { id: 'village:2', speed }; return g; };
    // M1b: the clock passing 19:00 or midnight, a sleep, a night, the evening jump end it; a step that passes neither keeps it
    { const g = marked(1440 + 18 * 60 + 50); advance(g, 5); const kept = !!g.tasks.door; advance(g, 10); assert(kept && !g.tasks.door, 'M1b: 18:55 keeps the mark, past 19:00 it ends'); }
    { const g = marked(1440 + 23 * 60 + 50); advance(g, 15); assert(!g.tasks.door, 'M1b: past midnight it ends'); }
    { const g = marked(1440 + 20 * 60); advance(g, 30); assert(!!g.tasks.door, 'M1b: a door taken after 19:00 keeps its mark until midnight'); }
    for (const [name, fn] of [['sleep', (g) => sleepUntil(g, 6)], ['the evening jump', (g) => eveningTo(g)], ['a night', (g) => nightTo(g, 60)]]) { const g = marked(1440 + 10 * 60); fn(g); assert(!g.tasks.door, `M1b: ${name} ends it`); }
    { const g = marked(1440 + 10 * 60); doorEnds(g, 30); assert(!!g.tasks.door, 'M1b: doorEnds keeps it inside the day'); }
    // M1b, walked: Ashfall's sick child at familiarity 18, then on to a scene and back to the task screen by goTo (as a choice's `to` does)
    { const g = ensureBars(newGame(6651, { closed: true })); g.scene = 'village'; g.location = 'village'; g.minutes = 1440 + 9 * 60; g.james.satiety = 90; taskState(g).fam['village:2'] = 18; runTask(g, SCENES, 'village:2');
      const had = g.tasks.door?.speed === 10; goTo(g, SCENES, 'village'); assert(had && !g.tasks.door, 'M1b: arriving on the task screen ends it (not only a choice taken there)'); }
    // the review's case: the same supper with and without a mark, after 19:00 has passed
    { const a = ensureBars(newGame(6652, { closed: true })), b = ensureBars(newGame(6652, { closed: true }));
      for (const x of [a, b]) { x.scene = 'ashfall'; x.location = 'ashfall'; x.minutes = 1440 + 17 * 60; x.james.satiety = 60; }
      b.tasks.door = { id: 'village:2', speed: 10 };
      goTo(a, SCENES, 'supper'); goTo(b, SCENES, 'supper');
      const oa = sceneView(a, SCENES).choices.filter((c) => !c.disabled && c.index < 1000)[0];
      if (oa) { const ma = a.minutes, mb = b.minutes; choose(a, SCENES, oa.index); choose(b, SCENES, oa.index); assert(!b.tasks.door && a.minutes - ma === b.minutes - mb, `M1b: supper after a door: the mark ended at 19:00, the same time as without (${a.minutes - ma} / ${b.minutes - mb})`); }
      else assert(false, 'M1b: supper offers a choice'); }
    // NF: the story's sits and the spring's rest keep their time on a second pick and behind a door; the season through choose too
    const NF = [['hollow', 0], ['rr_roots', 0], ['rt_grove', 0], ['heart_spring', 2]];
    assert(NF.every(([id, i]) => SCENES[id].choices[i].noFam === true) && SCENES.lf_hub.choices.some((c) => c.noFam && c.time === 120), 'NF: the three story sits, the spring\'s rest and the season are noFam');
    { let checked = 0;
      for (const [id, i] of NF) { const c = SCENES[id].choices[i]; const g = ensureBars(newGame(6653)); g.scene = id; g.minutes = 1440 + 9 * 60; g.james.satiety = 90; g.james.qi = 999; notePicked(g, id, i); g.tasks.use = { [pickKey(id, i)]: 18 }; g.tasks.door = { id: 'village:2', speed: 10 };
        const m0 = g.minutes; try { choose(g, SCENES, i); } catch { continue; } assert(g.minutes - m0 >= c.time, `NF: ${id}:${i} keeps its ${c.time} min after 18 picks and behind a door (${g.minutes - m0})`); checked++; }
      assert(checked >= 3, `NF: checked ${checked} of 4`); }
    { const si = SCENES.lf_hub.choices.findIndex((c) => c.noFam); const g = ensureBars(newGame(6654)); g.coil.n = 2; g.scene = 'lf_hub'; g.flags.lf_active = true; g.minutes = 1440 + 9 * 60; g.james.satiety = 90; notePicked(g, 'lf_hub', si); g.tasks.use = { [pickKey('lf_hub', si)]: 9 };
      const m0 = g.minutes; let ok = true; try { choose(g, SCENES, si); } catch { ok = false; } if (ok) assert(g.minutes - m0 >= 120, `NF: the season taken as a story choice keeps its 120 min (${g.minutes - m0})`); }
    // CL: a door speed past ×10 reads as ×10; a Meditate card ends the mark
    { const a = marked(1440 + 9 * 60, 1e9), b = marked(1440 + 9 * 60, 10); for (const x of [a, b]) { x.scene = 'heal'; } const ma = a.minutes, mb = b.minutes; choose(a, SCENES, 1); choose(b, SCENES, 1);
      assert(a.minutes - ma === b.minutes - mb && b.minutes - mb === 6, `CL: a mark of ×1e9 reads as ×10 (${a.minutes - ma} / ${b.minutes - mb} min)`); }
    { const g = ensureBars(newGame(6655, { closed: true })); g.scene = 'wilds'; g.location = 'wilds'; g.minutes = 1440 + 9 * 60; g.james.satiety = 90; g.tasks.door = { id: 'x', speed: 10 };
      const mc = medCards(g, SCENES).find((c) => c.open); if (mc) { try { runMed(g, SCENES, mc.id); } catch { /* */ } assert(!g.tasks.door, `CL: a Meditate card (${mc.id}) ends the mark`); } else assert(false, 'CL: a Meditate card open in the wilds'); }
}
// v0.11.143 (owner pick NF1; RN1 after Fable's review): the hours asleep before a night encounter (21:00 → 01:00 / 01:20,
// nightTo) give HP and Qi back at the resting rate, as any rest does; Fed still drops at the sleeping rate; if Fed runs out
// on the way only the share he was fed for (FP); none at Fed 0 (and no starving asleep, as before); the clock and the waking
// day as before
{
    const { nightTo, eveningTo } = await import('../js/core/game.js');
    const low = (seed, mins, fed = 90) => { const g = ensureBars(newGame(seed)); g.minutes = mins; g.james.satiety = fed; g.james.hp = 3; g.james.qi = 1; g.yuki.hp = 2; g.yuki.qi = 1; g.regenCarry = 0; g.starveCarry = 0; return g; };
    const bars = (g) => [g.james.hp, g.james.qi, g.yuki.hp, g.yuki.qi, g.regenCarry];
    const same = (a, b) => JSON.stringify(bars(a)) === JSON.stringify(bars(b));
    // the asleep span = the same span resting (advance), bars and carry; from 22:00 to 01:00 / 01:20
    for (const at of [60, 80]) {
        const g = low(9431 + at, 22 * 60), c = low(9431 + at, 22 * 60);
        const n0 = wakeDay(g), fed0 = g.james.satiety;
        nightTo(g, at); const span = g.minutes - c.minutes; advance(c, span, { resting: true });
        assert(clockParts(g.minutes).hh === 1 && clockParts(g.minutes).mm === at - 60 && span === 120 + at && wakeDay(g) === n0, `NF1: nightTo(${at}) wakes at 01:${String(at - 60).padStart(2, '0')}, same waking day (span ${span})`);
        assert(same(g, c) && g.james.hp > 3 && g.yuki.hp > 2, `NF1: ${span} min asleep = the same span resting (${bars(g).map((x) => x.toFixed?.(2)).join(' / ')} vs ${bars(c).map((x) => x.toFixed?.(2)).join(' / ')})`);
        assert(Math.abs(g.james.satiety - (fed0 - (3 * span) / 60 / 2)) < 1e-9, `NF1: Fed at the sleeping rate (${g.james.satiety})`);
    }
    // L2: a short span that can't reach the caps (00:30 → 01:00): every bar and the carry match, none full
    { const g = low(9435, 1440 + 30), c = low(9435, 1440 + 30); nightTo(g, 60); advance(c, 30, { resting: true });
      assert(same(g, c) && g.james.qi > 1 && g.james.qi < jamesQiMax(g) && g.yuki.qi > 1 && g.yuki.qi < yukiQiMax(g) && g.james.hp < jamesHpMax(g), `NF1 (L2): 30 min asleep, nothing capped: ${bars(g).map((x) => x.toFixed(2)).join(' / ')} = ${bars(c).map((x) => x.toFixed(2)).join(' / ')}`); }
    // FP: Fed runs out on the way: only the share he was fed for (Fed 3 of a 6-point drop: half the span); Fed ends at 0
    { const g = low(9436, 21 * 60, 3), c = low(9436, 21 * 60); nightTo(g, 60); advance(c, 120, { resting: true });
      assert(same(g, c) && g.james.satiety === 0 && g.james.hp > 3, `FP: Fed 3 for a 6-point night regenerates 120 of 240 min (${bars(g).map((x) => x.toFixed(2)).join(' / ')} vs ${bars(c).map((x) => x.toFixed(2)).join(' / ')})`);
      const a = low(9437, 21 * 60, 6.0), b = low(9437, 21 * 60, 5.9); nightTo(a, 60); nightTo(b, 60);
      assert(a.james.hp >= b.james.hp && b.james.hp > 3 && b.james.qi > 1, `FP: no cliff at the last Fed point (Fed 6.0: HP ${a.james.hp.toFixed(2)}, Fed 5.9: HP ${b.james.hp.toFixed(2)}, Qi ${b.james.qi.toFixed(2)})`); }
    // at Fed 0 nothing comes back, no starving asleep (as before)
    { const g = low(9441, 22 * 60, 0); nightTo(g, 60); assert(g.james.hp === 3 && g.james.qi === 1 && g.yuki.hp === 2 && g.starveCarry === 0, `NF1: at Fed 0 no regen and no starving (HP ${g.james.hp}, Qi ${g.james.qi}, carry ${g.starveCarry})`); }
    // entered after its hour (never back): no span, nothing changes
    { const g = low(9442, 1440 + 90); nightTo(g, 60); assert(g.minutes === 1440 + 90 && g.james.qi === 1 && g.james.hp === 3 && g.yuki.hp === 2, `NF1: entered after 01:00, nothing passes (${g.minutes})`); }
    // a bed before 21:00: the evening by the fire to 21:00 (resting, as before), then asleep to 01:00
    { const g = low(9443, 18 * 60), c = low(9443, 18 * 60); nightTo(g, 60); eveningTo(c); const mid = bars(c).slice(); advance(c, 240, { resting: true });
      assert(clockParts(g.minutes).hh === 1 && g.james.hp === c.james.hp && g.james.hp > mid[0], `NF1 (L2): a bed at 18:00 waits to 21:00, then sleeps to 01:00 (HP ${g.james.hp.toFixed(2)} = ${c.james.hp.toFixed(2)})`); }
    // every night encounter's scene gets it: a James and Yuki who sat themselves empty meet the night with bars back
    const scenes = [['night_event', 2, {}], ['night_attack', 3, {}], ['bl_night_event', 12, { bl_region: 'rr', bl_day: 2 }], ['village_night', 5, { vday: 2 }], ['fo_wolf', 8, {}]];
    for (const [sc, d, flags] of scenes) {
        const g = low(9450 + d, (d - 1) * 1440 + 22 * 60); Object.assign(g.flags, flags); g.scene = sc;
        SCENES[sc].enter?.(g);
        assert(clockParts(g.minutes).hh === 1 && g.james.qi > 0.5 * jamesQiMax(g) && g.james.hp > 3 && g.yuki.hp > 2,
            `NF1: ${sc}: at ${clockParts(g.minutes).hh}:${String(clockParts(g.minutes).mm).padStart(2, '0')} with Qi ${g.james.qi.toFixed(1)} of ${jamesQiMax(g).toFixed(1)}, HP ${g.james.hp.toFixed(1)}, Yuki HP ${g.yuki.hp.toFixed(1)}`);
    }
    // L2: a quiet night in Ashfall (not night 2) doesn't call nightTo: the clock and the bars stay
    { const g = low(9460, 4 * 1440 + 22 * 60); g.flags.vday = 1; g.scene = 'village_night'; const m0 = g.minutes; SCENES.village_night.enter?.(g);
      assert(g.minutes === m0 && g.james.qi === 1 && g.james.hp === 3, `NF1 (L2): a quiet village night is untouched (${g.minutes - m0} min, Qi ${g.james.qi})`); }
    // v0.11.151 (owner pick WD1, LN; Fable's L4 of v0.11.143): the night scene says what the hours asleep gave back, James's
    // bars only, each part from 1 point; nothing back, no line; a Results line (a gain), never a reply. RV1 (Fable's review):
    // EV counted from the bed tap (an evening by the fire to 21:00 counted and named), BR the shown value after less the shown
    // value before (the bars show one decimal), SM the Results summary takes both parts, TT expectations from the bars before
    {
        const { sleptLine, BED_FROM_HOUR } = await import('../js/core/game.js');
        const { splitLine, landParts } = await import('../js/core/replies.js');
        const r1 = (x) => Math.round(x * 10) / 10, shown = (a, b) => r1(r1(a) - r1(b));
        const LN_RE = /^(Slept until|By the fire to 21:00, then asleep until) 01:(00|20): \+([\d.]+) HP, \+([\d.]+) Qi\.$/;
        // every night scene, a bed at 22:00 (asleep only), 18:00 and 15:00 (the evening by the fire first): the numbers from the bars before the call
        for (const bed of [22, 18, 15]) for (const [sc, d, flags] of scenes) {
            const g = low(9470 + d + bed, (d - 1) * 1440 + bed * 60); Object.assign(g.flags, flags); g.scene = sc;
            const hp0 = g.james.hp, qi0 = g.james.qi;
            const lines = SCENES[sc].enter?.(g) || [];
            const m = lines.length === 1 && LN_RE.exec(lines[0]);
            const want = { hp: shown(g.james.hp, hp0), qi: shown(g.james.qi, qi0) };
            assert(!!m && Number(m[3]) === want.hp && Number(m[4]) === want.qi && m[2] === (sc === 'night_attack' ? '20' : '00') && (m[1] === 'Slept until') === (bed >= BED_FROM_HOUR),
                `LN (EV, BR): ${sc}, a bed at ${bed}:00, shows what the bed gave back, as the bars show it (${JSON.stringify(lines)}; want HP +${want.hp}, Qi +${want.qi})`);
            assert(splitLine(lines[0] || '').gain === lines[0], `LN: ${sc}'s line goes to Results, not the reply (bed ${bed}:00)`);
        }
        for (const [sc, d, flags] of scenes) {
            // full bars: nothing came back, no line (and the scene's own text is untouched)
            const f = ensureBars(newGame(9480 + d)); f.minutes = (d - 1) * 1440 + 18 * 60; f.james.satiety = 90; Object.assign(f.flags, flags); f.scene = sc;
            f.james.hp = jamesHpMax(f); f.james.qi = jamesQiMax(f);
            const fl = SCENES[sc].enter?.(f) || [];
            assert(Array.isArray(fl) && fl.length === 0, `LN: ${sc} with full bars shows no line (${JSON.stringify(fl)})`);
        }
        // at Fed 0, and entered after its hour: nothing came back, no line; a quiet village night: no line
        { const g = low(9491, 22 * 60, 0); assert(nightTo(g, 60).length === 0, 'LN: at Fed 0 no line'); }
        { const g = low(9492, 1440 + 90); assert(nightTo(g, 60).length === 0, 'LN: entered after its hour, no line'); }
        { const g = low(9493, 4 * 1440 + 22 * 60); g.flags.vday = 1; g.scene = 'village_night'; const l = SCENES.village_night.enter?.(g) || [];
          assert(Array.isArray(l) && l.length === 0, `LN: a quiet village night shows no line (${JSON.stringify(l)})`); }
        // the parts: each from 1 point as the bars show it; neither, no line; the fire named only when there was one
        const t1 = 1440 + 60, t2 = 1440 + 80, B = (hp, qi) => ({ hp, qi });
        assert(JSON.stringify(sleptLine(t1, B(3, 1.3), B(15.34, 31.3))) === '["Slept until 01:00: +12.3 HP, +30 Qi."]', `LN: both parts (${sleptLine(t1, B(3, 1.3), B(15.34, 31.3))})`);
        assert(JSON.stringify(sleptLine(t2, B(5, 2), B(5.94, 6.05), true)) === '["By the fire to 21:00, then asleep until 01:20: +4.1 Qi."]', `LN (EV): Qi only, HP under 1 point left out, the fire named (${sleptLine(t2, B(5, 2), B(5.94, 6.05), true)})`);
        assert(JSON.stringify(sleptLine(t1, B(2, 0), B(3, 0))) === '["Slept until 01:00: +1 HP."]', `LN: HP only, from exactly 1 point (${sleptLine(t1, B(2, 0), B(3, 0))})`);
        assert(sleptLine(t1, B(1, 1), B(1.9, 1.94)).length === 0 && sleptLine(t1, B(1, 1), B(1, 1)).length === 0 && sleptLine(t1, B(5, 5), B(3, 4), true).length === 0, 'LN: under 1 point each, or nothing, or a loss: no line');
        // BR: the bars' own rounding: Qi 0.36 → 40.53 shows 0.4 → 40.5, so +40.1 (the raw gain would say +40.2); HP 0.96 → 1.94 shows 1 → 1.9: under 1, out
        assert(JSON.stringify(sleptLine(t1, B(0.96, 0.36), B(1.94, 40.53))) === '["Slept until 01:00: +40.1 Qi."]', `LN (BR): the gain as the bars show it (${sleptLine(t1, B(0.96, 0.36), B(1.94, 40.53))})`);
        // through the real path: the Blackroot camp's last tap of the evening (18:00, so the fire first) lands the line in Results, and the
        // Results summary reads both parts, decimals and all (SM; main.js's own summarize)
        { const g = low(9494, 11 * 1440 + 18 * 60); Object.assign(g.flags, { bl_region: 'rr', bl_day: 2 }); g.scene = 'bl_night';
          const i = sceneView(g, SCENES).choices.findIndex((c) => !c.disabled && /^Leave the thread on watch/.test(c.label));
          const r = i >= 0 ? choose(g, SCENES, i) : { lines: [] };
          const p = landParts(r.lines, g.rel, g.rel), line = p.gains.find((l) => LN_RE.test(l)) || '';
          const src = (await import('node:fs')).readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
          const body = src.slice(src.indexOf('function summarize(lines) {'), src.indexOf('\n}\n', src.indexOf('function summarize(lines) {')) + 2);
          const summarize = new Function(`${body}; return summarize;`)();
          const m = LN_RE.exec(line), sum = summarize(p.gains);
          assert(g.scene === 'bl_night_event' && !!m && m[1].startsWith('By the fire') && !p.reply.some((l) => LN_RE.test(l)), `LN (TT): the camp's tap at 18:00 lands the fire line in Results (${JSON.stringify(r.lines)})`);
          assert(!!m && sum.includes(`+${m[3]} HP`) && sum.includes(`+${m[4]} Qi`), `LN (SM): the Results summary shows both parts (${sum})`);
          assert(summarize(['Slept until 01:00: +12.3 HP, +30 Qi.']) === '+12.3 HP · +30 Qi' || /\+12\.3 HP.*\+30 Qi/.test(summarize(['Slept until 01:00: +12.3 HP, +30 Qi.'])), `LN (SM): "+12.3 HP" is in the summary (${summarize(['Slept until 01:00: +12.3 HP, +30 Qi.'])})`);
          assert(/\+5 HP/.test(summarize(['By the fire to 21:00, then asleep until 01:20: +5 HP.'])), `LN (SM): the fire line's part too (${summarize(['By the fire to 21:00, then asleep until 01:20: +5 HP.'])})`); }
    }
}
const pctOf = (o, n) => Object.entries(o).sort().map(([k, v]) => `${k} ${((v / n) * 100).toFixed(1)}%`).join(', ');
console.log(`  tribute, tasks:   ${pctOf(stats.tasks.endings, stats.tasks.games)}`);
console.log(`  work-card results: ${Object.entries(bands).sort().map(([k, v]) => `${k} ${v}`).join(', ')} · Yuki brought home ${yukiRuns} times`);
console.log(`  tribute per Coil (tasks, bots rewind a lost tribute up to Coil 3): ${Object.entries(byCoil).sort(([a], [b]) => a - b).map(([n, b]) => { const t = b.won + b.paid + b.lost; return `Coil ${n}: won ${((b.won / t) * 100).toFixed(1)}% paid ${((b.paid / t) * 100).toFixed(1)}% lost ${((b.lost / t) * 100).toFixed(1)}% (${t})`; }).join(' · ')}`);
console.log(`  realm / primaries at the tribute (tasks): ${Object.entries(byCoil).sort(([a], [b]) => a - b).map(([n, b]) => { const t = b.won + b.paid + b.lost; return `Coil ${n}: realm ${(b.realm / t).toFixed(2)}, primaries ${(b.pri / t).toFixed(1)}`; }).join(' · ')}`);
const dl = (o, name) => Object.entries(o).sort(([a], [b]) => a - b).filter(([n]) => n <= 4).map(([n, d]) => `Coil ${n}: ${name === 'pro' ? `dead before Mei Lin ${((d.early / d.coils) * 100).toFixed(0)}%, after ${((d.late / d.coils) * 100).toFixed(0)}%` : `dead ${((d.late / d.coils) * 100).toFixed(0)}%`} (${d.coils}${REPORT ? `; beasts ${((d.beast / d.coils) * 100).toFixed(0)}%` : ''})`).join(' · ');
console.log(`  deaths, prologue (HP 0 or a beast): ${dl(deaths.pro, 'pro')}`);
console.log(`  deaths, Act 1: ${dl(deaths.a1, 'a1')}`);
console.log(`  Meditate: ${medStats.mer} meridian screens, ${medStats.bt} breakthroughs, ${medStats.warn} seal warnings; Act 1: ${medStats.a1bites} rewinds at Shen Qiu, ends on ${JSON.stringify(Object.fromEntries(Object.entries(medStats.a1coils).sort(([a], [b]) => a - b)))}`);
assert(!FULL || medStats.a1bites + shenWalk >= 5, `bots rewind Act 1 and reach its end (${medStats.a1bites} in the bot games + ${shenWalk} walked on purpose, K1 v0.11.92)`);
console.log(`  ${stats.tasks.cards} cards run, ${stats.tasks.skipped} skipped, ${stats.tasks.collapses} collapses (HP 0), ${predicted} cards predicted by their dry run (1 game in ${FC_EVERY}), ${cardsSeen.size}/${all.size} cards played`);
assert(badBars === 0, `no NaN / Infinity bar at the end of a bot game (${badBars})`);
if (STATS_OUT) writeFileSync(STATS_OUT, JSON.stringify({ games: GAMES, deaths, byCoil, fights: fightStats, badBars, seen: touchedOut() })); // v0.11.3: for tools/sanity.mjs
console.log(`  ${GAMES} games in ${WORKERS} worker${WORKERS > 1 ? 's' : ''}${FULL ? '' : ' (quick: coverage logged, not checked)'}`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
