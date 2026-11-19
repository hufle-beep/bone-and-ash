# KA: the scratch simulation (2026-11-19, before the pick)

A scratch copy of tests/models.test.mjs (KA_K kept realms, KA_MODE lift: ro = KL-r, rm = KL-m, mx = KL-x, lf = KL-f; KA_N a starting Coil for pass 2), long calendar, 100 games each. Pass 1: the lift on Day 1 at Coil 1. p2a / p2b: pass 2 at Coil 4 (Careful) / Coil 2 (Completionist, Cultivator) with K = 1 (ro = K 0). The real second pass (KM, `--kept`) differs: Careful and the Sociable 60% one Coil, not 100%.

```

== careful
cfg   | P clr C | A1 clr C | 1-Coil | trib C1 won | collectors win | deaths | Act1 end realm | accord/rev/vic | won ends | gaveUp | taken
ro0   | 3.09 | 3.09 | 18% | 18% | 16% (267) | 0 | 1.00 | 90%/10%/0% | 100% | 0 | 0
ro1   | 3.31 | 3.31 | 15% | 16% | 6% (304) | 5 | 1.26 | 91%/9%/0% | 100% | 0 | 0
ro2   | 1.84 | 1.85 | 50% | 53% | 52% (172) | 4 | 2.00 | 92%/8%/0% | 100% | 0 | 0
ro3   | 1.84 | 1.85 | 50% | 53% | 52% (172) | 4 | 3.00 | 92%/8%/0% | 100% | 0 | 0
rm1   | 3.31 | 3.31 | 15% | 16% | 6% (304) | 5 | 1.26 | 92%/8%/0% | 100% | 0 | 0
rm2   | 1.84 | 1.84 | 50% | 51% | 51% (175) | 1 | 2.00 | 92%/8%/0% | 100% | 0 | 0
rm3   | 1.84 | 1.84 | 50% | 51% | 51% (175) | 1 | 3.00 | 92%/8%/0% | 100% | 0 | 0
lf1   | 1.00 | 1.00 | 100% | 95% | 100% (76) | 0 | 2.00 | 90%/10%/0% | 100% | 0 | 0
lf2   | 1.00 | 1.00 | 100% | 90% | - (0) | 0 | 2.00 | 92%/8%/0% | 100% | 0 | 0
lf3   | 1.00 | 1.00 | 100% | 90% | - (0) | 0 | 3.00 | 90%/10%/0% | 100% | 0 | 0

== sociable
cfg   | P clr C | A1 clr C | 1-Coil | trib C1 won | collectors win | deaths | Act1 end realm | accord/rev/vic | won ends | gaveUp | taken
ro0   | 3.09 | 3.09 | 18% | 18% | 16% (267) | 0 | 1.00 | 90%/10%/0% | 100% | 0 | 0
ro1   | 3.31 | 3.31 | 15% | 16% | 6% (304) | 5 | 1.30 | 94%/6%/0% | 100% | 0 | 0
ro2   | 1.84 | 1.84 | 51% | 53% | 52% (172) | 3 | 2.00 | 92%/8%/0% | 100% | 0 | 0
ro3   | 1.84 | 1.84 | 51% | 53% | 52% (172) | 3 | 3.00 | 92%/8%/0% | 100% | 0 | 0
rm1   | 3.31 | 3.31 | 15% | 16% | 6% (304) | 5 | 1.30 | 94%/6%/0% | 100% | 0 | 0
rm2   | 1.84 | 1.84 | 50% | 51% | 51% (175) | 1 | 2.00 | 94%/6%/0% | 100% | 0 | 0
rm3   | 1.84 | 1.84 | 50% | 51% | 51% (175) | 1 | 3.00 | 93%/7%/0% | 100% | 0 | 0
lf1   | 1.00 | 1.00 | 100% | 95% | 100% (76) | 0 | 2.00 | 89%/11%/0% | 100% | 0 | 0
lf2   | 1.00 | 1.00 | 100% | 90% | - (0) | 0 | 2.00 | 93%/7%/0% | 100% | 0 | 0
lf3   | 1.00 | 1.00 | 100% | 90% | - (0) | 0 | 3.00 | 92%/8%/0% | 100% | 0 | 0

== completionist
cfg   | P clr C | A1 clr C | 1-Coil | trib C1 won | collectors win | deaths | Act1 end realm | accord/rev/vic | won ends | gaveUp | taken
ro0   | 1.17 | 1.17 | 83% | 86% | 83% (80) | 3 | 2.00 | 33%/35%/32% | 100% | 0 | 0
ro1   | 1.32 | 1.32 | 68% | 68% | 61% (82) | 0 | 2.69 | 31%/38%/31% | 100% | 0 | 0
ro2   | 1.27 | 1.27 | 73% | 73% | 64% (74) | 0 | 3.00 | 31%/35%/34% | 100% | 0 | 0
ro3   | 1.31 | 1.31 | 69% | 69% | 65% (89) | 0 | 4.00 | 29%/37%/34% | 100% | 0 | 0
rm1   | 1.32 | 1.32 | 68% | 68% | 61% (82) | 0 | 2.70 | 34%/38%/28% | 100% | 0 | 0
rm2   | 1.28 | 1.28 | 72% | 72% | 61% (71) | 0 | 3.00 | 27%/36%/37% | 100% | 0 | 0
rm3   | 1.31 | 1.31 | 69% | 69% | 64% (85) | 0 | 4.00 | 33%/36%/31% | 100% | 0 | 0
lf1   | 1.00 | 1.00 | 100% | 69% | 100% (35) | 0 | 3.00 | 37%/32%/31% | 100% | 0 | 0
lf2   | 1.00 | 1.00 | 100% | 67% | 100% (32) | 0 | 3.00 | 28%/38%/34% | 100% | 0 | 0
lf3   | 1.00 | 1.00 | 100% | 89% | 100% (67) | 0 | 4.00 | 20%/11%/69% | 100% | 0 | 0

== cultivator
cfg   | P clr C | A1 clr C | 1-Coil | trib C1 won | collectors win | deaths | Act1 end realm | accord/rev/vic | won ends | gaveUp | taken
ro0   | 1.01 | 1.01 | 99% | 69% | 100% (31) | 1 | 5.00 | 27%/40%/33% | 100% | 0 | 0
ro1   | 1.03 | 1.03 | 97% | 66% | 100% (34) | 3 | 5.00 | 34%/32%/34% | 100% | 0 | 0
ro2   | 1.02 | 1.02 | 98% | 65% | 100% (33) | 2 | 5.00 | 31%/36%/33% | 100% | 0 | 0
ro3   | 1.01 | 1.01 | 99% | 67% | 100% (30) | 1 | 5.02 | 38%/31%/31% | 100% | 0 | 0
rm1   | 1.03 | 1.03 | 97% | 65% | 100% (32) | 3 | 5.00 | 31%/36%/33% | 100% | 0 | 0
rm2   | 1.02 | 1.02 | 98% | 61% | 100% (32) | 2 | 5.01 | 34%/37%/29% | 100% | 0 | 0
rm3   | 1.01 | 1.01 | 99% | 70% | 100% (38) | 1 | 6.00 | 27%/43%/30% | 100% | 0 | 0
lf1   | 1.00 | 1.00 | 100% | 65% | 100% (37) | 0 | 5.01 | 32%/36%/32% | 100% | 0 | 0
lf2   | 1.00 | 1.00 | 100% | 92% | 100% (66) | 0 | 6.00 | 16%/3%/81% | 100% | 0 | 0
lf3   | 1.00 | 1.00 | 100% | 99% | 100% (70) | 0 | 6.00 | 16%/6%/78% | 100% | 0 | 0

== careful
s0             | P 3.09 | 1-Coil 18% | trib C1 18% | coll 16% | dead 0 | GU@trib 9.1 | realm end 1.00 | GU end 27.2 | acc/rev/vic 90%/10%/0% | gaveUp 0
out-mx-1       | P 3.16 | 1-Coil 19% | trib C1 19% | coll 2% | dead 0 | GU@trib 8.6 | realm end 1.28 | GU end 26.6 | acc/rev/vic 91%/9%/0% | gaveUp 0
out-mx-2       | P 1.86 | 1-Coil 48% | trib C1 48% | coll 50% | dead 0 | GU@trib 8.8 | realm end 2.00 | GU end 22.7 | acc/rev/vic 90%/10%/0% | gaveUp 0
out-mx-3       | P 1.86 | 1-Coil 48% | trib C1 48% | coll 50% | dead 0 | GU@trib 8.8 | realm end 3.00 | GU end 22.6 | acc/rev/vic 90%/10%/0% | gaveUp 0
p2a-ro         | P 1.00 | 1-Coil 100% | trib C1 98% | coll 100% | dead 0 | GU@trib 16.4 | realm end 1.00 | GU end 36.1 | acc/rev/vic 97%/3%/0% | gaveUp 0
p2a-rm         | P 1.06 | 1-Coil 94% | trib C1 99% | coll 89% | dead 5 | GU@trib 13.4 | realm end 2.00 | GU end 33.1 | acc/rev/vic 93%/7%/0% | gaveUp 0
p2a-mx         | P 1.00 | 1-Coil 100% | trib C1 100% | coll 100% | dead 0 | GU@trib 15.4 | realm end 2.00 | GU end 35.1 | acc/rev/vic 89%/11%/0% | gaveUp 0
p2a-lf         | P 1.00 | 1-Coil 100% | trib C1 95% | coll - | dead 0 | GU@trib 17.0 | realm end 2.00 | GU end 36.5 | acc/rev/vic 90%/10%/0% | gaveUp 0
== sociable
s0             | P 3.09 | 1-Coil 18% | trib C1 18% | coll 16% | dead 0 | GU@trib 9.1 | realm end 1.00 | GU end 27.1 | acc/rev/vic 90%/10%/0% | gaveUp 0
out-mx-1       | P 3.16 | 1-Coil 19% | trib C1 19% | coll 2% | dead 0 | GU@trib 8.6 | realm end 1.29 | GU end 26.5 | acc/rev/vic 91%/9%/0% | gaveUp 0
out-mx-2       | P 1.86 | 1-Coil 48% | trib C1 48% | coll 50% | dead 0 | GU@trib 8.8 | realm end 2.00 | GU end 22.6 | acc/rev/vic 91%/9%/0% | gaveUp 0
out-mx-3       | P 1.86 | 1-Coil 48% | trib C1 48% | coll 50% | dead 0 | GU@trib 8.8 | realm end 3.00 | GU end 22.6 | acc/rev/vic 90%/10%/0% | gaveUp 0
== completionist
s0             | P 1.17 | 1-Coil 83% | trib C1 86% | coll 83% | dead 3 | GU@trib 10.2 | realm end 2.00 | GU end 22.9 | acc/rev/vic 33%/35%/32% | gaveUp 0
out-mx-1       | P 1.07 | 1-Coil 93% | trib C1 93% | coll 90% | dead 0 | GU@trib 10.0 | realm end 2.95 | GU end 22.1 | acc/rev/vic 30%/37%/33% | gaveUp 0
out-mx-2       | P 1.06 | 1-Coil 94% | trib C1 94% | coll 92% | dead 0 | GU@trib 10.0 | realm end 3.00 | GU end 22.1 | acc/rev/vic 33%/29%/38% | gaveUp 0
out-mx-3       | P 1.07 | 1-Coil 93% | trib C1 93% | coll 90% | dead 0 | GU@trib 10.0 | realm end 4.00 | GU end 22.6 | acc/rev/vic 28%/34%/38% | gaveUp 0
p2b-ro         | P 1.03 | 1-Coil 97% | trib C1 100% | coll 100% | dead 3 | GU@trib 12.6 | realm end 2.00 | GU end 27.4 | acc/rev/vic 23%/45%/32% | gaveUp 0
p2b-rm         | P 1.00 | 1-Coil 100% | trib C1 100% | coll 100% | dead 0 | GU@trib 10.1 | realm end 2.97 | GU end 26.3 | acc/rev/vic 35%/38%/27% | gaveUp 0
p2b-mx         | P 1.00 | 1-Coil 100% | trib C1 100% | coll 100% | dead 0 | GU@trib 12.2 | realm end 3.00 | GU end 27.2 | acc/rev/vic 38%/21%/41% | gaveUp 0
p2b-lf         | P 1.00 | 1-Coil 100% | trib C1 64% | coll 100% | dead 0 | GU@trib 16.0 | realm end 2.97 | GU end 29.3 | acc/rev/vic 37%/37%/26% | gaveUp 0
== cultivator
s0             | P 1.01 | 1-Coil 99% | trib C1 69% | coll 100% | dead 1 | GU@trib 14.2 | realm end 5.00 | GU end 30.2 | acc/rev/vic 27%/40%/33% | gaveUp 0
out-mx-1       | P 1.00 | 1-Coil 100% | trib C1 67% | coll 100% | dead 0 | GU@trib 15.1 | realm end 5.00 | GU end 31.6 | acc/rev/vic 24%/40%/36% | gaveUp 0
out-mx-2       | P 1.00 | 1-Coil 100% | trib C1 68% | coll 100% | dead 0 | GU@trib 15.9 | realm end 5.00 | GU end 31.2 | acc/rev/vic 29%/33%/38% | gaveUp 0
out-mx-3       | P 1.00 | 1-Coil 100% | trib C1 66% | coll 100% | dead 0 | GU@trib 16.6 | realm end 6.00 | GU end 31.3 | acc/rev/vic 32%/29%/39% | gaveUp 0
p2b-ro         | P 1.04 | 1-Coil 96% | trib C1 64% | coll 100% | dead 4 | GU@trib 16.6 | realm end 5.00 | GU end 38.5 | acc/rev/vic 30%/31%/39% | gaveUp 0
p2b-rm         | P 1.00 | 1-Coil 100% | trib C1 66% | coll 100% | dead 0 | GU@trib 16.1 | realm end 5.02 | GU end 38.0 | acc/rev/vic 32%/38%/30% | gaveUp 0
p2b-mx         | P 1.00 | 1-Coil 100% | trib C1 68% | coll 100% | dead 0 | GU@trib 17.1 | realm end 5.03 | GU end 39.0 | acc/rev/vic 38%/30%/32% | gaveUp 0
p2b-lf         | P 1.00 | 1-Coil 100% | trib C1 67% | coll 100% | dead 0 | GU@trib 18.7 | realm end 5.28 | GU end 42.8 | acc/rev/vic 18%/13%/69% | gaveUp 0
```
