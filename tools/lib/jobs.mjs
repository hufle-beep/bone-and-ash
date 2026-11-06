// The job pool behind tools/check.mjs (v0.11.21), apart so tests/tools.test.mjs and scratch runs can use it.
//   validateJobs(jobs)  the problems of a job list (duplicate or missing keys, an `after` that is not a job, a loop)
//   run(cmd, args, cwd) one process in its own process group (detached, pipes kept); resolves { code, out }
//   killAll()           SIGTERM to the whole process group of every running child (bot workers, Chromium, http.server)
//   runPool(jobs, opt)  the scheduler: `after` waits, one `heavy` job at a time, at most opt.limit at once;
//                       the first failure kills the rest. Resolves { failed, stuck }.
import { spawn } from 'node:child_process';

/** The problems of a job list, as sentences (empty: the list is fine). */
export function validateJobs(jobs) {
    const problems = [];
    const byKey = new Map();
    for (const j of jobs) {
        if (!j.key) { problems.push(`job "${j.name}" has no key`); continue; }
        if (byKey.has(j.key)) problems.push(`duplicate key "${j.key}" ("${byKey.get(j.key).name}" and "${j.name}")`);
        else byKey.set(j.key, j);
        if (!j.fn && !j.cmd) problems.push(`job "${j.key}" has neither cmd nor fn`);
    }
    for (const j of jobs) for (const a of j.after || []) if (!byKey.has(a)) problems.push(`job "${j.key}" waits for "${a}", which is not a job in this mode`);
    // a loop of `after`s never starts
    const state = new Map(); // key → 1 visiting, 2 done
    const visit = (k, trail) => {
        if (state.get(k) === 2 || !byKey.has(k)) return;
        if (state.get(k) === 1) { problems.push(`jobs wait for each other in a loop: ${[...trail.slice(trail.indexOf(k)), k].join(' → ')}`); return; }
        state.set(k, 1);
        for (const a of byKey.get(k).after || []) visit(a, [...trail, k]);
        state.set(k, 2);
    };
    for (const k of byKey.keys()) visit(k, []);
    return problems;
}

const children = new Set();

/** Run one process in its own process group, collecting stdout and stderr together. */
export function run(cmd, args, cwd) {
    return new Promise((resolve) => {
        const ch = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
        children.add(ch);
        let out = '';
        ch.stdout.on('data', (d) => { out += d; });
        ch.stderr.on('data', (d) => { out += d; });
        ch.on('error', (e) => { out += String(e); });
        ch.on('close', (code) => { children.delete(ch); resolve({ code: code ?? 1, out }); });
    });
}

/** SIGTERM to every running child's whole process group. */
export function killAll() {
    for (const ch of children) {
        if (!ch.pid) continue;
        try { process.kill(-ch.pid, 'SIGTERM'); } catch { try { ch.kill('SIGTERM'); } catch { /* already gone */ } }
    }
}

/** On Ctrl-C or SIGTERM of this process: kill the children's groups (they are detached, so the signal misses them), clean up, exit. */
export function onSignals(cleanup) {
    process.on('exit', killAll); // v0.11.21: a crash or an early exit of the runner leaves no job running either
    for (const [sig, code] of [['SIGINT', 130], ['SIGTERM', 143]]) process.on(sig, () => { killAll(); try { cleanup?.(); } catch { /* ignore */ } process.exit(code); });
}

/**
 * The scheduler. opt: { limit, onDone(job, result, seconds, firstFailure) }. A job is { key, name, cmd: [cmd, args] | fn, after?, heavy? }.
 * Resolves { failed: the first failed job or null, stuck: jobs that could never start (empty unless the list is broken) }.
 */
export function runPool(jobs, { limit = 1, cwd, onDone = () => {} } = {}) {
    const done = new Map(); // key → ok
    const queue = [...jobs];
    let failed = null, running = 0, heavyRunning = 0;
    return new Promise((finish) => {
        const next = () => {
            if (failed) { if (!running) finish({ failed, stuck: [] }); return; }
            if (!queue.length && !running) { finish({ failed: null, stuck: [] }); return; }
            while (running < limit && queue.length) {
                const i = queue.findIndex((j) => (j.after || []).every((a) => done.get(a)) && !(j.heavy && heavyRunning));
                if (i < 0) break;
                const j = queue.splice(i, 1)[0];
                running++; if (j.heavy) heavyRunning++;
                const s0 = Date.now();
                Promise.resolve().then(() => (j.fn ? j.fn() : run(j.cmd[0], j.cmd[1], cwd))).catch((e) => ({ code: 1, out: String(e?.stack || e) })).then((r) => {
                    running--; if (j.heavy) heavyRunning--;
                    const s = (Date.now() - s0) / 1000;
                    const ok = r.code === 0;
                    done.set(j.key, ok);
                    if (ok) onDone(j, r, s, false);
                    else if (!failed) { failed = j; onDone(j, r, s, true); killAll(); }
                    next();
                });
            }
            // v0.11.21: jobs left, none running, none can start → they would wait forever
            if (!failed && queue.length && !running) finish({ failed: null, stuck: [...queue] });
        };
        next();
    });
}
