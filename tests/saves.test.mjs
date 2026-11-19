// Run: node tests/saves.test.mjs — every file in saves/ must load and play on; the save format's safety checks.
import { readdirSync, readFileSync } from 'node:fs';
import { gunzipSync, gzipSync } from 'node:zlib';
import { SCENES } from '../js/story/prologue.js';
import { newGame, ensureBars, startCombat, combatStep, serialize, deserialize, peekSave, SaveError, SAVE_VERSION, fnv1a } from '../js/core/game.js';
import { sceneView, choose, goTo } from '../js/core/story.js';

let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; } else { fail++; console.error('  FAIL ', l); } };
const kindOf = (fn) => { try { fn(); return 'ok'; } catch (e) { return e instanceof SaveError ? e.kind : `other: ${e.message}`; } };

// 1. every file in saves/ loads, round-trips and plays 200 steps
const dir = new URL('../saves/', import.meta.url);
const files = readdirSync(dir).filter((f) => /\.(json|txt)$/.test(f));
// v0.11.9: a save shared to GitHub is packed: 'BAZ1:' + base64(gzip(save)), as main.js packText writes it
const unpack = (t) => (t.trim().startsWith('BAZ1:') ? gunzipSync(Buffer.from(t.trim().slice(5), 'base64')).toString('utf8') : t);
assert(files.length > 0, 'saves/ has files');
let rs = 4242;
const rnd = (n) => { rs = (rs * 1103515245 + 12345) >>> 0; return (rs >>> 8) % n; };
for (const f of files) {
    const raw = unpack(readFileSync(new URL(f, dir), 'utf8'));
    let g;
    try { g = deserialize(raw); } catch (e) { assert(false, `${f} loads (${e.message})`); continue; }
    assert(!!g?.james && typeof g.scene === 'string', `${f} loads (a game with James and a scene)`); // v0.11.21: was assert(true)
    assert(!!SCENES[g.scene], `${f}: scene ${g.scene} exists`);
    const again = deserialize(serialize(g));
    assert(JSON.stringify(again) === JSON.stringify(g), `${f}: save → load round trip is exact`);
    assert(peekSave(raw)?.scene === g.scene, `${f}: peek works`);
    for (let s = 0; s < 200; s++) {
        if (g.combat) { const o = combatStep(g, g.james.qi >= 3 ? 'blade' : 'dart'); if (o?.done) goTo(g, SCENES, o.next); continue; }
        const v = sceneView(g, SCENES);
        if (v.end) break;
        const open = v.choices.filter((c) => !c.disabled);
        if (!open.length) { assert(false, `${f}: dead end at ${g.scene}`); break; }
        const r = choose(g, SCENES, open[rnd(open.length)].index);
        if (r.combat) startCombat(g, r.combat(g));
    }
    assert(kindOf(() => deserialize(serialize(g))) === 'ok', `${f}: still saves and loads after 200 steps`);
}

