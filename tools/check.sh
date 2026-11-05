#!/usr/bin/env bash
# One check for everything (v0.8.6; tasks test since v0.9.0). Run from the repo root: bash tools/check.sh
# Stops at the first failure and says which check failed.
set -u
cd "$(dirname "$0")/.."
fail=0
run() { local name="$1"; shift; printf '%-34s' "$name"; local out; if out=$("$@" 2>&1); then echo "ok  ${out##*$'\n'}"; else echo "FAILED"; echo "$out" | tail -20; fail=1; exit 1; fi; }
for f in $(git ls-files '*.js' '*.mjs'); do node --check "$f" >/dev/null 2>&1 || { echo "Syntax error in $f"; node --check "$f"; exit 1; }; done
echo "syntax                            ok  all .js and .mjs files"
run "engine numbers" node tests/rules.test.mjs
run "old saves (saves/)" node tests/saves.test.mjs
for p in fallout blackroot heart return; do run "Act 1 part: $p" node tests/part.test.mjs "$p"; done
run "tasks (2,000 bot games each way)" node tests/tasks.test.mjs
run "story (2,000 full games)" node tests/story.test.mjs
[ "$fail" = 0 ] && echo "All checks passed."
