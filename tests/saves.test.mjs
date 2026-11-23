// Run: node tests/saves.test.mjs — every file in saves/ must load and play on; the save format's safety checks.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
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
    // v0.11.259 (owner pick OC-A, OC4): each old save's reading before the move (its act, and each card's done-today by the waking day and
    // by the calendar day), frozen in tests/flip-before.json by this build's old-calendar reader, so the move's checks still have their
    // "before" once that reader goes (OC2, the next push). `--write-flip-before` writes it again (only while the old reader exists);
    // each entry carries its save's sha-256, so a changed save shows. While the reader exists, the live reading must equal the frozen one.
    const FB_PATH = new URL('flip-before.json', import.meta.url), FB_WRITE = process.argv.includes('--write-flip-before');
    const FB = FB_WRITE || !existsSync(FB_PATH) ? {} : JSON.parse(readFileSync(FB_PATH, 'utf8'));
    let fbN = 0;
    for (const f of files) {
        const rawF = readFileSync(new URL(f, dir), 'utf8'), sha = createHash('sha256').update(rawF).digest('hex');
        const g = deserialize(unpack(rawF));
        if (g.cal === LC) { const b = JSON.stringify(g); assert(flipFill(g) === false && JSON.stringify(g) === b, `FP1 ${f}: a long-calendar save is left alone`); kept++; continue; }
        const d = Math.floor(g.minutes / 1440) + 1, tod = g.minutes % 1440, act1 = inAct1(g), act = g.coil?.act || 0, night = tod < 240 && d > 1;
        const sd = g.coil?.snap ? Math.floor(g.coil.snap.minutes / 1440) + 1 : null, stod = g.coil?.snap ? g.coil.snap.minutes % 1440 : 0;
        const peekMin = flipMinutes(g.minutes, act);
        const dk = Object.keys(g.flags).filter((k) => /@-?\d+$/.test(k));
        const names = [...new Set(dk.map((k) => k.replace(/@-?\d+$/, '')))];
        // RV1 (TG2): done today by the waking day (dayKey, the daily cards) and by the calendar day (day(g), the Heart's talks), before and after
        const probe = () => Object.fromEntries(names.map((k) => [k, [spacedFree(g, k, dayKey(g)), spacedFree(g, k, day(g))]]));
        const live = { act1, free: probe() };
        if (FB_WRITE) FB[f] = { sha, ...live };
        const fb = FB[f];
        assert(fb && fb.sha === sha, `FP1 ${f} (OC4): its frozen reading in tests/flip-before.json, for this very save (${fb ? 'sha differs' : 'none'})`);
        if (!fb) continue;
        fbN++;
        assert(JSON.stringify(live) === JSON.stringify({ act1: fb.act1, free: fb.free }), `FP1 ${f} (OC4): the frozen reading equals the old-calendar reader's (until OC2 takes the reader)`);
        const free = fb.free;
        const gl = g.flags.guardian_lost_day, fd = g.flags.foundation_day;
        assert(flipFill(g) === true && g.cal === LC, `FP1 ${f}: moved to the long calendar`);
        moved++; marks += dk.length; if (night) nights++;
        const nd = Math.floor(g.minutes / 1440) + 1;
        assert(nd === calStart(g, d) && g.minutes % 1440 === tod, `FP1 ${f}: Day ${d} → the first day of its week (Day ${nd}, the hour kept)`);
        assert(peekMin === g.minutes, `FP1 ${f} (RV1, L2): the Saves screen's line shows the day it opens on (${peekMin} / ${g.minutes})`);
        assert(storyDay(g) === d && inAct1(g) === fb.act1 && weekNights(g) === (night ? 6 : 0), `FP1 ${f}: the same story day (${storyDay(g)}), the same act, ${night ? 'the week\'s seventh night (RV1, H1)' : 'the week\'s first night'}`);
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
    if (FB_WRITE) writeFileSync(FB_PATH, `${JSON.stringify(FB, null, 1)}\n`);
    assert(fbN === moved && Object.keys(FB).length === moved, `FP1 (OC4): every moved save read against its frozen reading, none left over (${fbN} / ${moved} / ${Object.keys(FB).length})`);
    assert(moved >= 30 && kept >= 3 && marks > 1000 && todays > 0 && nights >= 1, `FP1: ${moved} old saves moved (${marks} day marks, ${todays} done today kept, ${nights} at night), ${kept} long ones left alone`);
    // a new old-calendar game (the tests' default) on Day 1: nothing but the fields; an Act 1 dawn moves to Day 44
    const n = ensureBars(newGame(11, { cal: 0 })); flipFill(n);
    assert(n.cal === LC && n.minutes === newGame(11, { cal: LC }).minutes && n.calBl === BL_SPAN, 'FP1: a Day 1 game moves to Day 1 of the long calendar');
    const a1 = ensureBars(newGame(12, { cal: 0 })); a1.minutes = 7 * 1440 + 360; a1.flags.ending = 'accord'; a1.flags['forage@8'] = true; a1.flags['x@0'] = true; a1.flags.guardian_lost_day = 8; a1.flags.foundation_day = 5; flipFill(a1);
    assert(a1.minutes === 43 * 1440 + 360 && inAct1(a1) && a1.flags['forage@44'] && !a1.flags['forage@8'] && a1.flags['x@0'] && a1.flags.guardian_lost_day === 44 && a1.flags.foundation_day === 29, 'FP1: Act 1\'s Day 8 dawn → Day 44; its marks, the guardian\'s and Foundation\'s days with it (RV1, TG6); a mark of day 0 stays');
    // RV1 (TG4): the Blackroot's boundary: an Act 1 save on Day 10 (the Fallout's last) gets the camps, one on Day 11 the 5-day road
    for (const [dd, bl] of [[10, BL_SPAN], [11, 1]]) { const t = ensureBars(newGame(13, { cal: 0 })); t.coil.act = 1; t.flags.ending = 'accord'; t.minutes = (dd - 1) * 1440 + 600; flipFill(t);
        assert(t.calBl === bl && storyDay(t) === dd, `FP1 (RV1, TG4): an Act 1 save on Day ${dd} gets calBl ${bl} (${t.calBl})`); }
    // RV1 (M1, TG2): a daily card done in the evening of day d − 1, the save at Day d 00:30: still done after the move (9 of 9 lost it before)
    let lost = 0;
    for (const dd of [2, 3, 4, 5, 6, 7, 9, 10, 17]) { const t = ensureBars(newGame(5, { cal: 0 })); t.minutes = (dd - 2) * 1440 + 1200; markDaily(t, 'probe_fp1');
        advance(t, (dd - 1) * 1440 + 30 - t.minutes); const b0 = spacedFree(t, 'probe_fp1', dayKey(t)); flipFill(t);
        if (spacedFree(t, 'probe_fp1', dayKey(t)) !== b0 || b0) lost++;
        assert(wakeDay(t) === calEnd(t, dd - 1), `FP1 (RV1, M1): Day ${dd} 00:30 is still the evening's waking day (${wakeDay(t)})`); }
    assert(lost === 0, `FP1 (RV1, M1): a card done the evening before stays done after a night move (${lost} of 9 reopened)`);
    for (const [m, w] of [[30, 6], [239, 6], [240, 0], [1439, 0]]) { const t = ensureBars(newGame(6, { cal: 0 })); t.minutes = 4 * 1440 + m; flipFill(t);
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
    assert(/function checkScene\(s\) \{ flipFill\(s\);/.test(M) && !/oldCalTest|OLD_CAL_KEY|'boneash\.oldcal'/.test(M) && (M.match(/deserialize\(/g) || []).length === (M.match(/checkScene\(deserialize\(/g) || []).length && (M.match(/checkScene\(deserialize\(/g) || []).length >= 9, 'FP1 (main.js, RV1 TG3; v0.11.259 OC-A, OC3): every load goes through checkScene, which moves an old save (no old-calendar key read any more)');
    assert(/clockLabel\(p\.cal === LONG_CAL \? p\.minutes : flipMinutes\(p\.minutes, p\.act\)\)/.test(M), 'FP1 (main.js, RV1 L2): the Saves screen\'s lines show the moved day');
    // RV1 (TG5): What's new's numbers from the calendar
    const N = readFileSync(new URL('../js/core/news.js', import.meta.url), 'utf8'), line = (/\['0\.11\.226', '([^\n]*)'\],/.exec(N) || [])[1] || '';
    const lg = newGame(1, { cal: LC });
    const want = [['the tribute on Day', calStart(lg, 7)], ['the Elder on Day', calStart(lg, 21)], ['Day 6 becomes Day', flipMinutes(5 * 1440 + 600, 0) / 1440 + 1 - 600 / 1440], ['Day 12 Day', flipMinutes(11 * 1440 + 600, 1) / 1440 + 1 - 600 / 1440]];
    for (const [w, v] of want) assert(new RegExp(`${w} ${v}\\b`).test(line), `FP1 (RV1, TG5): What's new says "${w} ${v}"`);
}

// 4. v0.11.227 (owner pick KA1 + XW-a, DW-a): the realm kept for a won game. Each won clear of Act 1 (victory, revelation, accord; the bite
//    with why 'clear') adds 1 to stats.clears and keeps the realm James had then in stats.keptTop; every later Coil, of the act or of the
//    whole game, starts at min(clears, keptTop) or above, Yuki too, the Mortal Vessel meridians open with their Convergence XP (KL-x),
//    and from Nascent Soul the Extraordinary 8 and their 28 collaterals (XW-a). Old saves start at 0; one at the act's end bites in.
{
    const { rewind, endCoil, keptRealm, keptAfterClear, liftKept, KEPT_EXTRA_FROM } = await import('../js/core/coil.js');
    const { jamesHpMax, jamesQiMax, yukiHpMax } = await import('../js/core/game.js');
    const rank = (n) => 10 * (n.tier - 1) + n.level;
    const won = (seed, outcome, realm, cal = 7) => { const g = ensureBars(newGame(seed, { closed: true, cal })); g.coil.act = 1; g.james.realm = realm; g.flags.a1_outcome = outcome; goTo(g, SCENES, 'a1_end'); return g; };
    const biteFrom = (g, re) => { goTo(g, SCENES, 'a1_again'); const c = sceneView(g, SCENES).choices.find((x) => re.test(x.label)); return c ? choose(g, SCENES, c.index) : null; };
    // KG-b: every won ending counts, from the act's end (a1_again) and from the James tab's path (endCoil 'clear' + the Coil screen)
    for (const o of ['victory', 'revelation', 'accord']) {
        const g = won(31, o, 2); const r = biteFrom(g, /whole game/);
        assert(g.stats.clears === 1 && g.stats.keptTop === 2 && keptRealm(g) === 1 && g.james.realm === 1 && g.yuki.realm === 1, `KA1 (KG-b): a won ${o} keeps one realm (clears ${g.stats.clears}, top ${g.stats.keptTop}, realm ${g.james.realm} / Yuki ${g.yuki.realm})`);
        assert(g.scene === 'coil_dawn' && g.coil.kept === 1 && r.lines.some((l) => /^Kept from 1 won clear of Act 1: Foundation, for you and Yuki/.test(l)), `KA1 (KT): ${o}: the first dawn's Results name the kept realm`);
        const t = String(sceneView(g, SCENES).text);
        assert(/it kept Foundation\. The meridians are open, primaries and collaterals at the least\./.test(t) && !/The meridians are ash again/.test(t), `KA1 (DW-a): ${o}: the prologue's dawn says the body kept the realm`);
    }
    { const g = won(32, 'victory', 4); endCoil(g, 'clear', 'a1_end'); goTo(g, SCENES, 'coil_end');
      const t = String(sceneView(g, SCENES).text);
      assert(/start over, but never below Foundation, kept from 1 won clear of Act 1/.test(t) && keptAfterClear(g) === 1, 'KA1 (KT): the Coil screen after a won clear names the floor the next Coil wakes at');
      const c = sceneView(g, SCENES).choices.find((x) => /start of the whole game/.test(x.label)); choose(g, SCENES, c.index);
      assert(g.stats.clears === 1 && g.james.realm === 1, 'KA1: the James tab\'s path (endCoil clear, the Coil screen) counts the clear'); }
    // not a clear: 'taken', a bite by choice, a collapse
    { const g = won(33, 'taken', 3); biteFrom(g, /whole game/); assert(!g.stats.clears && g.james.realm === 0 && !g.coil.kept, 'KA1: going round after taken keeps nothing'); }
    { const g = ensureBars(newGame(34, { closed: true, cal: 7 })); g.james.realm = 2; endCoil(g, 'collapse'); rewind(g); assert(!g.stats.clears && g.james.realm === 0, 'KA1: a collapse keeps nothing'); }
    { const g = ensureBars(newGame(35, { closed: true, cal: 7 })); g.coil.act = 1; g.james.realm = 2; endCoil(g, 'choice'); rewind(g); assert(!g.stats.clears && g.james.realm === 0, 'KA1: a bite by choice keeps nothing'); }
    // KC: never above the realm at a won clear; KB-a: a floor, one realm a clear
    { const g = won(36, 'accord', 0); biteFrom(g, /whole game/); assert(g.stats.clears === 1 && keptRealm(g) === 0 && g.james.realm === 0 && !g.coil.kept && /The meridians are ash again/.test(String(sceneView(g, SCENES).text)), 'KA1 (KC): a clear at Mortal Vessel keeps nothing (the old dawn)');
      g.coil.act = 1; g.james.realm = 1; g.flags.a1_outcome = 'victory'; goTo(g, SCENES, 'a1_end'); biteFrom(g, /whole game/);
      assert(g.stats.clears === 2 && g.stats.keptTop === 1 && keptRealm(g) === 1 && g.james.realm === 1, 'KA1 (KC): two clears, the best at Foundation, keep Foundation');
      g.coil.act = 1; g.james.realm = 5; g.flags.a1_outcome = 'revelation'; goTo(g, SCENES, 'a1_end'); biteFrom(g, /whole game/);
      assert(g.stats.clears === 3 && keptRealm(g) === 3 && g.james.realm === 3, 'KA1 (KB-a): three clears keep three realms, not the realm reached (5)'); }
    // every later Coil: a prologue rewind in the next pass, and an Act 1 rewind below / above the floor
    { const g = won(37, 'victory', 2); biteFrom(g, /whole game/); g.coil.n; endCoil(g, 'collapse'); rewind(g);
      assert(g.james.realm === 1 && g.coil.kept === 1, 'KA1: a prologue rewind in the next pass keeps the floor');
      g.coil.act = 1; g.coil.snap.james.realm = 0; g.flags.a1_outcome = 'accord'; g.james.realm = 3; goTo(g, SCENES, 'a1_end'); biteFrom(g, /start of Act 1/);
      assert(g.coil.act === 1 && g.james.realm === 2 && g.coil.kept === 2, 'KA1: an Act 1 rewind from a snapshot below the floor wakes at it');
      g.coil.snap.james.realm = 4; g.flags.a1_outcome = 'taken'; goTo(g, SCENES, 'a1_end'); const r = biteFrom(g, /start of Act 1/);
      assert(g.james.realm === 4 && !g.coil.kept && !r.lines.some((l) => /^Kept from/.test(l)), 'KA1: an Act 1 snapshot above the floor is kept as it is (no lift, no line)'); }
    // KL-x: the lift itself (James and Yuki, the meridians, Saturation, the bars, the XP)
    { const g = ensureBars(newGame(38, { closed: true, cal: 7 })); g.stats.clears = 3; g.stats.keptTop = 3; g.james.primaries = 5; g.james.saturation = 40;
      const gu0 = rank(g.james.gu); const k = liftKept(g); ensureBars(g);
      assert(k === 3 && g.james.realm === 3 && g.yuki.realm === 3 && g.james.primaries === 12 && g.james.collaterals === 66 && g.yuki.primaries === 12 && g.yuki.collaterals === 66 && !g.james.colSealed && g.james.saturation === 0, 'KA1 (KL-x): realm 3, Yuki 3, every Mortal Vessel meridian open, Saturation 0');
      assert(rank(g.james.gu) > gu0 && g.james.hp === jamesHpMax(g) && g.james.qi === jamesQiMax(g) && g.yuki.hp === yukiHpMax(g), 'KA1 (KL-x): the Convergence XP is given and the bars are full');
      assert(liftKept(g) === 0, 'KA1: a second lift at the same realm changes nothing');
      const a = ensureBars(newGame(39, { closed: true, cal: 7 })), b = ensureBars(newGame(39, { closed: true, cal: 7 }));
      a.stats.clears = b.stats.clears = 1; a.stats.keptTop = b.stats.keptTop = 1; b.james.primaries = 12; b.james.collaterals = 66;
      liftKept(a); liftKept(b); assert(rank(a.james.gu) > rank(b.james.gu), 'KA1 (KL-x): the XP is for the channels still shut (none shut, no XP)'); }
    // XW-a: from Nascent Soul the Extraordinary 8 and their collaterals too; below it they stay for the player to open
    { const g = ensureBars(newGame(40, { closed: true, cal: 7 })); g.stats.clears = 7; g.stats.keptTop = 9; liftKept(g);
      const o = ensureBars(newGame(40, { closed: true, cal: 7 })); o.stats.clears = 7; o.stats.keptTop = 9; Object.assign(o.james, { extra8: 8, extraCollaterals: 28 }); liftKept(o);
      const tot = (n) => rank(n) * 1e6 + (n.xp || 0);
      assert(tot(g.james.gu) > tot(o.james.gu), `KA1 (XW-a): the Extraordinary lines' XP is given for those still shut (${JSON.stringify(g.james.gu)} vs already open ${JSON.stringify(o.james.gu)})`);
      assert(KEPT_EXTRA_FROM === 7 && g.james.realm === 7 && g.james.extra8 === 8 && g.james.extraCollaterals === 28 && !g.james.junctions, 'KA1 (XW-a): at Nascent Soul the Extraordinary 8 and 28 collaterals open, the junctions not');
      const h = ensureBars(newGame(41, { closed: true, cal: 7 })); h.stats.clears = 6; h.stats.keptTop = 6; liftKept(h);
      assert(h.james.realm === 6 && !h.james.extra8 && !h.james.extraCollaterals, 'KA1 (XW-a): at Soul Embryo they stay shut (their window is open)'); }
    // the old calendar the same
    { const g = won(42, 'victory', 1, 0); biteFrom(g, /whole game/); assert(g.james.realm === 1 && g.stats.clears === 1, 'KA1: the old calendar keeps the realm too'); }
    // KS: old saves start at 0, and one at the act's end with a won ending counts when it bites (the owner's a1_again, victory)
    for (const f of files) {
        const g = deserialize(unpack(readFileSync(new URL(f, dir), 'utf8')));
        assert(keptRealm(g) === 0, `KA1 (KS): ${f} starts with no kept realm`);
        if (g.coil?.act === 1 && /^(a1_end|a1_again)$/.test(g.scene) && ['victory', 'revelation', 'accord'].includes(g.flags.a1_outcome) && !g.stats?.clears) {
            const R = g.james.realm; const r = biteFrom(g, /whole game/);
            assert(r && g.stats.clears === 1 && g.stats.keptTop === R && g.james.realm === Math.min(1, R), `KA1 (KS): ${f} (${R}) bites into a kept realm`);
            assert(kindOf(() => deserialize(serialize(g))) === 'ok', `KA1 (KS): ${f} saves and loads after the bite`);
        }
    }
    const src = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
    // KA1's RV1 (the Opus review's TG1–TG8)
    {
        const { awardXp } = await import('../js/core/game.js');
        const { coilReport, keptTabText, tabWhy } = await import('../js/core/coil.js');
        const { ykHumanAtStart } = await import('../js/story/yuki_path.js');
        const xpOf = (seed, prep, extra = 0) => { const g = ensureBars(newGame(seed, { closed: true, cal: 7 })); prep(g); const before = JSON.stringify(g.james.gu); liftKept(g); return { g, before }; };
        // TG1 + TG2: the exact awards: a fresh lift to Foundation is 20 standard (12 primaries, 8 groups); to Nascent Soul 20 standard and 36 challenging
        const same = (k, n1, n2) => { const a = ensureBars(newGame(50, { closed: true, cal: 7 })), b = ensureBars(newGame(50, { closed: true, cal: 7 }));
            a.stats.clears = b.stats.clears = k; a.stats.keptTop = b.stats.keptTop = k; liftKept(a);
            Object.assign(b.james, { realm: k, saturation: 0, primaries: 12, collaterals: 66 }); Object.assign(b.yuki, { realm: k, primaries: 12, collaterals: 66 }); if (k >= 7) Object.assign(b.james, { extra8: 8, extraCollaterals: 28 });
            for (let i = 0; i < n1; i++) awardXp(b, 'Convergence Use', 'standard'); for (let i = 0; i < n2; i++) awardXp(b, 'Convergence Use', 'challenging');
            return JSON.stringify([a.james.gu, a.james.skills['Convergence Use'], a.yuki.fight]) === JSON.stringify([b.james.gu, b.james.skills['Convergence Use'], b.yuki.fight]); };
        assert(same(1, 20, 0) && !same(1, 21, 0) && !same(1, 66, 0), 'KA1 (RV1, TG2): a fresh lift to Foundation gives exactly 20 standard Convergence awards (12 primaries, 8 collateral groups)');
        assert(same(7, 20, 36) && !same(7, 20, 35) && !same(7, 20, 0), 'KA1 (RV1, TG1): a fresh lift to Nascent Soul gives 20 standard and exactly 36 challenging (8 vessels, 28 collaterals)');
        { const a = ensureBars(newGame(51, { closed: true, cal: 7 })), b = ensureBars(newGame(51, { closed: true, cal: 7 }));
          for (const x of [a, b]) { x.stats.clears = 7; x.stats.keptTop = 7; } Object.assign(b.james, { extra8: 8, extraCollaterals: 20 }); liftKept(a); liftKept(b);
          const c = ensureBars(newGame(51, { closed: true, cal: 7 })); Object.assign(c.james, { realm: 7, saturation: 0, primaries: 12, collaterals: 66, extra8: 8, extraCollaterals: 28 }); Object.assign(c.yuki, { realm: 7, primaries: 12, collaterals: 66 });
          for (let i = 0; i < 20; i++) awardXp(c, 'Convergence Use', 'standard'); for (let i = 0; i < 8; i++) awardXp(c, 'Convergence Use', 'challenging');
          assert(JSON.stringify(b.james.gu) === JSON.stringify(c.james.gu), 'KA1 (RV1, TG1): XW-a pays only for the Extraordinary lines still shut (8 vessels open, 20 of 28 collaterals: 8 awards)'); }
        // TG3: the James tab's path as main.js runs it (tabWhy → endCoil → the Coil screen → the bite) and its line
        { const M = src('js/main.js');
          assert(/endCoil\(g, tabWhy\(g\), g\.scene\);[^\n]*\n\s*lastResult = null; lastReply = \[\]; goTo\(g, SCENES, 'coil_end'\)/.test(M) && /const keptTabLine = \(g\) => `<p class="note"><b>Kept realm:<\/b> \$\{esc\(keptTabText\(g\)\)\}<\/p>`;/.test(M), 'KA1 (RV1, TG3): the James tab bites through tabWhy, endCoil and the Coil screen, and draws keptTabText');
          const g = won(52, 'revelation', 3);
          assert(/^Each won clear of Act 1 \(victory, revelation or accord\) keeps one realm[^.]*\. A bite now keeps Foundation\.$/.test(keptTabText(g)), `KA1 (RV1, TG3): the tab before the first clear (${keptTabText(g)})`);
          endCoil(g, tabWhy(g), g.scene); goTo(g, SCENES, 'coil_end'); const c = sceneView(g, SCENES).choices.find((x) => /whole game/.test(x.label)); choose(g, SCENES, c.index); choose(g, SCENES, 0);
          assert(g.stats.clears === 1 && g.james.realm === 1 && keptTabText(g) === 'Kept from 1 won clear of Act 1: no Coil starts below Foundation (James and Yuki, the Mortal Vessel meridians open).', `KA1 (RV1, TG3): the tab's bite counts, and the tab then says what is kept (${keptTabText(g)})`);
          const t = won(53, 'taken', 3); t.stats.clears = 2; t.stats.keptTop = 3;
          assert(!/A bite now keeps/.test(keptTabText(t)) && tabWhy(t) === 'choice', 'KA1 (RV1, TG3): after taken the tab promises nothing');
          const r = won(54, 'accord', 1); r.stats.clears = 1; r.stats.keptTop = 4;
          assert(!/A bite now keeps/.test(keptTabText(won(55, 'victory', 0))) && /A bite now keeps Core Formation/.test(keptTabText(r)), 'KA1 (RV1, TG3): the tab promises a realm only when the bite would raise it'); }
        // TG4: the cap keeps the highest realm at a won clear
        { const g = won(56, 'victory', 4); biteFrom(g, /whole game/); g.coil.act = 1; g.james.realm = 2; g.flags.a1_outcome = 'accord'; goTo(g, SCENES, 'a1_end'); biteFrom(g, /whole game/);
          assert(g.stats.keptTop === 4 && g.stats.clears === 2 && g.james.realm === 2, 'KA1 (RV1, TG4): a later clear at a lower realm keeps the highest (4)'); }
        // TG5: a sealed Foundation snapshot lifted higher is unsealed with its collaterals open
        { const g = ensureBars(newGame(57, { closed: true, cal: 7 })); Object.assign(g.james, { realm: 1, primaries: 12, collaterals: 34, colSealed: true }); g.stats.clears = 2; g.stats.keptTop = 2; liftKept(g);
          assert(g.james.realm === 2 && g.james.collaterals === 66 && g.james.colSealed === false && g.yuki.collaterals === 66, 'KA1 (RV1, TG5): a sealed Foundation lifted to Core Formation opens its collaterals and is not sealed'); }
        // TG6: the Coil screen doesn't count the kept realm as this Coil's gain
        { const g = won(58, 'victory', 2); biteFrom(g, /whole game/); assert(g.coil.start.realm === 1 && !coilReport(g).gained.some((x) => /^realm/.test(x)), 'KA1 (RV1, TG6): the Coil starts at the kept realm (no "realm +1" for it)'); }
        // TG7: the Results line on an Act 1 rewind lifted to the floor, and its plural
        { const g = won(59, 'victory', 3); g.stats.clears = 2; g.stats.keptTop = 3; g.coil.snap.james.realm = 0; const r = biteFrom(g, /start of Act 1/);
          assert(g.coil.act === 1 && g.james.realm === 3 && r.lines.some((l) => l === 'Kept from 3 won clears of Act 1: True Core, for you and Yuki, with the Mortal Vessel meridians open.'), `KA1 (RV1, TG7): an Act 1 rewind lifted to the floor names it, plural (${r.lines.join(' | ')})`); }
        // TG8 (M1a): the arrival's Yuki screen after a kept bite, and the old one without
        { const g = won(60, 'victory', 2); biteFrom(g, /whole game/); choose(g, SCENES, 0);
          const c = sceneView(g, SCENES).choices.find((x) => /Check Yuki over first/.test(x.label)); choose(g, SCENES, c.index);
          const t = String(sceneView(g, SCENES).text);
          assert(g.scene === 'yuki_check' && /Foundation, the pair of you, and it made the trip intact\. At home that still gets you seated with the children\. Nobody here needs to hear it\./.test(t) && !/Mortal Vessel/.test(t), 'KA1 (RV1, M1a, TG8): the arrival\'s Yuki screen after a kept bite names the kept realm');
          const h = ensureBars(newGame(61, { closed: true, cal: 7 })); const c2 = sceneView(h, SCENES).choices.find((x) => /Check Yuki over first/.test(x.label)); choose(h, SCENES, c2.index);
          assert(/Mortal Vessel, the pair of you\. Young, as your people count it\. Larval, near enough\./.test(String(sceneView(h, SCENES).text)), 'KA1 (RV1, M1a): a new game keeps the old line'); }
        // L2: Yuki's human shape from a realm kept on this Coil's rewind
        { const g = won(62, 'victory', 7); g.stats.clears = 7; g.stats.keptTop = 7; g.coil.snap.james.realm = 3; g.coil.snap.yuki.realm = 3; biteFrom(g, /start of Act 1/);
          assert(g.coil.kept === 7 && ykHumanAtStart(g), 'KA1 (RV1, L2): an Act 1 rewind lifted to Nascent Soul counts her human shape from the dawn');
          const h = won(63, 'victory', 3); biteFrom(h, /start of Act 1/); assert(!ykHumanAtStart(h), 'KA1 (RV1, L2): below Nascent Soul she has no human shape at the dawn'); }
    }
    assert(/<b>Kept realm:<\/b>/.test(src('js/main.js')) && /\$\{keptTabLine\(g\)\}/.test(src('js/main.js')), 'KA1 (KT): the James tab shows the kept realm');
    assert(/Kept realm:<\/b> the realm kept for a won game/.test(src('js/core/faq.js')) && /from the Coil's first morning once a won Act 1 has kept him a realm/.test(src('js/core/faq.js')), 'KA1 (KT): the FAQ says it (What carries over, Flight)');
    assert(/\['0\.11\.227', 'A won game now keeps some of James\\'s realm/.test(src('js/core/news.js')), 'KA1 (KT): What\'s new says it');
}

console.log(`saves: ${files.length} files · ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
