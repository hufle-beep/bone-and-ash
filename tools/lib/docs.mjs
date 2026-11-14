// v0.11.73 (group h, pick H1): the docs' own rules, checked in code (hard rule 5; Shared-ST's lorebook integrity test as the model).
// - project/handover.md stays under HANDOVER_MAX bytes, so Claude's project tool can read and upload it in one go: a failure.
// - The newest history file (the highest number) past HISTORY_MAX bytes: a new part is due. A log line only (the move is a docs push).
// - project/roadmap.md's "Last updated" line names the current version: a failure.
// v0.11.78 (owner pick S1, 2026-11-08 20:46): research.md is split into parts like the history files (research.md, research-2.md, ...):
// - The newest research part past RESEARCH_MAX bytes: the next part is due. A log line only.
// - Any project doc past DOC_TOOL_MAX bytes is too big for Claude's project tool to read in one go (about 25k tokens): a log line;
//   the owner's rule: a trimming pass first (nothing lost), then a split into parts, proposed as options in a docs push (rule 1).
// v0.11.178 (owner pick U1, MD: the mirror uploads less): the docs every push changes (PER_PUSH, and the newest history part) stay
// under MIRROR_MAX bytes; past it, a note: the older rows or lines move word for word to a new numbered part in the next docs move.
// Pure: it takes the docs' sizes and texts, so tests/tools.test.mjs can feed it made-up ones.
export const HANDOVER_MAX = 35000;
export const HISTORY_MAX = 20000; // v0.11.178 (U1, MD): was 45000
export const RESEARCH_MAX = 45000;
export const DOC_TOOL_MAX = 60000;
export const MIRROR_MAX = 20000;
export const PER_PUSH = ['roadmap.md', 'changelog.md', 'restore-points.md'];

/** The newest history file: history-N.md with the highest N (history.md is part 1). */
export function newestHistory(names) {
    const n = (f) => (f === 'history.md' ? 1 : Number((f.match(/^history-(\d+)\.md$/) || [])[1] || 0));
    return names.filter((f) => n(f) > 0).sort((a, b) => n(b) - n(a))[0] || null;
}

/** The newest research part: research-N.md with the highest N (research.md is part 1). */
export function newestResearch(names) {
    const n = (f) => (f === 'research.md' ? 1 : Number((f.match(/^research-(\d+)\.md$/) || [])[1] || 0));
    return names.filter((f) => n(f) > 0).sort((a, b) => n(b) - n(a))[0] || null;
}

/** { fail: [...], notes: [...] } for the given version, the handover's size, the history files' and research parts' sizes ({ name: bytes }), every project doc's size and the roadmap's text. */
export function docFindings({ version, handoverBytes, histories, roadmap, researches = {}, docs = {} }) {
    const fail = [];
    const notes = [];
    if (handoverBytes >= HANDOVER_MAX) fail.push(`project/handover.md is ${handoverBytes} bytes, over ${HANDOVER_MAX} (rule 5: move the oldest version's notes to the newest history file)`);
    const h = newestHistory(Object.keys(histories));
    if (h && histories[h] > HISTORY_MAX) notes.push(`project/${h} is ${histories[h]} bytes, past ${HISTORY_MAX}: start the next history part at the next move (rule 5)`);
    const r = newestResearch(Object.keys(researches));
    if (r && researches[r] > RESEARCH_MAX) notes.push(`project/${r} is ${researches[r]} bytes, past ${RESEARCH_MAX}: start the next research part with the next round (v0.11.78)`);
    for (const [f, bytes] of Object.entries(docs)) if (bytes > DOC_TOOL_MAX) notes.push(`project/${f} is ${bytes} bytes, past ${DOC_TOOL_MAX}: too big for the project tool in one read; a trimming pass (nothing lost), then a split, as options (owner 2026-11-08 20:46)`);
    for (const f of PER_PUSH) if (docs[f] > MIRROR_MAX) notes.push(`project/${f} is ${docs[f]} bytes, past ${MIRROR_MAX}: every push uploads it; move its older part word for word to a new numbered file (v0.11.178, MD)`);
    const v = (String(roadmap).match(/^Last updated: \d{4}-\d\d-\d\d \(v([\d.]+)/m) || [])[1];
    if (v !== version) fail.push(`project/roadmap.md's "Last updated" line says ${v ?? 'nothing'}, sw.js says ${version}`);
    return { fail, notes };
}