// 2. the format's safety checks
const g = ensureBars(newGame(7));
const good = serialize(g);
assert(unpack('BAZ1:' + gzipSync(good).toString('base64')) === good, 'a packed save unpacks to the same text');
const outer = JSON.parse(good);
assert(outer.fmt === 1 && outer.sum === fnv1a(outer.data), 'wrapper has fmt and checksum');
assert(kindOf(() => deserialize(good)) === 'ok', 'a good save loads');
assert(kindOf(() => deserialize(JSON.stringify(g))) === 'ok', 'an old plain save loads');
const tampered = JSON.stringify({ ...outer, data: outer.data.replace('"minutes":', '"minutes":1') });
assert(kindOf(() => deserialize(tampered)) === 'checksum', 'a changed save fails its checksum');
assert(kindOf(() => deserialize(tampered, { force: true })) === 'ok', '"load anyway" ignores the checksum');
assert(kindOf(() => deserialize(good.slice(0, good.length / 2))) === 'unreadable', 'a cut-off save is unreadable');
assert(kindOf(() => deserialize(null)) === 'empty' && kindOf(() => deserialize('')) === 'empty', 'no save is "empty"');
assert(kindOf(() => deserialize('{"hello":1}')) === 'notSave', 'a foreign file is not a save');
const newer = { ...g, v: SAVE_VERSION + 1 };
assert(kindOf(() => deserialize(JSON.stringify(newer))) === 'tooNew', 'a newer state is reported, not wiped');
assert(kindOf(() => deserialize(JSON.stringify(newer), { force: true })) === 'ok', '"load anyway" reads a newer state');
const broken = ensureBars(newGame(8)); broken.james.qi = NaN;
assert(kindOf(() => serialize(broken)) === 'badNumbers', 'a state with NaN is never written');
const nanText = JSON.stringify({ ...g, minutes: '__X__' }).replace('"__X__"', '1e999');
assert(kindOf(() => deserialize(nanText)) === 'badNumbers', 'a save with Infinity is reported');
assert(kindOf(() => deserialize(nanText, { force: true })) === 'ok', '"load anyway" zeroes broken numbers');
const noV = { ...g }; delete noV.v;
assert(kindOf(() => deserialize(JSON.stringify(noV))) === 'ok', 'a save without a state version migrates');

