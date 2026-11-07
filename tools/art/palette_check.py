"""v0.11.24: every picture in art/pic keeps to the game's palette: black, white and greys, red as the one accent,
gold only in Yuki's pictures (her eyes). Strict. Usage: python3 -I tools/art/palette_check.py [--list]."""
import sys, pathlib
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
GOLD_OK = {'yuki_human', 'yuki_cat', 'yuki_tiger'}
fails, rows = [], []
files = sorted((ROOT / 'art/pic').glob('*.webp'))
if not files: fails.append('art/pic has no pictures')
for f in files:
    a = np.asarray(Image.open(f).convert('RGB')).astype(float) / 255
    mx, mn = a.max(-1), a.min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = np.maximum(mx - mn, 1e-6)
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    coloured = (sat > 0.25) & (mx > 0.25)
    red = coloured & ((h < 25) | (h > 335))
    gold = coloured & (h >= 25) & (h <= 70)
    other = coloured & ~red & ~gold
    n = a.shape[0] * a.shape[1]
    pr, pg, po = 100 * red.sum() / n, 100 * gold.sum() / n, 100 * other.sum() / n
    rows.append(f'  {f.name}: red {pr:.2f}%, gold {pg:.2f}%, other colour {po:.3f}%')
    if po > 0.2: fails.append(f'{f.name}: {po:.3f}% of the picture is a colour outside the palette (at most 0.2%)')
    if pr > 25: fails.append(f'{f.name}: {pr:.1f}% red (red is the one accent: at most 25%)')
    if f.stem not in GOLD_OK and pg > 0.2: fails.append(f'{f.name}: {pg:.2f}% gold (only Yuki\'s pictures may have gold)')
if '--list' in sys.argv or fails: print('\n'.join(rows))
for x in fails: print('  FAIL', x)
print(f'{len(files)} pictures checked, {len(fails)} failed')
sys.exit(1 if fails else 0)
