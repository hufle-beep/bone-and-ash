#!/usr/bin/env node
// The fight lab (v0.11.80, owner pick L1; research.md #52). Tool only: it changes nothing in the game.
// It plays the tasks test's bot games (tests/tasks.test.mjs, its own seeds) and, at every fight they start, plays that
// same fight again on copies under fixed tactics: smart (the bots' shared rule, tests/lib/smartfight.mjs), random, blade only, darts only,
// needle only, spear only, guard + blade. A table per fight: win %, median rounds, median HP left on a win; the smart
// tactic's win % by thirds of James's power (weak / middle / strong); the lowest GU from which smart wins 90 %;
// and the flags (easy fights, one tactic always wins, guard never pays, blade best). The bots' own games play as before.
//
//   node tools/fightlab.mjs                     300 games, one worker per core
//   node tools/fightlab.mjs --games 1000        more games (slower, steadier)
//   node tools/fightlab.mjs --fight rot_ape     one fight only (any fight id)
//   node tools/fightlab.mjs --min 10            show fights with at least 10 samples (default 30)
//   node tools/fightlab.mjs --workers 1         one worker
//   node tools/fightlab.mjs --json out.json     also write the summary (and the bots' own fight counts) as JSON
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf(`--${name}`); return i >= 0 && argv[i + 1] != null ? argv[i + 1] : def; };

if (argv.includes('--lab-worker')) {
    // A worker: the story's hook prepares each fight as always; the lab plays copies of it, then the bot plays on.
    await import(pathToFileURL(path.join(root, 'js/story/prologue.js')).href);
    const { combatHooks } = await import(pathToFileURL(path.join(root, 'js/core/game.js')).href);
    const { jamesPower } = await import(pathToFileURL(path.join(root, 'js/story/power.js')).href);
    const { sampleFight, isOneMove } = await import(pathToFileURL(path.join(root, 'tools/lib/fightlab.mjs')).href);
    const prepare = combatHooks.before;
    const samples = [], seen = new Set();
    let busy = false, oneMove = 0;
    combatHooks.before = (g, enc) => {
        const e = prepare ? (prepare(g, enc) || enc) : enc;
        if (!busy && isOneMove(new Error().stack)) oneMove++; // "End it in one move": no fight is played
        else if (!busy) {
            const key = `${e.id}|${g.seed}|${g.minutes}|${g.coil?.n}|${g.james.hp}|${g.scene}`; // a dry run of the same moment counts once
            if (!seen.has(key)) { seen.add(key); busy = true; try { samples.push(sampleFight(g, e, jamesPower(g))); } finally { busy = false; } }
        }
        return e;
    };
    process.on('exit', () => { writeFileSync(opt('out', 'fightlab.json'), JSON.stringify({ samples, oneMove })); }); // a file: a pipe would be cut off at exit
    process.argv = [process.argv[0], path.join(root, 'tests/tasks.test.mjs'), '--games', opt('games', '300'), '--shard', opt('shard', '0/1')];
    await import(pathToFileURL(path.join(root, 'tests/tasks.test.mjs')).href);
} else {
    const { mergeInto } = await import(pathToFileURL(path.join(root, 'tests/lib/shard.mjs')).href);
    const { summarizeAll, tableLines, sampleOrder } = await import(pathToFileURL(path.join(root, 'tools/lib/fightlab.mjs')).href);
    const games = Math.max(1, Number(opt('games', 300)) || 300);
    const workers = Math.max(1, Math.min(Number(opt('workers', 0)) || (os.availableParallelism?.() ?? os.cpus().length), games));
    const only = opt('fight', null), min = Number(opt('min', 30)), jsonOut = opt('json', null);
    const t0 = Date.now();
    const tmp = mkdtempSync(path.join(os.tmpdir(), 'boneash-lab-'));
    const kids = [];
    const runs = Array.from({ length: workers }, (_, i) => new Promise((resolve, reject) => {
        const ch = spawn(process.execPath, [fileURLToPath(import.meta.url), '--lab-worker', '--games', String(games), '--shard', `${i}/${workers}`, '--out', path.join(tmp, `${i}.json`)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
        kids.push(ch);
        let out = '', err = '';
        ch.stdout.on('data', (d) => { out += d; });
        ch.stderr.on('data', (d) => { err += d; });
        ch.on('close', (code) => {
            let lab = null; try { lab = JSON.parse(readFileSync(path.join(tmp, `${i}.json`), 'utf8')); } catch { /* reported below */ }
            const shard = out.split('\n').find((l) => l.startsWith('@@SHARD '));
            if (!lab || !shard) return reject(new Error(`worker ${i}/${workers} gave no result (exit ${code})\n${(err || out).slice(-2000)}`));
            const sh = JSON.parse(shard.slice(8));
            resolve({ samples: lab.samples, oneMove: lab.oneMove, bots: { fights: sh.fightStats || {}, deaths: sh.deaths || {}, byCoil: sh.byCoil || {} }, fail: sh.fail || 0 });
        });
    }));
    const stop = () => { for (const k of kids) if (k.exitCode === null) k.kill(); rmSync(tmp, { recursive: true, force: true }); };
    process.on('SIGINT', () => { stop(); process.exit(130); });
    const parts = await Promise.all(runs).catch((e) => { console.error(e.message); stop(); process.exit(1); });
    rmSync(tmp, { recursive: true, force: true });
    const samples = parts.flatMap((p) => p.samples).filter((s) => !only || s.id === only).sort(sampleOrder);
    const bots = {}; // the bots' own numbers (fights, deaths, the tribute per Coil), merged as the tasks test merges them
    for (const p of parts) mergeInto(bots, p.bots);
    const oneMove = parts.reduce((a, p) => a + p.oneMove, 0);
    const failed = parts.reduce((a, p) => a + p.fail, 0);
    const sum = summarizeAll(samples, only ? 1 : min);
    console.log(`Fight lab: ${games} bot games, ${workers} worker${workers > 1 ? 's' : ''}, ${samples.length} fight states${only ? ` (${only})` : ''} (${oneMove} one-move finishes not counted). Win %, median rounds (r), median HP left on a win (hp, % of max).`);
    console.log('Tactics: smart = the bots\' shared smart rule (tests/lib/smartfight.mjs); random = the bot\'s random pick, no running; spear and darts count only the states where James can sing them.\n');
    for (const l of tableLines(sum)) console.log(l);
    if (failed) console.log(`\n(${failed} test failures in the bot games while playing — run node tests/tasks.test.mjs for details)`);
    if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ games, workers, states: samples.length, oneMove, ...sum, bots }, null, 1));
    console.log(`\n${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
