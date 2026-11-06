// v0.11.22: what the bot games really touch, for the leftover check (tools/leftovers.mjs).
// track(g) wraps g.flags and g.inventory in a Proxy that records which keys are read and written; noteView(g, v) and
// noteCards(cards) record which choices a scene showed (as a choice or as a task card). Watching is slow (a Proxy in a process
// slows every game in it), so the big tests only note choices; flags and items are watched with --track in a small separate run. Bulk reads (JSON copies, spreads, Object.entries in a display) don't count as reads.
// Known gaps (small undercounts, fine for a log-only report): a rewind inside a step puts plain flags back until the next
// track(); a test's own read of g.flags.ending counts as a read. The game code is not touched; the Proxy only watches,
// so the bot games and their numbers stay the same (the sanity check's drift shows 0 when nothing else changed).
// Daily flags (`key@day`) count under their key. Dry runs copy the game into plain objects, so their reads aren't counted.

export const seen = { flagsRead: new Set(), flagsWritten: new Set(), itemsRead: new Set(), itemsWritten: new Set(), choices: new Set() };
const watched = new WeakSet();
const base = (k) => k.split('@')[0];

function watch(obj, read, written, seed) {
    if (seed) for (const k of Object.keys(obj)) written.add(base(k)); // a rewind or a load brings keys an earlier step wrote
    // A JSON copy or a spread calls ownKeys, then reads every key in that order: those gets are skipped one by one. Any other
    // get ends the skip (Object.keys or for…in call ownKeys without the gets), so a real read is never swallowed.
    let bulk = null, at = 0;
    const p = new Proxy(obj, {
        ownKeys(t) { const ks = Reflect.ownKeys(t); bulk = ks; at = 0; return ks; },
        get(t, k) {
            if (typeof k === 'string' && k !== 'toJSON') {
                if (bulk && bulk[at] === k) { if (++at >= bulk.length) bulk = null; } else { bulk = null; read.add(base(k)); }
            }
            return t[k];
        },
        has(t, k) { if (typeof k === 'string') read.add(base(k)); return Reflect.has(t, k); },
        set(t, k, v, r) { if (typeof k === 'string') written.add(base(k)); return Reflect.set(t, k, v, r); },
        deleteProperty(t, k) { if (typeof k === 'string') written.add(base(k)); return Reflect.deleteProperty(t, k); },
        defineProperty(t, k, d) { if (typeof k === 'string') written.add(base(k)); return Reflect.defineProperty(t, k, d); },
    });
    watched.add(p);
    return p;
}
const games = new WeakSet(); // games watched before: a plain flags object on one of them came from a rewind or a load

/** Call before every step: a rewind, a load or a new game puts plain objects back. */
export function track(g) {
    // the first wrap seeds nothing: what a test set up by hand before its walk is not the game's writing
    const again = games.has(g); games.add(g);
    if (g.flags && !watched.has(g.flags)) g.flags = watch(g.flags, seen.flagsRead, seen.flagsWritten, again);
    if (g.inventory && !watched.has(g.inventory)) g.inventory = watch(g.inventory, seen.itemsRead, seen.itemsWritten, again);
    return g;
}

/** The choices a scene view shows (story choices only: card rows have index 1000+). */
export function noteView(g, v) {
    for (const c of v.choices || []) if (c.index < 1000) seen.choices.add(`${g.scene}#${c.index}`);
}

/** Task cards listed on a hub: a card `scene:index` is that story choice shown as a card. */
export function noteCards(cards) {
    for (const c of cards) { const m = /^(.+):(\d+)$/.exec(c.id); if (m) seen.choices.add(`${m[1]}#${m[2]}`); }
}

/** Merge a worker's emitted sets ({ __set: [...] }). */
export function mergeSeen(r) {
    if (!r) return;
    for (const k of Object.keys(seen)) for (const x of r[k]?.__set || []) seen[k].add(x);
}

/** Sorted arrays for the stats file (1 worker = 2 workers byte for byte). */
export const seenOut = () => Object.fromEntries(Object.entries(seen).map(([k, s]) => [k, [...s].sort()]));
