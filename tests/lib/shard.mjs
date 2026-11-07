// Bot games split across processes (v0.11.1). A test file imports this, starts its workers with `launch()` at the top,
// runs its own static checks while they play, then `collect()`s and merges their numbers.
//
//   node tests/tasks.test.mjs                 full run: 1,000 games (2,000 before v0.11.34), one worker per core
//   node tests/tasks.test.mjs --games 200     quick run (bash tools/check.sh quick)
//   node tests/tasks.test.mjs --workers 1     everything in one process (the numbers are the same)
//
// Every game seeds its own random stream from its game number (`seedOf`), so a game plays the same way whichever
// worker runs it and however many workers there are.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf(`--${name}`); return i >= 0 && argv[i + 1] != null ? argv[i + 1] : def; };

/** Games to play (default 1,000 since v0.11.34; owner 14:30). */
export const GAMES = Math.max(1, Number(opt('games', 1000)) || 1000);
/** The coverage checks ("every card played", "every scene reached") only hold on the full run. */
export const FULL = GAMES >= 1000; // the coverage checks need a full run
/** In a worker: { i, n }. In the parent: null. */
export const SHARD = (() => { const s = opt('shard', null); if (!s) return null; const [i, n] = s.split('/').map(Number); return { i, n }; })();
/** Workers to start (default: one per core, at most one per 50 games). */
export const WORKERS = SHARD ? 1 : Math.max(1, Math.min(Number(opt('workers', 0)) || (os.availableParallelism?.() ?? os.cpus().length), Math.ceil(GAMES / 50)));

/** A different set of games (tools/bots.mjs --seed N); 0 = the tests' own set. */
export const SEED = Number(opt('seed', 0)) || 0;
/** tools/bots.mjs --sensible: the bot leaves the meridian screen after 2 sittings in a row, or when Fed is under 40. */
export const SENSIBLE = argv.includes('--sensible');
/** v0.11.3: write the merged stats here as JSON (tools/check.sh → tools/sanity.mjs). Not passed to workers. */
export const STATS_OUT = opt('stats-out', null);
/** tools/bots.mjs: print the beast share of the deaths too. */
export const REPORT = argv.includes('--report');
/** The game numbers this process plays. */
export const myRuns = () => { const out = []; for (let r = 0; r < GAMES; r++) if (!SHARD || r % SHARD.n === SHARD.i) out.push(r); return out; };

/** A 32-bit seed from a game number and a stream id (mixes the bits so neighbouring games differ). */
export function seedOf(run, stream = 0) {
    let h = (Math.imul(run + 1, 0x9e3779b1) ^ Math.imul(stream + 1 + SEED * 64, 0x85ebca6b)) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
    h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
    return (h ^ (h >>> 16)) >>> 0;
}

/** Start the workers (parent only, and only with more than one). Returns null if this process plays the games itself. */
export function launch(fileUrl) {
    if (SHARD || WORKERS < 2) return null;
    const file = fileURLToPath(fileUrl);
    const pass = []; // forward the other options (--seed, --sensible …), not --workers / --games / --shard / --stats-out
    for (let i = 0; i < argv.length; i++) { if (['--workers', '--games', '--shard', '--stats-out'].includes(argv[i])) { i++; continue; } pass.push(argv[i]); }
    return Array.from({ length: WORKERS }, (_, i) => new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [file, ...pass, '--games', String(GAMES), '--shard', `${i}/${WORKERS}`], { stdio: ['ignore', 'pipe', 'inherit'] });
        let out = '';
        child.stdout.on('data', (d) => { out += d; });
        child.on('error', reject);
        child.on('close', (code) => {
            const line = out.split('\n').find((l) => l.startsWith('@@SHARD '));
            if (!line) return reject(new Error(`worker ${i}/${WORKERS} gave no result (exit ${code})\n${out.slice(-2000)}`));
            resolve(JSON.parse(line.slice(8)));
        });
    }));
}

/** Wait for the workers' results. */
export const collect = (kids) => Promise.all(kids);

/** In a worker: print the results for the parent and stop. Sets become { __set: [...] }. */
export function emit(obj) {
    process.stdout.write(`@@SHARD ${JSON.stringify(obj, (k, v) => (v instanceof Set ? { __set: [...v] } : v))}\n`);
    process.exit(0);
}

/**
 * Add a worker's numbers into `into` (in place): numbers add up, except keys starting with `max` (largest wins);
 * objects merge key by key; sets take the union.
 */
export function mergeInto(into, from) {
    for (const [k, v] of Object.entries(from)) {
        if (v && typeof v === 'object' && Array.isArray(v.__set)) { if (!(into[k] instanceof Set)) into[k] = new Set(); for (const x of v.__set) into[k].add(x); }
        else if (typeof v === 'number') into[k] = k.startsWith('max') ? Math.max(into[k] ?? -Infinity, v) : (into[k] || 0) + v;
        else if (v && typeof v === 'object') { if (!into[k] || typeof into[k] !== 'object') into[k] = {}; mergeInto(into[k], v); }
    }
    return into;
}
