// v0.11.73 (group h, pick H1): the docs' own rules, checked in code (hard rule 5; Shared-ST's lorebook integrity test as the model).
// - project/handover.md stays under HANDOVER_MAX bytes, so Claude's project tool can read and upload it in one go: a failure.
// - The newest history file (the highest number) past HISTORY_MAX bytes: a new part is due. A log line only (the move is a docs push).
// - project/roadmap.md's "Last updated" line names the current version: a failure.
// Pure: it takes the docs' sizes and texts, so tests/tools.test.mjs can feed it made-up ones.
export const HANDOVER_MAX = 35000;
export const HISTORY_MAX = 45000;

/** The newest history file: history-N.md with the highest N (history.md is part 1). */
export function newestHistory(names) {
    const n = (f) => (f === 'history.md' ? 1 : Number((f.match(/^history-(\d+)\.md$/) || [])[1] || 0));
    return names.filter((f) => n(f) > 0).sort((a, b) => n(b) - n(a))[0] || null;
}

/** { fail: [...], notes: [...] } for the given version, the handover's size, the history files' sizes ({ name: bytes }) and the roadmap's text. */
export function docFindings({ version, handoverBytes, histories, roadmap }) {
    const fail = [];
    const notes = [];
    if (handoverBytes >= HANDOVER_MAX) fail.push(`project/handover.md is ${handoverBytes} bytes, over ${HANDOVER_MAX} (rule 5: move the oldest version's notes to the newest history file)`);
    const h = newestHistory(Object.keys(histories));
    if (h && histories[h] > HISTORY_MAX) notes.push(`project/${h} is ${histories[h]} bytes, past ${HISTORY_MAX}: start the next history part at the next move (rule 5)`);
    const v = (String(roadmap).match(/^Last updated: \d{4}-\d\d-\d\d \(v([\d.]+)/m) || [])[1];
    if (v !== version) fail.push(`project/roadmap.md's "Last updated" line says ${v ?? 'nothing'}, sw.js says ${version}`);
    return { fail, notes };
}
