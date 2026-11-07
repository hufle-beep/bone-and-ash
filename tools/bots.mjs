#!/usr/bin/env node
// Balance numbers only (v0.11.1): runs the tasks test's bots and prints the summary per Coil.
// Changes nothing in the game; for the numbers shown to the owner before a balance change.
//
//   node tools/bots.mjs                       2,000 games, one worker per core
//   node tools/bots.mjs --games 500           fewer games (faster, noisier)
//   node tools/bots.mjs --seed 3              another set of games (0 = the tests' own set)
//   node tools/bots.mjs --sensible            the bot leaves the meridian screen after 2 sittings in a row, or when Fed < 40
//   node tools/bots.mjs --workers 1           one process
//   node tools/bots.mjs --model all           v0.11.27: the bot models (careful, completionist, rusher, random), 2,000 games each
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const t0 = Date.now();
// v0.11.27: --model careful | completionist | rusher | random | all runs the bot models instead (tests/models.test.mjs)
if (args.includes('--model')) {
    const m = spawn(process.execPath, [path.join(root, 'tests/models.test.mjs'), ...args], { cwd: root, stdio: 'inherit' });
    m.on('close', (code) => { console.log(`\n${((Date.now() - t0) / 1000).toFixed(0)} s`); process.exit(code ?? 1); });
} else {
const child = spawn(process.execPath, [path.join(root, 'tests/tasks.test.mjs'), '--report', ...args], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let out = '', err = '';
child.stdout.on('data', (d) => { out += d; });
child.stderr.on('data', (d) => { err += d; });
child.on('close', (code) => {
    const keep = /^\s*(tribute|realm \/ primaries|deaths|Meditate:|work-card|\d+ cards run|\d+ games each way)/;
    const lines = out.split('\n').filter((l) => keep.test(l));
    console.log(`Bots: ${args.join(' ') || '(defaults)'}`);
    for (const l of lines) console.log(l.replace(/ · /g, '\n      '));
    const fails = err.split('\n').filter((l) => /FAIL/.test(l));
    if (fails.length) console.log(`\n(${fails.length} test failures while playing — run node tests/tasks.test.mjs for details)`);
    console.log(`\n${((Date.now() - t0) / 1000).toFixed(0)} s`);
    process.exit(code && !lines.length ? 1 : 0);
});
}
