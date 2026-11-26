// F14's check: parts written as GitHub keeps them (a last newline) join back to the save
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const J = await import(path.join(process.cwd(), 'tools/joinsave.mjs')); const A = await import(path.join(process.cwd(), 'js/core/app.js'));
const d = fs.mkdtempSync(path.join(os.tmpdir(), 'jc-')); const json = JSON.stringify({ x: 'y'.repeat(50000) });
A.saveParts(json).forEach((q, i, all) => fs.writeFileSync(path.join(d, A.partName('s.txt', i + 1, all.length)), q + '\n'));
const r = J.joinSave(path.join(d, 's-part1of3.txt')); if (r.text !== json) { console.error('FAIL join'); process.exit(1); } console.log('ok');
