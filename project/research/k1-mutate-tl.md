| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| T1 | tools/textlint.mjs | textlint: the QH/QW states dropped | caught |   FAIL  LR: a template leftover in a memory line is noted against the pool's snapshot, log only, the scenes untouched (exit 0) |
| T2 | tools/lint.mjs | lint: the QH/QW states dropped (count stays 18) | missed |  |

1 caught, 1 missed, 0 not applied (of 2).
