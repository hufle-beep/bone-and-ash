// v0.11.28: the full check's compact output (owner 2026-11-07, pick O1). tools/check.mjs prints one short line per passing
// step, the lines a step flags, a one-line digest per bot model and the leftover report only when it found something; the
// whole output of every step goes to LOG (`--verbose` prints it as before). Pure functions, tested in tests/tools.test.mjs.
import { tmpdir } from 'node:os';
import path from 'node:path';

/** Where the full output of the last check goes (the workspace's temp folder; not in git). */
export const LOG = path.join(tmpdir(), 'boneash-check.log');

/** One passing step: `ok  key  70.8 s`, plus the "slower" note. */
export const stepLine = (key, secs, slow = '') => `ok  ${key.padEnd(15)}${String(secs).padStart(6)} s${slow}`;

/** Lines a passing step flags and that must stay visible: NOTE lines, DRIFT lines, the noise-scaled drift's log-only flags,
 *  the leftover check's stale keep-list entries (log only). */
export const FLAG = /^\s+(NOTE|DRIFT|WARN|noise-scaled \(log only\) {2}|keep-list entries that match nothing now)/;
export const flagLines = (out) => out.split('\n').filter((l) => FLAG.test(l)).map((l) => l.trimEnd());

/** The leftover report found something: any finding fails the strict check, so on a pass only log-only choices count. */
export const leftoverFound = (out) => /choices log only: [1-9]/.test(out);

/**
 * One line per bot model from tests/models.test.mjs's report: games, prologue Coil 1 deaths, the mean Coil that clears
 * the prologue and Act 1, the whole game on Coil 1, and the games that gave up. `expect`: the number of blocks there must be.
 * Returns null when a block can't be read (the caller then prints the
 * whole report, so a changed report format never hides the numbers).
 */
export function modelDigest(out, expect = 0) {
    const blocks = out.split(/\n(?=\[)/).filter((b) => /^\[[^\]]+\] \d+ games/.test(b.trim()));
    if (!blocks.length || (expect && blocks.length !== expect)) return null; // a missing model block: print the whole report
    const rows = [];
    for (const raw of blocks) {
        const b = raw.trim();
        const head = b.match(/^\[([^\]]+)\] (\d+) games/);
        const gave = b.split('\n')[0].match(/(\d+) gave up after Coil \d+/);
        const p1 = b.match(/\n {2}prologue: C1 dead ([\d.]+%)/);
        const cl = b.match(/cleared: prologue [\d.]+% \(mean Coil ([\d.]+|—)\) · Act 1 [\d.]+% \(mean Coil ([\d.]+|—)\) · the whole game on Coil 1 ([\d.]+%)/);
        if (!head || !p1 || !cl) return null;
        rows.push(`  ${`${head[1]} ${head[2]}`.padEnd(26)}prologue C1 dead ${p1[1]} · mean Coil ${cl[1]} / ${cl[2]} · whole game C1 ${cl[3]}${gave ? ` · ${gave[1]} gave up` : ''}`);
    }
    return rows;
}
