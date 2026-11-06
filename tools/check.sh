#!/usr/bin/env bash
# One check for everything (v0.8.6; tasks test since v0.9.0). Run from the repo root:
#   bash tools/check.sh          the full check (2,000 bot games each; the bots split across cores, v0.11.1). Before every push.
#   bash tools/check.sh quick    the same checks with 200 bot games each (about 15 s), for use while building; no sanity check.
# The full check ends with tools/sanity.mjs (v0.11.3): the mechanics invariants and drift against tools/baseline.json.
# Stops at the first failure and says which check failed.
set -u
cd "$(dirname "$0")/.."
fail=0
GAMES=2000; Q=''
[ "${1:-}" = quick ] && { GAMES=200; Q=', quick'; }
run() { local name="$1"; shift; printf '%-42s' "$name"; local out; if out=$("$@" 2>&1); then echo "ok  ${out##*$'\n'}"; else echo "FAILED"; echo "$out" | tail -20; fail=1; exit 1; fi; }
for f in $(git ls-files --cached --others --exclude-standard '*.js' '*.mjs'); do node --check "$f" >/dev/null 2>&1 || { echo "Syntax error in $f"; node --check "$f"; exit 1; }; done
printf '%-42s%s\n' "syntax" "ok  all .js and .mjs files"
run "engine numbers" node tests/rules.test.mjs
run "old saves (saves/)" node tests/saves.test.mjs
for p in fallout blackroot heart return; do run "Act 1 part: $p" node tests/part.test.mjs "$p"; done
ST=$(mktemp -d)
run "tasks ($GAMES bot games each way$Q)" node tests/tasks.test.mjs --games "$GAMES" --stats-out "$ST/tasks.json"
run "story ($GAMES full games$Q)" node tests/story.test.mjs --games "$GAMES" --stats-out "$ST/story.json"
# v0.11.3 (hard rule 2): the mechanics sanity check — invariants and drift against tools/baseline.json (full run only)
[ "$GAMES" = 2000 ] && run "sanity (invariants, drift ±5)" node tools/sanity.mjs --tasks "$ST/tasks.json" --story "$ST/story.json"
rm -rf "$ST"
[ "$fail" = 0 ] && { [ "$GAMES" = 2000 ] && echo "All checks passed." || echo "All quick checks passed (not enough for a push: run bash tools/check.sh)."; }
