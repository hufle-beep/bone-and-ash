#!/usr/bin/env bash
# One check for everything (v0.8.6; parallel since v0.11.20). Run from the repo root:
#   bash tools/check.sh          the full check: 2,000 bot games each, the browser test (two parts), then the sanity check. Before every push.
#   bash tools/check.sh quick    200 bot games each, no browser or sanity check (about 15 s), while building.
# The steps run in parallel on a job pool (tools/check.mjs); the first failure stops the rest and prints its output.
# Every step, what it covers and how to run it alone: tests/README.md.
cd "$(dirname "$0")/.." && exec node tools/check.mjs "$@"