// 3. v0.11.226 (owner pick FP1, the flip: MV + DK; RV1 after the Opus review): every old-calendar save in saves/ moves to the long
//    calendar on load (main.js checkScene → flipFill): its story day to the first day of that day's week, the hour kept; the day marks
//    with it; the rewind point too; then it plays on, saves and loads. A long-calendar save and a moved one are left alone. RV1 (H1, M1):
//    a save at 00:00–03:59 starts on the week's seventh night and that waking day's marks go to the week's last day.
{
    const { flipFill, flipMinutes, inAct1, advance, combatStep: cs, wakeDay } = await import('../js/core/game.js');
    const { calStart, calEnd, storyDay, weekNights, LONG_CAL: LC, BL_SPAN } = await import('../js/core/calendar.js');
    const { rewind } = await import('../js/core/coil.js');
    const { spacedFree, dayKey, day, markDaily } = await import('../js/story/common.js');
    let moved = 0, kept = 0, marks = 0, todays = 0, nights = 0;
    for (const f of files) {
        const g = deserialize(unpack(readFileSync(new URL(f, dir), 'utf8')));
        if (g.cal === LC) { const b = JSON.stringify(g); assert(flipFill(g) === false && JSON.stringify(g) === b, `FP1 ${f}: a long-calendar save is left alone`); kept++; continue; }
        const d = Math.floor(g.minutes / 1440) + 1, tod = g.minutes % 1440, act1 = inAct1(g), act = g.coil?.act || 0, night = tod < 240 && d > 1;
        const sd = g.coil?.snap ? Math.floor(g.coil.snap.minutes / 1440) + 1 : null, stod = g.coil?.snap ? g.coil.snap.minutes % 1440 : 0;
        const peekMin = flipMinutes(g.minutes, act);
        const dk = Object.keys(g.flags).filter((k) => /@-?\d+$/.test(k));
        const names = [...new Set(dk.map((k) => k.replace(/@-?\d+$/, '')))];
        // RV1 (TG2): done today by the waking day (dayKey, the daily cards) and by the calendar day (day(g), the Heart's talks), before and after
        const probe = () => Object.fromEntries(names.map((k) => [k, [spacedFree(g, k, dayKey(g)), spacedFree(g, k, day(g))]]));
        const free = probe();
        const gl = g.flags.guardian_lost_day, fd = g.flags.foundation_day;
        assert(flipFill(g) === true && g.cal === LC, `FP1 ${f}: moved to the long calendar`);
        moved++; marks += dk.length; if (night) nights++;
        const nd = Math.floor(g.minutes / 1440) + 1;
        assert(nd === calStart(g, d) && g.minutes % 1440 === tod, `FP1 ${f}: Day ${d} → the first day of its week (Day ${nd}, the hour kept)`);
        assert(peekMin === g.minutes, `FP1 ${f} (RV1, L2): the Saves screen's line shows the day it opens on (${peekMin} / ${g.minutes})`);
        assert(storyDay(g) === d && inAct1(g) === act1 && weekNights(g) === (night ? 6 : 0), `FP1 ${f}: the same story day (${storyDay(g)}), the same act, ${night ? 'the week\'s seventh night (RV1, H1)' : 'the week\'s first night'}`);
        assert(g.calBl === (act === 0 || d <= 10 ? BL_SPAN : 1), `FP1 ${f}: the Blackroot's days as blFill gives them (${g.calBl})`);
        const dk2 = Object.keys(g.flags).filter((k) => /@-?\d+$/.test(k));
        assert(dk2.length === dk.length, `FP1 ${f} (DK): every day mark kept (${dk.length} → ${dk2.length})`);
        const after = probe();
        for (const k of names) { if (!free[k][0]) todays++; assert(after[k][0] === free[k][0] && after[k][1] === free[k][1], `FP1 ${f} (DK, RV1 TG2): ${k} done today by the waking day and by the calendar day, before and after (${free[k]} / ${after[k]})`); }
        const to = (n) => (n < 1 ? n : night && n === d - 1 ? calEnd(g, n) : calStart(g, n));
        if (Number.isInteger(gl)) assert(g.flags.guardian_lost_day === to(gl), `FP1 ${f} (DK): the guardian's day moved`);
        if (Number.isInteger(fd)) assert(g.flags.foundation_day === to(fd), `FP1 ${f} (DK, RV1 TG6): Foundation's day moved`);
        if (sd) assert(g.coil.snap.cal === LC && g.coil.snap.minutes === (calStart(g.coil.snap, sd) - 1) * 1440 + stod, `FP1 ${f}: the rewind point moved (Day ${sd} → ${Math.floor(g.coil.snap.minutes / 1440) + 1})`);
        const b = JSON.stringify(g); assert(flipFill(g) === false && JSON.stringify(g) === b, `FP1 ${f}: a moved save is not moved again`);
        assert(JSON.stringify(deserialize(serialize(g))) === b, `FP1 ${f}: the moved save round-trips`);
        for (let s = 0; s < 200; s++) {
            if (g.combat) { const o = combatStep(g, g.james.qi >= 3 ? 'blade' : 'dart'); if (o?.done) goTo(g, SCENES, o.next); continue; }
            const v = sceneView(g, SCENES);
            if (v.end) break;
            const open = v.choices.filter((c) => !c.disabled);
            if (!open.length) { assert(false, `FP1 ${f}: dead end at ${g.scene} after the move`); break; }
            const r = choose(g, SCENES, open[rnd(open.length)].index);
            if (r.combat) startCombat(g, r.combat(g));
        }
        assert(kindOf(() => deserialize(serialize(g))) === 'ok' && g.cal === LC, `FP1 ${f}: plays on 200 steps on the long calendar and still saves`);
        if (sd) { const h = deserialize(unpack(readFileSync(new URL(f, dir), 'utf8'))); flipFill(h); rewind(h);
            assert(h.cal === LC && Math.floor(h.minutes / 1440) + 1 === calStart(h, sd), `FP1 ${f}: a rewind lands on the moved rewind point (Day ${Math.floor(h.minutes / 1440) + 1}, the long calendar)`); }
    }
    assert(moved >= 30 && kept >= 3 && marks > 1000 && todays > 0 && nights >= 1, `FP1: ${moved} old saves moved (${marks} day marks, ${todays} done today kept, ${nights} at night), ${kept} long ones left alone`);
    // a new old-calendar game (the tests' default) on Day 1: nothing but the fields; an Act 1 dawn moves to Day 44
    const n = ensureBars(newGame(11)); flipFill(n);
    assert(n.cal === LC && n.minutes === newGame(11, { cal: LC }).minutes && n.calBl === BL_SPAN, 'FP1: a Day 1 game moves to Day 1 of the long calendar');
    const a1 = ensureBars(newGame(12)); a1.minutes = 7 * 1440 + 360; a1.flags.ending = 'accord'; a1.flags['forage@8'] = true; a1.flags['x@0'] = true; a1.flags.guardian_lost_day = 8; a1.flags.foundation_day = 5; flipFill(a1);
    assert(a1.minutes === 43 * 1440 + 360 && inAct1(a1) && a1.flags['forage@44'] && !a1.flags['forage@8'] && a1.flags['x@0'] && a1.flags.guardian_lost_day === 44 && a1.flags.foundation_day === 29, 'FP1: Act 1\'s Day 8 dawn → Day 44; its marks, the guardian\'s and Foundation\'s days with it (RV1, TG6); a mark of day 0 stays');
    // RV1 (TG4): the Blackroot's boundary: an Act 1 save on Day 10 (the Fallout's last) gets the camps, one on Day 11 the 5-day road
    for (const [dd, bl] of [[10, BL_SPAN], [11, 1]]) { const t = ensureBars(newGame(13)); t.coil.act = 1; t.flags.ending = 'accord'; t.minutes = (dd - 1) * 1440 + 600; flipFill(t);
        assert(t.calBl === bl && storyDay(t) === dd, `FP1 (RV1, TG4): an Act 1 save on Day ${dd} gets calBl ${bl} (${t.calBl})`); }
    // RV1 (M1, TG2): a daily card done in the evening of day d − 1, the save at Day d 00:30: still done after the move (9 of 9 lost it before)
    let lost = 0;
    for (const dd of [2, 3, 4, 5, 6, 7, 9, 10, 17]) { const t = ensureBars(newGame(5)); t.minutes = (dd - 2) * 1440 + 1200; markDaily(t, 'probe_fp1');
        advance(t, (dd - 1) * 1440 + 30 - t.minutes); const b0 = spacedFree(t, 'probe_fp1', dayKey(t)); flipFill(t);
        if (spacedFree(t, 'probe_fp1', dayKey(t)) !== b0 || b0) lost++;
        assert(wakeDay(t) === calEnd(t, dd - 1), `FP1 (RV1, M1): Day ${dd} 00:30 is still the evening's waking day (${wakeDay(t)})`); }
    assert(lost === 0, `FP1 (RV1, M1): a card done the evening before stays done after a night move (${lost} of 9 reopened)`);
    for (const [m, w] of [[30, 6], [239, 6], [240, 0], [1439, 0]]) { const t = ensureBars(newGame(6)); t.minutes = 4 * 1440 + m; flipFill(t);
        assert(weekNights(t) === w, `FP1 (RV1, H1): a save at ${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')} on Day 5 starts on night ${w} of the week (${weekNights(t)})`); }
    // RV1 (H1, TG1): an old game played to the first forest night event (Day 2, 01:xx) or to the fire night (vday 2, after midnight),
    // moved, then played on: the counter turns at the next morning, the tribute on Day 43, Act 1 on Day 44 (its rewind point too), the fire shows
    const pol = (g) => { const v = sceneView(g, SCENES); const c = v.choices.filter((x) => !x.disabled); if (!c.length) return null;
        return c.find((x) => /^(Sleep|Get up|Go to bed|Turn in|Bed|Lie down|Climb out)/i.test(String(x.text))) || c.find((x) => !/Stay lost|Long Forest|Go back|Rewind|again/i.test(String(x.text)) && !x.work) || c[0]; };
    const step = (g) => { if (g.combat) { const o = combatStep(g, 'blade'); if (o?.done) goTo(g, SCENES, o.next); return true; } const c = pol(g); if (!c) return false; const r = choose(g, SCENES, c.index); if (r.combat) startCombat(g, r.combat(g)); return true; };
    let reached = 0, fire = 0;
    for (const seed of [12, 14, 17]) {
        const g = ensureBars(newGame(seed, { closed: true }));
        for (let s = 0; s < 4000 && g.scene !== 'night_event'; s++) if (!step(g)) break;
        if (g.scene !== 'night_event') continue;
        assert(g.minutes % 1440 < 240, `FP1 (RV1, TG1) seed ${seed}: the night event rests after midnight (${g.minutes % 1440} min)`);
        flipFill(g); let trib = 0;
        for (let s = 0; s < 20000 && !inAct1(g); s++) { if (g.scene === 'tribute' && !trib) trib = Math.floor(g.minutes / 1440) + 1; if (!step(g) || (g.coil?.n || 1) > 1) break; }
        if (!inAct1(g)) continue;
        reached++;
        assert(trib === 43 && Math.floor(g.minutes / 1440) + 1 === 44 && Math.floor(g.coil.snap.minutes / 1440) + 1 === 44, `FP1 (RV1, H1) seed ${seed}: a forest night moved: the tribute on Day 43 (${trib}), Act 1 and its rewind point on Day 44 (${Math.floor(g.minutes / 1440) + 1} / ${Math.floor(g.coil.snap.minutes / 1440) + 1}; Day 49 and 50 before RV1)`);
    }
    for (const seed of [12, 14, 17, 20, 21]) {
        const g = ensureBars(newGame(seed, { closed: true })); let hit = false;
        for (let s = 0; s < 6000; s++) { if (g.scene === 'village_night' && g.flags.vday === 2 && g.minutes % 1440 < 240) { hit = true; break; } if ((g.coil?.n || 1) > 1 || g.flags.ending || !step(g)) break; }
        if (!hit) continue;
        const t0 = String(SCENES.village_night.text(g)); flipFill(g); const t1 = String(SCENES.village_night.text(g));
        assert(/fire/.test(t0) && t1 === t0, `FP1 (RV1, H1) seed ${seed}: the fire night moved still shows the fire`); fire++; break;
    }
    assert(reached >= 2 && fire === 1, `FP1 (RV1, TG1): ${reached} forest nights moved and played to Act 1, ${fire} fire night moved`);
    const M = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
    // RV1 (TG3): every deserialize in main.js is a load through checkScene (Import and Restore all too), and checkScene moves an old save
    assert(/function checkScene\(s\) \{ if \(!oldCalTest\(\)\) flipFill\(s\);/.test(M) && (M.match(/deserialize\(/g) || []).length === (M.match(/checkScene\(deserialize\(/g) || []).length && (M.match(/checkScene\(deserialize\(/g) || []).length >= 9, 'FP1 (main.js, RV1 TG3): every load goes through checkScene, which moves an old save (not under the browser test\'s key)');
    assert(/clockLabel\(p\.cal === LONG_CAL \|\| oldCalTest\(\) \? p\.minutes : flipMinutes\(p\.minutes, p\.act\)\)/.test(M), 'FP1 (main.js, RV1 L2): the Saves screen\'s lines show the moved day');
    // RV1 (TG5): What's new's numbers from the calendar
    const N = readFileSync(new URL('../js/core/news.js', import.meta.url), 'utf8'), line = (/\['0\.11\.226', '([^\n]*)'\],/.exec(N) || [])[1] || '';
    const lg = newGame(1, { cal: LC });
    const want = [['the tribute on Day', calStart(lg, 7)], ['the Elder on Day', calStart(lg, 21)], ['Day 6 becomes Day', flipMinutes(5 * 1440 + 600, 0) / 1440 + 1 - 600 / 1440], ['Day 12 Day', flipMinutes(11 * 1440 + 600, 1) / 1440 + 1 - 600 / 1440]];
    for (const [w, v] of want) assert(new RegExp(`${w} ${v}\\b`).test(line), `FP1 (RV1, TG5): What's new says "${w} ${v}"`);
}

console.log(`saves: ${files.length} files · ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
